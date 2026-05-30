---
name: River Path Explorer
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bec7d4'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#88919d'
  outline-variant: '#3f4852'
  surface-tint: '#98cbff'
  primary: '#98cbff'
  on-primary: '#003354'
  primary-container: '#00a3ff'
  on-primary-container: '#00375a'
  inverse-primary: '#00629d'
  secondary: '#4ae183'
  on-secondary: '#003919'
  secondary-container: '#06bb63'
  on-secondary-container: '#00431f'
  tertiary: '#f0bd8b'
  on-tertiary: '#482904'
  tertiary-container: '#c29364'
  on-tertiary-container: '#4c2c06'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#cfe5ff'
  primary-fixed-dim: '#98cbff'
  on-primary-fixed: '#001d33'
  on-primary-fixed-variant: '#004a77'
  secondary-fixed: '#6bfe9c'
  secondary-fixed-dim: '#4ae183'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005228'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#f0bd8b'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#623f18'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  data-mono:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
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

This design system is built to balance the rigorous precision of scientific data with the organic, fluid beauty of river ecosystems. The brand personality is **authoritative, adventurous, and immersive**, designed for researchers, environmentalists, and outdoor explorers who require clarity in complex environments.

The visual style is **Scientific Glassmorphism**. It utilizes high-contrast data visualization layered over deep, atmospheric backgrounds. By blending the transparency of water with the structural rigidity of modern data interfaces, the system creates a sense of looking "into" the data, much like looking into a clear riverbed. Expect deep blurs, crisp borders, and a focus on layered depth to organize information without overwhelming the user.

## Colors

The palette is rooted in the natural transition from deep water to the riverbank. 

- **Primary (River Blue):** A vibrant, high-vis blue used for active states, path tracking, and primary actions.
- **Secondary (Bank Green):** A lush, biological green used for environmental data, health indicators, and success states.
- **Tertiary (Earth Tone):** A warm, sandy beige used for topographical highlights and secondary information.
- **Neutral (Deep Slate):** A high-contrast dark navy that serves as the "waterbed" for the UI, ensuring that glassmorphic elements pop with maximum legibility.

The default mode is **dark**, providing a focused, immersive environment that reduces glare during field research and emphasizes the luminosity of the data overlays.

## Typography

The typography strategy separates **identity** from **utility**. 

**Sora** is utilized for headlines to provide a modern, technical, and slightly futuristic character. Its geometric construction mirrors the precision of scientific mapping.

**Inter** is the workhorse for all data, body text, and labels. It was chosen for its exceptional legibility at small sizes and high-contrast environments. For numerical data and coordinates, use the `data-mono` style which utilizes Inter's tabular lining features to ensure columns of numbers align perfectly for rapid scanning.

## Layout & Spacing

The design system employs a **fluid grid** model that prioritizes map real estate. The interface is treated as a series of "instrument panels" that float over a base map or data visualization layer.

- **Desktop:** A 12-column grid with wide 48px margins. Sidebars for community and data metrics should use fixed-width glass panels (320px) while the central "explorer" area remains fluid.
- **Mobile:** A single-column layout with 16px margins. Primary navigation and high-priority data chips are anchored to the bottom for ease of use during movement.
- **Rhythm:** All spacing is derived from an 8px base unit. Use `md` (24px) for most container padding to ensure a spacious, "breathable" scientific feel.

## Elevation & Depth

Hierarchy is established through **optical depth and translucency** rather than traditional opaque stacking.

1.  **Level 0 (The Bed):** The base map or primary visualization.
2.  **Level 1 (The Current):** Glassmorphic panels with a 12px backdrop blur and a 1px inner stroke (white at 10% opacity) to define edges. 
3.  **Level 2 (The Surface):** Interactive elements and active cards. These use a 20px backdrop blur and soft, navy-tinted ambient shadows (`hex #000814` at 40% opacity) to appear as if floating just above the map.
4.  **Level 3 (Overlays):** Modals and critical alerts. These utilize a darkened background dimming effect (40% black) combined with the highest level of blur to pull focus.

Transitions between these levels should be fluid, using ease-out cubic timing to mimic the movement of water.

## Shapes

The shape language reflects **weathered stone and fluid paths**. 

A standard roundedness of `0.5rem` (8px) is used for data cards and input fields to maintain a professional, structured feel. Larger containers and decorative "floating" map overlays use `1rem` (rounded-lg) to soften the interface and make it feel more organic. Interactive "Pill" shapes are reserved exclusively for status indicators (e.g., "Active Path") and main action buttons to distinguish them from informational panels.

## Components

### 3D-Styled Buttons
Primary buttons use a subtle top-to-bottom gradient of the Primary Blue. To achieve the "3D" effect, apply a 1px light-blue inner shadow on the top edge and a 2px dark-blue drop shadow. On press, the element should scale down to 98% and lose the drop shadow to simulate physical displacement.

### Interactive Data Cards
Cards must be glassmorphic with a `0.5rem` corner radius. Data points within the card should use the `data-mono` typography style. Include a subtle "sparkline" chart at the bottom of cards to show river flow or elevation trends, using the Secondary Green.

### Map Overlays & Tooltips
Overlays should be minimalist with high-contrast white text on a blurred dark-slate background. Connectors (lines pointing to map coordinates) should be 1px wide, using the Primary Blue with a subtle outer glow.

### Community Forum Layouts
The forum uses a "Clean Stream" approach: vertical threads with clear indentation and high-contrast separators. User avatars are circular, and "Expert" badges use the Tertiary Earth tone to signify experience and grounded knowledge.

### Input Fields
Inputs are semi-transparent with a 1px border that brightens when focused. Labels should always be visible (never use placeholder-only labels) to ensure scientific accuracy during data entry.