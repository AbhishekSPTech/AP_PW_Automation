# Self-Healing Locators

When the UI changes and a locator stops matching, the framework tries to find the element the locator was meant to target, continues the test with it, and proposes a fix to `ui/locators.ts` for you to review.

Healing never edits code on its own. A healed test passes, but it is flagged, and the locator change only lands when you apply it.

## How It Works

```
Page object action (click / fill / getText / resolve)
        │
        ▼
Locator visible within HEALING_PROBE_TIMEOUT? ──yes──► continue as normal
        │ no (or matches several elements)
        ▼
Wait for the page to settle (networkidle) ──visible now?──► continue as normal
        │ still broken
        ▼
1. Collect visible elements from the DOM (role, accessible name, text, attributes, position)
2. Rank them against the broken locator (label similarity, role, key name, embeddings if available)
        │
        ├── strong, clear winner (score ≥ 0.7 and ≥ 0.25 ahead of #2) ──► local heal
        │
        └── otherwise: screenshot + top 25 candidates ──► AI provider picks one (or none)
                                                          confidence ≥ HEALING_MIN_CONFIDENCE ──► AI heal
        │
        ▼
3. Build the most stable locator for the chosen element (role + name, then data-testid, id, name, ...)
4. Verify it matches exactly one visible element
5. Continue the test, annotate it "self-healed", append to healing-reports/heals.jsonl
        │
        ▼
No trustworthy match ──► wait out the normal timeout and fail as usual (top candidates are logged)
```

Within one worker, a key is healed at most once; later uses reuse the healed locator.

## Setup

### 1. Configure the environment

Settings live in `env/.env.<env>` (QA has healing enabled):

| Variable | Default | Purpose |
|---|---|---|
| `HEALING_ENABLED` | `false` | Turn healing on |
| `HEALING_PROVIDER` | `none` | `claude`, `openai` or `none` (local matching only) |
| `HEALING_MODEL` | provider default | Override the model (`claude-opus-5-5` / `gpt-4.1`) |
| `HEALING_PROBE_TIMEOUT` | `5000` | ms to wait before treating a locator as broken |
| `HEALING_MIN_CONFIDENCE` | `0.7` | Minimum AI confidence to accept a pick |

### 2. Add an API key (AI providers only)

Put the key in `env/.env.local` (gitignored, loaded before the env file) or export it in your shell. Never put keys in the committed `env/.env.*` files.

```bash
# env/.env.local
ANTHROPIC_API_KEY=sk-ant-...   # for HEALING_PROVIDER=claude
OPENAI_API_KEY=sk-...          # for HEALING_PROVIDER=openai
```

Without a key, the local matcher still runs; AI calls fail with a logged warning and the test fails normally.

## Writing Healable Page Objects

Healing works for locators referenced **by key** from `ui/locators.ts`:

```typescript
export class LoginPage extends BasePage {
  private readonly submitButton = this.loc('login.submitButton');   // typed key, autocompleted

  async login(username: string, password: string): Promise<void> {
    await this.fill(this.usernameInput, username);   // BasePage actions heal automatically
    await this.click(this.submitButton);
  }

  async verifyLoginFormVisible(): Promise<void> {
    // For assertions, resolve first so the lookup can heal; the assertion itself stays strict
    await expect(await this.resolve(this.submitButton)).toBeVisible();
  }
}
```

- `click`, `fill`, `type`, `getText`, `selectOption`, `check`, `uncheck` accept a keyed locator and heal it.
- `this.resolve(target)` returns a (possibly healed) Playwright `Locator` for use with `expect`.
- Plain Playwright `Locator` objects still work but never heal.
- Locator entries are either a CSS string or `{ role: '...' as const, name: '...' }`. Keep each entry on one line so `heal:apply` can rewrite it.

Healing only finds the element. What the test checks (text, value, visibility) is never relaxed.

## Reviewing and Applying Heals

After a run with heals:

```bash
npm run heal:report    # show proposed changes, write nothing
npm run heal:apply     # write them to ui/locators.ts
git diff ui/locators.ts
```

Example output:

```
login.usernameInput (local, confidence 0.76)
  - role=textbox[name="User name"]
  + role=textbox[name="Username"]
    Closest match by label and role (score 0.76)
```

- If one key was healed to different locators in different tests, it is skipped for a human to decide.
- After applying, the report is archived as `healing-reports/applied-<timestamp>.jsonl`.
- Healed tests show a `self-healed` annotation in the HTML report (`npm run report`).

## Providers

| | Claude | OpenAI | None |
|---|---|---|---|
| Picks element from screenshot | ✅ `claude-opus-5-5` | ✅ `gpt-4.1` | ❌ |
| Embedding similarity in ranking | ❌ (no embeddings API) | ✅ `text-embedding-3-small` | ❌ |
| Structured output | Zod schema via `messages.parse` | Zod schema via `chat.completions.parse` | – |
| Safety-decline fallback | Server-side `fallbacks: "default"` | – | – |

Each AI heal sends one screenshot plus up to 25 candidate descriptions. Adding a provider means implementing the `HealingProvider` interface in `core/healing/types.ts` and registering it in `core/healing/providers/index.ts`.

## File Map

```
core/healing/
├── types.ts                  # LocatorDef, Candidate, HealingProvider interface
├── candidates.ts             # DOM candidate extraction + stable locator builder
├── scorer.ts                 # Local ranking (label, role, tokens, embeddings)
├── healer.ts                 # Orchestration, verification, report + annotations
└── providers/
    ├── prompt.ts             # Shared system prompt + output schema
    ├── claude.provider.ts    # Anthropic SDK adapter
    ├── openai.provider.ts    # OpenAI SDK adapter
    └── index.ts              # HEALING_PROVIDER factory

ui/base.page.ts               # loc() / resolve() hooks, healing-aware actions
scripts/apply-heals.mjs       # heal:report / heal:apply
healing-reports/heals.jsonl   # Heal log (gitignored)
```

## Limitations

- Only locators referenced by key through `this.loc(...)` heal. Inline `page.locator(...)` calls in fixtures or tests do not.
- A heal costs at least `HEALING_PROBE_TIMEOUT` plus one AI round-trip; keep the timeout above how long your slowest page takes to render.
- Elements inside iframes or shadow DOM are not collected as candidates.
- The local matcher is conservative by design: when two elements look alike, it defers to the AI or fails rather than guessing.

## Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| `Could not resolve authentication method` in logs | No API key - see [Setup](#2-add-an-api-key-ai-providers-only) |
| `Could not heal locator` with top candidates listed | No confident match; check the logged candidates and fix the locator by hand |
| Heals on every run for the same key | Run `npm run heal:apply` to persist the fix |
| Healing triggers on a slow page | Raise `HEALING_PROBE_TIMEOUT` |
| `SKIP <key>: healed to N different locators` | Same key matched different elements in different tests; fix it manually |
