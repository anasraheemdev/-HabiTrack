// ════════════════════════════════════════════════════════════
// Murabbi – Performance Analytics
// ════════════════════════════════════════════════════════════
'use client';

import { PerformanceChart } from '@/components/shared/PerformanceChart';
import { PerformanceRing } from '@/components/shared/PerformanceRing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MurabbiPerformancePage() {
    // Placeholder data
    const demoData = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        return {
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            percentage: Math.floor(Math.random() * 40) + 50,
        };
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Performance Analytics</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Detailed performance insights for your assigned Saliks
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <PerformanceChart data={demoData} title="Group Trend (14 Days)" />
                </div>
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6 py-6">
                        <PerformanceRing percentage={72} size={120} label="This Week" />
                        <PerformanceRing percentage={65} size={100} label="Last Week" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
