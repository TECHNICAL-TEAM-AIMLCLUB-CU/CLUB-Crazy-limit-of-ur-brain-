# Signal Room — Visual Design

## Direction

Signal Room should feel like an editorial briefing room for an AI/ML community: thoughtful, current, and quietly technical. Combine generous editorial spacing and hierarchy with subtle signals of computation. It should feel like part of the existing AIML Club website, not a separate demo or a wholesale redesign.

The sitewide announcement bar is a compact, single-line desktop banner above the fixed navigation, with a two-row mobile layout. Use dark teal/emerald for ordinary notices, muted rose for IMPORTANT, and restrained amber for DEADLINE. Keep the label, message, optional deadline state, action link, and optional dismiss control distinct; only the configured action link and dismiss button are interactive.

## Palette and surfaces

- Keep the existing dark site canvas and shared navigation/footer intact.
- Use cool neutral surfaces for the announcement cards and detail surfaces, accented with restrained teal, emerald, cyan, and violet gradients.
- Keep ambient gradients low contrast and localized to the Signal Room introduction and featured story; preserve the site's existing Lightfall background and do not add another WebGL/particle layer.
- Retain the existing `bg`, `surface`, `line`, `fg`, `muted`, and brand tokens where they maintain consistency. Add only Signal Room-specific tokens/utilities if a repeated need is established.
- Maintain readable contrast in every surface state, including hover, focus, selected, disabled, and overlay states. Do not use color alone to communicate category or carousel position.
- Prefer fine borders and diffuse, low-elevation shadows over heavy outlines, glows, or glass panels.

## Typography and hierarchy

- Continue using the site's Inter, Space Grotesk, and JetBrains Mono font setup.
- Use display typography for the page title and featured headline; use the existing mono face sparingly for date/eyebrow metadata.
- Set a clear hierarchy: page eyebrow and title, short explanatory copy, featured story, browse controls, result count, then the announcement list.
- Keep body copy comfortable to read with sufficient line height and measure. Avoid overlong text columns.

## Layout

- Align content to the existing `max-w-6xl` site grid and responsive horizontal padding.
- Use generous vertical spacing between the title, featured story, filters, and results.
- Make the featured carousel editorial and visually distinct without overpowering the list.
- Use a responsive card grid: one column on narrow phones, two at tablet widths, and up to three at wide desktop widths when card copy remains readable.
- Place search and category controls in a flexible row on wider screens and stack them cleanly on small screens.
- Keep the expansion readable and easy to close. Use a centered, bounded dialog on desktop and a roomy sheet/full-screen treatment on mobile.

## Cards and motion

- Cards have softly rounded corners, delicate borders, clean spacing, and restrained depth.
- Hover may lift a card slightly and apply a small 3D tilt for fine pointers only. Keep the tilt subtle, avoid abrupt perspective, and restore the resting state on pointer exit.
- Card expansion should feel connected to its source card through a shared-layout/shared-element treatment where supported, with a graceful opacity/transform fallback.
- Carousel transitions should be short, smooth, and non-distracting. Autoplay must pause on hover/focus and be disabled for reduced-motion preferences.
- Avoid parallax, persistent bobbing, rapid auto-advance, flashy spring overshoot, and any animation that blocks reading or input.
- Honor `prefers-reduced-motion` for all Signal Room animation, including CSS transitions and card tilt.

## Interaction states

- Search/filter controls have explicit labels, clear focus indicators, and visible active state.
- The selected category is distinct from unselected categories without relying only on hue.
- Empty data and no search matches use concise, calm messaging consistent with shared site empty states.
- The expansion close affordance remains visible, and the expanded content retains a clear title/date hierarchy and optional category/summary behavior.
- Separate publication date from explicit event date/deadline metadata; render no inferred dates, links, or counts.
- Carousel controls expose direction and position to assistive technology; the current slide is identifiable without motion.

## Responsive and accessibility checks

- Test narrow phone, tablet portrait/landscape, and desktop widths.
- Prevent horizontal scrolling and clipped controls at every breakpoint.
- Preserve touch target size; do not require hover to discover details or actions.
- Ensure dialog semantics, keyboard focus order, Escape close, focus restoration, reduced-motion behavior, contrast, and screen-reader status announcements.
- Verify contrast and legibility over every gradient and overlay.
