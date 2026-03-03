// ════════════════════════════════════════════════════════════
// API: Murabbi – Create Salik Account & Auto-assign
// ════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify murabbi
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'murabbi') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { full_name, email, password } = body;

        if (!full_name || !email || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Use admin client to create user
        const adminSupabase = await createAdminSupabaseClient();
        const { data: newUser, error: authError } = await adminSupabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name, role: 'salik' },
        });

        if (authError) {
            console.error('Auth creation error:', authError);
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        if (!newUser.user) {
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

        // Insert profile
        const { error: profileError } = await adminSupabase
            .from('profiles')
            .upsert({
                id: newUser.user.id,
                email,
                full_name,
                role: 'salik',
            });

        if (profileError) {
            console.error('Profile creation error:', profileError);
            await adminSupabase.auth.admin.deleteUser(newUser.user.id);
            return NextResponse.json({ error: `Profile creation failed: ${profileError.message}` }, { status: 500 });
        }

        // Auto-assign this Salik to the Murabbi
        const { error: assignError } = await adminSupabase
            .from('salik_murabbi_map')
            .insert({
                salik_id: newUser.user.id,
                murabbi_id: user.id,
                is_active: true,
            });

        if (assignError) {
            console.error('Assignment error:', assignError);
            // Don't fail the whole operation, just log
        }

        // Log activity
        await supabase.from('activity_logs').insert({
            user_id: user.id,
            action: 'created salik account',
            details: `Created Salik account for ${full_name} (${email}) and auto-assigned`,
        });

        return NextResponse.json({
            message: 'Salik account created and assigned',
            user: { id: newUser.user.id, email, full_name, role: 'salik' },
        }, { status: 201 });
    } catch (error) {
        console.error('Murabbi create salik error:', error);
        return NextResponse.json({ error: 'Failed to create Salik' }, { status: 500 });
    }
}
