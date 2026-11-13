export const instant = false;

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAllCourses, isSupabaseConfigured } from '@/lib/data';
import { OfferForm } from '../OfferForm';
import { updateOffer } from '../actions';
import type { Offer } from '@/types/database';

export const metadata = { title: 'Admin — Edit offer' };

export default async function EditOfferPage({ params }: PageProps<'/admin/offers/[id]'>) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: offer } = await supabase.from('offers').select('*').eq('id', id).single();
  if (!offer) notFound();

  const courses = isSupabaseConfigured() ? await getAllCourses() : [];

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Edit offer</h1>
      <p className="mt-1 text-(--text-secondary)">{(offer as Offer).title}</p>
      <OfferForm
        courses={courses.map((c) => ({ id: c.id, title: c.title }))}
        offer={offer as Offer}
        action={updateOffer.bind(null, id)}
      />
    </div>
  );
}
