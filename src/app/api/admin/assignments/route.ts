// ════════════════════════════════════════════════════════════
// API: Admin – Salik Assignments (Reassign)
// ════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { assignmentSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const result = assignmentSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
        }

        // Deactivate existing assignment
        await supabase
            .from('salik_murabbi_map')
            .update({ is_active: false })
            .eq('salik_id', result.data.salik_id)
            .eq('is_active', true);

        // Create new assignment
        const { data, error } = await supabase
            .from('salik_murabbi_map')
            .insert({
                salik_id: result.data.salik_id,
                murabbi_id: result.data.murabbi_id,
                is_active: true,
            })
            .select()
            .single();

        if (error) throw error;

        // Log activity
        await supabase.from('activity_logs').insert({
            user_id: user.id,
            action: 'reassigned salik',
            details: `Salik ${result.data.salik_id} assigned to Murabbi ${result.data.murabbi_id}`,
        });

        return NextResponse.json({ assignment: data }, { status: 201 });
    } catch (error) {
        console.error('Assignment error:', error);
        return NextResponse.json({ error: 'Failed to assign' }, { status: 500 });
    }
}
