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
require_file 'manifests/managed-skills.txt' 'managed skills manifest exists'

skill_count=0
while IFS= read -r skill || [ -n "$skill" ]; do
  [ -n "$skill" ] || continue
  skill_count=$((skill_count + 1))

  case "$skill" in
    *[!a-z0-9-]*|'')
      fail "managed skill name is kebab-case: $skill"
      continue
      ;;
    *) pass "managed skill name is kebab-case: $skill" ;;
  esac

  path=".agents/skills/$skill/SKILL.md"
  require_file "$path" "canonical skill exists: $skill"
  require_text "$path" '---' "skill has YAML frontmatter delimiter: $skill"
  require_text "$path" "name: $skill" "skill frontmatter name matches directory: $skill"
  require_text "$path" 'description:' "skill has required description: $skill"
done < manifests/managed-skills.txt

if [ "$skill_count" -eq 14 ]; then
  pass 'managed skills manifest contains exactly 14 Phase 3 skills'
else
  fail "managed skills manifest expected 14 entries, found $skill_count"
fi

if grep -R -n '/home/' .agents/skills >/dev/null 2>&1; then
  fail 'canonical skills do not contain machine-specific /home paths'
else
  pass 'canonical skills contain no machine-specific /home paths'
fi

require_text 'scripts/bootstrap' 'DSH_AGENTS_HOME' 'bootstrap supports explicit Agents home'
require_text 'scripts/bootstrap' 'manifests/managed-skills.txt' 'bootstrap reads canonical managed skills manifest'
require_text 'scripts/bootstrap' 'sync_skill_bundle' 'bootstrap materializes managed skill bundles'
require_text 'scripts/bootstrap' '.agents/skills' 'bootstrap uses repository portable skill root'
require_text 'scripts/doctor' 'DSH_AGENTS_HOME' 'doctor supports explicit Agents home'
require_text 'scripts/doctor' 'check_managed_skills' 'doctor validates managed skill lifecycle'
require_text 'scripts/doctor' '.agents/skills' 'doctor validates repository portable skill root'
require_text 'agent-presets/matspectrum-engineering/agent.cordis.yml' 'Brazilian Portuguese' 'engineering persona defaults user responses to Brazilian Portuguese'
require_text 'agent-presets/matspectrum-engineering/agent.cordis.yml' 'load the relevant engineering skills' 'engineering persona directs non-trivial work through relevant skills'

# Anti-speculation gates added after the first real Phase 3 E2E exposed a
# methodology defect: the agent loaded the right skills but invented health
# endpoint status codes, auth policy, metrics and dependency behavior without
# repository or user evidence.
require_text '.agents/skills/problem-analysis/SKILL.md' 'Do not invent requirements, defaults, status codes, response schemas, authentication policy, dependencies, observability signals, or failure behavior.' 'problem analysis explicitly forbids invented engineering facts'
require_text '.agents/skills/specification-driven-development/SKILL.md' 'A specification must not turn an unresolved unknown into a requirement, acceptance criterion, edge case, failure mode, security rule, observability signal, or rollback behavior.' 'SDD forbids promoting unknowns into normative requirements'
require_text '.agents/skills/specification-driven-development/SKILL.md' 'If evidence is insufficient, keep the field unresolved or omit it and record the decision as an unknown.' 'SDD defines safe behavior when evidence is insufficient'
require_text '.agents/skills/test-driven-development/SKILL.md' 'Do not invent the current system response merely to describe RED.' 'TDD forbids invented baseline behavior'
require_text '.agents/skills/test-driven-development/SKILL.md' 'If the baseline is unknown, describe RED as the specified assertion failing for the missing behavior and defer the exact observed status/body until the test is actually run.' 'TDD defines evidence-safe RED planning'
require_text '.agents/skills/verification/SKILL.md' 'Never classify security, operational, compatibility, data-loss, or rollback risk as zero/none without direct evidence.' 'verification forbids unsupported zero-risk claims'
require_text 'agent-presets/matspectrum-engineering/agent.cordis.yml' 'Never invent engineering requirements or present assumptions as facts.' 'persona enforces anti-speculation at the top level'

if [ "$failures" -ne 0 ]; then
  printf '\n%d Phase 3 contract(s) failing.\n' "$failures" >&2
  exit 1
fi

printf '\nAll Phase 3 skills contracts pass.\n'
