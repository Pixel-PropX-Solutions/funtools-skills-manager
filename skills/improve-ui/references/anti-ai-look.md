# Anti "AI-Generated / Vibe-Coded" Design Guide

When AI tools are asked to "make a UI look better", they overwhelmingly default to a recognizable cluster of styling tropes: purple/indigo gradients, floating glassmorphic cards, glowing neon borders, cartoonish emojis, and generic SaaS marketing microcopy. This destroys the product's identity, clutters interfaces, and alienates domain users (especially in professional, data-dense, or enterprise workflows).

This skill enforces strict adherence to authentic, disciplined product design. **Read this guide before Phase 3 (Planning) on every invocation.**

---

## 1. What to Avoid (Common AI Tells)

| AI Tropes / Tells | Why It Fails | What to Do Instead |
| :--- | :--- | :--- |
| **Purple/Indigo/Cyan Gradients & Neon Glows** | Screams "AI generated boilerplate" or crypto landing page. Distracts from content. | Use the application's existing brand primary color with neutral grays/slates. |
| **Pervasive Glassmorphism & Blurs** | Heavy `backdrop-filter: blur()`, semi-transparent frosted panels cause poor contrast, readability problems, and GPU lag. | Use solid, opaque surfaces with subtle border dividers (`border: 1px solid var(--border)`). |
| **Everything as a Rounded Card** | Wrapping every list item, stat, and input in `rounded-2xl` cards with `p-6` destroys visual rhythm and wastes vertical space. | Use flat rows, simple tabular layouts, subtle dividers (`divide-y`), or slight background shifts. Keep corner radii modest (typically 4px–8px / `rounded-md`). |
| **Emoji as Icons or Badges** | Placing 🚀, ✨, 🔥, 📊 next to headers or inside buttons looks amateurish and unbranded. | Use the project's existing SVG icon library (Lucide, Heroicons, Material, FontAwesome) with consistent size and stroke. |
| **Generic Marketing Filler Copy** | Replacing practical labels with "Seamless experience", "Unlock powerful insights", or placeholder buzzwords. | Keep the exact domain language and real microcopy of the application. |
| **Gratuitous Animations & Hover Jumps** | Adding `scale-105`, bouncing badges, pulsing glows, or endless skeleton shimmers on static dashboards. | Restrict animations to functional state transitions (150ms–200ms ease-out). No hover scaling or distracting continuous loops. |
| **Symmetrical Feature Grids with No Hierarchy** | Forcing all metrics into identical 3-column cards regardless of real business importance. | Emphasize key focal metrics while grouping secondary data concisely. Hierarchy reflects business utility, not grid geometry. |
| **Mixed Icon Styles & Stroke Weights** | Mixing 1.5px outline icons with solid glyphs or mismatched optical weights. | Use one unified icon set with identical stroke width (e.g., 1.5px or 2px throughout) and consistent viewBox sizing. |
| **Gradient Text & Oversized Hero Typography** | Putting rainbow text gradients (`bg-clip-text text-transparent`) on standard headers or table titles. | Use crisp, solid-color typography with deliberate weight contrast (e.g., `font-semibold` with high contrast neutral). |
| **Pointless Decorative Accents** | Adding decorative SVG blobs, floating particles, or abstract background patterns to functional apps. | Zero decorative noise. Every pixel must serve orientation, hierarchy, or interaction. |

---

## 2. What to Prefer (Disciplined Product Design)

### A. Color & Surfaces
- **Restrained Palette:** Exactly one primary brand accent, a functional neutral scale (white to dark gray/slate), and semantic colors (success green, warning amber, error red, info blue) reserved strictly for status.
- **Surface Elevation via Borders:** Prefer 1px hairline borders (`border-neutral-200` in light mode, `border-neutral-800` in dark mode) and subtle surface shifts (`bg-neutral-50` vs `bg-white`) over heavy multi-layered drop shadows (`box-shadow`).
- **Dark Mode Discipline:** Avoid pitch-black (`#000000`) paired with neon cyan. Use deep slate or charcoal surfaces (`#0f172a`, `#18181b`) with muted borders and desaturated status tags.

### B. Typography & Numbers
- **Deliberate Type Scale:** Stick to a 5–6 step scale (e.g., 12px, 14px, 16px, 20px, 24px, 32px).
- **Tabular Figures for Data:** In any table, financial view, timer, or metrics dashboard, use tabular numbers (`font-variant-numeric: tabular-nums` or `font-mono`) so numbers align vertically across rows.
- **Weight Contrast over Size Contrast:** Often a 14px `font-medium` label paired with a 20px `font-semibold` value is cleaner than massive 36px headings.
- **Line Heights:** Tighter line-heights (`leading-tight` / 1.2–1.3) for large headings, relaxed line-heights (`leading-normal` / 1.5) for multi-line body text.

### C. Spacing Rhythm & Grid
- **4px / 8px Grid:** All margins, paddings, gaps, and heights must be multiples of 4 (4, 8, 12, 16, 20, 24, 32, 48, 64px). Never use arbitrary one-off values (e.g., `margin-top: 19px` or `padding: 13px 27px`).
- **Proximity Principle:** Related elements (e.g., label + input) have smaller gap (e.g., 4px–6px); unrelated sections have larger gap (e.g., 24px–32px).

### D. Information Density & Domain Fit
- **Domain Respect:** A developer terminal, an ERP inventory screen, or a stock trading terminal *must be dense*. Do not "clean it up" by inflating padding, hiding essential data, or adding whitespace that requires endless scrolling.
- **Consumer vs Enterprise:** A consumer checkout flow benefits from focused, breathing whitespace. An internal administration table benefits from compact row heights, explicit column headers, and inline actions.

### E. Microcopy & Feedback
- **Real Microcopy:** Keep the tone practical, concise, and helpful.
- **Empty States:** Provide a clear illustration/icon from the app's icon set, a 1-sentence explanation of why it's empty, and a primary action button to get started. Never leave a dead end.
- **Meaningful Errors:** Clearly identify what field failed, why it failed, and what the user must do to fix it.

### F. Motion & Accessibility
- **State Transitions Only:** Motion should solely communicate status change (e.g., accordion open/close, dropdown reveal, toast appearance).
- **Respect `prefers-reduced-motion`:** Disable non-essential transitions when the user's OS requests reduced motion.
- **Focus Rings:** Ensure high-contrast, visible keyboard focus rings (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`). Never remove focus outlines without providing an accessible alternative.

---

## 3. The "Smell Test" Checklist

Before declaring any UI improvement complete in Phase 5, run this 5-question smell test:

1. **The Template Test:**
   * *Question:* "Could this screen belong to any generic template or AI starter kit?"
   * *Check:* What specific detail (custom iconography, domain terminology, brand token, data layout) ties it authentically to this product and its users?
2. **The Gradient & Shadow Test:**
   * *Question:* "Is there any purple/blue/cyan gradient, glowing border, or floating glassmorphic card?"
   * *Action:* If yes, remove it immediately. Replace with solid brand tokens and subtle 1px border dividers.
3. **The Emoji & Clutter Test:**
   * *Question:* "Are there any emojis serving as UI icons, or decorative shapes carrying no information?"
   * *Action:* If yes, replace emojis with project SVG icons or remove them entirely.
4. **The Density Test:**
   * *Question:* "Did we inflate spacing so much that users can see less relevant data than before?"
   * *Action:* If yes, tighten the vertical rhythm and restore domain-appropriate density.
5. **The Microcopy Test:**
   * *Question:* "Did we add vague marketing phrases or generic placeholder copy?"
   * *Action:* Revert to authentic domain terminology.

If any smell test fails, fix it before requesting review or declaring the task done.
