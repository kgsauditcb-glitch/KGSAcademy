export const instant = false;

import { getEnquiries } from '@/lib/data';

export const metadata = { title: 'Admin — Enquiries' };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  converted: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-slate-100 text-blue-900',
};

export default async function AdminEnquiriesPage() {
  const enquiries = await getEnquiries();

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Enquiries</h1>
      <p className="mt-1 text-blue-900">{enquiries.length} submission{enquiries.length === 1 ? '' : 's'} received.</p>

      <div className="mt-8 space-y-3">
        {enquiries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-blue-900">
            No enquiries yet.
          </div>
        ) : (
          enquiries.map((e) => (
            <div key={e.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold">{e.name} <span className="font-medium text-blue-900">· {e.email}</span></p>
                  <p className="text-sm text-blue-900">
                    {e.phone ?? '—'} · {e.enquiry_type.replace('_', ' ')}
                    {e.course_interest && ` · ${e.course_interest}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-blue-900">{formatDate(e.created_at)}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold capitalize ${STATUS_STYLES[e.status] ?? ''}`}>
                    {e.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              {e.message && <p className="mt-3 text-sm text-blue-900">{e.message}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
