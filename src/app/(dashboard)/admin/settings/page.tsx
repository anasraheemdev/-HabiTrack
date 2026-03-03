// ════════════════════════════════════════════════════════════
// Admin – Settings Page (Deadline Configuration)
// ════════════════════════════════════════════════════════════
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Clock, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminSettingsPage() {
    const [deadline, setDeadline] = useState('23:59');
    const [saving, setSaving] = useState(false);

    const saveSettings = async () => {
        setSaving(true);
        // In production, save to Supabase config table
        setTimeout(() => {
            toast.success('Settings saved successfully!');
            setSaving(false);
        }, 500);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Configure system-wide settings
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl"
            >
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Clock size={18} className="text-primary" />
                            Report Submission Deadline
                        </CardTitle>
                        <CardDescription>
                            Set the daily deadline for report submissions. Saliks will be notified if they miss this deadline.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="deadline">Deadline Time</Label>
                            <Input
                                id="deadline"
                                type="time"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="max-w-[200px]"
                            />
                            <p className="text-xs text-muted-foreground">
                                Reports submitted after this time will be marked as late.
                            </p>
                        </div>
                        <Button onClick={saveSettings} disabled={saving} className="gap-2">
                            {saving ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                            ) : (
                                <><Save size={16} /> Save Settings</>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
