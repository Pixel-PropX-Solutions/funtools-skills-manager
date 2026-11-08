# Framework Adaptation: Next.js (App Router)

This guide explains how to apply the `ui-clean-code` standard cleanly within **Next.js (App Router)** projects without violating framework conventions or muddying component boundaries.

---

## 1. Route Entry (`page.tsx`) vs. Screen Component

Next.js App Router relies on reserved file names (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`). 

### The Problem:
Dumping 300 lines of JSX directly into `app/(dashboard)/profile/page.tsx` tightly couples your UI markup to the framework's routing layer, making it harder to test, relocate, or reuse.

### The Clean Architecture Solution:
Keep `page.tsx` as a **thin coordinator**:
1. `page.tsx` handles route params, search params, and initial server-side data fetching.
2. It passes that data into a cleanly structured screen component housed under `features/`.

```
src/
├── app/
│   └── (dashboard)/
│       └── profile/
│           ├── page.tsx               # Thin coordinator (< 30 lines)
│           └── loading.tsx
└── features/
    └── profile/
        └── screens/
            └── ProfileScreen/         # ui-clean-code component
                ├── index.tsx          # Table of Contents
                ├── hooks/
                │   └── useProfile.ts  # Logic hook in hooks/
                └── UI/
                    ├── ProfileHeader/
                    │   └── index.tsx
                    └── ProfileDetails/
                        └── index.tsx
```

### Thin `page.tsx` Example:
```tsx
// src/app/(dashboard)/profile/page.tsx
import { ProfileScreen } from '@/features/profile';
import { getProfileData } from '@/features/profile/api/getProfileData';

export default async function Page() {
  const initialData = await getProfileData();

  return <ProfileScreen initialData={initialData} />;
}
```

---

## 2. Server Components (RSC) vs. Client Components (`'use client'`)

In Next.js App Router, components are Server Components by default. 

### The Boundary Rule:
Push `'use client'` as far down the component tree as possible:
- Keep the parent `ProfileScreen` or `page.tsx` as a Server Component if it is purely composing layout.
- If a composite component requires interactive state, make the composite component or its specific sub-components in `UI/` client components.

```
features/profile/screens/ProfileScreen/
├── index.tsx                  # Server Component (orchestrating layout)
└── UI/
    ├── ProfileHeader/
    │   └── index.tsx          # Server Component (static layout)
    └── ProfileEditModal/
        └── index.tsx          # 'use client' (interactive state & forms)
```

---

## 3. Server Actions & Mutations

- Server Actions should live in a colocated `actions.ts` file or within the feature's API layer.
- The custom hook (`hooks/useProfile.ts`) can invoke the server action using `useTransition` or `useActionState`, keeping the UI view purely declarative.

```tsx
// hooks/useProfile.ts
'use client';

import { useTransition } from 'react';
import { updateProfileAction } from '../actions';

export function useProfile() {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (formData: FormData) => {
    startTransition(async () => {
      await updateProfileAction(formData);
    });
  };

  return { isPending, handleUpdate };
}
```

---

## 4. Route Groups and Colocation

Next.js route groups (folders enclosed in parentheses like `(auth)`, `(dashboard)`) do not affect the URL path. 

When colocating components:
- If a component is used **only** within routes inside `(auth)`, you may colocate it in `app/(auth)/_components/` or inside `features/auth/`.
- `features/` remains the preferred home for domain-rich screens and UI trees, keeping `app/` strictly as the routing and layout skeleton.

---

## 5. Strict Prohibition: No Loose Files in App Router Segments

AI tools often make the mistake of creating files directly by name at the route directory level next to `page.tsx`. This causes route confusion, directory clutter, and breaks clean code boundaries.

```
# ❌ NEVER drop loose hooks, components, or helpers directly under app/.../
app/(dashboard)/profile/
├── page.tsx
├── useForm.ts        <-- ❌ VIOLATION: Loose hook at route root!
├── types.ts          <-- ❌ VIOLATION: Loose types at route root!
└── UserCard.tsx      <-- ❌ VIOLATION: Loose component without UI/ folder!

# ✅ ALWAYS organize under categorical group folders or within features/
app/(dashboard)/profile/
├── page.tsx          # Pure route entry coordinator
├── hooks/
│   └── useForm.ts    # Grouped under hooks/
├── types/
│   └── index.ts      # Grouped under types/
└── UI/
    └── UserCard/     # Grouped under UI/
        └── index.tsx
```
