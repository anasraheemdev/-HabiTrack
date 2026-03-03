// ════════════════════════════════════════════════════════════
// Murabbi – Chilla (40-Day) Summary Page
// ════════════════════════════════════════════════════════════
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sparkles, FileText, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ChillaSummaryPage() {
    const [aiSummary, setAiSummary] = useState('');
    const [murabbiNotes, setMurabbiNotes] = useState('');
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);

    const generateSummary = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/ai/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    salikName: 'Selected Salik',
                    totalSubmissions: 35,
                    averagePerformance: 72,
                    mostMissedTask: 'Tahajjud Prayer',
                    streakRecord: 12,
                    performanceTrend: [60, 65, 70, 72, 75],
                }),
            });

            if (!res.ok) throw new Error();
            const data = await res.json();
            setAiSummary(data.summary);
            toast.success('AI summary generated!');
        } catch {
            toast.error('Failed to generate summary. Check GROQ API key.');
        } finally {
            setGenerating(false);
        }
    };

    const saveSummary = async () => {
        setSaving(true);
        // In production, save to chilla_summaries table
        setTimeout(() => {
            toast.success('Summary saved and finalized!');
            setSaving(false);
        }, 500);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold">Chilla (40-Day) Summary</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Review and finalize 40-day spiritual journey summaries
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <FileText size={18} className="text-primary" />
                                    40-Day Summary
                                </CardTitle>
                                <CardDescription>
                                    Generate an AI summary and add your personal notes before finalizing.
                                </CardDescription>
                            </div>
                            <Badge variant="secondary">Draft</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Stats overview */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: 'Submissions', value: '35/40' },
                                { label: 'Avg Performance', value: '72%' },
                                { label: 'Streak Record', value: '12 days' },
                                { label: 'Most Missed', value: 'Tahajjud' },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center p-3 rounded-lg bg-secondary/50">
                                    <p className="text-lg font-bold">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        <Separator />

                        {/* AI Summary */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <Sparkles size={14} className="text-primary" />
                                    AI-Generated Summary
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={generateSummary}
                                    disabled={generating}
                                    className="gap-1.5"
                                >
                                    {generating ? (
                                        <><Loader2 size={14} className="animate-spin" /> Generating...</>
                                    ) : (
                                        <><Sparkles size={14} /> Generate</>
                                    )}
                                </Button>
                            </div>
                            {aiSummary ? (
                                <div className="p-4 rounded-lg bg-secondary/30 text-sm leading-relaxed whitespace-pre-wrap">
                                    {aiSummary}
                                </div>
                            ) : (
                                <div className="p-8 rounded-lg bg-secondary/30 text-center text-muted-foreground text-sm">
                                    Click &quot;Generate&quot; to create an AI-written summary of the 40-day journey.
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Murabbi Notes */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold">Murabbi Notes</h3>
                            <Textarea
                                placeholder="Add your personal notes, advice, and encouragement for this Salik..."
                                value={murabbiNotes}
                                onChange={(e) => setMurabbiNotes(e.target.value)}
                                rows={5}
                                className="bg-secondary/30"
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={saveSummary} disabled={saving} className="gap-2">
                                {saving ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                                ) : (
                                    <><Save size={16} /> Save & Finalize</>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
