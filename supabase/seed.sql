insert into public.training_items (id, title, description, required, sort_order) values
  ('a1000000-0000-4000-8000-000000000001', 'Attend NurtureSTEM orientation', 'Join the live orientation session covering program goals and expectations.', true, 1),
  ('a1000000-0000-4000-8000-000000000002', 'Review tutoring expectations', 'Read the tutoring expectations guide for session structure and conduct.', true, 2),
  ('a1000000-0000-4000-8000-000000000003', 'Review age-appropriate communication guidelines', 'Learn how to communicate clearly and kindly with younger students.', true, 3),
  ('a1000000-0000-4000-8000-000000000004', 'Review STEM lesson structure', 'Understand how NurtureSTEM lessons are organized and paced.', true, 4),
  ('a1000000-0000-4000-8000-000000000005', 'Review student privacy guidelines', 'Understand what student information must never be collected or shared.', true, 5),
  ('a1000000-0000-4000-8000-000000000006', 'Complete first-session preparation', 'Prepare materials and an icebreaker for your first session.', true, 6);

insert into public.students (id, display_name, level, grade_num, subject_focus, status, created_at) values
  ('b2000000-0000-4000-8000-000000000001', 'Ava R.', 'Elementary', 4, 'Math', 'Active', now() - interval '8 months'),
  ('b2000000-0000-4000-8000-000000000002', 'Liam T.', 'Middle School', 7, 'Algebra', 'Active', now() - interval '7 months'),
  ('b2000000-0000-4000-8000-000000000003', 'Maya K.', 'Elementary', 5, 'Science', 'Active', now() - interval '6 months'),
  ('b2000000-0000-4000-8000-000000000004', 'Noah P.', 'Middle School', 8, 'Physics', 'Matched', now() - interval '3 months'),
  ('b2000000-0000-4000-8000-000000000005', 'Zoe L.', 'Middle School', 6, 'General STEM', 'Waitlisted', now() - interval '2 months'),
  ('b2000000-0000-4000-8000-000000000006', 'Eli J.', 'Elementary', 3, 'Math', 'Waitlisted', now() - interval '6 weeks'),
  ('b2000000-0000-4000-8000-000000000007', 'Sara N.', 'Middle School', 7, 'Chemistry', 'Waitlisted', now() - interval '1 month'),
  ('b2000000-0000-4000-8000-000000000008', 'Owen D.', 'Elementary', 5, 'Science', 'Paused', now() - interval '5 months'),
  ('b2000000-0000-4000-8000-000000000009', 'Ivy C.', 'Middle School', 8, 'Geometry', 'Completed', now() - interval '10 months'),
  ('b2000000-0000-4000-8000-000000000010', 'Leo M.', 'Elementary', 4, 'General STEM', 'Active', now() - interval '4 months');

insert into public.volunteers (id, name, email, grade_level, subject_strengths, max_capacity, active_status, created_at) values
  ('c3000000-0000-4000-8000-000000000001', 'Jordan Hayes', 'jordan.hayes@example.com', 11, '{Math,Algebra,Geometry}', 4, true, now() - interval '9 months'),
  ('c3000000-0000-4000-8000-000000000002', 'Priya Shah', 'priya.shah@example.com', 12, '{Biology,Chemistry,Science}', 3, true, now() - interval '8 months'),
  ('c3000000-0000-4000-8000-000000000003', 'Marcus Lee', 'marcus.lee@example.com', 10, '{Physics,Math,General STEM}', 2, true, now() - interval '6 months'),
  ('c3000000-0000-4000-8000-000000000004', 'Elena Ortiz', 'elena.ortiz@example.com', 11, '{Science,General STEM}', 3, true, now() - interval '4 months'),
  ('c3000000-0000-4000-8000-000000000005', 'Sam Whitfield', 'sam.whitfield@example.com', 12, '{Algebra,Geometry}', 2, false, now() - interval '11 months');

insert into public.volunteer_training_progress (volunteer_id, training_item_id, completed, completed_at)
select v.id, t.id, true, now() - interval '2 months'
from public.volunteers v
cross join public.training_items t
where v.id in ('c3000000-0000-4000-8000-000000000001', 'c3000000-0000-4000-8000-000000000002');

insert into public.volunteer_training_progress (volunteer_id, training_item_id, completed, completed_at)
select 'c3000000-0000-4000-8000-000000000003', t.id, true, now() - interval '1 month'
from public.training_items t
where t.sort_order <= 3;

insert into public.assignments (id, student_id, volunteer_id, status, start_date) values
  ('d4000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'c3000000-0000-4000-8000-000000000001', 'Active', current_date - 200),
  ('d4000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000002', 'c3000000-0000-4000-8000-000000000001', 'Active', current_date - 180),
  ('d4000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000003', 'c3000000-0000-4000-8000-000000000002', 'Active', current_date - 150),
  ('d4000000-0000-4000-8000-000000000004', 'b2000000-0000-4000-8000-000000000004', 'c3000000-0000-4000-8000-000000000003', 'Active', current_date - 60),
  ('d4000000-0000-4000-8000-000000000005', 'b2000000-0000-4000-8000-000000000010', 'c3000000-0000-4000-8000-000000000004', 'Active', current_date - 90),
  ('d4000000-0000-4000-8000-000000000006', 'b2000000-0000-4000-8000-000000000009', 'c3000000-0000-4000-8000-000000000005', 'Ended', current_date - 300);

insert into public.hour_logs (volunteer_id, student_id, duration_minutes, subject_category, short_summary, approval_status) values
  ('c3000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 60, 'Math', 'Multiplication practice and word problems.', 'Approved'),
  ('c3000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 60, 'Math', 'Fractions review with visual models.', 'Approved'),
  ('c3000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000002', 90, 'Algebra', 'Linear equations practice.', 'Approved'),
  ('c3000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000002', 60, 'Algebra', 'Graphing lines and slope.', 'Approved'),
  ('c3000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 60, 'Math', 'Decimals and estimation games.', 'Pending'),
  ('c3000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000003', 60, 'Science', 'States of matter experiments.', 'Approved'),
  ('c3000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000003', 75, 'Science', 'Intro to ecosystems.', 'Approved'),
  ('c3000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000003', 60, 'Science', 'Plant life cycle activity.', 'Pending'),
  ('c3000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000004', 90, 'Physics', 'Forces and motion basics.', 'Approved'),
  ('c3000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000004', 60, 'Physics', 'Simple machines walkthrough.', 'Pending'),
  ('c3000000-0000-4000-8000-000000000004', 'b2000000-0000-4000-8000-000000000010', 60, 'General STEM', 'Intro to coding logic puzzles.', 'Approved'),
  ('c3000000-0000-4000-8000-000000000004', 'b2000000-0000-4000-8000-000000000010', 45, 'General STEM', 'Bridge-building challenge.', 'Approved'),
  ('c3000000-0000-4000-8000-000000000005', 'b2000000-0000-4000-8000-000000000009', 60, 'Geometry', 'Angles and triangles review.', 'Approved'),
  ('c3000000-0000-4000-8000-000000000005', 'b2000000-0000-4000-8000-000000000009', 60, 'Geometry', 'Area and perimeter practice.', 'Rejected');

insert into public.resources (title, subject, level, resource_type, url, description) values
  ('Fractions Visual Worksheet Pack', 'Math', 'Elementary', 'Worksheet', 'https://example.com/resources/fractions-pack', 'Printable fraction models for grades 3 to 5.'),
  ('Linear Equations Slide Deck', 'Algebra', 'Middle School', 'Slide Deck', 'https://example.com/resources/linear-equations', 'Step-by-step slides for solving one and two step equations.'),
  ('States of Matter Lesson Plan', 'Science', 'Elementary', 'Lesson Plan', 'https://example.com/resources/states-of-matter', 'A 45 minute hands-on lesson with household materials.'),
  ('Geometry Vocabulary Activity', 'Geometry', 'Middle School', 'Activity', 'https://example.com/resources/geometry-vocab', 'Matching game covering key geometry terms.'),
  ('Khan Academy Physics Basics', 'Physics', 'Middle School', 'External Link', 'https://www.khanacademy.org/science/physics', 'Free videos for introductory physics topics.'),
  ('STEM Icebreaker Collection', 'General STEM', 'All Levels', 'Activity', 'https://example.com/resources/stem-icebreakers', 'Quick openers to start any tutoring session.'),
  ('Cell Structure Slide Deck', 'Biology', 'Middle School', 'Slide Deck', 'https://example.com/resources/cell-structure', 'Illustrated overview of plant and animal cells.'),
  ('Chemical Reactions Safety Guide', 'Chemistry', 'Middle School', 'Lesson Plan', 'https://example.com/resources/reactions-safety', 'Safe at-home demonstrations of simple reactions.');
