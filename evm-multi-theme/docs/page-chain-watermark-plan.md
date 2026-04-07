# Page Chain Watermark Plan

## Status

Implemented as a global app-shell visual enhancement.

Implementation files:

- `src/components/layout/page-chain-watermark.tsx`
- `src/components/layout/app-shell.tsx`
- `src/styles/globals.scss`

## Goal

Use the empty side space on desktop layouts to add a subtle chain-name watermark background. The watermark should make the page feel more branded and chain-aware without competing with the token creation form or content cards.

## Global Scope

This should be a global page-level visual capability, not a one-off decoration for a single page.

Apply to all desktop pages rendered inside the product shell:

- standard token creation
- tax token creation
- project acceptance page if it remains accessible
- future token share page if it uses the same app shell
- future token profile or management pages

The watermark should be driven by the active route context, so every page automatically displays the current chain name without each feature page implementing its own logic.

Do not render the watermark inside:

- modals
- dropdown menus
- wallet connection overlays
- generated share poster canvas unless that poster has its own explicit watermark design

## Target Area

Desktop only:

- left side empty background area
- right side empty background area

Do not show this effect on small screens or mobile layouts, because it can reduce readability and waste useful vertical space.

## Watermark Content

Use the current chain display name as the watermark text.

Examples:

- `X Layer`
- `BNB Smart Chain`
- `Ethereum`
- `Base`
- `Polygon`
- `Arbitrum`

The text should come from the active `chainDefinition.fullName` or a short display field derived from the current chain.

## Visual Style

Preferred direction:

- large decorative typography
- handwritten or brush-like feeling
- frosted-glass text effect
- low opacity
- soft blur or glow
- slightly tilted layout
- not too sharp or high contrast

Suggested visual attributes:

- opacity around `0.06` to `0.14`
- blur around `0.5px` to `2px`
- gradient fill using the current theme color
- optional glass highlight stroke
- optional `backdrop-filter: blur(...)` if the browser supports it
- subtle shadow or outer glow matching the current theme color

## Layout Direction

The watermark should look like background decoration, not content.

Desktop left side:

- place the chain name around the vertical middle or lower-middle of the left empty area
- allow a large rotated wordmark, for example `-12deg` to `-18deg`
- keep it behind the sidebar and main content

Desktop right side:

- place a second chain wordmark around the middle of the right empty area
- allow a different scale or rotation, for example `8deg` to `14deg`
- avoid putting it too close to the form card edge

## Interaction Rules

- The watermark must not capture pointer events.
- The watermark must not block clicks, scrolling, wallet modals, dropdowns, or share modals.
- The watermark must stay behind main content.
- The watermark should not be selectable text if it feels distracting.
- It should be hidden when the viewport is too narrow.

## Theme Behavior

The watermark should adapt to:

- light mode
- dark mode
- orange theme color
- purple theme color
- green theme color

## Compatibility Requirements

The watermark must be compatible with both dimensions of the current theme system:

- theme mode: `light` / `dark`
- theme color: `orange` / `purple` / `green`

Implementation should not hard-code a single watermark color. It should derive the accent color from the current theme color, for example from `themeColorDefinition.accent` or an equivalent CSS variable.

Dark mode:

- use lower opacity and more glow
- avoid making the side areas look too bright
- suggested opacity: `0.06` to `0.1`
- suggested glow: stronger, soft, and spread out
- optional blend direction: screen-like or light glow, but keep it subtle

Light mode:

- use slightly stronger opacity if needed
- keep the effect soft and decorative
- suggested opacity: `0.04` to `0.08`
- suggested glow: weaker than dark mode
- optional blend direction: multiply-like or soft tint, but avoid dirty-looking overlays

Theme color behavior:

- orange theme: use warm orange or amber gradients
- purple theme: use violet or lavender gradients
- green theme: use emerald or mint gradients
- all colors should stay low contrast so the watermark reads as a background texture, not a banner

The final visual should be checked in all six combinations:

- light + orange
- light + purple
- light + green
- dark + orange
- dark + purple
- dark + green

## Suggested Implementation Shape

When implemented later, prefer a layout-level component so the effect is consistent across all pages:

- `PageChainWatermark`
- mounted inside the app shell background layer, near the root of `AppShell`
- reads chain and theme context from `useRouteContext`
- renders only on desktop
- uses CSS pseudo-elements or two absolutely positioned elements
- sits behind the sidebar and main content, but above the raw body background if needed

Potential structure:

```tsx
<div className="page-chain-watermark" aria-hidden="true">
  <span className="page-chain-watermark-left">{chainDefinition.fullName}</span>
  <span className="page-chain-watermark-right">{chainDefinition.fullName}</span>
</div>
```

Potential CSS direction:

```scss
.page-chain-watermark {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.page-chain-watermark span {
  position: absolute;
  font-family: "Brush Script MT", "Comic Sans MS", cursive;
  font-size: clamp(72px, 8vw, 160px);
  font-weight: 700;
  letter-spacing: 0.02em;
  opacity: 0.1;
  filter: blur(1px);
  background: linear-gradient(135deg, currentColor, transparent);
  -webkit-background-clip: text;
  color: transparent;
}
```

The final implementation does not have to use the exact font above. A safer production choice may be to use a bundled decorative font or a CSS-only fallback stack.

## Implementation-Ready Design

Recommended files:

- `src/components/layout/page-chain-watermark.tsx`
- `src/styles/globals.scss`
- `src/components/layout/app-shell.tsx`

Recommended shell placement:

```tsx
<div className={`app-shell theme-${theme} theme-color-${themeColor}`}>
  <PageChainWatermark />
  <Topbar ... />
  ...
</div>
```

The component should stay layout-owned. Feature pages should not import it directly.

Recommended component behavior:

```tsx
export function PageChainWatermark() {
  const { chainDefinition } = useRouteContext()
  const label = chainDefinition.fullName

  return (
    <div className="page-chain-watermark" aria-hidden="true">
      <span className="page-chain-watermark-left">{label}</span>
      <span className="page-chain-watermark-right">{label}</span>
    </div>
  )
}
```

Recommended styling approach:

- Reuse existing CSS variables from `globals.scss`.
- Use `--theme-accent` and `--theme-accent-strong` for color.
- Use `.app-shell.theme-light` and `.app-shell.theme-dark` for mode-specific opacity.
- Hide below `1180px`, because the current layout switches to a single-column layout at that breakpoint.
- Use `pointer-events: none`.
- Use a safe background layer so it never covers form controls, topbar buttons, wallet UI, dropdowns, drawers, or modals.

Layering recommendation:

- Keep `.app-shell::before` as the base page background.
- Put `.page-chain-watermark` above the base background but below shell content.
- If using `z-index: 0` for the watermark, make `.topbar`, `.layout-grid`, and `.app-footer` positioned above it.
- If using `z-index: -1`, test carefully with the current `isolation: isolate` on `.app-shell`, because it may place the watermark too far behind the shell background.

Practical CSS direction:

```scss
.page-chain-watermark {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.layout-grid,
.app-footer {
  position: relative;
  z-index: 1;
}

.page-chain-watermark span {
  position: absolute;
  display: block;
  max-width: min(34vw, 520px);
  font-family: "Brush Script MT", "Segoe Script", "Comic Sans MS", cursive;
  font-size: clamp(72px, 8vw, 150px);
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: 0.02em;
  white-space: normal;
  word-break: keep-all;
  user-select: none;
  opacity: var(--chain-watermark-opacity);
  filter: blur(var(--chain-watermark-blur));
  text-shadow:
    0 24px 80px color-mix(in srgb, var(--theme-accent) var(--chain-watermark-glow), transparent),
    0 1px 0 color-mix(in srgb, white 20%, transparent);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent-strong) 72%, white),
      color-mix(in srgb, var(--theme-accent) 58%, transparent)
    );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-chain-watermark-left {
  left: clamp(20px, 4vw, 80px);
  top: 48%;
  transform: translateY(-50%) rotate(-14deg);
}

.page-chain-watermark-right {
  right: clamp(20px, 4vw, 80px);
  top: 52%;
  transform: translateY(-50%) rotate(12deg);
  text-align: right;
}

.app-shell.theme-light {
  --chain-watermark-opacity: 0.06;
  --chain-watermark-blur: 0.8px;
  --chain-watermark-glow: 16%;
}

.app-shell.theme-dark {
  --chain-watermark-opacity: 0.09;
  --chain-watermark-blur: 1px;
  --chain-watermark-glow: 28%;
}

@media (max-width: 1180px) {
  .page-chain-watermark {
    display: none;
  }
}
```

The exact CSS can be adjusted during visual tuning, but the implementation should keep the same responsibilities: global shell component, theme-driven colors, desktop-only display, and no interaction capture.

## Implementation Plan

Phase 1: global shell integration

- Add a `PageChainWatermark` component.
- Mount it once in the product shell so all pages inherit it.
- Read `chainDefinition.fullName`, `theme`, and `themeColorDefinition.accent`.
- Hide it below the desktop breakpoint.
- Ensure `pointer-events: none` and a safe background `z-index`.

Phase 2: visual tuning

- Tune placement for left and right desktop side spaces.
- Add separate style values for light and dark modes.
- Add accent gradients for orange, purple, and green.
- Test against long chain names such as `BNB Smart Chain`.

Phase 3: page compatibility review

- Check standard token creation.
- Check tax token creation.
- Check project acceptance.
- Check future token share page once it exists.
- Check wallet modal, dropdown menus, mobile drawer, and share modal do not get covered or visually polluted.

Phase 4: optional refinement

- Add a better bundled decorative font if the default fallback does not feel polished enough.
- Add a reduced-motion or low-transparency fallback if future animation is introduced.
- Consider different left/right text variants, for example full chain name on one side and short name on the other.

## Acceptance Criteria

- The watermark appears on all desktop pages inside the app shell.
- The watermark does not appear on mobile or narrow desktop layouts below the one-column breakpoint.
- The watermark text updates when the active chain changes.
- The watermark color updates when switching orange, purple, or green theme color.
- The watermark visual contrast is acceptable in both light and dark mode.
- The watermark does not block any click, hover, dropdown, modal, wallet, drawer, or share interaction.
- The standard token creation page remains readable.
- The tax token creation page remains readable.
- The project acceptance page remains readable if accessible.
- Long chain names do not overflow into the central form area in a visually distracting way.

## Risks And Constraints

- Decorative fonts may hurt loading performance if imported from a remote font service.
- Very large text can become noisy on small laptop screens.
- Too much opacity can reduce readability and make the page look less professional.
- `backdrop-filter` support varies by browser, so the design should still look acceptable without it.
- If using the full chain name, long names like `BNB Smart Chain` may need a smaller size or line break.

## Open Design Decision

Need to decide whether the watermark should use:

- full chain name, for example `BNB Smart Chain`
- short chain name, for example `BSC`
- mixed layout, full name on the left and short name on the right

Recommended first version:

- use full chain name for stronger branding
- automatically reduce font size for long names
- hide on viewport widths below the desktop breakpoint
