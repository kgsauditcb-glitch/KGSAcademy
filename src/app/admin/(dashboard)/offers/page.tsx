export const instant = false;

import Link from 'next/link';
import { getAllOffers, isSupabaseConfigured } from '@/lib/data';
import { OfferRowActions } from './OfferRowActions';

export const metadata = { title: 'Admin — Offers' };

function statusOf(o: { is_active: boolean; starts_at: string | null; ends_at: string | null }) {
  const now = Date.now();
  if (!o.is_active) return { label: 'Inactive', cls: 'bg-(--bg-subtle) text-(--text-secondary)' };
  if (o.starts_at && new Date(o.starts_at).getTime() > now)
    return { label: 'Scheduled', cls: 'bg-amber-950 text-amber-300' };
  if (o.ends_at && new Date(o.ends_at).getTime() < now)
    return { label: 'Expired', cls: 'bg-red-950 text-red-300' };
  return { label: 'Live', cls: 'bg-emerald-950 text-emerald-300' };
}

export default async function AdminOffersPage() {
  if (!isSupabaseConfigured()) {
    return <p className="text-(--text-secondary)">Supabase not configured.</p>;
  }
  const offers = await getAllOffers();

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Offers</h1>
          <p className="mt-1 text-(--text-secondary)">{offers.length} promotion{offers.length === 1 ? '' : 's'} configured.</p>
        </div>
        <Link
          href="/admin/offers/new"
          className="rounded-lg bg-orange-700 px-4 py-2 text-sm font-bold text-white hover:bg-orange-800"
        >
          + New offer
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-(--border) bg-(--bg-card)">
        <table className="w-full text-sm">
          <thead className="bg-(--bg-page) text-left text-xs font-extrabold uppercase tracking-wide text-(--text-secondary)">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Discount</th>
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3">Applies to</th>
              <th className="px-5 py-3">Validity</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border)">
            {offers.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-(--text-secondary)">No offers yet.</td></tr>
            ) : (
              offers.map((o) => {
                const s = statusOf(o);
                return (
                  <tr key={o.id} className="hover:bg-(--bg-page)">
                    <td className="px-5 py-3">
                      <Link href={`/admin/offers/${o.id}`} className="font-bold hover:text-orange-300">{o.title}</Link>
                      {o.banner_text && <p className="text-xs text-(--text-secondary)">{o.banner_text}</p>}
                    </td>
                    <td className="px-5 py-3">
                      {o.discount_type === 'percent' ? `${o.discount_value}%` : `₹${Number(o.discount_value).toLocaleString('en-IN')}`}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">{o.code ?? '—'}</td>
                    <td className="px-5 py-3 text-(--text-secondary)">{o.courses?.title ?? 'All courses'}</td>
                    <td className="px-5 py-3 text-xs text-(--text-secondary)">
                      {o.starts_at || o.ends_at ? (
                        <>
                          {o.starts_at ? new Date(o.starts_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '…'}
                          {' → '}
                          {o.ends_at ? new Date(o.ends_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '…'}
                        </>
                      ) : 'Always'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3">
                      <OfferRowActions id={o.id} isActive={o.is_active} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
