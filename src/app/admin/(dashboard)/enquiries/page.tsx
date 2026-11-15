export const instant = false;

import { connection } from 'next/server';
import { getEnquiries } from '@/lib/data';
import EnquiryCard from './EnquiryCard';

export const metadata = {
  title: 'Admin — Enquiries',
};

type PageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function AdminEnquiriesPage({
  searchParams,
}: PageProps) {
  await connection();

  const [enquiries, params] = await Promise.all([
    getEnquiries(),
    searchParams,
  ]);

  const newCount = enquiries.filter(
    (e) => e.status === 'new',
  ).length;

  const inProgressCount = enquiries.filter(
    (e) => e.status === 'in_progress',
  ).length;

  const convertedCount = enquiries.filter(
    (e) => e.status === 'converted',
  ).length;

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-(--text-primary)">
          Enquiries
        </h1>

        <p className="mt-2 text-sm text-(--text-secondary)">
          Manage incoming enquiries, track follow-ups and convert potential students.
        </p>
      </div>

     

      {/* Feedback */}
      {params.success === 'updated' && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          Enquiry updated successfully.
        </div>
      )}

      {params.error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {params.error}
        </div>
      )}

      {/* Enquiry list */}
      <div>
      

        {enquiries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-(--border-strong) bg-(--bg-card) px-6 py-16 text-center">
            <h3 className="font-bold text-(--text-primary)">
              No enquiries yet
            </h3>

            <p className="mt-2 text-sm text-(--text-secondary)">
              New website submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((enquiry) => (
              <EnquiryCard
                key={enquiry.id}
                enquiry={enquiry}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}