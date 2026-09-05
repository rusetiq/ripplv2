# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People tracking everyday sustainable choices who want a clear, credible record of their personal impact and community progress. This audience is inferred from the current product flows and copy.

## Product Purpose

Rippl lets people log sustainable actions, verify them with photo evidence, and measure resulting carbon and water savings. Success means the user can quickly record an action and understand how repeated choices accumulate over time.

## Positioning

The product connects verified everyday actions to a persistent personal impact record, then carries that record into streaks, community activity, rank, badges, and rewards.

## Operating Context

The primary workflow is mobile-first and repeated: choose or photograph an action, verify it, log it, then review its points and environmental impact. Secondary workflows include browsing community activity, comparing rank, redeeming rewards, and reviewing profile history.

## Capabilities and Constraints

- React and TypeScript web application with Tailwind CSS utilities.
- Firebase Authentication and Firestore persistence.
- Google sign-in gates personal data and write actions.
- Gemini-backed photo verification supports the action logging flow.
- The interface supports light and dark appearance modes.
- Existing production behavior, routes, data fields, legal pages, and authentication must remain intact during redesigns.

## Brand Commitments

- Product name: Rippl.
- Sustainability language should stay practical, specific, and global rather than region-specific.
- The interface should prioritize the signed-in product experience over marketing content.

## Evidence on Hand

- Working product implementation in `src/`.
- Firebase configuration and rules in the project root.
- No supplied testimonials, customer logos, benchmark claims, or independently verified aggregate impact figures. Future work must not fabricate them.

## Product Principles

1. Make the next useful action obvious.
2. Treat impact data as evidence, not decoration.
3. Reward consistency without making the product feel childish.
4. Keep community features supportive and easy to scan.
5. Preserve trust through clear states, honest copy, and visible recovery paths.
