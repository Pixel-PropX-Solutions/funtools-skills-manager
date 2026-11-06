# Decision Trees & Placement Flowcharts

This document provides concrete procedural workflows and decision diagrams for resolving two primary architectural questions:
1. **"Where does this file belong?"** (Lowest Common Ancestor / LCA Placement)
2. **"When should I split this component?"** (Structure & Cognitive Load Driven Decomposition)

---

## Decision Flow 1: Where Does This File Go? (LCA Placement)

Use this flowchart whenever creating a new component, hook, or UI helper to determine its exact filesystem location.

```mermaid
flowchart TD
    Start["New Component or Helper Needed"] --> CountConsumers["Identify all current and planned consumers"]
    
    CountConsumers --> SingleScreen{"Consumed by only ONE Screen?"}
    
    SingleScreen -->|Yes| ScreenColocate["Place inside Screen's UI/ folder<br/>e.g., screens/CreateProfile/UI/StepsIndicator/"]
    
    SingleScreen -->|No| SameFeature{"Are all consumers within the SAME Feature?"}
    
    SameFeature -->|Yes| FeatureShared["Place in Feature's shared/UI/ folder<br/>e.g., features/orders/shared/UI/OrderStatusBadge/"]
    
    SameFeature -->|No - Multiple Features| DomainCheck{"Is it tied to a specific business domain?<br/>(e.g., uses User, Invoice, Cart models)"}
    
    DomainCheck -->|Yes - Domain Specific| OwningFeature["Keep in OWNING Feature UI/<br/>Export via feature's public API index.ts.<br/>Consumer features import from owning feature."]
    
    DomainCheck -->|No - Pure Generic Primitive| RootShared["Place in Root Shared folder<br/>e.g., src/shared/UI/Button/ or src/components/ui/"]

    classDef screen fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px;
    classDef feature fill:#e0e7ff,stroke:#4338ca,stroke-width:2px;
    classDef root fill:#dcfce7,stroke:#15803d,stroke-width:2px;
    class ScreenColocate screen;
    class FeatureShared,OwningFeature feature;
    class RootShared root;
```

### Step-by-Step Procedure:
1. **Audit Consumers:** List all screens, routes, or features that import this component.
2. **Scan Lowest Common Ancestor (LCA):**
   - If 1 screen consumes it: Colocate inside that screen's folder (`<Screen>/UI/<Component>/`).
   - If 2+ screens within Feature X consume it: Move to `features/X/shared/UI/<Component>/`.
   - If 2+ features consume it:
     - Ask: Does this component belong conceptually to one feature's domain model?
     - **Yes:** Keep it in that owning feature's `UI/` folder and export it in `features/X/index.ts`.
     - **No (Generic UI primitive):** Place in `src/shared/UI/<Component>/`.

---

## Decision Flow 2: When Should I Split This Component?

Splitting components must serve **readability, cognitive clarity, and structural cohesion**, avoiding both monolithic monsters and premature micro-fragmentation.

```mermaid
flowchart TD
    Comp["Component Review / Implementation"] --> CheckStructure{"Does component have distinct visual sub-structures?<br/>(e.g., multi-steps, tabs, distinct panels)"}
    
    CheckStructure -->|Yes| CheckManageability{"Is it becoming hard to understand,<br/>read, or maintain in one file?"}
    CheckStructure -->|No| CheckCeiling{"Is file length approaching<br/>the default ceiling of ~400 lines?"}
    
    CheckManageability -->|Yes| Decompose["Decompose into Sub-components in UI/<br/>Keep index.tsx as declarative Table of Contents"]
    CheckManageability -->|No - Clean & Readable| CheckCeiling
    
    CheckCeiling -->|Yes - Exceeds ~400 lines| Decompose
    CheckCeiling -->|No| CheckLogic{"Are state, API calls & effects<br/>mixed directly with JSX markup?"}
    
    CheckLogic -->|Yes| ExtractHook["Extract logic into colocated Custom Hook<br/>e.g., use[ComponentName].ts"]
    CheckLogic -->|No| KeepSingle["Keep as a single cohesive file<br/>(Avoid premature fragmentation)"]

    classDef split fill:#fee2e2,stroke:#b91c1c,stroke-width:2px;
    classDef hook fill:#fef3c7,stroke:#b45309,stroke-width:2px;
    classDef keep fill:#dcfce7,stroke:#15803d,stroke-width:2px;
    class Decompose split;
    class ExtractHook hook;
    class KeepSingle keep;
```

---

## Quantitative & Qualitative Threshold Matrix

| Criterion | Healthy / Coherent State | Splitting / Refactor Trigger | Action Required |
| :--- | :--- | :--- | :--- |
| **Cognitive Understandability** | Developer understands full layout in < 10 seconds | Hard to follow, mental fatigue reading through markup | Split distinct layout sections into `UI/[SubComponent]/` |
| **UI Structure & Layout** | Single cohesive visual block | Multiple distinct sections (steps, tabs, distinct panels) | Group distinct sections into `UI/[SubComponent]/` |
| **Hard Line-Count Ceiling** | < 300 lines | **Approaching ~400 lines** | Mandatory decomposition into sub-components or hooks |
| **`index.tsx` TOC Quality** | Reads as a clean table of contents (< 60–80 lines) | Clogged with inline markup or deep sub-branches | Move inner layout blocks to `UI/` |
| **Logic / View Mixing** | Custom hook handles state/effects | Raw API calls, effects, and complex state in view | Extract to colocated `use[Component].ts` |
| **Ternary Screen Branches** | 0 – 2 simple visual toggles | `isEdit ? ... : ...` routing/mode branches | Refactor to separate screens + shared form |
| **Consumer Count** | 1 consumer | ≥ 2 consumers | Apply LCA placement algorithm |
