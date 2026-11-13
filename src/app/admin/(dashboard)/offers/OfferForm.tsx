'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Offer } from '@/types/database';

export function OfferForm({
  courses,
  offer,
  action,
}: {
  courses: { id: string; title: string }[];
  offer?: Offer | null;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const input =
    'w-full rounded-lg border border-(--border) bg-(--bg-card) px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400';
  const label = 'block text-xs font-bold mb-1.5 text-(--text-secondary)';

  const toLocal = (iso: string | null) => (iso ? iso.slice(0, 16) : '');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await action(new FormData(e.currentTarget));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-5 rounded-2xl border border-(--border) bg-(--bg-card) p-6">
      <div>
        <label className={label} htmlFor="title">Title *</label>
        <input id="title" name="title" required defaultValue={offer?.title} className={input} placeholder="e.g. Festive Season Sale" />
      </div>

      <div>
        <label className={label} htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={2} defaultValue={offer?.description ?? ''} className={input} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="discount_type">Discount type</label>
          <select id="discount_type" name="discount_type" defaultValue={offer?.discount_type ?? 'percent'} className={input}>
            <option value="percent">Percent (%)</option>
            <option value="fixed">Fixed amount (₹)</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="discount_value">Discount value *</label>
          <input id="discount_value" name="discount_value" type="number" min="0" step="0.01" required defaultValue={offer?.discount_value} className={input} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="code">Coupon code (optional)</label>
          <input id="code" name="code" defaultValue={offer?.code ?? ''} className={input} placeholder="e.g. FESTIVE15" />
        </div>
        <div>
          <label className={label} htmlFor="course_id">Apply to</label>
          <select id="course_id" name="course_id" defaultValue={offer?.course_id ?? ''} className={input}>
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="banner_text">Banner text (homepage strip)</label>
        <input id="banner_text" name="banner_text" defaultValue={offer?.banner_text ?? ''} className={input} placeholder="e.g. Flat 15% off all courses" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="starts_at">Starts at</label>
          <input id="starts_at" name="starts_at" type="datetime-local" defaultValue={toLocal(offer?.starts_at ?? null)} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="ends_at">Ends at</label>
          <input id="ends_at" name="ends_at" type="datetime-local" defaultValue={toLocal(offer?.ends_at ?? null)} className={input} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="sort_order">Sort order</label>
          <input id="sort_order" name="sort_order" type="number" defaultValue={offer?.sort_order ?? 0} className={input} />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm font-bold text-(--text-secondary)">
            <input id="is_active" name="is_active" type="checkbox" defaultChecked={offer?.is_active ?? true} className="h-4 w-4 accent-orange-600" />
            Active
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-orange-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-800 disabled:opacity-60"
        >
          {pending ? 'Saving…' : offer ? 'Save changes' : 'Create offer'}
        </button>
        <Link href="/admin/offers" className="rounded-lg border border-(--border) px-5 py-2.5 text-sm font-bold text-(--text-secondary) hover:bg-(--bg-subtle)">
          Cancel
        </Link>
      </div>
    </form>
  );
}
