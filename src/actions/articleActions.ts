// /src/actions/articleActions.ts - FIXED VERSION
'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { sendDiscordNotification } from '@/lib/discordNotifier'
import { auth } from '@/auth'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import DOMPurify from 'isomorphic-dompurify'

// Helper to check for admin session
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error('Forbidden: Admins only');
  }
  return session;
}

// Enhanced Zod Schema - REMOVED CHARACTER LIMIT
const ArticleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters.").max(200, "Title must not exceed 200 characters."),
  excerpt: z.string().min(20, "Excerpt must be at least 20 characters.").max(300, "Excerpt must not exceed 300 characters."),
  // REMOVED CHARACTER LIMIT - only minimum validation
  content: z.string().min(50, "Content must be at least 50 characters."),
  imageUrl: z.union([z.string().url("Must be a valid URL").optional(), z.literal("")]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

// Slug generation utility
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// HTML Sanitization function
function sanitizeHtmlContent(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'img',
      'blockquote',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class',
      'width', 'height', 'style' // Allow style for image alignment
    ],
    ALLOW_DATA_ATTR: false,
  });
}

// Base64 image processing function
async function processBase64Images(html: string): Promise<string> {
  // This is a placeholder for base64 image processing
  // In production, you would:
  // 1. Extract base64 images from HTML
  // 2. Upload to cloud storage (AWS S3, Cloudinary, etc.)
  // 3. Replace base64 strings with CDN URLs
  // 4. Return the updated HTML
  
  // For now, we'll just limit base64 image size and count
  const base64Regex = /src="data:image\/([a-zA-Z]*);base64,([^"]*)"/g;
  const matches = [...html.matchAll(base64Regex)];
  
  if (matches.length > 10) {
    throw new Error('Too many embedded images. Please use external image URLs for better performance.');
  }
  
  // Check individual image sizes (rough estimate)
  matches.forEach((match) => {
    const base64String = match[2];
    // Rough size calculation: base64 string length * 3/4
    const approximateSize = (base64String.length * 3) / 4;
    if (approximateSize > 500000) { // 500KB limit
      throw new Error('One or more images are too large. Please use images under 500KB or use external URLs.');
    }
  });
  
  return html; // Return as-is for now
}

export async function createArticle(prevState: any, formData: FormData) {
  try {
    const session = await requireAdmin();

    const parsed = ArticleSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors };
    }

    const { title, excerpt, content, imageUrl, status } = parsed.data;

    // Process and sanitize content
    let processedContent = content;
    
    // Process base64 images (with size/count validation)
    processedContent = await processBase64Images(processedContent);
    
    // Sanitize HTML to prevent XSS
    processedContent = sanitizeHtmlContent(processedContent);

    const slug = generateSlug(title);

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt,
        content: processedContent,
        imageUrl: imageUrl || null,
        status,
        authorId: session.user.id!,
      },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");

    return { message: `Article "${article.title}" created successfully.` };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: { slug: ["An article with this title/slug already exists."] } };
    }
    
    // Handle our custom errors from image processing
    if (err instanceof Error) {
      return { error: err.message };
    }
    
    return { error: "Failed to create article." };
  }
}

export async function updateArticle(prevState: any, formData: FormData) {
  try {
    await requireAdmin();

    const parsed = ArticleSchema.extend({ id: z.string().min(1) }).safeParse(Object.fromEntries(formData.entries()));

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors };
    }

    const { id, ...data } = parsed.data;

    // Process and sanitize content
    let processedContent = data.content;
    
    // Process base64 images (with size/count validation)
    processedContent = await processBase64Images(processedContent);
    
    // Sanitize HTML to prevent XSS
    processedContent = sanitizeHtmlContent(processedContent);

    await prisma.article.update({ 
      where: { id }, 
      data: { 
        ...data, 
        content: processedContent,
        imageUrl: data.imageUrl || null 
      } 
    });

    revalidatePath("/admin/blog");
    revalidatePath(`/blog/${(await prisma.article.findUnique({ where: { id } }))?.slug}`);

    return { message: 'Article updated successfully.' };
  } catch (e) {
    // Handle our custom errors from image processing
    if (e instanceof Error) {
      return { error: e.message };
    }
    
    return { error: 'Failed to update article.' };
  }
}

// The rest of your existing functions remain the same...
export async function deleteArticle(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
    const id = formData.get('id') as string;
    if (!id) return { error: 'Article ID is required.' };

    await prisma.article.delete({ where: { id } });

    revalidatePath('/admin/blog');
    revalidatePath('/blog');

    return { message: 'Article deleted.' };
  } catch(e) {
    return { error: 'Failed to delete article.' };
  }
}

export async function publishArticle(formData: FormData) {
  await requireAdmin();
  const id = formData.get('id') as string;
  if (!id) {
    throw new Error('Article ID is required.');
  }

  const article = await prisma.article.update({
    where: { id },
    data: { status: 'PUBLISHED' },
  });

  if (article) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    await sendDiscordNotification(process.env.DISCORD_ARTICLES_WEBHOOK_URL, {
      title: `✍️ New Article Published: ${article.title}`,
      description: article.excerpt,
      url: `${siteUrl}/blog/${article.slug}`,
      color: 5763719,
      author: { name: 'A new article is now live!' },
    });
  }

  revalidatePath('/admin/blog');
  revalidatePath(`/blog/${article.slug}`);
}