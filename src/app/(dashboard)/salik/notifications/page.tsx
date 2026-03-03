// ════════════════════════════════════════════════════════════
// Salik – Notifications Page
// ════════════════════════════════════════════════════════════
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Notification } from '@/types';

export default function SalikNotificationsPage() {
    const { profile } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!profile) return;
        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', profile.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (data) setNotifications(data as Notification[]);
            setLoading(false);
        };
        fetchNotifications();
    }, [profile, supabase]);

    const markRead = async (id: string) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'reminder': return '⏰';
            case 'alert': return '⚠️';
            case 'motivational': return '✨';
            default: return '📌';
        }
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold">Notifications</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Stay updated on your spiritual journey</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : notifications.length === 0 ? (
                <Card className="border-0 shadow-sm">
                    <CardContent className="text-center py-12 text-muted-foreground">
                        <Bell size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No Notifications</p>
                        <p className="text-sm mt-1">You are all caught up!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notif, i) => (
                        <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                        >
                            <Card className={`border-0 shadow-sm transition-colors ${notif.is_read ? 'opacity-60' : ''}`}>
                                <CardContent className="p-4 flex items-start gap-3">
                                    <span className="text-xl mt-0.5">{getIcon(notif.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-sm font-semibold">{notif.title}</p>
                                            {!notif.is_read && (
                                                <Badge variant="default" className="text-[10px] px-1.5 py-0">New</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{notif.message}</p>
                                        <p className="text-[11px] text-muted-foreground/60 mt-1">
                                            {new Date(notif.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    {!notif.is_read && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => markRead(notif.id)}
                                            className="flex-shrink-0"
                                        >
                                            <Check size={16} />
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
