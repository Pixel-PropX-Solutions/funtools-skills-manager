# Worked Example 3: Cross-Feature Component Reuse

This worked example demonstrates **Rule 7.1 (Preserve Domain Feature Ownership)** and **Rule 6.1 (Lowest Common Ancestor)**.

---

## 1. Context & Architectural Challenge

Consider an application with two distinct business domains:
1. `features/users`: Handles user identity, account settings, permissions, and profile editing. It owns a complex interactive sidebar drawer: `UserProfileDrawer`.
2. `features/dashboard`: Displays system-wide analytics, key performance indicators, and recent team activity.

### The Problem:
The top navigation bar of `features/dashboard` includes an admin avatar button that opens `UserProfileDrawer` when clicked.

### The Anti-Pattern:
In many codebases, as soon as a second feature needs `UserProfileDrawer`, developers move the drawer to `src/components/UserProfileDrawer` or `src/shared/components/`.
- **Why This Is Bad:**
  - `src/components/` becomes a bloated dumping ground for feature-specific widgets.
  - The `users` feature loses direct ownership of its own domain UI.
  - Tracking domain dependencies becomes difficult because domain components are scattered in global folders.

---

## 2. Clean Architecture Folder Tree

Instead of demoting `UserProfileDrawer` to global shared infrastructure, **keep it in its owning feature** and export it through that feature's public API:

```
features/
├── users/
│   ├── index.ts                     # Public API: exports UserProfileDrawer
│   └── UI/
│       └── UserProfileDrawer/       # Kept in owning feature!
│           ├── index.tsx            # Table of Contents
│           ├── hooks/
│           │   └── useUserProfileDrawer.ts # Logic hook in hooks/
│           └── UI/
│               ├── DrawerHeader/
│               │   └── index.tsx
│               └── ProfileForm/
│                   └── index.tsx
└── dashboard/
    └── screens/
        └── DashboardScreen/
            └── index.tsx            # Imports directly from '@/features/users'
```

---

## 3. Code Implementation

### File: `features/users/UI/UserProfileDrawer/index.tsx` (Table of Contents)
Housed firmly inside the owning `users` feature:

```tsx
import React from 'react';
import { useUserProfileDrawer } from './hooks/useUserProfileDrawer';
import { DrawerHeader } from './UI/DrawerHeader';
import { ProfileForm } from './UI/ProfileForm';

export interface UserProfileDrawerProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileDrawer({ userId, isOpen, onClose }: UserProfileDrawerProps) {
  const { user, isSaving, handleSave } = useUserProfileDrawer(userId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 p-6 flex flex-col border-l border-slate-200">
      <DrawerHeader user={user} onClose={onClose} />
      <div className="mt-6 flex-1 overflow-y-auto">
        <ProfileForm user={user} isSaving={isSaving} onSave={handleSave} />
      </div>
    </div>
  );
}
```

---

### File: `features/users/UI/UserProfileDrawer/hooks/useUserProfileDrawer.ts` (Logic Hook)
```ts
import { useState, useEffect } from 'react';

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function useUserProfileDrawer(userId: string) {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]);

  const handleSave = async (updatedData: Partial<UserProfileData>) => {
    setIsSaving(true);
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      setUser(prev => (prev ? { ...prev, ...updatedData } : null));
    } finally {
      setIsSaving(false);
    }
  };

  return { user, isSaving, handleSave };
}
```

---

### File: `features/users/index.ts` (Feature Public Interface)
The `users` feature explicitly defines what external features are permitted to consume:

```ts
// Expose the drawer as part of the public feature API
export { UserProfileDrawer } from './UI/UserProfileDrawer';
export type { UserProfileDrawerProps } from './UI/UserProfileDrawer';

// Other public user exports (hooks, types, etc.)
export * from './types';
```

---

### File: `features/dashboard/screens/DashboardScreen/index.tsx` (Cross-Feature Consumer)
Notice the clean import from `@/features/users`:

```tsx
import React, { useState } from 'react';
// Direct import from owning feature's public interface:
import { UserProfileDrawer } from '@/features/users';

export function DashboardScreen() {
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Executive Dashboard</h1>
          <p className="text-sm text-slate-500">System overview and team performance metrics</p>
        </div>
        <button
          onClick={() => setActiveUserId('user_admin_01')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-medium"
        >
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
            A
          </span>
          Admin Profile
        </button>
      </header>

      {/* Main dashboard widgets */}
      <div className="grid grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-slate-200 rounded-lg">Active Sessions: 1,420</div>
        <div className="p-6 bg-white border border-slate-200 rounded-lg">Server Load: 34%</div>
        <div className="p-6 bg-white border border-slate-200 rounded-lg">Error Rate: 0.02%</div>
      </div>

      {/* Cross-feature drawer rendered cleanly */}
      {activeUserId && (
        <UserProfileDrawer
          userId={activeUserId}
          isOpen={Boolean(activeUserId)}
          onClose={() => setActiveUserId(null)}
        />
      )}
    </div>
  );
}
```

---

## 4. Key Architectural Takeaways

1. **Feature Domain Preservation:** `UserProfileDrawer` remains inside `features/users/` where it logically belongs.
2. **Encapsulated Public API:** The dashboard imports through `features/users/index.ts` rather than deep-linking into `features/users/UI/UserProfileDrawer/index.tsx`.
3. **Clean Global Layer:** The root `src/shared/UI/` or `src/components/ui/` folder is reserved exclusively for truly domain-agnostic UI primitives (`Button`, `Dialog`, `Input`, `Tooltip`), keeping it lean and manageable.
