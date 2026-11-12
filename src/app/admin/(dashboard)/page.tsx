export const instant = false;

import Link from 'next/link';
import { getDashboardStats } from '@/lib/data';

export const metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const cards = [
    { label: 'Courses', value: stats.courses, href: '/admin/courses' },
    { label: 'Sessions', value: stats.sessions, href: '/admin/sessions' },
    { label: 'Enquiries', value: stats.enquiries, href: '/admin/enquiries' },
    { label: 'New enquiries', value: stats.newEnquiries, href: '/admin/enquiries' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
      <p className="mt-1 text-(--text-secondary)">Overview of the academy catalogue and enquiries.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-(--border) bg-(--bg-card) p-5 hover:border-orange-400 hover:shadow-sm"
          >
            <p className="text-sm font-bold text-(--text-secondary)">{c.label}</p>
            <p className="mt-2 text-3xl font-black">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-(--border-strong) bg-(--bg-card) p-8 text-center">
        <p className="font-bold text-(--text-secondary)">Course & session management</p>
        <p className="mt-1 text-sm text-(--text-secondary)">
          CRUD screens for courses, sessions and enquiries are scaffolded under /admin —
          see docs/ROADMAP.md for the planned implementation steps.
        </p>
      </div>
    </div>
  );
}
