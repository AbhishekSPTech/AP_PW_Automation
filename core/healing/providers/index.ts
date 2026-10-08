//Healing Provider Factory
//Selects the AI backend from config (HEALING_PROVIDER=claude|openai|none)

//Framework - only - Not accessible from tests

import { HealingProvider } from '../types';
import { ClaudeProvider } from './claude.provider';
import { OpenAIProvider } from './openai.provider';

export function createProvider(provider: string, model?: string): HealingProvider | null {
  switch (provider) {
    case 'claude':
      return new ClaudeProvider(model || undefined);
    case 'openai':
      return new OpenAIProvider(model || undefined);
    case 'none':
      return null;
    default:
      throw new Error(`Unknown HEALING_PROVIDER "${provider}". Use claude, openai or none.`);
  }
}
