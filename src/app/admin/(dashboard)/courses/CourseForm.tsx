
'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';

type Option = {
  id: string;
  name: string;
};

type StandardOption = {
  id: string;
  code: string;
  name: string;
};

type CourseFormValues = {
  title?: string;
  summary?: string | null;
  description?: string | null;
  category_id?: string | null;
  standard_id?: string | null;
  duration_days?: number | null;
  mode?: string;
  price_inr?: number | null;
  mrp_inr?: number | null;
  certificate?: boolean;
  featured?: boolean;
  status?: string;
  thumbnail_url?: string | null;
  currency_code?: string | null;
on_demand?: boolean;
};

type CourseFormProps = {
  categories: Option[];
  standards: StandardOption[];
  initialData?: CourseFormValues;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
};

const inputClass =
  'mt-2 w-full rounded-xl border border-(--border) bg-(--bg-page) px-4 py-3 text-sm text-(--text-primary) outline-none transition placeholder:text-(--text-secondary) focus:border-orange-500';

const labelClass = 'text-sm font-bold';

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

export function CourseForm({
  categories,
  standards,
  initialData,
  action,
  submitLabel,
}: CourseFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');

  const [thumbnailPreview, setThumbnailPreview] = useState(
    initialData?.thumbnail_url ?? '',
  );

  function handleThumbnailChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    }
  }

  return (
    <form action={action} className="space-y-8">
      {/* Basic Information */}
      <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-6">
        <h2 className="text-lg font-black">Basic information</h2>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Add the main details of your course.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="title" className={labelClass}>
              Course title *
            </label>
            <input
              id="title"
              name="title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: ISO 9001:2015 Lead Auditor Training"
              className={inputClass}
            />
            <p className="mt-2 text-xs text-(--text-secondary)">
              URL slug will be generated automatically from the title.
            </p>
          </div>

          <div>
            <label htmlFor="summary" className={labelClass}>
              Short summary
            </label>
            <textarea
              id="summary"
              name="summary"
              rows={3}
              defaultValue={initialData?.summary ?? ''}
              placeholder="Write a short introduction about this course..."
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Full description
            </label>
            <textarea
              id="description"
              name="description"
              rows={7}
              defaultValue={initialData?.description ?? ''}
              placeholder="Describe the course, learning outcomes and topics..."
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Course Classification */}
      <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-6">
        <h2 className="text-lg font-black">Course classification</h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="category_id" className={labelClass}>
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              defaultValue={initialData?.category_id ?? ''}
              className={inputClass}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="standard_id" className={labelClass}>
              Standard
            </label>
            <select
              id="standard_id"
              name="standard_id"
              defaultValue={initialData?.standard_id ?? ''}
              className={inputClass}
            >
              <option value="">Select standard</option>
              {standards.map((standard) => (
                <option key={standard.id} value={standard.id}>
                  {standard.code} — {standard.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mode" className={labelClass}>
              Training mode *
            </label>
            <select
              id="mode"
              name="mode"
              defaultValue={initialData?.mode ?? 'classroom'}
              required
              className={inputClass}
            >
              <option value="classroom">Classroom</option>
              <option value="live_online">Live Online</option>
              <option value="hybrid">Hybrid</option>
              <option value="self_paced">Self-paced</option>
            </select>
          </div>

          <div>
            <label htmlFor="duration_days" className={labelClass}>
              Duration (days)
            </label>
            <input
              id="duration_days"
              name="duration_days"
              type="number"
              min="1"
              defaultValue={initialData?.duration_days ?? ''}
              placeholder="Example: 5"
              className={inputClass}
            />
          </div>
        </div>
      </section>

    
      {/* Pricing */}
      <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-6">
        <h2 className="text-lg font-black">Pricing</h2>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Configure course pricing and currency.
        </p>

        <div className="mt-6 space-y-5">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-(--border) bg-(--bg-page) p-4">
            <input
              type="checkbox"
              name="on_demand"
              defaultChecked={initialData?.on_demand ?? false}
              className="mt-1 h-4 w-4 accent-orange-500"
            />
            <span>
              <span className="block text-sm font-bold">
                Price on demand
              </span>
              <span className="mt-1 block text-xs text-(--text-secondary)">
                Hide course prices on the website and display
                &quot;Price on Request&quot; instead.
              </span>
            </span>
          </label>

          <div className="max-w-sm">
            <label htmlFor="currency_code" className={labelClass}>
              Currency
            </label>
            <select
              id="currency_code"
              name="currency_code"
              defaultValue={initialData?.currency_code ?? 'INR'}
              required
              className={inputClass}
            >
              <option value="INR">INR — Indian Rupee (₹)</option>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="GBP">GBP — British Pound (£)</option>
              <option value="EUR">EUR — Euro (€)</option>
              <option value="AED">AED — UAE Dirham (د.إ)</option>
              <option value="AUD">AUD — Australian Dollar (A$)</option>
              <option value="CAD">CAD — Canadian Dollar (C$)</option>
              <option value="SGD">SGD — Singapore Dollar (S$)</option>
              <option value="SAR">SAR — Saudi Riyal (ر.س)</option>
              <option value="JPY">JPY — Japanese Yen (¥)</option>
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="price_inr" className={labelClass}>
                Selling price
              </label>
              <input
                id="price_inr"
                name="price_inr"
                type="number"
                min="0"
                step="0.01"
                defaultValue={initialData?.price_inr ?? ''}
                placeholder="Example: 15000"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="mrp_inr" className={labelClass}>
                Original price
              </label>
              <input
                id="mrp_inr"
                name="mrp_inr"
                type="number"
                min="0"
                step="0.01"
                defaultValue={initialData?.mrp_inr ?? ''}
                placeholder="Example: 20000"
                className={inputClass}
              />
            </div>
          </div>

          <p className="text-xs text-(--text-secondary)">
            Prices are stored in the selected currency. Currency selection
            does not automatically convert amounts.
          </p>
        </div>
      </section>


      {/* Thumbnail Image */}
      <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-6">
        <h2 className="text-lg font-black">Thumbnail image</h2>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Upload a course image. Maximum file size: 5 MB.
        </p>

        {thumbnailPreview && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold text-(--text-secondary)">
              Course thumbnail preview
            </p>

            <img
              src={thumbnailPreview}
              alt="Course thumbnail preview"
              className="h-48 w-full max-w-sm rounded-xl border border-(--border) object-cover"
            />
          </div>
        )}

        <input
          type="file"
          name="thumbnail"
          accept="image/*"
          onChange={handleThumbnailChange}
          className="mt-5 block w-full text-sm text-(--text-secondary) file:mr-4 file:rounded-lg file:border-0 file:bg-orange-500 file:px-4 file:py-2.5 file:font-bold file:text-white hover:file:bg-orange-600"
        />
      </section>

      {/* Publishing Settings */}
      <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-6">
        <h2 className="text-lg font-black">Publishing settings</h2>

        <div className="mt-6 space-y-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="certificate"
              defaultChecked={initialData?.certificate ?? false}
              className="h-4 w-4 accent-orange-500"
            />
            <span className="text-sm font-semibold">
              Certificate provided
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={initialData?.featured ?? false}
              className="h-4 w-4 accent-orange-500"
            />
            <span className="text-sm font-semibold">
              Feature this course on homepage
            </span>
          </label>

          <div className="max-w-sm">
            <label htmlFor="status" className={labelClass}>
              Course status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={initialData?.status ?? 'draft'}
              className={inputClass}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </section>

      {/* Form Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/courses"
          className="rounded-xl border border-(--border) px-5 py-3 text-sm font-bold text-(--text-secondary) transition hover:bg-(--bg-subtle)"
        >
          Cancel
        </Link>

        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
