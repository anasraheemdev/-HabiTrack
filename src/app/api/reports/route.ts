// ════════════════════════════════════════════════════════════
// API: Daily Reports – GET (fetch) / POST (submit)
// ════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { dailyReportSchema } from '@/lib/validations';
import { calculateCompletion } from '@/lib/services/performance';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const salikId = searchParams.get('salik_id') || user.id;
        const date = searchParams.get('date');

        let query = supabase
            .from('daily_reports')
            .select('*, report_items(*, task_template:task_templates(*))')
            .eq('salik_id', salikId)
            .order('report_date', { ascending: false });

        if (date) {
            query = query.eq('report_date', date);
        } else {
            query = query.limit(40);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ reports: data });
    } catch (error) {
        console.error('Reports GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const result = dailyReportSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
        }

        const { report_date, notes, items } = result.data;

        // Calculate completion percentage
        const completedCount = items.filter((i) => i.is_completed).length;
        const completionPct = calculateCompletion(completedCount, items.length);

        // Insert report
        const { data: report, error: reportError } = await supabase
            .from('daily_reports')
            .insert({
                salik_id: user.id,
                report_date,
                completion_percentage: completionPct,
                notes,
            })
            .select()
            .single();

        if (reportError) throw reportError;

        // Insert report items
        const reportItems = items.map((item) => ({
            report_id: report.id,
            template_id: item.template_id,
            is_completed: item.is_completed,
            numeric_value: item.numeric_value,
        }));

        const { error: itemsError } = await supabase
            .from('report_items')
            .insert(reportItems);

        if (itemsError) throw itemsError;

        // Log activity
        await supabase.from('activity_logs').insert({
            user_id: user.id,
            action: 'submitted daily report',
            details: `Completion: ${completionPct}% for ${report_date}`,
        });

        return NextResponse.json({ report, completion: completionPct }, { status: 201 });
    } catch (error) {
        console.error('Reports POST error:', error);
        return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
    }
}
