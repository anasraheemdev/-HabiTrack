// ════════════════════════════════════════════════════════════
// Salik – Daily Report Submission Page
// Dynamically renders tasks from Murabbi's templates
// ════════════════════════════════════════════════════════════
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TASK_CATEGORIES, type TaskTemplate, type TaskCategory } from '@/types';
import { calculateCompletion } from '@/lib/services/performance';
import { BookOpen, CheckCircle2, Circle, Send, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface TaskItem {
    template: TaskTemplate;
    completed: boolean;
    numericValue?: number;
}

export default function DailyReportPage() {
    const { profile } = useAuth();
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (!profile) return;

        const fetchTemplates = async () => {
            const today = new Date().toISOString().split('T')[0];

            // Check if already submitted today
            const { data: existing } = await supabase
                .from('daily_reports')
                .select('id')
                .eq('salik_id', profile.id)
                .eq('report_date', today)
                .single();

            if (existing) {
                setAlreadySubmitted(true);
                setLoading(false);
                return;
            }

            // Get murabbi assignment
            const { data: mapping } = await supabase
                .from('salik_murabbi_map')
                .select('murabbi_id')
                .eq('salik_id', profile.id)
                .eq('is_active', true)
                .single();

            if (!mapping) {
                setLoading(false);
                return;
            }

            // Get task templates
            const { data: templates } = await supabase
                .from('task_templates')
                .select('*')
                .eq('murabbi_id', mapping.murabbi_id)
                .eq('is_active', true)
                .order('category')
                .order('task_name');

            if (templates) {
                setTasks(
                    templates.map((t) => ({
                        template: t as TaskTemplate,
                        completed: false,
                        numericValue: undefined,
                    }))
                );
            }
            setLoading(false);
        };

        fetchTemplates();
    }, [profile, supabase]);

    const toggleTask = (index: number) => {
        setTasks((prev) =>
            prev.map((t, i) =>
                i === index ? { ...t, completed: !t.completed } : t
            )
        );
    };

    const setNumericValue = (index: number, value: number) => {
        setTasks((prev) =>
            prev.map((t, i) =>
                i === index ? { ...t, numericValue: value } : t
            )
        );
    };

    const completedCount = tasks.filter((t) => t.completed).length;
    const completionPercentage = calculateCompletion(completedCount, tasks.length);

    const handleSubmit = async () => {
        if (!profile) return;
        setSubmitting(true);

        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    report_date: new Date().toISOString().split('T')[0],
                    notes,
                    items: tasks.map((t) => ({
                        template_id: t.template.id,
                        is_completed: t.completed,
                        numeric_value: t.numericValue,
                    })),
                }),
            });

            if (!res.ok) throw new Error('Failed to submit');
            toast.success('Daily report submitted! JazakAllah Khair 🌙');
            setAlreadySubmitted(true);
        } catch {
            toast.error('Failed to submit report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Group tasks by category
    const grouped = tasks.reduce((acc, item, index) => {
        const cat = item.template.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push({ ...item, originalIndex: index });
        return acc;
    }, {} as Record<string, (TaskItem & { originalIndex: number })[]>);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (alreadySubmitted) {
        return (
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                >
                    <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Report Submitted!</h2>
                    <p className="text-muted-foreground">
                        You&apos;ve already submitted your report for today. MashaAllah! 🌟
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Come back tomorrow to continue your spiritual journey.
                    </p>
                </motion.div>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <AlertCircle size={40} className="text-muted-foreground mx-auto mb-4 opacity-40" />
                <h2 className="text-xl font-bold mb-2">No Tasks Available</h2>
                <p className="text-muted-foreground">
                    Your Murabbi hasn&apos;t created task templates yet, or you haven&apos;t been assigned a Murabbi.
                    Contact your administrator for assistance.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Daily Report</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </p>
            </div>

            {/* Progress Bar */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Completion</span>
                        <span className="text-sm font-bold text-primary">
                            {completedCount}/{tasks.length} ({completionPercentage}%)
                        </span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                </CardContent>
            </Card>

            {/* Task Groups */}
            <AnimatePresence>
                {Object.entries(grouped).map(([category, items]) => {
                    const catInfo = TASK_CATEGORIES.find((c) => c.value === category);
                    const catCompleted = items.filter((i) => i.completed).length;

                    return (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <span>{catInfo?.icon}</span>
                                            {catInfo?.label || category}
                                        </CardTitle>
                                        <Badge variant="secondary" className="text-xs">
                                            {catCompleted}/{items.length}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    {items.map((item) => (
                                        <div
                                            key={item.template.id}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                                            onClick={() => toggleTask(item.originalIndex)}
                                        >
                                            <button className="flex-shrink-0">
                                                {item.completed ? (
                                                    <CheckCircle2 size={22} className="text-emerald-500" />
                                                ) : (
                                                    <Circle size={22} className="text-muted-foreground/40" />
                                                )}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={`text-sm font-medium ${item.completed ? 'line-through text-muted-foreground' : ''
                                                        }`}
                                                >
                                                    {item.template.task_name}
                                                </p>
                                                {item.template.description && (
                                                    <p className="text-xs text-muted-foreground">{item.template.description}</p>
                                                )}
                                            </div>
                                            {item.template.has_numeric_input && (
                                                <Input
                                                    type="number"
                                                    placeholder={item.template.numeric_label || 'Count'}
                                                    value={item.numericValue ?? ''}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        setNumericValue(
                                                            item.originalIndex,
                                                            Number(e.target.value)
                                                        );
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-24 h-8 text-sm"
                                                />
                                            )}
                                            <Badge variant="outline" className="text-[10px] flex-shrink-0">
                                                ×{item.template.weight}
                                            </Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Notes & Submit */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4 space-y-4">
                    <div>
                        <p className="text-sm font-medium mb-2">Notes (Optional)</p>
                        <Textarea
                            placeholder="Add any reflections or notes about your day..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="bg-secondary/30"
                        />
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full h-12 text-base gap-2"
                    >
                        {submitting ? (
                            <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</>
                        ) : (
                            <><Send size={18} /> Submit Daily Report</>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
