# agent-device Top 50 Checklist

Use this file when reviewing or refactoring `agent-device` skills.

This is a verification checklist, not a scoring rubric. The goal is to confirm that the skill package still gives both small and large models a clear, productive path through the most common mobile-app build, test, and exploration tasks.

## How to use this checklist

When changing `skills/agent-device/**`:

1. Review the touched guidance against the task families below.
2. Check for regressions in routing, missing first-step guidance, and lost fallback paths.
3. Focus especially on whether a smaller model can choose the right next reference and first command without guessing.
4. In your review or summary, call out any tasks that became clearer, weaker, or ambiguous.

## 1. Setup and environment

| # | Task | Goal |
| --- | --- | --- |
| 1 | Choose the right device target | Pick the correct simulator, emulator, phone, tablet, TV target, or desktop surface |
| 2 | Boot the correct simulator or emulator | Get the target running before app interaction |
| 3 | Launch the app on the correct target | Start the intended app on the intended device |
| 4 | Install a fresh build artifact | Put a new `.apk`, `.aab`, `.app`, or `.ipa` on the target |
| 5 | Relaunch into a clean runtime state | Reset stale app state without changing more than needed |
| 6 | Pick the correct app identifier or package | Discover and use the actual installed app name or identifier |
| 7 | Open the app in a named session | Pin work to a reusable session |
| 8 | Preserve a replay script when closing | Save a useful `.ad` artifact from a finished session |

## 2. Routing and session control

| # | Task | Goal |
| --- | --- | --- |
| 9 | Keep many commands pinned to one session | Avoid retargeting across a longer flow |
| 10 | Avoid retargeting by accident on a shared host | Keep one run scoped to one chosen device |
| 11 | Scope discovery to a subset of devices | Limit device selection in mixed environments |
| 12 | Run multiple concurrent sessions safely | Avoid session collisions across runs |
| 13 | Decide when session-routing is needed | Know when to stay in bootstrap vs load advanced routing |
| 14 | Route commands in tenant or remote setups | Handle remote daemon or tenant-scoped host control safely |

## 3. Navigation and interaction

| # | Task | Goal |
| --- | --- | --- |
| 15 | Inspect the current screen | Read visible structure and state |
| 16 | Find a specific element to act on | Resolve a control, row, field, or button reliably |
| 17 | Tap, scroll, and navigate normally | Move through the app using the default loop |
| 18 | Use selectors vs refs correctly | Choose stable targeting for the current task |
| 19 | Recover when a ref goes stale or off-screen | Re-target without guesswork |
| 20 | Use raw coordinates only as a fallback | Fall back safely when structured targeting fails |
| 21 | Open a deep link or route directly | Land on a known route without manual navigation |
| 22 | Navigate directly to a known screen without waste | Skip unnecessary manual steps when direct routing is available |

## 4. Text entry and keyboard

| # | Task | Goal |
| --- | --- | --- |
| 23 | Fill a form field correctly | Replace field text reliably |
| 24 | Append text to an already-focused field | Type at the insertion point without retargeting |
| 25 | Handle blocked UI due to keyboard | Continue the flow when the keyboard covers controls |
| 26 | Inspect Android keyboard state or input type | Read keyboard visibility or field type without mutating UI |
| 27 | Avoid typing just to reveal hidden info | Keep inspection read-only unless text entry is actually required |

## 5. Read-only QA and assertions

| # | Task | Goal |
| --- | --- | --- |
| 28 | Verify visible UI content | Confirm text, labels, and structure on screen |
| 29 | Turn acceptance criteria into checks | Convert expected behavior into concrete pass/fail verification |
| 30 | Verify nearby structural UI changes | Confirm what changed after one local mutation |
| 31 | Capture proof artifacts after verification | Save evidence once the expected state is reached |
| 32 | Compare before/after state around a mutation | Validate a nearby change without re-exploring everything |

## 6. Exploratory testing

| # | Task | Goal |
| --- | --- | --- |
| 33 | Run an open-ended bug hunt | Explore broadly for issues rather than proving one requirement |
| 34 | Systematically move through major app areas | Cover the main surfaces without getting stuck |
| 35 | Capture repro evidence for bugs | Save enough proof to make the issue actionable |
| 36 | Produce a structured issue report | Turn findings into a reproducible handoff |

## 7. Debugging and failure triage

| # | Task | Goal |
| --- | --- | --- |
| 37 | Inspect app logs for a broken flow | Narrow down what happened during a repro |
| 38 | Inspect network activity tied to the session | Check request and response behavior in context |
| 39 | Handle permission prompts and alerts | Resolve blocking system or app prompts correctly |
| 40 | Distinguish AX tree lag from real breakage | Avoid misdiagnosing stale snapshots as product failures |
| 41 | Triage a crash or fatal termination | Branch quickly to the right crash evidence source |
| 42 | Narrow a flaky repro to a short debug window | Reduce noise and capture only the relevant failure interval |

## 8. React Native and dev-build specific

| # | Task | Goal |
| --- | --- | --- |
| 43 | Dismiss transient React Native warnings and continue | Keep the flow moving when the warning is not the task |
| 44 | Escalate recurring React Native warnings to debugging | Treat repeated overlays as part of app state, not disposable chrome |
| 45 | Preserve evidence when React Native overlays appear | Capture enough proof to name the warning or error later |

## 9. Accessibility

| # | Task | Goal |
| --- | --- | --- |
| 46 | Compare visual UI with the accessibility tree | Detect mismatches between rendered UI and AX exposure |
| 47 | Detect elements visible to users but missing from AX | Find missing accessibility exposure gaps |
| 48 | Retry with `snapshot --raw` when AX exposure is unclear | Separate collector filtering from truly missing content |

## 10. Automation and maintenance

| # | Task | Goal |
| --- | --- | --- |
| 49 | Run a known stable multi-step flow with `batch` | Reduce round trips once the flow is already known |
| 50 | Maintain replay scripts when selectors drift | Keep `.ad` flows usable over time |
