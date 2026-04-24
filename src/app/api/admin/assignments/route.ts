// ════════════════════════════════════════════════════════════
// API: Admin – Salik Assignments (Reassign)
// ════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { assignmentSchema } from '@/lib/validations';

// Service role client to bypass any RLS row check limitations during re-assignments
const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
);

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

        const { salik_id, murabbi_id } = result.data;

        // 1. Deactivate ALL existing active assignments for this salik to prevent double-mapping
        const { error: updErr } = await adminSupabase
            .from('salik_murabbi_map')
            .update({ is_active: false })
            .eq('salik_id', salik_id)
            .eq('is_active', true);

        if (updErr) {
            console.error('Failed to deactivate old assignments:', updErr);
            throw new Error('Failed to deactivate old maps');
        }

        // 2. UPSERT new assignment (handles cases where they return to a previous murabbi violating UNIQUE)
        const { data, error } = await adminSupabase
            .from('salik_murabbi_map')
            .upsert({
                salik_id,
                murabbi_id,
                is_active: true,
            }, {
                onConflict: 'salik_id,murabbi_id',
            })
            .select()
            .single();

        if (error) {
            console.error('Reassignment insert/upd error:', error);
            throw error;
        }

        // 3. Log activity
        await adminSupabase.from('activity_logs').insert({
            user_id: user.id,
            action: 'reassigned salik',
            details: `Salik ${salik_id} assigned to Murabbi ${murabbi_id}`,
        });

        return NextResponse.json({ assignment: data }, { status: 201 });
    } catch (error) {
        console.error('Assignment error:', error);
        return NextResponse.json({ error: 'Failed to assign' }, { status: 500 });
    }
}
