# @funtools/skills-manager

CLI tool to manage and install custom AI skills for Antigravity, Gemini, and code IDE agents.

Easily distribute and maintain collections of specialized skills across your system or team workspace repositories.

---

## 🌟 Key Features

- **Store Multiple Skills in One Place**: Manage all your organization's or personal AI skills in a single, well-organized repository.
- **One-Command CLI Self-Update**: Easily check for new CLI package versions on npm and update automatically without typing manual `npm install` commands.
- **Central Installation Store**: Automatically tracks all locations where skills are installed across your entire machine (global IDE configs, team workspaces, custom folders).
- **Automated All-Skills Refresh**: When you update the package, all previously installed skills across all your projects and global configurations are automatically refreshed with the latest skill updates.
- **Global Installation (Default)**: Automatically installs skills to `~/.gemini/config/skills/`, instantly making them accessible in every IDE session on your machine without reloading.
- **Workspace Scoping (`--workspace` / `-w`)**: Install skills into `.agents/skills/` at your project root to commit and share with teammates via git.
- **Custom Destination (`--dest <path>` / `-d <path>`)**: Install skills into any custom folder of your choice.
- **Clean Manifest & Store Tracking**: Prevents unwanted deletions of custom-authored skills during uninstall.
- **Easy Extension**: Adding a new skill takes seconds — simply add a folder with a `SKILL.md` file.

---

## 🚀 Quick Start

Run instantly with `npx`:

```bash
# List all bundled skills
npx @funtools/skills-manager list

# Install all skills globally
npx @funtools/skills-manager install --all

# Or install specific skills
npx @funtools/skills-manager install code-review git-commit-helper
```

Or install globally on your system:

```bash
npm install -g @funtools/skills-manager

skills-manager list
skills-manager install --all
```

---

## 📖 CLI Usage & Commands

### 1. `list`
List all skills packaged in this repository along with their descriptions.
```bash
skills-manager list
```

### 2. `install`
Install one or more skills.
```bash
# Default: Installs globally (~/.gemini/config/skills/)
skills-manager install --all
skills-manager install hello-world code-review

# Workspace: Installs into current project's .agents/skills/
skills-manager install --workspace --all
skills-manager install -w hello-world

# Custom destination: Installs into user-provided directory
skills-manager install --dest ./custom-skills-dir --all
skills-manager install -d /path/to/my/skills hello-world
```

### 3. `installed`
Inspect installed skills and when they were installed.
```bash
# Inspect global installs (default)
skills-manager installed

# Inspect workspace installs
skills-manager installed --workspace

# Inspect custom directory
skills-manager installed --dest ./custom-skills-dir

# List all skill installations across the entire system
skills-manager installed --all-locations
```

### 4. `check` (or `check-update`)
Check whether a new version of `@funtools/skills-manager` has been published on npm without installing anything.
```bash
skills-manager check
# or
skills-manager check-update
```

### 5. `update` (or `upgrade`)
Update the `@funtools/skills-manager` package to the latest version and automatically refresh all installed skills across all locations (global, workspace, and custom directories) tracked in the central store.
```bash
# Check, update package to latest, and auto-refresh all installed skills
skills-manager update

# Check for updates only (same as 'check')
skills-manager update --check

# Force re-download and re-sync all skills even if already on latest version
skills-manager update --force
```

### 6. `uninstall`
Safely remove installed skills. Only removes skills tracked by the manifest and updates the central store.
```bash
# Remove global skill
skills-manager uninstall hello-world

# Remove workspace skill
skills-manager uninstall --workspace hello-world

# Remove from custom directory
skills-manager uninstall --dest ./custom-skills-dir hello-world
```

### 7. `info`
Display full metadata for a specific skill.
```bash
skills-manager info code-review
```

---

## 🛠️ How to Add New Skills to This Repo

1. Create a new directory inside `skills/`:
   ```bash
   mkdir skills/my-new-skill
   ```

2. Create a `SKILL.md` inside that directory with YAML frontmatter:
   ```markdown
   ---
   name: my-new-skill
   description: >-
     Explain what this skill does and when the agent should use it.
   ---

   # My New Skill Title

   Detailed workflow, steps, and rules for the agent...
   ```

3. (Optional) Add auxiliary folders:
   - `scripts/`: Shell scripts or utilities the agent can run.
   - `references/`: Detailed reference documentation, API specs, checklists.
   - `examples/`: Code samples and reference implementations.
   - `resources/`: Templates or static assets.

4. Verify your skill appears in the registry:
   ```bash
   node bin/skills-manager.js list
   ```

5. Publish a new package version or commit to your repository!

---

## 📂 Repository Structure

```text
SkillsManager/
├── bin/
│   └── skills-manager.js         # CLI entry point
├── src/
│   ├── cli.js                    # Commander CLI definitions
│   ├── installer.js              # Installation & lifecycle engine
│   ├── registry.js               # Skill scanner & frontmatter parser
│   ├── store.js                  # Central tracking store for all skill targets
│   ├── updater.js                # Version checking, self-update & auto-sync
│   └── utils.js                  # Path resolution & file system helpers
├── skills/                       # Bundled skills directory
│   ├── hello-world/              # Test & demo skill
│   ├── code-review/              # Structured code review skill
│   ├── git-commit-helper/        # Conventional commit generator
│   ├── ui-clean-code/            # Clean UI development standards
│   └── improve-ui/               # High-craft UI/UX polish & redesign skill
├── test/                         # Automated tests
├── package.json
└── README.md
```

---

## 📄 License

MIT © funtools
