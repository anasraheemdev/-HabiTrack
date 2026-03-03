// ════════════════════════════════════════════════════════════
// Murabbi Dashboard – Mentor Overview
// ════════════════════════════════════════════════════════════
'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { PerformanceChart } from '@/components/shared/PerformanceChart';
import { PerformanceRing } from '@/components/shared/PerformanceRing';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users, AlertTriangle, TrendingDown, Flame, ArrowRight, AlertCircle, UserPlus, Loader2, BookOpen, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import type { Profile, MurabbiStats } from '@/types';

export default function MurabbiDashboard() {
    const { profile } = useAuth();
    const [stats, setStats] = useState<MurabbiStats>({
        assignedSaliks: 0,
        nonSubmitted: 0,
        lowPerformance: 0,
        brokenStreaks: 0,
    });
    const [saliks, setSaliks] = useState<(Profile & { latest_pct?: number })[]>([]);
    const [trendData, setTrendData] = useState<{ date: string; percentage: number }[]>([]);
    const [avgPerformance, setAvgPerformance] = useState(0);

    // Create Salik dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newSalikName, setNewSalikName] = useState('');
    const [newSalikEmail, setNewSalikEmail] = useState('');
    const [newSalikPassword, setNewSalikPassword] = useState('');
    const [creatingUser, setCreatingUser] = useState(false);

    const supabase = createClient();

    const fetchData = async () => {
        if (!profile) return;

        const { data: mappings } = await supabase
            .from('salik_murabbi_map')
            .select('salik_id, salik:profiles!salik_murabbi_map_salik_id_fkey(*)')
            .eq('murabbi_id', profile.id)
            .eq('is_active', true);

        const salikIds = mappings?.map((m) => m.salik_id) || [];
        const salikProfiles = mappings?.map((m) => m.salik as unknown as Profile) || [];

        const today = new Date().toISOString().split('T')[0];

        let nonSubmitted = 0;
        let lowPerf = 0;
        const enrichedSaliks: (Profile & { latest_pct?: number })[] = [];

        for (const salik of salikProfiles) {
            const { data: todayReport } = await supabase
                .from('daily_reports')
                .select('completion_percentage')
                .eq('salik_id', salik.id)
                .eq('report_date', today)
                .single();

            if (!todayReport) nonSubmitted++;

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const { data: recentReports } = await supabase
                .from('daily_reports')
                .select('completion_percentage')
                .eq('salik_id', salik.id)
                .gte('report_date', sevenDaysAgo.toISOString().split('T')[0]);

            const avg =
                recentReports && recentReports.length > 0
                    ? recentReports.reduce((a, b) => a + Number(b.completion_percentage), 0) / recentReports.length
                    : 0;

            if (avg < 50 && recentReports && recentReports.length > 0) lowPerf++;

            enrichedSaliks.push({ ...salik, latest_pct: Math.round(avg) });
        }

        setSaliks(enrichedSaliks);
        setStats({
            assignedSaliks: salikIds.length,
            nonSubmitted,
            lowPerformance: lowPerf,
            brokenStreaks: 0,
        });

        const days: { date: string; percentage: number }[] = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const { data: dayReports } = await supabase
                .from('daily_reports')
                .select('completion_percentage')
                .in('salik_id', salikIds.length > 0 ? salikIds : ['none'])
                .eq('report_date', dateStr);

            const dayAvg =
                dayReports && dayReports.length > 0
                    ? dayReports.reduce((a, b) => a + Number(b.completion_percentage), 0) / dayReports.length
                    : 0;

            days.push({
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                percentage: Math.round(dayAvg),
            });
        }
        setTrendData(days);

        const activeDays = days.filter((d) => d.percentage > 0);
        setAvgPerformance(
            activeDays.length > 0
                ? Math.round(activeDays.reduce((a, b) => a + b.percentage, 0) / activeDays.length)
                : 0
        );
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    const createSalik = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSalikName || !newSalikEmail || !newSalikPassword) {
            toast.error('All fields are required');
            return;
        }
        if (newSalikPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setCreatingUser(true);
        try {
            const res = await fetch('/api/murabbi/saliks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: newSalikName,
                    email: newSalikEmail,
                    password: newSalikPassword,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create Salik');

            toast.success(`Salik "${newSalikName}" created and assigned — MashaAllah!`);
            setNewSalikName('');
            setNewSalikEmail('');
            setNewSalikPassword('');
            setDialogOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to create Salik');
        } finally {
            setCreatingUser(false);
        }
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-card/40 backdrop-blur-xl p-6 sm:p-8 border border-white/20 dark:border-white/5 premium-shadow"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Heart size={18} className="text-blue-500 animate-pulse" />
                                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Mentor Dashboard</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Murabbi Overview</h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-xl leading-relaxed">
                                &quot;The best among you are those who are best to their families.&quot;
                                <br /><span className="text-xs opacity-70 italic">— Guide your Saliks with Ihsan (excellence).</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-2 sm:mt-0">
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow rounded-xl">
                                        <UserPlus size={16} />
                                        Add Salik
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="glass-panel border-white/20">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-bold">Create Salik Account</DialogTitle>
                                        <DialogDescription>
                                            Create a new Salik account. They will be automatically assigned to you, InshaaAllah.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={createSalik} className="space-y-4 mt-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="salik-name">Full Name</Label>
                                            <Input
                                                id="salik-name"
                                                placeholder="Enter Salik's full name"
                                                value={newSalikName}
                                                onChange={(e) => setNewSalikName(e.target.value)}
                                                required
                                                className="bg-white/5"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="salik-email">Email</Label>
                                            <Input
                                                id="salik-email"
                                                type="email"
                                                placeholder="salik@example.com"
                                                value={newSalikEmail}
                                                onChange={(e) => setNewSalikEmail(e.target.value)}
                                                required
                                                className="bg-white/5"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="salik-password">Password</Label>
                                            <Input
                                                id="salik-password"
                                                type="password"
                                                placeholder="Min 6 characters"
                                                value={newSalikPassword}
                                                onChange={(e) => setNewSalikPassword(e.target.value)}
                                                required
                                                className="bg-white/5"
                                            />
                                        </div>
                                        <Button type="submit" className="w-full rounded-xl" disabled={creatingUser}>
                                            {creatingUser ? (
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                                            ) : (
                                                'Create Account'
                                            )}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>

                            <Link href="/murabbi/templates">
                                <Button variant="outline" className="gap-2 rounded-xl bg-white/5 backdrop-blur-md hover:bg-white/10 border-white/10 shadow-sm">
                                    <BookOpen size={16} />
                                    Templates
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/4 -translate-y-1/4" />
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatsCard title="Assigned Saliks" value={stats.assignedSaliks} subtitle="Under your guidance" icon={Users} index={0} />
                <StatsCard title="Pending Reports" value={stats.nonSubmitted} subtitle="Not submitted today" icon={AlertTriangle} index={1} />
                <StatsCard title="Needs Attention" value={stats.lowPerformance} subtitle="Below 50% — needs your help" icon={TrendingDown} index={2} />
                <StatsCard title="Group Average" value={`${avgPerformance}%`} subtitle="14-day group performance" icon={Flame} index={3} />
            </div>

            {/* Chart + Ring */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                    <PerformanceChart data={trendData} title="Group Amal Trend (14 Days)" />
                </div>
                <Card className="border border-white/20 dark:border-white/5 premium-shadow glass-panel bg-card/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Group Health</CardTitle>
                        <CardDescription className="text-xs">Collective spiritual progress</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-4">
                        <PerformanceRing
                            percentage={avgPerformance}
                            size={140}
                            label="Group Average"
                            sublabel="All assigned Saliks"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Saliks List */}
            <Card className="border border-white/20 dark:border-white/5 premium-shadow glass-panel bg-card/40">
                <CardHeader className="pb-3 border-b border-border/40">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Users size={18} className="text-primary" />
                                My Saliks
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">Seekers under your mentorship</CardDescription>
                        </div>
                        <Link href="/murabbi/saliks">
                            <Badge variant="outline" className="cursor-pointer hover:bg-secondary/50 text-xs backdrop-blur-sm bg-white/5 border-white/10">
                                View Details →
                            </Badge>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    {saliks.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground bg-black/5 dark:bg-white/5 rounded-xl border border-border/40">
                            <AlertCircle size={32} className="mx-auto mb-3 opacity-40 text-primary" />
                            <p className="text-sm font-medium mb-1">No Saliks assigned yet</p>
                            <p className="text-xs text-muted-foreground/70 mb-4">Create a new Salik to begin your mentorship journey InshaaAllah</p>
                            <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)} className="gap-2 rounded-xl shadow-sm">
                                <UserPlus size={14} />
                                Create Your First Salik
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                            {saliks.map((salik, i) => (
                                <motion.div
                                    key={salik.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link href={`/murabbi/saliks?id=${salik.id}`}>
                                        <div className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-white/40 dark:hover:bg-black/20 transition-all group cursor-pointer border border-border/40 hover:border-border hover:shadow-md bg-white/20 dark:bg-white/5 backdrop-blur-md">
                                            <Avatar className="w-10 h-10 sm:w-11 sm:h-11 shadow-sm border border-white/20">
                                                <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-white text-sm font-bold">
                                                    {salik.full_name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate text-foreground">{salik.full_name}</p>
                                                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    7-day avg: <span className="font-medium text-foreground/80">{salik.latest_pct || 0}%</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        (salik.latest_pct || 0) >= 70
                                                            ? 'default'
                                                            : (salik.latest_pct || 0) >= 40
                                                                ? 'secondary'
                                                                : 'destructive'
                                                    }
                                                    className="text-[10px] sm:text-xs shadow-sm"
                                                >
                                                    {salik.latest_pct || 0}%
                                                </Badge>
                                                <ArrowRight
                                                    size={14}
                                                    className="text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all hidden sm:block"
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
