# rippl presentation and poster kit

This folder contains the editable source, bundled assets, and exports for the nine-slide rippl product overview. The slide cards, impact cards, and brand pieces can be reused when adapting the system to a printed poster or other collateral.

## Build

Requires Node.js 20 or newer. From this folder, install the pinned direct dependencies, install Playwright's Chromium browser once, then build:

```sh
npm install
npx playwright install chromium
npm run build
```

The build is self-contained: it reads only files in this folder and does not depend on the application source tree or a machine-specific runtime path. It regenerates the browser deck, PDF, both editable PowerPoint filenames, slide PNGs, contact sheet, and editable-object report.

## Files

- `DESIGN.md` — visual specification, card inventory, slide plan, asset map, and editing guidance.
- `build.cjs` — canonical slide content and browser-deck generator.
- `theme.css` — card artwork and material treatments, vendored from the app's luminous card system.
- `card-studio.html` — standalone offline editor for the gradient cards; open it directly in a browser to edit copy and lighting, then download a complete HTML card or copy CSS.
- `export-editable.cjs` — exports native PowerPoint text, shapes, gradients, icons, and embedded walkthrough video.
- `package.json` — exact versions of the four direct build dependencies.
- `assets/` — Manrope font, rippl mark, sustainability icons, walkthrough video and video still, plus generated slide renders.
- `rippl-presentation.html` — browser deck with keyboard navigation and a playable walkthrough.
- `rippl-presentation.pdf` — static nine-page export; slide 5 uses the walkthrough poster still.
- `rippl-editable.pptx` and `rippl-presentation.pptx` — identical editable PowerPoint exports. Text, cards, impact figures, gradients, and dotted numerals are native objects; logo and sustainability icons are images.
- `preview.png` — contact sheet for a quick review.
- `editable-report.json` — object counts per slide from the PowerPoint export.

`assets/rippl-demo-poster.jpg` is the still image shown before the walkthrough plays. It is not a separate print poster.
