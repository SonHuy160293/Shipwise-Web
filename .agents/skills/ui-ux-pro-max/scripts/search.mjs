#!/usr/bin/env node
// Shipwise port of the upstream ui-ux-pro-max search.py: BM25 over the local
// CSV rule data, Node only (no Python). Scoped to the domains and stacks that
// apply to Shipwise Web; visual style, palette and font data are deliberately
// not searchable because DESIGN.md owns those decisions.
//
// Usage:
//   node .agents/skills/ui-ux-pro-max/scripts/search.mjs "<query>" --domain ux
//   node .agents/skills/ui-ux-pro-max/scripts/search.mjs "<query>" --stack shadcn
//   Options: -n <1-20> (default 3), --full (no truncation), --json
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data')
const TRUNCATE_AT = 300
const ROW_COLS = ['Category', 'Issue', 'Platform', 'Description', 'Do', "Don't"]
const EXAMPLE_COLS = ['Code Example Good', 'Code Example Bad', 'Severity']

const DOMAINS = {
  ux: {
    file: 'ux-guidelines.csv',
    search: ['Category', 'Issue', 'Description', 'Platform'],
    output: [...ROW_COLS, ...EXAMPLE_COLS],
    // Shipwise is a web app: skip native-only rules.
    keep: (row) => !['Mobile', 'VisionOS'].includes(row.Platform),
  },
  chart: {
    file: 'charts.csv',
    search: ['Data Type', 'Keywords', 'Best Chart Type', 'When to Use', 'When NOT to Use', 'Accessibility Notes'],
    output: ['Data Type', 'Best Chart Type', 'Secondary Options', 'When to Use', 'When NOT to Use', 'Data Volume Threshold', 'Accessibility Risk', 'Accessibility Notes', 'A11y Fallback', 'Library Recommendation'],
  },
  react: {
    file: 'react-performance.csv',
    search: ['Category', 'Issue', 'Keywords', 'Description'],
    output: [...ROW_COLS, ...EXAMPLE_COLS],
  },
}

const STACK_COLS = {
  search: ['Category', 'Guideline', 'Description', 'Do', "Don't", 'Code Good', 'Code Bad'],
  output: ['Category', 'Guideline', 'Description', 'Do', "Don't", 'Code Good', 'Code Bad', 'Severity', 'Docs URL', 'Applies To', 'Verified At'],
}
const STACKS = {
  react: 'stacks/react.csv',
  shadcn: 'stacks/shadcn.csv',
  tailwind: 'stacks/html-tailwind.csv',
}

const UNTRUNCATED = new Set(['Code Example Good', 'Code Example Bad', 'Code Good', 'Code Bad'])
const STOPWORDS = new Set('to in on at is of by or an if no so do be we it as the and for are was'.split(' '))
const SYNONYMS = [
  ['dark-mode', 'dark'], ['light-mode', 'light'], ['a11y', 'accessibility'],
  ['nav', 'navigation'], ['sign-up', 'signup'], ['log-in', 'login'],
  ['colour', 'color'], ['behaviour', 'behavior'], ['organisation', 'organization'],
]

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((value) => value !== '')) rows.push(row)
      row = []
    } else field += c
  }
  row.push(field)
  if (row.some((value) => value !== '')) rows.push(row)
  const [header, ...body] = rows
  return body.map((values) => Object.fromEntries(header.map((key, i) => [key, values[i] ?? ''])))
}

function tokenize(text) {
  let normalized = String(text).toLowerCase()
  for (const [variant, canonical] of SYNONYMS) {
    normalized = normalized.replace(new RegExp(`(?<!\\w)${variant}(?!\\w)`, 'g'), canonical)
  }
  return normalized
    .replace(/[^\p{L}\p{N}_\s]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 2 && !STOPWORDS.has(word))
}

function bm25(documents, query, k1 = 1.5, b = 0.75) {
  const corpus = documents.map(tokenize)
  const n = corpus.length
  const avgdl = corpus.reduce((sum, doc) => sum + doc.length, 0) / (n || 1) || 1
  const docFreq = new Map()
  const termFreqs = corpus.map((doc) => {
    const tf = new Map()
    for (const word of doc) tf.set(word, (tf.get(word) ?? 0) + 1)
    for (const word of tf.keys()) docFreq.set(word, (docFreq.get(word) ?? 0) + 1)
    return tf
  })
  const idf = (word) => Math.log((n - docFreq.get(word) + 0.5) / (docFreq.get(word) + 0.5) + 1)
  const terms = tokenize(query).filter((word) => docFreq.has(word))
  return corpus
    .map((doc, index) => {
      let score = 0
      for (const term of terms) {
        const tf = termFreqs[index].get(term) ?? 0
        score += (idf(term) * tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * doc.length) / avgdl))
      }
      return { index, score }
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
}

function search({ query, file, searchCols, outputCols, keep = () => true, max }) {
  const rows = parseCsv(readFileSync(join(DATA_DIR, file), 'utf8')).filter(keep)
  const hits = bm25(rows.map((row) => searchCols.map((col) => row[col] ?? '').join(' ')), query)
  return hits.slice(0, max).map(({ index }) =>
    Object.fromEntries(outputCols.filter((col) => rows[index][col]).map((col) => [col, rows[index][col]])),
  )
}

function usage(message) {
  if (message) console.error(`Error: ${message}\n`)
  console.error(
    'Usage: node .agents/skills/ui-ux-pro-max/scripts/search.mjs "<query>" (--domain <d> | --stack <s>) [-n 1-20] [--full] [--json]\n' +
      `Domains: ${Object.keys(DOMAINS).join(', ')}\nStacks: ${Object.keys(STACKS).join(', ')}`,
  )
  process.exit(2)
}

const args = process.argv.slice(2)
const options = { max: 3, full: false, json: false }
const words = []
for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  if (arg === '--domain' || arg === '-d') options.domain = args[++i]
  else if (arg === '--stack' || arg === '-s') options.stack = args[++i]
  else if (arg === '--max-results' || arg === '-n') options.max = Number(args[++i])
  else if (arg === '--full') options.full = true
  else if (arg === '--json') options.json = true
  else if (arg === '--help' || arg === '-h') usage()
  else if (arg.startsWith('-')) usage(`unknown option ${arg}`)
  else words.push(arg)
}
const query = words.join(' ').trim()
if (!query) usage('a query is required')
if (Boolean(options.domain) === Boolean(options.stack)) usage('pass exactly one of --domain or --stack')
if (!Number.isInteger(options.max) || options.max < 1 || options.max > 20) usage('-n must be 1-20')

let source
let results
if (options.domain) {
  const config = DOMAINS[options.domain]
  if (!config) usage(`unknown domain "${options.domain}" (style, color and font data are out of scope: DESIGN.md owns them)`)
  source = config.file
  results = search({ query, file: config.file, searchCols: config.search, outputCols: config.output, keep: config.keep, max: options.max })
} else {
  const file = STACKS[options.stack]
  if (!file) usage(`unknown stack "${options.stack}"`)
  source = file
  results = search({ query, file, searchCols: STACK_COLS.search, outputCols: STACK_COLS.output, keep: (row) => row.Status === 'active', max: options.max })
}

if (options.json) {
  console.log(JSON.stringify({ query, domain: options.domain, stack: options.stack, source, count: results.length, results }, null, 2))
} else {
  const lines = [`## ui-ux-pro-max: ${options.domain ? `domain ${options.domain}` : `stack ${options.stack}`} | query: ${query}`, `Source: data/${source} | found ${results.length}`, '']
  if (results.length === 0) {
    lines.push('No database match. Retry with broader or different keywords; if you fall back to general practice, say no match was found.')
  }
  results.forEach((row, i) => {
    lines.push(`### Result ${i + 1}`)
    for (const [key, value] of Object.entries(row)) {
      const text = !options.full && !UNTRUNCATED.has(key) && value.length > TRUNCATE_AT ? `${value.slice(0, TRUNCATE_AT)}...` : value
      lines.push(`- **${key}:** ${text}`)
    }
    lines.push('')
  })
  console.log(lines.join('\n'))
}
