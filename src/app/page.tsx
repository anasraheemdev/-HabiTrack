// ════════════════════════════════════════════════════════════
// Root Page – Redirect to role dashboard
// ════════════════════════════════════════════════════════════
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role) {
    redirect(`/${profile.role}`);
  }

  redirect('/login');
}
