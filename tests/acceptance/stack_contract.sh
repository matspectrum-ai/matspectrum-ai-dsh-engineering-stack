#!/bin/sh
set -eu

failures=0

pass() {
  printf 'PASS: %s\n' "$1"
}

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  failures=$((failures + 1))
}

require_file() {
  path="$1"
  description="$2"
  if [ -f "$path" ]; then
    pass "$description"
  else
    fail "$description (missing: $path)"
  fi
}

require_executable() {
  path="$1"
  description="$2"
  if [ -x "$path" ]; then
    pass "$description"
  else
    fail "$description (missing or not executable: $path)"
  fi
}

printf '%s\n' 'DSH Engineering Stack - foundation acceptance contract'

require_file 'specs/stack.spec.yaml' 'stack specification exists'
require_file 'contracts/runtime.contract.yaml' 'runtime contract exists'
require_file 'manifests/versions.yaml' 'pinned version manifest exists'
require_file 'profiles/engineering/package.json' 'engineering profile manifest exists'
require_file 'profiles/engineering/cordis.patch.yml' 'engineering profile patch exists'
require_executable 'scripts/bootstrap' 'bootstrap entrypoint exists and is executable'
require_executable 'scripts/doctor' 'doctor entrypoint exists and is executable'
require_file 'AGENTS.md' 'repository engineering governance exists'

if [ "$failures" -ne 0 ]; then
  printf '\n%d acceptance contract(s) failing. This is expected during RED.\n' "$failures" >&2
  exit 1
fi

printf '\nAll foundation acceptance contracts pass.\n'
