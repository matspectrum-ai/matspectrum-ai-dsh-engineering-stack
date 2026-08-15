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
require_file 'specs/omniroute-provider.spec.yaml' 'OmniRoute provider specification exists'
require_file 'contracts/provider.contract.yaml' 'provider contract exists'
require_file 'agent-presets/matspectrum-engineering/agent.cordis.yml' 'canonical engineering agent preset exists'
require_file 'agent-presets/matspectrum-engineering/preset.yml' 'canonical engineering preset metadata exists'

require_text 'profiles/engineering/cordis.patch.yml' "name: '@deepseek-ai/dsh-terminal'" 'profile mounts terminal registry'
require_text 'profiles/engineering/cordis.patch.yml' "name: '@deepseek-ai/dsh-terminal-bash'" 'profile mounts terminal bash backend'
require_text 'profiles/engineering/cordis.patch.yml' 'default: matspectrum-engineering' 'profile selects canonical engineering preset by default'
require_text 'profiles/engineering/cordis.patch.yml' 'includeUserRoot: true' 'profile keeps DSH user preset root enabled'

# Loader entries in a user-owned preset resolve from the profile runtime, not
# merely from the repository DSH installation. These exact dependencies are a
# runtime contract: dump-config alone does not prove that session creation can
# import them.
require_text 'profiles/engineering/package.json' '"@deepseek-ai/dsh-tool-terminal"' 'profile declares terminal tool loader dependency'
require_text 'profiles/engineering/package.json' '"@deepseek-ai/dsh-terminal"' 'profile declares terminal registry loader dependency'
require_text 'profiles/engineering/package.json' '"@deepseek-ai/dsh-terminal-bash"' 'profile declares Bash PTY backend loader dependency'
require_text 'scripts/bootstrap' 'installing engineering profile runtime dependencies' 'bootstrap installs profile-local loader dependencies'
require_text 'scripts/doctor' 'profile runtime dependency' 'doctor verifies profile-local loader resolution'

require_text 'profiles/engineering/cordis.patch.yml' 'provider: omniroute' 'profile selects OmniRoute as default provider'
require_text 'profiles/engineering/cordis.patch.yml' 'model: auto/best-coding' 'profile selects auto/best-coding as default model'
require_text 'profiles/engineering/cordis.patch.yml' 'apiKeyEnv: OMNIROUTE_API_KEY' 'profile references OmniRoute credential by environment name only'
require_text 'profiles/engineering/cordis.patch.yml' 'api: openai-completions' 'profile declares OpenAI-compatible protocol for OmniRoute'
require_text 'profiles/engineering/cordis.patch.yml' 'baseURL: http://127.0.0.1:20128/v1' 'profile keeps OmniRoute traffic on localhost'
require_text 'profiles/engineering/cordis.patch.yml' 'id: auto/coding:reliable' 'profile exposes reliable coding fallback route'

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
require_text 'scripts/doctor' 'OMNIROUTE_API_KEY' 'doctor checks OmniRoute credential reference'
require_text 'scripts/doctor' '127.0.0.1:20128' 'doctor checks local OmniRoute endpoint'
require_text 'scripts/doctor' '/v1/models' 'doctor validates OmniRoute model catalog endpoint'
require_text 'scripts/doctor' 'auto/best-coding' 'doctor verifies the default coding route is advertised'

if [ "$failures" -ne 0 ]; then
  printf '\n%d Phase 2 contract(s) failing. Expected while RED.\n' "$failures" >&2
  exit 1
fi

printf '\nAll Phase 2 execution contracts pass.\n'
