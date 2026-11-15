export const instant = false;

import { Suspense } from 'react';
import { connection } from 'next/server';
import Link from 'next/link';
import { getDashboardStats } from '@/lib/data';

export const metadata = {
  title: 'Admin Dashboard',
};

export default function AdminDashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  // Switch to request-time rendering before accessing current time or data.
  await connection();

  const stats = await getDashboardStats();

  const cards = [
    { label: 'Courses', value: stats.courses, href: '/admin/courses' },
    { label: 'Sessions', value: stats.sessions, href: '/admin/sessions' },
    { label: 'Enquiries', value: stats.enquiries, href: '/admin/enquiries' },
    { label: 'New enquiries', value: stats.newEnquiries, href: '/admin/enquiries' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">
        Dashboard
      </h1>

      <p className="mt-1 text-(--text-secondary)">
        Overview of the academy catalogue and enquiries.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-(--border) bg-(--bg-card) p-5 transition hover:border-orange-400 hover:shadow-sm"
          >
            <p className="text-sm font-bold text-(--text-secondary)">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-black">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-(--border-strong) bg-(--bg-card) p-8 text-center">
        <p className="font-bold text-(--text-secondary)">
          Course &amp; session management
        </p>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Manage courses, sessions and enquiries directly from the admin panel.
        </p>
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div>
      <div className="h-9 w-48 animate-pulse rounded bg-(--bg-subtle)" />

      <div className="mt-3 h-5 w-80 animate-pulse rounded bg-(--bg-subtle)" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-2xl bg-(--bg-subtle)"
          />
        ))}
      </div>
    </div>
  );
}