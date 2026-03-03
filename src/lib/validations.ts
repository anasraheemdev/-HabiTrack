// ════════════════════════════════════════════════════════════
// Zod Validation Schemas
// ════════════════════════════════════════════════════════════
import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    role: z.enum(['admin', 'murabbi', 'salik']),
});

export const taskTemplateSchema = z.object({
    category: z.enum([
        'faraiz', 'nawafil', 'tasbeeh', 'tilawat',
        'habit_tracking', 'prohibitions', 'study', 'sleep_tracking',
    ]),
    task_name: z.string().min(1, 'Task name is required').max(100),
    description: z.string().max(500).optional(),
    has_numeric_input: z.boolean().default(false),
    numeric_label: z.string().max(50).optional(),
    weight: z.number().min(0.1).max(10).default(1),
});

export const reportItemSchema = z.object({
    template_id: z.string().uuid(),
    is_completed: z.boolean(),
    numeric_value: z.number().optional(),
});

export const dailyReportSchema = z.object({
    report_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    notes: z.string().max(1000).optional(),
    items: z.array(reportItemSchema).min(1, 'At least one task item is required'),
});

export const aiChatSchema = z.object({
    message: z.string().min(1, 'Message cannot be empty').max(2000),
});

export const assignmentSchema = z.object({
    salik_id: z.string().uuid(),
    murabbi_id: z.string().uuid(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type TaskTemplateInput = z.infer<typeof taskTemplateSchema>;
export type DailyReportInput = z.infer<typeof dailyReportSchema>;
export type AIChatInput = z.infer<typeof aiChatSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
