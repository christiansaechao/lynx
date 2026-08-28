-- Storage bucket for the Master QR target: a rendered PNG of the card's
-- front + back, stacked. The back-of-card Master QR encodes the public URL
-- of this object, so a recruiter scanning it with a stock camera lands on
-- the image and can save it straight to their photo gallery -- no app, no
-- account, no web page (see docs/PRODUCT_REQUIREMENTS.md, MOCKUP_BRIEF.md
-- §7.5). The URL is also mirrored onto cards.master_qr_asset_url.
--
-- One object per card at a fixed path (`<cardId>.png`), overwritten on
-- every card edit, so the public URL is stable and the QR never has to
-- change once printed/screenshotted.

insert into storage.buckets (id, name, public)
values ('card-snapshots', 'card-snapshots', true)
on conflict (id) do nothing;

-- Public read: the whole point is an unauthenticated scanner fetching it.
create policy "card_snapshots_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'card-snapshots');

-- Owner-only write. The object name is `<cardId>.png`; a user may write it
-- only if that card row is theirs. `split_part(name, '.', 1)` strips the
-- extension back to the card id for the ownership check.
create policy "card_snapshots_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'card-snapshots'
    and exists (
      select 1 from public.cards
      where cards.id = split_part(storage.objects.name, '.', 1)::uuid
        and cards.owner_user_id = auth.uid()
    )
  );

create policy "card_snapshots_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'card-snapshots'
    and exists (
      select 1 from public.cards
      where cards.id = split_part(storage.objects.name, '.', 1)::uuid
        and cards.owner_user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'card-snapshots'
    and exists (
      select 1 from public.cards
      where cards.id = split_part(storage.objects.name, '.', 1)::uuid
        and cards.owner_user_id = auth.uid()
    )
  );
