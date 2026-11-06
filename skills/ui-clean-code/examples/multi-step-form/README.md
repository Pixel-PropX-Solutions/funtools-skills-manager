# Worked Example 1: Multi-Step Form Decomposition

This worked example demonstrates **Rule 1.1 (Component Tree Mirroring)** and **Rule 4.1 (Table of Contents)** in a multi-step user onboarding flow.

---

## 1. Context & Architectural Challenge

A user profile creation wizard requires multiple sequential steps:
1. Progress indicator header showing the current step.
2. Step 1: Personal Information (First Name, Last Name, Email).
3. Step 2: Account Details (Username, Password, Role).
4. Step 3: Review & Confirmation screen.

In typical monolithic codebases, this entire workflow is jammed into a single 500-line file that tracks step numbers, handles validation for all steps simultaneously, and nests dozens of `div` elements.

---

## 2. Clean Architecture Folder Tree

The filesystem directly mirrors the component containment hierarchy:

```
CreateProfile/
├── index.tsx                  # Table of Contents (< 30 lines)
├── useCreateProfile.ts        # Business logic, state, and step navigation
└── UI/
    ├── StepsIndicator/
    │   └── index.tsx          # Progress bar / step badges
    └── Steps/
        ├── index.tsx          # Step switcher component
        ├── PersonalInfo/
        │   └── index.tsx      # Step 1 view
        ├── AccountDetails/
        │   └── index.tsx      # Step 2 view
        └── Review/
            └── index.tsx      # Step 3 confirmation view
```

---

## 3. Code Implementation

### File: `CreateProfile/index.tsx` (Table of Contents)
Notice how `index.tsx` contains zero business logic, zero inline fetch requests, and zero tangled markup. It reads as a clear layout outline:

```tsx
import React from 'react';
import { useCreateProfile } from './useCreateProfile';
import { StepsIndicator } from './UI/StepsIndicator';
import { Steps } from './UI/Steps';

export function CreateProfile() {
  const { currentStep, formData, updateField, nextStep, prevStep, submit } = useCreateProfile();

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <StepsIndicator currentStep={currentStep} />
      <Steps
        currentStep={currentStep}
        data={formData}
        onUpdate={updateField}
        onNext={nextStep}
        onBack={prevStep}
        onSubmit={submit}
      />
    </div>
  );
}
```

---

### File: `CreateProfile/useCreateProfile.ts` (Logic Boundary)
All state management, field updating, and navigation calculations are encapsulated in this custom hook:

```ts
import { useState } from 'react';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
}

export function useCreateProfile() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    role: 'member',
  });

  const updateField = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setCurrentStep(step => Math.min(step + 1, 3));
  const prevStep = () => setCurrentStep(step => Math.max(step - 1, 1));

  const submit = async () => {
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
  };

  return {
    currentStep,
    formData,
    updateField,
    nextStep,
    prevStep,
    submit,
  };
}
```

---

### File: `CreateProfile/UI/StepsIndicator/index.tsx`
A focused, presentational component showing step numbers and labels:

```tsx
import React from 'react';

export interface StepsIndicatorProps {
  currentStep: number;
}

const STEP_LABELS = ['Personal Info', 'Account Details', 'Review'];

export function StepsIndicator({ currentStep }: StepsIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
      {STEP_LABELS.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <div key={label} className="flex items-center space-x-2">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : isCompleted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isCompleted ? '✓' : stepNumber}
            </span>
            <span
              className={`text-sm font-medium ${
                isActive ? 'text-slate-900 font-bold' : 'text-slate-500'
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

---

### File: `CreateProfile/UI/Steps/index.tsx` (Step Switcher)
Delegates rendering to the specific active step component:

```tsx
import React from 'react';
import { ProfileFormData } from '../../useCreateProfile';
import { PersonalInfo } from './PersonalInfo';
import { AccountDetails } from './AccountDetails';
import { Review } from './Review';

export interface StepsProps {
  currentStep: number;
  data: ProfileFormData;
  onUpdate: (field: keyof ProfileFormData, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function Steps({ currentStep, data, onUpdate, onNext, onBack, onSubmit }: StepsProps) {
  switch (currentStep) {
    case 1:
      return <PersonalInfo data={data} onUpdate={onUpdate} onNext={onNext} />;
    case 2:
      return <AccountDetails data={data} onUpdate={onUpdate} onNext={onNext} onBack={onBack} />;
    case 3:
      return <Review data={data} onBack={onBack} onSubmit={onSubmit} />;
    default:
      return null;
  }
}
```

---

### File: `CreateProfile/UI/Steps/PersonalInfo/index.tsx` (Leaf Step)
```tsx
import React from 'react';
import { ProfileFormData } from '../../../useCreateProfile';

export interface PersonalInfoProps {
  data: ProfileFormData;
  onUpdate: (field: keyof ProfileFormData, value: string) => void;
  onNext: () => void;
}

export function PersonalInfo({ data, onUpdate, onNext }: PersonalInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
      <div>
        <label className="block text-sm font-medium text-slate-700">First Name</label>
        <input
          type="text"
          value={data.firstName}
          onChange={e => onUpdate('firstName', e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Last Name</label>
        <input
          type="text"
          value={data.lastName}
          onChange={e => onUpdate('lastName', e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
        />
      </div>
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}
```

---

## 4. Key Architectural Takeaways

1. **Tree Mirroring:** A developer wanting to modify Step 1 navigates straight to `UI/Steps/PersonalInfo/index.tsx`.
2. **Table of Contents Clarity:** The top-level `CreateProfile/index.tsx` stays under 30 lines and immediately reveals how the view is constructed.
3. **Encapsulation:** Sub-components like `PersonalInfo` and `AccountDetails` remain private to `CreateProfile`. They are not exposed globally, protecting the codebase from accidental coupling.
