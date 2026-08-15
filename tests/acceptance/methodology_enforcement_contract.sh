#!/bin/sh
set -eu

failures=0
pass() { printf 'PASS: %s\n' "$1"; }
fail() { printf 'FAIL: %s\n' "$1" >&2; failures=$((failures + 1)); }

require_file() {
  path=$1
  description=$2
  if [ -f "$path" ]; then pass "$description"; else fail "$description (missing: $path)"; fi
}

require_text() {
  path=$1
  text=$2
  description=$3
  if [ -f "$path" ] && grep -Fq -- "$text" "$path"; then
    pass "$description"
  else
    fail "$description (expected text in $path: $text)"
  fi
}

printf '%s\n' 'DSH Engineering Stack - deterministic methodology enforcement contract'

require_file 'specs/methodology-enforcement.spec.yaml' 'methodology enforcement specification exists'
require_file 'contracts/methodology-enforcement.contract.yaml' 'methodology enforcement contract exists'
require_file 'tests/methodology_guard.test.mjs' 'methodology guard behavior tests exist'
require_file 'profiles/engineering/plugins/methodology-guard.mjs' 'native methodology guard plugin exists'

require_text 'profiles/engineering/cordis.patch.yml' './plugins/methodology-guard.mjs' 'engineering profile mounts the native methodology guard'
require_text 'profiles/engineering/plugins/methodology-guard.mjs' "agent/pre-step" 'plugin listens to agent/pre-step'
require_text 'profiles/engineering/plugins/methodology-guard.mjs' "llm/stream" 'plugin suppresses uncommitted methodology prose at llm/stream'
require_text 'profiles/engineering/plugins/methodology-guard.mjs' "tools/pre-execute" 'plugin gates tools/pre-execute'
require_text 'profiles/engineering/plugins/methodology-guard.mjs' "tools/result" 'plugin observes authoritative tools/result'
require_text 'profiles/engineering/plugins/methodology-guard.mjs' "agent/turn-stopping" 'plugin enforces turn completion gate'
require_text 'profiles/engineering/plugins/methodology-guard.mjs' "engineering_commit" 'plugin registers engineering_commit tool'
require_text 'scripts/bootstrap' 'methodology-guard.mjs' 'bootstrap materializes methodology guard'
require_text 'scripts/bootstrap' 'managed-skills.txt' 'bootstrap materializes runtime managed-Skills manifest'
require_text 'scripts/doctor' 'methodology-guard.mjs' 'doctor validates methodology guard runtime state'
require_text 'scripts/doctor' 'managed-skills.txt' 'doctor validates runtime managed-Skills manifest'

if [ -f profiles/engineering/plugins/methodology-guard.mjs ]; then
  if node --test tests/methodology_guard.test.mjs; then
    pass 'methodology guard behavior tests pass'
  else
    fail 'methodology guard behavior tests pass'
  fi
else
  fail 'methodology guard behavior tests pass (plugin missing)'
fi

if [ "$failures" -ne 0 ]; then
  printf '\n%d methodology enforcement contract(s) failing.\n' "$failures" >&2
  exit 1
fi

printf '\nAll deterministic methodology enforcement contracts pass.\n'
