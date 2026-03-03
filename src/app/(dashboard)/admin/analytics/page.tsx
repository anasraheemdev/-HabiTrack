// ════════════════════════════════════════════════════════════
// Admin – Analytics Page
// ════════════════════════════════════════════════════════════
'use client';

import { useEffect, useState } from 'react';
import { PerformanceChart } from '@/components/shared/PerformanceChart';
import { PerformanceRing } from '@/components/shared/PerformanceRing';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { BarChart3, Users, Target, Flame } from 'lucide-react';

export default function AdminAnalyticsPage() {
    const [trendData, setTrendData] = useState<{ date: string; percentage: number }[]>([]);
    const [overallAvg, setOverallAvg] = useState(0);
    const [categoryStats, setCategoryStats] = useState<{ category: string; avg: number }[]>([]);
    const supabase = createClient();

    useEffect(() => {
        const fetchAnalytics = async () => {
            // 30-day trend
            const days: { date: string; percentage: number }[] = [];
            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const { data: dayReports } = await supabase
                    .from('daily_reports')
                    .select('completion_percentage')
                    .eq('report_date', dateStr);

                const avg =
                    dayReports && dayReports.length > 0
                        ? dayReports.reduce((a, b) => a + Number(b.completion_percentage), 0) / dayReports.length
                        : 0;

                days.push({
                    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    percentage: Math.round(avg),
                });
            }
            setTrendData(days);

            // Overall average
            const totalAvg = days.filter(d => d.percentage > 0);
            setOverallAvg(
                totalAvg.length > 0
                    ? Math.round(totalAvg.reduce((a, b) => a + b.percentage, 0) / totalAvg.length)
                    : 0
            );
        };

        fetchAnalytics();
    }, [supabase]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Analytics</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    System-wide performance analytics and insights
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Overall Average" value={`${overallAvg}%`} icon={BarChart3} index={0} />
                <StatsCard title="Active Days" value={trendData.filter(d => d.percentage > 0).length} icon={Target} index={1} />
                <StatsCard title="Peak Day" value={`${Math.max(...trendData.map(d => d.percentage), 0)}%`} icon={Flame} index={2} />
                <StatsCard title="Data Points" value={trendData.length} icon={Users} index={3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <PerformanceChart data={trendData} title="30-Day Performance Trend" />
                </div>
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Overall Score</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-6">
                        <PerformanceRing
                            percentage={overallAvg}
                            size={160}
                            strokeWidth={12}
                            label="System Average"
                            sublabel="Last 30 days"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
