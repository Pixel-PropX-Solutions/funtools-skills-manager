# Worked Example 2: Create vs. Update Paired Screens

This worked example demonstrates **Rule 5.2 (Shared UI, Dedicated Screen Logic)** and **Rule 2.3 (Feature `shared/` Placement)**.

---

## 1. Context & Architectural Challenge

A product catalog feature requires both a "Create Product" screen and an "Update Product" screen. The input fields (Title, Description, Price, Category) are visually identical, but their operational logic diverges significantly:
- **Create Flow**: Starts with blank defaults, performs creation-specific validations, invokes `POST /api/products`, and navigates to the newly created product.
- **Update Flow**: Takes a `productId`, fetches existing data, manages loading and not-found states, tracks dirty fields, invokes `PATCH /api/products/:id`, and preserves user scroll position.

### The Anti-Pattern:
Combining both flows into a single screen using conditional branching (`isEdit ? ... : ...`) creates leaky state resets, complex `useEffect` synchronization, and tangled validation rules.

---

## 2. Clean Architecture Folder Tree

```
features/products/
├── index.ts                         # Public API
├── screens/
│   ├── CreateProductScreen/
│   │   ├── index.tsx                # Renders ItemForm with create callbacks
│   │   └── hooks/
│   │       └── useCreateProduct.ts  # Pure creation logic & mutation in hooks/
│   └── UpdateProductScreen/
│       ├── index.tsx                # Renders ItemForm with update callbacks
│       └── hooks/
│           └── useUpdateProduct.ts  # Fetch by ID, dirty tracking, patch mutation in hooks/
└── shared/
    └── UI/
        └── ProductForm/             # Shared presentation form (zero business logic)
            └── index.tsx
```

---

## 3. Code Implementation

### File: `features/products/shared/UI/ProductForm/index.tsx` (Pure Presentation)
This component knows *how to render the form*, but has zero knowledge of API routes, mutations, or whether it is in "create" or "edit" mode:

```tsx
import React, { useState } from 'react';

export interface ProductFormValues {
  title: string;
  description: string;
  price: number;
}

export interface ProductFormProps {
  title: string;
  submitLabel: string;
  initialValues: ProductFormValues;
  isSubmitting: boolean;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
}

export function ProductForm({
  title,
  submitLabel,
  initialValues,
  isSubmitting,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg p-6 bg-white border border-slate-200 rounded-lg">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      
      <div>
        <label className="block text-sm font-medium text-slate-700">Product Title</label>
        <input
          type="text"
          value={values.title}
          onChange={e => setValues({ ...values, title: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Price ($)</label>
        <input
          type="number"
          value={values.price}
          onChange={e => setValues({ ...values, price: Number(e.target.value) })}
          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
          min="0"
          step="0.01"
          required
        />
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
```

---

### File: `features/products/screens/CreateProductScreen/hooks/useCreateProduct.ts` (Logic Hook)
```ts
import { useState } from 'react';
import { ProductFormValues } from '../../../shared/UI/ProductForm';

export function useCreateProduct() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      window.location.href = '/products';
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/products';
  };

  return { isSubmitting, handleCreate, handleCancel };
}
```

---

### File: `features/products/screens/CreateProductScreen/index.tsx` (Screen Entry)
```tsx
import React from 'react';
import { useCreateProduct } from './hooks/useCreateProduct';
import { ProductForm } from '../../shared/UI/ProductForm';

export function CreateProductScreen() {
  const { isSubmitting, handleCreate, handleCancel } = useCreateProduct();

  return (
    <div className="p-8">
      <ProductForm
        title="Create New Product"
        submitLabel="Publish Product"
        initialValues={{ title: '', description: '', price: 0 }}
        isSubmitting={isSubmitting}
        onSubmit={handleCreate}
        onCancel={handleCancel}
      />
    </div>
  );
}
```

---

### File: `features/products/screens/UpdateProductScreen/hooks/useUpdateProduct.ts` (Logic Hook)
```ts
import { useState, useEffect } from 'react';
import { ProductFormValues } from '../../../shared/UI/ProductForm';

export function useUpdateProduct(productId: string) {
  const [product, setProduct] = useState<ProductFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .finally(() => setIsLoading(false));
  }, [productId]);

  const handleUpdate = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      window.location.href = `/products/${productId}`;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    window.location.href = `/products/${productId}`;
  };

  return { product, isLoading, isSubmitting, handleUpdate, handleCancel };
}
```

---

### File: `features/products/screens/UpdateProductScreen/index.tsx` (Screen Entry)
```tsx
import React from 'react';
import { useUpdateProduct } from './hooks/useUpdateProduct';
import { ProductForm } from '../../shared/UI/ProductForm';

export function UpdateProductScreen({ productId }: { productId: string }) {
  const { product, isLoading, isSubmitting, handleUpdate, handleCancel } =
    useUpdateProduct(productId);

  if (isLoading) return <div className="p-8">Loading product data...</div>;
  if (!product) return <div className="p-8 text-red-600">Product not found.</div>;

  return (
    <div className="p-8">
      <ProductForm
        title={`Edit Product #${productId}`}
        submitLabel="Save Changes"
        initialValues={product}
        isSubmitting={isSubmitting}
        onSubmit={handleUpdate}
        onCancel={handleCancel}
      />
    </div>
  );
}
```

---

## 4. Key Architectural Takeaways

1. **Zero Conditional Branching in Views:** Neither screen contains `isEdit ? ... : ...` ternary logic.
2. **Single Presentation Source:** The form markup and styling is maintained in one place (`features/products/shared/UI/ProductForm/`).
3. **Decoupled Logic:** The create mutation and update mutation evolve independently without risk of cross-polluting validation rules.
