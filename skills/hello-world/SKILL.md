---
name: hello-world
description: >-
  A demonstration and test skill that greets the user and explains how skills work.
  Use when someone says "hello world skill", "test skill", or wants an example of how Antigravity skills work.
---

# Hello World Skill

This is a demonstration skill showing the correct structure and capabilities of an Antigravity skill installed via `@funtools/skills-manager`.

## When to Activate

Use this skill when:
- The user asks to test their installed skills.
- The user asks "hello world skill" or wants a demonstration of skill discovery.
- The user wants an explanation of how skills are discovered and loaded.

## Actions to Take

1. Greet the user in an enthusiastic and friendly manner.
2. Confirm that this skill is loaded from the active skills directory.
3. Briefly explain the structure of an Antigravity skill:
   - `SKILL.md` with YAML frontmatter (`name` and `description`).
   - Optional subdirectories (`references/`, `scripts/`, `examples/`).
4. Provide a quick tip on adding more skills to `@funtools/skills-manager`.
