// ════════════════════════════════════════════════════════════
// ActivityFeed – Recent activity list
// ════════════════════════════════════════════════════════════
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import type { ActivityLog } from '@/types';

interface ActivityFeedProps {
    activities: ActivityLog[];
    title?: string;
}

export function ActivityFeed({ activities, title = 'Recent Activity' }: ActivityFeedProps) {
    return (
        <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            No recent activity
                        </p>
                    ) : (
                        activities.map((activity, index) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="flex items-start gap-3"
                            >
                                <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {activity.user?.full_name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm">
                                        <span className="font-medium">
                                            {activity.user?.full_name || 'User'}
                                        </span>{' '}
                                        <span className="text-muted-foreground">
                                            {activity.action}
                                        </span>
                                    </p>
                                    {activity.details && (
                                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                            {activity.details}
                                        </p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                                        {new Date(activity.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
