# bewithflow

Speak in any app and get clean text pasted at your cursor. It is a Wispr Flow–style dictation app where **you sign in with your ChatGPT account, and that's it**. There are no API keys. Every dictation is cleaned up by your own ChatGPT plan.

```
 press shortcut ─► floating pill records your mic
                        │
                        ▼
      On-device Whisper (on this computer) ─► raw transcript
                        │
                        ▼
      Plus/Pro: your ChatGPT plan + MASTER PROMPT ─► clean text ─► pasted at your cursor
                        │ Free plan, limit reached or offline
                        ▼
      On-device AI cleanup (small model on this computer) ─► pasted
                        │ not downloaded?
                        ▼
      Basic rule-based cleanup ─► still pasted
```

## Run it

```bash
cd bewithflow
npm install
npm start          # works from a VS Code terminal too
npm test           # 29 tests: sign-in flow, ChatGPT calls, fallbacks, store, prompt
```

## First-time setup

1. **Click Continue with ChatGPT.** Your browser opens ChatGPT's sign-in page. Sign in and approve bewithflow, then return to the app.
   - **On ChatGPT Free?** Click **Use bewithflow free on this computer**.
     - OpenAI's "Sign in with ChatGPT" for apps like this only works with Plus and Pro.
     - OpenAI's page blocks Free accounts ("A required permission is unavailable").
     - A profile-only sign-in needs an OpenAI-issued client ID (`invalid_client` otherwise).
     - In Free mode, everything runs on your computer. **Settings → Account → Connect ChatGPT** upgrades later and keeps your history, dictionary and snippets.
   - **Plus or Pro:** dictations are cleaned up by your ChatGPT plan.
   - **Free:** OpenAI doesn't let Free plans power other apps, so bewithflow cleans up with a small AI model on your computer. Download it on the setup screen (1.1 GB, one time).
2. **Download the speech engine.** Choose **Fast** (78 MB) or **Accurate** (259 MB). It downloads once, then runs offline.
3. **Free accounts:** download **On-device cleanup**. It's optional on Plus/Pro, where it's used as a backup.
4. **Allow permissions (macOS).**
   - **Microphone**, to hear you.
   - **Accessibility**, so bewithflow can paste into other apps. Without it, the text is copied for you to paste with ⌘V.
5. Click **Start dictating**.

When you run from source, macOS grants these permissions to **Electron** (or to your terminal / VS Code), not to "bewithflow".

## How "Sign in with ChatGPT" works here

bewithflow uses OpenAI's official **Sign in with ChatGPT** flow for apps that run locally ([docs](https://developers.openai.com/siwc/token-sharing-open-source)).

- **First sign-in:**
  - Your browser opens `auth.openai.com`, where you approve bewithflow.
  - ChatGPT registers bewithflow on your account and sends back its own client ID.
  - No client secret or API key is involved at any point.
- **Recovery:**
  - If the token step fails with `invalid_grant`, bewithflow signs in again with the registration ChatGPT just issued, as OpenAI's docs instruct.
  - If plan usage still can't be granted, it signs in with identity only and switches to Free mode.
  - Each sign-in step (no tokens or codes) is written to `~/Library/Application Support/bewithflow/logs/signin.log`, which **Show sign-in log** opens.
- **Tokens:**
  - They're stored encrypted in your OS keychain (Electron `safeStorage`).
  - They refresh automatically every hour.
  - Signing out revokes them at OpenAI.
- **Usage:**
  - Dictations count toward your ChatGPT plan. Plus also has a 5-hour limit shared across all apps.
  - You can cap bewithflow's share in **ChatGPT Settings → Usage** (from 10% to 100%).
  - If you hit the limit, bewithflow switches to basic cleanup and shows a banner.
- **Why speech-to-text runs on your computer:** ChatGPT plan usage accepts text, but not audio or the transcription API, so Whisper runs locally. Your audio never leaves your computer; only the transcript goes to ChatGPT.

## Using it anywhere (WhatsApp, Slack, Mail, your browser…)

Click into any text box, then:

| Action | Mac | Windows |
|---|---|---|
| **Hold to talk**: hold, speak, release to paste | **fn**. You can switch to ⌃⌥, Right ⌥, Right ⌘ or Right ⌃ | not available |
| **Hands-free**: start, then press again to paste | double-tap **fn**, or **fn + Space**, or **⌘⇧Space** | **Ctrl+Shift+Space** |
| Cancel while recording | **Esc** | **Esc** |
| Paste last transcript | **⌘⌃V** | **Shift+Alt+Z** |

- **Quick taps don't count.** A tap shorter than about a third of a second is ignored, and the Flow Bar shows a "Hold fn to talk" tip.
- **Other shortcuts still work.** If you press another key while holding fn (fn+F1, say), bewithflow treats it as that shortcut, not as dictation.
- **Flow Bar:** the small pill at the bottom of the screen.
  - Hover it to see the hint.
  - Click it to start hands-free.
  - In hands-free mode, it shows ✕ (cancel) and ■ (finish).
- **Recordings stop automatically after 10 minutes.**
- **Globe-key tip:** if holding fn opens the emoji picker or dictation, set **System Settings → Keyboard → Press 🌐 key to → Do Nothing**. Setup offers a button for this.

### How hold-to-talk works on macOS

A tiny native helper, [native/mac/keyhook.swift](native/mac/keyhook.swift), does three jobs:

- **Watches for your chosen key.** It only ever reports that key being pressed or released, never what you type.
- **Pastes** with a native ⌘V.
- **Reports the app you're in**, so styles match it.

It's compiled automatically the first time the app runs; this needs the Xcode command-line tools, which provide `swiftc`. You can also build it with `npm run build:helper`. It uses the **Accessibility** permission that bewithflow already asks for.

## Speed

These were measured on an Intel MacBook. Time runs from releasing the key to the text appearing.

| Step | Typical time | Notes |
|---|---|---|
| Listening tail after release | 0.25 s | Keeps your last word from being clipped |
| Speech-to-text | ~0.9–1.4 s | Long dictations are transcribed in pieces while you talk (cut only at pauses of 300 ms or more), so ~0.9 s remains after release instead of ~2 s |
| ChatGPT cleanup | **~2.5–5.5 s** | Mostly OpenAI's server time for plan requests, and it varies a lot |
| Paste | <0.05 s | Native ⌘V |

What the app does to keep it low:
- one kept-alive connection to OpenAI, opened as you start talking;
- the sign-in renews in the background;
- reasoning is off for cleanup;
- a stuck reply is abandoned after 12 s with no data (on-device cleanup takes over);
- the speech engine warms up at launch;
- a stuck speech decoder is cut short.

Each dictation shows its latency in History, and a per-step log is written to `~/Library/Application Support/bewithflow/logs/latency.log`.

## Style, Snippets and Dictionary

- **Style** follows the app you dictate into:
  - **Personal messages** (WhatsApp, Messages, Telegram…): Formal / Casual / very casual.
  - **Work messages** (Slack, Teams…), **Email** (Mail, Outlook, Gmail in your browser…) and **Other**: Formal / Casual / Excited!
  - Defaults: Casual for messages, Formal for email and everything else.
- **Snippets:** say a trigger such as "my calendly link" and the saved text is inserted exactly. It's never rewritten by the AI.
- **Dictionary:** names and terms that are always spelled your way.

## Screens

- **Sign in:** **Continue with ChatGPT**, plus **Continue as …** buttons for accounts you've signed out of.
- **Setup:**
  - ChatGPT status, with **Allow plan usage** if it was declined.
  - Speech engine download, with a progress bar.
  - Permissions.
- **Home:**
  - A practice box with **Dictate here**.
  - Stats: words this week, dictation count, and words per minute.
  - History. Each entry is tagged **ChatGPT** or **Basic cleanup**, with **Show edits** (proofreader's marks), **Copy** and **Delete**.
- **Dictionary:** words that are always spelled exactly as written.
- **Settings:**
  - **ChatGPT:** plan status, **Manage usage limits**, the model picker (loaded from your account), **Use another account** and **Sign out**.
  - **Shortcuts.**
  - **Writing:**
    - **Cleanup:** Light / Standard / Polished.
    - **Tone:** Match me / Casual / Professional.
    - **Language you speak.**
  - **Speech engine:** Fast / Accurate.
  - **Master prompt:** editable, with **Reset to default**.
  - **Behaviour:** restore your clipboard after pasting; start/stop sounds.
  - **Permissions.**
  - **Remove from this computer.**
- **Menu-bar icon:** start dictation, paste last, open the app, Settings, Quit.

## The master prompt

The master prompt lives in [src/main/prompt.js](src/main/prompt.js). It tells ChatGPT to:

- output only the cleaned text, and never answer or act on what was said;
- remove fillers, stutters and repeated words;
- apply self-corrections ("3, no wait, 4" becomes "4"; "scratch that" deletes the previous phrase);
- fix grammar, spelling, punctuation and words the speech engine misheard, without adding content;
- format spoken punctuation, lists, numbers, times, emails and URLs;
- keep the speaker's language;
- follow the chosen cleanup level, tone and dictionary words.

## Project layout

```
src/main/main.js           Electron main: windows, tray, shortcuts, dictation flow, IPC
src/main/chatgpt-auth.js   Sign in with ChatGPT: PKCE, loopback callback, ID-token check, refresh, revoke
src/main/chatgpt.js        Responses API on the user's plan (streaming), model list, plan-usage errors
src/main/transcriber.js    on-device Whisper (transformers.js + ONNX Runtime)
src/main/ai.js             pipeline: transcribe → ChatGPT cleanup → basic cleanup fallback
src/main/prompt.js         master prompt
src/main/store.js          ChatGPT registrations, encrypted tokens, settings, dictionary, history
src/main/paste.js          clipboard + OS paste keystroke, restores your clipboard
src/preload/               safe IPC bridge
src/renderer/hub/          main window UI
src/renderer/bar/          floating pill: mic capture, level meter, WAV encoding
test/core.test.js          tests with a simulated OpenAI sign-in server
native/mac/                key helper (hold-to-talk), built universal (Intel + Apple Silicon)
scripts/                   build, signing, notarization and self-test scripts
android/                   the Android app (Kotlin + Jetpack Compose): see below
```

## Production builds

### macOS (Intel and Apple Silicon)

```bash
npm install
npm run dist:mac                 # both: dist/bewithflow-1.0.0-mac-x64.dmg and -mac-arm64.dmg (+ .zip)
npm run dist:mac:intel           # Intel only
npm run dist:mac:apple-silicon   # Apple Silicon only
npm run selftest:mac             # checks every build in dist/
```

Each build is its own architecture (smaller than a universal app). The key helper is compiled for both and joined with `lipo`. The Apple Silicon image library is fetched automatically when building on an Intel Mac.

`selftest:mac` checks each app for:

- signature and hardened runtime;
- the right CPU architecture in every native binary;
- the microphone and automation permission texts;
- no Windows or Linux leftovers.

It then launches the build for this Mac with `--self-test`, which loads the speech engine, runs Whisper on a second of audio, and starts the key helper. The Apple Silicon build can only be launched on an Apple Silicon Mac, and the Intel build runs on both.

**Signing and notarization.** Without a certificate, apps are signed ad hoc. They run on the Mac that built them, but other Macs block them until the user right-clicks the app and chooses Open. To ship to other people, get an Apple Developer ID (about $99 a year), install the "Developer ID Application" certificate in Keychain, and set one of these before building:

```bash
# Apple ID
export APPLE_ID=you@example.com APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx APPLE_TEAM_ID=ABCDE12345
# or an App Store Connect API key
export APPLE_API_KEY=/path/AuthKey_XXXX.p8 APPLE_API_KEY_ID=XXXX APPLE_API_ISSUER=uuid
```

`scripts/after-sign.js` notarizes automatically when it finds a Developer ID signature and these variables.

**Auto-update.** `electron-updater` is built in and switches on only when the app ships with an update feed. Add a `publish` target to `build` in `package.json` (for example `{ "provider": "github", "owner": "...", "repo": "..." }`) and build with `--publish always`.

**Logs.** Crashes and errors go to `~/Library/Application Support/bewithflow/logs/app.log`.

### Android

Android 10 (API 29) or newer. bewithflow is a **keyboard**: switch to it in WhatsApp or any app, then hold the mic to talk, or tap it once for hands-free. Speech-to-text uses the phone's own recognizer, on-device when available. The text is then cleaned up by your ChatGPT plan (Plus/Pro) or by basic cleanup on the phone (Free mode).

Building needs JDK 17+ and the Android SDK; set `ANDROID_HOME` or `android/local.properties`.

```bash
cd android
./gradlew testDebugUnitTest      # unit tests: PKCE, ID-token check, store, cleanup pipeline
./gradlew assembleDebug          # app/build/outputs/apk/debug/app-debug.apk
./gradlew assembleRelease        # signed, minified APK: app/build/outputs/apk/release/app-release.apk
./gradlew bundleRelease          # Play Store bundle: app/build/outputs/bundle/release/app-release.aab
```

**Testing.**

- `BWF_LIVE_TOKEN_FILE=/path/token.json ./gradlew testDebugUnitTest` also runs `LiveChatGPTTest`. That test sends real dictations through the Android networking and cleanup code to a Plus/Pro account. The token file holds `{"token": "...", "model": "..."}`.
- Emulators have no voice input. Debug builds (never release builds) accept a stand-in for the speech recognizer:

  ```bash
  adb shell am broadcast -a com.bewithflow.app.debug.DICTATE --es text "'um so can we meet at three'"
  ```

  The keyboard then types the cleaned text into whichever app has focus.

**Release signing.** Release builds are signed with the key in `android/keystore.properties`. That file and the `.jks` keystore are git-ignored.

```
storeFile=bewithflow-release.jks
storePassword=...
keyAlias=bewithflow
keyPassword=...
```

**Back up the keystore and its password somewhere safe.** If you lose them you can't ship updates to the same app. On Google Play, enroll in Play App Signing so this key is only your upload key. To make a new one:

```bash
keytool -genkeypair -keystore bewithflow-release.jks -storetype PKCS12 -alias bewithflow \
  -keyalg RSA -keysize 4096 -validity 10000
```

**Install on a phone.** Run `adb install app/build/outputs/apk/release/app-release.apk`, or copy the APK over and open it. Then open bewithflow. Setup walks through the microphone and turning on the keyboard.

**Play Store notes.** The app asks only for the microphone and internet. Tokens are encrypted with the Android Keystore and excluded from backups. The store listing needs a privacy policy that says audio is transcribed on the phone and the transcript is sent to OpenAI under the user's own ChatGPT account.

## Limits

- **Only Plus and Pro can use ChatGPT itself.** OpenAI doesn't let ChatGPT Free plans power other apps, so Free accounts get on-device AI cleanup instead. Distributing bewithflow commercially would need a client ID from OpenAI's partner form.
- **Transformers.js is pinned to v3.** v4 ships an ONNX runtime with no Intel-Mac build.
- **Language must be set by hand.** The speech engine listens for the language chosen in Settings and doesn't auto-detect.
- **Hold-to-talk on desktop is macOS only.** Windows and Linux use the hands-free shortcut.
- **Android speech accuracy depends on the phone's recognizer.** Pixel and recent Samsung phones transcribe on-device. Others may need a connection.
- **Style formatting is tuned for English.**
