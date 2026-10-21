---
name: git-commit-helper
description: >-
  Generates clean, conventional commit messages from git diffs and staged changes.
  Use when the user asks to write a commit message, prepare a commit, or summarize their git changes for committing.
---

# Git Commit Helper

Generate standardized, semantic commit messages following the Conventional Commits specification.

## Workflow

1. Inspect staged changes:
   ```bash
   git diff --cached --stat
   git diff --cached
   ```
   If no changes are staged, inspect unstaged changes:
   ```bash
   git status -s
   git diff
   ```
2. Determine commit type:
   - `feat`: A new feature
   - `fix`: A bug fix
   - `docs`: Documentation only changes
   - `style`: Changes that do not affect the meaning of the code (formatting, missing semi colons, etc)
   - `refactor`: A code change that neither fixes a bug nor adds a feature
   - `perf`: A code change that improves performance
   - `test`: Adding missing tests or correcting existing tests
   - `chore`: Changes to build process or auxiliary tools/libraries
3. Format the message:
   ```text
   <type>(<scope>): <short imperative summary>

   <optional detailed body explaining context and why>

   <optional footer, e.g. BREAKING CHANGE or issue reference>
   ```
4. Propose the commit message to the user and ask for confirmation before committing.
