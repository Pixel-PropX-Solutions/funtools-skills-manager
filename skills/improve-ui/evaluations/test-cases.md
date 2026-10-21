# `improve-ui` Skill Evaluation & Realistic Test Cases

This document defines 3 realistic test prompts used to evaluate the `improve-ui` skill against its core principles, workflow phases, safety rails, anti-AI design rules, and verification gates.

---

## Test Case 1: E-Commerce Checkout Summary Polish (Presentation Only)

### User Prompt
> "The checkout order summary card in our React + Tailwind web store looks sloppy. The prices don't align, the fonts look random, the buttons have uneven padding, and the mobile view overflows horizontally. Make it look clean and polished, but don't break our payment flow or test suite."

### Stack & Scenario
- **Framework:** React 19, TypeScript
- **Styling:** Tailwind CSS v3
- **Testing:** Vitest + React Testing Library (28 passing tests)
- **Target File:** `src/components/checkout/OrderSummary.tsx`

### Evaluation Walkthrough

1. **Phase 0 (Discovery):**
   - Detects React + Tailwind from `package.json` and `tailwind.config.js`.
   - Discovers existing color tokens (`emerald-600` primary, `slate-900` neutral).
   - Scopes precisely to `OrderSummary.tsx`.
2. **Phase 1 (Baseline & Functional Contract):**
   - Executes `npx vitest run` -> 28 tests pass.
   - Populates `Functional Contract`:
     - Primary CTA: `<button data-testid="checkout-btn">` calling `onCheckoutSubmit()`.
     - Promo code input with `applyDiscount()` handler.
     - Line items mapped from `cartItems` prop.
     - Dynamic calculations for subtotal, tax, and total.
3. **Phase 2 (Design Audit):**
   - High: Horizontal overflow on mobile (`w-[420px]` fixed width breaking 375px screens).
   - High: Low contrast on tax explanation text (`text-slate-400` on white: 3.2:1 < 4.5:1).
   - Medium: Currency amounts lack `tabular-nums`, resulting in misaligned decimals across rows.
   - Medium: Uneven button padding (`py-3 px-7`) violating 4/8px grid.
4. **Phase 3 (Anti-AI Review & Plan):**
   - Reads `references/anti-ai-look.md`.
   - Avoids AI pitfalls: Does not add purple gradients, does not wrap everything in nested rounded cards, does not add emoji badges.
   - Plan:
     - Replace `w-[420px]` with `w-full max-w-md` (Safe).
     - Add `font-variant-numeric: tabular-nums` (Tailwind `tabular-nums`) to all currency values (Safe).
     - Fix tax label to `text-slate-600` for 6.8:1 WCAG AA contrast (Safe).
     - Standardize button padding to `px-6 py-3` with `rounded-md` (Safe).
5. **Phase 4 (Incremental Implementation):**
   - Modifies Tailwind classes on `OrderSummary.tsx`.
   - Preserves all props, `data-testid="checkout-btn"`, and `onClick` handlers verbatim.
6. **Phase 5 (Verification Gates):**
   - Gate 1 (Build): `tsc --noEmit` clean, 0 errors.
   - Gate 2 (Tests): 28/28 Vitest tests pass. Zero tests touched.
   - Gate 3 (Diff Audit): `scripts/diff-audit.sh` outputs clean — only class names changed.
   - Gate 4 (Contract): All 5 interactive controls and handlers verified intact.
   - Gate 5 (States): Checked loading spinner state and disabled promo button state.
   - Gate 6 (Visual): Mobile horizontal scroll eliminated; decimal places align cleanly.
   - Gate 7 (a11y): Contrast ratio 6.8:1; button touch target 48px height.
   - Gate 8 (Responsive): Clean at 375px and 1440px.
   - Smell Test: Screen looks like a crisp e-commerce order summary, not a generic AI template.
   - Final Report delivered via `templates/final-report.md`.

**Result:** PASS (Clean visual improvement, zero behavioral regression).

---

## Test Case 2: B2B DevOps Telemetry Dashboard (Anti-Vibe-Coding Discipline)

### User Prompt
> "Our server metrics screen in our Next.js dashboard looks outdated and cluttered. Clean it up and make it look like a modern, professional monitoring tool."

### Stack & Scenario
- **Framework:** Next.js 15 (App Router), TypeScript
- **Styling:** CSS Modules (`DashboardMetrics.module.css`)
- **Testing:** Jest + Playwright (34 tests passing)
- **Target File:** `src/app/admin/metrics/page.tsx`

### Evaluation Walkthrough

1. **Phase 0 (Discovery):**
   - Detects Next.js and CSS Modules.
   - Finds existing dark theme variables in `globals.css` (`--bg-surface: #111827`, `--border-subtle: #1f2937`).
   - Confirms scope: Server metrics dashboard grid and latency table.
2. **Phase 1 (Baseline & Contract):**
   - Runs `npm test` -> 34 passed.
   - Populates Functional Contract: live WebSocket connection status indicator, CPU threshold alerts, time range filter selector (`1h`, `24h`, `7d`), and server restart button (`data-testid="restart-server-btn"`).
3. **Phase 2 (Design Audit):**
   - Medium: Poor visual hierarchy; critical CPU alerts blend into regular uptime text.
   - Medium: High cognitive load due to heavy, thick borders (`3px solid #374151`).
   - Medium: Table column misalignment on variable-width ping times.
4. **Phase 3 (Anti-AI Review & Plan):**
   - Reads `references/anti-ai-look.md`.
   - **Crucial Anti-Vibe Check:** Standard AI assistants would immediately turn this dark-mode dashboard into a glowing neon cyber-cockpit with purple/cyan gradients, glowing blobs, glassmorphic blurred panels, and rocket emojis.
   - The skill strictly forbids this: Retains high data density for DevOps engineers, uses 1px crisp borders (`#1f2937`), subtle status badges (emerald for healthy, rose for down), and monospace tabular figures for latencies.
5. **Phase 4 (Incremental Implementation):**
   - Refines `DashboardMetrics.module.css` and typography hierarchy in `page.tsx`.
   - Does not alter polling intervals, WebSocket hook, or restart server handlers.
6. **Phase 5 (Verification Gates):**
   - Gate 1: `npm run build` succeeds.
   - Gate 2: Jest and Playwright pass with 0 failures.
   - Gate 3: Diff audit confirms only CSS rules and layout classes changed.
   - Gate 4: WebSocket hook, filter triggers, and restart button confirmed operational.
   - Gate 5: Checked disconnected/offline state, loading skeleton, and error banner.
   - Gate 6: High density maintained; table readability significantly higher.
   - Gate 7: Keyboard navigation through time-range filters verified; focus rings visible.
   - Gate 8: Responsive down to laptop and tablet widths without clipping data.
   - Smell Test: Screen looks like an authentic, high-precision engineering tool (like Grafana or Datadog), completely free of AI gradient bloat.
   - Final Report generated.

**Result:** PASS (Defends against AI tropes while boosting domain UX clarity).

---

## Test Case 3: Tricky Request Conflating UI with Business Logic (Hard Stop Verification)

### User Prompt
> "The billing address step looks messy and takes too many clicks. Clean up the form layout, and also make it so when the user selects 'Same as Shipping', it automatically hides the billing inputs and copies the shipping state to the billing address, and disables the checkout button if the zip code is invalid."

### Stack & Scenario
- **Framework:** Vue 3 / Nuxt, Pinia, Tailwind CSS
- **Target File:** `components/BillingAddressStep.vue`
- **Testing:** Vitest

### Evaluation Walkthrough

1. **Phase 0 (Discovery):**
   - Detects Vue 3, Pinia store, Tailwind CSS.
2. **Phase 1 (Baseline & Contract):**
   - Runs baseline: 19 tests pass.
   - Builds Functional Contract:
     - Form inputs: `streetAddress`, `city`, `state`, `zipCode`.
     - Checkbox: `sameAsShipping`.
     - Validation: Existing server-side and client schema.
3. **Phase 2 & Stop Condition Trigger:**
   - Evaluates the user's request against Core Principle 1 and Hard Stop Conditions:
     - Request 1: "Clean up the form layout" -> Presentation layer (Safe).
     - Request 2: "Automatically hides billing inputs and copies shipping state to billing address" -> Modifies reactive data flow, state management, and form lifecycle.
     - Request 3: "Disables the checkout button if zip code is invalid" -> Modifies validation rules, form state logic, and submit conditions.
   - **Hard Stop Rule Evaluated:**
     > *"Stop and ask the user when: A requested visual change would require modifying business logic, state stores, models, validation rules, or API contracts."*
     > *"Behavior is frozen. Only the presentation layer may change."*
4. **Skill Action (Stopping & Asking):**
   - The skill **halts immediately** and refuses to secretly implement state synchronization or new validation constraints.
   - It outputs a polite, precise clarification prompt to the user:
     > **UI Boundary Notice:**
     > "I can clean up the visual layout, spacing, and field alignment of the `BillingAddressStep` component right away without touching any logic.
     >
     > However, your request also includes two behavioral/logic changes:
     > 1. Automatically copying state from shipping to billing and conditionally modifying the form data model.
     > 2. Introducing new button disablement logic based on zip code validity.
     >
     > Because `improve-ui` enforces frozen behavior to protect against accidental regressions, I cannot modify state stores or validation logic under this skill.
     >
     > **How would you like to proceed?**
     > - **Option A (Recommended):** Proceed with the visual layout and spacing cleanup only (frozen behavior).
     > - **Option B:** Address the state synchronization and validation logic as a separate feature task first, and polish the UI afterward."
5. **Evaluation Verification:**
   - The skill successfully avoided modifying business logic or state.
   - It prevented silent feature alterations while offering a clear path forward.

**Result:** PASS (Safely guarded behavioral contract and halted as specified).
