-- Records how a contact was captured (QR scan vs NFC tap), per
-- PRODUCT_REQUIREMENTS.md's capture flow. Nullable/defaulted so existing
-- rows (none yet in prod, but keeps the migration safe) don't break.
alter table contacts
  add column source text not null default 'qr' check (source in ('qr', 'nfc'));
