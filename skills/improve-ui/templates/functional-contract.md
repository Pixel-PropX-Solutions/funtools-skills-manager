# Functional Contract: Target Scope

> **Contract Rule:** All items listed below are frozen in behavior. During UI/UX improvements, styles, layout classes, and non-semantic wrapping may change, but interactive actions, data bindings, test hooks, and routing behavior must remain completely intact.

---

## 1. Scope Metadata
- **Target Screen / Component Group:** `[e.g., /checkout - OrderSummary.tsx]`
- **Repository Path(s):** `[file path(s)]`
- **Baseline Date/Time:** `[ISO timestamp]`
- **Baseline Test Suite Status:** `[e.g., 24/24 passing, 0 failing]`
- **Baseline Build / Typecheck Status:** `[e.g., 0 errors, 0 warnings]`

---

## 2. Interactive Elements & Behaviors
| Element Identifier / Visible Label | Selector / Component | Event / Gesture | Expected Action / Handler | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `[e.g., "Submit Order" button]` | `button[type="submit"]` | `onClick` | Calls `handleSubmit()`, triggers checkout API | Primary CTA |
| `[e.g., "Apply Coupon" button]` | `#apply-coupon-btn` | `onClick` | Dispatches coupon validation action | Secondary action |
| `[e.g., "Remove item" link]` | `[data-testid="remove-item"]` | `onClick` | Deletes line item via `removeItem(id)` | Must confirm prompt |

---

## 3. Form Fields, Validation Rules & States
| Field Name / Label | Input Type | Validation Rules | Error State Behavior | Disabled Conditions |
| :--- | :--- | :--- | :--- | :--- |
| `[e.g., Shipping Address]` | `input[text]` | Required, min 5 chars | Inline error message below input | Disabled during checkout submit |
| `[e.g., Payment Method]` | `radio-group` | One must be selected | Top banner alert if unselected | Disabled if cart empty |

---

## 4. Routes & Navigation Flows
- **Entry Points:**
  - Route: `[e.g., /cart -> /checkout]`
  - Query Parameters / State: `[e.g., ?step=payment]`
- **Exit Points / Transitions:**
  - Success Route: `[e.g., /order-confirmation/:id]`
  - Back / Cancel Route: `[e.g., /cart]`
  - Modal / Sheet Overlays: `[e.g., Terms of Service modal dialog]`

---

## 5. Critical Identifiers & Automation Hooks (DO NOT RENAME / REMOVE)
| Identifier Name | Attribute Type (`id`, `data-testid`, `aria-label`, `key`) | Purpose / Dependent Tests |
| :--- | :--- | :--- |
| `[e.g., checkout-submit-btn]` | `data-testid` | Targeted by Cypress checkout flow test |
| `[e.g., order-subtotal]` | `id` | Read by screen-reader & integration test |
| `[e.g., Close dialog]` | `aria-label` | Accessible dismiss button |

---

## 6. Data Bindings & Conditional Rendering Rules
| Condition / State Variable | UI Effect / Element Rendered | Dependencies |
| :--- | :--- | :--- |
| `[e.g., isLoading === true]` | Show skeleton / spinner overlay; disable submit button | `useCart()` query |
| `[e.g., items.length === 0]` | Render Empty Cart illustration & "Browse Products" link | Redux cart state |
| `[e.g., discountApplied]` | Render Discount line item in green with badge | Promo code state |

---

## 7. Baseline Visual Snapshot (Pre-Change)
- **Runnable Environment Available:** `[YES / NO]`
- **Screenshots Captured:**
  - `[e.g., baseline-desktop-light.png]`
  - `[e.g., baseline-mobile-light.png]`
  - `[e.g., baseline-desktop-dark.png]`
- **Static Baseline Notes (if no screenshot environment):**
  - `[e.g., Captured existing DOM structure and computed styles for OrderSummary component]`
