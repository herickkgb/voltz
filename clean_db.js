const fs = require('fs');
let content = fs.readFileSync('src/lib/db.ts', 'utf8');

// Replace top imports
content = content.replace("import { supabase, useMock } from './supabase'", "import { supabase } from './supabase'");
content = content.replace(
  "import { mockInstrutores, getInstrutorBySlug as mockGetBySlug, getInstrutoresAprovados as mockGetAprovados, getMediaAvaliacao } from './mock-instrutores'",
  ""
);

content = content.replace(
  "// Re-export para manter compatibilidade\nexport { getMediaAvaliacao }",
  `// Re-export para manter compatibilidade
export function getMediaAvaliacao(avaliacoes: { nota: number }[]): number {
  if (!avaliacoes.length) return 0
  return avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length
}`
);

// Remove mock branches
content = content.replace(/  if \(useMock\) return true\n\n/g, "");
content = content.replace(/  if \(useMock\) return mockGetAprovados\(\)\n\n/g, "");
content = content.replace(/  if \(useMock\) return mockGetBySlug\(slug\) \|\| null\n\n/g, "");
content = content.replace(/  if \(useMock\) return \[\.\.\.mockInstrutores\]\n\n/g, "");
content = content.replace(/  if \(useMock\) return \{ id: 'mock-new' \}\n\n/g, "");
content = content.replace(/  if \(useMock\) return false\n/g, "");

content = content.replace(/\n  if \(useMock\) \{\n    return mockInstrutores\.find\(i => i\.email === userId\) \|\| mockInstrutores\[0\]\n  \}\n/g, "");

// Complex block for buscarInstrutores
const mockBlockStart = content.indexOf('  if (useMock) {');
if (mockBlockStart !== -1) {
  const mockBlockEnd = content.indexOf('  // Supabase query');
  if (mockBlockEnd !== -1) {
    content = content.slice(0, mockBlockStart) + content.slice(mockBlockEnd);
  }
}

fs.writeFileSync('src/lib/db.ts', content);
console.log('Done cleaning db.ts');
