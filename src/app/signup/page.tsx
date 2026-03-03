// ════════════════════════════════════════════════════════════
// TEMPORARY: Signup Page (remove after initial setup)
// ════════════════════════════════════════════════════════════
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { Loader2, UserPlus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) {
            toast.error('Please select a role');
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // Call our server-side API route (uses admin client, bypasses trigger)
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: fullName,
                    email,
                    password,
                    role,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            toast.success(`Account created as ${role}! Signing you in...`);

            // Now sign in with the created credentials
            const supabase = createClient();
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                toast.error('Account created but auto-login failed. Please go to login page.');
                setTimeout(() => router.push('/login'), 2000);
                return;
            }

            // Redirect to role dashboard
            setTimeout(() => {
                router.push(`/${role}`);
                router.refresh();
            }, 1000);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border-0 shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                            <UserPlus className="text-white" size={26} />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                                Create Account
                            </span>
                        </CardTitle>
                        <CardDescription>
                            ⚠️ Temporary signup — remove after initial setup
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Min 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">
                                            🛡️ Admin — System administrator
                                        </SelectItem>
                                        <SelectItem value="murabbi">
                                            📖 Murabbi — Spiritual mentor
                                        </SelectItem>
                                        <SelectItem value="salik">
                                            🌙 Salik — Student
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full h-11" disabled={loading}>
                                {loading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
                                ) : (
                                    'Sign Up'
                                )}
                            </Button>
                        </form>
                        <div className="mt-4 text-center">
                            <Link
                                href="/login"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                            >
                                <ArrowLeft size={14} /> Already have an account? Login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
