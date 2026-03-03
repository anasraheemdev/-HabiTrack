// ════════════════════════════════════════════════════════════
// Notification Engine Service
// ════════════════════════════════════════════════════════════
import type { Notification, NotificationType } from '@/types';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Create a new notification.
 */
export async function createNotification(params: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
}): Promise<Notification | null> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('notifications')
        .insert({
            user_id: params.userId,
            title: params.title,
            message: params.message,
            type: params.type,
        })
        .select()
        .single();

    if (error) {
        console.error('Create notification error:', error);
        return null;
    }

    return data;
}

/**
 * Fetch unread notifications for a user.
 */
export async function getUnreadNotifications(
    userId: string
): Promise<{ notifications: Notification[]; count: number }> {
    const supabase = await createServerSupabaseClient();

    const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Fetch notifications error:', error);
        return { notifications: [], count: 0 };
    }

    return { notifications: data || [], count: count || 0 };
}

/**
 * Mark notifications as read.
 */
export async function markNotificationsRead(
    notificationIds: string[]
): Promise<boolean> {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', notificationIds);

    if (error) {
        console.error('Mark read error:', error);
        return false;
    }

    return true;
}

/**
 * Check for missed report deadlines and send notifications.
 * This would typically be called by a cron job.
 */
export async function checkMissedReports(): Promise<void> {
    const supabase = await createServerSupabaseClient();
    const today = new Date().toISOString().split('T')[0];

    // Find saliks who haven't submitted today
    const { data: saliks } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'salik');

    if (!saliks) return;

    for (const salik of saliks) {
        const { data: report } = await supabase
            .from('daily_reports')
            .select('id')
            .eq('salik_id', salik.id)
            .eq('report_date', today)
            .single();

        if (!report) {
            await createNotification({
                userId: salik.id,
                title: 'Daily Report Reminder',
                message: `Assalamu Alaikum ${salik.full_name}! Don't forget to submit your daily report. Every small effort counts on your spiritual journey. 🌙`,
                type: 'reminder',
            });
        }
    }
}

/**
 * Notify murabbi about saliks with 3+ missed days.
 */
export async function notifyMurabbiMissedDays(): Promise<void> {
    const supabase = await createServerSupabaseClient();

    const { data: mappings } = await supabase
        .from('salik_murabbi_map')
        .select('salik_id, murabbi_id, salik:profiles!salik_murabbi_map_salik_id_fkey(full_name)')
        .eq('is_active', true);

    if (!mappings) return;

    for (const mapping of mappings) {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const { count } = await supabase
            .from('daily_reports')
            .select('id', { count: 'exact' })
            .eq('salik_id', mapping.salik_id)
            .gte('report_date', threeDaysAgo.toISOString().split('T')[0]);

        if (count === 0) {
            const salikName = (mapping.salik as unknown as { full_name: string })?.full_name || 'A Salik';
            await createNotification({
                userId: mapping.murabbi_id,
                title: 'Salik Needs Attention',
                message: `${salikName} has not submitted any reports in the last 3 days. Consider reaching out to offer guidance and support.`,
                type: 'alert',
            });
        }
    }
}
