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
      className="w-full rounded-lg border border-blue-800 px-3 py-2 text-sm font-bold text-blue-200 hover:bg-blue-950"
    >
      Sign out
    </button>
  );
}
