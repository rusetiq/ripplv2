# Rippl design system

## Direction

A calm personal space for everyday environmental progress. The dashboard uses the user's supplied rounded health-dashboard references as visual direction, with Rippl's own sustainability data and actions. Soft mineral surfaces, pill navigation, generous cards, and quiet typography replace the former field-station treatment.

## Surfaces

- `/` is the public landing page, with the supplied hover-reactive liquid mark.
- `/app` is the existing application. On desktop it uses a persistent left sidebar; on mobile it uses a compact header and floating bottom navigation.
- Dashboard mode is Operate. The overview makes personal impact and the next action clear, then leads into community activity.
- Landing mode is Persuade. Blue carries the logo and display emphasis; muted blue identifies the primary action.

## Typography

- Manrope replaces Space Grotesk across the landing page and application.
- Headings use regular weight with restrained negative tracking. All rendered interface text is lowercase, with comfortable line height. Stored user data and identifiers retain their original case.
- Dashboard interface labels use Manrope rather than a technical monospace treatment.
- `DotNumber` renders dotted SVG numerals only for actual impact measurements, with accessible numeric labels. Guest data is a dash, never a fabricated sample.

## Palette

- Dashboard light canvas: `#e9ecea`.
- Light panels: `#f6f8f5`; raised surfaces: `#f9faf8`.
- Light primary text: `#242b28`; secondary: `#525d56`; muted: `#5d6860`.
- Dashboard dark canvas: `#15191b`; panels: `#202628`; primary text: `#f3f5f3`.
- Dashboard action signal: muted blue `#d5e0eb` with dark blue `#253b54` text. Lime accents are removed.
- The carbon card follows the supplied peach-to-yellow-to-vivid-green reference gradient; the water card uses a matching pale-cyan-to-deep-blue gradient, with a soft dark-green base, centered plain labels, dotted measurements, and a decorative dotted footer. No header pills, icons, or marketing captions appear inside these cards.
- Landing retains mineral `#f2f4f1`, carbon `#111512`, blue `#254bdf`, and muted blue action surfaces `#c5d6ea`.

## Shape and layout

- Navigation items and primary actions are pills.
- Dashboard cards use approximately 26–34px corner radii. Inputs and local controls use 14px; do not apply pills indiscriminately to forms.
- Desktop sidebar is 260px with spacious stacked navigation items. Below 1024px it becomes a compact header with mobile navigation.
- Overview order: greeting and log action, four impact totals, carbon and water panels, guest activation when relevant, then community and action suggestions.
- Mobile totals form a two-column grid; impact panels remain paired with reduced type and padding.

## Behavior and truth

- Preserve all existing tab IDs, authentication, action verification, persistence, rewards, profiles, and admin access.
- Navigation labels may be more conversational while retaining the underlying tab IDs.
- Impact panels lead to personal impact for signed-in users and sign-in for guests.
- Guest empty states explain the next step without invented progress, activity, testimonials, or scores.
- Interactive elements require visible focus and active state. Honor reduced-motion preferences.
- The liquid logo is an independent pointer-reactive shader. It stops rendering when idle or hidden and supplies a fallback when WebGL is unavailable.

## Header identity

The supplied Rippl symbol appears before the lowercase rippl wordmark in both dashboard and landing headers. The symbol is rendered from the original supplied mark with a luminance mask, blue in light mode and pale blue in dark mode.

## navigation finish

Mobile navigation uses evenly spaced icon-only buttons with accessible labels, a translucent glass surface, a reduced 10px backdrop blur, a fine highlight edge, and a clear active lens rather than a solid blue tile. Icons use a consistent light stroke. Dark mode and reduced-transparency fallbacks are provided. Card headings have no individual background, including water saved.
