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

require_text() {
  path="$1"
  text="$2"
  description="$3"
  if [ -f "$path" ] && grep -Fq -- "$text" "$path"; then
    pass "$description"
  else
    fail "$description (expected text in $path: $text)"
  fi
}

printf '%s\n' 'DSH Engineering Stack - foundation acceptance contract'

require_file 'specs/stack.spec.yaml' 'stack specification exists'
require_file 'contracts/runtime.contract.yaml' 'runtime contract exists'
require_file 'manifests/versions.yaml' 'pinned version manifest exists'
require_file 'package.json' 'root package manifest exists'
require_text 'package.json' '"@deepseek-ai/dsh": "0.1.0-rc.6"' 'DSH runtime is exactly pinned to published rc.6'
require_text 'manifests/versions.yaml' 'version: "0.1.0-rc.6"' 'version manifest pins published rc.6'
require_text 'package.json' '"packageManager": "pnpm@11.7.0"' 'package manager is exactly pinned'
require_file 'profiles/engineering/package.json' 'engineering profile manifest exists'
require_text 'profiles/engineering/package.json' '"@deepseek-ai/dsh-base"' 'engineering profile includes DSH base bundle'
require_text 'profiles/engineering/package.json' '"@deepseek-ai/dsh-web-app"' 'engineering profile includes official Web UI bundle'
require_file 'profiles/engineering/cordis.patch.yml' 'engineering profile patch exists'
require_file 'profiles/engineering/pnpm-workspace.yaml' 'engineering profile pnpm settings exist'
require_executable 'scripts/bootstrap' 'bootstrap entrypoint exists and is executable'
require_text 'scripts/bootstrap' 'pnpm view "@deepseek-ai/dsh@$EXPECTED_DSH" version' 'bootstrap verifies pinned DSH exists in registry before install'
require_executable 'scripts/doctor' 'doctor entrypoint exists and is executable'
require_executable 'bin/dsh-engineering' 'canonical DSH engineering launcher exists and is executable'
require_file 'AGENTS.md' 'repository engineering governance exists'

if [ "$failures" -ne 0 ]; then
  printf '\n%d acceptance contract(s) failing. This is expected during RED.\n' "$failures" >&2
  exit 1
fi

printf '\nAll foundation acceptance contracts pass.\n'
