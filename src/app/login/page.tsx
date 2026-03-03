// ════════════════════════════════════════════════════════════
// Login Page – HabiTrack AI
// ════════════════════════════════════════════════════════════
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { loginSchema } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Loader2, Moon, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validate input
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
            toast.error(result.error.issues[0].message);
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            // Get user role for redirect
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile?.role) {
                    router.push(`/${profile.role}`);
                    router.refresh();
                } else {
                    router.push('/');
                }
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden pattern-bg">
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, oklch(0.55 0.12 145 / 40%), transparent)' }}
                />
                <div
                    className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-15"
                    style={{ background: 'radial-gradient(circle, oklch(0.65 0.08 85 / 40%), transparent)' }}
                />
                {/* Floating decorative icons */}
                <motion.div
                    animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-32 right-1/4 text-primary/20"
                >
                    <Moon size={32} />
                </motion.div>
                <motion.div
                    animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute bottom-40 left-1/4 text-primary/15"
                >
                    <Star size={24} />
                </motion.div>
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute top-1/2 left-16 text-primary/10"
                >
                    <Star size={16} />
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-md mx-4 z-10"
            >
                <Card className="glass-card shadow-xl border-0">
                    <CardHeader className="text-center pb-2">
                        {/* Logo/Brand */}
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
                        >
                            <span className="text-3xl">🕌</span>
                        </motion.div>
                        <CardTitle className="text-2xl font-bold">
                            <span className="gradient-text">HabiTrack AI</span>
                        </CardTitle>
                        <CardDescription className="text-muted-foreground mt-1">
                            Your spiritual journey, guided by wisdom
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-11 bg-background/50"
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 bg-background/50"
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-medium mt-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>
                        <p className="text-center text-sm text-muted-foreground mt-6">
                            Don&apos;t have an account?{' '}
                            <a href="/signup" className="text-primary hover:underline font-medium">
                                Sign Up
                            </a>
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
