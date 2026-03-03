// ════════════════════════════════════════════════════════════
// Salik Dashboard – Personal Spiritual Journey
// ════════════════════════════════════════════════════════════
'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { PerformanceChart } from '@/components/shared/PerformanceChart';
import { PerformanceRing } from '@/components/shared/PerformanceRing';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { calculateStreak, calculate40DayAverage } from '@/lib/services/performance';
import { Target, Flame, TrendingUp, Calendar, BookOpen, MessageSquare, ArrowRight, Moon, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SalikDashboard() {
    const { profile } = useAuth();
    const [todayCompletion, setTodayCompletion] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [fortyDayAvg, setFortyDayAvg] = useState(0);
    const [totalReports, setTotalReports] = useState(0);
    const [trendData, setTrendData] = useState<{ date: string; percentage: number }[]>([]);
    const [submittedToday, setSubmittedToday] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (!profile) return;

        const fetchData = async () => {
            const today = new Date().toISOString().split('T')[0];

            const { data: todayReport } = await supabase
                .from('daily_reports')
                .select('completion_percentage')
                .eq('salik_id', profile.id)
                .eq('report_date', today)
                .single();

            if (todayReport) {
                setTodayCompletion(Number(todayReport.completion_percentage));
                setSubmittedToday(true);
            }

            const { data: allReports } = await supabase
                .from('daily_reports')
                .select('completion_percentage, report_date')
                .eq('salik_id', profile.id)
                .order('report_date', { ascending: true });

            if (allReports && allReports.length > 0) {
                setTotalReports(allReports.length);
                const dates = allReports.map((r) => r.report_date);
                setCurrentStreak(calculateStreak(dates));
                const percentages = allReports.map((r) => Number(r.completion_percentage));
                setFortyDayAvg(calculate40DayAverage(percentages));
            }

            const days: { date: string; percentage: number }[] = [];
            for (let i = 13; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];

                const { data: dayReport } = await supabase
                    .from('daily_reports')
                    .select('completion_percentage')
                    .eq('salik_id', profile.id)
                    .eq('report_date', dateStr)
                    .single();

                days.push({
                    date: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    percentage: dayReport ? Number(dayReport.completion_percentage) : 0,
                });
            }
            setTrendData(days);
        };

        fetchData();
    }, [profile, supabase]);

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-card/40 backdrop-blur-xl p-6 sm:p-8 border border-white/20 dark:border-white/5 premium-shadow"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Moon size={18} className="text-amber-500 animate-pulse" />
                                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Your Spiritual Journey</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                My Dashboard
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-xl leading-relaxed">
                                &quot;Verily, with hardship comes ease.&quot; — Surah Ash-Sharh (94:6).
                                <br /><span className="text-xs opacity-70 italic">— Continue your journey with Istiqamah (steadfastness).</span>
                            </p>
                        </div>
                        <Link href="/salik/report">
                            <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow rounded-xl mt-4 sm:mt-0">
                                <BookOpen size={16} />
                                {submittedToday ? 'View Today\'s Report' : 'Submit Daily Report'}
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/4 -translate-y-1/4" />
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatsCard
                    title="Today's Amal"
                    value={`${todayCompletion}%`}
                    subtitle={submittedToday ? 'Submitted Alhamdulillah ✓' : 'Awaiting submission'}
                    icon={Target}
                    index={0}
                />
                <StatsCard
                    title="Current Streak"
                    value={`${currentStreak}`}
                    subtitle={currentStreak > 0 ? `${currentStreak} days — MashaAllah!` : 'Start your streak today'}
                    icon={Flame}
                    index={1}
                />
                <StatsCard
                    title="Chilla Average"
                    value={`${fortyDayAvg}%`}
                    subtitle="40-day rolling avg"
                    icon={TrendingUp}
                    index={2}
                />
                <StatsCard
                    title="Total Submissions"
                    value={totalReports}
                    subtitle="All-time reports"
                    icon={Calendar}
                    index={3}
                />
            </div>

            {/* Chart + Ring */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                    <PerformanceChart data={trendData} title="My Amal Trend (14 Days)" />
                </div>
                <Card className="border border-white/20 dark:border-white/5 premium-shadow glass-panel bg-card/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Today&apos;s Progress</CardTitle>
                        <CardDescription className="text-xs">Your daily worship completion</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-4">
                        <PerformanceRing
                            percentage={todayCompletion}
                            size={140}
                            label="Daily Amal"
                            sublabel={submittedToday ? 'JazakAllah Khair!' : 'Submit your report'}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
            >
                <Card className="border border-white/20 dark:border-white/5 premium-shadow glass-panel bg-card/40">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-base font-semibold">Continue Your Journey</CardTitle>
                        <CardDescription className="text-xs">Quick access to key features</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { label: 'Submit Daily Report', href: '/salik/report', icon: BookOpen, desc: 'Record your daily Amal' },
                                { label: 'View My Progress', href: '/salik/progress', icon: TrendingUp, desc: 'Track your Chilla journey' },
                                { label: 'AI Spiritual Guide', href: '/salik/chat', icon: MessageSquare, desc: 'Seek guidance and Nasihah' },
                            ].map((action) => (
                                <Link key={action.href} href={action.href}>
                                    <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/40 dark:hover:bg-black/20 transition-all group cursor-pointer border border-border/40 hover:border-border hover:shadow-md bg-white/20 dark:bg-white/5 backdrop-blur-md">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                                            <action.icon size={22} className="text-primary drop-shadow-sm" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-foreground">{action.label}</p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">{action.desc}</p>
                                        </div>
                                        <ArrowRight size={16} className="text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-transform flex-shrink-0" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
