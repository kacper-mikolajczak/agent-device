# Skillgym For agent-device

This folder is a starter `skillgym` setup for benchmarking the `agent-device` and `dogfood` skills with a controlled Expo target app.

## Why `skillgym` fits here

`skillgym` is useful for `agent-device` in three layers:

1. Skill-routing checks: verify that the runner loads `skills/agent-device/SKILL.md` and its required references before it answers.
2. Workflow-planning checks: verify that the agent describes the right `agent-device` loop for a known fixture app.
3. Optional live-device smoke runs: locally, you can extend prompts so the agent actually drives `agent-device` against a simulator or device.

The included suite focuses on the first two layers so it stays stable and CI-safe.

## Included files

- `../../examples/test-app/`: minimal Expo SDK 55 fixture app for broad UI coverage
- `skillgym.config.ts`: starter config that runs Codex against this repo
- `suites/agent-device-smoke-suite.ts`: 20+ case suite for skill routing and fixture-aware planning

## Current coverage

The suite intentionally keeps the app small while covering the most valuable flows:

- open/snapshot/close defaults with Expo Go
- banners, alerts, toggles, and quick actions on Home
- search debounce, filters, long-list scroll, favorites, and cart updates in Catalog
- detail navigation, quantity edits, note append, and save-to-cart on Product
- form validation, success submit, keyboard dismiss, and reset on Checkout form
- diagnostics load/error/retry plus reset alert handling in Settings
- accessibility audit via screenshot + snapshot

## Suggested workflow

1. Start with the included smoke suite to benchmark routing and default guidance.
2. Extend the suite with app-specific prompts that mention `test-app` surfaces such as the catalog, modal, and form.
3. Add local-only cases that expect real `agent-device` shell commands once you are ready to involve a running simulator.

## Running the suite

`skillgym` is installed as a repo dev dependency, so run the starter suite from the project root:

```bash
cd /absolute/path/to/agent-device
pnpm install
pnpm test:skillgym
```

If you want to run `skillgym` directly instead of using the convenience script:

```bash
cd /absolute/path/to/agent-device
pnpm exec skillgym run \
  ./test/skillgym/suites/agent-device-smoke-suite.ts \
  --config ./test/skillgym/skillgym.config.ts
```

Prerequisites:

- `codex` CLI installed and authenticated, because the starter config uses the Codex runner
- repo dependencies installed with `pnpm install`
- if you want the fixture app running locally, use `pnpm test-app:install` and then `pnpm test-app:ios` or `pnpm test-app:android`

## Where to extend next

- Add suite cases that ask for selector-based plans against `Agent Device Tester`.
- Add local-only prompts that expect `agent-device open`, `snapshot`, `snapshot -i`, `get`, and `wait`.
- Add regression snapshots once the prompt set stabilizes.
