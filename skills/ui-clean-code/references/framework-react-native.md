# Framework Adaptation: React Native & Expo

This guide details how to apply the `ui-clean-code` standard to **React Native** (bare or Expo) and **React Navigation / Expo Router** codebases.

---

## 1. Screen Coordinators & Navigation Boundaries

In React Native, screens are mounted by a navigator (`Stack.Navigator`, `Tab.Navigator`, or Expo Router file routes). Screens frequently require configuration for:
- Safe area insets (`react-native-safe-area-context`)
- Keyboard avoiding behavior (`KeyboardAvoidingView`)
- Navigation header options and route parameters

### The Clean Architecture Solution:
Keep the top-level screen coordinator focused on navigation and shell layout, while delegating the visual content to the tree-mirrored `UI/` folder:

```
features/profile/screens/CreateProfileScreen/
├── index.tsx                  # Screen Coordinator & Table of Contents
├── hooks/
│   └── useCreateProfile.ts    # Business logic & navigation handlers
└── UI/
    ├── Header/
    │   └── index.tsx
    ├── StepsIndicator/
    │   ├── index.tsx
    │   ├── index.ios.tsx      # iOS-specific haptic adjustments
    │   └── index.android.tsx  # Android-specific ripple adjustments
    └── Steps/
        ├── index.tsx
        └── PersonalInfo/
            └── index.tsx
```

### Screen Coordinator Example:
```tsx
// features/profile/screens/CreateProfileScreen/index.tsx
import React from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useCreateProfile } from './hooks/useCreateProfile';
import { StepsIndicator } from './UI/StepsIndicator';
import { Steps } from './UI/Steps';

export function CreateProfileScreen() {
  const { currentStep, formData, updateField, nextStep, prevStep } = useCreateProfile();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <StepsIndicator currentStep={currentStep} />
        <Steps
          currentStep={currentStep}
          formData={formData}
          onUpdate={updateField}
          onNext={nextStep}
          onBack={prevStep}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, paddingHorizontal: 16 },
});
```

---

## 2. Platform-Specific File Colocation

React Native's bundler (Metro) natively resolves `.ios.tsx` and `.android.tsx` extensions.

### The Colocation Rule:
Platform-specific file variants must **remain colocated** inside the component's folder, rather than separated into distant platform folders:

```
UI/StepsIndicator/
├── index.tsx          # Shared fallback or web implementation
├── index.ios.tsx      # iOS implementation (e.g. Cupertino styling)
├── index.android.tsx  # Android implementation (e.g. Material ripples)
└── styles.ts          # Shared style constants
```

---

## 3. Navigation Hook Encapsulation

Avoid passing raw navigation props (`navigation`, `route`) through deep component layers.
- Call `useNavigation()` and `useRoute()` inside the screen's custom hook (`hooks/useCreateProfile.ts`).
- Expose semantic action callbacks (e.g. `onComplete: () => navigation.navigate('Home')`) to the view layer.
- Sub-components in `UI/` should receive standard callback functions (`onNext`, `onBack`), keeping them decoupled from navigation libraries.
