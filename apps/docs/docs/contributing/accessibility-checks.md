---
title: "♿ Accessibility checks"
---

# ♿ Accessibility checks

:::tip[Works today]
This describes `cryptos-web` as it works right now.
:::

The Fleet Manager console (`cryptos-web`) targets WCAG 2.2 AA. This page covers how that's checked: what runs automatically, what's left to a manual pass, and why.

## Automated: axe on every kit component

Every component in the shared UI kit (`packages/ui`) has a test that renders it and runs [axe-core](https://github.com/dequelabs/axe-core) over the result, through a shared `expectNoA11yViolations` helper. A component's test suite fails if axe reports any violation.

Two rules are turned off in that check, both for the same reason: the tests run in `jsdom`, which never lays out the page, so `getBoundingClientRect()` returns an all-zero rect for every element no matter its styled size. Checking either rule there would pass vacuously instead of catching a real problem:

- **`color-contrast`** — jsdom cannot read rendered colors or compute contrast ratios.
- **`target-size`** (2.5.8, the 24x24 CSS px minimum) — axe's spacing heuristic depends on real layout; without it, even a deliberately undersized, isolated element reports as having enough room.

Both are checked in the manual pass described below instead.

## Automated: lint

[`eslint-plugin-jsx-a11y`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) runs at error level across the repo, so a markup-level accessibility problem (a missing label, a non-interactive element with a click handler, and the rest of the ruleset) fails the lint step rather than waiting to be caught later.

## Manual: a WCAG 2.2 AA pass per wave

Each wave of screens built on the kit gets a manual WCAG 2.2 AA pass before it's considered done, covering what automated tooling can't reach in `jsdom`, among others:

- **2.5.8 Target Size (Minimum)** — every interactive target is at least 24x24 CSS px, or has enough spacing from its neighbors to meet the exception.
- **2.4.11 Focus Not Obscured (Minimum)** — a focused element is never fully hidden behind sticky headers, footers or other fixed UI.
- Real contrast, on the actual rendered colors in both the light and dark themes.
- Keyboard navigation through the screen: every control is reachable and operable without a mouse, in a sensible order.

The manual pass is part of each wave's exit gate, alongside the axe and lint checks staying clean and the existing test suite staying green.

## Where this lives in the code

- `packages/ui/src/test/axe.ts` — the `expectNoA11yViolations` helper and the reasoning for the two disabled rules.
- `eslint.config.js` — the `jsx-a11y` strict flat config, at error level.

See the repository's `AGENTS.md` for how these fit into the kit's layout and build.
