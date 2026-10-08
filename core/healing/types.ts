//Self-Healing Types
//Shared shapes for locator healing

//Framework - only - Not accessible from tests

import { Page } from '@playwright/test';

export type AriaRole = Parameters<Page['getByRole']>[0];

//A locator definition as written in ui/locators.ts: a CSS selector or a role + accessible name
export type LocatorDef = string | { role: AriaRole; name: string };

//An element on the page that might be the one a broken locator was meant to find
export interface Candidate {
  index: number;
  tag: string;
  role: string;
  name: string;
  text: string;
  attrs: Record<string, string>;
  box: { x: number; y: number; width: number; height: number };
  cssPath: string;
  score: number;
  suggested?: LocatorDef;
}

export interface HealContext {
  key: string;
  original: LocatorDef;
  action: string;
  url: string;
}

export interface ProviderPick {
  index: number;
  confidence: number;
  reason: string;
}

//An AI backend that picks the intended element from a screenshot and candidate list
export interface HealingProvider {
  readonly name: string;
  pick(context: HealContext, candidates: Candidate[], screenshot: Buffer): Promise<ProviderPick>;
  //Optional semantic similarity; providers without an embeddings API omit it
  embed?(texts: string[]): Promise<number[][]>;
}

export interface HealResult {
  def: LocatorDef;
  method: 'local' | 'ai';
  confidence: number;
  reason: string;
}
