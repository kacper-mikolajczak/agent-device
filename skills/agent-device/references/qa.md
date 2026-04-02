# QA

## When to open this file

Open this file when the task starts from acceptance criteria and you need to turn those criteria into concrete checks.

## Preferred mapping

- visibility claim for what is on-screen now: `is visible` or plain `snapshot`
- presence claim regardless of viewport visibility: `is exists`
- exact text, label, or value claim: `get text`
- post-action state change: act, then `wait`, then `is` or `get`
- nearby structural UI change: `diff snapshot`
- proof artifact for the final result: `screenshot` or `record`

## Notes

- `wait text` is useful for synchronizing on text presence, but it is not the same as `is visible`.
- After a nearby navigation or submit on Android, prefer `screenshot`, then `wait 500` or `wait 1000`, then one fresh `snapshot -i` if the accessibility tree seems stale.
- Do not invent app names, device ids, session names, refs, selectors, or package names.
- Discover them first with `devices`, `open`, `snapshot -i`, `find`, or `session list`.
- If refs drift after navigation, re-snapshot or switch to selectors instead of guessing.

## Avoid this escalation path for visible-text questions

- Do not jump from `snapshot -i` to `get text @ref`, then to web search, then to typing into a search box just to force the app to reveal the answer.
- Start with `snapshot`. If the text is not visible or exposed, report that directly.
- After Android submit or navigation-heavy actions when the UI looks wrong: `screenshot` first, then `snapshot -i`.

## Canonical QA loop

```bash
agent-device open MyApp --platform ios
agent-device snapshot -i
agent-device press @e3
agent-device wait visible 'label="Success"' 3000
agent-device is visible 'label="Success"'
agent-device screenshot /tmp/qa-proof.png
agent-device close
```

## When to leave this file

- Return to [exploration.md](exploration.md) once the acceptance criteria are translated into concrete checks.
- Switch to [verification.md](verification.md) if the flow is stable and you only need proof artifacts.
- Switch to [debugging.md](debugging.md) if failures, logs, alerts, or setup problems become the blocker.
