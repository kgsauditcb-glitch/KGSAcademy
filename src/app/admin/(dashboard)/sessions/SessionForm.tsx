'use client';
import type { Course, CourseSession } from '@/types/database';
import { useFormStatus } from 'react-dom';

type SessionFormProps = {
  courses: Course[];
  session?: CourseSession;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

const inputClass =
  'mt-2 w-full rounded-xl border border-(--border) bg-(--bg-page) px-4 py-3 text-sm text-(--text-primary) outline-none focus:border-orange-500';

const labelClass = 'block text-sm font-bold text-(--text-primary)';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl bg-orange-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}
      {pending ? 'Saving...' : label}
    </button>
  );
}

export default function SessionForm({
  courses,
  session,
  action,
  submitLabel,
}: SessionFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-6">
        <h2 className="text-lg font-black">Session information</h2>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Select the course and configure the session schedule.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            Course *
            <select
              name="course_id"
              required
              defaultValue={session?.course_id ?? ''}
              className={inputClass}
            >
              <option value="" disabled>Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Location
            <input
              name="location"
              type="text"
              defaultValue={session?.location ?? ''}
              placeholder="e.g. KGS Academy, Surat"
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Start date *
            <input
              name="start_date"
              type="date"
              required
              defaultValue={session?.start_date ?? ''}
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            End date
            <input
              name="end_date"
              type="date"
              defaultValue={session?.end_date ?? ''}
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Start time
            <input
              name="start_time"
              type="time"
              defaultValue={session?.start_time?.slice(0, 5) ?? ''}
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Meeting URL
            <input
              name="meeting_url"
              type="url"
              defaultValue={session?.meeting_url ?? ''}
              placeholder="https://..."
              className={inputClass}
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-6">
        <h2 className="text-lg font-black">Capacity and seats</h2>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Set the maximum number of participants and current enrolled seats.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            Total capacity
            <input
              name="capacity"
              type="number"
              min="1"
              step="1"
              defaultValue={session?.capacity ?? ''}
              placeholder="e.g. 30"
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Seats filled
            <input
              name="seats_filled"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={session?.seats_filled ?? 0}
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Session status
            <select
              name="status"
              defaultValue={session?.status ?? 'scheduled'}
              className={inputClass}
            >
              <option value="scheduled">Scheduled</option>
              <option value="open">Open</option>
              <option value="full">Full</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
        </div>

        <p className="mt-4 text-xs text-(--text-secondary)">
          When seats filled reaches capacity, the session will automatically
          change to Full unless it is completed or cancelled.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label={submitLabel} />

        <a
          href="/admin/sessions"
          className="rounded-xl border border-(--border) px-6 py-3 text-sm font-bold text-(--text-secondary) transition hover:bg-(--bg-page)"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
