# Design System Specification: The Kinetic Pipeline

## 1. Overview & Creative North Star
**Creative North Star: "The Precise Alchemist"**

This design system is built for high-performance creative workflows. It rejects the "flat web" trend in favor of a technical, tactile environment that feels like a high-end physical editing suite. By combining **Organic Brutalism**—the use of heavy, monolithic surfaces—with **Glassmorphism**, we create an interface that feels both grounded and ethereal. 

To break the "template" look, this system utilizes intentional asymmetry in panel widths and a "floating" pipeline architecture. We move away from rigid, boxed-in grids toward a layout where content flows through layered glass "nodes," connected by tonal shifts rather than harsh lines.

## 2. Colors & Surface Architecture
The palette is rooted in deep obsidian tones, punctuated by a hyper-modern indigo-violet energy.

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for layout sectioning. Structural boundaries must be defined through:
1.  **Tonal Shifts:** Placing a `surface_container_high` element against a `surface_dim` background.
2.  **Negative Space:** Using the spacing scale to create "rivers" of the `background` color that define workspace zones.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of optics.
*   **Base Layer:** `surface_container_lowest` (#0e0e10) - Use for the global workspace background.
*   **Primary Panels:** `surface_container_low` (#1c1b1d) - Use for the main pipeline track.
*   **Interactive Nodes:** `surface_container` (#201f22) - Use for individual processing blocks.
*   **Active Overlays:** `surface_bright` (#39393b) - Use for active tool settings or high-priority modals.

### The "Glass & Gradient" Rule
Floating panels (Inspectors, Floating Toolbars) must use a **Backdrop Blur (20px - 40px)** combined with a semi-transparent `surface_container_high` fill at 70% opacity. 
*   **Signature Texture:** Main CTAs and "End-of-Pipeline" actions should use a linear gradient: `primary` (#c0c1ff) to `primary_container` (#8083ff) at a 135-degree angle. This provides a "glow" that signifies the power of the image processing engine.

## 3. Typography: The Editorial Tech Scale
We use **Inter** as our sole typeface, relying on extreme weight contrast and tracking to convey a premium, technical feel.

*   **Display (Large/Mid):** Reserved for "Export" or "Render" states. Use `display-md` with -0.02em tracking for a condensed, authoritative look.
*   **Headlines & Titles:** `headline-sm` should be used for major pipeline stages. Always in `on_surface`.
*   **Technical Labels:** Use `label-md` or `label-sm` for all slider labels and coordinate data. These should use `on_surface_variant` (#c7c4d7) to remain secondary to the image data.
*   **Monospace Utility:** While the system uses Inter, numerical data in the pipeline (coordinates, hex codes) should be set with `tabular-nums` enabled to ensure vertical alignment in the technical panels.

## 4. Elevation & Depth
Depth is a functional tool in this system, indicating the "process flow" of the image pipeline.

*   **The Layering Principle:** Instead of shadows, use "stacking." A node (surface_container) sitting on the track (surface_container_lowest) creates a natural lift.
*   **Ambient Shadows:** For floating elements (e.g., a color picker), use an extra-diffused shadow: `box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5)`. The shadow should feel like a soft occlusion rather than a hard drop-shadow.
*   **The "Ghost Border" Fallback:** Where separation is mandatory (e.g., overlapping glass panels), use a 1px border with `outline_variant` at 15% opacity. It should be felt, not seen.
*   **Edge Lighting:** For the "Premium" feel, apply a 1px "inner-glow" top-border to primary cards using `primary_fixed_dim` at 10% opacity. This mimics light hitting the chamfered edge of a glass pane.

## 5. Components

### The Pipeline Node (Custom Component)
The core of the app. A node consists of a `surface_container` body, a `md` (0.375rem) corner radius, and no border. The "Input/Output" ports are signaled by `primary` color dots.

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`). White text (`on_primary_fixed`). No shadow; use a 1px inner-glow top-border.
*   **Secondary:** Ghost style. `outline` color for text, no background. On hover, transition to `surface_container_highest`.
*   **Tertiary:** `label-md` text only. Used for "Reset" or "Cancel" within tool panels.

### Input Fields & Sliders
*   **Inputs:** Background must be `surface_container_lowest`. Forbid the "box" look; use a bottom-border only of `outline_variant` that expands to `primary` on focus.
*   **Sliders:** The track should be `surface_container_highest`. The "thumb" is a `primary` circle. As the slider moves, the track "fills" with a `primary` to `secondary` gradient.

### Cards & Lists
*   **The No-Divider Rule:** Never use a horizontal line to separate list items. Use 12px of vertical padding and a subtle `surface` shift on hover to indicate selection.

### Tooltips
*   Small, high-contrast. Background: `on_surface` (#e5e1e4), Text: `inverse_on_surface` (#313032). Corner radius: `sm` (0.125rem).

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts. Let the left-hand tool bar be narrower than the right-hand inspector.
*   **Do** use `primary_container` (#8083ff) for active states in the pipeline to create a "path of light."
*   **Do** prioritize the image. The UI should "recede" into the background (`surface_dim`) when the user is not interacting with a specific panel.

### Don't:
*   **Don't** use 100% opaque white for text. Always use `on_surface` (#e5e1e4) to reduce eye strain in dark environments.
*   **Don't** use standard "Material Design" shadows. They are too heavy for a professional dark-mode workspace.
*   **Don't** use rounded corners larger than `xl` (0.75rem). Anything rounder loses the "Technical" aesthetic and feels too consumer-focused.