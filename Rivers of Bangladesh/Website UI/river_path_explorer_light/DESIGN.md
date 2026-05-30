---
name: River Path Explorer (Light)
colors:
  surface: '#f9f9fc'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#3f4852'
  inverse-surface: '#2f3133'
  inverse-on-surface: '#f0f0f3'
  outline: '#6f7883'
  outline-variant: '#bec7d4'
  surface-tint: '#00629d'
  primary: '#00629d'
  on-primary: '#ffffff'
  primary-container: '#00a3ff'
  on-primary-container: '#00375a'
  inverse-primary: '#98cbff'
  secondary: '#006d37'
  on-secondary: '#ffffff'
  secondary-container: '#6bfe9c'
  on-secondary-container: '#00743a'
  tertiary: '#904d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#eb8104'
  on-tertiary-container: '#522900'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cfe5ff'
  primary-fixed-dim: '#98cbff'
  on-primary-fixed: '#001d33'
  on-primary-fixed-variant: '#004a77'
  secondary-fixed: '#6bfe9c'
  secondary-fixed-dim: '#4ae183'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005228'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
typography:
  headline-xl:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Sora
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Sora
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Sora
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system focuses on outdoor exploration and fluid navigation, optimized for high legibility in daylight environments. The light mode variant shifts the brand personality from a deep, immersive night-time trek to a bright, airy morning excursion. It maintains a **Corporate / Modern** base with **Minimalist** influences, emphasizing clarity, precision, and a sense of boundless space.

The target audience consists of active explorers and environmental enthusiasts who require high-contrast interfaces that remain readable under varying light conditions. The UI evokes feelings of energy, reliability, and openness through extensive use of whitespace and a refined, technical aesthetic.

## Colors
The palette is anchored by the signature **River Blue (#00A3FF)**, serving as the primary driver for interaction and branding. **Lush Green (#2ECC71)** acts as the secondary accent, reserved for success states, environmental indicators, and growth metrics.

In this light variant, the background is a crisp `F8FAFC` to reduce glare, while primary surfaces use a pure `FFFFFF` to create a clear layering effect. Typography and iconography utilize a deep neutral (`1A1C1E`) to ensure a high contrast ratio (minimum 7:1) for maximum accessibility. Borders and dividers use a subtle cool-gray to maintain structure without cluttering the visual field.

## Typography
The design system utilizes **Sora** across all levels to reinforce its geometric, forward-looking identity. The high x-height and distinct character shapes of Sora ensure excellent legibility on mobile devices and technical data displays.

Headlines use heavy weights and slight negative letter-spacing to create a strong visual "anchor" for content sections. Body text is prioritized for comfort, using a generous line height to prevent fatigue during long reading sessions. Labels and metadata employ increased tracking and medium weights to remain distinct from body prose even at smaller scales.

## Layout & Spacing
This design system employs a **Fluid Grid** system based on an 8px spatial scale. This ensures mathematical harmony across all components and layouts. 

- **Mobile:** 4-column grid with 16px side margins and 16px gutters.
- **Tablet:** 8-column grid with 24px side margins and 24px gutters.
- **Desktop:** 12-column grid with a max-width of 1440px, centered with 48px margins and 24px gutters.

Spacing should be used to create distinct "zones" of information. Large `xl` gaps are used to separate major thematic sections, while `sm` and `xs` units manage the relationships within individual components like cards or list items.

## Elevation & Depth
Depth is achieved through **Tonal Layers** and **Low-Contrast Outlines**. Unlike the dark mode variant which relies on glowing blurs, the light mode uses subtle structural definitions:

1.  **Level 0 (Background):** `F8FAFC` - The canvas.
2.  **Level 1 (Cards/Surfaces):** `FFFFFF` - With a 1px border of `E2E8F0`.
3.  **Level 2 (Hover/Active):** `FFFFFF` - With a soft, ambient shadow (Color: `1A1C1E`, Alpha: 0.04, Blur: 12px, Y-Offset: 4px).
4.  **Level 3 (Modals/Overlays):** `FFFFFF` - With a more pronounced shadow (Alpha: 0.08, Blur: 24px, Y-Offset: 8px) and a backdrop blur of 8px on the layers beneath.

This hierarchy ensures that navigation and interactive elements feel physically present without the need for aggressive drop shadows.

## Shapes
The shape language is consistently **Rounded**, using a 0.5rem (8px) base radius. This strikes a balance between the technical precision of a map-based tool and the approachability of a travel companion.

- **Standard Elements (Inputs, Small Buttons):** 8px radius.
- **Large Containers (Cards, Modals):** 16px (rounded-lg) to 24px (rounded-xl) radius.
- **Interactive Triggers (Floating Action Buttons, Pills):** Fully rounded/circular for maximum distinction from content containers.

## Components
- **Buttons:** Primary buttons use a solid River Blue background with white text. Secondary buttons use a transparent background with a 1px River Blue border and blue text.
- **Chips:** Accent chips for "Trail Status" use the Lush Green background with a 10% opacity tint of the same color for the background, and 100% opacity for the text to maintain vibrancy.
- **Inputs:** Fields utilize a white surface with a 1px gray border (`CBD5E1`). On focus, the border transitions to River Blue with a 2px outer "glow" using 15% opacity blue.
- **Cards:** White surfaces with the Level 1 elevation treatment. Headlines within cards should always be the Neutral `1A1C1E`.
- **Lists:** Separated by thin `F1F5F9` dividers. Interactive list items should have a background color transition to `F8FAFC` on hover.
- **Checkboxes/Radios:** When active, these are filled with River Blue. When inactive, they maintain a 2px border in a medium gray, ensuring they are easily discoverable on the white surface.
- **Maps/Imagery:** Should feature a 1px internal border to separate photography from the white UI background, preventing "bleed" in high-key images.