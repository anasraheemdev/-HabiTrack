// ════════════════════════════════════════════════════════════
// API: Task Templates – GET (list) / POST (create)
// ════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { taskTemplateSchema } from '@/lib/validations';

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Check if user is murabbi
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'murabbi') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('task_templates')
            .select('*')
            .eq('murabbi_id', user.id)
            .eq('is_active', true)
            .order('category')
            .order('task_name');

        if (error) throw error;

        return NextResponse.json({ templates: data });
    } catch (error) {
        console.error('Templates GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'murabbi') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const result = taskTemplateSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('task_templates')
            .insert({
                murabbi_id: user.id,
                ...result.data,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ template: data }, { status: 201 });
    } catch (error) {
        console.error('Templates POST error:', error);
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }
}
