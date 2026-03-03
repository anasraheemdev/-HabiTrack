// ════════════════════════════════════════════════════════════
// API: Admin – User Management (Create Murabbi accounts)
// ════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { signupSchema } from '@/lib/validations';

export async function GET() {
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

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ users: data });
    } catch (error) {
        console.error('Admin users GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

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
        const result = signupSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
        }

        // Use admin client to create user (bypasses RLS)
        const adminSupabase = await createAdminSupabaseClient();
        const { data: newUser, error } = await adminSupabase.auth.admin.createUser({
            email: result.data.email,
            password: result.data.password,
            email_confirm: true,
            user_metadata: {
                full_name: result.data.full_name,
                role: result.data.role,
            },
        });

        if (error) {
            console.error('Auth creation error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (!newUser.user) {
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

        // Manually insert profile (bypasses broken trigger)
        const { error: profileError } = await adminSupabase
            .from('profiles')
            .upsert({
                id: newUser.user.id,
                email: result.data.email,
                full_name: result.data.full_name,
                role: result.data.role,
            });

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // Clean up auth user if profile fails
            await adminSupabase.auth.admin.deleteUser(newUser.user.id);
            return NextResponse.json({ error: `Profile creation failed: ${profileError.message}` }, { status: 500 });
        }

        // Log activity
        await supabase.from('activity_logs').insert({
            user_id: user.id,
            action: `created ${result.data.role} account`,
            details: `Created account for ${result.data.full_name} (${result.data.email})`,
        });

        return NextResponse.json({ user: newUser }, { status: 201 });
    } catch (error) {
        console.error('Admin create user error:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
