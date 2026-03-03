// ════════════════════════════════════════════════════════════
// API: Signup – Creates user via admin client + inserts profile
// Bypasses any auth.users triggers by handling profile creation
// in application code instead.
// ════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { full_name, email, password, role } = body;

        if (!full_name || !email || !password || !role) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (!['admin', 'murabbi', 'salik'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Use admin client to bypass any triggers
        const adminSupabase = await createAdminSupabaseClient();

        // Step 1: Create auth user
        const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name, role },
        });

        if (authError) {
            console.error('Auth creation error:', authError);
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'Failed to create user' },
                { status: 500 }
            );
        }

        // Step 2: Manually insert profile (bypasses trigger)
        const { error: profileError } = await adminSupabase
            .from('profiles')
            .upsert({
                id: authData.user.id,
                email: authData.user.email,
                full_name,
                role,
            });

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // Clean up: delete the auth user if profile creation fails
            await adminSupabase.auth.admin.deleteUser(authData.user.id);
            return NextResponse.json(
                { error: `Profile creation failed: ${profileError.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                message: 'Account created successfully',
                user: { id: authData.user.id, email, role },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
