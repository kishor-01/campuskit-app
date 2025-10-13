// /src/actions/articleActions.ts
'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { sendDiscordNotification } from '@/lib/discordNotifier'
import { auth } from '@/auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Helper to check for admin session
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error('Forbidden: Admins only');
  }
  return session;
}

// Zod Schema for validation
const ArticleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters."),
  excerpt: z.string().min(20, "Excerpt must be at least 20 characters."),
  content: z.string().min(100, "Content must be at least 100 characters."),
  imageUrl: z.union([z.string().url("Must be a valid URL").optional(), z.literal("")]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

// Slug generation utility
function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function createArticle(prevState: any, formData: FormData) {
  try {
    const session = await requireAdmin();
    const parsed = ArticleSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors };
    }
    const { title, excerpt, content, imageUrl, status } = parsed.data;
    const slug = generateSlug(title);
    const article = await prisma.article.create({
      data: {
        title, slug, excerpt, content, imageUrl: imageUrl || null, status, authorId: session.user.id!,
      },
    });
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { message: `Article "${article.title}" created successfully.` };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: { slug: ["An article with this title/slug already exists."] } };
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
    await prisma.article.update({ where: { id }, data: { ...data, imageUrl: data.imageUrl || null } });
    revalidatePath("/admin/blog");
    revalidatePath(`/blog/${(await prisma.article.findUnique({where: {id}}))?.slug}`);
    return { message: 'Article updated successfully.' };
  } catch (e) {
    return { error: 'Failed to update article.' };
  }
}

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