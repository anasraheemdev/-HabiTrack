// ════════════════════════════════════════════════════════════
// Murabbi – My Saliks Page (Detailed View)
// ════════════════════════════════════════════════════════════
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PerformanceChart } from '@/components/shared/PerformanceChart';
import { PerformanceRing } from '@/components/shared/PerformanceRing';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users, Loader2, Calendar, Target, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Profile } from '@/types';

export default function MySaliksPage() {
    const { profile } = useAuth();
    const [saliks, setSaliks] = useState<(Profile & { avgPerf: number; streak: number; submissions: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSalik, setSelectedSalik] = useState<string | null>(null);
    const [salikTrend, setSalikTrend] = useState<{ date: string; percentage: number }[]>([]);
    const supabase = createClient();

    useEffect(() => {
        if (!profile) return;

        const fetchSaliks = async () => {
            const { data: mappings } = await supabase
                .from('salik_murabbi_map')
                .select('salik_id, salik:profiles!salik_murabbi_map_salik_id_fkey(*)')
                .eq('murabbi_id', profile.id)
                .eq('is_active', true);

            const enriched: (Profile & { avgPerf: number; streak: number; submissions: number })[] = [];

            for (const mapping of mappings || []) {
                const salik = mapping.salik as unknown as Profile;
                const { data: reports } = await supabase
                    .from('daily_reports')
                    .select('completion_percentage, report_date')
                    .eq('salik_id', salik.id)
                    .order('report_date', { ascending: false })
                    .limit(40);

                const avg = reports && reports.length > 0
                    ? Math.round(reports.reduce((a, b) => a + Number(b.completion_percentage), 0) / reports.length)
                    : 0;

                enriched.push({ ...salik, avgPerf: avg, streak: 0, submissions: reports?.length || 0 });
            }

            setSaliks(enriched);
            if (enriched.length > 0) setSelectedSalik(enriched[0].id);
            setLoading(false);
        };

        fetchSaliks();
    }, [profile, supabase]);

    useEffect(() => {
        if (!selectedSalik) return;

        const fetchTrend = async () => {
            const days: { date: string; percentage: number }[] = [];
            for (let i = 39; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];

                const { data } = await supabase
                    .from('daily_reports')
                    .select('completion_percentage')
                    .eq('salik_id', selectedSalik)
                    .eq('report_date', dateStr)
                    .single();

                days.push({
                    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    percentage: data ? Number(data.completion_percentage) : 0,
                });
            }
            setSalikTrend(days);
        };

        fetchTrend();
    }, [selectedSalik, supabase]);

    const currentSalik = saliks.find((s) => s.id === selectedSalik);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Saliks</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Detailed performance view for each Salik
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : saliks.length === 0 ? (
                <Card className="border-0 shadow-sm">
                    <CardContent className="text-center py-12 text-muted-foreground">
                        <Users size={40} className="mx-auto mb-3 opacity-30" />
                        <p>No Saliks assigned yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Salik list */}
                    <div className="space-y-2">
                        {saliks.map((s, i) => (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <button
                                    onClick={() => setSelectedSalik(s.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${selectedSalik === s.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/50'
                                        }`}
                                >
                                    <Avatar className="w-9 h-9">
                                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                            {s.full_name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{s.full_name}</p>
                                        <p className="text-xs text-muted-foreground">Avg: {s.avgPerf}%</p>
                                    </div>
                                    <Badge variant={s.avgPerf >= 70 ? 'default' : s.avgPerf >= 40 ? 'secondary' : 'destructive'} className="text-xs">
                                        {s.avgPerf}%
                                    </Badge>
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Selected Salik details */}
                    <div className="lg:col-span-3 space-y-6">
                        {currentSalik && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Card className="border-0 shadow-sm">
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Target size={20} className="text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold">{currentSalik.avgPerf}%</p>
                                                <p className="text-xs text-muted-foreground">Average Performance</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-0 shadow-sm">
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Calendar size={20} className="text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold">{currentSalik.submissions}</p>
                                                <p className="text-xs text-muted-foreground">Total Submissions</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-0 shadow-sm">
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Flame size={20} className="text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold">{currentSalik.streak}</p>
                                                <p className="text-xs text-muted-foreground">Current Streak</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <PerformanceChart data={salikTrend} title={`${currentSalik.full_name} – 40-Day Trend`} height={350} />
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
