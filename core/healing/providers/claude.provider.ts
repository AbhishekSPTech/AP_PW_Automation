//Claude Healing Provider
//Uses Claude vision + structured output to pick the intended element

//Framework - only - Not accessible from tests

import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { Candidate, HealContext, HealingProvider, ProviderPick } from '../types';
import { PickSchema, SYSTEM_PROMPT, buildUserPrompt } from './prompt';

export class ClaudeProvider implements HealingProvider {
  readonly name = 'claude';
  private client?: Anthropic;

  constructor(private readonly model: string = 'claude-opus-5-5') {}

  async pick(context: HealContext, candidates: Candidate[], screenshot: Buffer): Promise<ProviderPick> {
    // Created lazily so runs that never heal don't need credentials
    this.client ??= new Anthropic();

    const response = await this.client.beta.messages.parse({
      model: this.model,
      max_tokens: 16000,
      // On a safety decline, re-run on Anthropic's recommended fallback model
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium', format: betaZodOutputFormat(PickSchema) },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/png', data: screenshot.toString('base64') } },
            { type: 'text', text: buildUserPrompt(context, candidates) },
          ],
        },
      ],
    });

    if (response.stop_reason === 'refusal' || !response.parsed_output) {
      return { index: -1, confidence: 0, reason: `No usable answer (stop_reason: ${response.stop_reason})` };
    }
    return response.parsed_output;
  }
}
