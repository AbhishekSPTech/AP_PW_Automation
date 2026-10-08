//Candidate Scorer
//Ranks candidates by how closely they resemble the broken locator (no AI needed)

//Framework - only - Not accessible from tests

import { Candidate, HealContext } from './types';

const STOPWORDS = new Set(['the', 'a', 'an', 'of', 'to', 'and', 'data', 'testid', 'nth', 'type', 'div', 'span']);

//Role implied by a locator key suffix, e.g. "submitButton" -> button
const KEY_SUFFIX_ROLES: [RegExp, string][] = [
  [/button$/i, 'button'],
  [/(input|field)$/i, 'textbox'],
  [/link$/i, 'link'],
  [/(heading|title)$/i, 'heading'],
  [/(picture|image|img|icon)$/i, 'img'],
  [/(checkbox)$/i, 'checkbox'],
  [/(select|dropdown)$/i, 'combobox'],
];

const TAG_ROLES: Record<string, string> = {
  button: 'button', a: 'link', input: 'textbox', textarea: 'textbox', select: 'combobox', img: 'img',
  h1: 'heading', h2: 'heading', h3: 'heading', h4: 'heading', h5: 'heading', h6: 'heading',
};

export function tokenize(value: string): string[] {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(token => token.length > 1 && !STOPWORDS.has(token));
}

function bigrams(value: string): Set<string> {
  const clean = value.toLowerCase().replace(/\s+/g, ' ').trim();
  const grams = new Set<string>();
  for (let i = 0; i < clean.length - 1; i++) grams.add(clean.slice(i, i + 2));
  return grams;
}

//Sørensen–Dice similarity on character bigrams (0..1)
export function dice(a: string, b: string): number {
  if (!a || !b) return 0;
  const x = bigrams(a);
  const y = bigrams(b);
  if (x.size === 0 || y.size === 0) return a.toLowerCase() === b.toLowerCase() ? 1 : 0;
  let overlap = 0;
  for (const gram of x) if (y.has(gram)) overlap++;
  return (2 * overlap) / (x.size + y.size);
}

//Overlap coefficient: share of the smaller token set found in the other, so noisy class lists don't dilute it
function overlap(a: string[], b: string[]): number {
  const x = new Set(a);
  const y = new Set(b);
  if (x.size === 0 || y.size === 0) return 0;
  let shared = 0;
  for (const token of x) if (y.has(token)) shared++;
  return shared / Math.min(x.size, y.size);
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA && normB ? dot / Math.sqrt(normA * normB) : 0;
}

//What the broken locator says about its target: expected role, name and descriptive tokens
export function fingerprint(context: HealContext): { role: string; name: string; tokens: string[]; text: string } {
  const keyName = context.key.split('.').pop() || '';
  const roleFromKey = KEY_SUFFIX_ROLES.find(([pattern]) => pattern.test(keyName))?.[1] || '';

  if (typeof context.original !== 'string') {
    const { role, name } = context.original;
    const tokens = [...tokenize(name), ...tokenize(context.key)];
    return { role, name, tokens, text: `${role} ${name} ${context.key}` };
  }

  const css = context.original;
  const quoted = Array.from(css.matchAll(/["']([^"']+)["']/g)).map(match => match[1]);
  const tag = css.match(/^([a-z][a-z0-9]*)/i)?.[1]?.toLowerCase() || '';
  const role = TAG_ROLES[tag] || roleFromKey;
  const tokens = [...tokenize(css), ...tokenize(context.key)];
  const name = quoted.join(' ') || keyName.replace(/(Button|Input|Link|Display|Heading)$/i, '');
  return { role, name, tokens, text: `${role} ${name} ${css} ${context.key}` };
}

export function describeCandidate(candidate: Candidate): string {
  return [candidate.role, candidate.name, candidate.text, ...Object.values(candidate.attrs)].filter(Boolean).join(' ');
}

//Scores every candidate 0..1; when embeddings are available they are blended in
export function scoreCandidates(context: HealContext, candidates: Candidate[], similarities?: number[]): Candidate[] {
  const print = fingerprint(context);

  return candidates
    .map((candidate, i) => {
      const label = candidate.name || candidate.text || candidate.attrs.placeholder || '';
      const nameScore = dice(print.name, label);
      const roleScore = print.role && candidate.role === print.role ? 1 : 0;
      const tokenScore = overlap(print.tokens, tokenize(describeCandidate(candidate)));
      const lexical = 0.45 * nameScore + 0.3 * roleScore + 0.25 * tokenScore;
      const score = similarities ? 0.6 * lexical + 0.4 * Math.max(0, similarities[i]) : lexical;
      return { ...candidate, score: Number(score.toFixed(3)) };
    })
    .sort((a, b) => b.score - a.score);
}
