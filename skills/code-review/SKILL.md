---
name: code-review
description: >-
  Performs a structured, thorough code review on git diffs or specified code files.
  Use when the user asks for a code review, code audit, pull request review, or quality check on their code.
---

# Code Review Skill

This skill provides an objective, structured, and comprehensive code review process.

## Review Workflow

1. **Identify the Scope**:
   - If the user specified a file or folder, focus on that target.
   - If uncommitted changes exist, inspect `git status` and `git diff`.
2. **Review Pillars**:
   - Refer to the detailed checklist in [references/checklist.md](./references/checklist.md).
   - Evaluate **Correctness & Logic**: edge cases, off-by-one errors, resource leaks, null/undefined safety.
   - Evaluate **Security**: input validation, unsanitized parameters, secret leakage.
   - Evaluate **Maintainability**: clear naming conventions, single responsibility, readability.
   - Evaluate **Performance**: algorithmic complexity, unnecessary computations or allocations.
3. **Format Feedback**:
   - Present findings grouped by severity:
     - 🚨 **Critical**: Bugs, regressions, security flaws.
     - ⚠️ **Important**: Performance bottlenecks, edge case gaps.
     - 💡 **Suggestion**: Readability, style, modern language idioms.
   - Always provide concise, ready-to-use drop-in code fixes for highlighted issues.
