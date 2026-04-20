# Image Studio Redesign Spec

## Goal
Redesign the image studio so it matches the visual language and layout structure of `stitch/code.html` while improving the actual editing workflow for FFmpeg-based image processing.

This pass is limited to the image studio first. The intent is to make the screen feel like a serious, premium editor rather than a converter form, without changing the underlying processing flow or introducing unnecessary product scope.

## Design Principles
- Keep the dark, tactile, glass-layered look from the reference.
- Use the reference layout as the organizing structure: top bar, left pipeline, center preview, right inspector, bottom dock/status.
- Improve usability through clearer state, stronger hierarchy, and fewer dead-end controls.
- Prioritize the image preview as the primary workspace.
- Make editing feel immediate and stable, with smooth transitions and obvious selection states.

## Scope
### In scope
- Image studio page redesign.
- Shared editor shell for the image studio:
  - top header
  - left pipeline panel
  - central canvas/preview area
  - right inspector panel
  - bottom status bar and tool dock
- Visual refresh to match the `stitch/code.html` composition.
- Interaction cleanup for upload, processing, pipeline editing, and download.
- Responsive behavior for desktop and smaller screens.

### Out of scope for this pass
- Full redesign of video and audio pages.
- New FFmpeg features not already supported by the backend.
- Major backend API changes.
- Collaborative editing, presets marketplace, or account system.

## Information Architecture
The studio should read as a pipeline-based editor:

1. `Header` anchors the app and exposes primary actions.
2. `PipelinePanel` lists image operations and allows editing the active node.
3. `ImageCanvas` shows upload state, preview state, and processed output.
4. `InspectorSidebar` shows metadata and export settings.
5. `BottomStatus` communicates progress, readiness, and download state.

The user should always understand:
- what file is loaded,
- what operations are active,
- what the current output state is,
- and what action comes next.

## Visual Direction
### Overall look
- Dark workspace with layered surfaces and subtle glow.
- Heavy use of low-contrast blacks, charcoal, and muted indigo accents.
- Minimal borders. Prefer tonal shifts, soft shadows, and glass blur.
- Strong emphasis on central preview framing.

### Layout mapping from the reference
- Header stays docked at the top.
- Left pipeline column stays narrower than the inspector.
- Center canvas stays visually dominant.
- Right inspector keeps property controls and export settings.
- Bottom floating dock remains centered over the canvas.

### Visual refinements
- Replace generic card styling with panel depth and tonal layering.
- Keep active state highlights on the selected pipeline node and dock item.
- Use compact uppercase labels for technical areas.
- Use tabular numerals for dimensions, progress, and file data.
- Keep buttons tactile and premium, with clear disabled and active states.

## Component Spec
### Header
Purpose:
- Show app identity and primary actions.

Behavior:
- Left side: studio title, section tabs, and optional project context.
- Right side: render/export action and utility icons.
- Render should remain the primary CTA.
- Disabled when no file is loaded or processing is active.

### Pipeline Panel
Purpose:
- Present the editable image operations as a pipeline.

Behavior:
- The first item is upload/input context.
- The active resize/canvas node expands inline.
- Other nodes remain compact until activated.
- Add Node remains available at the bottom.

Recommended nodes for the first pass:
- Canvas / Resize
- Crop
- Dehaze
- Color Grade
- Curves

Interaction rules:
- Clicking a node should focus that tool in the inspector or expand it in place.
- The selected node should have a stronger tonal lift and accent border.
- Inputs should update live in state without breaking current render behavior.

### Image Canvas
Purpose:
- Show upload state, preview state, and processed output.

Behavior:
- Empty state should invite drag-and-drop or click-to-upload.
- Loaded state should frame the image with the reference-style 16:9 overlay.
- Preview should support source and result states with obvious switching.
- The canvas should stay centered and never feel cramped.

### Inspector Sidebar
Purpose:
- Show file metadata and export controls.

Behavior:
- Metadata stays concise and readable.
- Export settings include format and quality controls.
- Sliders must feel smooth and precise.
- Format choices should be compact and easy to scan.

### Bottom Status
Purpose:
- Keep processing feedback visible without taking over the workspace.

Behavior:
- Show system state, current progress, and readiness.
- Download button becomes active only when an output exists.
- Progress state should be reassuring and not visually noisy.

## Interaction Model
### File load
- User can upload by clicking the canvas or using drag-and-drop.
- A loaded file immediately creates a preview object URL.
- The canvas switches from empty state to preview state without a page change.

### Pipeline editing
- Editing a node updates local editor state immediately.
- The UI should avoid forcing a render step for every small change.
- Only the final render action should trigger FFmpeg processing.

### Render flow
1. User loads a file.
2. User adjusts pipeline and export settings.
3. User presses Render.
4. UI shows upload/processing progress.
5. Result replaces or sits beside the source preview.
6. Download becomes available.

### Feedback rules
- Use inline progress and active state text rather than alerts for normal operations.
- Reserve alerts or error banners for unrecoverable failures.
- Keep loading states visible but restrained.

## Responsiveness
### Desktop
- Full three-column studio layout.
- Bottom dock floats over the canvas.

### Medium screens
- Sidebar widths should compress gracefully.
- Inspector may become collapsible if horizontal space gets tight.

### Small screens
- Prefer stacked panels or drawer-style sidebars.
- Preserve upload, preview, and render actions above all else.
- The app should still be usable without hover dependence.

## Accessibility
- Ensure strong contrast for labels and controls.
- Preserve keyboard accessibility for buttons, inputs, and file selection.
- Keep focus states visible and consistent.
- Do not rely on color alone to indicate selected or disabled state.

## Performance And Smoothness
- Revoke preview object URLs when files change.
- Avoid unnecessary rerenders during slider interactions.
- Keep transitions short and consistent.
- Use optimistic local state for editor controls so the interface feels responsive.

## Functional Constraints
- The redesign must continue to work with the existing image upload and processing API.
- It must not require a new backend endpoint for the first pass.
- Existing output format and quality behavior should remain compatible.
- The user should still be able to download the final file after render.

## Acceptance Criteria
- The image studio visually matches the structure and feel of `stitch/code.html`.
- The layout feels like one cohesive editor instead of separate utility panels.
- Upload, preview, edit, render, and download are all easy to find and understand.
- The app remains smooth and usable on desktop.
- No backend changes are required to ship the first redesign pass.

## Validation
- Compare the implemented page against the reference layout.
- Verify empty state, loaded state, processing state, and result state.
- Confirm that render and download still work end-to-end.
- Confirm that the UI does not regress basic accessibility and responsiveness.
