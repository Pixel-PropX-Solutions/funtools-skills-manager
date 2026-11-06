# Architectural Principles & Foundations

This document details the core software engineering principles underpinning the `ui-clean-code` standard, citing established patterns and explaining how they synthesize into a coherent architecture.

---

## 1. Single Responsibility Principle (SRP) applied to UI

> *"A class or module should have one, and only one, reason to change."*  
> — Robert C. Martin (Uncle Bob), *Clean Architecture*

In modern component-based frontend development (React, React Native, Next.js), UI components easily violate SRP by mixing:
1. **Presentation & Layout:** Determining how pixels and elements are visually organized.
2. **Business Logic & Workflow:** State machines, step sequencing, and validation.
3. **Data Retrieval & Mutation:** Network calls, error handling, caching, and payload transformation.

### Application in `ui-clean-code`:
- **View Purity:** The component file (`index.tsx`) is solely responsible for declaring the visual hierarchy and layout composition.
- **Hook Isolation:** All state mutations, form validation, and data operations are isolated into dedicated, colocated custom hooks (e.g. `useCreateProfile.ts`).
- **Sub-Component Scope:** Sub-components inside `UI/` handle only their specific visual fragment.

---

## 2. Colocation: Placing Code Where It Belongs

> *"Place code as close to where it’s relevant as possible. Things that change together should be located as close as reasonable."*  
> — Kent C. Dodds, *"Colocation"* (2019)

Traditional architectures often group files by technical type:
```
src/
├── components/   # 250 disparate components
├── hooks/        # 100 disparate hooks
├── styles/       # 50 global CSS files
└── services/     # 40 API files
```
This pattern creates high cognitive overhead and friction. Refactoring or removing a feature requires jumping across multiple distant folders.

### Application in `ui-clean-code`:
- Components, private child sub-components, and local custom hooks live together inside the component's folder.
- Deleting a component is as simple as deleting its folder; no orphaned styles or dangling helper files remain in global folders.
- State is colocated at the lowest relevant component node to avoid unnecessary cascading re-renders.

---

## 3. Separation of UI and Business Logic (Dan Abramov's Evolution)

In 2015, Dan Abramov popularized the **Container / Presentational Component** pattern:
- **Containers:** "Smart" components handling data-fetching and state management.
- **Presentational:** "Dumb" components taking data strictly via props and rendering markup.

In 2019, with the release of React Hooks, Dan Abramov revised this recommendation:
> *"Update from 2019: I don't suggest splitting your components like this anymore... The main reason I found it useful was because it let me separate complex stateful logic from other aspects of the component. Hooks let me do the same thing without an arbitrary division."*

### Application in `ui-clean-code`:
Rather than wrapping views in artificial Container component layers (`UserContainer.tsx` wrapping `UserView.tsx`), `ui-clean-code` enforces:
1. **Custom Hooks as the Logic Boundary:** The custom hook encapsulates the state, validation, and side-effects.
2. **Pure Presentational Views:** The screen or component calls the custom hook at the top, receiving pure state and handler props, and passes them down cleanly to its sub-components.

---

## 4. Lowest Common Ancestor (LCA) Placement

When multiple components require access to a shared component or helper, placing it too high creates a global "dumpster" directory (`src/components/` with 200 components), while placing it too low causes duplicate implementations.

`ui-clean-code` applies the **Lowest Common Ancestor** algorithm from graph theory:
- Trace the dependency graph of all consumers.
- Locate the lowest directory node that contains all consumers.
- If all consumers reside within a single screen → place in `<Screen>/UI/<Component>/`.
- If all consumers reside within multiple screens of a single feature → place in `features/<Feature>/shared/UI/<Component>/`.
- If consumers span multiple features → place in root `src/shared/UI/` or `src/components/ui/` **only if** the component is domain-agnostic.

---

## 5. Domain Ownership vs. Feature-Sliced Design (FSD)

**Feature-Sliced Design (FSD)** establishes strict horizontal layer boundaries:
- `app/` → `pages/` → `widgets/` → `features/` → `entities/` → `shared/`
- Rule: Layers can only import downward. Horizontal cross-imports between features are prohibited.

### Friction in FSD:
When Feature A (e.g. `dashboard`) needs a rich UI widget belonging to Feature B (e.g. `UserProfileDrawer` in `users`), FSD forces developers to demote `UserProfileDrawer` downward to `entities` or `shared`. This dilutes domain ownership, stripping domain-rich widgets of their context.

### The `ui-clean-code` Resolution:
- **Preserve Domain Feature Ownership:** If a component represents a concept inherently belonging to the `users` domain, it remains in `features/users/UI/UserProfileDrawer/`.
- **Public API Surface:** `features/users/index.ts` exports `UserProfileDrawer`.
- **Direct Cross-Feature Consumption:** The `dashboard` imports `UserProfileDrawer` from `@/features/users`.
- This preserves domain boundaries, avoids polluting shared infrastructure layers, and maintains high cohesion.

---

## 6. Structure-Driven Splitting vs. Premature Fragmentation

A common trap with automated or rigid linting rules is enforcing low line-count limits (e.g. splitting any component that exceeds 100 lines). This causes **premature fragmentation**, where developers split a 110-line cohesive form into 6 separate files, creating unnecessary file navigation overhead.

### The `ui-clean-code` Standard:
- Component splitting is primarily driven by **UI structure** (identifiable visual blocks like steps, tabs, cards, or panels) and **cognitive understandability**.
- A component that is 200 lines long, strictly cohesive, and easy to read does **not** need to be split.
- When a component becomes difficult to understand, manage, or reason about, or when it approaches the default ceiling of **~400 lines**, it must be decomposed into sub-components under `UI/`.
