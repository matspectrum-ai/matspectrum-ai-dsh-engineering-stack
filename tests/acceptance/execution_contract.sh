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

printf '%s\n' 'DSH Engineering Stack - Phase 2 execution capability contract'

require_file 'specs/execution-capabilities.spec.yaml' 'execution specification exists'
require_file 'contracts/execution.contract.yaml' 'execution contract exists'
require_file 'agent-presets/matspectrum-engineering/agent.cordis.yml' 'canonical engineering agent preset exists'
require_file 'agent-presets/matspectrum-engineering/preset.yml' 'canonical engineering preset metadata exists'

require_text 'profiles/engineering/cordis.patch.yml' "name: '@deepseek-ai/dsh-terminal'" 'profile mounts terminal registry'
require_text 'profiles/engineering/cordis.patch.yml' "name: '@deepseek-ai/dsh-terminal-bash'" 'profile mounts terminal bash backend'
require_text 'profiles/engineering/cordis.patch.yml' 'default: matspectrum-engineering' 'profile selects canonical engineering preset by default'
require_text 'profiles/engineering/cordis.patch.yml' 'includeUserRoot: true' 'profile keeps DSH user preset root enabled'

require_text 'agent-presets/matspectrum-engineering/agent.cordis.yml' "name: '@deepseek-ai/dsh-tool-bash'" 'canonical preset retains one-shot bash'
require_text 'agent-presets/matspectrum-engineering/agent.cordis.yml' "name: '@deepseek-ai/dsh-tool-jobs'" 'canonical preset retains background job controls'
require_text 'agent-presets/matspectrum-engineering/agent.cordis.yml' "name: '@deepseek-ai/dsh-tool-terminal'" 'canonical preset exposes persistent terminal tools'
require_text 'agent-presets/matspectrum-engineering/agent.cordis.yml' "name: '@deepseek-ai/dsh-tool-ralph'" 'canonical preset retains Ralph orchestration'
require_text 'agent-presets/matspectrum-engineering/agent.cordis.yml' "name: '@deepseek-ai/dsh-tool-workflow'" 'canonical preset retains workflow orchestration'
require_text 'agent-presets/matspectrum-engineering/agent.cordis.yml' "name: '@deepseek-ai/dsh-skill-filesystem'" 'canonical preset retains filesystem Skills'

require_text 'scripts/bootstrap' '.agent-presets/matspectrum-engineering' 'bootstrap materializes canonical engineering preset'
require_text 'scripts/doctor' 'gh auth status' 'doctor checks GitHub CLI authentication separately'
require_text 'scripts/doctor' 'supabase' 'doctor has Supabase capability probe'
require_text 'scripts/doctor' 'vercel' 'doctor has Vercel capability probe'

if [ "$failures" -ne 0 ]; then
  printf '\n%d Phase 2 contract(s) failing. Expected while RED.\n' "$failures" >&2
  exit 1
fi

printf '\nAll Phase 2 execution contracts pass.\n'
