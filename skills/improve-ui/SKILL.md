---
name: improve-ui
description: Use when the user wants to improve, polish, redesign, or modernize the UI/UX of an existing app, screen, or component, including requests like "make this look better", "clean up this screen", "fix spacing/typography", or "improve the design". Not for building new features or changing business logic.
---

# improve-ui: High-Craft UI & UX Polish

Improve the visual design, typography, spacing, and user experience of an existing application's presentation layer **without breaking existing functionality** and **without producing generic, AI-generated ("vibe-coded") aesthetic tropes**.

---

## Core Principles

1. **Behavior is frozen.** Only the presentation layer may change. Logic, data flow, API calls, routing, state management, validation, and permissions must remain completely untouched.
2. **Evidence over assumption.** Capture an empirical baseline before editing and verify against it after every change.
3. **Respect the existing product.** Evolve the application's native design language and brand identity; never overwrite it with an off-the-shelf template look.
4. **Small, reversible steps.** Polish one screen or component group at a time, running verification gates before proceeding.
5. **Ask when uncertain.** If any visual change might plausibly affect behavior or user workflow, stop and ask immediately.

---

## Safety Rails & Hard Stop Conditions

### Stop and Ask the User When:
- A requested visual change would require modifying business logic, state stores, models, validation rules, or API contracts.
- Automated tests or baseline build commands cannot run, or the baseline has pre-existing broken tests that prevent verification.
- A design modification conflicts with established brand rules or WCAG AA accessibility requirements.
- The user's request is ambiguous or scopes beyond the target screen/component.
- You cannot verify that behavior is preserved.

### Absolute Prohibitions (Never Do):
- **NEVER** edit, weaken, or delete test assertions to make tests pass.
- **NEVER** comment out code or suppress lint/type errors to get a clean build.
- **NEVER** add heavy new dependencies (e.g. new styling libraries, component packages) without explicit user approval.
- **NEVER** delete existing functionality, secondary controls, or fields under the guise of "simplifying" or "decluttering" the UI.
- **NEVER** perform unrelated refactoring or cleanup on business logic while styling.

---

## The 6-Phase Workflow

```
Phase 0: Discovery ───► Phase 1: Baseline & Contract ───► Phase 2: Design Audit
                                                                   │
                                                                   ▼
Phase 5: Verification ◄─── Phase 4: Implement ◄─── Phase 3: Plan & Anti-AI Review
```

---

### Phase 0: Discovery

1. **Detect the Stack:** Inspect project configuration files (`package.json`, `pubspec.yaml`, `Cargo.toml`, etc.).
   - Identify: Framework (React, Vue, Flutter, Next.js, Svelte, iOS, Android), styling mechanism (Tailwind, CSS Modules, Styled Components, SCSS, Sass, Vanilla CSS), component library (shadcn/ui, MUI, Radix, Chakra, custom), icon set (Lucide, Heroicons, Material), and test runner (`vitest`, `jest`, `pytest`, `flutter test`).
2. **Discover Existing Design Tokens:**
   - Search for theme files, Tailwind config, CSS variables (`:root`), or style constants.
   - If design tokens exist: Use them strictly.
   - If no formal tokens exist: Extract the most frequently used values (colors, spacing, radii) in the codebase and synthesize a consistent token proposal. **Do not invent an unrelated palette.**
3. **Confirm Scope:** Identify the exact target screen, modal, or component group. If the prompt is broad ("make the app look better"), propose an initial scope (e.g., primary dashboard or checkout view) and confirm with the user before starting.

---

### Phase 1: Baseline & Functional Contract

1. **Run Baseline Verification:**
   - Execute existing build, lint, typecheck, and test commands.
   - Record exact baseline numbers (e.g., `Build: clean, Tests: 42 passed, Lint: 0 errors`).
   - If baseline is already failing, report the existing failures immediately. Do not attribute them to UI changes.
2. **Generate the Functional Contract:**
   - Populate [`templates/functional-contract.md`](./templates/functional-contract.md) for the target scope.
   - Document:
     - All interactive controls (buttons, links, inputs) and their mapped handlers.
     - Form validation rules, error displays, and disabled conditions.
     - Route entry/exit points, URL parameters, and modal states.
     - Critical test hooks (`data-testid`, IDs, `aria-label`, semantic keys).
     - Data bindings and conditional rendering rules.
3. **Capture Visual Baseline:**
   - If dev server / browser preview is runnable: Capture "before" screenshots (desktop, mobile, light and dark mode, empty/loading/error states).
   - If no runnable browser environment exists: Document that screenshots are unavailable and conduct a static DOM/CSS baseline inspection.

---

### Phase 2: Design Audit

Audit the target scope using the criteria in [`references/design-audit-checklist.md`](./references/design-audit-checklist.md).
Rate and prioritize every issue by severity:
- **High:** WCAG AA contrast failures, broken hierarchy, unstyled interactive states, clipping/overflow, touch targets < 44px.
- **Medium:** Broken 4/8px spacing rhythm, inconsistent font weights, missing tabular numbers on data, duplicate component styles, missing empty states.
- **Low:** Minor subpixel alignments, hover transition duration tweaks.

---

### Phase 3: Anti-AI Review & Implementation Plan

> **MANDATORY:** You MUST read [`references/anti-ai-look.md`](./references/anti-ai-look.md) before drafting the plan.

1. **Check Against AI Tells:**
   - Verify that your proposed design avoids: purple/cyan neon gradients, frosted glass blur on everything, cards-inside-cards with giant radii, emoji as icons, generic marketing copy, gratuitous bouncy animations, and symmetrical feature grids.
2. **Draft the Plan:**
   - Formulate a concrete checklist of changes mapped directly to the audit findings.
   - Order items by impact and risk (highest visual impact with lowest structural risk first).
   - Mark every item explicitly:
     - **Safe:** Pure styling change (Tailwind classes, CSS rules, color tokens, typography).
     - **Needs care:** Structural layout changes (wrapping in layout containers, changing flex/grid layouts) that could impact focus order, scrolling constraints, or event bubbling.
3. **User Approval Gate:**
   - Present the audit findings and plan.
   - For scoped, targeted requests (e.g. "fix spacing on this card"), proceed directly.
   - For broad or cross-cutting structural modifications, pause and await user confirmation.

---

### Phase 4: Implement Incrementally

1. **One Component Group at a Time:** Focus on one atomic component or screen section before moving to the next.
2. **Centralize Tokens:** Update shared theme variables or reusable components first rather than sprinkling hardcoded one-off values across multiple files.
3. **Preserve All Identifiers & Logic Hooks:**
   - Do NOT rename, delete, or reorder: event handlers, function parameters, component props, state hooks, controllers, route names, `data-testid` attributes, or accessibility keys.
4. **Structural Caution:**
   - If wrapping elements in a new flex/grid container is required, verify that keyboard tab order, click propagation, and overflow scroll behaviors remain intact.
5. **No Simplification by Deletion:** Never remove a button, field, filter, or status label to make the interface look cleaner.

---

### Phase 5: Verification Gates (The 8 Gates)

Run the 8 gates defined in [`references/verification-gates.md`](./references/verification-gates.md) after every increment and at project completion:

| Gate | Description | Pass Requirement |
| :--- | :--- | :--- |
| **Gate 1: Build & Type-Check** | Run project build, lint, and typecheck. | 0 new errors or warnings vs baseline. |
| **Gate 2: Test Suite** | Run test command (`npm test`, `vitest`, etc.). | 100% of baseline tests pass. Zero tests weakened/edited. |
| **Gate 3: Diff Audit** | Run `git diff` or [`scripts/diff-audit.sh`](./scripts/diff-audit.sh). | Zero non-presentational lines modified. |
| **Gate 4: Contract Check** | Walk every row in the Functional Contract. | Every interactive element, handler, and test ID confirmed intact. |
| **Gate 5: State Coverage** | Verify loading, empty, error, disabled, focus states. | Clean rendering without layout shifts or missing styles. |
| **Gate 6: Visual Comparison** | Compare before/after screenshots or DOM. | Visible improvement; no clipping, overflow, or truncation. |
| **Gate 7: Accessibility (a11y)**| Check WCAG AA contrast (>= 4.5:1), touch targets (>= 44px), labels, motion. | Zero accessibility regressions. |
| **Gate 8: Responsive & Theme** | Test mobile (375px) vs desktop (1280px+), light/dark modes. | No horizontal overflow; responsive and theme-consistent. |

**Gate Rule:** If any gate fails, stop immediately, fix or revert, and re-verify. Never declare success with a failing or unverified gate. If an environment cannot run a gate (e.g., no headless browser), mark it as `NOT RUN: [Reason]`.

---

## Final Delivery Format

Deliver the final result using the template in [`templates/final-report.md`](./templates/final-report.md):
1. **Summary:** (Max 5 lines) What changed, why, and confirmation that behavior is preserved.
2. **Changes by Screen/Component:** Table of files modified, change type, and one-line rationale.
3. **Verification Results:** Matrix of all 8 gates with status (`PASS`, `FAIL`, `NOT RUN`) and concrete evidence.
4. **Functional Contract Status:** Confirmation that all contracted elements exist and operate properly.
5. **Before/After Visuals:** Screenshot links or detailed visual comparison notes.
6. **Risks & Follow-ups:** Any remaining edge cases or suggested future cleanups.
