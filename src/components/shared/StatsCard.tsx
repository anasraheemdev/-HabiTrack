// ════════════════════════════════════════════════════════════
// StatsCard – Premium animated statistics display card
// ════════════════════════════════════════════════════════════
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        positive: boolean;
    };
    className?: string;
    index?: number;
}

export function StatsCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    className,
    index = 0,
}: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
        >
            <Card
                className={cn(
                    'relative overflow-hidden border border-white/20 dark:border-white/5 premium-shadow glass-panel bg-card/40 hover:bg-card/60 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl',
                    className
                )}
            >
                <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-semibold text-muted-foreground/80 truncate uppercase tracking-wider">
                                {title}
                            </p>
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{value}</h3>
                                {trend && (
                                    <span
                                        className={cn(
                                            'text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-sm',
                                            trend.positive
                                                ? 'text-emerald-700 bg-emerald-500/10 border border-emerald-500/20'
                                                : 'text-red-700 bg-red-500/10 border border-red-500/20'
                                        )}
                                    >
                                        {trend.positive ? '+' : ''}
                                        {trend.value}%
                                    </span>
                                )}
                            </div>
                            {subtitle && (
                                <p className="text-[10px] sm:text-xs text-muted-foreground/70 truncate italic">{subtitle}</p>
                            )}
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                            <Icon size={22} className="text-primary" />
                        </div>
                    </div>
                </CardContent>
                {/* Decorative accent */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary/60 via-primary/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            </Card>
        </motion.div>
    );
}
