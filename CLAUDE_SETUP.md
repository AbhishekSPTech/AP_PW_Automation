# Claude Code — Setup & Installation Guide

Reference course: [Claude Code in Action](https://anthropic.skilljar.com/claude-code-in-action/303236)

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18 or later |
| npm | 8 or later |

Verify your versions:

```bash
node --version
npm --version
```

---

## Installation

### 1. Install Claude Code globally

```bash
npm install -g @anthropic-ai/claude-code
```

### 2. Verify the installation

```bash
claude --version
```

### 3. Authenticate

```bash
claude
```

On first run, Claude Code opens a browser window to complete OAuth with your Anthropic account. Follow the prompts and return to the terminal once authorisation is confirmed.

> If you are on a headless server or the browser does not open automatically, copy the URL printed in the terminal and open it manually.

---

## Starting Claude Code

### In any project

Navigate to your project root and launch Claude Code:

```bash
cd /path/to/your/project
claude
```

### Common startup flags

```bash
claude --help                          # List all CLI options
claude --model claude-sonnet-4-6       # Specify a model
claude --no-auto-update                # Skip automatic updates
```

---

## Configuration

### Global settings

Global settings (API key, default model, theme) are stored in your home directory:

```
~/.claude/settings.json          # macOS / Linux
%USERPROFILE%\.claude\settings.json    # Windows
```

### Project settings

Project-level settings live alongside your code:

```
.claude/settings.json            # checked in — shared with team
.claude/settings.local.json      # gitignored  — personal overrides
```

### Environment variable (alternative auth)

If you prefer not to use the interactive login, export your API key before launching:

```bash
# macOS / Linux
export ANTHROPIC_API_KEY=sk-ant-...

# Windows (PowerShell)
$env:ANTHROPIC_API_KEY = "sk-ant-..."

# Windows (Command Prompt)
set ANTHROPIC_API_KEY=sk-ant-...
```

---

## Key Commands Inside Claude Code

| Command | Description |
|---|---|
| `/help` | Show available slash commands |
| `/init` | Generate a `CLAUDE.md` for the current repo |
| `/clear` | Clear conversation context |
| `/config` | Open settings (theme, model, etc.) |
| `/review` | Review the current branch's changes |
| `/quit` or `Ctrl+C` | Exit |

Run a shell command without leaving Claude Code by prefixing with `!`:

```
! git status
! npm test
```

---

## IDE Integration

### VS Code

1. Open the Extensions panel (`Ctrl+Shift+X`)
2. Search for **Claude Code**
3. Install and reload
4. Sign in when prompted

### JetBrains (WebStorm, IntelliJ, etc.)

1. Open **Settings → Plugins → Marketplace**
2. Search for **Claude Code**
3. Install and restart the IDE

---

## Updating Claude Code

```bash
npm update -g @anthropic-ai/claude-code
```

Claude Code also auto-updates by default each time it starts.

---

## Uninstalling

```bash
npm uninstall -g @anthropic-ai/claude-code
```

---

## Troubleshooting

### `claude: command not found` after installation

The npm global `bin` directory is not on your `PATH`.

**Find where npm installs global binaries:**
```bash
npm bin -g
```

**Add it to your PATH:**

```bash
# macOS / Linux — add to ~/.bashrc, ~/.zshrc, or equivalent
export PATH="$(npm bin -g):$PATH"
source ~/.bashrc   # or source ~/.zshrc
```

```powershell
# Windows PowerShell — add npm global bin to system PATH
$npmBin = (npm bin -g)
[Environment]::SetEnvironmentVariable("Path", "$env:Path;$npmBin", "User")
# Restart your terminal after running this
```

---

### Permission / EACCES errors on install (macOS / Linux)

Avoid running npm with `sudo`. Instead, fix the npm prefix ownership:

```bash
# Option 1 — change the npm global prefix to a user-owned directory
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH   # add this line to your shell profile

# Then reinstall
npm install -g @anthropic-ai/claude-code
```

```bash
# Option 2 — use nvm to manage Node (recommended long-term)
# Install nvm from https://github.com/nvm-sh/nvm, then:
nvm install --lts
nvm use --lts
npm install -g @anthropic-ai/claude-code
```

---

### Authentication / login loop or browser does not open

1. Ensure you are logged in to an Anthropic account at https://console.anthropic.com
2. If the browser does not open, manually copy the URL printed in the terminal
3. Complete the OAuth flow in the browser, then return to the terminal
4. If the loop repeats, clear stored credentials and try again:

```bash
# Remove cached credentials
rm -rf ~/.claude/credentials*      # macOS / Linux
del "%USERPROFILE%\.claude\credentials*"   # Windows

# Re-authenticate
claude
```

---

### API key errors (`401 Unauthorized` or `invalid_api_key`)

- Confirm your key is active at https://console.anthropic.com/settings/keys
- Make sure there are no extra spaces or newline characters in the key value
- Re-export the variable and restart your terminal:

```bash
# macOS / Linux
export ANTHROPIC_API_KEY=sk-ant-...

# Windows PowerShell
$env:ANTHROPIC_API_KEY = "sk-ant-..."
```

- Alternatively, store the key in the global settings file to avoid re-exporting each session:

```json
// ~/.claude/settings.json  (macOS / Linux)
// %USERPROFILE%\.claude\settings.json  (Windows)
{
  "apiKey": "sk-ant-..."
}
```

---

### `ENOENT` or missing `node_modules` errors at runtime

Claude Code requires Node 18+. If your system has multiple Node versions installed:

```bash
node --version   # should print v18.x.x or higher

# If using nvm, switch to a compatible version:
nvm use 18
npm install -g @anthropic-ai/claude-code
```

---

### Proxy / corporate network blocking requests

Set the standard proxy environment variables before running Claude Code:

```bash
# macOS / Linux
export HTTPS_PROXY=http://proxy.yourcompany.com:8080
export NO_PROXY=localhost,127.0.0.1

# Windows PowerShell
$env:HTTPS_PROXY = "http://proxy.yourcompany.com:8080"
$env:NO_PROXY = "localhost,127.0.0.1"
```

If your company uses SSL inspection, you may also need to add the corporate CA certificate to Node's trust store:

```bash
export NODE_EXTRA_CA_CERTS=/path/to/corporate-ca.pem
```

---

### Claude Code is outdated or behaves unexpectedly

Force a clean reinstall to the latest version:

```bash
npm uninstall -g @anthropic-ai/claude-code
npm install -g @anthropic-ai/claude-code
claude --version
```

---

### IDE extension not connecting to the CLI

The VS Code / JetBrains extension shells out to the `claude` binary. If the extension cannot find it:

1. Confirm `claude --version` works in your terminal
2. Ensure the terminal PATH used by your IDE matches your shell PATH
3. In VS Code, set the path explicitly in settings:

```json
// .vscode/settings.json
{
  "claudeCode.executablePath": "/usr/local/bin/claude"
}
```

4. Restart the IDE after making PATH changes

---

## Further Reading

- Course: [Claude Code in Action](https://anthropic.skilljar.com/claude-code-in-action/303236)
- Official docs: https://docs.anthropic.com/claude-code
- Issue tracker: https://github.com/anthropics/claude-code/issues
