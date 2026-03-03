// ════════════════════════════════════════════════════════════
// Murabbi – Task Templates Management Page
// ════════════════════════════════════════════════════════════
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TASK_CATEGORIES, type TaskTemplate, type TaskCategory } from '@/types';
import { Plus, ClipboardList, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function TaskTemplatesPage() {
    const { profile } = useAuth();
    const [templates, setTemplates] = useState<TaskTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({
        category: '' as TaskCategory | '',
        task_name: '',
        description: '',
        has_numeric_input: false,
        numeric_label: '',
        weight: 1,
    });
    const supabase = createClient();

    const fetchTemplates = async () => {
        if (!profile) return;
        const { data } = await supabase
            .from('task_templates')
            .select('*')
            .eq('murabbi_id', profile.id)
            .eq('is_active', true)
            .order('category')
            .order('created_at');

        if (data) setTemplates(data as TaskTemplate[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchTemplates();
    }, [profile]);

    const createTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || !form.category) return;
        setCreating(true);

        try {
            const res = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, murabbi_id: profile.id }),
            });

            if (!res.ok) throw new Error('Failed to create template');
            toast.success('Task template created!');
            setForm({ category: '', task_name: '', description: '', has_numeric_input: false, numeric_label: '', weight: 1 });
            setDialogOpen(false);
            fetchTemplates();
        } catch {
            toast.error('Failed to create template');
        } finally {
            setCreating(false);
        }
    };

    const deleteTemplate = async (id: string) => {
        try {
            const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            toast.success('Template deleted');
            fetchTemplates();
        } catch {
            toast.error('Failed to delete template');
        }
    };

    // Group templates by category
    const grouped = templates.reduce((acc, t) => {
        if (!acc[t.category]) acc[t.category] = [];
        acc[t.category].push(t);
        return acc;
    }, {} as Record<string, TaskTemplate[]>);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Task Templates</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Define daily tasks for your Saliks
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus size={16} />
                            Add Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Task Template</DialogTitle>
                            <DialogDescription>
                                Define a new task that Saliks will include in their daily reports.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={createTemplate} className="space-y-4 mt-2">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={form.category}
                                    onValueChange={(v) => setForm({ ...form, category: v as TaskCategory })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TASK_CATEGORIES.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>
                                                {c.icon} {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Task Name</Label>
                                <Input
                                    placeholder="e.g., Fajr Salah"
                                    value={form.task_name}
                                    onChange={(e) => setForm({ ...form, task_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description (Optional)</Label>
                                <Textarea
                                    placeholder="Brief description..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="numeric"
                                        checked={form.has_numeric_input}
                                        onChange={(e) => setForm({ ...form, has_numeric_input: e.target.checked })}
                                        className="rounded"
                                    />
                                    <Label htmlFor="numeric" className="text-sm">Has numeric input</Label>
                                </div>
                                {form.has_numeric_input && (
                                    <Input
                                        placeholder="Label (e.g., Count)"
                                        value={form.numeric_label}
                                        onChange={(e) => setForm({ ...form, numeric_label: e.target.value })}
                                        className="max-w-[200px]"
                                    />
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Weight (1-10)</Label>
                                <Input
                                    type="number"
                                    min={0.1}
                                    max={10}
                                    step={0.1}
                                    value={form.weight}
                                    onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                                    className="max-w-[120px]"
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={creating}>
                                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Template'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : Object.keys(grouped).length === 0 ? (
                <Card className="border-0 shadow-sm">
                    <CardContent className="text-center py-12">
                        <ClipboardList size={40} className="mx-auto mb-3 opacity-30 text-muted-foreground" />
                        <p className="font-medium text-muted-foreground">No Templates Yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Create task templates that your Saliks will use for daily reports.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                Object.entries(grouped).map(([category, tasks]) => {
                    const catInfo = TASK_CATEGORIES.find((c) => c.value === category);
                    return (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <span>{catInfo?.icon}</span>
                                        {catInfo?.label || category}
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                            {tasks.length} tasks
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Task</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Weight</TableHead>
                                                <TableHead className="w-[60px]">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {tasks.map((t) => (
                                                <TableRow key={t.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{t.task_name}</p>
                                                            {t.description && (
                                                                <p className="text-xs text-muted-foreground">{t.description}</p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-xs">
                                                            {t.has_numeric_input ? `Numeric (${t.numeric_label || 'Value'})` : 'Checkbox'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">{t.weight}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => deleteTemplate(t.id)}
                                                            className="text-muted-foreground hover:text-destructive"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })
            )}
        </div>
    );
}
