-- Mirror auth.users into public.users on signup.
--
-- public.users.id is a FK onto auth.users, but nothing was populating it, so the
-- first cards insert after a fresh signup would fail its foreign key. Supabase
-- only ever writes to auth.users; keeping public.users in step is the app's job.
--
-- This runs as a trigger rather than a client-side insert because the RLS policy
-- on public.users deliberately has no INSERT policy -- the row is created by the
-- auth flow, not by the client. See the note in the Phase 1 RLS migration.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
-- Empty search_path: a SECURITY DEFINER function runs with the owner's rights,
-- so unqualified names must not be resolvable via a caller-controlled path.
-- Every reference below is schema-qualified for this reason.
set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (
    new.id,
    -- auth.users.email is nullable for phone/anonymous signups, but
    -- public.users.email is not null. Fall back to a stable synthetic address
    -- so those signup paths do not hard-fail at the trigger.
    coalesce(new.email, new.id::text || '@placeholder.lynx')
  )
  -- Signup is not guaranteed to fire exactly once (retries, provider linking,
  -- backfills). Make the mirror idempotent instead of raising on conflict,
  -- which would surface to the user as a failed signup.
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Keep the mirrored email in step when a user changes it via auth.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email and new.email is not null then
    update public.users
       set email = new.email
     where id = new.id;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  execute function public.handle_user_email_change();

-- ============================================================
-- Backfill any auth.users rows that predate this trigger.
-- ============================================================
insert into public.users (id, email)
select au.id, coalesce(au.email, au.id::text || '@placeholder.lynx')
from auth.users au
on conflict (id) do nothing;
