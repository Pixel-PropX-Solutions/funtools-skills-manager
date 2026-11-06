---
name: ui-clean-code
description: >-
  Enforces clean UI architecture for React, React Native, and Next.js codebases.
  Activates when scaffolding, writing, refactoring, or reviewing frontend components,
  page layouts, multi-step forms, paired create/update screens, or folder structures.
  Encodes tree-structured decomposition, colocation, lowest-common-ancestor placement,
  separation of UI and logic via custom hooks, and domain-preserving cross-feature reuse.
---

# UI Clean Code: Component Architecture & Folder Hierarchy

Guide and enforce clean, maintainable, and predictable UI code structure across component-based frontend codebases (React, React Native, Next.js).

---

## Core Principles

1. **Tree-Structured Decomposition**: Break complex UI into focused sub-components. The physical filesystem folder tree mirrors the runtime component hierarchy (`Component/` containing `index.tsx` + `UI/` containing sub-components).
2. **Table of Contents Entry Point**: Every component's `index.tsx` acts as an executive summary / table of contents. A developer reading `index.tsx` should understand the layout, sub-components, and structure in seconds without sifting through inline markup or complex state logic.
3. **Colocation over Global Hoisting**: Keep screen-specific sub-components, styles, and helpers colocated inside that screen's folder. Never hoist private components into a global `components/` directory.
4. **Shared UI, Separate Logic**: Paired workflows that share the same visual interface but diverge in business logic (such as Create vs. Update/Edit screens) must **never** be mashed into a single screen with conditional ternary branching (`isEdit ? ... : ...`). Create dedicated screens with dedicated logic hooks, rendering a single shared presentation component.
5. **Lowest Common Ancestor (LCA) Placement**: Place components at the lowest common ancestor of all their consumers:
   - 1 screen consumer → inside that screen's folder.
   - Multiple screens in 1 feature → that feature's `shared/UI/` folder.
   - Multiple features → root `src/shared/UI/` or `src/components/ui/` only if domain-agnostic.
6. **Preserve Domain Feature Ownership**: If a component embodies a specific domain model (e.g. `UserProfileDrawer` in `users`), keep it in its owning feature even if other features consume it. Consumers import directly from the owning feature's public API (`@/features/users`). Never demote domain components to global shared folders just because a second consumer exists.
7. **Pragmatic, Structure-Driven Splitting**: Component splitting is dictated by UI structure, cognitive load, and readability—not premature line-counting. Do not fragment code into dozens of tiny files unnecessarily. Split when a component becomes difficult to understand or manage, or when it approaches the default ceiling of **~400 lines**.

---

## Safety Rails & Prohibitions

### Absolute Prohibitions (Never Do):
- **NEVER** write a monolithic screen file that mixes data fetching, form validation, complex state, and 300+ lines of raw JSX markup.
- **NEVER** combine Create and Edit flows into a single component choked with `isEdit ? ... : ...` conditionals.
- **NEVER** move a domain-owned component out of its feature and into root `components/` simply because another feature needs it.
- **NEVER** split components prematurely into 10-line files if the component is cohesive, readable, and easy to maintain.
- **NEVER** reach into a sibling component's private `UI/` folder from the outside; consume only public exports from `index.ts`.

---

## The 6-Phase Execution Workflow

```
Phase 1: Project Convention Check
              │
              ▼
Phase 2: Dependency Mapping & LCA Placement
              │
              ▼
Phase 3: UI Structure Decomposition (Tree Mirroring)
              │
              ▼
Phase 4: Logic / UI Separation (Custom Hooks)
              │
              ▼
Phase 5: Table-of-Contents Entry Assembly
              │
              ▼
Phase 6: Boundary & Public Export Verification
```

---

### Phase 1: Project Convention Check
1. **Inspect Existing Naming & Structure**:
   - Check if the repository uses `kebab-case`, `PascalCase`, or `camelCase` for folders and components.
   - If established project conventions exist: **Follow them strictly**.
   - If the project lacks clear conventions: Default to **`PascalCase`** for all component folders and component entry files (e.g. `CreateProfile/`, `StepsIndicator/`, `ItemForm/`).

### Phase 2: Dependency Mapping & LCA Placement
Before writing or moving any file, determine all current and anticipated consumers:
- Follow the [Decision Trees](./references/decision-trees.md#decision-flow-1-where-does-this-file-go-lca-placement):
  - Used by 1 screen → Colocate under `<Screen>/UI/<Component>/`.
  - Used by multiple screens in Feature X → Place in `features/X/shared/UI/<Component>/`.
  - Used across features:
    - Domain-specific → Keep in owning feature `features/X/UI/<Component>/` and export via `features/X/index.ts`.
    - Pure domain-agnostic UI primitive (Button, Dialog, Input) → Place in root `shared/UI/` or `components/ui/`.

### Phase 3: UI Structure Decomposition (Tree Mirroring)
1. **Analyze Layout Structure**:
   - Identify distinct UI sub-structures (e.g., steps in a wizard, tabs, distinct panels, complex table filters).
   - If the component is simple, cohesive, and under the ~400-line ceiling: Keep it together.
   - If it is complex, hard to navigate, or has distinct visual sections: Split child components into a local `UI/` directory.
2. **Filesystem Mirrors Component Tree**:
   ```
   CreateProfile/
   ├── index.tsx              # Table of Contents
   ├── useCreateProfile.ts    # Logic hook
   └── UI/
       ├── StepsIndicator/
       │   └── index.tsx
       └── Steps/
           ├── index.tsx
           ├── PersonalInfo/
           │   └── index.tsx
           └── AccountDetails/
               └── index.tsx
   ```

### Phase 4: Logic / UI Separation (Custom Hooks)
1. **Extract State, Queries & Handlers**:
   - UI components should focus purely on presentation and visual layout.
   - Place all form state, API calls, side-effects, and handler logic into a colocated custom hook (e.g. `useCreateProfile.ts`).
2. **Paired Screens Rule**:
   - If building Create and Edit views for an entity (e.g., `Product`):
     - Create `CreateProductScreen/` with `useCreateProduct.ts`.
     - Create `UpdateProductScreen/` with `useUpdateProduct.ts`.
     - Create a single shared `ProductForm/` in `features/products/shared/UI/ProductForm/` taking pure props (`values`, `onSubmit`, `isSubmitting`, `submitLabel`).

### Phase 5: Table-of-Contents Entry Assembly
1. **Assemble `index.tsx`**:
   - The top-level `index.tsx` should read as an outline of the screen.
   - Call the custom hook at the top.
   - Return clean, declarative JSX composing the sub-components imported from `./UI/...`.
   - Avoid deep nested inline divs or sprawling markup in `index.tsx`.

### Phase 6: Boundary & Public Export Verification
1. **Encapsulate Private Components**:
   - Sub-components inside `UI/` remain private to the parent component.
   - Only expose the top-level component in the feature's public `index.ts`.
2. **Verify Imports**:
   - Ensure other features import from `@/features/[feature]` and not internal private paths.

---

## Quick Reference Links

- **Detailed Rules Catalog:** [`references/rules-reference.md`](./references/rules-reference.md) — Complete rule definitions with Good/Bad code examples across all 7 categories.
- **Decision Trees & Flowcharts:** [`references/decision-trees.md`](./references/decision-trees.md) — Step-by-step algorithms and threshold tables for placement and splitting.
- **Architectural Principles:** [`references/principles.md`](./references/principles.md) — Academic and industry foundation (Colocation, SRP, Dan Abramov's hooks evolution, FSD comparison).
- **Next.js App Router Guide:** [`references/framework-nextjs.md`](./references/framework-nextjs.md) — Server vs. Client component boundaries and `page.tsx` integration.
- **React Native Guide:** [`references/framework-react-native.md`](./references/framework-react-native.md) — Navigation coordinators, platform files (`.ios.tsx`), and layout wrappers.
- **Anti-Patterns Guide:** [`references/anti-patterns.md`](./references/anti-patterns.md) — Monolithic files, conditional screens, premature hoisting, and prop drilling.
- **CLI Scaffolder Script:** [`scripts/scaffold.sh`](./scripts/scaffold.sh) — Shell script to bootstrap tree-mirrored component folders.

---

## Worked Examples

1. **Multi-Step Form Decomposition**: [`examples/multi-step-form/`](./examples/multi-step-form/)
2. **Create vs. Update Paired Screens**: [`examples/create-update-split/`](./examples/create-update-split/)
3. **Cross-Feature Component Reuse**: [`examples/cross-feature-reuse/`](./examples/cross-feature-reuse/)
