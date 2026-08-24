import { requireSupabase } from './supabase';
import { ADMIN_EMAIL } from './servicomoz';

export type AppDestination = '/admin' | '/feed' | '/waiting-room' | '/subscription-expired' | '/suspended' | '/professional/onboarding';

export async function getPostLoginDestination(): Promise<AppDestination> {
  const supabase = requireSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return '/login' as AppDestination;

  if ((user.email ?? '').toLowerCase() === ADMIN_EMAIL) return '/admin';

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role === 'admin') return '/admin';
  if (profile?.role !== 'professional') return '/feed';

  const { data: professional } = await supabase
    .from('professional_profiles')
    .select('account_status')
    .eq('id', user.id)
    .maybeSingle();

  if (!professional || professional.account_status === 'pending') return '/waiting-room';
  if (professional.account_status === 'suspended') return '/suspended';

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, expires_at')
    .eq('professional_id', user.id)
    .eq('status', 'active')
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription || (subscription.expires_at && new Date(subscription.expires_at) <= new Date())) {
    return '/subscription-expired';
  }

  return '/feed';
}
