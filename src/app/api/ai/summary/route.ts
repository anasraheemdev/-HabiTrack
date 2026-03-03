// ════════════════════════════════════════════════════════════
// API: AI Summary – Generate 40-Day Chilla Summary
// ════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateChillaSummary } from '@/lib/services/ai';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify user is a murabbi
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'murabbi') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const summary = await generateChillaSummary({
            salikName: body.salikName || 'Salik',
            totalSubmissions: body.totalSubmissions || 0,
            averagePerformance: body.averagePerformance || 0,
            mostMissedTask: body.mostMissedTask || null,
            streakRecord: body.streakRecord || 0,
            performanceTrend: body.performanceTrend || [],
        });

        return NextResponse.json({ summary });
    } catch (error) {
        console.error('AI Summary error:', error);
        return NextResponse.json(
            { error: 'Failed to generate summary' },
            { status: 500 }
        );
    }
}
