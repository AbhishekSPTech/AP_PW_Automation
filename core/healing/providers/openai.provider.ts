//OpenAI Healing Provider
//Uses OpenAI vision + structured output to pick the intended element, and embeddings for similarity

//Framework - only - Not accessible from tests

import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { Candidate, HealContext, HealingProvider, ProviderPick } from '../types';
import { PickSchema, SYSTEM_PROMPT, buildUserPrompt } from './prompt';

export class OpenAIProvider implements HealingProvider {
  readonly name = 'openai';
  private client?: OpenAI;

  constructor(
    private readonly model: string = 'gpt-4.1',
    private readonly embeddingModel: string = 'text-embedding-3-small'
  ) {}

  // Created lazily so runs that never heal don't need credentials
  private getClient(): OpenAI {
    this.client ??= new OpenAI();
    return this.client;
  }

  async pick(context: HealContext, candidates: Candidate[], screenshot: Buffer): Promise<ProviderPick> {
    const completion = await this.getClient().chat.completions.parse({
      model: this.model,
      response_format: zodResponseFormat(PickSchema, 'locator_pick'),
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/png;base64,${screenshot.toString('base64')}` } },
            { type: 'text', text: buildUserPrompt(context, candidates) },
          ],
        },
      ],
    });

    const message = completion.choices[0]?.message;
    if (!message?.parsed) {
      return { index: -1, confidence: 0, reason: message?.refusal || 'No usable answer' };
    }
    return message.parsed;
  }

  async embed(texts: string[]): Promise<number[][]> {
    const response = await this.getClient().embeddings.create({ model: this.embeddingModel, input: texts });
    return response.data.map(item => item.embedding);
  }
}
