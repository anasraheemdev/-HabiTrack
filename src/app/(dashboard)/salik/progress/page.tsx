// ════════════════════════════════════════════════════════════
// Salik – My Progress Page
// ════════════════════════════════════════════════════════════
'use client';

import { useEffect, useState } from 'react';
import { PerformanceChart } from '@/components/shared/PerformanceChart';
import { PerformanceRing } from '@/components/shared/PerformanceRing';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { calculateStreak, calculate40DayAverage, calculateLongestStreak } from '@/lib/services/performance';
import { Target, Flame, TrendingUp, Calendar } from 'lucide-react';

export default function SalikProgressPage() {
    const { profile } = useAuth();
    const [trendData, setTrendData] = useState<{ date: string; percentage: number }[]>([]);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [longestStreak, setLongestStreak] = useState(0);
    const [fortyDayAvg, setFortyDayAvg] = useState(0);
    const [totalReports, setTotalReports] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        if (!profile) return;

        const fetchProgress = async () => {
            const { data: allReports } = await supabase
                .from('daily_reports')
                .select('completion_percentage, report_date')
                .eq('salik_id', profile.id)
                .order('report_date', { ascending: true });

            if (allReports && allReports.length > 0) {
                setTotalReports(allReports.length);
                const dates = allReports.map((r) => r.report_date);
                const percentages = allReports.map((r) => Number(r.completion_percentage));

                setCurrentStreak(calculateStreak(dates));
                setLongestStreak(calculateLongestStreak(dates));
                setFortyDayAvg(calculate40DayAverage(percentages));
            }

            // 40-day trend
            const days: { date: string; percentage: number }[] = [];
            for (let i = 39; i >= 0; i--) {
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
                    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    percentage: dayReport ? Number(dayReport.completion_percentage) : 0,
                });
            }
            setTrendData(days);
        };

        fetchProgress();
    }, [profile, supabase]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Progress</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Track your 40-day spiritual journey
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Current Streak" value={`${currentStreak} days`} icon={Flame} index={0} />
                <StatsCard title="Longest Streak" value={`${longestStreak} days`} icon={Target} index={1} />
                <StatsCard title="40-Day Average" value={`${fortyDayAvg}%`} icon={TrendingUp} index={2} />
                <StatsCard title="Total Reports" value={totalReports} icon={Calendar} index={3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <PerformanceChart data={trendData} title="40-Day Performance Journey" height={350} />
                </div>
                <div className="space-y-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">40-Day Average</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center py-4">
                            <PerformanceRing
                                percentage={fortyDayAvg}
                                size={130}
                                label="Rolling Avg"
                            />
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-4 text-center">
                            <p className="text-4xl font-bold text-primary">{currentStreak}</p>
                            <p className="text-sm text-muted-foreground mt-1">Day Streak 🔥</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
