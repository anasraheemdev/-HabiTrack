// ════════════════════════════════════════════════════════════
// Navbar – Floating Premium Glass Header
// ════════════════════════════════════════════════════════════
'use client';

import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export function Navbar() {
    const { profile } = useAuth();

    if (!profile) return null;

    const getIslamicGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Assalamu Alaikum 🌅'; // Morning
        if (hour >= 12 && hour < 17) return 'Assalamu Alaikum ☀️'; // Afternoon
        if (hour >= 17 && hour < 20) return 'Assalamu Alaikum 🌇'; // Evening
        return 'Assalamu Alaikum 🌙'; // Night
    };

    const roleColors: Record<string, string> = {
        admin: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
        murabbi: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
        salik: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    };

    const roleBadgeText: Record<string, string> = {
        admin: 'Administrator',
        murabbi: 'Murabbi Mentor',
        salik: 'Salik Seeker',
    };

    // Formatted current date
    const today = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    }).format(new Date());

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex items-center justify-between pl-14 lg:pl-4 
                       glass-panel premium-shadow rounded-2xl py-3 px-5 sm:px-6 
                       border border-border/40 w-full backdrop-blur-2xl"
        >
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground bg-clip-text">
                        {getIslamicGreeting()}, {profile.full_name.split(' ')[0]}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                            variant="outline"
                            className={`rounded-full px-2.5 py-0 border drop-shadow-sm font-medium text-[10px] uppercase tracking-widest ${roleColors[profile.role]}`}
                        >
                            {roleBadgeText[profile.role]}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-muted-foreground/80 bg-black/5 dark:bg-white/5 py-1.5 px-3.5 rounded-full border border-border/50">
                <Calendar size={14} className="text-primary" />
                <span className="text-xs font-medium tracking-wide">{today}</span>
            </div>
        </motion.header>
    );
}
