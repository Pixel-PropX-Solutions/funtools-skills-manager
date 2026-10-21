# Verification Gates & Diff Audit Reference

Every invocation of `improve-ui` must enforce strict verification gates before declaring work complete. **Zero compromises.** If any gate fails, you must either fix the issue immediately or revert the offending change. You may never report success when a gate is in a failing state.

---

## The 8 Verification Gates

### Gate 1: Build, Lint & Type-Check
- **Objective:** Verify syntactic and structural compilation integrity.
- **Procedure:**
  1. Run the project's native build command (e.g. `npm run build`, `pnpm build`, `cargo check`, `flutter build`).
  2. Run the linter (e.g. `npm run lint`, `eslint .`, `ruff check`).
  3. Run the type-checker (e.g. `tsc --noEmit`, `mypy`).
- **Pass Criteria:** 0 new errors, 0 new warnings compared to the Phase 1 Baseline.
- **Fail Action:** If new errors or warnings appear, inspect recent edits, fix styling syntax or missing class names, or revert.

### Gate 2: Existing Test Suite
- **Objective:** Ensure automated regression protection remains unbroken.
- **Procedure:**
  1. Run the project's test command (e.g. `npm test`, `vitest run`, `jest`, `pytest`, `flutter test`).
- **Pass Criteria:** 100% of tests that passed during baseline continue to pass.
- **Strict Rule on Test Failures:**
  - **NEVER** edit, weaken, or delete assertions or test cases to force tests to pass.
  - If a test fails because a CSS selector, element text, or test ID was altered:
    1. Check if the change broke the Functional Contract.
    2. If the test targeted a purely stylistic selector (e.g., `.btn-primary` or exact button text), **do not edit the test secretly**. Stop, report the test failure to the user, explain why the selector shifted, and request user permission before updating the test selector.

### Gate 3: Diff Audit (Logic & Presentation Isolation)
- **Objective:** Certify that only presentation-layer code was modified.
- **Procedure:**
  1. Run `git diff` (or execute `scripts/diff-audit.sh`).
  2. Inspect every single touched file and every added/removed line.
  3. Categorize every change into:
     - **Presentational:** CSS rules, style attributes, Tailwind utility classes, layout wrapper tags (`div`, `span`, `Container`), icon component replacements (exact swap).
     - **Non-Presentational:** Event handler functions, API calls, hooks (`useState`, `useEffect`, `useQuery`), state reducers, validation regex/logic, conditional branching expressions (`if`, `switch`, ternary business checks), route paths, authorization checks.
- **Pass Criteria:** Zero non-presentational lines modified.
- **Fail Action:** Any modified non-presentational line must either be immediately reverted or justified and presented to the user for explicit approval.

### Gate 4: Functional Contract Verification
- **Objective:** Verify that every interactive capability defined in Phase 1 still exists and operates identically.
- **Procedure:**
  1. Open the populated `Functional Contract` file from Phase 1.
  2. Walk down every table row:
     - Every button, link, and input still exists with its original handler/props.
     - All `data-testid`, `id`, `aria-label`, and `name` attributes are preserved.
     - Form validation triggers and error displays function as specified.
     - Route entry and exit points remain untouched.
     - Conditional data rendering conditions are preserved verbatim.
  3. If a runnable dev environment is available, manually exercise the interactions or run automated E2E tests.
- **Pass Criteria:** 100% contract compliance.

### Gate 5: State Coverage Check
- **Objective:** Prevent "happy-path-only" designs by inspecting all edge states.
- **Procedure:**
  1. **Loading State:** Check spinners, skeleton loaders, or progress bars. Ensure they match the updated container geometry and do not cause Cumulative Layout Shift (CLS).
  2. **Empty State:** Trigger or view zero-data state. Ensure illustration/icon, clear text, and call-to-action are aligned and readable.
  3. **Error State:** Verify inline field validation errors and top-level error banners. Ensure red tints meet contrast requirements and error text is unclipped.
  4. **Disabled State:** Verify disabled buttons and inputs. Check that styling indicates inactive status without becoming invisible.
  5. **Keyboard Focus State:** Press `Tab` through all interactive elements. Verify crisp, visible focus rings.
- **Pass Criteria:** All states render cleanly without layout overflow or missing styles.

### Gate 6: Visual Comparison (Before vs. After)
- **Objective:** Confirm visual enhancements and catch unintended regressions.
- **Procedure:**
  1. If dev server / browser preview is available:
     - Capture "after" screenshots matching the exact viewports and states recorded in Phase 1.
     - Place side-by-side with baseline images.
     - Check for text truncation (`...`), unintentional line wraps, clipped containers, padding asymmetry, and broken flexbox/grid alignments.
  2. If running headlessly without screenshot capability:
     - State explicitly in the report: `Gate 6: NOT RUN (No graphical environment available. Conducted static DOM and CSS inspection instead)`.
- **Pass Criteria:** Noticeable improvement in clarity and polish; zero visual clipping or unintended wrapping.

### Gate 7: Accessibility (a11y) & Motion Check
- **Objective:** Ensure usability for disabled users and keyboard navigators.
- **Procedure:**
  1. **Contrast Check:** Verify all modified foreground text and icons against background surfaces using WCAG AA (minimum 4.5:1 for normal text, 3:1 for large text/icons).
  2. **Touch Targets:** Verify minimum 44×44px on mobile or 32×32px on desktop.
  3. **Screen Readers:** Verify all icon-only buttons maintain `aria-label` or accessible names.
  4. **Motion Sensitivity:** Verify CSS includes `@media (prefers-reduced-motion: reduce)` rules or uses standard transitions that turn off without breaking layout.
- **Pass Criteria:** Zero accessibility regressions.

### Gate 8: Responsive & Theme Verification
- **Objective:** Guarantee cross-device and multi-theme stability.
- **Procedure:**
  1. Test at minimum: Mobile viewport (375px or 390px width) and Desktop viewport (1280px+ width).
  2. Verify that light mode and dark mode (if supported by app) maintain clean contrast and matching semantic hierarchy.
  3. Check long text resilience (e.g. double string length in labels or tables) to ensure layout does not break or overflow horizontally.
  4. Check browser font scaling (simulate 200% zoom); ensure critical controls remain reachable.
- **Pass Criteria:** No horizontal overflow, readable at all viewports, coherent theme switching.

---

## Handling Environment Constraints

If a specific verification gate cannot be run (for example, no test suite exists in the repository, or no browser runtime is available to take screenshots):
1. **Never mark a skipped gate as "PASS".**
2. Mark the gate as `NOT RUN: <specific reason>` in the final report.
3. Perform the closest static substitute (e.g., static DOM analysis instead of live screenshots, lint/type-check instead of automated tests).
4. State all limitations transparently to the user.
