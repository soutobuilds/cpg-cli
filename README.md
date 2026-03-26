# @copypastegenius/cli

Run your AI skills from the terminal. Authenticate once, run skills anywhere.

## Install

```bash
npm install -g @copypastegenius/cli
```

## Quick start

```bash
# 1. Log in with your API key (get it from copypastegenius.com/settings)
cpg auth login

# 2. List your skills
cpg skills

# 3. Run a skill
cpg run blog-post-outline

# 4. Install a skill pack
cpg install content-marketing-pack
```

## Commands

### Auth
```bash
cpg auth login       # Save your API key
cpg auth logout      # Remove saved key
cpg auth status      # Show who you're logged in as
cpg whoami           # Alias for auth status
```

### Skills
```bash
cpg skills                          # List all your skills
cpg skills <slug>                   # Show skill detail + prompt template
cpg skills --category coding        # Filter by category
cpg skills --search "blog"          # Search by title/description
```

### Run a skill
```bash
cpg run <slug>                      # Interactive — prompts for each variable
cpg run <slug> --print              # Print assembled prompt instead of copy
cpg run <slug> --var tone=formal    # Pre-fill variables (skip prompts)
cpg run <slug> --var tone=formal --var topic="AI trends"
```

When you run a skill, the assembled prompt is automatically **copied to your clipboard**.

### Packs
```bash
cpg packs                           # List your packs
cpg install <pack-slug>             # Install a pack (forks all skills to your account)
```

## Variable pre-filling

Skip the interactive prompts by passing variables directly:

```bash
cpg run code-review --var language=Python --var focus=performance --var file=main.py
```

## Categories

`general` `marketing` `writing` `coding` `seo` `research` `creative` `business` `social` `education` `image` `video`

## API key

Get your API key at **copypastegenius.com/settings** → API Keys section.

Keys start with `cpg_` and are stored securely in your OS keychain/config directory.

## Config location

- **macOS/Linux:** `~/.config/copypastegenius/config.json`
- **Windows:** `%APPDATA%\copypastegenius\Config\config.json`

## Coming soon

- `cpg run <slug> --file <path>` — pass file contents as a variable
- VS Code extension
- Claude Code integration
