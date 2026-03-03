// ════════════════════════════════════════════════════════════
// PerformanceRing – Circular progress indicator
// ════════════════════════════════════════════════════════════
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PerformanceRingProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    sublabel?: string;
    className?: string;
}

export function PerformanceRing({
    percentage,
    size = 120,
    strokeWidth = 10,
    label,
    sublabel,
    className,
}: PerformanceRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const getColor = (pct: number) => {
        if (pct >= 80) return 'text-emerald-500';
        if (pct >= 60) return 'text-amber-500';
        return 'text-red-500';
    };

    const getStrokeColor = (pct: number) => {
        if (pct >= 80) return '#10b981';
        if (pct >= 60) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className={cn('flex flex-col items-center gap-2', className)}>
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="transform -rotate-90"
                >
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-muted/50"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={getStrokeColor(percentage)}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        strokeLinecap="round"
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className={cn('text-2xl font-bold', getColor(percentage))}
                    >
                        {Math.round(percentage)}%
                    </motion.span>
                </div>
            </div>
            {label && (
                <p className="text-sm font-medium text-foreground">{label}</p>
            )}
            {sublabel && (
                <p className="text-xs text-muted-foreground">{sublabel}</p>
            )}
        </div>
    );
}
