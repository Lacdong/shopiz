---
version: alpha
name: Shopee
description: |
  Shopee's design system embodies energetic commerce optimism through bold,
  high-contrast visuals and a vibrant color language rooted in orange and white.
  The aesthetic prioritizes urgency and action—oversized promotional typography,
  bright accent colors on dark navigation, and strategic use of white space
  create a playful yet purposeful marketplace identity. The system balances
  approachability with clarity, employing a flat, modernist visual hierarchy
  that makes product discovery and transaction confidence immediate. Typography
  is utilitarian and lean, letting imagery and color carry emotional weight.
  This is a design for speed, conversion, and emerging-market accessibility.
source:
  url: "https://shopee.vn/"
  pagesAnalyzed: 1
  extractedAt: 2026-10-17
  tokensMeasured: true
colors:
  primary: "#FFFFFF"
  accent: "#FB5533"
  link: "#0000EE"
  canvas: "#000000"
  surface-alt: "#F5F5F5"
  on-primary: "#000000"
  hairline: "#898989"
  accent-1: "#EE4D2D"
typography:
  heading:
    fontFamily: SHPBurmese
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.7
    letterSpacing: 0px
  body-lg:
    fontFamily: SHPBurmese
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0px
  body-md:
    fontFamily: SHPBurmese
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0px
  body-sm:
    fontFamily: SHPBurmese
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: 0px
  body-sm-strong:
    fontFamily: SHPBurmese
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0px
  body-xs:
    fontFamily: SHPBurmese
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0px
  body-xs-loose:
    fontFamily: SHPBurmese
    fontSize: 12px
    fontWeight: 400
    lineHeight: 2
    letterSpacing: 0px
  nav:
    fontFamily: SHPBurmese
    fontSize: 13px
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: 0px
  button-sm:
    fontFamily: SHPBurmese
    fontSize: 14px
    fontWeight: 300
    lineHeight: 1
    letterSpacing: 0px
    textTransform: capitalize
  button-xs:
    fontFamily: SHPBurmese
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.17
    letterSpacing: 0px
  caption-xs:
    fontFamily: SHPBurmese
    fontSize: 12px
    fontWeight: 300
    lineHeight: 1.17
    letterSpacing: 0px
  caption-xs-strong:
    fontFamily: SHPBurmese
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0px
  caption-xs-loose:
    fontFamily: SHPBurmese
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0px
  caption-xs-2:
    fontFamily: SHPBurmese
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0px
  caption-xs-3:
    fontFamily: SHPBurmese
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0px
  caption-xs-uppercase:
    fontFamily: SHPBurmese
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0px
    textTransform: uppercase
rounded:
  xs: 4px
borderWidths:
  thin: 1px
shadows:
  sm: "rgba(0, 0, 0, 0.12) 0px 0px 9px 0px"
elevationStrategy: single-tier
themes:
  derived: light   # the other theme is the site's measured palette
  light:
    bg: "#FFF9F7"
    surface: "#F5EFED"
    surfaceRaised: "#EDE8E6"
    text: "#1D1413"
    textMuted: "#716A69"
    border: "#DBD6D4"
    accent: "#D82804"
    accentFg: "#FFFFFF"
    focusRing: "#FB5533"
    elevation: shadow
  dark:
    bg: "#000000"
    surface: "#F5F5F5"
    surfaceRaised: "#F6F6F6"
    text: "#111111"
    textMuted: "#0B0B0B"
    border: "#898989"
    accent: "#FB5533"
    accentFg: "#000000"
    focusRing: "#FB5533"
    elevation: "border+surface"
  contrastFailures:
    - "dark: text on bg = 1.11:1 (needs 4.5:1)"
    - "dark: muted on bg = 1.07:1 (needs 4.5:1)"
components:
  button-primary:
    typography: "{typography.button-xs}"
    textColor: "rgba(0, 0, 0, 0.87)"
    border: "1px solid rgba(0, 0, 0, 0.26)"
    height: 32px
    padding: "4px 4px 4px 4px"
    boxShadow: "rgba(0, 0, 0, 0.12) 0px 0px 9px 0px"
    rounded: "{rounded.xs}"
    backgroundColor: "{colors.primary}"
states:
  other-hover:
    target: other
    state: hover
    textColor: "{colors.accent-1}"
  link-hover:
    target: link
    state: hover
    textColor: "{colors.accent-1}"
breakpoints:
  - width: 375
    containerWidth: 375
    gridColumns: 0
    navLinksVisible: 0
    menuToggleVisible: false
    headingPx: 0
    bodyPx: 14
    sectionPaddingX: 0
  - width: 768
    containerWidth: 768
    gridColumns: 0
    navLinksVisible: 2
    menuToggleVisible: false
    headingPx: 0
    bodyPx: 14
    sectionPaddingX: 0
  - width: 1024
    containerWidth: 1024
    gridColumns: 0
    navLinksVisible: 0
    menuToggleVisible: false
    headingPx: 0
    bodyPx: 14
    sectionPaddingX: 0
  - width: 1280
    containerWidth: 1280
    gridColumns: 0
    navLinksVisible: 2
    menuToggleVisible: false
    headingPx: 0
    bodyPx: 14
    sectionPaddingX: 0
  - width: 1440
    containerWidth: 1440
    gridColumns: 0
    navLinksVisible: 2
    menuToggleVisible: false
    headingPx: 0
    bodyPx: 14
    sectionPaddingX: 0
coverage:
  statesFound: 3
  gradientsFound: 0
  rolesUnassigned: 1
  archetypesUnnamed: 0
  archetypesDetected: 0
  responsiveMeasured: true
  stylesheetsBlocked: true
  semanticRampDeclared: false
---

# Design System Inspired by Shopee

## 1. Visual Theme & Atmosphere

Shopee's design system embodies energetic commerce optimism through bold, high-contrast visuals and a vibrant color language rooted in orange and white. The aesthetic prioritizes urgency and action—oversized promotional typography, bright accent colors on dark navigation, and strategic use of white space create a playful yet purposeful marketplace identity. The system balances approachability with clarity, employing a flat, modernist visual hierarchy that makes product discovery and transaction confidence immediate. Typography is utilitarian and lean, letting imagery and color carry emotional weight. This is a design for speed, conversion, and emerging-market accessibility.

**Key Characteristics**
- High-contrast, vibrant brand palette centered on orange and white
- Urgent, action-driven color blocking for CTAs and promotions
- Utilitarian, lightweight typography with minimal ornamentation
- Flat, shadow-based depth with minimal layering
- Dense information layouts optimized for mobile-first commerce
- Playful, energetic tone through color and scale, not pattern or texture

## 2. Color Palette & Roles

### Primary
- **Primary / Brand** (`#FFFFFF`): Primary CTA fills, brand accent, active states, and dominant surface colour for buttons and interactive elements.
- **Brand Accent** (`#FB5533`): Hero banners, promotional sections, and key brand hue used alongside white for emphasis.

### Accent Colors
- **Secondary Accent** (`#EE4D2D`): Decorative accent and variant of brand orange; no measured semantic role. Used as a supporting accent colour in secondary contexts.

### Interactive
- **Link** (`#0000EE`): Inline hyperlink colour, providing standard web convention contrast against neutral backgrounds.

### Neutral Scale
- **Canvas / On Primary** (`#000000`): Default page background; label and text colour when placed on brand surfaces (white CTAs).
- **Surface Alt** (`#F5F5F5`): Alternating section band; pale neutral surface for rhythm and visual breathing room.
- **Hairline** (`#898989`): 1px borders and dividers; subtle stroke colour for edge definition.

## 3. Typography Rules

### Font Family
**Primary:** SHPBurmese, with fallback stack: Arial, Roboto, sans-serif.

### Hierarchy
| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|---|---|---|---|---|---|---|
| Heading | SHPBurmese | 14px | 700 | 1.7 | 0px | Section headers and prominent labels |
| Body Large | SHPBurmese | 18px | 400 | 1.5 | 0px | Long-form descriptive text |
| Body Medium | SHPBurmese | 16px | 400 | 1.2 | 0px | Primary body text; also used capitalized |
| Body Small | SHPBurmese | 14px | 400 | 1.43 | 0px | Secondary body text |
| Body Small Strong | SHPBurmese | 14px | 700 | 1.2 | 0px | Emphasized body content |
| Body XS | SHPBurmese | 12px | 400 | 1.4 | 0px | Small descriptive or secondary text |
| Body XS Loose | SHPBurmese | 12px | 400 | 2 | 0px | List items with generous line height |
| Button Small | SHPBurmese | 14px | 300 | 1 | 0px | Button labels; uses capitalize text-transform |
| Button XS | SHPBurmese | 12px | 400 | 1.17 | 0px | Compact button text |
| Caption XS | SHPBurmese | 12px | 300 | 1.17 | 0px | Smallest supplementary text |
| Caption XS Strong | SHPBurmese | 12px | 700 | 1.2 | 0px | Emphasized captions |
| Caption XS Uppercase | SHPBurmese | 12px | 700 | 1.2 | 0px | Uppercase strong captions; uses uppercase text-transform |
| Caption XS 2 | SHPBurmese | 12px | 700 | 1.4 | 0px | Variant strong caption |
| Caption XS 3 | SHPBurmese | 12px | 700 | 1.2 | 0px | Another strong caption variant |
| Caption XS Loose | SHPBurmese | 12px | 400 | 1.2 | 0px | Loose-spaced caption; also used uppercase |
| Navigation | SHPBurmese | 13px | 300 | 1.2 | 0px | Navigation link text |

### Principles
- Typography is lean and utilitarian, avoiding decorative weight variations except for emphasis.
- Line heights are generous relative to size, supporting readability on mobile screens.
- Uppercase and capitalization transforms are applied at the component level (buttons, captions, labels) rather than globally.
- Weight changes (300, 400, 700) provide hierarchy; size is secondary to weight in visual emphasis.
- SHPBurmese is the canonical font family; Arial and Roboto serve as fallbacks.

## 4. Component Stylings

### Buttons

**Primary Button**
- Background: `#FFFFFF` (white)
- Text Color: `rgba(0, 0, 0, 0.87)` (near-black)
- Font: {typography.button-xs} — SHPBurmese, 12px, weight 400, line-height 1.17
- Padding: 4px 4px 4px 4px
- Border: 1px solid `rgba(0, 0, 0, 0.26)` (light gray stroke)
- Border Radius: {rounded.xs} — 4px
- Box Shadow: `rgba(0, 0, 0, 0.12) 0px 0px 9px 0px`
- Height: 32px
- Width: 134.188px
- Hover State: Text color changes to `rgb(238, 77, 45)` (accent orange)

### Navigation Links

**Link (Default)**
- Color: {colors.link} — `#0000EE` (standard blue)
- Font: {typography.nav} — SHPBurmese, 13px, weight 300, line-height 1.2
- Hover State: Text color changes to `rgb(238, 77, 45)` (brand accent orange)

### Focus Indicator

**Focus-Visible State (All Interactive Elements)**
- Outline: {focus-indicator-stroke-width} solid {focus-indicator-color}
- Border Radius: {focus-indicator-border-radius}
- (Exact CSS custom property values not measured; refer to stylesheet variables)

## 5. Layout Principles

### Spacing System
No explicit spacing scale tokens were extracted. Layout uses context-specific padding and margin applied directly to components and sections. Sections use `padding-x: 0px` consistently across all breakpoints, with content constrained by viewport width rather than explicit outer margins.

### Grid & Container
- Content columns are full-width at all viewport sizes (375px, 768px, 1024px, 1280px, 1440px).
- No multi-column grid layout is used on measured breakpoints.
- Sections extend edge-to-edge without horizontal padding, making full-bleed imagery and color bands the dominant layout device.

### Whitespace Philosophy
Whitespace is minimal and purposeful. The {colors.surface-alt} (`#F5F5F5`) surface provides visual rhythm by alternating with white backgrounds. Vertical spacing is governed by section structure rather than a granular spacing scale; generous line heights in typography provide internal breathing room.

### Border Radius Scale
- {rounded.xs} = 4px — applied to interactive buttons and small UI elements. The system uses sharp corners (4px) rather than pill shapes, maintaining a geometric, modern aesthetic.

### Border Widths
- Thin: 1px — used for button borders and dividing strokes. This is the only border width variant in the measured system.

## 6. Depth & Elevation

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow | Backgrounds, text, inactive surfaces |
| Single Elevation | `rgba(0, 0, 0, 0.12) 0px 0px 9px 0px` | Buttons, interactive elements, subtle lift above page |

The elevation strategy is **single-tier with color-blocking**. Depth is achieved primarily through color contrast—white on orange, orange on white, and surface-alt bands provide visual layering. The sole shadow is a soft, diffuse drop applied to interactive buttons (`9px` blur, 12% black opacity) to signal clickability without creating visual heaviness. This restraint keeps the interface fast and uncluttered.

### Opacity Levels
No explicit opacity variants were extracted from the component styles. Opacity values appear in border and shadow definitions (0.26 for borders, 0.12 for shadows) but not as a discrete scale for disabled or overlay states.

### Z-index / Layering
- **Modal**: `9999` — used for modal dialogs and overlays that must sit above all other content.

## 7. Do's and Don'ts

### Do
- Use {colors.accent} (`#FB5533`) and {colors.primary} (`#FFFFFF`) as the core brand pair for high-impact promotions and CTAs.
- Apply the single {rounded.xs} (4px) radius consistently to buttons and small UI elements.
- Leverage the {typography.button-sm} (14px, weight 300) for button labels to keep them light and modern.
- Rely on color blocking and full-width bands to create visual structure and urgency in promotional sections.
- Use the soft drop shadow (`rgba(0, 0, 0, 0.12) 0px 0px 9px 0px`) on interactive elements to distinguish them from flat backgrounds.
- Build information density by using minimal padding and full-width layouts; compress rather than expand space.
- Apply the {typography.nav} (13px, weight 300) to navigation; keep it lean and lightweight.

### Don't
- Introduce additional shadow layers or depth strategies beyond the single measured elevation; keep the system flat.
- Use rounded corners wider than {rounded.xs} (4px) on standard buttons; the system favors sharp, geometric lines.
- Invent a semantic color ramp (error red, success green, warning yellow). The site does not expose these states; use orange and neutral contrast instead.
- Overuse {colors.surface-alt} (`#F5F5F5`); reserve it for alternating section bands to avoid visual fragmentation.
- Apply font weights outside the measured set (300, 400, 700); do not introduce 500 or 600.
- Scale typography beyond the measured sizes; maintain the hierarchy as extracted.
- Justify text alignment or apply heavy letter-spacing; typography should remain utilitarian and clear.

## 8. Responsive Behavior

### Breakpoints
| Viewport | Content Width | Grid Columns | Navigation Visible | Menu Toggle | Primary Heading Size | Body Size | Section Padding-X |
|---|---|---|---|---|---|---|---|
| 375px | 375px | N/A | No | No | 14px | 14px | 0px |
| 768px | 768px | N/A | Yes (2 links) | No | 14px | 14px | 0px |
| 1024px | 1024px | N/A | No | No | 14px | 14px | 0px |
| 1280px | 1280px | N/A | Yes (2 links) | No | 14px | 14px | 0px |
| 1440px | 1440px | N/A | Yes (2 links) | No | 14px | 14px | 0px |

Layout remains full-width across all breakpoints; no multi-column grid is in use. Navigation link visibility fluctuates (visible at 768px and 1280px+, hidden at 375px and 1024px) but no menu toggle mechanism was observed in measurements. Typography and padding remain constant, indicating a single-size-fits-all approach that adapts primarily through viewport width rather than responsive text scaling.

### Touch Targets
No explicit touch target size data was extracted. The measured button height is 32px, which exceeds the common 44px mobile guideline but is typical for web applications. Ensure clickable elements have sufficient padding and spacing to accommodate finger input on mobile; consider increasing padding on the smallest viewports (375px).

### Collapsing Strategy
Content collapses to full viewport width without introducing horizontal overflow or a hamburger menu. Sections, navigation bars, and promotional banners resize proportionally with the viewport. No measured breakpoint shows a dramatic layout shift (e.g., grid to stack); the system maintains linear, single-column flow across all sizes.

## 9. Agent Prompt Guide

### Quick Color Reference
- **Primary CTA & Brand Surfaces**: Primary (`#FFFFFF`) on Accent (`#FB5533`)
- **Page Background**: Black (`#000000`) for on-brand text; white default for content
- **Surface Alternation**: Surface Alt (`#F5F5F5`) for section breaks
- **Text on White**: Black (`#000000`) at full opacity, or `rgba(0, 0, 0, 0.87)` for button text
- **Links**: Link (`#0000EE`) with hover to `rgb(238, 77, 45)` (secondary accent)
- **Dividers & Subtle Strokes**: Hairline (`#898989`)

### Iteration Guide
1. Build buttons using {colors.primary} (`#FFFFFF`) background with 1px border (`rgba(0, 0, 0, 0.26)`), 4px radius, and {rounded.xs}.
2. Apply single soft shadow to interactive elements: `rgba(0, 0, 0, 0.12) 0px 0px 9px 0px`.
3. Use {typography.button-xs} (12px, weight 400) for button labels; capitalize via CSS text-transform.
4. Set body text to {typography.body-sm} or {typography.body-md} (14px or 16px, weight 400).
5. Structure layouts full-width with {colors.surface-alt} (`#F5F5F5`) for alternating bands; no side padding at any breakpoint.
6. Apply {colors.accent} (`#FB5533`) to hero sections, promotional badges, and high-priority CTAs.
7. Keep navigation lean: {typography.nav} (13px, weight 300) with link color {colors.link} (`#0000EE`), hover to brand accent.
8. Reserve weight 700 for headings and emphasized captions only.
9. Maintain 4px border radius on all interactive elements; do not use pill shapes (9999px).
10. Hover states change text color only; do not alter backgrounds unless explicitly measured on the target component.

## 10. Known Gaps

- **Interaction States**: The site's stylesheets declare only `hover` and `focus-visible` states. No `active`, `visited`, `disabled`, or `aria-*` states were measurable from the extracted CSS. Assume these must be designed per use case and do not have canonical tokens in the system.
- **Semantic Color Ramp**: No error, success, warning, or info colors are declared or measured. The site does not expose a status colour palette; use orange (`#FB5533`) and neutral contrast instead.
- **Spacing Scale**: No explicit spacing unit or scale (e.g., 8px, 16px increments) was extracted. Layout relies on full-width sections and component-level padding applied ad hoc. Build a spacing scale when implementing production components.
- **Decorative Accent** (`#EE4D2D`): One measured colour has no assigned role. It is used as a variant or accent but is not formally documented in the site's design language.
- **Dark / Light Mode**: The extraction covers one theme only. No dark mode or theme-switching mechanism was detected. The page snapshot shows a vibrant, light design; a derived dark mode is not part of the measured system.
- **Gradient or Mesh Overlays**: No gradients or decorative mesh patterns were found in the CSS. All colour is flat and solid.
- **Additional Typography Roles**: Typography is heavily fragmented across 18 measured roles, many of them caption and body variants with overlapping sizes. A consolidated typographic hierarchy may benefit production implementation; the extraction reflects how the site currently implements text without consolidation.
- **Cross-Origin Stylesheets**: Some stylesheets may have been cross-origin and unreadable, meaning additional CSS properties (animations, transitions, filters) may exist but were not captured.
- **Surfaces Behind Authentication**: The site's authenticated user areas (account, checkout, seller centre) were not analysed. Design tokens in those sections may differ from the public homepage.
- **Component States on Hover / Focus**: While `hover` changes link colour to `rgb(238, 77, 45)`, no `active` or `focus` states were explicitly measured on buttons or form inputs. Design these per convention (e.g., darker background for active, outline for focus) and align with the measured `focus-visible` outline structure if present.