import { EnquiryForm } from '@/components/EnquiryForm';

export const metadata = { title: 'Make an Enquiry' };

export default function EnquiryPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl font-black tracking-tight">Make an enquiry</h1>
      <p className="mt-2 text-(--text-secondary)">
        Individual enrolment, corporate group training or a custom programme — tell us
        what you are looking for and our team will get back to you.
      </p>
      <div className="mt-8 rounded-2xl border border-(--border) bg-(--bg-card) p-6">
        <EnquiryForm />
      </div>
    </div>
  );
}
