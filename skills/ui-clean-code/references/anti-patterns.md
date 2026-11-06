# Anti-Patterns & Refactoring Guide

This document catalogs frequent UI architectural smells encountered in React, React Native, and Next.js applications, along with step-by-step refactoring recipes.

---

## 1. Anti-Pattern 1: The Monolithic God Component

### The Symptom:
A single `.tsx` file that stretches across 400–800 lines, mixing network requests, multiple `useState` calls, inline form validation, modals, and massive nested JSX markup.

### Why It Hurts:
- High cognitive load: Any developer making a one-line change must mentally digest hundreds of unrelated lines.
- Merge conflicts: Multiple engineers touching different parts of the same view collide frequently.
- Re-render lag: A state update at the top re-evaluates the entire monolithic tree.

### Refactoring Recipe:
1. **Audit & Isolate Logic:** Move state variables, effects, and API calls into a colocated `use[ScreenName].ts` custom hook.
2. **Identify Visual Clusters:** Find distinct sub-views (e.g. `Header`, `FilterBar`, `List`, `PaginationModal`).
3. **Create `UI/` Directory:** Create sub-component folders under `UI/` for each cluster.
4. **Rewrite Entry Point:** Re-assemble `index.tsx` so it reads as an executive table of contents under 80 lines.

---

## 2. Anti-Pattern 2: Premature Micro-Fragmentation (Over-Splitting)

### The Symptom:
Splitting every 10–20 line HTML block into separate files across multiple folders (e.g., `SubmitButtonContainer/`, `TitleHeadingText/`, `FormWrapperDiv/`).

### Why It Hurts:
- High indirection: To understand a simple 80-line form, a developer must open 8 different tabs and jump across 5 folders.
- Friction during rapid iteration: Moving a single prop requires updating 6 interface files.

### Refactoring Recipe:
- Follow **Rule 1.2**: Keep cohesive components together until distinct UI sub-structures emerge or cognitive clarity demands decomposition.
- Inline simple sub-renderers or keep tight markup inside the parent component if it is under the ~400-line ceiling and easy to maintain.

---

## 3. Anti-Pattern 3: The Conditional-Wrapped Screen (`isEdit ? ... : ...`)

### The Symptom:
A single screen file (`ItemScreen.tsx`) attempting to serve both "Create Item" and "Edit Item" modes using a boolean prop or route parameter:

```tsx
// ❌ BAD: Leaky, tangled conditional screen
export function ItemScreen({ isEdit }: { isEdit?: boolean }) {
  const [data, setData] = useState(isEdit ? existingData : defaultData);

  useEffect(() => {
    if (isEdit) {
      loadExistingItem();
    } else {
      resetForm();
    }
  }, [isEdit]);

  const handleSubmit = () => {
    if (isEdit) {
      api.updateItem(data);
    } else {
      api.createItem(data);
    }
  };

  return (
    <div>
      <h1>{isEdit ? 'Edit Item' : 'Create New Item'}</h1>
      <input value={data.name} onChange={...} />
      {isEdit && <AuditHistory item={data} />}
      <button onClick={handleSubmit}>{isEdit ? 'Save Changes' : 'Create Item'}</button>
    </div>
  );
}
```

### Why It Hurts:
- Leaky form state: Resetting the form when switching modes creates edge-case bugs and race conditions.
- Cluttered UI: Every section has ternary operators (`isEdit ? ... : null`).
- Rigid validation: Create forms often have different validation requirements (e.g. password required) than Edit forms (e.g. password optional).

### Refactoring Recipe:
1. Extract the shared form presentation to `features/items/shared/UI/ItemForm/index.tsx`.
2. Create `CreateItemScreen/` with its own `useCreateItem.ts` hook.
3. Create `UpdateItemScreen/` with its own `useUpdateItem.ts` hook.
4. Both screens render `<ItemForm />` passing their respective values and handlers.

```tsx
// ✅ GOOD: Clean paired screens
// CreateItemScreen/index.tsx
export function CreateItemScreen() {
  const { values, isSubmitting, handleCreate } = useCreateItem();

  return (
    <ItemForm
      title="Create New Item"
      submitLabel="Create Item"
      values={values}
      isSubmitting={isSubmitting}
      onSubmit={handleCreate}
    />
  );
}
```

---

## 4. Anti-Pattern 4: Premature Hoisting (The Shared Dumpster)

### The Symptom:
A global `src/components/` folder containing 150+ components, where 80% are only used by one specific feature screen.

### Why It Hurts:
- No domain boundaries: New developers assume everything in `src/components/` is generic infrastructure.
- Fear of deletion: Nobody knows if deleting `InvoiceSummaryBadge` from `src/components/` will break another part of the system.

### Refactoring Recipe:
1. Audit imports for each component in `src/components/`.
2. Apply the **Lowest Common Ancestor (LCA)** rule:
   - If only consumed by `OrderScreen`, move to `features/orders/screens/OrderScreen/UI/`.
   - If consumed by `OrderList` and `OrderDetail`, move to `features/orders/shared/UI/`.
3. Only retain truly domain-agnostic UI primitives (`Button`, `Modal`, `Input`, `Dropdown`) in the root shared folder.

---

## 5. Anti-Pattern 5: Prop Drilling Tunnels

### The Symptom:
Passing callbacks (`onToggleFavorite`, `userId`, `refreshFeed`) down 5 layers of intermediate layout components that have no need for that data:

```
FeedScreen
 └── FeedLayout
      └── FeedColumn
           └── PostCard
                └── PostActions
                     └── FavoriteButton  <-- The only component needing onToggleFavorite
```

### Why It Hurts:
- Refactoring intermediate layout components requires updating interfaces throughout the entire chain.
- Testing intermediate components requires mocking deep props.

### Refactoring Recipe:
- **Solution A (Composition):** Pass the button directly as `children` or a slot:
  ```tsx
  <PostCard action={<FavoriteButton onToggle={handleToggle} />} />
  ```
- **Solution B (Colocated Context):** If multiple sub-components need access to screen-wide state, create a lightweight React Context colocated inside the screen folder (`FeedScreen/FeedContext.tsx`).
