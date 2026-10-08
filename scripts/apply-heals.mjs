// Apply Self-Healed Locators
// Reads healing-reports/heals.jsonl and patches ui/locators.ts
//
//   npm run heal:report   -> show proposed changes only
//   npm run heal:apply    -> write them to ui/locators.ts, then review with `git diff`

import fs from 'fs';
import path from 'path';

const REPORT_FILE = path.resolve('healing-reports', 'heals.jsonl');
const LOCATORS_FILE = path.resolve('ui', 'locators.ts');
const dryRun = process.argv.includes('--dry-run');

const quote = value => `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const toSource = def =>
  typeof def === 'string' ? quote(def) : `{ role: ${quote(def.role)} as const, name: ${quote(def.name)} }`;
const describe = def => (typeof def === 'string' ? def : `role=${def.role}[name="${def.name}"]`);

if (!fs.existsSync(REPORT_FILE)) {
  console.log('No heals recorded - nothing to apply.');
  process.exit(0);
}

// Latest heal per key; keys healed to different locators across tests are left for a human
const byKey = new Map();
for (const line of fs.readFileSync(REPORT_FILE, 'utf8').split('\n').filter(Boolean)) {
  const entry = JSON.parse(line);
  const seen = byKey.get(entry.key) ?? { entries: [], healed: new Set() };
  seen.entries.push(entry);
  seen.healed.add(JSON.stringify(entry.healed));
  byKey.set(entry.key, seen);
}

const changes = new Map();
for (const [key, { entries, healed }] of byKey) {
  const latest = entries[entries.length - 1];
  if (healed.size > 1) {
    console.log(`SKIP ${key}: healed to ${healed.size} different locators - review healing-reports/heals.jsonl`);
    continue;
  }
  changes.set(key, latest);
}

// Keep the file's existing line endings (Windows checkouts use CRLF)
const source = fs.readFileSync(LOCATORS_FILE, 'utf8');
const eol = source.includes('\r\n') ? '\r\n' : '\n';
const lines = source.split(/\r?\n/);
let section = '';
let applied = 0;
for (let i = 0; i < lines.length; i++) {
  const sectionMatch = lines[i].match(/^ {2}(\w+): \{\s*$/);
  if (sectionMatch) section = sectionMatch[1];

  const entryMatch = lines[i].match(/^( {4})(\w+): (.+?),?\s*$/);
  if (!entryMatch) continue;
  const change = changes.get(`${section}.${entryMatch[2]}`);
  if (!change) continue;

  const updated = `${entryMatch[1]}${entryMatch[2]}: ${toSource(change.healed)},`;
  console.log(`${change.key} (${change.method}, confidence ${change.confidence})`);
  console.log(`  - ${describe(change.original)}`);
  console.log(`  + ${describe(change.healed)}`);
  console.log(`    ${change.reason}`);
  lines[i] = updated;
  changes.delete(change.key);
  applied++;
}

for (const key of changes.keys()) console.log(`SKIP ${key}: entry not found in ui/locators.ts`);

if (dryRun || applied === 0) {
  console.log(dryRun ? `\n${applied} change(s) proposed. Run npm run heal:apply to write them.` : '\nNothing applied.');
  process.exit(0);
}

fs.writeFileSync(LOCATORS_FILE, lines.join(eol));
const archive = REPORT_FILE.replace('heals.jsonl', `applied-${new Date().toISOString().replace(/[:.]/g, '-')}.jsonl`);
fs.renameSync(REPORT_FILE, archive);
console.log(`\n${applied} change(s) written to ui/locators.ts. Review with: git diff ui/locators.ts`);
