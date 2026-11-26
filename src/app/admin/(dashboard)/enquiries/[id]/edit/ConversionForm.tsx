
'use client';

import { useEffect, useState } from 'react';
import { convertEnquiry, updateEnquiry } from '../../actions';
import type { EnquiryStatus } from '@/types/database';

type Course = {
  id: string;
  title: string;
  mode: string;
  duration_days: number | null;
};

type Session = {
  id: string;
  course_id: string;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  location: string | null;
  meeting_url: string | null;
};

type Props = {
  enquiryId: string;
  courses: Course[];
  sessions: Session[];
};

type WorkflowProps = Props & {
  currentStatus: EnquiryStatus;
  internalNotes: string;
};

const inputClass =
  'w-full rounded-xl border border-(--border) bg-(--bg-page) px-4 py-3 text-sm text-(--text-primary) outline-none focus:border-orange-500';

const STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  converted: 'Converted',
  closed: 'Closed',
};

export function EnquiryStatusWorkflow({
  enquiryId,
  currentStatus,
  internalNotes,
  courses,
  sessions,
}: WorkflowProps) {
  const [status, setStatus] = useState<EnquiryStatus>(currentStatus);
const [notes, setNotes] = useState(internalNotes);
const [closureComment, setClosureComment] = useState('');

const [courseId, setCourseId] = useState('');
const [sessionId, setSessionId] = useState('');

useEffect(() => {
  const timeoutId = setTimeout(() => {
    setStatus(currentStatus);
    setNotes(internalNotes);
  }, 0);

  return () => clearTimeout(timeoutId);
}, [currentStatus, internalNotes]);

const filteredSessions = sessions.filter(
  (session) => session.course_id === courseId,
);

const selectedSession = filteredSessions.find(
  (session) => session.id === sessionId,
);

  return (
    <>
      <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-5 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-(--text-primary)">
            Manage Enquiry
          </h2>

          <p className="mt-1 text-sm text-(--text-secondary)">
            Update the enquiry status and add private notes for your team.
          </p>
        </div>

        <form
          action={updateEnquiry.bind(null, enquiryId)}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-semibold text-(--text-primary)"
            >
              Enquiry Status
            </label>

            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as EnquiryStatus)}
              required
              className={inputClass}
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-(--text-muted)">
              Choose the current progress of this enquiry.
            </p>
          </div>

{currentStatus === 'converted' && status === 'closed' && (
  <div>
    <label
      htmlFor="closure_comment"
      className="mb-2 block text-sm font-semibold text-(--text-primary)"
    >
      Closure Comment *
    </label>

    <textarea
      id="closure_comment"
      name="closure_comment"
      rows={4}
      required
      value={closureComment}
      onChange={(e) => setClosureComment(e.target.value)}
      placeholder="Explain why this enquiry is being closed..."
      className="w-full resize-y rounded-xl border border-(--border) bg-(--bg-page) px-4 py-3 text-sm leading-6 text-(--text-primary) outline-none transition placeholder:text-(--text-muted) focus:border-orange-500"
    />

    <p className="mt-2 text-xs text-(--text-muted)">
      Please provide a reason for closing this converted enquiry.
      This comment will be recorded in the activity history.
    </p>
  </div>
)}


          <div>
            <label
              htmlFor="internal_notes"
              className="mb-2 block text-sm font-semibold text-(--text-primary)"
            >
              Internal Notes
            </label>

          <textarea
  id="internal_notes"
  name="internal_notes"
  rows={5}
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  placeholder="Example: Called the student, shared course details, follow-up required next week..."
  className="w-full resize-y rounded-xl border border-(--border) bg-(--bg-page) px-4 py-3 text-sm leading-6 text-(--text-primary) outline-none transition placeholder:text-(--text-muted) focus:border-orange-500"
/>

            <p className="mt-2 text-xs text-(--text-muted)">
              These notes are private and visible only to your admin team.
            </p>
          </div>

          {currentStatus === 'in_progress' && status === 'converted' && (
  <div className="space-y-5 rounded-xl border border-orange-500/30 p-5">
    <div>
      <h3 className="font-bold text-(--text-primary)">
        Course Conversion Details
      </h3>
      <p className="mt-1 text-sm text-(--text-secondary)">
        These details will be emailed to the student.
      </p>
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold text-(--text-primary)">
        Select Course *
      </label>

      <select
        name="course_id"
        required
        value={courseId}
        onChange={(e) => {
          setCourseId(e.target.value);
          setSessionId('');
        }}
        className={inputClass}
      >
        <option value="">Choose a course</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold text-(--text-primary)">
        Training Session
      </label>

      <select
        name="session_id"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        disabled={!courseId || filteredSessions.length === 0}
        className={inputClass}
      >
        <option value="">
          {!courseId
            ? 'Select a course first'
            : filteredSessions.length === 0
              ? 'No sessions available'
              : 'No specific session'}
        </option>

        {filteredSessions.map((session) => (
          <option key={session.id} value={session.id}>
            {session.start_date}
            {session.location ? ` - ${session.location}` : ''}
          </option>
        ))}
      </select>
    </div>

    {selectedSession && (
      <div className="rounded-xl border border-(--border) bg-(--bg-page) p-4">
        <p className="font-bold text-(--text-primary)">
          Selected Session Details
        </p>
        <p className="mt-2 text-sm text-(--text-secondary)">
          Start: {selectedSession.start_date}
        </p>
        <p className="text-sm text-(--text-secondary)">
          End: {selectedSession.end_date || 'Not specified'}
        </p>
        <p className="text-sm text-(--text-secondary)">
          Time: {selectedSession.start_time || 'Not specified'}
        </p>
        <p className="text-sm text-(--text-secondary)">
          Location: {selectedSession.location || 'Not specified'}
        </p>
      </div>
    )}

    <div>
      <label className="mb-2 block text-sm font-semibold text-(--text-primary)">
        Meeting Link
      </label>
      <input
        type="url"
        name="meeting_link"
        placeholder="https://zoom.us/j/..."
        className={inputClass}
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold text-(--text-primary)">
        Additional Instructions
      </label>
      <textarea
        name="additional_message"
        rows={4}
        placeholder="Joining instructions, payment details or other information..."
        className={inputClass}
      />
    </div>
  </div>
)}

          <div className="flex flex-wrap justify-end gap-3 border-t border-(--border) pt-5">
            <a
              href="/admin/enquiries"
              className="inline-flex items-center justify-center rounded-xl border border-(--border) px-5 py-2.5 text-sm font-semibold text-(--text-secondary) transition hover:bg-(--bg-subtle)"
            >
              Cancel
            </a>

           <button
  type="submit"
  className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
>
  Save Changes
</button>
          </div>
        </form>
      </section>

   
    </>
  );
}


