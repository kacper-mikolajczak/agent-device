# Bootstrap and Install

## When to open this file

Open this file when you still need to choose the right target, start the right session, install or relaunch the app, or pin the run to one device before interacting.

## Default setup path

Use this order when you are not sure about the target or installed app identifier:

1. `devices`
2. `apps`
3. `ensure-simulator`
4. `open`
5. `session list`

On Android dev builds in particular, `apps` is cheaper than guessing package suffixes and retrying failed `open` calls.

## Most common mistake to avoid

Do not start acting before you have pinned the correct target and opened an `app` session. In mixed-device environments, always pass `--device`, `--udid`, or `--serial` while choosing the target.

## Open-first rule

- If the user asks to test an app and does not provide an install artifact or explicit install instruction, try `open <app>` first.
- If `open <app>` fails or you are not sure which app name is available on the target, run `agent-device apps` and retry with a discovered app name instead of guessing.
- Do not install or reinstall on the first attempt unless the user explicitly asks for installation or provides a concrete artifact path or URL.
- When installation is required from a known location, prefer a checked-in shell script or other deterministic bootstrap command over ad hoc path guessing.

## Install guidance

- Use `install <app> <path>` when the app may already be installed and you do not need a fresh-state reset.
- Use `reinstall <app> <path>` when you explicitly need uninstall plus install as one deterministic step.
- Keep install and open as separate phases. Do not turn them into one default command flow.
- Supported binary formats:
  - Android: `.apk` and `.aab`
  - iOS: `.app` and `.ipa`
- For iOS `.ipa` files, `<app>` is used as the bundle id or bundle name hint when the archive contains multiple app bundles.
- After install or reinstall, later use `open <app>` with the exact discovered or known package or bundle identifier, not the artifact path.
- Do not use `open <apk|aab> --relaunch` on Android.

## Common starting points

These are examples, not required exact sequences. Use the smallest setup flow that matches the task.

### Boot a simulator and open an app

```bash
agent-device ensure-simulator --platform ios --device "iPhone 17 Pro" --boot
agent-device open MyApp --platform ios --device "iPhone 17 Pro" --relaunch
```

### Install an app artifact

```bash
agent-device install com.example.app ./build/app.apk --platform android --serial emulator-5554
```

```bash
agent-device install com.example.app ./build/MyApp.app --platform ios --device "iPhone 17 Pro"
```

## Choose the right starting point

- iOS local QA: prefer simulators unless the task explicitly requires physical hardware.
- iOS in mixed simulator and device environments: run `ensure-simulator` first, then keep using `--device` or `--udid`.
- TV targets: use `--target tv` together with `--platform` when the task is for tvOS or Android TV.
- Android binary flow: use `install` or `reinstall` for `.apk` or `.aab`, then open by installed package name.
- macOS desktop app flow: use `open <app> --platform macos`. Only load [macos-desktop.md](macos-desktop.md) if a desktop surface or macOS-specific behavior matters.

## Session basics

- Use `--session <name>` when you need a named session.
- Use `open <app>` before interactions.
- Use `close` when done. Add `--shutdown` when you want simulators or emulators torn down with the session.
- Use `close --save-script=<path>` when you want to preserve a replay script from the session.
- Use semantic session names when you need multiple concurrent runs.
- For dev loops where state can linger, prefer `open <app> --relaunch`.
- In iOS sessions, use `open <app>` for the app itself. Use `open <url>` for deep links, and `open <app> <url>` when you need to launch the app and deep link in one step.
- On iOS, `appstate` is session-scoped and requires the matching active session on the target device.

Example:

```bash
agent-device --session auth open Settings --platform ios
agent-device --session auth snapshot -i
```

## After a session is established

- Prefer `--session <name>` on follow-up commands, or use sandboxed `AGENT_DEVICE_SESSION`.
- Do not keep repeating `--platform`, `--target`, `--device`, `--udid`, or `--serial` on normal follow-up commands.
- Use target-selection flags again only when you are choosing the target before opening a session, or when you intentionally mean to retarget.

Good shared-host pattern:

```bash
agent-device --session auth open Settings --platform ios --device "iPhone 17 Pro"
agent-device --session auth snapshot -i
agent-device --session auth press @e3
agent-device --session auth close
```

Bad shared-host pattern:

```bash
agent-device --session auth open Settings --platform ios --device "iPhone 17 Pro"
agent-device --session auth snapshot -i --platform ios --device "iPhone 17 Pro"
```

## When to leave this file

- Once the correct target and session are pinned, move to [exploration.md](exploration.md).
- If opening, startup, permissions, or logs become the blocker, switch to [debugging.md](debugging.md).
- If you need advanced session locking, scoped discovery, or concurrent-run routing, switch to [session-routing.md](session-routing.md).
