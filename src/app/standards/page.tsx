export const instant = false;

import Link from 'next/link';
import { getStandards, isSupabaseConfigured } from '@/lib/data';

export const metadata = { title: 'Standards' };

export default async function StandardsPage() {
  const standards = await getStandards();

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-4xl font-black tracking-tight">Browse by standard</h1>
      <p className="mt-2 text-slate-500">
        KGS Academy training mapped to the standards professionals actually work with.
      </p>

      {standards.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="font-bold text-slate-700">
            {isSupabaseConfigured() ? 'No standards yet' : 'Connect Supabase to load standards'}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {standards.map((s) => (
            <Link
              key={s.id}
              href={`/courses?standard=${s.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-violet-400 hover:shadow-sm"
            >
              <p className="font-extrabold">{s.code}</p>
              <p className="mt-1 text-sm text-slate-500">{s.name}</p>
              {s.description && <p className="mt-2 text-xs text-slate-400">{s.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
