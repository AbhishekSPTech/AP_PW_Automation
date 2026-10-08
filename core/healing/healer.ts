//Locator Healer
//When a locator stops matching: DOM + screenshot -> rank candidates -> AI pick if needed -> verified new locator

//Framework - only - Not accessible from tests

import fs from 'fs';
import path from 'path';
import { Page, test } from '@playwright/test';
import { config } from '../config';
import { createLogger } from '../logger';
import { buildLocatorDef, describeDef, extractCandidates, toLocator } from './candidates';
import { cosine, describeCandidate, fingerprint, scoreCandidates } from './scorer';
import { createProvider } from './providers';
import { Candidate, HealContext, HealResult, HealingProvider, LocatorDef } from './types';

const logger = createLogger('LocatorHealer');

//Local match is trusted without AI only when it is both strong and clearly ahead of the runner-up
const LOCAL_ACCEPT_SCORE = 0.7;
const LOCAL_ACCEPT_MARGIN = 0.25;
const AI_CANDIDATE_LIMIT = 25;

export const HEALING_REPORT_FILE = path.resolve('healing-reports', 'heals.jsonl');

//Healed locators are reused for the rest of the worker's run so each key costs at most one heal
const healedThisRun = new Map<string, LocatorDef>();
let provider: HealingProvider | null | undefined;

function getProvider(): HealingProvider | null {
  if (provider === undefined) {
    const settings = config.getHealing();
    provider = createProvider(settings.provider, settings.model);
  }
  return provider;
}

export function getHealedDef(key: string): LocatorDef | undefined {
  return healedThisRun.get(key);
}

async function similarities(context: HealContext, candidates: Candidate[]): Promise<number[] | undefined> {
  const ai = getProvider();
  if (!ai?.embed) return undefined;
  try {
    const [target, ...rest] = await ai.embed([fingerprint(context).text, ...candidates.map(describeCandidate)]);
    return rest.map(vector => cosine(target, vector));
  } catch (error) {
    logger.warn('Embedding similarity unavailable, using lexical scoring only', { error: String(error) });
    return undefined;
  }
}

async function isUsable(page: Page, def: LocatorDef): Promise<boolean> {
  const locator = toLocator(page, def, true);
  return (await locator.count()) === 1 && (await locator.isVisible());
}

async function chooseLocally(page: Page, ranked: Candidate[]): Promise<HealResult | null> {
  const [best, runnerUp] = ranked;
  if (!best || best.score < LOCAL_ACCEPT_SCORE || best.score - (runnerUp?.score ?? 0) < LOCAL_ACCEPT_MARGIN) return null;
  const def = await buildLocatorDef(page, best);
  if (!def || !(await isUsable(page, def))) return null;
  return { def, method: 'local', confidence: best.score, reason: `Closest match by label and role (score ${best.score})` };
}

async function chooseWithAI(page: Page, context: HealContext, ranked: Candidate[]): Promise<HealResult | null> {
  const ai = getProvider();
  if (!ai) return null;

  const shortlist = ranked.slice(0, AI_CANDIDATE_LIMIT);
  try {
    const screenshot = await page.screenshot();
    const pick = await ai.pick(context, shortlist, screenshot);
    logger.info('AI pick', { provider: ai.name, ...pick });

    const chosen = shortlist.find(candidate => candidate.index === pick.index);
    if (!chosen || pick.confidence < config.getHealing().minConfidence) return null;

    const def = await buildLocatorDef(page, chosen);
    if (!def || !(await isUsable(page, def))) return null;
    return { def, method: 'ai', confidence: pick.confidence, reason: pick.reason };
  } catch (error) {
    logger.warn('AI healing failed', { provider: ai.name, error: String(error) });
    return null;
  }
}

function record(context: HealContext, result: HealResult): void {
  healedThisRun.set(context.key, result.def);

  const entry = {
    timestamp: new Date().toISOString(),
    key: context.key,
    original: context.original,
    healed: result.def,
    method: result.method,
    confidence: result.confidence,
    reason: result.reason,
    action: context.action,
    url: context.url,
    test: safeTestTitle(),
  };
  fs.mkdirSync(path.dirname(HEALING_REPORT_FILE), { recursive: true });
  fs.appendFileSync(HEALING_REPORT_FILE, `${JSON.stringify(entry)}\n`);

  try {
    test.info().annotations.push({
      type: 'self-healed',
      description: `${context.key}: ${describeDef(context.original)} -> ${describeDef(result.def)} (${result.method}, ${result.confidence})`,
    });
  } catch {
    // Not inside a running test (e.g. setup scripts) - the report line is enough
  }
}

function safeTestTitle(): string | undefined {
  try {
    return test.info().titlePath.join(' > ');
  } catch {
    return undefined;
  }
}

//Returns a verified replacement locator, or null with suggestions logged
export async function heal(page: Page, context: HealContext): Promise<HealResult | null> {
  logger.warn('Locator failed, attempting to heal', { key: context.key, original: describeDef(context.original) });

  const candidates = await extractCandidates(page);
  const ranked = scoreCandidates(context, candidates, await similarities(context, candidates));

  const result = (await chooseLocally(page, ranked)) ?? (await chooseWithAI(page, context, ranked));
  if (!result) {
    logger.error('Could not heal locator', {
      key: context.key,
      topCandidates: ranked.slice(0, 3).map(c => ({ score: c.score, role: c.role, name: c.name, cssPath: c.cssPath })),
    });
    return null;
  }

  logger.info('Locator healed', { key: context.key, healed: describeDef(result.def), method: result.method });
  record(context, result);
  return result;
}
