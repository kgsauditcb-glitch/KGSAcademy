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
