---
name: Saffron & Charcoal
colors:
  surface: '#fff8f6'
  surface-dim: '#dfd9d7'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f2f0'
  surface-container: '#f3ecea'
  surface-container-high: '#ede7e5'
  surface-container-highest: '#e7e1df'
  on-surface: '#1d1b1a'
  on-surface-variant: '#574238'
  inverse-surface: '#32302f'
  inverse-on-surface: '#f6efed'
  outline: '#8a7267'
  outline-variant: '#ddc1b3'
  surface-tint: '#9e4300'
  primary: '#9a4100'
  on-primary: '#ffffff'
  primary-container: '#bd5611'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb690'
  secondary: '#845400'
  on-secondary: '#ffffff'
  secondary-container: '#fdae3d'
  on-secondary-container: '#6d4400'
  tertiary: '#515f57'
  on-tertiary: '#ffffff'
  tertiary-container: '#6a786f'
  on-tertiary-container: '#f5fff7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcb'
  primary-fixed-dim: '#ffb690'
  on-primary-fixed: '#341100'
  on-primary-fixed-variant: '#783100'
  secondary-fixed: '#ffddb6'
  secondary-fixed-dim: '#ffb95b'
  on-secondary-fixed: '#2a1800'
  on-secondary-fixed-variant: '#643f00'
  tertiary-fixed: '#d7e6db'
  tertiary-fixed-dim: '#bbcac0'
  on-tertiary-fixed: '#111e18'
  on-tertiary-fixed-variant: '#3c4a42'
  background: '#fff8f6'
  on-background: '#1d1b1a'
  surface-variant: '#e7e1df'
typography:
  display-lg:
    fontFamily: Epilogue
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Epilogue
    fontSize: 38px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Epilogue
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Epilogue
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.875rem
  margin: 2.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses culinary indulgence through contemporary editorial clarity. It pairs sensory warmth with high-end hospitality precision, avoiding the cluttered fast-food aesthetic in favor of a curated, appetizing dining experience. 

### Visual Identity & Movements
- **Style:** Warm Editorial Minimalism layered with Tactile Modernism.
- **Atmosphere:** Deep cast-iron charcoals, radiant golden saffron, and warm bone-white porcelain surfaces evoke the atmosphere of an upscale dining room.
- **Target Audience:** Discerning food enthusiasts, culinary explorers, and patrons seeking frictionless, elevated dining experiences from mobile ordering to tasting menu reservations.
- **Micro-Interactions:** Fluid spring transitions on order state changes, tactile press states on food cards, and smooth warm-glow focus transitions.

## Colors

The palette balances intense culinary spices with grounding charcoal tones and crisp, warm ceramics:

- **Primary (`#D96B27`) — Deep Saffron:** Represents fire, roasted spices, and vibrant sauces. Used for primary CTAs, cart triggers, active states, and high-impact highlights.
- **Secondary (`#ECA02F`) — Warm Amber:** Evokes honey, citrus, and toasted grains. Deployed for subtle badges, dietary indicator tags, rating stars, and secondary accents.
- **Tertiary (`#1E2B24`) — Charred Bay Green:** A deep herbal green used sparingly for organic/vegan tags, environmental accolades, and herb-infused freshness markers.
- **Neutral (`#181615`) — Smoked Charcoal:** The core text and deep UI surface color. It avoids sterile blacks, keeping dark mode surfaces rich and warm.
- **Surface Roles:** 
  - Canvas: `#FBF9F6` (Porcelain Warm White)
  - Card/Container: `#FFFFFF` (Pure Crisp White)
  - Muted Borders: `#EFE9E1` (Warm Bone Ochre)
  - Neutral Secondary Text: `#69625A` (Driftwood Earth)

## Typography

The typographic hierarchy channels structured, expressive warmth.

- **Headlines (`Epilogue`):** Selected for its geometric structure, strong terminal cuts, and robust balance that harmonizes seamlessly with bold modern Arabic typography (such as Cairo and IBM Plex Sans Arabic). It delivers architectural authority to menu category names and dish titles.
- **Body Text (`Be Vietnam Pro`):** High legibility at compact scales, soft open apertures, and an organic warmth that renders ingredient lists and tasting notes effortlessly legible.
- **Labels & Numbers (`Space Grotesk`):** Provides a crisp, technical counterweight for prices, nutritional metrics, dietary indicators, prep times, and table numbers.

## Layout & Spacing

A 12-column responsive fluid grid anchors desktop interfaces, transitioning to a 6-column grid on tablet and a 4-column flow on mobile viewports.

### Breakpoints & Fluid Transitions
- **Desktop (1024px+):** Fixed margins of `2.5rem`, fluid column structures, with dishes presented in 3 or 4 column spans.
- **Tablet (768px – 1023px):** Margins of `1.5rem`, dishes displayed in 2-column cards, collapsible order drawer.
- **Mobile (Below 768px):** Margins set to `1rem` to maximize screen real estate for imagery. Dishes stack in 1-column detail views or horizontal swipe carousels.

### Spacing Rhythm
Empty space preserves focus around sensory food imagery. Component padding uses `space-md` (`1rem`) internally for compact cards and `space-lg` (`1.5rem`) for premium feature menus.

## Elevation & Depth

Visual hierarchy uses warm, ambient diffusion rather than harsh drop shadows, emulating soft table light:

- **Level 0 (Flat Canvas):** `#FBF9F6` base surface.
- **Level 1 (Resting Dish Cards):** `0px 2px 8px -2px rgba(24, 22, 21, 0.04), 0px 1px 2px 0px rgba(24, 22, 21, 0.02)` bordered with a hair-thin `1px solid rgba(239, 233, 225, 0.8)`.
- **Level 2 (Hovered Cards & Pickers):** `0px 12px 24px -6px rgba(217, 107, 39, 0.08), 0px 4px 12px -2px rgba(24, 22, 21, 0.04)`. A saffron-tinted ambient glow lifts elements upward.
- **Level 3 (Cart Drawer & Floating Modals):** `0px 24px 48px -12px rgba(24, 22, 21, 0.16)`.
- **Glassmorphism:** Bottom mobile order bars and sticky category filters employ a frosted effect (`backdrop-filter: blur(16px)` with `background: rgba(251, 249, 246, 0.82)`).

## Shapes

The interface balances architectural balance with organic comfort. 

- **Cards and Containers:** Feature a balanced `0.5rem` (`rounded-md`) to `1rem` (`rounded-lg`) curvature that cleanly frames high-resolution photography without clipping food contours.
- **Badges, Status Tags, and Counter Controls:** Adopt fully rounded pill shapes (`9999px`) to create clear tactile affordances and distinctive contrast against rectangular food tiles.

## Components

### Buttons
- **Primary Order Button:** Deep Saffron (`#D96B27`) background, pure white text, bold label typography (`Space Grotesk`). Slight scale-down on active tap (`transform: scale(0.98)`). Pill or `0.5rem` border radius.
- **Secondary / Ghost Button:** Transparent background, `1.5px` border in `#EFE9E1`, charcoal text (`#181615`). On hover, fills with light saffron wash (`rgba(217, 107, 39, 0.06)`).

### Badges & Dietary Chips
- **Format:** Pill-shaped (`rounded-full`), padding `0.25rem 0.75rem`.
- **Style:** Delicate tinted backgrounds with solid type:
  - Halal / Chef's Special: `#FDF5ED` background, `#D96B27` saffron text.
  - Vegan / Vegetarian: `#EDF3F0` background, `#1E2B24` pine text.
  - Spicy / Heat Index: Amber accent with flame iconography.

### Cards (Food & Restaurant Items)
- **Structure:** Clean 1:1 or 4:3 photography ratio anchored at the top, subtle bottom content region with item title, curated ingredient excerpts, and bottom pricing row.
- **Interactions:** Image subtly zooms (`scale(1.03)`) on card hover while the elevation moves from Level 1 to Level 2.

### Inputs & Quantity Selectors
- **Quantity Selector:** Pill container with recessed `#FBF9F6` background, charcoal `-` and `+` action points, and crisp tabular numbers in `Space Grotesk`.
- **Search & Special Instructions:** Inset container with warm bone border (`#EFE9E1`). On focus, transitions to a soft saffron halo ring (`0 0 0 3px rgba(217, 107, 39, 0.15)`).

### Sticky Floating Cart Bar (Mobile)
- High-contrast charcoal container (`#181615`) with saffron badge indicators and crisp typography, elevated via Level 3 shadow, granting immediate access to checkout with haptic-inspired tap states.