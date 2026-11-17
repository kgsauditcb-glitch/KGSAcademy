
export const instant = false;

import { connection } from 'next/server';
import Link from 'next/link';
import {
  getEnquiries,
  getEnquiryActivityHistory,
} from '@/lib/data';
import EnquiryCard, { EnquiryFeedback } from './EnquiryCard';
import type { EnquiryStatus } from '@/types/database';

export const metadata = {
  title: 'Admin — Enquiries',
};

type PageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    status?: string;
  }>;
};

const STATUS_OPTIONS: {
  value: EnquiryStatus | 'all';
  label: string;
}[] = [
  { value: 'all', label: 'All Enquiries' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
];

export default async function AdminEnquiriesPage({
  searchParams,
}: PageProps) {
  await connection();

 const [enquiries, params] = await Promise.all([
  getEnquiries(),
  searchParams,
]);

const activities = await getEnquiryActivityHistory(
  enquiries.map((enquiry) => enquiry.id),
);

  const selectedStatus = STATUS_OPTIONS.some(
    (item) => item.value === params.status,
  )
    ? (params.status as EnquiryStatus | 'all')
    : 'all';

  const counts = {
    all: enquiries.length,
    new: enquiries.filter((e) => e.status === 'new').length,
    in_progress: enquiries.filter(
      (e) => e.status === 'in_progress',
    ).length,
    converted: enquiries.filter(
      (e) => e.status === 'converted',
    ).length,
    closed: enquiries.filter(
      (e) => e.status === 'closed',
    ).length,
  };

  const filteredEnquiries =
    selectedStatus === 'all'
      ? enquiries
      : enquiries.filter(
          (enquiry) => enquiry.status === selectedStatus,
        );

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-(--text-primary)">
          Enquiries
        </h1>

        <p className="mt-2 text-sm text-(--text-secondary)">
          Manage incoming enquiries, track follow-ups and convert potential students.
        </p>
      </div>

    {/* Feedback */}
<EnquiryFeedback
  success={params.success}
  error={params.error}
/>

      {/* Status-wise clickable counts */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {STATUS_OPTIONS.map((item) => {
          const count = counts[item.value];
          const active = selectedStatus === item.value;

          return (
            <Link
              key={item.value}
              href={
                item.value === 'all'
                  ? '/admin/enquiries'
                  : `/admin/enquiries?status=${item.value}`
              }
              className={`rounded-2xl border p-5 transition ${
                active
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-(--border) bg-(--bg-card) hover:border-orange-500/50'
              }`}
            >
              <p className="text-sm font-medium text-(--text-secondary)">
                {item.label}
              </p>

              <p className="mt-3 text-3xl font-black tabular-nums text-(--text-primary)">
                {count}
              </p>

              <p className="mt-2 text-xs font-semibold text-orange-400">
                {active ? 'Currently selected' : 'View enquiries →'}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Enquiry list */}
      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-(--text-primary)">
              {STATUS_OPTIONS.find(
                (item) => item.value === selectedStatus,
              )?.label}
            </h2>

            <p className="mt-1 text-sm text-(--text-muted)">
              {filteredEnquiries.length} enquiries found
            </p>
          </div>

          {selectedStatus !== 'all' && (
            <Link
              href="/admin/enquiries"
              className="rounded-xl border border-(--border) px-4 py-2 text-sm font-semibold text-(--text-secondary) transition hover:border-orange-500 hover:text-orange-500"
            >
              Clear Filter
            </Link>
          )}
        </div>

        {filteredEnquiries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-(--border-strong) bg-(--bg-card) px-6 py-16 text-center">
            <h3 className="font-bold text-(--text-primary)">
              No enquiries found
            </h3>

            <p className="mt-2 text-sm text-(--text-secondary)">
              {selectedStatus === 'all'
                ? 'New website submissions will appear here.'
                : `There are no ${selectedStatus.replaceAll('_', ' ')} enquiries.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
          {filteredEnquiries.map((enquiry) => (
  <EnquiryCard
    key={enquiry.id}
    enquiry={enquiry}
    activities={activities.filter(
      (activity) => activity.enquiry_id === enquiry.id,
    )}
  />
))}
          </div>
        )}
      </div>
    </div>
  );
}
