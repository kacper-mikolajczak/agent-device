# Exploration

## When to open this file

Open this file when the app session is already running and you need to inspect the UI, choose a target, interact with the current screen, or verify a nearby state change.

## Default loop

1. Inspect the current screen with `snapshot` or `snapshot -i`.
2. Act with the smallest needed command.
3. Verify with `get`, `is`, `wait`, `diff snapshot`, or `screenshot` as needed.
4. Re-snapshot only after meaningful UI changes, except for transient React Native warnings that you dismiss and continue past.

## Decision shortcut

- Need visible text or structure: `snapshot`
- Need to tap, type, select, or choose a ref: `snapshot -i`
- Need exact text from a known target: `get text`
- Need an assertion: `is`
- Need search-driven targeting: `find`
- Need sync after a mutation: `wait`
- Need compact structural verification after a nearby change: `diff snapshot`
- Need proof image: `screenshot`
- Need to dismiss the keyboard: `keyboard dismiss`
- Need Android keyboard visibility or input-type state: `keyboard status` or `keyboard get`
- Need slower search-as-you-type input: `type --delay-ms <ms>`
- Need bounded manual scrolling: `scroll <direction> --pixels <n>`
- Need explicit back behavior: `back --in-app` or `back --system`

## Read-only first

- If the question is what text, labels, or structure is visible on screen, start with plain `snapshot`.
- Escalate to `snapshot -i` only when you need refs such as `@e3` for an interaction or targeted query.
- Prefer `get`, `is`, or `find` before mutating the UI when a read-only command can answer the question.
- On Android, use `keyboard status` or `keyboard get` when keyboard visibility or input type matters and you do not need to change UI state.
- Use the smallest reversible UI action needed to unblock inspection, such as dismissing a popup, closing an alert, or backing out of an unintended surface.
- Do not type or fill text just to make hidden information easier to access unless the user asked for that interaction.
- Do not use external sources to infer missing UI state unless the user explicitly asked.
- If the answer is not visible or exposed in the UI, report that gap instead of compensating with search, navigation, or text entry.

## Snapshot choices

- Use plain `snapshot` when you only need visible text or structure.
- Use `snapshot -i` when you need refs such as `@e3` for interaction or targeted inspection.
- On iOS and Android, default snapshot output is visible-first. Off-screen interactive content is surfaced as discovery hints, not as directly tappable refs.
- Use `snapshot -i -s "Camera"` or `snapshot -i -s @e3` when you want a smaller scoped result.
- If `snapshot -i -s "<query>"` returns 0 nodes, widen the query or re-check the current screen instead of assuming it fell back to the full tree.
- If `snapshot -i` returns 0 nodes but the screen is visibly populated, treat `screenshot` as visual truth, wait briefly, then re-run `snapshot -i` once before escalating.
- If `snapshot -i -d <n>` says the interactive output is empty at that depth, retry without `-d` instead of taking more shallow snapshots.

## Refs and selectors

- Use refs for discovery, debugging, and short local loops.
- Use selectors for deterministic scripts, assertions, and replay-friendly actions.
- Prefer selector or `@ref` targeting over raw coordinates.
- Use `scrollintoview @ref` when the target is already known from the current snapshot and you want the command to re-snapshot after each swipe until the element reaches the viewport safe band.
- If `scrollintoview @ref` succeeds, prefer the returned `currentRef` for the next action.
- Visible-first off-screen summaries are intentionally compact. If you need the full off-screen tree instead of a short summary, retry with `snapshot --raw`.
- Cap long searches with `--max-scrolls <n>` when the list may be unbounded or the target may not exist.
- Use `scroll <direction> --pixels <n>` when you need one bounded manual scroll distance instead of search-driven `scrollintoview`.
- For tap interactions, `press` is canonical and `click` is an equivalent alias.

## Text entry rules

- Use `fill` to replace text in an editable field.
- Use `type` to append text to the current insertion point.
- Use `fill @ref "text"` when you need to target a field directly by ref.
- Use `press @ref`, then `type "text"` when the field is already focused and you need append semantics.
- Do not write `type @ref "text"`; `type` only accepts text and will not target that ref for you.
- If search-as-you-type or debounced inputs drop characters, retry with `type --delay-ms <ms>` after focusing the field.
- If the keyboard blocks the next control after text entry, prefer `keyboard dismiss` instead of backing out of the screen.
- On iOS, `keyboard dismiss` depends on the active app session, so do not rely on it after closing or without `open`.
- On Android, `keyboard dismiss` can fail when the current IME only supports dismissal through back navigation. If that happens, tap a safe empty area instead of using `back` unless navigation is intended.
- Do not use `fill` or `type` just to make the app reveal information that is not currently visible unless the user asked for that interaction.

## Back navigation

- Prefer `back --in-app` when you mean the app's own back control or navigation stack.
- Use `back --system` only when you intentionally want platform back behavior.
- Do not rely on bare `back` when the distinction matters for the task.

## Interaction fallbacks

When `press @ref` fails:

1. If the error says the ref is off-screen, run `scrollintoview @ref` and reuse the returned `currentRef` or take one fresh snapshot.
2. Re-snapshot if the UI may have changed.
3. Retry `press @ref` or a selector-based `press`.
4. If `screenshot --overlay-refs --json` returned a reliable `overlayRefs[].center`, use `agent-device press <x> <y>`.
5. Open [coordinate-system.md](coordinate-system.md) if you are forced onto raw coordinates.

- Prefer `@ref` over coordinates.
- Do not guess coordinates from the image when structured `center` is available.
- `agent-device` does not provide a built-in vision-tap flag.

## Common mistakes to avoid

**Stale refs.** Do not treat `@ref` values as durable after navigation or dynamic updates. Re-snapshot after the UI changes, and switch to selectors when the flow must stay stable.

**Android AX tree lag.** After submits, route changes, or composer transitions, the accessibility tree can lag behind the visible UI. If `snapshot -i` and `screenshot` disagree:

1. Trust the screenshot as visual truth.
2. Take one fresh `snapshot -i`. Android retries briefly after navigation-sensitive actions.
3. If the tree still disagrees with the screenshot, wait briefly, then take one more fresh snapshot. Do not loop snapshots immediately.

**React Native dev overlays.** In dev or debug builds, warning or error overlays can block taps, change focus, or hide the real UI.

- If the warning or error is not the thing the user asked you to investigate, dismiss it and continue.
- After dismissing a transient React Native warning overlay, continue without re-snapshotting.
- If the overlay keeps returning or becomes the task, switch to [debugging.md](debugging.md).
- Mention visible warnings or errors in the final summary even if you dismissed them.

## React Native warning loop

Use this loop for React Native dev clients, Metro-backed builds, and local debug sessions where warnings or errors may appear as tooltips, banners, toasts, or modal overlays.

1. After `open`, inspect the visible UI for warning or error surfaces before relying on the next tap.
2. If a warning or error is visible, capture enough evidence to identify it:
   - preferred: `screenshot`
   - optional: `logs mark "warning visible"` or `logs mark "error visible"` if you are already in a debug window
3. If the overlay is not the thing the user asked you to investigate, dismiss or close it with the smallest reversible action.
4. Continue the intended flow without forcing a fresh snapshot.
5. Report any visible warnings or errors in the final summary, even if the flow succeeded after dismissal.

## Query and sync rules

- Use `get` to read text, attrs, or state from a known target.
- Use `is` for assertions.
- Use `wait` when the UI needs time to settle after a mutation.
- Use `find "<query>" click --json` when you need search-driven targeting plus matched-target metadata.
- Use `find "<query>" click --first` or `--last` when ambiguous matches are expected.
- Do not invent app names, device ids, session names, refs, selectors, or package names.
- Discover them first with `devices`, `open`, `snapshot -i`, `find`, or `session list`.

## Stop conditions

- If refs drift after transitions, switch to selectors.
- If a desktop surface or context menu is involved on macOS, load [macos-desktop.md](macos-desktop.md).
- If logs, network, alerts, or setup failures become the blocker, switch to [debugging.md](debugging.md).
- If the flow is stable and you need proof or replay maintenance, switch to [verification.md](verification.md).
- If the task becomes QA from acceptance criteria, switch to [qa.md](qa.md).
- If the task becomes an accessibility audit, switch to [accessibility.md](accessibility.md).
- If the flow is known and you want `batch`, switch to [batch.md](batch.md).
