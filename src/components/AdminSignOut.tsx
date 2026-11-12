'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AdminSignOut() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm font-bold text-blue-900 hover:bg-blue-50"
    >
      Sign out
    </button>
  );
}
