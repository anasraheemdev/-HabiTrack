// ════════════════════════════════════════════════════════════
// Root Page – Redirect to role dashboard
// ════════════════════════════════════════════════════════════
import { createServerSupabaseClient } from '@/lib/supabase/server';
import LandingPageUI from '@/components/shared/LandingPageUI';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    role = profile?.role || null;
  }

  return <LandingPageUI isLoggedIn={!!user} role={role} />;
}
