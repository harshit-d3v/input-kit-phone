// Generates registry/phone-input.json from registry/phone-input.tsx so the
// shadcn CLI item stays synced with the reference component source.
//
// Run with: node scripts/build-registry.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = join(rootDir, 'registry', 'phone-input.tsx')
const outPath = join(rootDir, 'registry', 'phone-input.json')

const content = readFileSync(sourcePath, 'utf8')

const item = {
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'phone-input',
  type: 'registry:component',
  title: 'Phone Input',
  description:
    'Accessible international phone input built on @input-kit/phone with WAI-ARIA combobox search, Windows-safe inline SVG flags, E.164 normalization, and native form support.',
  dependencies: ['@input-kit/phone', 'lucide-react'],
  registryDependencies: ['button', 'input', 'popover'],
  files: [
    {
      path: 'components/ui/phone-input.tsx',
      content,
      type: 'registry:component',
    },
  ],
}

writeFileSync(outPath, JSON.stringify(item, null, 2) + '\n')
console.log('wrote', outPath)
