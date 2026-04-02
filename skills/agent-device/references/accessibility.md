# Accessibility

## When to open this file

Open this file when the task is to find UI that is visible to a user but missing from the accessibility tree.

## Audit loop

1. Capture a `screenshot` to see what is visually rendered.
2. Capture a `snapshot` or `snapshot -i` to see what the accessibility tree exposes.
3. Compare the two:
   - visible in screenshot and present in snapshot: exposed to accessibility
   - visible in screenshot and missing from snapshot: likely accessibility gap
4. If you suspect the node exists in AX but is filtered from interactive output, retry with `snapshot --raw`.

## Example

```bash
agent-device screenshot /tmp/accessibility-screen.png
agent-device snapshot -i
```

Use `screenshot` as the visual source of truth and `snapshot` as the accessibility source of truth for this audit.

## When to leave this file

- Return to [exploration.md](exploration.md) once the accessibility comparison is complete.
- Switch to [verification.md](verification.md) if you need screenshots, recordings, or other proof artifacts.
- Switch to [debugging.md](debugging.md) if the audit turns into a failure investigation rather than an accessibility comparison.
