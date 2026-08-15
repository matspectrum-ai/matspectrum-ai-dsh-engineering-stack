import { readFile, realpath, stat } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'matspectrum-methodology-guard'
export const inject = ['agents', 'llm', 'tools']

const ENGINEERING_COMMIT = 'engineering_commit'
const SKILL_TOOL = 'skill'
const IDENTIFIER_RE = /^[a-z][a-z0-9_-]*$/
const TEST_KINDS = new Set(['unit', 'component', 'contract', 'integration', 'acceptance', 'e2e', 'runtime-smoke'])
const VERIFICATION_KINDS = new Set([
  'focused-test',
  'regression-suite',
  'runtime-probe',
  'build',
  'typecheck',
  'lint',
  'diff-inspection',
  'security-scan',
  'custom',
])

function invariant(condition, message) {
  if (!condition) throw new Error(message)
}

function asObject(value, label) {
  invariant(value !== null && typeof value === 'object' && !Array.isArray(value), `${label} must be an object`)
  return value
}

function asString(value, label) {
  invariant(typeof value === 'string' && value.trim() !== '', `${label} must be a non-empty string`)
  return value
}

function asIdentifier(value, label) {
  const text = asString(value, label)
  invariant(IDENTIFIER_RE.test(text), `${label} must be a stable lowercase identifier`)
  return text
}

function asStringArray(value, label, { identifiers = false } = {}) {
  invariant(Array.isArray(value), `${label} must be an array`)
  return value.map((item, index) => identifiers
    ? asIdentifier(item, `${label}[${index}]`)
    : asString(item, `${label}[${index}]`))
}

function asIntegerArray(value, label) {
  invariant(Array.isArray(value), `${label} must be an array`)
  return value.map((item, index) => {
    invariant(Number.isInteger(item) && item >= 0, `${label}[${index}] must be a non-negative integer`)
    return item
  })
}

function blockText(block) {
  if (block && typeof block === 'object') {
    if ((block.type === 'text' || block.type === 'reasoning') && typeof block.text === 'string') return block.text
    try { return JSON.stringify(block) } catch { return '' }
  }
  return ''
}

function resultText(result) {
  if (!result || !Array.isArray(result.content)) return ''
  return result.content.map(blockText).filter(Boolean).join('\n')
}

function messageText(message) {
  if (!message || !Array.isArray(message.content)) return ''
  return message.content
    .filter((block) => block && block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text)
    .join('\n')
}

function pluginMessage(text, summary) {
  return Object.freeze({
    id: crypto.randomUUID(),
    role: 'user',
    content: Object.freeze([Object.freeze({ type: 'text', text })]),
    source: Object.freeze({
      kind: 'plugin',
      plugin: name,
      form: 'notice',
      summary: summary.slice(0, 120),
    }),
  })
}

function loadManagedSkills() {
  const manifestPath = fileURLToPath(new URL('../managed-skills.txt', import.meta.url))
  const text = readFileSync(manifestPath, 'utf8')
  const skills = text.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean)
  invariant(skills.length > 0, `managed Skills manifest is empty: ${manifestPath}`)
  for (const skill of skills) invariant(/^[a-z0-9-]+$/.test(skill), `invalid managed Skill name: ${skill}`)
  return skills
}

export function extractRequestedSkills(text, managedSkills) {
  if (typeof text !== 'string' || !/\bskills?\b/i.test(text)) return []
  const occurrences = []
  for (const skill of managedSkills) {
    let from = 0
    while (from < text.length) {
      const index = text.indexOf(skill, from)
      if (index < 0) break
      occurrences.push({ skill, index })
      from = index + skill.length
    }
  }
  occurrences.sort((a, b) => a.index - b.index)
  const seen = new Set()
  const ordered = []
  for (const { skill } of occurrences) {
    if (seen.has(skill)) continue
    seen.add(skill)
    ordered.push(skill)
  }
  return ordered
}

export function nextExpectedSkill(state) {
  if (!state || !Array.isArray(state.requiredSkills) || !Array.isArray(state.completedSkills)) return undefined
  return state.requiredSkills[state.completedSkills.length]
}

export function preToolDecisionForState(state, toolName, args) {
  const expected = nextExpectedSkill(state)
  if (expected === undefined) return { kind: 'delegate' }
  if (toolName !== SKILL_TOOL) {
    return {
      kind: 'deny',
      reason: `methodology preflight incomplete: load Skill "${expected}" before calling ${toolName}`,
    }
  }
  const requested = args && typeof args === 'object' ? args.name : undefined
  if (requested !== expected) {
    return {
      kind: 'deny',
      reason: `methodology preflight requires Skill "${expected}" next; received ${String(requested)}`,
    }
  }
  return { kind: 'allow' }
}

export function advanceSkillState(state, exec, result) {
  if (!state || !exec || !result || result.isError) return false
  if (exec.name !== SKILL_TOOL) return false
  const expected = nextExpectedSkill(state)
  const requested = exec.arguments && typeof exec.arguments === 'object' ? exec.arguments.name : undefined
  if (expected === undefined || requested !== expected) return false
  state.completedSkills.push(expected)
  return true
}

function keepMethodologyChunk(chunk, suppressedIndexes) {
  if (!chunk || typeof chunk !== 'object') return true
  if (chunk.type === 'block-start' && (chunk.blockType === 'text' || chunk.blockType === 'reasoning')) {
    suppressedIndexes.add(chunk.index)
    return false
  }
  if (chunk.type === 'text-delta' || chunk.type === 'reasoning-delta') return false
  if (chunk.type === 'block-end') {
    const suppressed = suppressedIndexes.has(chunk.index)
      || (chunk.block && (chunk.block.type === 'text' || chunk.block.type === 'reasoning'))
    if (suppressed) {
      suppressedIndexes.delete(chunk.index)
      return false
    }
  }
  return true
}

export function filterMethodologyChunks(chunks) {
  const suppressedIndexes = new Set()
  return chunks.filter((chunk) => keepMethodologyChunk(chunk, suppressedIndexes))
}

function filterMethodologyStream(stream) {
  return (async function* () {
    const suppressedIndexes = new Set()
    for await (const chunk of stream) {
      if (keepMethodologyChunk(chunk, suppressedIndexes)) yield chunk
    }
  })()
}

async function validateRepositoryFact(evidence, workspace, label) {
  const value = asObject(evidence, label)
  const relativePath = asString(value.path, `${label}.path`)
  const quote = asString(value.quote, `${label}.quote`)
  invariant(!path.isAbsolute(relativePath), `${label}.path must be workspace-relative`)

  let workspaceReal
  let targetReal
  try {
    workspaceReal = await realpath(workspace)
    targetReal = await realpath(path.resolve(workspaceReal, relativePath))
  } catch (error) {
    throw new Error(`${label} repository path cannot be resolved: ${error instanceof Error ? error.message : String(error)}`)
  }

  const inside = targetReal === workspaceReal || targetReal.startsWith(`${workspaceReal}${path.sep}`)
  invariant(inside, `${label} repository path escapes the workspace`)
  const targetStat = await stat(targetReal)
  invariant(targetStat.isFile(), `${label} repository path must resolve to a regular file`)
  const content = await readFile(targetReal, 'utf8')
  invariant(content.includes(quote), `${label} repository evidence quote was not found in ${relativePath}`)
  return { path: relativePath, quote }
}

function validateRuntimeFact(evidence, toolResults, label) {
  const value = asObject(evidence, label)
  const tool = asString(value.tool, `${label}.tool`)
  const quote = asString(value.quote, `${label}.quote`)
  const found = toolResults.some((entry) => entry.tool === tool && entry.text.includes(quote))
  invariant(found, `${label} runtime evidence was not captured from a successful same-turn tool result`)
  return { tool, quote }
}

function validateUserFact(evidence, activatingUserText, label) {
  const value = asObject(evidence, label)
  const quote = asString(value.quote, `${label}.quote`)
  invariant(activatingUserText.includes(quote), `${label} user evidence quote was not found in the activating user message`)
  return { quote }
}

function validateFactRefs(refs, label, facts) {
  const values = asStringArray(refs, label, { identifiers: true })
  for (const id of values) invariant(facts.has(id), `unknown fact reference in ${label}: ${id}`)
  return values
}

export async function validateEngineeringCommit(input, context) {
  const artifact = asObject(input, 'artifact')
  const activatingUserText = asString(context.activatingUserText, 'context.activatingUserText')
  const workspace = asString(context.workspace, 'context.workspace')
  const toolResults = Array.isArray(context.toolResults) ? context.toolResults : []

  invariant(Array.isArray(artifact.facts), 'artifact.facts must be an array')
  const facts = new Map()
  const normalizedFacts = []
  for (let index = 0; index < artifact.facts.length; index += 1) {
    const fact = asObject(artifact.facts[index], `artifact.facts[${index}]`)
    const id = asIdentifier(fact.id, `artifact.facts[${index}].id`)
    invariant(!facts.has(id), `duplicate fact id: ${id}`)
    const source = asString(fact.source, `artifact.facts[${index}].source`)
    invariant(source === 'user' || source === 'repository' || source === 'runtime', `invalid fact source for ${id}: ${source}`)

    let evidence
    if (source === 'user') evidence = validateUserFact(fact.evidence, activatingUserText, `fact ${id}`)
    else if (source === 'repository') evidence = await validateRepositoryFact(fact.evidence, workspace, `fact ${id}`)
    else evidence = validateRuntimeFact(fact.evidence, toolResults, `fact ${id}`)

    const normalized = { id, source, evidence }
    facts.set(id, normalized)
    normalizedFacts.push(normalized)
  }

  const unknowns = asStringArray(artifact.unknowns ?? [], 'artifact.unknowns', { identifiers: true })
  invariant(new Set(unknowns).size === unknowns.length, 'artifact.unknowns must not contain duplicates')

  const objectives = validateFactRefs(artifact.objectives ?? [], 'artifact.objectives', facts)
  const requirements = validateFactRefs(artifact.requirements ?? [], 'artifact.requirements', facts)
  const acceptanceCriteria = validateFactRefs(artifact.acceptance_criteria ?? [], 'artifact.acceptance_criteria', facts)
  const nonGoals = validateFactRefs(artifact.non_goals ?? [], 'artifact.non_goals', facts)

  invariant(Array.isArray(artifact.planned_tests), 'artifact.planned_tests must be an array')
  const plannedTests = artifact.planned_tests.map((raw, index) => {
    const item = asObject(raw, `artifact.planned_tests[${index}]`)
    const kind = asString(item.kind, `artifact.planned_tests[${index}].kind`)
    invariant(TEST_KINDS.has(kind), `invalid planned test kind at index ${index}: ${kind}`)
    return {
      kind,
      requirement_fact_ids: validateFactRefs(item.requirement_fact_ids ?? [], `artifact.planned_tests[${index}].requirement_fact_ids`, facts),
      expected_fact_ids: validateFactRefs(item.expected_fact_ids ?? [], `artifact.planned_tests[${index}].expected_fact_ids`, facts),
    }
  })

  const redRaw = asObject(artifact.red, 'artifact.red')
  const redKind = asString(redRaw.kind, 'artifact.red.kind')
  invariant(redKind === 'planned' || redKind === 'observed', `artifact.red.kind must be planned or observed`)
  const targetTestIndexes = asIntegerArray(redRaw.target_test_indexes ?? [], 'artifact.red.target_test_indexes')
  for (const index of targetTestIndexes) invariant(index < plannedTests.length, `artifact.red target test index out of range: ${index}`)
  const observedFactIds = validateFactRefs(redRaw.observed_fact_ids ?? [], 'artifact.red.observed_fact_ids', facts)
  if (redKind === 'planned') {
    invariant(observedFactIds.length === 0, 'planned RED cannot contain observed evidence')
  } else {
    invariant(observedFactIds.length > 0, 'observed RED requires runtime evidence')
    for (const id of observedFactIds) invariant(facts.get(id).source === 'runtime', `observed RED fact must use runtime provenance: ${id}`)
  }

  invariant(Array.isArray(artifact.verification), 'artifact.verification must be an array')
  const verification = artifact.verification.map((raw, index) => {
    const item = asObject(raw, `artifact.verification[${index}]`)
    const kind = asString(item.kind, `artifact.verification[${index}].kind`)
    invariant(VERIFICATION_KINDS.has(kind), `invalid verification kind at index ${index}: ${kind}`)
    const criterionFactIds = validateFactRefs(item.criterion_fact_ids ?? [], `artifact.verification[${index}].criterion_fact_ids`, facts)
    let concreteCommandFactId
    if (item.concrete_command_fact_id !== undefined) {
      concreteCommandFactId = asIdentifier(item.concrete_command_fact_id, `artifact.verification[${index}].concrete_command_fact_id`)
      invariant(facts.has(concreteCommandFactId), `unknown fact reference in verification command: ${concreteCommandFactId}`)
      const source = facts.get(concreteCommandFactId).source
      invariant(source === 'repository' || source === 'runtime', `verification command fact must use repository or runtime provenance: ${concreteCommandFactId}`)
    }
    return {
      kind,
      criterion_fact_ids: criterionFactIds,
      ...(concreteCommandFactId ? { concrete_command_fact_id: concreteCommandFactId } : {}),
    }
  })

  return {
    facts: normalizedFacts,
    unknowns,
    objectives,
    requirements,
    acceptance_criteria: acceptanceCriteria,
    non_goals: nonGoals,
    planned_tests: plannedTests,
    red: {
      kind: redKind,
      target_test_indexes: targetTestIndexes,
      observed_fact_ids: observedFactIds,
    },
    verification,
  }
}

function factText(fact) {
  if (fact.source === 'user') return fact.evidence.quote
  if (fact.source === 'repository') return fact.evidence.quote
  return fact.evidence.quote
}

function yamlScalar(value) {
  return JSON.stringify(String(value))
}

function renderFactList(ids, factMap, indent = '  ') {
  if (ids.length === 0) return `${indent}[]`
  return ids.map((id) => `${indent}- ${yamlScalar(factText(factMap.get(id)))}`).join('\n')
}

export function renderEngineeringCommit(artifact, options = {}) {
  const factMap = new Map(artifact.facts.map((fact) => [fact.id, fact]))
  const lines = []
  lines.push('## 1. Problem Analysis')
  lines.push('')
  lines.push('Fatos verificados:')
  if (artifact.facts.length === 0) lines.push('- nenhum fato normativo verificado')
  for (const fact of artifact.facts) {
    const locator = fact.source === 'repository'
      ? ` (${fact.evidence.path})`
      : fact.source === 'runtime'
        ? ` (${fact.evidence.tool})`
        : ''
    lines.push(`- [${fact.source}] ${factText(fact)}${locator}`)
  }
  lines.push('')
  lines.push('Unknowns explícitos:')
  if (artifact.unknowns.length === 0) lines.push('- nenhum')
  else for (const unknown of artifact.unknowns) lines.push(`- ${unknown}: UNRESOLVED`)

  lines.push('')
  lines.push('## 2. Especificação YAML mínima')
  lines.push('')
  lines.push('```yaml')
  lines.push('status: draft')
  lines.push('objectives:')
  lines.push(renderFactList(artifact.objectives, factMap))
  lines.push('requirements:')
  lines.push(renderFactList(artifact.requirements, factMap))
  lines.push('acceptance_criteria:')
  lines.push(renderFactList(artifact.acceptance_criteria, factMap))
  lines.push('non_goals:')
  lines.push(renderFactList(artifact.non_goals, factMap))
  lines.push('unknowns:')
  if (artifact.unknowns.length === 0) lines.push('  []')
  else for (const unknown of artifact.unknowns) lines.push(`  - ${unknown}`)
  lines.push('```')

  lines.push('')
  lines.push('## 3. Testes que devem ser escritos primeiro')
  lines.push('')
  if (artifact.planned_tests.length === 0) lines.push('- Nenhum teste concreto pode ser definido com a evidência atual.')
  artifact.planned_tests.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.kind}`)
    lines.push(`   - requisitos: ${item.requirement_fact_ids.length ? item.requirement_fact_ids.map((id) => factText(factMap.get(id))).join(' | ') : 'UNRESOLVED'}`)
    lines.push(`   - comportamento esperado: ${item.expected_fact_ids.length ? item.expected_fact_ids.map((id) => factText(factMap.get(id))).join(' | ') : 'UNRESOLVED'}`)
    lines.push('   - framework/arquivo/comando: UNRESOLVED')
  })

  lines.push('')
  lines.push('## 4. Estado RED')
  lines.push('')
  if (artifact.red.kind === 'planned') {
    lines.push('- classificação: PLANNED RED')
    lines.push(`- testes-alvo: ${artifact.red.target_test_indexes.length ? artifact.red.target_test_indexes.map((index) => index + 1).join(', ') : 'UNRESOLVED'}`)
    lines.push('- comportamento observado exato: UNVERIFIED até execução real do teste/probe')
  } else {
    lines.push('- classificação: OBSERVED RED')
    for (const id of artifact.red.observed_fact_ids) lines.push(`- evidência runtime: ${factText(factMap.get(id))}`)
  }

  lines.push('')
  lines.push('## 5. Verificação antes da conclusão')
  lines.push('')
  if (artifact.verification.length === 0) lines.push('- Nenhuma ação de verificação concreta está evidenciada ainda.')
  artifact.verification.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.kind}`)
    lines.push(`   - critério: ${item.criterion_fact_ids.length ? item.criterion_fact_ids.map((id) => factText(factMap.get(id))).join(' | ') : 'UNRESOLVED'}`)
    if (item.concrete_command_fact_id) lines.push(`   - comando evidenciado: ${factText(factMap.get(item.concrete_command_fact_id))}`)
    else lines.push('   - comando concreto: UNRESOLVED')
  })

  if (Array.isArray(options.completedSkills) && options.completedSkills.length) {
    lines.push('')
    lines.push('## Skills verificadas por tool result')
    for (const skill of options.completedSkills) lines.push(`- ${skill}`)
  }

  return lines.join('\n')
}

const factSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'Stable lowercase fact id, for example endpoint_request.' },
    source: { type: 'string', enum: ['user', 'repository', 'runtime'] },
    evidence: {
      type: 'object',
      description: 'For user: {quote}. For repository: {path, quote}. For runtime: {tool, quote}. Quotes must be exact evidence.',
      additionalProperties: true,
    },
  },
  required: ['id', 'source', 'evidence'],
  additionalProperties: false,
}

const factIdArraySchema = {
  type: 'array',
  items: { type: 'string' },
}

const engineeringCommitParameters = {
  type: 'object',
  properties: {
    artifact: {
      type: 'object',
      description: 'Evidence-grounded planning artifact. Normative sections reference fact ids only. Put unresolved decisions in unknowns as stable identifiers.',
      properties: {
        facts: { type: 'array', items: factSchema },
        unknowns: { type: 'array', items: { type: 'string' } },
        objectives: factIdArraySchema,
        requirements: factIdArraySchema,
        acceptance_criteria: factIdArraySchema,
        non_goals: factIdArraySchema,
        planned_tests: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              kind: { type: 'string', enum: [...TEST_KINDS] },
              requirement_fact_ids: factIdArraySchema,
              expected_fact_ids: factIdArraySchema,
            },
            required: ['kind', 'requirement_fact_ids', 'expected_fact_ids'],
            additionalProperties: false,
          },
        },
        red: {
          type: 'object',
          properties: {
            kind: { type: 'string', enum: ['planned', 'observed'] },
            target_test_indexes: { type: 'array', items: { type: 'integer' } },
            observed_fact_ids: factIdArraySchema,
          },
          required: ['kind', 'target_test_indexes', 'observed_fact_ids'],
          additionalProperties: false,
        },
        verification: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              kind: { type: 'string', enum: [...VERIFICATION_KINDS] },
              criterion_fact_ids: factIdArraySchema,
              concrete_command_fact_id: { type: 'string' },
            },
            required: ['kind', 'criterion_fact_ids'],
            additionalProperties: false,
          },
        },
      },
      required: ['facts', 'unknowns', 'objectives', 'requirements', 'acceptance_criteria', 'non_goals', 'planned_tests', 'red', 'verification'],
      additionalProperties: false,
    },
  },
  required: ['artifact'],
  additionalProperties: false,
}

function workspaceForAgent(agent) {
  const cwd = agent && agent.session && agent.session.header ? agent.session.header.cwd : undefined
  return typeof cwd === 'string' && cwd !== '' ? cwd : process.cwd()
}

export function apply(ctx) {
  const managedSkills = loadManagedSkills()
  const states = new WeakMap()

  ctx.on('agent/pre-step', async (payload, next) => {
    const existing = states.get(payload.agent)
    if (!existing || existing.turn !== payload.turn) {
      const directUserText = payload.messages
        .filter((message) => message && message.source && message.source.kind === 'user')
        .map(messageText)
        .filter(Boolean)
        .join('\n')
      const requiredSkills = extractRequestedSkills(directUserText, managedSkills)
      if (requiredSkills.length > 0) {
        states.set(payload.agent, {
          turn: payload.turn,
          requiredSkills,
          completedSkills: [],
          activatingUserText: directUserText,
          toolResults: [],
          methodologyCommitSucceeded: false,
        })
      } else {
        states.delete(payload.agent)
      }
    }
    return next()
  })

  ctx.on('llm/stream', (options, next) => {
    if (options.purpose !== undefined || options.sessionId === undefined) return next()
    const agent = ctx.agents.get(options.sessionId)
    const state = agent ? states.get(agent) : undefined
    if (!state || state.methodologyCommitSucceeded) return next()
    return filterMethodologyStream(next())
  })

  ctx.on('tools/pre-execute', async (exec, next) => {
    const state = exec.agent ? states.get(exec.agent) : undefined
    if (!state) {
      if (exec.name === ENGINEERING_COMMIT) {
        return { kind: 'deny', reason: 'engineering_commit requires an active explicit methodology turn' }
      }
      return next()
    }

    const decision = preToolDecisionForState(state, exec.name, exec.arguments)
    if (decision.kind === 'deny') return decision
    if (decision.kind === 'allow') return next()
    if (exec.name === ENGINEERING_COMMIT || nextExpectedSkill(state) === undefined) return next()
    return next()
  })

  ctx.on('tools/result', (exec, result) => {
    if (!exec.agent) return
    const state = states.get(exec.agent)
    if (!state) return
    advanceSkillState(state, exec, result)
    if (!result.isError && exec.name !== SKILL_TOOL && exec.name !== ENGINEERING_COMMIT) {
      const text = resultText(result)
      if (text !== '') state.toolResults.push({ tool: exec.name, text })
    }
  })

  ctx.effect(() => ctx.tools.register({
    name: ENGINEERING_COMMIT,
    description: 'Commit the final evidence-grounded engineering planning artifact for an explicit methodology turn. Use only after every requested Skill has successfully loaded. Normative sections accept fact ids backed by exact user/repository/runtime evidence; unresolved decisions belong in unknowns. This tool is terminal on success and its deterministic pt-BR result is the accepted final planning response.',
    parameters: engineeringCommitParameters,
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(args, exec) {
      invariant(exec.agent, 'engineering_commit requires an agent-owned execution')
      const state = states.get(exec.agent)
      invariant(state, 'engineering_commit requires an active explicit methodology turn')
      invariant(nextExpectedSkill(state) === undefined, `engineering_commit requires Skill "${nextExpectedSkill(state)}" first`)
      const validated = await validateEngineeringCommit(args.artifact, {
        activatingUserText: state.activatingUserText,
        workspace: workspaceForAgent(exec.agent),
        toolResults: state.toolResults,
      })
      const rendered = renderEngineeringCommit(validated, { completedSkills: state.completedSkills })
      state.methodologyCommitSucceeded = true
      exec.concludeTurn()
      return rendered
    },
  }))

  ctx.on('agent/turn-stopping', ({ agent, turn }) => {
    const state = states.get(agent)
    if (!state || state.turn !== turn || state.methodologyCommitSucceeded) return
    const expected = nextExpectedSkill(state)
    if (expected !== undefined) {
      agent.steer(pluginMessage(
        `Gate metodológico: o preflight explícito ainda não terminou. Chame agora a ferramenta skill exatamente com o nome "${expected}". Não produza análise ou resposta final antes de completar todas as Skills solicitadas.`,
        `Preflight aguardando Skill ${expected}`,
      ))
      return
    }
    agent.steer(pluginMessage(
      'Gate metodológico: o preflight de Skills está completo, mas ainda não existe um commit validado. Reúna apenas evidência necessária com ferramentas não destrutivas, se preciso, e finalize chamando engineering_commit. Não forneça uma resposta final em prose fora desse tool.',
      'Planejamento aguardando engineering_commit',
    ))
  })
}
