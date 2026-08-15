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

# Anti-speculation gates added after real Phase 3 E2E exercises.
require_text '.agents/skills/problem-analysis/SKILL.md' 'Do not invent requirements, defaults, status codes, response schemas, authentication policy, dependencies, observability signals, or failure behavior.' 'problem analysis explicitly forbids invented engineering facts'
require_text '.agents/skills/specification-driven-development/SKILL.md' 'A specification must not turn an unresolved unknown into a requirement, acceptance criterion, edge case, failure mode, security rule, observability signal, or rollback behavior.' 'SDD forbids promoting unknowns into normative requirements'
require_text '.agents/skills/specification-driven-development/SKILL.md' 'If evidence is insufficient, keep the field unresolved or omit it and record the decision as an unknown.' 'SDD defines safe behavior when evidence is insufficient'
require_text '.agents/skills/specification-driven-development/SKILL.md' 'An unresolved or pending decision is not a non-goal.' 'SDD forbids converting pending decisions into scope exclusions'
require_text '.agents/skills/specification-driven-development/SKILL.md' 'Do not mark a specification implementation-ready while blocking unknowns remain unresolved.' 'SDD requires readiness to reflect blocking unknowns'
require_text '.agents/skills/test-driven-development/SKILL.md' 'Do not invent the current system response merely to describe RED.' 'TDD forbids invented baseline behavior'
require_text '.agents/skills/test-driven-development/SKILL.md' 'If the baseline is unknown, describe RED as the specified assertion failing for the missing behavior and defer the exact observed status/body until the test is actually run.' 'TDD defines evidence-safe RED planning'
require_text '.agents/skills/test-driven-development/SKILL.md' 'Do not invent a test language, framework, runner, helper, file name, package manager, or command when the project test stack is unknown.' 'TDD forbids invented test harness/toolchain'
require_text '.agents/skills/test-driven-development/SKILL.md' 'Describe planned tests behaviorally until repository evidence identifies the concrete test harness.' 'TDD keeps evidence-starved plans implementation-neutral'
require_text '.agents/skills/verification/SKILL.md' 'Never classify security, operational, compatibility, data-loss, or rollback risk as zero/none without direct evidence.' 'verification forbids unsupported zero-risk claims'
require_text '.agents/skills/verification/SKILL.md' 'Do not invent verification commands, package-manager scripts, scanners, CI jobs, or tool names when the repository toolchain is unknown.' 'verification forbids invented verification tooling'
require_text '.agents/skills/verification/SKILL.md' 'Describe the evidence action abstractly and mark the concrete command UNRESOLVED until discovered.' 'verification keeps concrete commands evidence-backed'
require_text 'agent-presets/matspectrum-engineering/agent.cordis.yml' 'Never invent engineering requirements or present assumptions as facts.' 'persona enforces anti-speculation at the top level'
require_text 'agent-presets/matspectrum-engineering/agent.cordis.yml' 'Pending decisions remain unknowns, not requirements, non-goals, test harness choices, or verification commands.' 'persona prevents residual scope/toolchain speculation'

# Explicit skill-preflight gates added after E2E #3. The user explicitly
# requested four skills in order; the model loaded only two, started the task,
# and then incorrectly claimed no requested skill was unavailable.
require_text 'specs/skills-library.spec.yaml' 'every-requested-skill-has-successful-skill-tool-result' 'spec defines successful explicit skill preflight'
require_text 'contracts/skills.contract.yaml' 'no requested skill may be silently skipped' 'contract forbids silently skipped explicitly requested skills'
require_text 'contracts/skills.contract.yaml' 'no loaded claim without successful matching tool evidence' 'contract makes loaded-skill reporting evidence-backed'
require_text 'agent-presets/matspectrum-engineering/agent.cordis.yml' 'When the user explicitly names Skills to load, treat that list as a hard preflight checklist.' 'persona defines explicit requested Skills as hard preflight'
require_text 'agent-presets/matspectrum-engineering/agent.cordis.yml' 'Do not begin substantive analysis, planning, coding, or explanation until every requested Skill has either loaded successfully or returned an explicit tool error.' 'persona blocks task work until requested Skill calls resolve'
require_text 'agent-presets/matspectrum-engineering/agent.cordis.yml' 'Never claim that a Skill was loaded, available, or unavailable unless the corresponding skill tool result directly proves that claim.' 'persona forbids unsupported Skill-load status claims'
require_text 'agent-presets/matspectrum-engineering/agent.cordis.yml' 'If any requested Skill fails to load, stop before task execution and report the exact failed Skill and tool error.' 'persona defines fail-closed explicit Skill behavior'

if [ "$failures" -ne 0 ]; then
  printf '\n%d Phase 3 contract(s) failing.\n' "$failures" >&2
  exit 1
fi

printf '\nAll Phase 3 skills contracts pass.\n'
