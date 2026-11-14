import fs from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
const source = process.env.OPENAPI_SPEC
if (!source) {
  console.error(
    'OPENAPI_SPEC is required: provide a local OpenAPI file or HTTP(S) URL.',
  )
  process.exit(1)
}
if (!/^https?:\/\//.test(source)) {
  try {
    await fs.access(source)
  } catch {
    console.error('OpenAPI specification not found: ' + source)
    process.exit(1)
  }
}
const result = spawnSync(
  process.execPath,
  [
    'node_modules/openapi-typescript/bin/cli.js',
    source,
    '--output',
    'src/lib/api/generated/schema.d.ts',
  ],
  { stdio: 'inherit' },
)
process.exit(result.status ?? 1)
