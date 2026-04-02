# Batch

## When to open this file

Open this file only when a short command sequence is already known and belongs to one logical screen flow.

## Core rules

- Use `batch` only after exploration has stabilized the flow.
- Keep batch size moderate, roughly 5 to 20 steps.
- Add `wait` or `is exists` guards after mutating steps.
- Do not use `batch` for highly dynamic flows that need replanning after each step.
- Nested `batch` and `replay` are rejected.
- Replan from the first failing step instead of rerunning the whole flow blindly.

## Example command

```bash
agent-device batch --session sim --platform ios --steps-file /tmp/batch-steps.json --json
```

## Step payload contract

```json
[
  { "command": "open", "positionals": ["Settings"], "flags": { "platform": "ios" } },
  { "command": "wait", "positionals": ["label=\"Privacy & Security\"", "3000"], "flags": {} },
  { "command": "click", "positionals": ["label=\"Privacy & Security\""], "flags": {} },
  { "command": "get", "positionals": ["text", "label=\"Tracking\""], "flags": {} }
]
```

- `positionals` is optional and defaults to `[]`.
- `flags` is optional and defaults to `{}`.
- Only `command`, `positionals`, `flags`, and `runtime` are accepted as top-level step keys.
- Supported error mode is stop-on-first-error.

## Canonical stable-flow recipe

```json
[
  { "command": "open", "positionals": ["com.example.app"], "flags": { "platform": "android" } },
  { "command": "wait", "positionals": ["text", "Home", "3000"], "flags": {} },
  { "command": "press", "positionals": ["label=\"More actions\" role=button"], "flags": {} },
  { "command": "wait", "positionals": ["text", "Camera scan", "2000"], "flags": {} },
  { "command": "press", "positionals": ["label=\"Camera scan\""], "flags": {} },
  { "command": "wait", "positionals": ["text", "Expense created", "15000"], "flags": {} },
  { "command": "is", "positionals": ["visible", "label=\"Expense created\""], "flags": {} }
]
```

## Common batch error categories

- `INVALID_ARGS`: fix the payload shape and retry.
- `SESSION_NOT_FOUND`: open or select the correct session, then retry.
- `UNSUPPORTED_OPERATION`: switch to a supported command or surface.
- `AMBIGUOUS_MATCH`: refine the selector or locator, then retry the failed step.
- `COMMAND_FAILED`: add sync guards and retry from the failing step.

## When to leave this file

- Return to [exploration.md](exploration.md) if the flow is no longer stable enough for `batch`.
- Switch to [verification.md](verification.md) if the batch flow is working and you only need proof or replay maintenance.
- Switch to [debugging.md](debugging.md) if failures need log, alert, or permission triage.
