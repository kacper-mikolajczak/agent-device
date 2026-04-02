---
name: agent-device
description: Automates interactions for Apple-platform apps (iOS, tvOS, macOS) and Android devices. Use when navigating apps, taking snapshots/screenshots, tapping, typing, scrolling, or extracting UI info across mobile, TV, and desktop targets.
---

# agent-device

Use this skill as a thin router. Read this file first, then load only the references that match the task.

## Routing map

| Situation | Read next | Skip when |
| --- | --- | --- |
| Normal session setup, app launch, install, target selection | [references/bootstrap-install.md](references/bootstrap-install.md) | Skip only if the correct app session is already open on the correct target |
| Normal UI inspection or interaction | [references/exploration.md](references/exploration.md) | Skip only if the task is pure setup or pure debugging |
| Open-ended bug hunt with report | [../dogfood/SKILL.md](../dogfood/SKILL.md) | Skip for normal task execution |
| QA from acceptance criteria | [references/qa.md](references/qa.md) | Skip for open-ended exploration or bug hunts |
| Accessibility-gap audit | [references/accessibility.md](references/accessibility.md) | Skip unless the task is specifically about AX exposure |
| Known stable flow to run with `batch` | [references/batch.md](references/batch.md) | Skip unless the sequence is already known |
| Failure triage, logs, alerts, permissions, unstable sessions | [references/debugging.md](references/debugging.md) | Skip when the normal flow is working |
| Screenshots, diff, recording, replay maintenance, perf | [references/verification.md](references/verification.md) | Skip until the main interaction flow is working |
| macOS desktop surfaces, menu bar, frontmost app | [references/macos-desktop.md](references/macos-desktop.md) | Skip unless `--platform macos` or desktop surfaces matter |
| Shared host routing, session locking, scoped discovery | [references/session-routing.md](references/session-routing.md) | Skip for single-run local flows |
| Remote daemon or tenant-scoped host control | [references/remote-tenancy.md](references/remote-tenancy.md) | Skip for local runs |

## Normal device tasks

For normal device tasks:

1. Load [references/bootstrap-install.md](references/bootstrap-install.md) if the correct app session is not already open on the correct target.
2. Load [references/exploration.md](references/exploration.md) before normal UI inspection or interaction.

Use bootstrap to pin the correct target, app, and session. Use exploration once the app session is open and stable, or immediately if that session is already ready.

## Golden paths

1. Normal interaction: bootstrap if needed -> exploration -> verification only if you need proof.
2. RN warning during interaction: exploration -> dismiss warning -> continue without re-snapshotting -> debugging only if it keeps returning or becomes the task.
3. QA from acceptance criteria: bootstrap if needed -> exploration -> [references/qa.md](references/qa.md).
4. Bug hunt with reporting: switch to [../dogfood/SKILL.md](../dogfood/SKILL.md).
5. Accessibility audit: bootstrap if needed -> exploration -> [references/accessibility.md](references/accessibility.md).
6. Stable scripted flow: bootstrap if needed -> exploration -> [references/batch.md](references/batch.md).

Treat transient React Native warnings as part of the normal interaction path. Switch to debugging only when the warning keeps returning or becomes the thing you need to investigate.

## QA modes

- Open-ended bug hunt with reporting: use [../dogfood/SKILL.md](../dogfood/SKILL.md).
- Pass/fail QA from acceptance criteria: stay in this skill, use [references/bootstrap-install.md](references/bootstrap-install.md) if the correct app session is not already open on the correct target, then [references/exploration.md](references/exploration.md), then [references/qa.md](references/qa.md).

## Additional references

- Need logs, network, alerts, permissions, or failure triage: [references/debugging.md](references/debugging.md)
- Need screenshots, diff, recording, replay maintenance, or perf data: [references/verification.md](references/verification.md)
- Need acceptance-criteria mapping or pass/fail checks: [references/qa.md](references/qa.md)
- Need accessibility-gap auditing: [references/accessibility.md](references/accessibility.md)
- Need a known stable `batch` flow: [references/batch.md](references/batch.md)
- Need desktop surfaces, menu bar behavior, or macOS-specific interaction rules: [references/macos-desktop.md](references/macos-desktop.md)
- Need shared-host routing, session locking, or scoped discovery: [references/session-routing.md](references/session-routing.md)
- Need remote HTTP transport, `--remote-config` launches, or tenant leases on a remote macOS host: [references/remote-tenancy.md](references/remote-tenancy.md)
