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

printf '%s\n' 'DSH Engineering Stack - Phase 3 skills contract'

require_file 'specs/skills-library.spec.yaml' 'skills specification exists'
require_file 'contracts/skills.contract.yaml' 'skills contract exists'

skills='problem-analysis specification-driven-development contract-driven-development test-driven-development architecture debugging code-review security-review verification git-workflow api-design database-migrations production-readiness graph-engineering'

for skill in $skills; do
  path=".agents/skills/$skill/SKILL.md"
  require_file "$path" "canonical skill exists: $skill"
  require_text "$path" "name: $skill" "skill frontmatter name matches directory: $skill"
  require_text "$path" 'description:' "skill has required description: $skill"
done

require_text 'scripts/bootstrap' 'DSH_AGENTS_HOME' 'bootstrap supports explicit Agents home'
require_text 'scripts/bootstrap' '.agents/skills' 'bootstrap materializes repository canonical skills'
require_text 'scripts/doctor' 'DSH_AGENTS_HOME' 'doctor supports explicit Agents home'
require_text 'scripts/doctor' '.agents/skills' 'doctor validates managed Agents skills'
require_text 'agent-presets/matspectrum-engineering/agent.cordis.yml' 'Brazilian Portuguese' 'engineering persona defaults user responses to Brazilian Portuguese'

if [ "$failures" -ne 0 ]; then
  printf '\n%d Phase 3 contract(s) failing. Expected while RED.\n' "$failures" >&2
  exit 1
fi

printf '\nAll Phase 3 skills contracts pass.\n'
