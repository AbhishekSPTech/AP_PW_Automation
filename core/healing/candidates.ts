//Candidate Extraction
//Collects visible, targetable elements from the DOM and builds unique locators for them

//Framework - only - Not accessible from tests

import { Page } from '@playwright/test';
import { AriaRole, Candidate, LocatorDef } from './types';

type RawCandidate = Omit<Candidate, 'index' | 'score' | 'suggested'>;

const MAX_CANDIDATES = 300;

//Runs in the browser: approximates role and accessible name for visible elements
function collect(max: number): RawCandidate[] {
  const SELECTOR = [
    'a[href]', 'button', 'input:not([type="hidden"])', 'select', 'textarea',
    '[role]', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img[alt]', 'label',
    '[data-testid]', '[aria-label]', '[onclick]', 'p', 'span',
  ].join(',');

  const implicitRole = (el: Element): string => {
    const explicit = el.getAttribute('role');
    if (explicit) return explicit;
    const tag = el.tagName.toLowerCase();
    if (tag === 'a') return 'link';
    if (tag === 'button') return 'button';
    if (tag === 'select') return 'combobox';
    if (tag === 'textarea') return 'textbox';
    if (tag === 'img') return 'img';
    if (/^h[1-6]$/.test(tag)) return 'heading';
    if (tag === 'input') {
      const type = (el.getAttribute('type') || 'text').toLowerCase();
      if (type === 'checkbox') return 'checkbox';
      if (type === 'radio') return 'radio';
      if (['submit', 'button', 'reset'].includes(type)) return 'button';
      return 'textbox';
    }
    return '';
  };

  const accessibleName = (el: Element): string => {
    const aria = el.getAttribute('aria-label');
    if (aria) return aria.trim();
    const labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      const text = labelledBy.split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ').trim();
      if (text) return text;
    }
    const id = el.getAttribute('id');
    if (id) {
      const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (label?.textContent?.trim()) return label.textContent.trim();
    }
    const wrapping = el.closest('label');
    if (wrapping?.textContent?.trim()) return wrapping.textContent.trim();
    for (const attr of ['placeholder', 'alt', 'title', 'value']) {
      const value = el.getAttribute(attr);
      if (value?.trim()) return value.trim();
    }
    const tag = el.tagName.toLowerCase();
    if (['button', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag) || el.getAttribute('role')) {
      return (el.textContent || '').replace(/\s+/g, ' ').trim();
    }
    return '';
  };

  const cssPath = (el: Element): string => {
    const parts: string[] = [];
    let node: Element | null = el;
    while (node && node !== document.documentElement) {
      const tag = node.tagName.toLowerCase();
      const parent: Element | null = node.parentElement;
      const current: Element = node;
      const siblings = parent ? Array.from(parent.children).filter(c => c.tagName === current.tagName) : [];
      parts.unshift(siblings.length > 1 ? `${tag}:nth-of-type(${siblings.indexOf(current) + 1})` : tag);
      node = parent;
    }
    return parts.join(' > ');
  };

  const results: RawCandidate[] = [];
  for (const el of Array.from(document.querySelectorAll(SELECTOR))) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    if (rect.width === 0 || rect.height === 0 || style.visibility === 'hidden' || style.display === 'none') continue;

    const text = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    const tag = el.tagName.toLowerCase();
    // Skip text containers whose text lives entirely in a child we already collect
    if ((tag === 'span' || tag === 'p') && (!text || el.children.length > 0)) continue;

    const attrs: Record<string, string> = {};
    for (const attr of ['id', 'name', 'type', 'placeholder', 'aria-label', 'data-testid', 'href', 'class']) {
      const value = el.getAttribute(attr);
      if (value) attrs[attr] = attr === 'class' ? value.split(/\s+/).slice(0, 4).join(' ') : value.slice(0, 80);
    }

    results.push({
      tag,
      role: implicitRole(el),
      name: accessibleName(el).slice(0, 80),
      text,
      attrs,
      box: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
      cssPath: cssPath(el),
    });
    if (results.length >= max) break;
  }
  return results;
}

export async function extractCandidates(page: Page): Promise<Candidate[]> {
  const raw = await page.evaluate(collect, MAX_CANDIDATES);
  return raw.map((candidate, index) => ({ ...candidate, index, score: 0 }));
}

//Builds the most stable locator that uniquely matches the candidate, preferring role + name
export async function buildLocatorDef(page: Page, candidate: Candidate): Promise<LocatorDef | undefined> {
  const options: LocatorDef[] = [];
  if (candidate.role && candidate.name) options.push({ role: candidate.role as AriaRole, name: candidate.name });
  const { attrs, tag } = candidate;
  if (attrs['data-testid']) options.push(`[data-testid="${attrs['data-testid']}"]`);
  if (attrs.id && !/\d{3,}/.test(attrs.id)) options.push(`[id="${attrs.id}"]`);
  if (attrs.name) options.push(`${tag}[name="${attrs.name}"]`);
  if (attrs.placeholder) options.push(`${tag}[placeholder="${attrs.placeholder}"]`);
  if (attrs['aria-label']) options.push(`${tag}[aria-label="${attrs['aria-label']}"]`);
  options.push(candidate.cssPath);

  for (const def of options) {
    if ((await toLocator(page, def, true).count()) === 1) return def;
  }
  return undefined;
}

//Healed role locators match their name exactly; hand-written ones keep Playwright's default substring match
export function toLocator(page: Page, def: LocatorDef, exact = false) {
  return typeof def === 'string'
    ? page.locator(def)
    : page.getByRole(def.role, { name: def.name, exact });
}

export function describeDef(def: LocatorDef): string {
  return typeof def === 'string' ? def : `role=${def.role}[name="${def.name}"]`;
}
