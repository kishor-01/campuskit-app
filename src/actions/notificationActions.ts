'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';

/**
 * Fetches the latest 20 notifications for the current authenticated user,
 * along with the total unread count.
 */
export async function getUserNotifications() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized', notifications: [], unreadCount: 0 };
    }

    const userId = session.user.id;

    // Fetch latest 20 notifications sorted by createdAt descending
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Get count of all unread notifications for the user
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { notifications, unreadCount };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return { error: 'Failed to fetch notifications', notifications: [], unreadCount: 0 };
  }
}

/**
 * Marks a specific notification as read, ensuring it belongs to the authenticated user.
 */
export async function markAsRead(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const userId = session.user.id;

    await prisma.notification.update({
      where: {
        id,
        userId, // Security: Ensure this notification belongs to the logged-in user
      },
      data: {
        isRead: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { error: 'Failed to mark notification as read' };
  }
}

/**
 * Marks all unread notifications of the authenticated user as read.
 */
export async function markAllAsRead() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const userId = session.user.id;

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { error: 'Failed to mark all notifications as read' };
  }
}
