# Rules Catalog: `ui-clean-code`

A comprehensive, categorized guide of all architectural rules in the `ui-clean-code` standard. Each rule is documented with its technical rationale and concrete Good/Bad code examples.

---

## Table of Contents
1. [Group 1: Decomposition](#group-1-decomposition)
2. [Group 2: Folder Structure](#group-2-folder-structure)
3. [Group 3: Naming](#group-3-naming)
4. [Group 4: Entry-File Conventions](#group-4-entry-file-conventions)
5. [Group 5: Logic / UI Separation](#group-5-logic--ui-separation)
6. [Group 6: Placement (Lowest Common Ancestor)](#group-6-placement-lowest-common-ancestor)
7. [Group 7: Cross-Feature Reuse](#group-7-cross-feature-reuse)

---

## Group 1: Decomposition

### Rule 1.1: Component Tree Mirroring
The filesystem folder tree must mirror the runtime visual containment tree of the components.
- **Rationale:** When the folder hierarchy reflects the JSX nesting structure, developers can navigate the codebase using their mental model of the UI layout without relying on global file search.
- **Bad Example:**
  ```
  # Flat, disconnected folder structure
  screens/
  ├── CreateProfile.tsx          # 450 lines of JSX and state
  ├── StepsIndicator.tsx         # Used only by CreateProfile, but floating loosely
  ├── StepPersonalInfo.tsx       # Floating loosely
  └── StepAccountDetails.tsx     # Floating loosely
  ```
- **Good Example:**
  ```
  # Folder tree mirrors visual containment
  CreateProfile/
  ├── index.tsx                  # <StepsIndicator /> + <Steps />
  ├── useCreateProfile.ts        # Logic hook
  └── UI/
      ├── StepsIndicator/
      │   └── index.tsx
      └── Steps/
          ├── index.tsx          # Step switcher
          ├── PersonalInfo/
          │   └── index.tsx
          └── AccountDetails/
              └── index.tsx
  ```

---

### Rule 1.2: Structure-First Splitting & Anti-Fragmentation
Decompose components based on UI layout sub-structures and cognitive clarity, not premature line counting. Do not split code unnecessarily if the component remains cohesive and easy to understand.
- **Rationale:** Arbitrary, hyper-aggressive line-count splitting (e.g., splitting every 80 lines) forces unnecessary file-hopping and cognitive fragmentation for trivial markup.
- **Splitting Triggers:**
  1. The component has distinct visual sections (e.g. multi-step panels, distinct tabs, header/content/footer zones).
  2. The file becomes difficult to navigate, read, or reason about.
  3. The file approaches the default ceiling of **~400 lines**.
- **Bad Example:** Splitting a 60-line simple form card into 4 separate files across 3 folders just to meet an arbitrary 20-line quota.
- **Good Example:** Keeping a simple 120-line form in a single file while it remains simple, but splitting it into `UI/PersonalInfo/` and `UI/BillingInfo/` as soon as distinct form sections emerge.

---

### Rule 1.3: Single Responsibility & View Purity
UI components must focus on layout, rendering, and accessibility; business logic, side-effects, and data queries belong in custom hooks.
- **Rationale:** Mixing API requests and complex validation directly inside JSX components makes them brittle, hard to test with visual tools (like Storybook), and resistant to refactoring.
- **Bad Example:**
  ```tsx
  export function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setLoading(false);
        });
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
      <table>
        {orders.map(order => (
          <tr key={order.id}><td>{order.id}</td><td>${order.total.toFixed(2)}</td></tr>
        ))}
      </table>
    );
  }
  ```
- **Good Example:**
  ```tsx
  // OrderHistory/index.tsx
  import { useOrderHistory } from './useOrderHistory';
  import { OrderTable } from './UI/OrderTable';
  import { OrderSkeleton } from './UI/OrderSkeleton';

  export function OrderHistory() {
    const { orders, isLoading, formatCurrency } = useOrderHistory();

    if (isLoading) return <OrderSkeleton />;

    return <OrderTable orders={orders} formatCurrency={formatCurrency} />;
  }
  ```

---

### Rule 1.4: Composition over Configuration
Prefer composing smaller components via `children` or compound sub-components over creating giant components governed by dozens of boolean props.
- **Rationale:** Components with numerous flags (`hasHeader`, `isCompact`, `withBorder`, `showSecondaryAction`) explode in cyclomatic complexity and become regression hotspots.
- **Bad Example:**
  ```tsx
  <AppModal
    isOpen={isOpen}
    title="Confirm Delete"
    showCloseButton={true}
    hasWarningIcon={true}
    confirmText="Delete"
    confirmVariant="destructive"
    onConfirm={handleDelete}
    content="Are you sure you want to delete this record?"
  />
  ```
- **Good Example:**
  ```tsx
  <Modal isOpen={isOpen} onClose={handleClose}>
    <Modal.Header title="Confirm Delete" icon={<WarningIcon />} />
    <Modal.Body>Are you sure you want to delete this record?</Modal.Body>
    <Modal.Footer>
      <Button variant="ghost" onClick={handleClose}>Cancel</Button>
      <Button variant="destructive" onClick={handleDelete}>Delete</Button>
    </Modal.Footer>
  </Modal>
  ```

---

## Group 2: Folder Structure

### Rule 2.1: Component-as-a-Folder
Every component lives in its own dedicated directory containing an `index.tsx` entry point.
- **Rationale:** Loose component files (`Button.tsx`, `ButtonHelper.ts`, `button.module.css`) clutter directories and make future refactoring risky. A directory creates a clear boundary of privacy.
- **Bad Example:**
  ```
  src/components/
  ├── StepsIndicator.tsx
  ├── StepsIndicatorHelpers.ts
  ├── StepsIndicatorItem.tsx
  └── StepsIndicator.module.css
  ```
- **Good Example:**
  ```
  src/components/
  └── StepsIndicator/
      ├── index.tsx
      ├── helpers.ts
      ├── item.tsx
      └── styles.module.css
  ```

---

### Rule 2.2: Local `UI/` Subfolder for Decomposition
When a component is decomposed into sub-components, place those child sub-components inside a local `UI/` folder within that component's directory.
- **Rationale:** Explicitly separates visual child components from hooks (`useFoo.ts`), types (`types.ts`), and helper utilities (`utils.ts`).
- **Good Example:**
  ```
  UserProfileCard/
  ├── index.tsx                # Main entry
  ├── useUserProfile.ts        # Logic hook
  ├── types.ts                 # Local types
  └── UI/
      ├── AvatarBadge/
      │   └── index.tsx
      ├── UserStats/
      │   └── index.tsx
      └── ActionMenu/
          └── index.tsx
  ```

---

### Rule 2.3: Feature `shared/` vs. Screen-Local
Components used by only one screen stay under that screen's folder. Components shared by multiple screens within a single feature belong in that feature's `shared/UI/` folder.
- **Rationale:** Prevents polluting the global application root with components that only have meaning within a single business domain.
- **Good Example:**
  ```
  features/orders/
  ├── screens/
  │   ├── OrderListScreen/
  │   └── OrderDetailScreen/
  └── shared/
      └── UI/
          └── OrderStatusBadge/  # Consumed by both OrderList and OrderDetail
              └── index.tsx
  ```

---

## Group 3: Naming

### Rule 3.1: Project-First Naming with PascalCase Fallback
Always inspect and conform to the host project's established naming conventions. If the project lacks clear conventions, default to **`PascalCase`** for all component directories and entry files.
- **Rationale:** Consistency within an existing codebase is paramount. When building in a greenfield project or one without defined patterns, `PascalCase` provides clear alignment with standard JSX identifier conventions.
- **Rule Hierarchy:**
  1. *Existing Project Rule:* If the project consistently uses `kebab-case` (e.g. `user-profile/index.tsx`), match it.
  2. *Fallback Standard:* If inconsistent or undefined, use `PascalCase` (e.g. `UserProfile/index.tsx`, `StepsIndicator/index.tsx`).

---

### Rule 3.2: Purpose-Driven Component Naming
Name components after their domain identity or functional role, never after accidental styling or layout positions.
- **Rationale:** Layout positions change during redesigns; semantic identities remain stable.
- **Bad Example:** `TopRightContainer.tsx`, `BlueRoundedButton.tsx`, `LeftSidebarCard.tsx`.
- **Good Example:** `UserGreeting.tsx`, `PrimaryActionButton.tsx`, `FilterNavigationPanel.tsx`.

---

### Rule 3.3: Action-Entity Hook Naming
Name custom hooks managing business logic using the `use[Action][Entity]` convention.
- **Rationale:** Immediately clarifies the domain responsibility and lifecycle intent of the hook.
- **Good Example:** `useCreateProfile()`, `useUpdateProduct()`, `useFetchOrderList()`.

---

## Group 4: Entry-File Conventions

### Rule 4.1: The "Table of Contents" Rule
The entry file `index.tsx` of any screen or composite component must read like a table of contents. A developer scanning `index.tsx` should comprehend the entire visual layout within seconds.
- **Rationale:** Avoids cognitive overload. Readers do not have to parse deep HTML trees or inline style blocks to understand what a page renders.
- **Bad Example:** An `index.tsx` spanning 300 lines of nested `<div>` and `<section>` tags with inline styling and raw event handlers.
- **Good Example:**
  ```tsx
  // index.tsx (clean, declarative outline)
  export function CreateProfile() {
    const profile = useCreateProfile();

    return (
      <ProfileLayout>
        <StepsIndicator currentStep={profile.currentStep} />
        <Steps
          currentStep={profile.currentStep}
          formData={profile.data}
          onUpdate={profile.updateField}
          onNext={profile.nextStep}
          onBack={profile.prevStep}
        />
      </ProfileLayout>
    );
  }
  ```

---

### Rule 4.2: Explicit Public Surface
Each feature and reusable component folder must expose only its designated public interface through its entry `index.ts`. Internal sub-components inside `UI/` remain private.
- **Rationale:** Prevents external callers from creating tight coupling with internal implementation details, enabling safe refactoring of sub-components.
- **Bad Example:** External module importing directly from `features/users/screens/UserProfile/UI/AvatarBadge/index`.
- **Good Example:** External module importing `{ UserProfile }` from `@/features/users`.

---

## Group 5: Logic / UI Separation

### Rule 5.1: Custom Hooks as the Logic Boundary
Extract all side-effects, state machines, form validation schemas, and API mutations into a colocated custom hook. The UI component simply calls the hook and renders the returned state.
- **Rationale:** Enables fast visual prototyping, clean unit testing of logic without DOM simulation, and straightforward Storybook integration.
- **Good Example:**
  ```tsx
  // useCreateItem.ts
  export function useCreateItem() {
    const [values, setValues] = useState<ItemFormValues>(initialValues);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
      setIsSubmitting(true);
      try {
        await api.items.create(values);
        navigate('/items');
      } finally {
        setIsSubmitting(false);
      }
    };

    return { values, setValues, isSubmitting, handleSubmit };
  }
  ```

---

### Rule 5.2: Shared UI, Dedicated Screen Logic (No Conditional Screens)
When two screens share identical visual layouts but diverge in workflow logic (e.g., Create vs. Update/Edit):
- **NEVER** combine both into a single screen chocked with `isEdit ? ... : ...` ternary conditionals.
- **NEVER** duplicate the form layout across two independent components.
- **DO:** Create separate screen components with dedicated hooks, both rendering a shared form component in the feature's `shared/UI/` folder.
- **Rationale:** Eliminates subtle form state pollution, divergent validation rules, and leaky reset effects.
- **Good Example:**
  ```
  features/items/
  ├── screens/
  │   ├── CreateItemScreen/
  │   │   ├── index.tsx              # Uses useCreateItem()
  │   │   └── useCreateItem.ts
  │   └── UpdateItemScreen/
  │       ├── index.tsx              # Uses useUpdateItem()
  │       └── useUpdateItem.ts
  └── shared/
      └── UI/
          └── ItemForm/              # Pure presentation: takes values, handlers, submitLabel
              └── index.tsx
  ```

---

## Group 6: Placement (Lowest Common Ancestor)

### Rule 6.1: The LCA Placement Algorithm
Always place a component at the Lowest Common Ancestor of all its consumers.
- **Rationale:** Keeps components as close to their usage sites as possible while preventing code duplication.
- **Decision Matrix:**
  - 1 screen consumer → inside that screen's `UI/` folder.
  - Multiple screens in 1 feature → `features/<feature>/shared/UI/`.
  - Multiple features → root `src/shared/UI/` or `src/components/ui/` (domain-agnostic only).

---

### Rule 6.2: Strictly Downward & Sibling Imports
A component can import from its own children, its siblings, or layers strictly above it via public APIs. It must never reach upward into a private sub-tree of a sibling component.
- **Bad Example:** `features/orders/screens/OrderList/UI/Filter/index.tsx` importing from `features/orders/screens/OrderDetail/UI/Summary/index.tsx`.
- **Fix:** If both need `Summary`, move `Summary` to `features/orders/shared/UI/Summary/`.

---

## Group 7: Cross-Feature Reuse

### Rule 7.1: Preserve Domain Feature Ownership
If a component embodies domain concepts of Feature A (e.g. `UserProfileDrawer` in `users`), but is needed by Feature B (e.g. `dashboard`), **keep it in Feature A**. Feature B imports it directly from Feature A's public API.
- **Rationale:** Hoisting domain components into root `components/` strips them of their domain context and turns the global shared folder into an unmaintainable dumping ground.
- **Bad Example:** Moving `UserProfileDrawer` to `src/components/UserProfileDrawer` because the dashboard sidebar triggers it.
- **Good Example:** Keeping `UserProfileDrawer` in `features/users/UI/UserProfileDrawer/`, exposing it in `features/users/index.ts`, and importing it as:
  ```tsx
  // in features/dashboard/screens/DashboardScreen/index.tsx
  import { UserProfileDrawer } from '@/features/users';
  ```

---

### Rule 7.2: Promotion Threshold for Domain-Agnostic UI
Only components that are completely free of business logic, domain types, and specific product models qualify for the root shared layer (`src/shared/UI/` or `src/components/ui/`).
- **Eligible for Root:** `Button`, `Input`, `Dialog`, `ModalShell`, `Tooltip`, `Badge`.
- **Ineligible for Root (Must stay in features):** `UserAvatarWithRole`, `InvoiceTable`, `ProductPriceCard`.
