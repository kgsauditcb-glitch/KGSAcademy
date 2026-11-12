-- KGS Academy — seed data (sample catalogue matching the prototype)

insert into public.standards (code, name, slug, sort_order) values
  ('ISO 9001',          'Quality Management',              'iso-9001',          1),
  ('ISO 14001',         'Environmental Management',        'iso-14001',         2),
  ('ISO 45001',         'Occupational Health & Safety',    'iso-45001',         3),
  ('ISO 27001',         'Information Security',            'iso-27001',         4),
  ('ISO 22000',         'Food Safety',                     'iso-22000',         5),
  ('ISO 50001',         'Energy Management',               'iso-50001',         6),
  ('ESG',               'Sustainability & Reporting',      'esg',               7),
  ('Integrated Systems','IMS / Multi-standard',            'integrated-systems',8);

insert into public.categories (name, slug) values
  ('Auditing',              'auditing'),
  ('Quality',               'quality'),
  ('Environment',           'environment'),
  ('OH&S',                  'ohs'),
  ('ESG',                   'esg'),
  ('Food Safety',           'food-safety'),
  ('Information Security',  'information-security');

insert into public.courses
  (title, slug, summary, category_id, standard_id, duration_days, mode, price_inr, mrp_inr, certificate, featured, status)
select v.title, v.slug, v.summary,
       (select id from public.categories where slug = v.category_slug),
       (select id from public.standards  where slug = v.standard_slug),
       v.duration_days, v.mode::public.course_mode, v.price_inr, v.mrp_inr,
       v.certificate, v.featured, 'published'::public.course_status
from (values
  ('Internal Auditor Training',        'internal-auditor-training',       'Core internal auditing skills: planning, execution, reporting.', 'auditing',             'iso-9001',          2, 'live_online', 12500, 15000, true,  true),
  ('ISO 9001:2015 Lead Auditor',       'iso-9001-lead-auditor',          'Full Lead Auditor course with exam included.',                 'quality',              'iso-9001',          5, 'classroom',   28000, 32000, true,  true),
  ('ESG & Sustainability Fundamentals','esg-sustainability-fundamentals', 'Executive workshop on ESG concepts and reporting.',             'esg',                  'esg',               1, 'live_online',  8500, 10000, false, true),
  ('ISO 14001 Awareness',              'iso-14001-awareness',            'One-day introduction to environmental management systems.',   'environment',          'iso-14001',         1, 'classroom',    7500,  9000, false, false),
  ('Risk-Based Thinking Workshop',     'risk-based-thinking-workshop',   'Interactive workshop on risk-based thinking in audits.',        'auditing',             'iso-9001',          1, 'live_online',  6500,  8000, false, false)
) as v(title, slug, summary, category_slug, standard_slug, duration_days, mode, price_inr, mrp_inr, certificate, featured);

insert into public.course_sessions (course_id, start_date, end_date, start_time, location, capacity, status)
select c.id, s.start_date::date, s.end_date::date, s.start_time::time, s.location, s.capacity, s.status::public.session_status
from (values
  ('internal-auditor-training',       '2026-09-08', '2026-09-09', '09:30', 'Live online',        30, 'open'),
  ('iso-9001-lead-auditor',           '2026-09-21', '2026-09-25', '09:30', 'Bengaluru',          20, 'open'),
  ('esg-sustainability-fundamentals', '2026-09-15', '2026-09-15', '18:30', 'Live online',        50, 'scheduled'),
  ('iso-14001-awareness',             '2026-09-15', '2026-09-15', '10:00', 'Live online',        40, 'open'),
  ('risk-based-thinking-workshop',    '2026-09-30', '2026-09-30', '18:30', 'Live online',        60, 'scheduled')
) as s(course_slug, start_date, end_date, start_time, location, capacity, status)
join public.courses c on c.slug = s.course_slug;

-- Upcoming sessions (added 2026-11-12 so the calendar shows future dates)
insert into public.course_sessions (course_id, start_date, end_date, start_time, location, capacity, seats_filled, status)
select c.id, s.start_date::date, s.end_date::date, s.start_time::time, s.location, s.capacity, s.seats_filled, s.status::public.session_status
from (values
  ('internal-auditor-training',       '2026-11-23', '2026-11-24', '09:30', 'Live online', 30, 12, 'open'),
  ('internal-auditor-training',       '2026-12-07', '2026-12-08', '09:30', 'Live online', 30,  0, 'scheduled'),
  ('iso-9001-lead-auditor',           '2026-11-30', '2026-12-04', '09:30', 'Bengaluru',   20,  7, 'open'),
  ('iso-9001-lead-auditor',           '2027-01-11', '2027-01-15', '09:30', 'Live online', 25, 0, 'scheduled'),
  ('esg-sustainability-fundamentals', '2026-11-18', '2026-11-18', '18:30', 'Live online', 50, 22, 'open'),
  ('iso-14001-awareness',             '2026-12-05', '2026-12-05', '10:00', 'Pune',       40,  5, 'open'),
  ('risk-based-thinking-workshop',    '2026-12-12', '2026-12-12', '18:30', 'Live online', 60,  0, 'scheduled')
) as s(course_slug, start_date, end_date, start_time, location, capacity, seats_filled, status)
join public.courses c on c.slug = s.course_slug;

insert into public.enquiries (name, email, phone, enquiry_type, course_interest, message, status) values
  ('Priya Sharma',  'priya.sharma@example.com',    '+91 98450 12345', 'individual', 'ISO 9001:2015 Lead Auditor',       'Interested in the December Bengaluru batch. Can you share the exam details?', 'new'),
  ('Rahul Verma',   'rahul.verma@acme-india.com',  '+91 99870 44556', 'corporate',  'Internal Auditor Training',        'We want to train 15 auditors from our quality team in January.',               'new'),
  ('Ananya Iyer',   'ananya.iyer@example.com',     '+91 90040 77889', 'individual', 'ESG & Sustainability Fundamentals','Is there an early-bird discount for the November session?',                 'in_progress'),
  ('Vikram Singh',  'vikram.s@techcorp.in',        null,              'corporate',  'ISO 14001 Awareness',                'Looking for an on-site corporate workshop for our EHS team.',                  'new');
