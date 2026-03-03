// ════════════════════════════════════════════════════════════
// Admin – Manage Murabbis Page
// ════════════════════════════════════════════════════════════
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { signupSchema } from '@/lib/validations';
import { UserPlus, Users, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import type { Profile } from '@/types';

export default function ManageMurabbisPage() {
    const [murabbis, setMurabbis] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ full_name: '', email: '', password: '' });
    const supabase = createClient();

    const fetchMurabbis = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'murabbi')
            .order('created_at', { ascending: false });

        if (data) setMurabbis(data as Profile[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchMurabbis();
    }, []);

    const createMurabbi = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        const result = signupSchema.safeParse({
            ...form,
            role: 'murabbi',
        });

        if (!result.success) {
            toast.error(result.error.issues[0].message);
            setCreating(false);
            return;
        }

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, role: 'murabbi' }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create Murabbi');
            }

            toast.success('Murabbi account created successfully!');
            setForm({ full_name: '', email: '', password: '' });
            setDialogOpen(false);
            fetchMurabbis();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to create account');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Manage Murabbis</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Create and manage mentor accounts
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <UserPlus size={16} />
                            Create Murabbi
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Murabbi Account</DialogTitle>
                            <DialogDescription>
                                Create a new mentor account. They will receive login credentials via email.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={createMurabbi} className="space-y-4 mt-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter full name"
                                    value={form.full_name}
                                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="murabbi@example.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Min 6 characters"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={creating}>
                                {creating ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Users size={18} className="text-primary" />
                            All Murabbis ({murabbis.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : murabbis.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Users size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No Murabbis Yet</p>
                                <p className="text-sm mt-1">Create the first Murabbi account to get started.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Joined</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {murabbis.map((m) => (
                                        <TableRow key={m.id}>
                                            <TableCell className="font-medium">{m.full_name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Mail size={14} />
                                                    {m.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="capitalize">
                                                    {m.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(m.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
