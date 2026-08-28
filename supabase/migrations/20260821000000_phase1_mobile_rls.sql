-- Phase 1 RLS: owner-only writes everywhere, public authenticated read on
-- cards/links (required for the scan/NFC-tap collect flow). folders and
-- contacts are private to the owner in both directions.
--
-- Note on future B2B: when companies/company_members land, admin write
-- access can be added as an additional OR'd policy on cards/links
-- (e.g. `USING (auth.uid() = owner_user_id OR is_company_admin(...))`)
-- without touching these owner-only policies.

alter table users enable row level security;
alter table cards enable row level security;
alter table links enable row level security;
alter table folders enable row level security;
alter table contacts enable row level security;

-- ============================================================
-- users
-- ============================================================
create policy "users_select_own"
  on users for select
  to authenticated
  using (auth.uid() = id);

create policy "users_update_own"
  on users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Row created via auth trigger / service role, not directly by the client.

-- ============================================================
-- cards
-- ============================================================
create policy "cards_select_any_authenticated"
  on cards for select
  to authenticated
  using (true);

create policy "cards_insert_own"
  on cards for insert
  to authenticated
  with check (auth.uid() = owner_user_id);

create policy "cards_update_own"
  on cards for update
  to authenticated
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy "cards_delete_own"
  on cards for delete
  to authenticated
  using (auth.uid() = owner_user_id);

-- ============================================================
-- links
-- ============================================================
create policy "links_select_any_authenticated"
  on links for select
  to authenticated
  using (true);

create policy "links_insert_own"
  on links for insert
  to authenticated
  with check (
    exists (
      select 1 from cards
      where cards.id = links.card_id
        and cards.owner_user_id = auth.uid()
    )
  );

create policy "links_update_own"
  on links for update
  to authenticated
  using (
    exists (
      select 1 from cards
      where cards.id = links.card_id
        and cards.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from cards
      where cards.id = links.card_id
        and cards.owner_user_id = auth.uid()
    )
  );

create policy "links_delete_own"
  on links for delete
  to authenticated
  using (
    exists (
      select 1 from cards
      where cards.id = links.card_id
        and cards.owner_user_id = auth.uid()
    )
  );

-- ============================================================
-- folders (private, owner-only in both directions)
-- ============================================================
create policy "folders_select_own"
  on folders for select
  to authenticated
  using (auth.uid() = owner_user_id);

create policy "folders_insert_own"
  on folders for insert
  to authenticated
  with check (auth.uid() = owner_user_id);

create policy "folders_update_own"
  on folders for update
  to authenticated
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy "folders_delete_own"
  on folders for delete
  to authenticated
  using (auth.uid() = owner_user_id);

-- ============================================================
-- contacts (private, owner-only in both directions)
-- ============================================================
create policy "contacts_select_own"
  on contacts for select
  to authenticated
  using (auth.uid() = owner_user_id);

create policy "contacts_insert_own"
  on contacts for insert
  to authenticated
  with check (auth.uid() = owner_user_id);

create policy "contacts_update_own"
  on contacts for update
  to authenticated
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy "contacts_delete_own"
  on contacts for delete
  to authenticated
  using (auth.uid() = owner_user_id);
