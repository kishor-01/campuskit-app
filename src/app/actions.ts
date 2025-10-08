// src/app/actions.ts

"use server";

import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { auth, signIn } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { Resend } from 'resend';

// ====================================================================
// USER AUTHENTICATION & REGISTRATION
// ====================================================================

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid email or username, or password.";
        default:
          return "Something went wrong. Please try again.";
      }
    }
    // For Next.js redirects to work, this error must be re-thrown
    throw error;
  }
}

export async function registerUser(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const education = formData.get("education") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password || !name || !username || !education) {
      return { success: false, message: "All fields are required." };
    }

    const existingUser = await prisma.user.findFirst({ 
      where: { OR: [{ email }, { username }] } 
    });
    
    if (existingUser) {
      return { success: false, message: "User with that email or username already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({ 
      data: { name, username, education, email, password: hashedPassword, isAdmin: false } 
    });
    
    return { success: true, message: "Account created successfully!" };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Something went wrong during signup." };
  }
}

// ========================== CATEGORY MANAGEMENT ==========================
export async function manageCategory(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Unauthorized." };
  
  const intent = formData.get("intent") as string;
  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;

  try {
    switch (intent) {
      case "create":
        if (!name) return { error: "Category name is required." };
        await prisma.category.create({ data: { name } });
        revalidatePath("/admin");
        return { message: `Category "${name}" created.` };
      
      case "update":
        if (!name) return { error: "Category name is required." };
        if (!categoryId) return { error: "Category ID is required." };
        await prisma.category.update({ 
          where: { id: categoryId }, 
          data: { name } 
        });
        revalidatePath("/admin");
        return { message: `Category updated to "${name}".` };
      
      default:
        return { error: "Invalid intent." };
    }
  } catch (error) {
    console.error("Category management error:", error);
    return { error: "Something went wrong." };
  }
}

export async function deleteCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized.");
  
  const categoryId = formData.get("categoryId") as string;
  if (!categoryId) throw new Error("Category ID is required.");
  
  try {
    await prisma.category.delete({ where: { id: categoryId } });
    revalidatePath("/admin");
  } catch (error) {
    console.error("Delete category error:", error);
    throw new Error("Failed to delete category.");
  }
}

// ========================== RESOURCE MANAGEMENT ==========================
const ResourceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters."),
  url: z.string().url("Enter a valid URL."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageUrl: z.union([z.string().url().optional(), z.literal("")]).optional(),
  categoryId: z.string().min(1, "Category must be selected."),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

export async function createResource(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Unauthorized access." };

  try {
    const entries = Object.fromEntries(formData.entries());
    console.info("🧾 createResource form data:", entries);

    const parsed = ResourceSchema.safeParse(entries);
    if (!parsed.success) {
      console.warn("❌ Resource validation failed:", parsed.error.format());
      return { error: parsed.error.flatten().fieldErrors };
    }

    const { name, url, description, imageUrl, categoryId } = parsed.data;

    const resource = await prisma.resource.create({
      data: {
        name,
        url,
        description,
        imageUrl: imageUrl || null,
        categoryId,
        status: "APPROVED",
      },
    });

    revalidatePath("/admin");
    revalidatePath("/resources");
    return { message: `✅ Resource "${resource.name}" added successfully.` };
  } catch (err) {
    console.error("🔥 createResource failed:", err);
    return { error: "Database error: Failed to create resource." };
  }
}

export async function updateResource(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Unauthorized access." };

  try {
    const entries = Object.fromEntries(formData.entries());
    console.info("🧾 updateResource form data:", entries);

    const parsed = ResourceSchema.safeParse(entries);
    if (!parsed.success) {
      console.warn("❌ Resource validation failed:", parsed.error.format());
      return { error: parsed.error.flatten().fieldErrors };
    }

    const { id, name, url, description, imageUrl, categoryId, status } = parsed.data;

    const updated = await prisma.resource.update({
      where: { id },
      data: {
        name,
        url,
        description,
        imageUrl: imageUrl || null,
        categoryId,
        status: status ?? "APPROVED",
      },
    });

    revalidatePath("/admin");
    revalidatePath("/resources");
    return { message: `✅ Resource "${updated.name}" updated successfully.` };
  } catch (err) {
    console.error("🔥 updateResource failed:", err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return { error: "Resource not found." };
    }
    return { error: "Failed to update resource." };
  }
}

export async function deleteResource(formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Unauthorized access." };

  try {
    const id = formData.get("id") as string;
    if (!id) return { error: "Resource ID is required." };

    const deleted = await prisma.resource.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/resources");
    return { message: `🗑️ Resource "${deleted.name}" deleted successfully.` };
  } catch (err) {
    console.error("🔥 deleteResource failed:", err);
    return { error: "Failed to delete resource." };
  }
}

// ========================== OPPORTUNITY MANAGEMENT ==========================
const OpportunitySchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().min(5, "Title must be at least 5 characters."),
  organization: z.string().min(2, "Organization name is required."),
  applyUrl: z.string().url("Must be a valid URL."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageUrl: z.string().url("Must be a valid image URL.").optional().or(z.literal('')),
  location: z.string().min(2, "Location is required."),
  type: z.enum(["INTERNSHIP", "FULL_TIME", "HACKATHON", "WORKSHOP", "SEMINAR", "SCHOLARSHIP", "COMPETITION", "DEAL"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function createOpportunity(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Unauthorized." };
  
  const validatedFields = OpportunitySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) return { error: validatedFields.error.flatten().fieldErrors };
  
  const { startDate, endDate, ...data } = validatedFields.data;
  
  try {
    await prisma.opportunity.create({
      data: {
        ...data,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: 'APPROVED',
      },
    });
    
    revalidatePath("/admin");
    revalidatePath("/opportunities");
    return { message: `Opportunity "${data.title}" created.` };
  } catch (error) {
    console.error("Create opportunity error:", error);
    return { error: "Database error: Failed to create opportunity." };
  }
}

export async function updateOpportunity(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Unauthorized." };
  
  const validatedFields = OpportunitySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) return { error: validatedFields.error.flatten().fieldErrors };
  
  const { id, startDate, endDate, ...data } = validatedFields.data;
  if (!id) return { error: "Opportunity ID is missing." };
  
  try {
    await prisma.opportunity.update({
      where: { id },
      data: {
        ...data,
        startDate: startDate && startDate !== '' ? new Date(startDate) : null,
        endDate: endDate && endDate !== '' ? new Date(endDate) : null,
      },
    });
    
    revalidatePath("/admin");
    revalidatePath("/opportunities");
    return { message: `Opportunity "${data.title}" updated.` };
  } catch (error) {
    console.error("Update opportunity error:", error);
    return { error: "Database error: Failed to update opportunity." };
  }
}

export async function deleteOpportunity(formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized.");
  
  const opportunityId = formData.get("opportunityId") as string;
  if (!opportunityId) throw new Error("Opportunity ID is required.");
  
  try {
    await prisma.opportunity.delete({ where: { id: opportunityId } });
    revalidatePath("/admin");
    revalidatePath("/opportunities");
  } catch (error) {
    console.error("Delete opportunity error:", error);
    throw new Error("Failed to delete opportunity.");
  }
}

// ========================== BLOG ARTICLE MANAGEMENT ==========================
const ArticleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters."),
  excerpt: z.string().min(20, "Excerpt must be at least 20 characters."),
  content: z.string().min(100, "Content must be at least 100 characters."),
  imageUrl: z.union([z.string().url().optional(), z.literal("")]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createArticle(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Unauthorized access." };

  try {
    const entries = Object.fromEntries(formData.entries());
    console.info("🧾 createArticle form data:", entries);

    const parsed = ArticleSchema.safeParse(entries);
    if (!parsed.success) {
      console.warn("❌ Article validation failed:", parsed.error.format());
      return { error: parsed.error.flatten().fieldErrors };
    }

    const { title, excerpt, content, imageUrl, status } = parsed.data;
    const slug = generateSlug(title);

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        imageUrl: imageUrl || null,
        status,
        authorId: session.user.id,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/blog");
    return { message: `📝 Article "${article.title}" created successfully.` };
  } catch (err) {
    console.error("🔥 createArticle failed:", err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: { title: ["An article with this title already exists."] } };
    }
    return { error: "Failed to create article." };
  }
}

export async function updateArticle(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Unauthorized access." };

  try {
    const entries = Object.fromEntries(formData.entries());
    console.info("🧾 updateArticle form data:", entries);

    const parsed = ArticleSchema.safeParse(entries);
    if (!parsed.success) {
      console.warn("❌ Article validation failed:", parsed.error.format());
      return { error: parsed.error.flatten().fieldErrors };
    }

    const { id, title, excerpt, content, imageUrl, status } = parsed.data;
    const slug = generateSlug(title);

    const updated = await prisma.article.update({
      where: { id },
      data: { 
        title, 
        excerpt, 
        content, 
        imageUrl: imageUrl || null, 
        status, 
        slug 
      },
    });

    revalidatePath("/admin");
    revalidatePath("/blog");
    return { message: `✏️ Article "${updated.title}" updated successfully.` };
  } catch (err) {
    console.error("🔥 updateArticle failed:", err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return { error: "Article not found." };
    }
    return { error: "Failed to update article." };
  }
}

export async function deleteArticle(formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Unauthorized access." };

  try {
    const id = formData.get("id") as string;
    if (!id) return { error: "Article ID is required." };

    const deleted = await prisma.article.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/blog");
    return { message: `🗑️ Article "${deleted.title}" deleted successfully.` };
  } catch (err) {
    console.error("🔥 deleteArticle failed:", err);
    return { error: "Failed to delete article." };
  }
}

// ========================== USER-FACING ACTIONS ==========================
export async function toggleSaveResource(resourceId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) return { error: "You must be logged in to save resources." };
  
  try {
    const existingSave = await prisma.savedResource.findUnique({
      where: { userId_resourceId: { userId, resourceId } },
    });
    
    if (existingSave) {
      await prisma.savedResource.delete({ 
        where: { userId_resourceId: { userId, resourceId } } 
      });
      revalidatePath("/profile");
      revalidatePath("/resources");
      return { success: true, saved: false, message: "Resource removed." };
    } else {
      await prisma.savedResource.create({ data: { userId, resourceId } });
      revalidatePath("/profile");
      revalidatePath("/resources");
      return { success: true, saved: true, message: "Resource saved!" };
    }
  } catch (error) {
    console.error("Toggle save resource error:", error);
    return { error: "Something went wrong." };
  }
}

export async function sendContactMessage(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;
  
  if (!name || !email || !message) {
    return { success: false, message: "All fields are required." };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: 'kishorkumarmarkad@gmail.com',
      subject: `New Message from ${name} on CampusKit`,
      reply_to: email,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });
    
    return { success: true, message: "Your message has been sent!" };
  } catch (error) {
    console.error("Send contact message error:", error);
    return { success: false, message: "Failed to send message." };
  }
}