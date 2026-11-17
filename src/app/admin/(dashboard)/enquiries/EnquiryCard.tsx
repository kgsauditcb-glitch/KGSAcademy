'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Enquiry, EnquiryStatus } from '@/types/database';

type EnquiryActivity = {
  id: string;
  enquiry_id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  actor_id: string | null;
  actor_name: string;
  created_at: string;
};

type EnquiryCardProps = {
  enquiry: Enquiry;
  activities: EnquiryActivity[];
};

const STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  converted: 'Converted',
  closed: 'Closed',
};

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  new: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  in_progress: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  converted: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  closed: 'border-(--border) bg-(--bg-subtle) text-(--text-secondary)',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getDaysAgo(date: string) {
  const days = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(date).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';

  return `${days} days ago`;
}

function getStatusLabel(status: string | null) {
  if (!status) return 'Unknown';

  return STATUS_LABELS[status as EnquiryStatus] ?? status;
}

function getActivityDescription(activity: EnquiryActivity) {
  if (activity.from_status === activity.to_status) {
    return 'Updated internal notes';
  }

  return `Changed status from ${getStatusLabel(
    activity.from_status,
  )} to ${getStatusLabel(activity.to_status)}`;
}

export default function EnquiryCard({
  enquiry,
  activities,
}: EnquiryCardProps) {
  const [showTimeline, setShowTimeline] = useState(false);

  const status = enquiry.status;

  const lastActivity = activities[0];

  const lastStatusChange = activities.find(
    (activity) =>
      activity.from_status !== activity.to_status,
  );

  const currentStatusSince =
    lastStatusChange?.created_at ?? enquiry.created_at;

  return (
    <article className="overflow-hidden rounded-2xl border border-(--border) bg-(--bg-card) transition hover:border-(--border-strong)">
      <div className="p-5 sm:p-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-bold tracking-tight text-(--text-primary)">
                {enquiry.name}
              </h3>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>

            <p className="mt-1 break-all text-sm text-(--text-secondary)">
              {enquiry.email}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <span className="text-xs text-(--text-muted)">
              {formatDate(enquiry.created_at)}
            </span>

            <Link
              href={`/admin/enquiries/${enquiry.id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border border-(--border) px-4 py-2.5 text-sm font-semibold text-(--text-primary) transition hover:border-orange-500 hover:text-orange-500"
            >
              Edit

              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Contact information */}
        <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-(--border) bg-(--bg-page) p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-(--text-muted)">
              Phone
            </p>

            <p className="mt-1 text-sm font-semibold text-(--text-primary)">
              {enquiry.phone || 'Not provided'}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-(--text-muted)">
              Enquiry Type
            </p>

            <p className="mt-1 text-sm font-semibold capitalize text-(--text-primary)">
              {enquiry.enquiry_type.replaceAll('_', ' ')}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-(--text-muted)">
              Course Interest
            </p>

            <p className="mt-1 text-sm font-semibold text-(--text-primary)">
              {enquiry.course_interest || 'Not specified'}
            </p>
          </div>
        </div>

        {/* Enquiry tracking summary */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Total time */}
          <div className="rounded-xl border border-(--border) bg-(--bg-page) p-4">
            <p className="text-xs font-semibold text-(--text-muted)">
              Enquiry Received
            </p>

            <p className="mt-2 text-lg font-bold text-(--text-primary)">
              {formatDate(enquiry.created_at)}
            </p>

            <p className="mt-1 text-sm font-semibold text-orange-400">
              {getDaysAgo(enquiry.created_at)}
            </p>

            <p className="mt-1 text-xs text-(--text-muted)">
              Total time on dashboard
            </p>
          </div>

          {/* Current status duration */}
          <div className="rounded-xl border border-(--border) bg-(--bg-page) p-4">
            <p className="text-xs font-semibold text-(--text-muted)">
              Current Status Since
            </p>

            <p className="mt-2 text-lg font-bold text-(--text-primary)">
              {formatDate(currentStatusSince)}
            </p>

            <p className="mt-1 text-sm font-semibold text-orange-400">
              {getDaysAgo(currentStatusSince)}
            </p>

            <p className="mt-1 text-xs text-(--text-muted)">
              Time in {STATUS_LABELS[status]}
            </p>
          </div>

          {/* Last activity */}
          <div className="rounded-xl border border-(--border) bg-(--bg-page) p-4">
            <p className="text-xs font-semibold text-(--text-muted)">
              Last Activity
            </p>

            {lastActivity ? (
              <>
                <p className="mt-2 text-lg font-bold text-(--text-primary)">
                  {formatDate(lastActivity.created_at)}
                </p>

                <p className="mt-1 text-sm font-semibold text-orange-400">
                  {getDaysAgo(lastActivity.created_at)}
                </p>

                <p className="mt-1 truncate text-xs text-(--text-muted)">
                  By {lastActivity.actor_name}
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-(--text-secondary)">
                  No activity recorded
                </p>

                <p className="mt-1 text-xs text-(--text-muted)">
                  Awaiting first update
                </p>
              </>
            )}
          </div>
        </div>

       

        {/* Original message */}
        {enquiry.message && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-(--text-muted)">
              Message
            </p>

            <p className="whitespace-pre-wrap text-sm leading-6 text-(--text-secondary)">
              {enquiry.message}
            </p>
          </div>
        )}

      

      
{/* Complete Activity Timeline */}
<div className="mt-5 border-t border-(--border) pt-5">
  <button
    type="button"
    onClick={() => setShowTimeline(!showTimeline)}
    className="flex w-full items-center justify-between gap-3 text-left"
  >
    <div>
      <p className="text-sm font-bold text-(--text-primary)">
        Activity History
      </p>

      <p className="mt-1 text-xs text-(--text-muted)">
        {activities.length + 1} recorded events
      </p>
    </div>

    <span className="text-sm font-semibold text-orange-400">
      {showTimeline ? 'Hide History ↑' : 'View History ↓'}
    </span>
  </button>

  {showTimeline && (
    <div className="mt-6 space-y-6">
      {(() => {
       const allActivities = [
  ...activities.map((activity) => ({
    id: activity.id,
    actor: activity.actor_name,
    description: getActivityDescription(activity),
    created_at: activity.created_at,
    type: 'activity' as const,
    from_status: activity.from_status,
    to_status: activity.to_status,
  })),
  {
    id: 'enquiry-created',
    actor: 'Enquiry Received',
    description:
      'Enquiry submitted and added to the dashboard with New status.',
    created_at: enquiry.created_at,
    type: 'created' as const,
    from_status: null,
    to_status: 'new',
  },
];

        // Sort newest first
        allActivities.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

        // Group activities by date
        const groupedActivities = allActivities.reduce<
          Record<string, typeof allActivities>
        >((groups, activity) => {
          const date = new Date(activity.created_at);

          const dateKey = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0'),
          ].join('-');

          if (!groups[dateKey]) {
            groups[dateKey] = [];
          }

          groups[dateKey].push(activity);

          return groups;
        }, {});

        const getDateLabel = (dateKey: string) => {
          const today = new Date();
          const yesterday = new Date();

          yesterday.setDate(yesterday.getDate() - 1);

          const formatKey = (date: Date) =>
            [
              date.getFullYear(),
              String(date.getMonth() + 1).padStart(2, '0'),
              String(date.getDate()).padStart(2, '0'),
            ].join('-');

          if (dateKey === formatKey(today)) return 'TODAY';
          if (dateKey === formatKey(yesterday)) return 'YESTERDAY';

          return new Date(`${dateKey}T00:00:00`).toLocaleDateString(
            'en-IN',
            {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }
          ).toUpperCase();
        };

        return (
          <div className="space-y-6">
            {Object.entries(groupedActivities)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([dateKey, dayActivities]) => (
                <div key={dateKey}>
                  {/* Date Heading */}
                  <div className="mb-4 flex items-center gap-3">
                    <p className="shrink-0 text-xs font-bold tracking-wider text-(--text-muted)">
                      {getDateLabel(dateKey)}
                    </p>

                    <div className="h-px flex-1 bg-(--border)" />

                    <span className="text-xs text-(--text-muted)">
                      {dayActivities.length}{' '}
                      {dayActivities.length === 1
                        ? 'event'
                        : 'events'}
                    </span>
                  </div>

                  {/* Timeline Events */}
                  <div className="space-y-1">
                    {dayActivities.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="flex gap-3 sm:gap-4"
                      >
                        {/* Time */}
                        <div className="w-[65px] shrink-0 pt-0.5 text-right">
                          <p className="text-xs font-semibold tabular-nums text-(--text-primary)">
                            {new Date(
                              activity.created_at
                            ).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </p>
                        </div>

                       {/* Timeline Indicator */}
<div className="flex flex-col items-center">
  <span
    className={`mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ${
      activity.type === 'created'
        ? 'bg-cyan-400 ring-cyan-400/15'
        : activity.from_status === activity.to_status
          ? 'bg-violet-500 ring-violet-500/15'
          : activity.to_status === 'new'
            ? 'bg-sky-500 ring-sky-500/15'
            : activity.to_status === 'in_progress'
              ? 'bg-amber-400 ring-amber-400/15'
              : activity.to_status === 'converted'
                ? 'bg-emerald-500 ring-emerald-500/15'
                : activity.to_status === 'closed'
                  ? 'bg-rose-500 ring-rose-500/15'
                  : 'bg-fuchsia-500 ring-fuchsia-500/15'
    }`}
  />

  {index !== dayActivities.length - 1 && (
    <div className="mt-2 w-px flex-1 bg-(--border)" />
  )}
</div>

                        {/* Event Details */}
                        <div className="min-w-0 flex-1 pb-5">
                          <p className="text-sm font-semibold leading-relaxed text-(--text-primary)">
                            {activity.description}
                          </p>

                          <p className="mt-1 text-xs text-(--text-secondary)">
                            {activity.type === 'created'
                              ? activity.actor
                              : `By ${activity.actor}`}
                          </p>

                          <p className="mt-1.5 text-xs text-(--text-muted)">
                            {getDaysAgo(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        );
      })()}
    </div>
  )}
</div>


      </div>
    </article>
  );
}

export function EnquiryFeedback({
  success,
  error,
}: {
  success?: string;
  error?: string;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!success && !error) return;

    const timer = setTimeout(() => {
      setVisible(false);
      window.history.replaceState(null, '', '/admin/enquiries');
    }, 3000);

    return () => clearTimeout(timer);
  }, [success, error]);

  if (!visible) return null;

  return (
    <>
      {success === 'updated' && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          Enquiry updated successfully.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </>
  );
}
