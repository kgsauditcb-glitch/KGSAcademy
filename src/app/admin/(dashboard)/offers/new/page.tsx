export const instant = false;

import { getAllCourses, isSupabaseConfigured } from '@/lib/data';
import { OfferForm } from '../OfferForm';
import { createOffer } from '../actions';

export const metadata = { title: 'Admin — New offer' };

export default async function NewOfferPage() {
  const courses = isSupabaseConfigured() ? await getAllCourses() : [];
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">New offer</h1>
      <p className="mt-1 text-(--text-secondary)">Create a promotion shown on the site and applicable at checkout/enquiry.</p>
      <OfferForm courses={courses.map((c) => ({ id: c.id, title: c.title }))} action={createOffer} />
    </div>
  );
}
