# Design System: Spectral Studio

## 1. Overview & Creative North Star
**Creative North Star: "The Kinetic Pipeline"**
A professional, high-fidelity image editing workspace using a **Dark Glassmorphism** aesthetic. The interface prioritizes a pipeline-based workflow where transformations are stacked and applied in sequence.

---

## 2. Colors: Atmospheric Depth
Our palette is rooted in deep charcoal with vibrant indigo accents, designed for a premium studio feel.

- **Background:** `#09090b` (Deep charcoal)
- **Surface:** `#18181b` (Lighter charcoal for panels)
- **Primary:** `#6366f1` (Indigo/Violet gradient) for primary CTAs and active states
- **Text Primary:** `#f4f4f5`
- **Text Secondary:** `#a1a1aa`
- **Border:** `rgba(255, 255, 255, 0.05)` (Subtle white for glass effects)

---

## 3. Typography: Modern Precision
- **Font Family:** Inter, Roboto, or Outfit (Modern Sans-serif)
- **Hierarchy:** High contrast between technical labels and bold headers.

---

## 4. UI Components & Effects
- **Roundedness:** `0.375rem` (6px) corners.
- **Effects:** 
    - Backdrop blur (24px+) for glass panels.
    - Subtle inner shadows for depth on cards.
- **Interactions:**
    - "Instant Apply" feedback.
    - Hover states with scale or glow effects.

---

## 5. Layout Architecture
- **Header:** 56px height, branding on left, profile/render on right.
- **Transformation Pipeline (Left):** 300px width, stacked cards with toggles.
- **Central Canvas:** Full-bleed image preview with dashed overlays and dimension labels.
- **Inspector (Right):** 320px width, metadata and export controls.
- **Bottom Dock:** Floating tool selector.
