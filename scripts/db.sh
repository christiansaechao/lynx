#!/usr/bin/env bash
#
# Supabase schema workflow for Lynx.
#
#   ./scripts/db.sh push    apply pending migrations to the linked project
#   ./scripts/db.sh types   regenerate shared/types/supabase.ts from the live schema
#   ./scripts/db.sh sync    push, then regenerate types (the usual one)
#   ./scripts/db.sh status  show which migrations are applied vs pending
#   ./scripts/db.sh new <name>   create a timestamped empty migration
#
# The CLI is run via npx so there is nothing to install globally.
#
# `push` needs the database password. The CLI caches it after the first
# `supabase link`, so it is normally only prompted for once per machine.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

PROJECT_REF="tzsheugwqnzhvajphctl"
TYPES_OUT="shared/types/supabase.ts"
SUPABASE="npx --yes supabase@latest"

# Generated types land in their own file. shared/types/database.ts is
# hand-written domain modelling that the app imports directly -- overwriting it
# with generated output would delete real code.

bold() { printf '\033[1m%s\033[0m\n' "$1"; }
fail() { printf '\033[31merror:\033[0m %s\n' "$1" >&2; exit 1; }

require_link() {
  if [[ ! -f supabase/config.toml ]]; then
    fail "supabase/config.toml missing -- run: npx supabase link --project-ref $PROJECT_REF"
  fi
}

cmd_push() {
  require_link
  bold "Applying migrations to $PROJECT_REF"
  $SUPABASE db push
}

cmd_types() {
  require_link
  bold "Generating types -> $TYPES_OUT"
  mkdir -p "$(dirname "$TYPES_OUT")"

  # Write via a temp file so an auth failure or partial download cannot leave a
  # truncated types file behind that then breaks every tsc run in the repo.
  local tmp
  tmp="$(mktemp)"
  trap 'rm -f "$tmp"' RETURN

  if ! $SUPABASE gen types typescript --project-id "$PROJECT_REF" --schema public > "$tmp"; then
    fail "type generation failed -- is the CLI logged in? (npx supabase login)"
  fi

  [[ -s "$tmp" ]] || fail "type generation produced an empty file; leaving $TYPES_OUT untouched"
  grep -q 'Database' "$tmp" || fail "output does not look like generated types; leaving $TYPES_OUT untouched"

  mv "$tmp" "$TYPES_OUT"
  printf 'wrote %s (%s lines)\n' "$TYPES_OUT" "$(wc -l < "$TYPES_OUT" | tr -d ' ')"
}

cmd_status() {
  require_link
  $SUPABASE migration list
}

cmd_new() {
  local name="${1:-}"
  [[ -n "$name" ]] || fail "usage: ./scripts/db.sh new <migration_name>"
  $SUPABASE migration new "$name"
}

case "${1:-sync}" in
  push)   cmd_push ;;
  types)  cmd_types ;;
  sync)   cmd_push && cmd_types ;;
  status) cmd_status ;;
  new)    shift; cmd_new "${1:-}" ;;
  *)      fail "unknown command '${1}' -- expected: push | types | sync | status | new" ;;
esac
