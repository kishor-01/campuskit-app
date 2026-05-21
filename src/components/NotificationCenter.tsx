'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawer } from 'vaul';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell as BellIcon, 
  BellOff, 
  Info, 
  Users, 
  Trophy, 
  Check, 
  Loader2, 
  X 
} from 'lucide-react';
import { getUserNotifications, markAsRead, markAllAsRead } from '@/actions/notificationActions';

// Type definitions
interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'SYSTEM' | 'COMMUNITY' | 'ACHIEVEMENT';
  isRead: boolean;
  actionUrl: string | null;
  createdAt: Date | string;
}

// Map NotificationType to matching Lucide Icons
const getIcon = (type: 'SYSTEM' | 'COMMUNITY' | 'ACHIEVEMENT') => {
  switch (type) {
    case 'SYSTEM':
      return Info;
    case 'COMMUNITY':
      return Users;
    case 'ACHIEVEMENT':
      return Trophy;
    default:
      return Info;
  }
};

// Premium, modern HSL-tailored icon colors based on type
const getIconColor = (type: 'SYSTEM' | 'COMMUNITY' | 'ACHIEVEMENT') => {
  switch (type) {
    case 'SYSTEM':
      return 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20';
    case 'COMMUNITY':
      return 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20';
    case 'ACHIEVEMENT':
      return 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20';
    default:
      return 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20';
  }
};

// Ultra-short premium relative time formatter (e.g. "2m ago", "1h ago", "2d ago")
const formatRelativeTime = (date: Date | string) => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const str = formatDistanceToNow(d, { addSuffix: true });
    return str
      .replace('about ', '')
      .replace('less than a minute ago', 'just now')
      .replace('minute ago', '1m ago')
      .replace('minutes ago', 'm ago')
      .replace('hour ago', '1h ago')
      .replace('hours ago', 'h ago')
      .replace('day ago', '1d ago')
      .replace('days ago', 'd ago')
      .replace('months ago', 'mo ago')
      .replace('month ago', '1mo ago')
      .replace('years ago', 'y ago')
      .replace('year ago', '1y ago')
      .replace(' m ago', 'm ago')
      .replace(' h ago', 'h ago')
      .replace(' d ago', 'd ago');
  } catch (err) {
    return 'just now';
  }
};

export default function NotificationCenter() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Dialog and drawer state
  const [isOpen, setIsOpen] = useState(false); // Popover (desktop)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Drawer (mobile)
  const [mounted, setMounted] = useState(false);

  // Notifications states
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch notifications on mount & when auth state becomes active
  const loadNotifications = async () => {
    if (status !== 'authenticated') return;
    try {
      setIsLoading(true);
      const res = await getUserNotifications();
      if (!res.error && res.notifications) {
        // cast to expected type
        setNotifications(res.notifications as unknown as NotificationItem[]);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      loadNotifications();
    }
  }, [status]);

  // Handle clicking outside to close popover
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node | null;
      if (!isOpen) return;
      if (popoverRef.current && popoverRef.current.contains(target)) return;
      if (buttonRef.current && buttonRef.current.contains(target)) return;
      setIsOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!mounted || status !== 'authenticated' || !session?.user) {
    return null;
  }

  // Handle optimistic notification mark-as-read and routing
  const handleNotificationClick = async (id: string, actionUrl: string | null) => {
    // 1. Optimistic updates
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Close menus
    setIsOpen(false);
    setIsDrawerOpen(false);

    // 2. Database update in the background
    try {
      await markAsRead(id);
    } catch (err) {
      console.error('Background markAsRead error:', err);
    }

    // 3. Navigation if actionUrl exists
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  // Handle marking all as read optimistically
  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Bell icon overlay pulsing dot
  const renderPulsingDot = () => {
    if (unreadCount === 0) return null;
    return (
      <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
      </span>
    );
  };

  // Render list of notifications
  const renderNotificationsList = (onClose?: () => void) => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
          <p className="text-xs text-muted-foreground font-medium">Loading notifications...</p>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
          <div className="p-3 bg-muted/40 rounded-full mb-3">
            <BellOff className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <p className="text-sm font-semibold text-foreground">You're all caught up</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
            We will let you know when there's an update.
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-border/40 overflow-y-auto max-h-[350px] sm:max-h-[400px]">
        {notifications.map((item) => {
          const isUnread = !item.isRead;
          const Icon = getIcon(item.type);
          const iconBgColor = getIconColor(item.type);

          return (
            <button
              key={item.id}
              onClick={() => handleNotificationClick(item.id, item.actionUrl)}
              className={`w-full flex items-start gap-3.5 p-4 text-left transition-all duration-300 relative focus:outline-none hover:bg-muted/40 active:bg-muted/60 ${
                isUnread 
                  ? 'bg-primary/5 hover:bg-primary/10 border-l-2 border-primary' 
                  : 'bg-transparent'
              }`}
            >
              {/* Left Status Icon */}
              <div className={`p-2.5 rounded-xl shrink-0 ${iconBgColor}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>

              {/* Middle Title and Message */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-sm text-foreground truncate leading-tight ${isUnread ? 'font-bold' : 'font-medium'}`}>
                    {item.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium shrink-0 mt-0.5">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground/90 mt-1 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* 1. Desktop Popover Trigger & Popover Menu (hidden md:block / layout: relative) */}
      <div className="hidden md:block relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center relative ${
            isOpen ? 'bg-muted text-foreground' : ''
          }`}
          aria-label="Notifications"
        >
          <BellIcon className="h-5 w-5" />
          {renderPulsingDot()}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute right-0 mt-2 w-96 origin-top-right bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/10">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    <Check className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              {renderNotificationsList()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Mobile Drawer Trigger & Drawer (block md:hidden) */}
      <div className="block md:hidden">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center relative"
          aria-label="Notifications"
        >
          <BellIcon className="h-5 w-5" />
          {renderPulsingDot()}
        </button>

        <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <Drawer.Portal>
            <Drawer.Overlay 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity" 
              onClick={() => setIsDrawerOpen(false)} 
            />
            <Drawer.Content className="bg-background border-t border-border rounded-t-3xl fixed bottom-0 left-0 right-0 z-50 flex flex-col focus:outline-none max-h-[85vh] pb-6">
              {/* Grab handle */}
              <div className="mx-auto w-12 h-1 rounded-full bg-muted my-4 shrink-0" />

              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Drawer.Title className="text-lg font-bold text-foreground">Notifications</Drawer.Title>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                    aria-label="Close notifications"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="overflow-y-auto px-1 pt-2">
                {renderNotificationsList(() => setIsDrawerOpen(false))}
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </>
  );
}
