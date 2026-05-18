// src/actions/moderationActions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error("Forbidden: Admins only");
  }
}

export async function updateReportStatus(reportId: string, status: "PENDING" | "REVIEWED") {
  try {
    await requireAdmin();
    await prisma.contentReport.update({
      where: { id: reportId },
      data: { status },
    });
    revalidatePath("/admin/moderation");
    return { success: true, message: `Report marked as ${status}` };
  } catch (error) {
    console.error("Failed to update report:", error);
    return { success: false, error: "Failed to update report status." };
  }
}

export async function deleteReport(reportId: string) {
  try {
    await requireAdmin();
    await prisma.contentReport.delete({
      where: { id: reportId },
    });
    revalidatePath("/admin/moderation");
    return { success: true, message: "Report deleted." };
  } catch (error) {
    console.error("Failed to delete report:", error);
    return { success: false, error: "Failed to delete report." };
  }
}

export async function updateMessageStatus(messageId: string, status: "UNREAD" | "READ") {
  try {
    await requireAdmin();
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: { status },
    });
    revalidatePath("/admin/inbox");
    return { success: true, message: `Message marked as ${status}` };
  } catch (error) {
    console.error("Failed to update message:", error);
    return { success: false, error: "Failed to update message status." };
  }
}

export async function deleteMessage(messageId: string) {
  try {
    await requireAdmin();
    await prisma.contactMessage.delete({
      where: { id: messageId },
    });
    revalidatePath("/admin/inbox");
    return { success: true, message: "Message deleted." };
  } catch (error) {
    console.error("Failed to delete message:", error);
    return { success: false, error: "Failed to delete message." };
  }
}

export async function submitContentReport(data: { contentType: string, contentId: string, reason: string }) {
  try {
    const session = await auth();
    await prisma.contentReport.create({
      data: {
        contentType: data.contentType,
        contentId: data.contentId,
        reason: data.reason,
        reporterId: session?.user?.id || null,
        status: "PENDING",
      }
    });
    return { success: true, message: "Report submitted successfully. Thank you." };
  } catch (error) {
    console.error("Failed to submit report:", error);
    return { success: false, error: "Failed to submit report." };
  }
}
