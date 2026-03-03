// ════════════════════════════════════════════════════════════
// PerformanceChart – Line Chart for Performance Trends
// ════════════════════════════════════════════════════════════
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';

interface PerformanceChartProps {
    data: { date: string; percentage: number }[];
    title?: string;
    height?: number;
    showArea?: boolean;
}

export function PerformanceChart({
    data,
    title = 'Performance Trend',
    height = 300,
    showArea = true,
}: PerformanceChartProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={height}>
                        {showArea ? (
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4d7c4d" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#4d7c4d" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                    }}
                                    formatter={(value) => [`${value}%`, 'Completion']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="percentage"
                                    stroke="#4d7c4d"
                                    strokeWidth={2}
                                    fill="url(#colorPerf)"
                                />
                            </AreaChart>
                        ) : (
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                    }}
                                    formatter={(value) => [`${value}%`, 'Completion']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="percentage"
                                    stroke="#4d7c4d"
                                    strokeWidth={2}
                                    dot={{ fill: '#4d7c4d', r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </motion.div>
    );
}
