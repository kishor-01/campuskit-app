// src/app/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Resend } from 'resend';
import { z } from "zod";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

// ====================================================================
// USER REGISTRATION
// ====================================================================

export async function registerUser(prevState: any, formData: FormData) {
  // This version still uses manual validation. We can upgrade it to Zod later.
  try {
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const education = formData.get("education") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password || !name || !username || !education) {
      return { success: false, message: "All fields are required." };
    }
    const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existingUser) {
      return { success: false, message: "User already exists." };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, username, education, email, password: hashedPassword, isAdmin: false },
    });
    return { success: true, message: "Account created successfully!" };
  } catch (error) {
    return { success: false, message: "Something went wrong during signup." };
  }
}

// ====================================================================
// CATEGORY MANAGEMENT
// ====================================================================

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
        await prisma.category.update({ where: { id: categoryId }, data: { name } });
        revalidatePath("/admin");
        return { message: `Category updated to "${name}".` };
      default:
        return { error: "Invalid intent." };
    }
  } catch (error) {
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
    throw new Error("Failed to delete category.");
  }
}

// ====================================================================
// RESOURCE MANAGEMENT
// ====================================================================

const ResourceSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(3, "Name must be at least 3 characters."),
  url: z.string().url("Must be a valid URL."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageUrl: z.string().url("Must be a valid image URL.").optional().or(z.literal('')),
  categoryId: z.string().cuid("A valid category must be selected."),
});

export async function createResource(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Unauthorized." };
  const validatedFields = ResourceSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) return { error: validatedFields.error.flatten().fieldErrors };
  try {
    await prisma.resource.create({ data: { ...validatedFields.data, status: "APPROVED" } });
    revalidatePath("/admin");
    revalidatePath("/resources");
    return { message: `Resource "${validatedFields.data.name}" created.` };
  } catch (error) {
    return { error: "Database error: Failed to create resource." };
  }
}

export async function updateResource(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Unauthorized." };
  const validatedFields = ResourceSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) return { error: validatedFields.error.flatten().fieldErrors };
  const { id, ...resourceData } = validatedFields.data;
  if (!id) return { error: "Resource ID is missing." };
  try {
    await prisma.resource.update({ where: { id }, data: resourceData });
    revalidatePath("/admin");
    revalidatePath("/resources");
    return { message: `Resource "${resourceData.name}" updated.` };
  } catch (error) {
    return { error: "Database error: Failed to update resource." };
  }
}

export async function deleteResource(formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized.");
  const resourceId = formData.get("resourceId") as string;
  if (!resourceId) throw new Error("Resource ID is required.");
  try {
    await prisma.resource.delete({ where: { id: resourceId } });
    revalidatePath("/admin");
    revalidatePath("/resources");
  } catch (error) {
    throw new Error("Failed to delete resource.");
  }
}

// ====================================================================
// OPPORTUNITY MANAGEMENT
// ====================================================================

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
    throw new Error("Failed to delete opportunity.");
  }
}

// ====================================================================
// BLOG ARTICLE MANAGEMENT
// ====================================================================

const generateSlug = (title: string) => {
  return title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

const ArticleSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().min(5, "Title must be at least 5 characters."),
  excerpt: z.string().min(20, "Excerpt must be at least 20 characters."),
  content: z.string().min(100, "Content must be at least 100 characters."),
  imageUrl: z.string().url("Must be a valid image URL.").optional().or(z.literal('')),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export async function createArticle(prevState: any, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || !session?.user?.isAdmin) return { error: "Unauthorized." };
  const validatedFields = ArticleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) return { error: validatedFields.error.flatten().fieldErrors };
  const { title, ...data } = validatedFields.data;
  const slug = generateSlug(title);
  try {
    await prisma.article.create({ data: { title, slug, ...data, authorId: userId } });
    revalidatePath("/admin"); revalidatePath("/blog");
    return { message: `Article "${title}" created.` };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return { error: { title: ["An article with this title already exists."] } };
    }
    return { error: "Database error: Failed to create article." };
  }
}

export async function updateArticle(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Unauthorized." };
  const validatedFields = ArticleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) return { error: validatedFields.error.flatten().fieldErrors };
  const { id, title, ...data } = validatedFields.data;
  if (!id) return { error: "Article ID is missing." };
  const slug = generateSlug(title);
  try {
    await prisma.article.update({ where: { id }, data: { title, slug, ...data } });
    revalidatePath("/admin"); revalidatePath(`/blog/${slug}`);
    return { message: `Article "${title}" updated.` };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return { error: { title: ["An article with this title already exists."] } };
    }
    return { error: "Database error: Failed to update article." };
  }
}

export async function deleteArticle(formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized.");
  const articleId = formData.get("articleId") as string;
  if (!articleId) throw new Error("Article ID is required.");
  try {
    await prisma.article.delete({ where: { id: articleId } });
    revalidatePath("/admin"); revalidatePath("/blog");
  } catch (error) {
    throw new Error("Failed to delete article.");
  }
}

// ====================================================================
// USER-FACING ACTIONS
// ====================================================================

export async function toggleSaveResource(resourceId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "You must be logged in to save resources." };
  try {
    const existingSave = await prisma.savedResource.findUnique({
      where: { userId_resourceId: { userId, resourceId } },
    });
    if (existingSave) {
      await prisma.savedResource.delete({ where: { userId_resourceId: { userId, resourceId } } });
      revalidatePath("/profile"); revalidatePath("/resources");
      return { success: true, saved: false, message: "Resource removed." };
    } else {
      await prisma.savedResource.create({ data: { userId, resourceId } });
      revalidatePath("/profile"); revalidatePath("/resources");
      return { success: true, saved: true, message: "Resource saved!" };
    }
  } catch (error) {
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
          html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message}</p>`
      });
      return { success: true, message: "Your message has been sent!" };
  } catch (error) {
      return { success: false, message: "Failed to send message." };
  }
}
