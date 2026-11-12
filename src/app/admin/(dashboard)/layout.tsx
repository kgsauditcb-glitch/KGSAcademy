export const instant = false;

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminSignOut } from '@/components/AdminSignOut';
import { getCurrentProfile, isSupabaseConfigured } from '@/lib/data';

const nav = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/courses', label: 'Courses' },
  { href: '/admin/sessions', label: 'Sessions' },
  { href: '/admin/enquiries', label: 'Enquiries' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-black">Supabase not configured</h1>
        <p className="mt-3 text-slate-800">
          Copy .env.example to .env.local and fill in your project credentials to use the admin panel.
        </p>
      </div>
    );
  }

  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    redirect('/admin/login');
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-6 py-10">
      <aside className="w-52 shrink-0">
        <p className="px-3 text-xs font-extrabold uppercase tracking-wide text-slate-800">
          Admin
        </p>
        <nav className="mt-3 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 px-1">
          <AdminSignOut />
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
