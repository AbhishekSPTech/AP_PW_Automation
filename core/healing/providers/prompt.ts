//Healing Prompt
//Shared instructions and output schema for every AI provider

//Framework - only - Not accessible from tests

import { z } from 'zod/v4';
import { Candidate, HealContext } from '../types';
import { describeDef } from '../candidates';

export const PickSchema = z.object({
  index: z.number().int(),
  confidence: z.number(),
  reason: z.string(),
});

export const SYSTEM_PROMPT = `You repair broken locators in automated UI tests.
A test locator no longer matches any visible element, usually because the page's markup changed.
You get a screenshot of the page and a numbered list of visible candidate elements, each with its role, accessible name, text, attributes and bounding box in CSS pixels (the screenshot uses the same coordinates).
Choose the candidate the locator was meant to target, judging by its purpose: the locator's key name, its old selector, the action being performed, and where the element sits on the page.
If no candidate clearly serves the same purpose, return index -1. Do not pick a merely similar-looking element: a wrong match makes the test pass against the wrong element, which is worse than failing.
Set confidence between 0 and 1, and keep the reason to one sentence.`;

export function buildUserPrompt(context: HealContext, candidates: Candidate[]): string {
  const list = candidates.map(c => ({
    index: c.index,
    tag: c.tag,
    role: c.role,
    name: c.name,
    text: c.text,
    attrs: c.attrs,
    box: c.box,
  }));
  return [
    `Locator key: ${context.key}`,
    `Old locator: ${describeDef(context.original)}`,
    `Action: ${context.action}`,
    `Page URL: ${context.url}`,
    `Candidates:`,
    JSON.stringify(list, null, 1),
  ].join('\n');
}
