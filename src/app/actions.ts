// src/app/actions.ts

"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod"; // For resource validation

// ==========================
// USER REGISTRATION
// ==========================

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

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, message: "User already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        username,
        education,
        email,
        password: hashedPassword,
        isAdmin: false,
      },
    });

    revalidatePath("/login");

    return { success: true, message: "Account created successfully!" };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, message: "Something went wrong during signup." };
  }
}

// ==========================
// CATEGORY MANAGEMENT
// ==========================
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
          data: { name },
        });
        revalidatePath("/admin");
        return { message: `Category updated to "${name}".` };

      default:
        return { error: "Invalid intent." };
    }
  } catch (error) {
    console.error(error);
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
    console.error(error);
    throw new Error("Failed to delete category.");
  }
}

// ==========================
// RESOURCE MANAGEMENT
// ==========================

// ✅ Validation schema
const ResourceSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  url: z.string().url("Must be a valid URL."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageUrl: z.string().optional(),
  categoryId: z.string().cuid("A valid category must be selected."),
});

// ✅ Create new resource
export async function createResource(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Unauthorized." };

  const validatedFields = ResourceSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await prisma.resource.create({
      data: {
        ...validatedFields.data,
        status: "APPROVED", // Auto-approve admin-created resources
      },
    });

    revalidatePath("/admin");
    revalidatePath("/resources");
    return { message: `Resource "${validatedFields.data.name}" created.` };
  } catch (error) {
    console.error(error);
    return { error: "Database error: Failed to create resource." };
  }
}

// ✅ Delete resource
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
    console.error(error);
    throw new Error("Failed to delete resource.");
  }
}

// ==========================
// RESOURCE SAVE / UNSAVE TOGGLE
// ==========================
export async function toggleSaveResource(resourceId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: "You must be logged in to save resources." };
  }

  try {
    const existingSave = await prisma.savedResource.findUnique({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
    });

    if (existingSave) {
      // Unsave the resource
      await prisma.savedResource.delete({
        where: {
          userId_resourceId: {
            userId,
            resourceId,
          },
        },
      });
      revalidatePath("/profile");
      revalidatePath("/resources");
      return { success: true, saved: false, message: "Resource removed." };
    } else {
      // Save the resource
      await prisma.savedResource.create({
        data: {
          userId,
          resourceId,
        },
      });
      revalidatePath("/profile");
      revalidatePath("/resources");
      return { success: true, saved: true, message: "Resource saved!" };
    }
  } catch (error) {
    console.error("Failed to toggle resource save state:", error);
    return { error: "Something went wrong." };
  }
}

// ==========================
// DEAL MANAGEMENT
// ==========================

// ✅ UPDATED: Deal schema now supports updates
const DealSchema = z.object({
  id: z.string().cuid().optional(), // Add ID for updates
  title: z.string().min(5, "Title must be at least 5 characters."),
  company: z.string().min(2, "Company name is required."),
  affiliateUrl: z.string().url("Must be a valid URL."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageUrl: z.string().url("Must be a valid image URL.").optional().or(z.literal("")),
  category: z.string().min(3, "Category is required."),
});

export async function createDeal(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Unauthorized." };

  const validatedFields = DealSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    console.log("Zod Validation Failed:", validatedFields.error.flatten().fieldErrors);
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await prisma.deal.create({
      data: validatedFields.data,
    });

    revalidatePath("/admin");
    // revalidatePath("/perks"); // Uncomment when perks page exists
    return { message: `Deal "${validatedFields.data.title}" created.` };
  } catch (error) {
    return { error: "Database error: Failed to create deal." };
  }
}

export async function deleteDeal(formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized.");

  const dealId = formData.get("dealId") as string;
  if (!dealId) throw new Error("Deal ID is required.");

  try {
    await prisma.deal.delete({ where: { id: dealId } });
    revalidatePath("/admin");
    // revalidatePath("/perks");
  } catch (error) {
    throw new Error("Failed to delete deal.");
  }
}

// ✅ NEW: Update existing deal
export async function updateDeal(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Unauthorized." };

  const validatedFields = DealSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    console.log("Zod Validation Failed:", validatedFields.error.flatten().fieldErrors);
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { id, ...dealData } = validatedFields.data;
  if (!id) return { error: "Deal ID is missing." };

  try {
    await prisma.deal.update({
      where: { id },
      data: dealData,
    });

    revalidatePath("/admin");
    return { message: `Deal "${dealData.title}" updated.` };
  } catch (error) {
    return { error: "Database error: Failed to update deal." };
  }
}
