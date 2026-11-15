import { Suspense } from 'react';
import { connection } from 'next/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminSignOut } from '@/components/AdminSignOut';
import { isSupabaseConfigured } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Admin Dashboard',
};

const nav = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/courses', label: 'Courses' },
  { href: '/admin/sessions', label: 'Sessions' },
  { href: '/admin/enquiries', label: 'Enquiries' },
  { href: '/admin/offers', label: 'Offers' },
];

function AdminLoading() {
  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-6 py-10">
      <aside className="w-52 shrink-0">
        <div className="h-5 w-24 animate-pulse rounded bg-(--bg-subtle)" />
        <div className="mt-5 space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-9 animate-pulse rounded-lg bg-(--bg-subtle)"
            />
          ))}
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="h-9 w-48 animate-pulse rounded bg-(--bg-subtle)" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-(--bg-subtle)"
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}

async function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  // Request-time rendering starts here.
  await connection();

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-black">
          Supabase not configured
        </h1>

        <p className="mt-3 text-(--text-secondary)">
          Copy .env.example to .env.local and fill in your project
          credentials to use the admin panel.
        </p>
      </div>
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/admin/login');
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc('is_admin');

  if (adminError || !isAdmin) {
    redirect('/admin/login');
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-6 py-10">
      <aside className="w-52 shrink-0">
        <p className="px-3 text-xs font-extrabold uppercase tracking-wide text-(--text-secondary)">
          Admin
        </p>

        <nav className="mt-3 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm font-bold text-(--text-secondary) hover:bg-(--bg-subtle)"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 px-1">
          <AdminSignOut />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}