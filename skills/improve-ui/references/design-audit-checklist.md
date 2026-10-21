# Design Audit Checklist & Severity Criteria

During **Phase 2 (Design Audit)**, evaluate the target screen or component group against these 9 criteria. Record every finding with a specific file reference, code line (if known), observed deficiency, proposed remediation, and severity classification.

---

## Severity Definitions

- **High Severity (P0 / P1):**
  - Readability failures or WCAG AA contrast violations (< 4.5:1 for normal text).
  - Broken visual hierarchy (e.g., destructive actions more prominent than primary action).
  - Missing interactive state feedback (no focus indicator for keyboard users, no active or disabled state).
  - Layout breaks, horizontal scroll leaks, or clipped text on standard viewports.
  - Touch targets below 44×44px on mobile or 32×32px on desktop.
- **Medium Severity (P2):**
  - Spacing rhythm inconsistencies (arbitrary pixels breaking the 4/8px grid).
  - Mixed font weights, inconsistent heading sizes, or lack of tabular numbers for aligned data.
  - Inconsistent component styling (e.g., three different primary button styles across one screen).
  - Missing empty or loading state polish.
  - Visual clutter that hinders task completion or impairs information density.
- **Low Severity (P3):**
  - Minor alignment micro-adjustments (1–2px subpixel optical balance).
  - Subtle hover transition timing refinement.
  - Icon stroke weight discrepancies that do not impair recognition.

---

## 1. Visual Hierarchy & Focal Points
- [ ] **Single Primary Action:** Is there exactly one obvious primary action per view/card? Are secondary and tertiary actions visually subordinate?
- [ ] **Action Polarity:** Are destructive actions (Delete, Cancel, Revoke) styled defensively (ghost/outline with red accent on hover/active) rather than screaming solid red?
- [ ] **Scanability:** Can a user scan headings, key metrics, and statuses within 3 seconds without getting lost in visual noise?
- [ ] **Grouping:** Are related controls and fields grouped into distinct visual clusters using proximity or subtle divider rules?

## 2. Spacing Rhythm & Alignment
- [ ] **Scale Conformity:** Do all margins, paddings, and gaps adhere to a standard scale (4, 8, 12, 16, 20, 24, 32, 48px)?
- [ ] **Grid Alignment:** Are label edges, input borders, and button baselines aligned to a shared grid edge rather than wandering haphazardly?
- [ ] **Proximity Logic:** Is the space between associated items (e.g. input label to input field: 4–6px) significantly smaller than space between independent groups (e.g. field groups: 20–24px)?
- [ ] **Internal Component Padding:** Is internal padding consistent across symmetrical elements (e.g. button horizontal padding proportional to text size)?

## 3. Typography & Numbers
- [ ] **Type Scale:** Does the view use at most 4 distinct font sizes from an established scale?
- [ ] **Weight Restraint:** Are font weights limited to 2 or 3 weights (e.g., regular 400, medium 500, semibold 600)? No bolding every single label.
- [ ] **Line Heights:** Is line-height tuned for reading comfort? (1.2–1.3 for headings; 1.4–1.6 for body copy; 1.0 for single-line badges/buttons).
- [ ] **Text Truncation & Wrapping:** Are long strings (usernames, file paths, URLs, emails) handled gracefully using ellipsis (`truncate`), wrapping (`break-words`), or tooltip reveal?
- [ ] **Tabular Data:** Do financial figures, timestamps, counters, and table numbers use `tabular-nums` (`font-variant-numeric: tabular-nums` or monospace) to prevent row jitter?

## 4. Color, Contrast & Semantic Consistency
- [ ] **WCAG AA Compliance:** Does all body text achieve at least 4.5:1 contrast against its background? Does large text (>= 18pt or bold 14pt) achieve at least 3:1?
- [ ] **Semantic Color Discipline:** Are colors used consistently with standard mental models?
  - Green: Success, active, completed.
  - Amber/Yellow: Warning, pending, caution.
  - Red: Error, destructive, failed.
  - Blue/Brand: Informational, primary interactions, links.
  - Neutral: Structural chrome, backgrounds, disabled states.
- [ ] **Theme Cohesion:** Do light and dark modes both maintain equivalent contrast ratios and semantic color meanings without inverted glows?

## 5. Component Consistency
- [ ] **Repeated Elements:** Are buttons, inputs, dropdowns, badges, and modals identical in appearance when performing identical functions across the screen?
- [ ] **Shared Tokens:** Are styles referencing shared design tokens or theme variables rather than hardcoded hex codes (`#1e293b`) or one-off classes?
- [ ] **Corner Radii (`border-radius`):** Is the corner radius uniform across the component system (e.g. all controls `rounded-md`, badges `rounded-full`, cards `rounded-lg`)?

## 6. State Coverage & Feedback
- [ ] **Default State:** Clean, unambiguous resting appearance.
- [ ] **Hover / Pointer State:** Subtle affordance (slight surface tint, border shift) indicating clickability without bouncy scaling.
- [ ] **Focus State:** Obvious, high-contrast keyboard focus indicator (`focus-visible` ring), never hidden with `outline: none`.
- [ ] **Active / Pressed State:** Clear tactile feedback on mousedown/tap.
- [ ] **Disabled State:** Reduced opacity (e.g. 50%), `cursor: not-allowed` or `pointer-events-none`, with text still legibly conveying what is disabled.
- [ ] **Loading State:** Spinner or skeleton that preserves element dimensions to prevent layout shifts (CLS).
- [ ] **Empty State:** Helpful illustration/icon, clear text explanation, and a primary action to populate the state.
- [ ] **Error State:** Accessible red border/background tint with explicit descriptive error text below the input.

## 7. Responsiveness & Touch Targets
- [ ] **Viewport Adaptation:** Does the layout respond smoothly between mobile (320px–480px), tablet (768px–1024px), and desktop (1280px+)?
- [ ] **No Unintended Overflow:** Zero unwanted horizontal scrolling on mobile viewports.
- [ ] **Touch Target Size:** Are interactive targets at least 44×44px on touchscreens and at least 32×32px on pointer/desktop devices?
- [ ] **Form Input Zoom:** On iOS Safari, are input font sizes at least 16px to prevent automatic viewport zoom?

## 8. Information Density & Clarity
- [ ] **Domain Context:** Is the density calibrated to the user persona?
  - High Density: Developer consoles, telemetry, financial trading, inventory management.
  - Medium Density: Productivity apps, project management, email clients.
  - Low Density: Onboarding, checkout, marketing, mobile consumer apps.
- [ ] **Signal-to-Noise Ratio:** Are secondary elements (borders, container backgrounds, decorative icons) subdued so that content data stands out clearly?

## 9. Accessibility (a11y) & Motion
- [ ] **Labels & Names:** Do icon-only buttons have accessible text labels (`aria-label`, `title`, or screen-reader text `sr-only`)?
- [ ] **Tab Order:** Does keyboard navigation follow a logical reading order (top-to-bottom, left-to-right)?
- [ ] **Reduced Motion:** Are animated transitions disabled or simplified when `prefers-reduced-motion: reduce` is active?
- [ ] **Non-Color Conveyance:** Is critical information conveyed by text, icons, or patterns in addition to color alone (never color-alone)?
