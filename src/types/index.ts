// ════════════════════════════════════════════════════════════
// HabiTrack AI – Core Type Definitions
// ════════════════════════════════════════════════════════════

export type UserRole = 'admin' | 'murabbi' | 'salik';

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface SalikMurabbiMap {
    id: string;
    salik_id: string;
    murabbi_id: string;
    assigned_at: string;
    is_active: boolean;
    salik?: Profile;
    murabbi?: Profile;
}

export interface TaskTemplate {
    id: string;
    murabbi_id: string;
    category: TaskCategory;
    task_name: string;
    description?: string;
    has_numeric_input: boolean;
    numeric_label?: string;
    weight: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type TaskCategory =
    | 'faraiz'
    | 'nawafil'
    | 'tasbeeh'
    | 'tilawat'
    | 'habit_tracking'
    | 'prohibitions'
    | 'study'
    | 'sleep_tracking';

export const TASK_CATEGORIES: { value: TaskCategory; label: string; icon: string }[] = [
    { value: 'faraiz', label: 'Faraiz (Obligations)', icon: '🕌' },
    { value: 'nawafil', label: 'Nawafil (Voluntary)', icon: '🤲' },
    { value: 'tasbeeh', label: 'Tasbeeh (Remembrance)', icon: '📿' },
    { value: 'tilawat', label: 'Tilawat (Recitation)', icon: '📖' },
    { value: 'habit_tracking', label: 'Habit Tracking', icon: '✅' },
    { value: 'prohibitions', label: 'Prohibitions', icon: '🚫' },
    { value: 'study', label: 'Study', icon: '📚' },
    { value: 'sleep_tracking', label: 'Sleep Tracking', icon: '🌙' },
];

export interface DailyReport {
    id: string;
    salik_id: string;
    report_date: string;
    completion_percentage: number;
    submitted_at: string;
    notes?: string;
    report_items?: ReportItem[];
}

export interface ReportItem {
    id: string;
    report_id: string;
    template_id: string;
    is_completed: boolean;
    numeric_value?: number;
    task_template?: TaskTemplate;
}

export interface AIConversation {
    id: string;
    user_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    is_read: boolean;
    created_at: string;
}

export type NotificationType =
    | 'reminder'
    | 'alert'
    | 'motivational'
    | 'system';

export interface ActivityLog {
    id: string;
    user_id: string;
    action: string;
    details?: string;
    created_at: string;
    user?: Profile;
}

export interface ChillaSummary {
    id: string;
    salik_id: string;
    murabbi_id: string;
    start_date: string;
    end_date: string;
    total_submissions: number;
    average_performance: number;
    most_missed_task?: string;
    streak_record: number;
    ai_summary?: string;
    murabbi_notes?: string;
    is_finalized: boolean;
    created_at: string;
    updated_at: string;
}

// ── Dashboard Stats ──
export interface AdminStats {
    totalSaliks: number;
    activeStreaks: number;
    missedReports: number;
    averagePerformance: number;
}

export interface MurabbiStats {
    assignedSaliks: number;
    nonSubmitted: number;
    lowPerformance: number;
    brokenStreaks: number;
}

export interface SalikStats {
    todayCompletion: number;
    currentStreak: number;
    fortyDayAverage: number;
    totalReports: number;
}
