-- ============================================================
-- Seed a Post-Meetup Sorting stack for local testing.
--
-- Creates 6 test accounts (auth.users -> mirrored to public.users by the
-- on_auth_user_created trigger), one card each in a distinct material, then
-- files a contact row for each into YOUR Rolodex: collected_at = now(),
-- sorted_at = NULL -- i.e. the "new connections I made today" the /sort
-- screen reads.
--
-- The Supabase SQL editor runs each statement in its own session, so this
-- is written as THREE independent statements (no BEGIN/COMMIT, no temp
-- table). Run them together or one at a time, in order.
--
-- Re-runnable: statement 1 removes the prior seed first.
-- ============================================================


-- ============================================================
-- STATEMENT 1 -- tear down any previous run
-- ============================================================
with me as (
  select id from users where email = '7h74s8d5zp@privaterelay.appleid.com'
),
del_contacts as (
  delete from contacts
  where owner_user_id = (select id from me)
    and source_card_id in (
      select c.id from cards c
      join users u on u.id = c.owner_user_id
      where u.email like '%@sortseed.test'
    )
  returning 1
)
delete from auth.users where email like '%@sortseed.test';
-- public.users -> cards -> links cascade from the auth.users delete.


-- ============================================================
-- STATEMENT 2 -- create the 6 accounts + their cards
-- ============================================================
with people (id, email, full_name, context, org, role, material) as (
  values
    (gen_random_uuid(), 'dana.okafor@sortseed.test',   'Dana Okafor',   'employed',  'Northwind Logistics', 'Operations Lead',     'obsidianMatte'),
    (gen_random_uuid(), 'sam.reyes@sortseed.test',      'Sam Reyes',     'employed',  'Bluewave Health',     'Product Manager',     'holographicPrism'),
    (gen_random_uuid(), 'priya.nair@sortseed.test',     'Priya Nair',    'jobSeeker', 'Backend Engineer',    'Backend Engineer',    'carbonFiber'),
    (gen_random_uuid(), 'marco.bianchi@sortseed.test',  'Marco Bianchi', 'employed',  'Atlas Foundry',       'Head of Design',      'brushedGunmetal'),
    (gen_random_uuid(), 'lena.hoff@sortseed.test',      'Lena Hoff',     'jobSeeker', 'Data Analyst',        'Data Analyst',        'frostedGlass'),
    (gen_random_uuid(), 'theo.grant@sortseed.test',     'Theo Grant',    'employed',  'Cobalt Studios',      'Engineering Manager', 'roseGoldFoil')
),
ins_auth as (
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  )
  select
    p.id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    p.email,
    crypt('sortseed-pw', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb
  from people p
  returning id
)
insert into cards (
  id, owner_user_id, context,
  company_name, job_title, department,
  headline, target_role, education,
  full_name, location, material_id, style
)
select
  gen_random_uuid(),
  p.id,
  p.context,
  case when p.context = 'employed'  then p.org  end,
  case when p.context = 'employed'  then p.role end,
  case when p.context = 'employed'  then 'General' end,
  case when p.context = 'jobSeeker' then p.org  end,
  case when p.context = 'jobSeeker' then p.role end,
  case when p.context = 'jobSeeker' then 'Portfolio linked' end,
  p.full_name,
  'Seattle, WA',
  p.material,
  jsonb_build_object('templateId', 'pierceAndPierce')
from people p
-- force ins_auth to execute even though cards doesn't read from it
where (select count(*) from ins_auth) = 6;


-- ============================================================
-- STATEMENT 3 -- file those cards into YOUR rolodex, unsorted
-- ============================================================
insert into contacts (
  id, owner_user_id, source_card_id, folder_id,
  starred, note, collected_at, sorted_at
)
select
  gen_random_uuid(),
  (select id from users where email = '7h74s8d5zp@privaterelay.appleid.com'),
  c.id,
  (select f.id from folders f
     where f.owner_user_id = (select id from users where email = '7h74s8d5zp@privaterelay.appleid.com')
       and f.is_active
     limit 1),
  false,
  null,
  now(),   -- collected today
  null     -- <-- UNSORTED: shows in /sort
from cards c
join users u on u.id = c.owner_user_id
where u.email like '%@sortseed.test';


-- ============================================================
-- VERIFY -- the stack you should now see in /sort
-- ============================================================
select cd.full_name, cd.material_id, c.collected_at, c.sorted_at
from contacts c
join cards cd on cd.id = c.source_card_id
where c.owner_user_id = (select id from users where email = '7h74s8d5zp@privaterelay.appleid.com')
  and c.sorted_at is null
order by c.collected_at desc;


-- ============================================================
-- After running: fully quit & reopen the app so AuthProvider re-fetches
-- from the DB. The Rolodex banner should read "Sort 6 new connections".
--
-- Reset after swiping (no re-seed needed):
--   update contacts set sorted_at = null, starred = false, note = null
--   where owner_user_id = (select id from users where email = '7h74s8d5zp@privaterelay.appleid.com')
--     and source_card_id in (
--       select c.id from cards c join users u on u.id = c.owner_user_id
--       where u.email like '%@sortseed.test');
--
-- Tear down: run STATEMENT 1 again, then
--   delete from contacts
--   where owner_user_id = (select id from users where email = '7h74s8d5zp@privaterelay.appleid.com')
--     and source_card_id is null;
-- ============================================================
