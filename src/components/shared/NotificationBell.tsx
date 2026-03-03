// ════════════════════════════════════════════════════════════
// NotificationBell – Bell icon with unread count
// ════════════════════════════════════════════════════════════
'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import type { Notification } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        const fetchNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id)
                .eq('is_read', false)
                .order('created_at', { ascending: false })
                .limit(10);

            if (data) setNotifications(data);
            if (count !== null) setUnreadCount(count);
        };

        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [supabase]);

    const markAsRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const markAllRead = async () => {
        const ids = notifications.map((n) => n.id);
        if (ids.length === 0) return;

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', ids);

        setNotifications([]);
        setUnreadCount(0);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'reminder':
                return '⏰';
            case 'alert':
                return '⚠️';
            case 'motivational':
                return '✨';
            default:
                return '📌';
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell size={20} className="text-muted-foreground" />
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-0.5 -right-0.5"
                            >
                                <Badge
                                    variant="destructive"
                                    className="h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold"
                                >
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </Badge>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="text-xs text-primary hover:underline font-normal"
                        >
                            Mark all read
                        </button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        <Bell size={24} className="mx-auto mb-2 opacity-30" />
                        No new notifications
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <DropdownMenuItem
                            key={notif.id}
                            className="flex items-start gap-3 py-3 cursor-pointer"
                            onClick={() => markAsRead(notif.id)}
                        >
                            <span className="text-lg mt-0.5 flex-shrink-0">
                                {getNotificationIcon(notif.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-tight">
                                    {notif.title}
                                </p>
                                <p
                                    className={cn(
                                        'text-xs mt-0.5 leading-snug',
                                        'text-muted-foreground'
                                    )}
                                >
                                    {notif.message}
                                </p>
                                <p className="text-[10px] text-muted-foreground/60 mt-1">
                                    {new Date(notif.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
