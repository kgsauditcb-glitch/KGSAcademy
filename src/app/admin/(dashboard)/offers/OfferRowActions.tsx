'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteOffer, toggleOffer } from './actions';

export function OfferRowActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function run(fn: () => Promise<void>) {
    setPending(true);
    try {
      await fn();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => run(() => toggleOffer(id, !isActive))}
        disabled={pending}
        className="rounded-lg border border-(--border) px-3 py-1.5 text-xs font-bold text-(--text-secondary) hover:bg-(--bg-subtle) disabled:opacity-50"
      >
        {isActive ? 'Deactivate' : 'Activate'}
      </button>
      <button
        onClick={() => {
          if (confirm('Delete this offer?')) run(() => deleteOffer(id));
        }}
        disabled={pending}
        className="rounded-lg border border-red-800 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-950 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
