// ════════════════════════════════════════════════════════════
// API: Task Template – PUT (update) / DELETE
// ════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        // Soft delete: set is_active to false
        const { error } = await supabase
            .from('task_templates')
            .update({ is_active: false })
            .eq('id', id)
            .eq('murabbi_id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Template DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();

        const { data, error } = await supabase
            .from('task_templates')
            .update(body)
            .eq('id', id)
            .eq('murabbi_id', user.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ template: data });
    } catch (error) {
        console.error('Template PUT error:', error);
        return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }
}
