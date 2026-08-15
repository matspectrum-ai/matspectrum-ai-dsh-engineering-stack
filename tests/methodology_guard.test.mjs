import test from 'node:test'
import assert from 'node:assert/strict'

import {
  extractRequestedSkills,
  nextExpectedSkill,
  preToolDecisionForState,
  advanceSkillState,
  validateEngineeringCommit,
  renderEngineeringCommit,
} from '../profiles/engineering/plugins/methodology-guard.mjs'

const managed = [
  'problem-analysis',
  'specification-driven-development',
  'contract-driven-development',
  'test-driven-development',
  'verification',
]

const prompt = `
Use a ferramenta de Skills e carregue explicitamente, nesta ordem:
1. problem-analysis
2. specification-driven-development
3. test-driven-development
4. verification
Depois planeje "Adicionar um endpoint GET /health a uma API existente".
`

test('extractRequestedSkills preserves textual order and removes duplicates', () => {
  const text = `${prompt}\nverification\nproblem-analysis`
  assert.deepEqual(extractRequestedSkills(text, managed), [
    'problem-analysis',
    'specification-driven-development',
    'test-driven-development',
    'verification',
  ])
})

test('extractRequestedSkills does not activate from bare names without Skill intent', () => {
  assert.deepEqual(
    extractRequestedSkills('Compare problem-analysis com verification.', managed),
    [],
  )
})

test('preflight denies other tools and out-of-order Skills', () => {
  const state = {
    requiredSkills: ['problem-analysis', 'verification'],
    completedSkills: [],
  }

  assert.equal(nextExpectedSkill(state), 'problem-analysis')
  assert.equal(preToolDecisionForState(state, 'bash', {}).kind, 'deny')
  assert.match(preToolDecisionForState(state, 'skill', { name: 'verification' }).reason, /problem-analysis/)
  assert.deepEqual(preToolDecisionForState(state, 'skill', { name: 'problem-analysis' }), { kind: 'allow' })
})

test('successful expected Skill result advances exactly once', () => {
  const state = {
    requiredSkills: ['problem-analysis', 'verification'],
    completedSkills: [],
  }

  assert.equal(advanceSkillState(state, { name: 'skill', arguments: { name: 'problem-analysis' } }, { isError: true }), false)
  assert.deepEqual(state.completedSkills, [])

  assert.equal(advanceSkillState(state, { name: 'skill', arguments: { name: 'problem-analysis' } }, { isError: false }), true)
  assert.deepEqual(state.completedSkills, ['problem-analysis'])

  assert.equal(advanceSkillState(state, { name: 'skill', arguments: { name: 'problem-analysis' } }, { isError: false }), false)
  assert.deepEqual(state.completedSkills, ['problem-analysis'])
  assert.equal(nextExpectedSkill(state), 'verification')
})

test('engineering commit rejects user evidence absent from activating prompt', async () => {
  await assert.rejects(
    validateEngineeringCommit({
      facts: [{ id: 'status', source: 'user', evidence: { quote: '200 OK' } }],
      unknowns: [],
      objectives: [],
      requirements: ['status'],
      acceptance_criteria: [],
      non_goals: [],
      planned_tests: [],
      red: { kind: 'planned', target_test_indexes: [], observed_fact_ids: [] },
      verification: [],
    }, {
      activatingUserText: prompt,
      workspace: process.cwd(),
      toolResults: [],
    }),
    /user evidence.*activating user message/i,
  )
})

test('engineering commit accepts exact user evidence and renders no invented API values', async () => {
  const validated = await validateEngineeringCommit({
    facts: [
      { id: 'endpoint', source: 'user', evidence: { quote: 'GET /health' } },
    ],
    unknowns: [
      'success_status_code',
      'response_schema',
      'authentication_policy',
      'dependency_health_semantics',
      'test_harness',
    ],
    objectives: ['endpoint'],
    requirements: ['endpoint'],
    acceptance_criteria: ['endpoint'],
    non_goals: [],
    planned_tests: [
      {
        kind: 'contract',
        requirement_fact_ids: ['endpoint'],
        expected_fact_ids: ['endpoint'],
      },
    ],
    red: { kind: 'planned', target_test_indexes: [0], observed_fact_ids: [] },
    verification: [
      {
        kind: 'focused-test',
        criterion_fact_ids: ['endpoint'],
      },
    ],
  }, {
    activatingUserText: prompt,
    workspace: process.cwd(),
    toolResults: [],
  })

  const rendered = renderEngineeringCommit(validated)
  assert.match(rendered, /GET \/health/)
  assert.match(rendered, /success_status_code/)
  assert.doesNotMatch(rendered, /\b200\b/)
  assert.doesNotMatch(rendered, /\b404\b/)
  assert.doesNotMatch(rendered, /\b503\b/)
  assert.doesNotMatch(rendered, /status["']?\s*:\s*["']?OK/i)
})

test('engineering commit rejects unknown normative fact references', async () => {
  await assert.rejects(
    validateEngineeringCommit({
      facts: [{ id: 'endpoint', source: 'user', evidence: { quote: 'GET /health' } }],
      unknowns: [],
      objectives: [],
      requirements: ['missing'],
      acceptance_criteria: [],
      non_goals: [],
      planned_tests: [],
      red: { kind: 'planned', target_test_indexes: [], observed_fact_ids: [] },
      verification: [],
    }, {
      activatingUserText: prompt,
      workspace: process.cwd(),
      toolResults: [],
    }),
    /unknown fact reference.*missing/i,
  )
})

test('planned RED cannot claim observed evidence', async () => {
  await assert.rejects(
    validateEngineeringCommit({
      facts: [{ id: 'endpoint', source: 'user', evidence: { quote: 'GET /health' } }],
      unknowns: [],
      objectives: [],
      requirements: ['endpoint'],
      acceptance_criteria: [],
      non_goals: [],
      planned_tests: [],
      red: { kind: 'planned', target_test_indexes: [], observed_fact_ids: ['endpoint'] },
      verification: [],
    }, {
      activatingUserText: prompt,
      workspace: process.cwd(),
      toolResults: [],
    }),
    /planned RED.*observed/i,
  )
})

test('observed RED requires runtime-provenance facts', async () => {
  await assert.rejects(
    validateEngineeringCommit({
      facts: [{ id: 'endpoint', source: 'user', evidence: { quote: 'GET /health' } }],
      unknowns: [],
      objectives: [],
      requirements: ['endpoint'],
      acceptance_criteria: [],
      non_goals: [],
      planned_tests: [],
      red: { kind: 'observed', target_test_indexes: [], observed_fact_ids: ['endpoint'] },
      verification: [],
    }, {
      activatingUserText: prompt,
      workspace: process.cwd(),
      toolResults: [],
    }),
    /observed RED.*runtime/i,
  )
})
