# Session Routing

## When to open this file

Open this file when one run must stay pinned to one session or device across many commands, when multiple concurrent runs share a host, or when you need scoped device discovery.

## Session-bound automation

Use this when an orchestrator must keep plain CLI calls on one session and device.

```bash
export AGENT_DEVICE_SESSION=qa-ios
export AGENT_DEVICE_PLATFORM=ios
export AGENT_DEVICE_SESSION_LOCK=strip

agent-device open MyApp --relaunch
```

- `AGENT_DEVICE_SESSION` plus `AGENT_DEVICE_PLATFORM` provides the default binding.
- `--session-lock reject|strip` controls whether conflicting per-call routing flags fail or are ignored.
- Conflicts include explicit retargeting flags such as `--platform`, `--target`, `--device`, `--udid`, `--serial`, `--ios-simulator-device-set`, and `--android-device-allowlist`.
- Lock policy applies to nested `batch` steps too.
- Compatibility aliases remain supported: `--session-locked`, `--session-lock-conflicts`, `AGENT_DEVICE_SESSION_LOCKED`, and `AGENT_DEVICE_SESSION_LOCK_CONFLICTS`.

Android emulator variant:

```bash
export AGENT_DEVICE_SESSION=qa-android
export AGENT_DEVICE_PLATFORM=android

agent-device --session-lock reject open com.example.myapp --relaunch
```

## Scoped discovery

Use scoped discovery when one run must not see host-global device lists.

```bash
agent-device devices --platform ios --ios-simulator-device-set /tmp/tenant-a/simulators
agent-device devices --platform android --android-device-allowlist emulator-5554,device-1234
```

- Scope is applied before `--device`, `--udid`, and `--serial`.
- Out-of-scope selectors fail with `DEVICE_NOT_FOUND`.
- With iOS simulator-set scope enabled, iOS physical devices are not enumerated.
- If the scoped iOS simulator set is empty, the error should point at the set path and suggest creating a simulator in that set.
- Environment equivalents:
  - `AGENT_DEVICE_IOS_SIMULATOR_DEVICE_SET`
  - `AGENT_DEVICE_ANDROID_DEVICE_ALLOWLIST`

## Session inspection and replay routing

```bash
agent-device session list
agent-device replay ./session.ad --session auth
agent-device replay -u ./session.ad --session auth
```

- iOS session entries include `device_udid` and `ios_simulator_device_set`. Use them to confirm routing in concurrent runs.
- Prefer selector-based actions and assertions in saved replay scripts.
- Tenant isolation namespaces sessions as `<tenant>:<session>` during tenant-scoped runs.

## Security and trust notes

- Treat signing, provisioning, and daemon auth values as host secrets. Do not paste them into shared logs or commit them to source control.
- Prefer Xcode Automatic Signing over manual overrides when a physical iOS device is involved.
- Keep persistent host-specific defaults in environment variables rather than checked-in project config.

## When to leave this file

- Return to [bootstrap-install.md](bootstrap-install.md) once routing is pinned and you are ready to open the correct session.
- Return to [exploration.md](exploration.md) once the correct routed session is already open and stable.
- Switch to [remote-tenancy.md](remote-tenancy.md) if the run becomes a remote daemon or tenant-scoped host-control task.
