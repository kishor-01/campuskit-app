// src/actions/resourceActions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { sendDiscordNotification } from "@/lib/discordNotifier";
import { redirect } from "next/navigation";
import { ResourceStatus } from "@prisma/client";

/* ---------------------------
   Type Definitions
--------------------------- */
type ResourcePayload = {
  id?: string;
  name?: string;
  url?: string;
  description?: string;
  categoryId?: string;
  imageUrl?: string | null;
  status?: "PENDING" | "APPROVED" | "REJECTED" | string;
};

/* ---------------------------
   Helpers
--------------------------- */
function isFormData(obj: any): obj is FormData {
  return !!obj && typeof obj.get === "function";
}

function formDataToPayload(fd: FormData): ResourcePayload {
  return {
    id: (fd.get("id") as string) || undefined,
    name: (fd.get("name") as string) || undefined,
    url: (fd.get("url") as string) || undefined,
    description: (fd.get("description") as string) || undefined,
    categoryId: (fd.get("categoryId") as string) || undefined,
    imageUrl: (fd.get("imageUrl") as string) || undefined,
    status: (fd.get("status") as string) || undefined,
  };
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized: not signed in");
  if (!session.user.isAdmin) throw new Error("Forbidden: admin only");
  return session;
}

/* ---------------------------
   Public Actions
--------------------------- */

export async function submitResource(formDataOrObj: FormData | ResourcePayload) {
  const payload: ResourcePayload = isFormData(formDataOrObj)
    ? formDataToPayload(formDataOrObj)
    : (formDataOrObj ?? {});

  if (!payload.name || !payload.url || !payload.categoryId) {
    throw new Error("Missing required fields: name, url, categoryId");
  }

  try {
    const name = payload.name.trim();
    const url = payload.url.trim();
    const description = (payload.description || "").trim();
    const categoryId = payload.categoryId.trim();
    const imageUrl = payload.imageUrl ? String(payload.imageUrl).trim() : null;

    await prisma.resource.create({
      data: {
        name,
        url,
        description,
        categoryId,
        imageUrl: imageUrl || null,
        status: "PENDING",
      },
    });

    revalidatePath("/resources");
    revalidatePath("/admin/resources");
  } catch (err: any) {
    console.error("submitResource error:", err);
    throw new Error(err?.message || "Failed to submit resource");
  }

  redirect("/submit-resource/thank-you");
}

export async function updateResourceStatus(id: string, status: ResourceStatus) {
  try {
    await requireAdmin();
    if (!id || !status) {
      return { error: "Resource ID and status are required." };
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: { status },
    });

    // Send Discord notification ONLY when a resource is approved
    if (status === "APPROVED") {
      try {
        await sendDiscordNotification?.(
          process.env.DISCORD_RESOURCES_WEBHOOK_URL,
          {
            title: `🚀 Resource Approved: ${updated.name}`,
            description: updated.description?.slice(0, 200) ?? "",
            url: updated.url,
            color: 3447003,
            author: { name: "A new resource was approved!" },
          }
        );
      } catch (nErr) {
        console.warn("Discord notify failed:", nErr);
      }
      // Also revalidate the public resources page on approval
      revalidatePath("/resources");
    }

    revalidatePath("/admin/resources");

    return {
      message: `Resource "${updated.name}" status set to ${status.toLowerCase()}.`,
    };
  } catch (err: any) {
    console.error("updateResourceStatus error:", err);
    return { error: "Failed to update resource status." };
  }
}

/**
 * NOTE: The old `approveResource` and `rejectResource` functions
 * have been removed as their logic is now handled by `updateResourceStatus`.
 */

export async function updateResource(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
    const payload: ResourcePayload = formDataToPayload(formData);

    if (!payload.id) {
      return { error: "Resource ID is required for an update." };
    }

    const updateData: any = {};
    if (payload.name) updateData.name = payload.name.trim();
    if (payload.url) updateData.url = payload.url.trim();
    if (payload.description !== undefined)
      updateData.description = payload.description;
    if (payload.categoryId) updateData.categoryId = payload.categoryId;
    if (payload.imageUrl !== undefined)
      updateData.imageUrl = payload.imageUrl || null;
    if (payload.status) updateData.status = payload.status;

    const updated = await prisma.resource.update({
      where: { id: payload.id },
      data: updateData,
    });

    revalidatePath("/admin/resources");
    revalidatePath("/resources");

    return { message: `Resource "${updated.name}" updated successfully.` };
  } catch (err: any) {
    console.error("updateResource error:", err);
    return { error: err?.message || "Failed to update resource" };
  }
}

export async function deleteResource(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
    const id = formData.get("id") as string;
    if (!id) return { error: "Resource id required" };

    const deleted = await prisma.resource.delete({ where: { id } });

    revalidatePath("/admin/resources");
    revalidatePath("/resources");

    return { message: `Resource "${deleted.name}" deleted.` };
  } catch (err: any) {
    console.error("deleteResource error:", err);
    return { error: "Failed to delete resource." };
  }
}

export async function createResource(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
    const payload = formDataToPayload(formData);

    if (!payload.name || !payload.url || !payload.categoryId || !payload.status) {
      return { error: "Missing required fields." };
    }

    const created = await prisma.resource.create({
      data: {
        name: payload.name.trim(),
        url: payload.url.trim(),
        description: (payload.description || "").trim(),
        categoryId: payload.categoryId.trim(),
        imageUrl: payload.imageUrl ? String(payload.imageUrl).trim() : null,
        status: payload.status as "PENDING" | "APPROVED" | "REJECTED",
      },
    });

    revalidatePath("/admin/resources");
    revalidatePath("/resources");

    return { message: `Resource "${created.name}" created successfully.` };
  } catch (err: any) {
    console.error("createResource error:", err);
    return { error: "Database error: Failed to create resource." };
  }
}

export async function toggleSaveResource(resourceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to save resources." };
    }
    const userId = session.user.id;

    const existingSave = await prisma.savedResource.findUnique({
      where: {
        userId_resourceId: { userId, resourceId },
      },
    });

    if (existingSave) {
      await prisma.savedResource.delete({
        where: { userId_resourceId: { userId, resourceId } },
      });
      revalidatePath("/my-saved-resources");
      return { message: "Removed from saved." };
    } else {
      await prisma.savedResource.create({
        data: { userId, resourceId },
      });
      revalidatePath("/my-saved-resources");
      return { message: "Resource saved." };
    }
  } catch (err: any) {
    console.error("toggleSaveResource error:", err);
    return { error: "A database error occurred. Please try again." };
  }
}