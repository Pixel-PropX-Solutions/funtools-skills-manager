# Anti "AI-Generated / Vibe-Coded" Design Guide

When AI tools are asked to "make a UI look better", they overwhelmingly default to a recognizable cluster of styling tropes: purple/indigo gradients, floating glassmorphic cards, glowing neon borders, cartoonish emojis, and generic SaaS marketing microcopy. This destroys the product's identity, clutters interfaces, and alienates domain users (especially in professional, data-dense, or enterprise workflows).

This skill enforces strict adherence to authentic, disciplined product design. **Read this guide before Phase 3 (Planning) on every invocation.**

---

## 1. What to Avoid (Common AI Tells)

| AI Tropes / Tells | Why It Fails | What to Do Instead |
| :--- | :--- | :--- |
| **Purple/Indigo/Cyan Gradients & Neon Glows** | Screams "AI generated boilerplate" or crypto landing page. Distracts from content. | Use the application's existing brand primary color with neutral grays/slates. |
| **Rainbow UI & Arbitrary Multi-Coloring** | Sibling summary cards, stat widgets, or badges painted in arbitrary rainbow hues (e.g. blue, green, purple, amber) look cheap, toy-like, and destroy visual hierarchy. | Keep sibling cards uniform in clean neutral styling (`bg-card`, `bg-white`, `border-neutral-200`/`800`). Confine color strictly to semantic indicators (e.g. green `+12%` delta tag, red `-3%` churn tag, warning callouts). |
| **Pervasive Glassmorphism & Blurs** | Heavy `backdrop-filter: blur()`, semi-transparent frosted panels cause poor contrast, readability problems, and GPU lag. | Use solid, opaque surfaces with subtle border dividers (`border: 1px solid var(--border)`). |
| **Everything as a Rounded Card** | Wrapping every list item, stat, and input in `rounded-2xl` cards with `p-6` destroys visual rhythm and wastes vertical space. | Use flat rows, simple tabular layouts, subtle dividers (`divide-y`), or slight background shifts. Keep corner radii modest (typically 4px–8px / `rounded-md`). |
| **Emoji as Icons or Badges** | Placing 🚀, ✨, 🔥, 📊 next to headers or inside buttons looks amateurish and unbranded. | Use the project's existing SVG icon library (Lucide, Heroicons, Material, FontAwesome) with consistent size and stroke. |
| **Generic Marketing Filler Copy** | Replacing practical labels with "Seamless experience", "Unlock powerful insights", or placeholder buzzwords. | Keep the exact domain language and real microcopy of the application. |
| **Gratuitous Animations & Hover Jumps** | Adding `scale-105`, bouncing badges, pulsing glows, or endless skeleton shimmers on static dashboards. | Restrict animations to functional state transitions (150ms–200ms ease-out). No hover scaling or distracting continuous loops. |
| **Symmetrical Feature Grids with No Hierarchy** | Forcing all metrics into identical 3-column cards regardless of real business importance. | Emphasize key focal metrics while grouping secondary data concisely. Hierarchy reflects business utility, not grid geometry. |
| **Mixed Icon Styles & Stroke Weights** | Mixing 1.5px outline icons with solid glyphs or mismatched optical weights. | Use one unified icon set with identical stroke width (e.g., 1.5px or 2px throughout) and consistent viewBox sizing. |
| **Gradient Text & Oversized Hero Typography** | Putting rainbow text gradients (`bg-clip-text text-transparent`) on standard headers or table titles. | Use crisp, solid-color typography with deliberate weight contrast (e.g., `font-semibold` with high contrast neutral). |
| **Pointless Decorative Accents** | Adding decorative SVG blobs, floating particles, or abstract background patterns to functional apps. | Zero decorative noise. Every pixel must serve orientation, hierarchy, or interaction. |
| **Child Margins/Paddings as Spacers & Alignment Hacks** | Using `mr-4`, `mb-2`, or child padding to create gaps breaks when items wrap, causes uneven outer edges, complicates RTL support, and creates fragile layouts. | Use an explicit container layout (`flex` or `grid`) and govern all inter-item spacing with `gap` (`gap-4`, `gap-x-2`). Default to Flexbox; use Grid for complex 2D layouts. Never use margin or padding for gaps between row/col siblings. |

---

## 2. What to Prefer (Disciplined Product Design)

### A. Color & Surfaces
- **Restrained Palette:** Exactly one primary brand accent, a functional neutral scale (white to dark gray/slate), and semantic colors (success green, warning amber, error red, info blue) reserved strictly for status.
- **Anti-Rainbow Discipline & Card Uniformity:**
  - Sibling components (such as a 4-card metric or stat summary grid) must share uniform, disciplined neutral surfaces (`bg-card` / `bg-white` / `bg-neutral-900`, 1px neutral hairline border `border-neutral-200`/`800`).
  - **Never** paint each summary card with a different rainbow background (e.g., Card 1 blue, Card 2 green, Card 3 amber, Card 4 purple) or decorative rainbow borders. It looks cheap, chaotic, and amateurish.
  - Color belongs **inside** the card strictly where required by semantics: for example, a subtle green `+12.4%` badge for positive growth or a red `-3.1%` badge for churn.
- **Remediating Existing Rainbows in Legacy Code:**
  - When auditing and improving an existing screen, if you encounter legacy rainbow cards, multi-colored border accents, or arbitrary icon background tints, **actively strip them**.
  - Normalize all cards to the application's clean neutral surface system.
  - Isolate colors strictly to the 5 semantic roles:
    1. **Danger / Destructive (Red):** Errors, delete actions, critical threshold warnings.
    2. **Warning / Caution (Amber/Yellow):** Expiring items, pending reviews, non-blocking cautions.
    3. **Success / Positive (Green):** Verified states, positive trends, completed statuses.
    4. **Primary Brand Accent (Single Color):** Key focal interactive controls (primary buttons, active tabs).
    5. **Informational / Neutral (Slate/Gray):** General metrics, secondary chrome, inactive states.
- **Before vs. After: Sibling Metric Cards:**
  ```tsx
  // ❌ BAD: Cheap, noisy rainbow cards
  <div className="grid grid-cols-4 gap-4">
    <div className="bg-blue-50 border-blue-200 text-blue-900 p-4 rounded-xl">
      <h4>Total Revenue</h4><p>$45,230</p>
    </div>
    <div className="bg-emerald-50 border-emerald-200 text-emerald-900 p-4 rounded-xl">
      <h4>Active Users</h4><p>2,340</p>
    </div>
    <div className="bg-amber-50 border-amber-200 text-amber-900 p-4 rounded-xl">
      <h4>Pending Tickets</h4><p>18</p>
    </div>
    <div className="bg-purple-50 border-purple-200 text-purple-900 p-4 rounded-xl">
      <h4>Conversion Rate</h4><p>4.2%</p>
    </div>
  </div>

  // ✅ GOOD: Clean, uniform neutral surfaces with semantic indicators
  <div className="grid grid-cols-4 gap-4">
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-lg">
      <span className="text-xs font-medium text-neutral-500">Total Revenue</span>
      <div className="flex items-baseline justify-between mt-1">
        <span className="text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">$45,230</span>
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">+12.4%</span>
      </div>
    </div>
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-lg">
      <span className="text-xs font-medium text-neutral-500">Active Users</span>
      <div className="flex items-baseline justify-between mt-1">
        <span className="text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">2,340</span>
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">+5.1%</span>
      </div>
    </div>
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-lg">
      <span className="text-xs font-medium text-neutral-500">Pending Tickets</span>
      <div className="flex items-baseline justify-between mt-1">
        <span className="text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">18</span>
        <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">Needs action</span>
      </div>
    </div>
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-lg">
      <span className="text-xs font-medium text-neutral-500">Conversion Rate</span>
      <div className="flex items-baseline justify-between mt-1">
        <span className="text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">4.2%</span>
        <span className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">-0.4%</span>
      </div>
    </div>
  </div>
  ```
- **Surface Elevation via Borders:** Prefer 1px hairline borders (`border-neutral-200` in light mode, `border-neutral-800` in dark mode) and subtle surface shifts (`bg-neutral-50` vs `bg-white`) over heavy multi-layered drop shadows (`box-shadow`).
- **Dark Mode Discipline:** Avoid pitch-black (`#000000`) paired with neon cyan. Use deep slate or charcoal surfaces (`#0f172a`, `#18181b`) with muted borders and desaturated status tags.

### B. Typography & Numbers
- **Deliberate Type Scale:** Stick to a 5–6 step scale (e.g., 12px, 14px, 16px, 20px, 24px, 32px).
- **Tabular Figures for Data:** In any table, financial view, timer, or metrics dashboard, use tabular numbers (`font-variant-numeric: tabular-nums` or `font-mono`) so numbers align vertically across rows.
- **Weight Contrast over Size Contrast:** Often a 14px `font-medium` label paired with a 20px `font-semibold` value is cleaner than massive 36px headings.
- **Line Heights:** Tighter line-heights (`leading-tight` / 1.2–1.3) for large headings, relaxed line-heights (`leading-normal` / 1.5) for multi-line body text.

### C. Layout Architecture, Grid & Gap-First Spacing
- **4px / 8px Grid:** All margins, paddings, gaps, and heights must be multiples of 4 (4, 8, 12, 16, 20, 24, 32, 48, 64px). Never use arbitrary one-off values (e.g., `margin-top: 19px` or `padding: 13px 27px`).
- **Proximity Principle:** Related elements (e.g., label + input) have smaller gap (e.g., 4px–6px); unrelated sections have larger gap (e.g., 24px–32px).
- **Rule 1: Strict Gap-First Spacing (Padding for Inside, Margin for Outside, Gap for Between):**
  - **`padding` is strictly for internal component insets** (inside a card, button, badge, modal, or input).
  - **`margin` is strictly for outer separation** between major independent structural blocks or sections.
  - **`gap` is the sole mechanism for separating sibling items in rows or columns.**
  - **NEVER** use `margin-right`, `margin-bottom`, `margin-left`, `margin-top` or child `padding` to create spacing between items in a row or column sequence. Child margins break wrap boundaries, cause uneven outer edges, and complicate responsive or RTL layouts.
- **Rule 2: Layout Selection Hierarchy (Flex by Default, Grid for Complex UI):**
  - **Default to Flexbox (`display: flex` / `flex flex-row` / `flex flex-col`)** for 1-dimensional arrangements (navigation bars, toolbars, button groups, badge lists, input-with-label stacks, header rows).
  - **Use CSS Grid (`display: grid` / `grid grid-cols-*`)** when the UI is complex and multi-dimensional (card grids, multi-track metric dashboards, responsive matrices where items must align across rows and columns simultaneously).
  - In both Flex and Grid layouts, all inter-item spacing must be handled with `gap` (`gap-*`, `gap-x-*`, `gap-y-*`).
- **Rule 3: Unified Single-Engine Alignment:**
  - Always commit to one explicit layout model per container. Never mix floats, inline-block whitespace tricks, or manual spacer elements for alignment.
- **Before vs. After: Layout & Gap Discipline:**
  ```tsx
  // ❌ BAD: Margin/padding hacks for sibling spacing, ad-hoc inline blocks
  <div className="button-group">
    <button className="mr-3 pr-2">Cancel</button>
    <button className="mr-3">Save Draft</button>
    <button>Publish</button>
  </div>

  // ✅ GOOD: Explicit Flex container with gap
  <div className="flex items-center gap-3">
    <button>Cancel</button>
    <button>Save Draft</button>
    <button>Publish</button>
  </div>

  // ❌ BAD: Stacking items with child margin-bottom
  <form>
    <div className="mb-4"><label>Name</label><input /></div>
    <div className="mb-4"><label>Email</label><input /></div>
    <div className="mb-4"><label>Role</label><input /></div>
  </form>

  // ✅ GOOD: Explicit Flex column with gap
  <form className="flex flex-col gap-4">
    <div className="flex flex-col gap-1.5"><label>Name</label><input /></div>
    <div className="flex flex-col gap-1.5"><label>Email</label><input /></div>
    <div className="flex flex-col gap-1.5"><label>Role</label><input /></div>
  </form>

  // ❌ BAD: Complex 2D card layout with floating blocks and uneven child margins
  <div className="card-container overflow-hidden">
    <div className="float-left w-1/3 pr-4 mb-4">...</div>
    <div className="float-left w-1/3 pr-4 mb-4">...</div>
    <div className="float-left w-1/3 mb-4">...</div>
  </div>

  // ✅ GOOD: Explicit CSS Grid with gap
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div>...</div>
    <div>...</div>
    <div>...</div>
  </div>
  ```

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

Before declaring any UI improvement complete in Phase 5, run this 7-question smell test:

1. **The Template Test:**
   * *Question:* "Could this screen belong to any generic template or AI starter kit?"
   * *Check:* What specific detail (custom iconography, domain terminology, brand token, data layout) ties it authentically to this product and its users?
2. **The Rainbow & Color Restraint Test:**
   * *Question:* "Are cards, stats, or UI elements colored with arbitrary rainbow hues (e.g. 4 stat cards with 4 different background or border colors)?"
   * *Action:* If yes, remove arbitrary colors immediately. Unify cards with consistent neutral surfaces and borders. Restrict color to semantic warnings, danger actions, success states, or the single primary brand accent.
3. **The Gradient & Shadow Test:**
   * *Question:* "Is there any purple/blue/cyan gradient, glowing border, or floating glassmorphic card?"
   * *Action:* If yes, remove it immediately. Replace with solid brand tokens and subtle 1px border dividers.
4. **The Emoji & Clutter Test:**
   * *Question:* "Are there any emojis serving as UI icons, or decorative shapes carrying no information?"
   * *Action:* If yes, replace emojis with project SVG icons or remove them entirely.
5. **The Density Test:**
   * *Question:* "Did we inflate spacing so much that users can see less relevant data than before?"
   * *Action:* If yes, tighten the vertical rhythm and restore domain-appropriate density.
6. **The Microcopy Test:**
   * *Question:* "Did we add vague marketing phrases or generic placeholder copy?"
   * *Action:* Revert to authentic domain terminology.
7. **The Layout Engine & Gap-First Test:**
   * *Question:* "Are any child items using margins (e.g. `mr-4`, `mb-2`) or paddings to push against adjacent row or column siblings? Are there any ad-hoc alignment hacks instead of explicit Flex or Grid?"
   * *Action:* If yes, strip the child margins/paddings immediately. Wrap the items in an explicit single layout container (`flex` for 1D, `grid` for complex 2D) and apply the appropriate `gap` token.

If any smell test fails, fix it before requesting review or declaring the task done.
