# `ui-clean-code` Skill

A production-ready agent skill for building clean, scalable, and maintainable UI codebases in **React**, **React Native**, and **Next.js**.

## Overview

In frontend development, codebases often degrade into two extremes:
1. **Unstructured Chaos**: Monolithic components (300+ lines), screens with nested conditional branches (`isEdit ? ... : ...`), and a bloated global `components/` dumping ground.
2. **Dogmatic Over-Engineering**: Rigid layered systems (e.g. strict Feature-Sliced Design) that ban horizontal feature imports and force premature hoisting of domain-specific components into generic shared layers.

`ui-clean-code` provides a clear, pragmatic alternative that balances domain ownership with clean code conventions.

## Core Conventions

### 1. Tree-Structured Decomposition
- Break UI into focused sub-components.
- The filesystem folder hierarchy mirrors the runtime component hierarchy (`Component/` with `index.tsx` + `UI/` folder for sub-components).
- The entry file `index.tsx` reads as a **Table of Contents**; developers can understand the page layout without reading hundreds of lines of implementation.

### 2. Colocation
- Screen-specific components, styles, and helpers stay inside that screen's folder.
- Only promote components when they are genuinely consumed by multiple screens.

### 3. Shared UI, Separate Logic (Paired Views)
- When two screens share the same visual interface but diverge in business logic (e.g., `CreateItem` and `UpdateItem`):
  - Do **NOT** use conditional flags (`isEdit ? ... : ...`) in a single screen.
  - Do **NOT** duplicate markup across two disconnected screens.
  - Create separate screen coordinators (`CreateItemScreen` and `UpdateItemScreen`), separate logic hooks (`useCreateItem` and `useUpdateItem`), and render a single shared UI form (`features/items/shared/UI/ItemForm/`).

### 4. Lowest Common Ancestor (LCA) Placement
- Used by one screen → Colocate inside that screen's `UI/` folder.
- Used by multiple screens in one feature → Place in that feature's `shared/UI/` folder.
- Used across multiple features:
  - If it represents a domain concept owned by a feature → Keep it in that owning feature's `UI/` folder and export via its public API (`index.ts`).
  - If it is pure, domain-agnostic UI infrastructure (e.g. Button, Dialog, Tooltip) → Place in root `src/shared/UI/` or `src/components/ui/`.

### 5. Project-First Naming & Structure-Driven Splitting
- **Naming**: Always follow the existing project's naming conventions. If none exist, default to `PascalCase` for all component folders and entry files.
- **Splitting**: Splitting is driven by UI structure, readability, and mental models—not arbitrary premature line counting. A default upper bound of **~400 lines** serves as a hard ceiling for mandatory refactoring.

## Folder Blueprint Example

```
features/
└── profile/
    ├── index.ts                     # Feature Public API
    └── screens/
        └── CreateProfile/           # Screen Component (PascalCase fallback)
            ├── index.tsx            # Table of Contents
            ├── useCreateProfile.ts  # Logic orchestration hook
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

## Scaffolding Helper

This skill includes a CLI scaffolding script:
```bash
# Run from repository root:
./skills/ui-clean-code/scripts/scaffold.sh src/features/profile/screens CreateProfile --sub-components StepsIndicator,Steps
```

## Documentation & References

- [Rules Catalog (`references/rules-reference.md`)](./references/rules-reference.md)
- [Decision Trees & Flowcharts (`references/decision-trees.md`)](./references/decision-trees.md)
- [Architectural Principles (`references/principles.md`)](./references/principles.md)
- [Next.js App Router Guide (`references/framework-nextjs.md`)](./references/framework-nextjs.md)
- [React Native Guide (`references/framework-react-native.md`)](./references/framework-react-native.md)
- [Anti-Patterns Guide (`references/anti-patterns.md`)](./references/anti-patterns.md)
- [Worked Examples (`examples/`)](./examples/)
