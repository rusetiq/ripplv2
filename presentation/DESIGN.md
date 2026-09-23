# rippl visual design handoff

## Purpose

The kit is a reusable visual system for a rippl product overview and future poster collateral. It includes the card source, brand and icon assets, font, walkthrough media, editable deck source, and rendered examples. The current deliverable is a nine-slide 16:9 overview; the walkthrough poster JPEG is only the video's preview frame.

## Design direction

Show sustainable everyday actions as calm, visible progress. Use a pale mineral canvas to keep the information quiet, rounded cards to group ideas, and luminous gradients to give key cards a distinct identity. The tone is optimistic and contemporary without making impact estimates look more certain than they are.

### Canvas and layout

- Slide size: 1600 × 900 px in the browser; 16:9 in PowerPoint.
- Canvas: soft mineral grey `#E9ECEA`; contact sheet background: `#CDD3CF`.
- Content is aligned to a 72 px horizontal page inset, with a shared header and footer.
- Titles use generous whitespace and short line lengths. Three-card rows use equal widths; dashboard and closing slides use a two-column split; action cards use a three-column first row and two wider cards below.
- Cards use a 34 px corner radius in the overview, a fine translucent edge, and white copy. Smaller dashboard cards keep the same gradient identity at a reduced scale.

### Type and color

- Typeface: Manrope Regular, bundled at `assets/manrope.ttf`.
- Main text: `#242B28`; supporting copy: `#525D56`; secondary labels: `#5D6860`.
- Brand mark blue: `#365C92`.
- Carbon impact card: mineral, leaf, and deep green tones, ending in `#0C553A`.
- Water impact card: pale cyan through blue, ending in `#1D467B`.
- Impact values use dotted numerals to distinguish them from ordinary copy.

Figures shown in the deck are illustrative demo values: 128.4 kg CO₂ avoided, 2,450 litres saved, 1,280 points, 32 actions, and a 12-day streak. Keep the estimate note in the footer or beside the figures whenever these are reused.

## Card library

Card layout and content live in `build.cjs`; the luminous card materials live in `theme.css`. The PowerPoint exporter turns card fills into editable native gradient shapes. Card artwork is CSS rather than a set of flattened card images, so copy and gradients can be changed independently.

| Variant | Treatment | Use in the overview |
| --- | --- | --- |
| `carbon-art` | Dark moss with a soft chartreuse edge | Make impact visible |
| `water-art` | Deep blue with cyan and indigo pools | Make evidence credible |
| `trees-art` | Aubergine with a warm lilac glow | Make progress repeatable |
| `catalog-art` | Plum field with a coral horizon | Log an action |
| `sapphire-card` | Navy with a narrow cyan light bar | Check the evidence |
| `forest-card` | Near-black green with an electric green beam | See impact; closing brand card |
| `transport-art` | Blue slate with a cool teal edge | Lower-emission travel |
| `food-art` | Forest tones with a soft leaf-green pool | Thoughtful food choices |
| `energy-art` | Charcoal plum with warm amber light | Everyday energy use |
| `water-log-art` | Deep teal with a mint pool | Water conservation |
| `waste-art` | Dark teal with muted sage light | Reuse and recycling |
| `aurora-card` | Ink with violet light from the lower edge | Milestones and streaks |
| `standing-art` | Midnight blue with a lilac corner glow | Shared progress |
| `rewards-invite-art` | Plum with coral and lilac pools | Points and rewards |
| `milestone-art` | Deep teal with a calm green edge | Explain impact estimates |

Impact cards are built separately from the expressive cards so carbon and water metrics keep stable semantic colors. Sustainability icons are separate transparent PNGs in `assets/icons/` and can be moved, resized, or omitted without changing the card material.

## Slide plan

1. **Product overview** — short proposition and paired carbon/water impact cards.
2. **The opportunity** — make impact visible, credible, and repeatable.
3. **How rippl works** — record, verify, and build with three process cards.
4. **Personal dashboard** — impact cards with points, streak, and action count.
5. **Walkthrough** — embedded 41-second product video; the PDF uses its still.
6. **Everyday actions** — travel, food, energy, water, and waste cards.
7. **Momentum and community** — milestone, shared progress, and reward cards.
8. **Credible impact record** — photo evidence, confidence review, and catalogue scoring.
9. **Start your ripple** — concise closing message and app link.

## Asset and source map

| Path | Contents |
| --- | --- |
| `build.cjs` | Slide copy, card content, HTML generation, and orchestration |
| `theme.css` | Luminous card gradients and material details |
| `export-editable.cjs` | PDF, editable PowerPoint, slide images, and contact sheet generation |
| `assets/brand/rippl-mark.png` | Source brand mark |
| `assets/icons/` | Eight sustainability illustrations; the six used by this deck plus two additional options |
| `assets/manrope.ttf` | Bundled typeface used by the browser deck and PowerPoint |
| `assets/rippl-demo.mp4` | Walkthrough video, including original audio |
| `assets/rippl-demo-poster.jpg` | Video poster frame |
| `assets/slide-01.png` … `assets/slide-09.png` | Individual rendered slide previews |
| `RIPPL_PROJECT_BRIEF.md` at repository root | Product context and evidence approach |

The font is Manrope, licensed under the SIL Open Font License 1.1. See the [upstream license](https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt) for its terms.

## Editing guidance

- Change text and the card order in `build.cjs`.
- Change a card's gradient stops, glow position, or edge color in `theme.css`.
- Change the overall canvas, spacing, type sizes, and card geometry in the HTML template inside `build.cjs`.
- Change metric colors or dotted-number styling in the `impact()` and `dotNumber()` helpers in `build.cjs`.
- Replace the walkthrough and still together in `assets/`; retain the same relative filenames or update both references in `build.cjs` and `export-editable.cjs`.
- Use `assets/slide-*.png` and `preview.png` as visual references. The browser deck is the fastest source to adapt to a custom print size; update its `@page` size and layout dimensions together if changing aspect ratio.

All impact values are illustrative and should be replaced with reviewed figures before external publication.
