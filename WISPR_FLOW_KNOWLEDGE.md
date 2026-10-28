# Wispr Flow — End-to-End Knowledge File

Compiled 2026-10-12 from the official Wispr Flow help center (docs.wisprflow.ai, ~150 articles across all 8 collections) and wisprflow.ai (home, features, pricing). Every section cites its source article. Items marked **[Uncertain]** are places where the docs are vague or contradict each other.

## Contents

1. **Part 1: Getting Started.** Product overview, platforms and requirements, install and onboarding, permissions, settings, account, admin/SSO/SCIM/MDM.
2. **Part 2: Using Wispr Flow.** App navigation (every tab and button on desktop, iOS and Android), Command Mode, Styles, Dictionary, Snippets, Transforms, Flow Bar, Auto Cleanup, Smart Formatting/Backtrack, languages, Scratchpad, sync, app integrations, MCP, and more.
3. **Part 3: Wispr Notetaker.** Bot-free meeting capture, recording, transcripts, speakers, summaries, Ask Wispr, sharing, calendar, MCP, retention.
4. **Part 4: Billing, Privacy and Accuracy.** Plans and prices, billing, refunds, students, privacy controls, retention, HIPAA, compliance, accuracy tips.
5. **Part 5: Shortcuts, Troubleshooting and Known Issues.** The full hotkey reference, problem → cause → fix, and known issues.

---

## Quick reference

**What it is:** Wispr Flow is an AI voice-dictation app that works in any text field of any app. You hold a hotkey and speak. Flow transcribes, cleans up the text (removing filler words, adding punctuation and formatting, handling self-corrections), adapts the tone per app, and pastes the result at your cursor. It runs on Mac, Windows, iPhone (as a keyboard) and Android (as a floating bubble). It also includes **Wispr Notetaker**, a bot-free meeting recorder on desktop.

**End-to-end flow of a dictation**
1. **Install** for your platform: macOS 12+, Windows 10/11 x64, iOS 18.3+ (iPhone only), or Android 13+.
2. **Sign in.** Google, Apple, Microsoft, email or SSO.
3. **Grant permissions.** Mac needs Microphone and Accessibility. Windows needs Microphone. iOS needs the keyboard with Full Access, plus Microphone. Android needs Microphone, Display over other apps and Accessibility.
4. **Put the cursor** in any text field.
5. **Hold Push-to-talk:** **Fn** on Mac, **Ctrl+Win** on Windows. Speak, then release. For hands-free, press **Fn+Space** (Mac) or **Ctrl+Win+Space** (Windows), or double-tap Push-to-talk. Sessions last up to 20 minutes on desktop.
6. **Flow processes the speech.** It applies Auto Cleanup (None/Light/Medium), Smart Formatting, Backtrack (self-corrections), your Dictionary words, Snippet triggers and the Style for that app.
7. **The text is pasted** at the cursor. If it misses, use **Paste last transcript** (**Cmd+Ctrl+V** on Mac, **Shift+Alt+Z** on Windows).
8. **Edit by voice.** Select text, hold **Command Mode** (**Fn+Ctrl** on Mac, **Ctrl+Win+Alt** on Windows) and say an instruction, e.g. "make this more concise". Command Mode needs a paid plan or Student, and is off by default.
9. **Cancel** with **Esc**.

**Default desktop shortcuts**

| Action | Mac | Windows |
|---|---|---|
| Push to talk (hold) | Fn | Ctrl+Win |
| Hands-free (toggle) | Fn+Space | Ctrl+Win+Space |
| Command Mode | Fn+Ctrl | Ctrl+Win+Alt |
| Paste last transcript | Cmd+Ctrl+V | Shift+Alt+Z |
| Copy last transcript | Cmd+Ctrl+C | Shift+Alt+X |
| Cancel | Esc | Esc |

Change them under **Settings → General → Shortcuts**. A Mac with no Fn key falls back to Ctrl+Opt.

**Plans (pricing page, Oct 2026)**

| Plan | Monthly | Annual | Key points |
|---|---|---|---|
| Free | $0 | $0 | 2,000 words/week on desktop, ~1,000/week on mobile; dictionary, snippets, limited Notetaker |
| Pro | $15/user | $12/user | Unlimited dictation, Command Mode, shared dictionary/snippets, team workspace |
| Growth | $23 (dictation) / $33 (with Notetaker) | $18 / $26 | Admin controls, SSO/SAML, HIPAA BAA, advanced dashboards |
| Enterprise | Custom | Annual only | SCIM, audit logs, MDM, domain capture, model training locked off, SLAs |

**Main contradictions in the sources** (details in each Part)
- **Free mobile limit:** the docs say 1,000 words/week, but one article gives a 1,500 hard cap.
- **Weekly reset time:** Sunday 23:45 UTC or midnight PT, depending on the article.
- **Minimum macOS:** 12 in one article, Big Sur (11) in another. Notetaker needs macOS 13+.
- **SSO and model-training lock:** some articles put these in Growth, others in Enterprise only.
- **Student offer:** "50% off Pro" vs. free/discounted student plans with verification rules.
- **Flow Bar language picker:** marketing mentions one, but the Languages article says it doesn't exist.
- **Notetaker weekly cap on paid plans:** 150 or 100, depending on the article.
- **"Privacy Mode":** older marketing uses this term. The current docs use four controls under **Settings → Data and Privacy** instead.

---

# Part 1: Getting Started

> **Research date:** 2026-10-12. Sources: the docs.wisprflow.ai help center (fetched directly) and the wisprflow.ai marketing site.
>
> **Scope note:** The "Getting Started" collection (`/collections/2654500357-getting_started-1`) contains **17 articles**, not 40. The collection page itself says "17 articles". To cover per-platform installation and settings as requested, I also read 16 related articles from the macOS, Windows, iOS, Android and "Using Wispr Flow" collections, plus "Manage your Flow account". That makes **33 help articles** in total. All are listed in the [Source index](#source-index) at the end.
>
> **Conventions:** Exact UI labels (buttons, menus, toggles, screen titles) are in **bold**. Each section lists its source URL(s). Each "Last updated" date is relative to the fetch date. Where sources contradict each other, or something is unclear, it is marked **⚠ Uncertainty**.

---

## Product overview

**Sources:** https://docs.wisprflow.ai/articles/2772472373-what-is-flow, https://wisprflow.ai, https://wisprflow.ai/features, https://wisprflow.ai/pricing

### What Flow is
- **Wispr Flow** (or just "Flow") is an AI voice dictation app. It "turns your speech into written text in the app where you are working". You start dictation, speak naturally and stop. Flow then transcribes, cleans up the text and inserts it into the selected text field.
- Marketing tagline: **"Don't type, just speak."** It is described as "The voice-to-text AI that turns speech into clear, polished writing in every app."
- **An internet connection is required for transcription** on every platform. The Android docs say "offline transcription is unavailable". iOS mentions a "Backup/Offline Dictation" mode that is active for some users only (see Uncertainty below).
- On desktop, Flow inserts the completed text **after you stop**. It does not show a live word-by-word transcript while you speak.
- The company is **Wispr AI, Inc.** (Windows code-signing publisher **Wispr AI INC**). On Google Play the developer is listed as **Wispr Inc**. Homepage banner: "Wispr raises $81M to build the Voice OS."
- The product family has two parts: **Flow Dictation** and **Wispr Notetaker**, an AI meeting notetaker. Notetaker runs on Mac and Windows only. It records on-device with no meeting bot. It produces a transcript with named speakers, a summary by topic and next steps. It works with Zoom, Google Meet, Microsoft Teams, Slack huddles and in-person meetings. Marketing says "One Wispr Flow subscription includes both Flow dictation and Notetaker."

### Headline features and claims (marketing site)
| Claim / feature | What the source says |
|---|---|
| Speed | "4x faster than typing": keyboard 45 wpm vs Flow 220 wpm |
| Speak naturally | "Ramble, pause, or change your mind mid-sentence. Flow understands what you mean" |
| Auto-editing | Removes filler words, adds punctuation, formats lists and paragraphs, handles corrections ("Backtrack") |
| Works anywhere | "Flow works anywhere you can type, with no plugins required." Examples include Gmail, Slack, iMessage, Notion, terminal, code editors, ChatGPT, Claude, Cursor, Google Docs and WhatsApp |
| Languages | "100+ languages", with auto-detection and switching |
| Dictionary | Learns names and jargon automatically when you correct a spelling. You can also add words manually |
| Snippets | Voice shortcuts that expand into saved text (links, bios, addresses) |
| Styles | Tone per app (Formal / Casual / Very casual). "Only available in English and on desktop" |
| Whisper | "Flow even works when you're whispering" |
| Developers | File tagging, syntax awareness, dev jargon |
| Teams | Shared dictionary, shared snippets, usage dashboards |
| Security | "Your data is never sold". "SOC 2 Type II, HIPAA and ISO 27001 certified". Opting out of model training is possible |
| Microphones | Built-in mic is fine. Marketing **recommends against AirPods/Bluetooth earbuds** because they compress audio and can miss the start of speech |

### How dictation works (help center)
1. **Choose where to write**: put your cursor in a text field.
2. **Start Flow** with the desktop shortcut, the **Flow keyboard** on iPhone, or the floating **Flow Bubble** on Android.
3. **Speak naturally.** Flow can clean up filler words, punctuation and spoken self-corrections.
4. **Stop and review.** Flow inserts the finished text.

| Platform | How to start | Useful controls |
|---|---|---|
| Mac and Windows | Hold the dictation shortcut, speak, then release. Defaults: **Fn** (Mac) and **Ctrl + Win** (Windows). Customizable | Hands-free dictation. **The Hub** contains history, Dictionary, Snippets, Style and Settings |
| iPhone | Switch to the **Flow keyboard** in another app and tap its microphone | Flow Notes, widgets, Control Center, Siri shortcuts, Action Button |
| Android | Focus a text field with the on-screen keyboard open. Tap the **Flow Bubble** for hands-free, or hold and release | Move or resize the bubble, or snooze it. Use the **Paste** action if insertion fails |

### Pricing snapshot (marketing pricing page, fetched 2026-10-12)
| Plan | Monthly price | Annual price (per month) | Notes |
|---|---|---|---|
| **Free** | $0 | $0 | Help center and pricing table: **2,000 words/week on desktop, 1,000 words/week on mobile**. Includes dictionary, snippets, limited Notetaker and MCP |
| **Pro** | $15/user/mo | $12/user/mo | Unlimited dictation, shared dictionary and snippets, centralized billing, team usage analytics, priority support. No seat minimum for teams |
| **Growth** | $23 (Dictation only) / $33 (Dictation + unlimited Notetaker) per user/mo | $18 / $26 per user/mo | SAML SSO, org-wide HIPAA via BAA, multiple domains, admin control over model training, individual usage reporting. Card billing only |
| **Enterprise** | Custom, billed annually | — | Free IT admin seats, model training locked off, SCIM, audit logs, MDM, domain capture, custom terms, invoicing/PO, dedicated support with SLAs |

- Help center Growth prices: monthly $23 / $33. Annual **$216 ($18/mo)** / **$312 ($26/mo)**, charged in full each year (https://docs.wisprflow.ai/articles/1841503498-sign-up-for-flow-growth).
- Discounts (pricing FAQ): students and educators with an education email get 50% off Pro. Nonprofits get discounted Pro. A separate Android help article says "Students get unlimited access to Wispr Flow for free" through a **Student** plan.
- **⚠ Uncertainty — conflicting free-tier wording:** The homepage FAQ says the free plan is "2,000 words per week". The pricing table and the Android plans article say 2,000/week on desktop and **1,000/week on mobile, shared between Android and iOS**. The iOS keyboard article says Basic has a 1,000-word weekly allowance with a stop at 1,500.
- **⚠ Uncertainty — student offer:** "50% off Pro" (pricing FAQ) and "unlimited access for free" (Android help) both appear. They may be different programs or eligibility tiers.

### What to know before using Flow (help center)
- **Connection:** you need internet access. Retry saved audio when Flow offers it.
- **App compatibility:** the Android bubble is hidden in password and other sensitive fields and in many banking apps. Some apps need manual pasting.
- **Plans:** allowances and trials depend on your account.
- **History and privacy:** local dictation history is separate from the cloud-storage and model-improvement settings.

---

## Platforms & system requirements

**Sources:** https://docs.wisprflow.ai/articles/1036674442-supported-devices-and-system-requirements, https://docs.wisprflow.ai/articles/6344532666-android-system-requirements, https://docs.wisprflow.ai/articles/7682075140-how-to-install-wispr-flow-on-mac, https://docs.wisprflow.ai/articles/9633655004-installing-wispr-flow-on-windows-what-to-expect-from-the-downloadable-installer

### Requirements at a glance
| Platform | OS and device | Memory / free storage |
|---|---|---|
| **Mac** | macOS 12 Monterey or later. Apple Silicon or Intel (separate builds, **no universal build**) | 8 GB RAM recommended. About 500 MB free |
| **Windows (dictation)** | Windows 10 or 11. **x64 only** | 8 GB RAM recommended. About 200 MB free |
| **Windows Notetaker** | Windows 10 or 11 | **16 GB RAM and 2 GB free required** |
| **iPhone** | **iOS 18.3 or later. iPhone only** | 4 GB RAM recommended. About 500 MB free |
| **Android** | **Android 13 or newer**. Smartphone **with an accelerometer** (required to install from Google Play and for the shake gesture). No maximum Android version | 6 GB RAM recommended. About 500 MB free, plus space for recordings (~1.9 MB per minute) |

### Not supported
- **iPad, Linux, Chromebooks, virtual machines and remote desktop environments** are not supported.
- **Windows on ARM / Snapdragon** is not supported. Flow shows **"Unsupported Windows Architecture"** ("Wispr Flow requires x64 architecture…"), and its only button, **OK**, quits the app.
- Android tablets and foldables "may work but are not officially optimized". Android Go devices are not officially supported.
- The iPhone app runs in **portrait only**. Android setup is portrait-only.
- A working microphone is required on every platform.
- **⚠ Uncertainty:** The supported-devices article says iPad is unsupported. The Team plans article mentions plan-management behavior "on iPhone and iPad", and Android Plans text says "Manage your plan in the App Store on your iPhone or iPad". This probably refers to App Store billing, not running Flow on iPad.

### Mac launch blockers (Flow quits)
| Dialog | Cause | Fix |
|---|---|---|
| **"Unsupported MacOS Version"** | macOS 11 or older | Update through **System Settings → General → Software Update** |
| **"Incorrect App Version"** | Intel build running on Apple Silicon (under Rosetta 2) | Delete it and download the Apple Silicon build |
| **"Move Flow to Applications folder"** | Launched from the DMG, Downloads or Desktop, or from a subfolder | Move **Wispr Flow.app** directly into `/Applications`, `~/Applications` or `/System/Applications`. Do not rename it |

### Notetaker system-audio requirements (Mac)
- macOS 12: Notetaker **cannot capture system audio**, and the meeting-audio row is hidden.
- macOS 13.0–14.3: grant **Screen Recording**, then restart Flow.
- macOS 14.4 or later: grant **System Audio Recording Only**. No restart needed.
- The "Allow Wispr to capture meeting audio" row is advisory, not required.

### Managed devices
- Mac MDM can pre-approve **Accessibility** but **cannot pre-approve Microphone**. Each user must approve microphone access.

---

## Installation & onboarding (per platform)

**Sources:** https://docs.wisprflow.ai/articles/3152211871-setup-guide, https://docs.wisprflow.ai/articles/7682075140-how-to-install-wispr-flow-on-mac, https://docs.wisprflow.ai/articles/9633655004-installing-wispr-flow-on-windows-what-to-expect-from-the-downloadable-installer, https://docs.wisprflow.ai/articles/7453988911-set-up-the-flow-keyboard-on-iphone, https://docs.wisprflow.ai/articles/7523910584-try-flow-in-your-apps-ios-post-onboarding-experience, https://docs.wisprflow.ai/articles/2809924024-android-download-installation-guide, https://docs.wisprflow.ai/articles/8858845757-setup-wispr-flow-on-android-android-settings

General rules:
- If you already have an account, **use the same sign-in provider as before**. Sign-in methods cannot be switched after the account is created.
- Quitting mid-setup is safe. Reopen Flow to resume.
- Sign-in options are **Google, Apple, Microsoft, SSO, or email and password**.

### Mac

**Install**
1. Check your chip in **Apple menu → About This Mac**.
2. **Download** Wispr Flow from wisprflow.ai. Choose the **Apple Silicon** or **Intel** build.
3. **Open** the `.dmg`, **drag** the Wispr Flow icon onto **Applications**, then close the installer window.
4. **Open** Wispr Flow from Applications (or from Launchpad or Spotlight). On a fresh install, a **menu bar icon** appears on the right.
   - Clicking the menu bar icon opens its menu, not the main window. Choose **Open Wispr Flow** to open the window.
   - Deleting the app does not delete settings or history. They stay in `~/Library/Application Support/Wispr Flow/`.

**Onboarding screens (Mac and Windows)**, in order from the Setup Guide:
1. **Sign in via browser.** Your session transfers back to Flow automatically. If it times out, click **Sign in via browser** again. A desktop sign-in attempt expires after 5 minutes. An emailed link can finish that attempt within 15 minutes.
2. **Permissions** (Mac): cards titled **"Allow Flow to insert spoken words"** (Accessibility) → **Allow**, and **"Allow Flow to use your microphone"** → **Allow**, then **Continue**. Each grant reveals the next card. This step is skipped if access is already granted.
3. **Setup questions** and the **Privacy notice.** If you choose **Other** or **Something else**, you must enter a description.
4. **Test your microphone.** Speak and watch the bars rise. Buttons: **Change microphone**, **Find the right mic for you**. Errors: **No microphone found** → open Sound Settings. **In use by another app** → open Sound Settings or restart Flow.
5. **Shortcut.** Press the keys you want or choose **Edit shortcut**, and pick **Push to talk** or **Hands-free**. Macs with an Apple fn key default to **fn**. Macs without one use **Ctrl+Opt**.
6. **Dictation languages.** Choose languages or leave automatic detection on. **Add [language]** adds a suggested language in one step. You can mix languages.
7. **Practice demos.** Press the shortcut keys together, speak, then release. Each demo can be skipped. On Windows, **✓** finishes and **X** cancels.
8. **You control your data** (data preference, see [Permissions](#permissions)), then **Explore Wispr Flow**. Setup is complete when the **Flow Hub** opens.

Team-aware screens can also appear for work-email signups: **Join your team** / **Pick your team** / invite teammates / **Create a team name** (see [Admin / team setup](#admin--team-setup)).

### Windows

**Install**
- The installer is named **WisprFlowInstaller.exe** or **Wispr Flow Setup-v<version>.exe**. Both are legitimate. Releases are signed by **Wispr AI, Inc.** SmartScreen may still show "Windows protected your PC" for a new release.
- **WisprFlowInstaller.exe downloads about 340 MB** before setup continues. Its window has **no close button** and cannot be cancelled.
- The standard install is **per-user with no admin rights**, under `%LOCALAPPDATA%\WisprFlow`. An IT-managed **machine-wide MSI** installs to `C:\Program Files\Wispr Flow\` and requires admin rights.

Steps:
1. **Download** the installer from wisprflow.ai.
2. **Double-click** it in Downloads.
3. **Wait** for the install to finish.
4. **Launch** Flow from the Start menu or the desktop shortcut. A new install creates both.

- On a new install, the **hub** opens with onboarding. It keeps opening at launch until onboarding is complete. Dictation and Notetaker become available after onboarding.
- **Launch app at login** is turned **on automatically** at first launch, with no confirmation. Change it in **Settings → System → App settings**. If it is enabled, Flow starts in the background without opening the hub.
- A Flow icon appears in the **system tray**. Click it to open the hub, or right-click → **Open Wispr Flow**. Closing the hub does not quit Flow.
- Installer error messages: "Wispr Flow couldn't finish installing." with one of these details: "We couldn't reach the download server." / "The download didn't finish." / "The downloaded file failed a security check." / "The installer downloaded but wouldn't start." / "Setup ran into an unexpected problem." To fix: re-download and re-run.
- **Reinstall:** the uninstaller keeps your user data and session in `%APPDATA%\Wispr Flow`, so a reinstall skips onboarding. Logs are in `%APPDATA%\Wispr Flow\Logs`.
- If auto-start stops working, open Flow once. Then check `shell:startup` (press **Win+R**) for Flow's shortcut.

### iOS (iPhone)

**Install and onboarding**
1. **Install** **Wispr Flow** from the App Store and open it. Tap through the first-launch screens to **Get Started**. The keyboard only appears in iOS Settings after first launch.
2. **Sign in** with **Google** or **Apple**, or tap **More Options** for **Microsoft**, **SSO** or **email and password**. A new email account needs email, password, full name, CAPTCHA and email verification. Tapping the verification link signs you in.
3. On "Let's set up Flow", tap **Set up**, then **Go to Settings** in the keyboard walkthrough.
4. In iOS **Settings → General → Keyboard → Keyboards**, tap **Add New Keyboard**, then **Wispr Flow** (under Third-Party Keyboards). Tap **Wispr Flow** → turn on **Allow Full Access** → **Allow**.
5. **Return** to Flow. Setup advances to practice once Full Access is detected.
6. **Practice cards:** grant microphone access, switch to the Flow Keyboard, tap its mic, speak, then tap the **checkmark** (**Stop transcribing**).
   - If you cannot finish practice, **Next** unlocks once the field contains non-blank text (typed text counts).
7. Complete the **setup questions** (enter a description if you choose **Other**). Then set **data preferences**, **dictation languages** (choices from other devices carry over) and **notifications** (allow or skip).
8. Setup finishes on the main screen.

**Switching to the keyboard:** tap and hold the **globe** icon, then select **Wispr Flow**. On 4.7-inch iPhones, Flow has its own globe key.

**"Start" / app-switch behavior:** in other apps, the keyboard briefly opens Flow to start the microphone (an Apple requirement), then returns you to the same chat or page. The first automatic return asks you to tap **OK**. If the return fails, you see "Flow is on" / "Swipe right across the bottom edge to continue".

**Post-onboarding "Almost there!" card:** this card means Full Access is missing. Tap **Finish setup** → **Next** on the privacy screen ("Flow cares about privacy. Your data is safe.") → **Go to Settings**. Then add the keyboard and enable **Allow Full Access**. Separately, a **"We can't hear you"** card with **Go to Settings** means microphone access is missing.

**Basic-plan limit on iOS keyboard:** 1,000 words/week allowance, with dictation stopping at 1,500. At the limit you see "Dictation limit reached" / "Dictation resets Sunday, 12 a.m. PT." with **Get unlimited access** or a student-plan option.
- **⚠ Uncertainty:** the Android article says the weekly reset is **Sundays at 23:45 UTC**. The iOS article says "Sunday, 12 a.m. PT". These may be the same moment described differently, or they may be inconsistent.

**Optional: Action Button** (iPhone 15 Pro/Pro Max, all 16 models including 16e, 17/17 Pro/17 Pro Max, iPhone Air. Not iPhone 17e): **Settings → General → Action button shortcut** → **Let's go!** → **Try now** → **Add shortcut** (iCloud shortcut **Quick Dictation to Clipboard**) → **Go to Settings** → iPhone Settings → Action Button → **Shortcut** → select **Quick Dictation to Clipboard** → test → **Next** → **Finish**. Source: https://docs.wisprflow.ai/articles/4500510662-set-up-the-action-button-for-flow-on-iphone

### Android

**Install**
1. **Open** Google Play and search for Wispr Flow. Choose the listing with developer **Wispr Inc**, then tap **Install**.
2. If the installed version is too old, a non-dismissable **Update Required** screen appears. Tap **Update Now**.

**Onboarding screens** (combined from the install guide and Android Settings article):
1. **Get started** on the welcome screens.
2. **Sign in** with Google, Apple, Microsoft, SSO, or **Continue with Email**.
   - After browser sign-in, tap **Open Wispr Flow** on the confirmation page. **Returning to the app is not automatic.**
   - For a new email account: enter email and full name, then set and confirm a password that does not match your name. Verify by link or with a 6-digit code (**Enter your code** → **Verify**). Use **Resend verification email** / **Resend code** if needed: the first resend is available after 30 s, then every 60 s, with at most 3 sends. Verification times out after 10 minutes.
   - If **Existing account** names another provider, tap **Back to login** and use that provider.
3. Intro screens: tap **Next** → **Give it a try!** on **How it works**. The Android Settings article says there are "three intro screens".
4. **Select your languages.** Defaults to your device language or saved languages, with English as the fallback. **Add more** opens a searchable picker. **Done** finishes. **Next** requires at least one language.
5. **Try-It-Yourself tutorial:** tap the tutorial bubble. This triggers the microphone request (**While using the app** / **Only this time**). Complete tap-to-dictate → **Continue** → **Try it out** (press-and-hold. Tapping shows "Don't Tap") → tap outside the text box → **Next** twice. Practice dictations are **not saved** to history.
6. **Display over other apps:** **Open Settings** on "Allow Wispr Flow to appear over other apps", then enable it. **Cannot be skipped.**
7. **Accessibility:** **Open settings** → read **Accessibility Permissions Required** → **Agree** → find Wispr Flow (see the table in [Permissions](#permissions)) → enable the main **Use Wispr Flow** toggle and keep the **Wispr Flow shortcut OFF**. On Xiaomi, tap **OK**. **Not now** returns you to the setup screen.
8. **Your data is safe** (privacy choice): **Improve the model for everyone** (pre-selected for new users) or **Don't share data** → **Next**.
9. **Background activity and battery:** **Allow** the battery optimization exemption, or **Skip**. Manufacturer-specific steps are in [Permissions](#permissions).
10. **Notifications:** **Allow notifications** or **Skip**. This screen is skipped if already granted.
11. Optional "Where did you hear about us?" survey.
12. **Finish** on **You're all set!**

- Pressing Back during setup shows **Are you sure you want to exit?** (**Yes** / **No**). Reopening returns you to a saved checkpoint.
- The bubble appears **only after setup finishes**, and only when a text field is focused with the keyboard open.
- Background operation needs the ongoing **Wispr Flow** notification, "Voice dictation is ready". Keep that notification category enabled.
- Each account on the same device must complete setup separately.

### Email verification code during sign-in (all platforms)
- After choosing Google, Apple, Microsoft or SSO, you may see a **Check your email** page. Enter the **6-digit code**.
- You can request a new code after **30 seconds**. You get up to **5 tries**. The page is valid for **5 minutes**. The code must be entered in the same browser and device.
- Then **Email verified** returns you to the desktop app, mobile app or website you started from, signed in to the same account and team.
- Mobile in-app email codes have different rules: first resend after 30 s, then every 60 s, with a maximum of 3 new codes per attempt. After "Too many attempts. Wait a minute, then try again.", wait 60 s.
- Sources: setup guide, https://docs.wisprflow.ai/articles/9406031800-sign-up-for-flow-enterprise

---

## First dictation

**Sources:** https://docs.wisprflow.ai/articles/6409258247-starting-your-first-dictation, https://docs.wisprflow.ai/articles/6391241694-use-flow-hands-free, https://docs.wisprflow.ai/articles/5906198129-starting-your-first-dictation-on-android

### Default desktop shortcuts
| Keyboard | Push to talk | Hands-free mode |
|---|---|---|
| **Mac** | **Fn** | **Fn + Space** |
| **Mac without Apple Fn key** | **Ctrl + Opt** | **Ctrl + Opt + Space** |
| **Windows** | **Ctrl + Win** | **Ctrl + Win + Space** |
| Cancel (both) | **Esc** (remappable) | |
| Paste last transcript | **Ctrl + Cmd + V** (Mac) / **Alt + Shift + Z** (Windows) | |

Change shortcuts in **Settings → General → Shortcuts → Change**.

### Mac and Windows
1. Click into a text field.
2. **Press and hold** Push to talk, then speak.
3. **Release** and wait for the formatted text.

- **Hands-free:** press the Hands-free shortcut, or **double-press Push to talk within half a second**. Press the shortcut again to stop. A third quick press cancels. You can also click the **Flow Bar** to start. Clicking it again stops recording, but clicking within half a second of starting cancels instead. The stop icon is **■**.
- A Push to talk tap shorter than half a second does not paste. Flow shows the hold-shortcut tip instead.
- **Session cap:** a warning at **19 minutes**, then a stop at **20 minutes** ("Flow supports up to 20 minutes per session."). **Recover text** inserts what was captured.
- Mac: **Input Monitoring** is needed only if Caps Lock alone is your shortcut. The hands-free article says Input Monitoring lets Flow detect a held key (**⚠ Uncertainty:** the Mac install article calls Input Monitoring optional, while the hands-free article implies you should grant it).
- **Clipboard behavior:** Flow briefly uses the clipboard to insert text, then restores your previous clipboard about 0.5 s later. This takes about 3 s for Outlook, Word and WhatsApp on Windows, and about 5 s for remote-desktop apps.
- **Press Enter command** (off by default, **Flow Hub → Settings → Experimental**): if a dictation ends with "press enter", Flow removes the phrase and presses Enter. The first time, a prompt asks **Great** or **Disable**. Experimental requires a paid, trial or enterprise plan.

### iPhone
1. Open Flow, sign in and finish onboarding. Enable the keyboard and **Full Access**.
2. Tap a text field and switch to the Flow keyboard.
3. Tap the **microphone** (or **Start**). Allow microphone access, then speak.
4. Tap the **check** button to finish. **X** cancels.

- Flow switches to the system keyboard in numeric, decimal, phone and email fields.
- Calls and headphone or Bluetooth connection changes stop recording.

### Android
1. Tap a text field so the keyboard opens.
2. Tap the **Flow Bubble** at the screen edge, then speak.
3. Tap the **checkmark (Done)**. Text is inserted after transcription.

- Alternatively, **hold** the bubble while speaking and release. There is no Done button during a hold. **Cancel** appears about 3 s into transcription.
- **Session cap is about 5 minutes.** A warning at 3:59 says "1 minute left before you reach the 5-minute limit." At 4:59, Flow stops and submits.
- The bubble is hidden in password, PIN, phone and numeric fields and in restricted banking apps. Browser address bars and notification replies are exceptions.
- **Snooze:** drag the bubble down inside a text field to snooze it for 10 minutes. End snooze with **End snooze now** or by shaking the phone.
- If insertion fails, tap **Paste** on the bubble. Flow also copies the text to the clipboard.

### Common desktop microphone errors
| Message | Action |
|---|---|
| "Microphone access is disabled" (Windows) / microphone permission message (Mac) | **Open Settings** → enable microphone privacy |
| "Selected microphone is unavailable" | **Choose Microphone** |
| "No microphone detected" | **Open Sound Settings** / **Refresh devices** |
| "Microphone unavailable" | Close other apps that are using the mic |
| "Unable to access mic" | **Restart App** |
| "Update admin settings to paste!" (Windows) | Run Flow as Administrator |

---

## Permissions

**Sources:** https://docs.wisprflow.ai/articles/1036674442-supported-devices-and-system-requirements, https://docs.wisprflow.ai/articles/7682075140-how-to-install-wispr-flow-on-mac, https://docs.wisprflow.ai/articles/6344532666-android-system-requirements, https://docs.wisprflow.ai/articles/8858845757-setup-wispr-flow-on-android-android-settings, https://docs.wisprflow.ai/articles/7453988911-set-up-the-flow-keyboard-on-iphone

### Summary matrix
| Permission | Mac | Windows | iPhone | Android |
|---|---|---|---|---|
| Microphone | **Required** | **Required** (both **Microphone access** and **Let desktop apps access your microphone**) | **Required** (requested on first dictation from the main app) | **Required** |
| Accessibility | **Required** (to insert text) | **Not requested** | — | **Required** (Accessibility service. Shortcut must be OFF) |
| Keyboard Full Access | — | — | **Required** (setup completes only once it is detected) | — |
| Display over other apps | — | — | — | **Required** (cannot be skipped) |
| Input Monitoring | Optional (only for a Caps Lock-only shortcut) | — | — | — |
| Screen Recording / System Audio | Optional (Notetaker / screen-reading features) | — | — | — |
| Battery optimization exemption | — | — | — | Recommended (**Skip** allowed) |
| Notifications | (Settings → System) | (Settings → System) | Optional during setup | Optional (**Allow notifications** / **Skip**) |

### Mac
- **"Allow Flow to insert spoken words"** → **Allow** (Accessibility). **"Allow Flow to use your microphone"** → **Allow**. Then **Continue**.
- Flow uses the microphone only while you actively dictate.
- If a request takes more than 10 s: "Permission request timed out. Please try again or restart the app."
- If Continue finds a missing permission: "Some permissions are not yet granted. Please grant all permissions to continue."
- After startup, Flow may show **Microphone Permission Required** → **Grant Permission**, or **Accessibility Permission Required** → **Open Settings**.
- Manual paths: **System Settings → Privacy & Security → Microphone / Accessibility / Input Monitoring**.

### Windows
- Setup requests only Microphone. **Open Settings** opens **Windows Settings → Privacy & Security → Microphone**. Enable **Microphone access** and **Let desktop apps access your microphone**.
- If another app holds the mic: **Sound Control Panel → Recording → Properties → Advanced** → turn off **Allow applications to take exclusive control of this device**.

### iPhone
- **Settings → General → Keyboard → Keyboards → Wispr Flow → Allow Full Access**.
- Keyboards cannot show iOS permission dialogs. If Wispr Flow is missing from **Settings → Privacy & Security → Microphone**, open the main app and tap its mic once.
- Once denied, iOS will not prompt again. Use **Go to Settings** / **Open Settings**.
- Privacy note: "Full Access lets Flow work across your apps. Wispr never stores or sells what you say." Password fields are excluded from collection.

### Android
- **Accessibility disclosure:** Flow reads on-screen text, field layout, app or website names and URLs, limited text-box contents and input-field types. It does not insert into password or credit-card fields, and it does not appear in password managers or known banking apps.
- Where to find Wispr Flow in Accessibility settings:

| Device | Location |
|---|---|
| Samsung | **Installed apps** |
| Vivo / Motorola | **Wispr Flow** directly in the list |
| Xiaomi / Redmi / POCO | **Downloaded apps**, then tap **OK** to confirm |
| Others | **Downloaded apps** |

- **"Oops, something isn't right"** / "Make sure this shortcut is turned off": the accessibility shortcut must be off.
- **Battery / background settings by manufacturer:**

| Manufacturer | Steps |
|---|---|
| Pixel / stock | **Settings → Apps → Wispr Flow → Battery → Unrestricted** |
| Samsung | **Settings → Battery → Background usage limits** → add to **Never sleeping apps**, disable **Put unused apps to sleep**, then Battery → **Unrestricted** |
| Xiaomi / Redmi / POCO | **Autostart** (Settings → Apps → Manage apps → Wispr Flow) **and** **No restrictions** under Battery saver. Lock in Recent Apps |
| Huawei / Honor | **Settings → Apps → App launch → Wispr Flow → Manage manually** (all 3 toggles). Battery optimization → **Don't allow** |
| Oppo | **Allow Auto-Launch**, **Allow Background Activity**, disable power saving |
| OnePlus | Battery Optimization → **Don't optimize**. **App Auto-Launch**. Lock in Recent Apps |
| Motorola / Lenovo | Special app access → Battery optimization → **Don't optimize**. Lock in Recent Apps |
| Tecno / Infinix / itel | **Security → Permissions → Autostart**. Battery optimization → **Don't optimize**. Lock |
| Realme | Battery Optimization → **Not optimized**. **Auto Launch**. **Allow Background Activity** |
| Vivo | **Settings → More Settings → Applications → Autostart**. Battery exemption. Lock |

- **Home recovery cards (Android):**

| Card | Button | Fixes |
|---|---|---|
| **We can't hear you** | **Allow Microphone** | Microphone |
| **Enable Flow bubble on screen** | **Go to Settings** | Display over other apps |
| **Flow can't insert text** | **Go to Settings** | Accessibility |
| **Keep Wispr Flow running** | **Allow** | Battery exemption |
| **Flow isn't responding** | **Restart Flow** | Stalled accessibility service |
| **Bubble is snoozed** | **End snooze now** | Snooze |
| **Flow Bubble Disabled** | **Turn Back On** | Bubble turned off |

### Data-sharing (privacy) choice during onboarding
- Desktop screen **You control your data**: **Improve the model for everyone** or **Don't use my data for training**.
- Android screen **Your data is safe**: **Improve the model for everyone** or **Don't share data**.
- **Defaults:** **on for Free and Pro, off for Enterprise** (setup guide). The Android article says **Growth or Enterprise, or a signed HIPAA BAA**, lock it off with "your organization controls this".
- **⚠ Uncertainty:** The Enterprise sign-up article says "A paid plan alone does not lock **Improve the model for everyone**" and that model-training lock-off is an Enterprise feature through the MSA and DPA. This conflicts with the Android article's claim that Growth always locks sharing off.
- **Dictation Cloud Storage** is a separate setting. Turning off model improvement does not turn it off. It covers dictation only, not Notetaker or Scratchpad.
- Change later under **Settings → Data & Privacy** (Android shows it as **Settings → DATA & PRIVACY → Improve the model for everyone**).

---

## Settings screens & navigation

**Sources:** https://docs.wisprflow.ai/articles/5096240724-navigating-the-wispr-flow-app-desktop-ios-and-android, https://docs.wisprflow.ai/articles/8884408990-connect-and-set-up-external-audio-devices, https://docs.wisprflow.ai/articles/3191899797-use-flow-with-multiple-languages, https://docs.wisprflow.ai/articles/1790396454-move-and-dock-the-flow-bar-on-desktop, https://docs.wisprflow.ai/articles/5284722493-sync-flow-across-your-devices

### Desktop (Mac and Windows): the Hub
- **Sidebar:** **Home**, **Meetings**, **Insights**, **Dictionary**, **Snippets**, **Style**, **Transforms**, **Notes**, **Tasks**, **Extensions**. **Settings** and **Help** are at the bottom. Availability varies by plan, organization policy and rollout. Meetings requires Notetaker. Organizations can hide Notes.
- **Home:** history grouped by date, word count, shortcut and statistics. The greeting shows your shortcut until you have dictated 2,000 words. Up and Down arrows move through **Dictation history**.

| Settings tab | Contents |
|---|---|
| **General** | **Shortcuts**, **Microphone** (**Change**), **Languages** (**Change** → **Dictation languages** → **Auto-detect** / search → **Save and close**) |
| **System** | **Launch app at login**, **Show Flow Bar at all times**, notifications, **Show app in dock** (Mac only), **Restart Flow**, **Data → Reset app** ("Reset and restart?") |
| **Account** | Profile, **Sign out**, **Delete account**, **Team** |
| **Plans and Billing** | Subscription, **Click to refresh**, **Manage subscription** / **Manage billing** |
| **Data & Privacy** | Local data storage (normal / auto-delete after 24 h / no storage, which needs typed **delete all**), **Cloud Sync**, notes refresh, data export, **Delete all transcripts** |
| **Experimental** | **Press Enter command** (off by default) |
| **Notetaker** | **Don't show Notepad and Flow Bar in screen capture** |

- Option/Alt + Arrow Up/Down moves between settings pages.
- The **menu bar / tray icon menu** has **Open Wispr Flow**, **Help center** and **Talk to support** (**Cmd+/** on Mac).
- **Flow Bar:** a floating status bubble (resting / recording / processing). Drag it to the left, right or bottom edge. Right-click it at rest → **Hide for 1 hour**. Right-clicking also opens the **microphone picker**.
- **Microphone picker options:** **Auto-detect**, **Built-in mic** (Mac), a named device, **Show other devices** (virtual inputs such as BlackHole and Krisp), and **Edit Ranking** (Mac, drag to reorder, trash icon to **Forget**). Prompts on mic changes: **Switch** / **Don't switch**. AirPods warning: **Switch microphone** / **Don't show again**.
- **⚠ Uncertainty:** The help center says "the Flow Bar has no language picker" and that languages must be changed in Settings. The marketing FAQ says "the language picker lives right in the Flow bar". The Flow Bar article also mentions "the language picker is unavailable" before setup finishes, which implies one exists afterward. Behavior may depend on app version.

### iPhone
- **Tabs:** **Home**, **Dictionary**, **Snippets**, **Notes**, **Style** (when available). Tabs other than Home stay locked until you finish "Dictate in another app" (**Try Flow first** prompt).
- **Side menu:** open with the menu icon or by swiping right. It holds the profile (opens Account), **Settings**, **Account**, **Refer a friend**, **Talk to Support** and **Help Center**.

| Settings section | Controls |
|---|---|
| **General** | **Set language**, **Disable Flow after**, **Keyboard feedback**, **Push Notifications**, **Action button shortcut** |
| **Audio** | Interaction sounds, **Use Built-In Mic** |
| **Data & Privacy** | Privacy, **Auto-delete transcripts** (Keep stored / Auto-delete after 24 hours / Never store), **Cloud Sync**, HIPAA agreement, **Refresh notes from cloud** |

- History rows: swipe left for **Report / Retry / Copy / Play**. Long-press for **Delete**.

### Android
- **Bottom bar:** **Home**, **Dictionary**, **Style**, **Snippets**.
- **Drawer:** **Report an issue**, **Share feedback**, **Settings**, **Account** (name, email, sign-out, **Manage Plan**, privacy policy).
- **Settings → GENERAL**: **Languages** (**Add more** → **Done** → **Save**. There is no Auto-detect on Android), **Upgrade to Pro** (Free users). **DATA & PRIVACY**: **Improve the model for everyone**, **Dictation cloud storage**.

### Languages
- 100+ languages. Flow detects **one language per dictation**, not per word.
- Variants: **English - British**, **English - Canadian** (desktop only), **German - Swiss**, **Chinese - Simplified / Traditional**, **Cantonese**, **Hinglish** (Hindi in Latin script, must be selected explicitly) and **French** (narrow no-break spaces).
- Urdu, Hebrew and Ukrainian cannot be auto-recognized. Select only one of them at a time, except the pairs Hindi+Urdu and Russian+Ukrainian.

### What syncs across devices
| Data | Sync behavior |
|---|---|
| Subscription | Follows the account. Billing stays with the original store |
| Dictionary and snippets | Synced |
| Languages and writing styles | Synced |
| Statistics | Total words, WPM and weekly counts sync. Daily counts stay local |
| Shortcuts, microphone, sounds | Per device |
| Dictation history | Per device (local) |

---

## Account management

**Sources:** https://docs.wisprflow.ai/articles/7339517111-manage-your-flow-account, https://docs.wisprflow.ai/articles/5284722493-sync-flow-across-your-devices, https://docs.wisprflow.ai/articles/4877130308-plans-upgrades-and-word-limits-on-android

### Edit profile
| Platform | Path | Editable |
|---|---|---|
| Mac and Windows | Account icon → **Manage account**, or **Settings → Account** | First and last names, profile picture (PNG, JPEG, BMP or WebP, up to 5 MB). Email is read-only |
| iOS | **Menu → Account**, or tap the profile header | Names only (they can be cleared) |
| Android | Dashboard menu → **Account**, or the drawer profile card | First name (required), last name optional |

- Desktop rejects names over 30 characters, or names that look like a password ("This looks like a password, not a name"). **Save** / **Cancel**.
- To change your email or sign-in method, you must file a support request. Account merging is **not supported**.

### Sign out / switch accounts
- There is **no switch-accounts control**. Sign out first: **Account → Sign out** → confirm **Sign out** (Android: **Sign Out**, dialog "Sign out and delete transcripts?").
- **Signing out deletes local data.** On desktop that includes transcripts, local dictionary entries, notes, calendar events, meetings, chat and dictation history, corrections, statistics and backups. Voice profile, insights and streaks reset. On iOS it also clears local dictionaries, notes and preferences. On Android it deletes transcripts and audio. App preferences such as shortcuts and language remain.
- Automatic session expiry does not wipe local data.
- Browser page: **Not <email>? Log in with another <provider> account**.
- Android: **Finish signing in** → **Try again** (Google/Apple/Microsoft) or **Cancel** (SSO/email).

### Reset password (email and password accounts only)
- **Desktop:** sign out → **Sign in via browser** → enter email → **Forgot password?** → captcha → **Send reset email**.
- **iOS:** **More options → Continue with Email** → **Forgot password?** → captcha → **Send reset email**.
- **Android:** **Continue with Email** → **Forgot password?** → **Send reset link** (no captcha).
- Link page **Reset Your Password**: the new password needs at least 8 characters → **Reset Password**. Expired links offer **Send a new link**. Repeated requests can lock you out for up to 30 minutes. A reset signs out sessions across devices.

### Manage plan
- **Desktop:** **Settings → Plans and Billing**. Personal Stripe plans use **Manage subscription**. Team, Growth and Enterprise plans use **Manage billing** (opens the admin billing portal). Apple-billed plans show "You can manage subscription via Apple". Status labels: **Cancels {date}**, **Payment past due** → **Update payment**. Refresh with **Click to refresh** (wait 10 s between attempts).
- **iOS:** **Account → Manage plan**. App Store plans show **Cancel** / **Resubscribe**. Trial and basic accounts see **Explore plan**. Stripe and team plans show "Go to the desktop app to manage plan" (not tappable). Restore Purchases is inside the purchase screen.
- **Android:** **Account → Manage plan → Plans**. Upgrade path: **Explore plan** → monthly or annual → Google Play sheet. Play-billed plans show **Cancel plan** / **Resubscribe on Google Play**. Labels: **Expires on**, **Ends on**, **Trial ends on**, **Renews on**.
- **Android word-limit stages (Free):** warning at 800 words, soft limit at 1,000 (you can continue), **hard cap at 1,500**. Resets Sundays 23:45 UTC. **Word limit alerts** notification category. **Get unlimited words** opens Plans.

### Delete account
- **Desktop:** **Settings → Account → Delete account** → type your exact account email → **Delete account**.
- **iOS:** **Menu → Account → Delete account** (no typed confirmation).
- **Android:** **no in-app delete button**. Use desktop, or go to drawer → **Report an issue** → **Account management** → describe the request → **Send** (this only opens a ticket).
- Deletion is permanent. It removes cloud and local account data and revokes integrations. Local history on other devices remains. Stripe subscriptions cancel immediately **with no refund**. **App Store and Google Play subscriptions are NOT cancelled.**
- A sole Enterprise admin must assign another admin first. Signing back in during the waiting period can cancel deletion.
- **Delete all transcripts** (desktop Settings) clears history without deleting the account.

### Support routes
| Platform | Path | Request types |
|---|---|---|
| Desktop | **Help → Talk to support** (tray: **Talk to support**, Mac **Cmd+/**) | **Issue**, **Billing**, **Account & Data Management** |
| iOS | **Menu → Talk to Support** | Issue, Billing, **Account Management** |
| Android | Drawer → **Report an issue** | Issue, Billing, **Account management** |

- Desktop reports attach logs and one image up to 10 MB. Signed-out users can use wisprflow.ai/support.

### Referrals
- Desktop: **gift icon** in the Hub top bar, or **Refer a friend** in Account. iOS: **Menu → Refer a friend** (shows **Get a free month** if eligible). Android has no referral screen.
- Credits apply to Stripe subscribers only. App Store users and team members can give referrals but not receive credits.
- Regenerating your link permanently disables the old one.
- Creator, sponsorship and affiliate inquiries are paused. Business partnerships go to enterprise@wisprflow.ai. Source: https://docs.wisprflow.ai/articles/7890073756-partnership-and-creator-collaboration-inquiries

---

## Admin / team setup

**Sources:** https://docs.wisprflow.ai/articles/1841503498-sign-up-for-flow-growth, https://docs.wisprflow.ai/articles/9406031800-sign-up-for-flow-enterprise, https://docs.wisprflow.ai/articles/2458545840-faqs-for-flow-pro-team-and-flow-enterprise-plans, https://docs.wisprflow.ai/articles/5744530207-team-consolidation-and-team-aware-onboarding-in-wispr-flow, https://docs.wisprflow.ai/articles/9258004709-assigning-members-to-a-team-department-as-an-admin, https://docs.wisprflow.ai/articles/9292860446-teammates-added-daily-digest-email-for-enterprise-admins

### Plan tiers for teams
| Plan | Includes (help center) |
|---|---|
| **Pro** | Unlimited dictation, shared dictionary and snippets, centralized billing and user management |
| **Growth** | Pro plus **SAML SSO**, admin controls, multiple email domains, departments, individual usage reporting, HIPAA via BAA. Self-serve, **card only**, monthly or annual |
| **Enterprise** | Growth plus **free IT admin seats, SCIM (no seat minimum), audit logs, MDM, IP allowlisting, premium support and CSM, invoicing/PO, custom MSA/DPA, model training locked off**. Sales-led, billed annually. Contact through wisprflow.ai/talk-to-sales |

### Admin portal
- URL: **admin.wisprflow.ai**. Key pages: **Settings → Billing**, **Settings → Organization** (User management, **SSO / SAML Authentication**, **SCIM Provisioning**, **MDM Rollout (Optional)**, auto-add), **Settings → Personal** (**New teammate notices** toggle), and **Team** (renamed **Organization** when there are multiple departments) → **Members**.
- **Roles:** **Member**, **Admin**, **IT Admin** (free, manages members, billing and settings, **no dictation access**, excluded from seat caps) and **SuperAdmin**.
- Desktop: **Settings → Account → Team** (or **Settings → Team**) has **Add new user**, **Copy invite link** (under **Share your invite link**), **Admin portal**, **Contact admins**, **Request to join**, **Send request again** and **Rejoin team**.

### Create a team and buy Growth
1. Sign in at admin.wisprflow.ai → enter invitation emails (or leave them blank) → **Continue**.
2. Enter a **Team name**. Eligible domains prefill it. Clear the **auto-add** checkbox if you want manual seat control (auto-add is on by default when a domain is attached) → **Create**.
3. **Settings → Billing** → on the Growth card, choose **Dictation and Notetaker** or **Dictation only** → **Monthly** / **Annual** → purchase. For an existing subscription, use **Upgrade** → **Upgrade to Growth?** dialog → tick "I agree to the Master Services Agreement and Data Processing Addendum" → **Upgrade to Growth**.
4. Stripe checkout follows. Checkouts that add billing require at least one seat. Checkouts without billing info require at least five seats.

- **Trials:** a 14-day team trial with no credit card, once per person. After expiry there is a 3-day grace period, then members drop to Flow Free and empty teams are disbanded. A returning member who already used a trial gets a 24-hour billing window.
- **Restricted domains:** public webmail, .gov, .mil, .edu, .int, .ac.in, country variants and universities cannot be attached. The team is then created without a domain ("Cannot create organization with a public domain"). Sales-reserved domains show "Your domain requires sales-assisted onboarding. Please reach out to sales."
- **Joining a billed team cancels and refunds an active personal Stripe subscription.**
- On desktop: **Settings → Account → Plans and Billing** → **Upgrade** on the **Upgrade to Flow Growth or Enterprise** card → **Growth & Enterprise** → choose an option → finish in the browser → **Finished paying? Click to refresh**.

### Team-aware onboarding (desktop)
- **Join your team** / **Join the {teamName} team!**: **Request to join** or **Continue without joining**. **Enter** continues without joining.
- **Pick your team** (Team Picker): required for billable members when the organization has live billing and teams. Select one team, then **Join team**. There is no skip option. If it fails: **Try again**.
- **Invite teammates:** coworkers on your domain are preselected, with **Add new teammate** / **Add another** → **Continue** / **Skip for now**. Then **Create a team name** with **Auto-add all future @domain users** (checked by default) → **Create team** → **Team created!**
- **Invitation card:** **Accept invite** / **Decline**. On success: "You've successfully joined the team!"
- A required-join prompt (verified domain) offers **Request to join** / **Sign out** / **Refresh**. The optional prompt offers **Not now**.

### Departments
- Hierarchy: **Organization → Cost center → Department → Member**. The default **General** department cannot be renamed or deleted.
- Invites: role dropdown and **Assign to a department** → **Add**. Invitations expire after **180 days**.
- Moving a member: trash icon on the member row → **Move to** → **Save**. Members move one at a time. There is no bulk tool or CSV import.
- **Create department:** names up to 120 characters, up to 500 members, **Successor admin** option.
- Removing a member: trash icon → **Remove** (Remove Member). Revoking an invite: X → **Revoke**.

### Teammates Added digest (Enterprise)
- A daily email at 16:00 UTC listing new joins (up to 500 names). It is on by default for Admin, SuperAdmin and IT Admin.
- To turn it off: **Settings → Personal → Your information → New teammate notices** ("Email preferences updated").

---

## SSO, domains & SCIM

**Sources:** https://docs.wisprflow.ai/articles/8771213223-configure-sso, https://docs.wisprflow.ai/articles/3897289456-verify-your-domain-for-sso, https://docs.wisprflow.ai/articles/6159095582-set-up-scim-user-provisioning-in-wispr-flow

### Configure SAML SSO
- **Plan / role:** Growth (Admin) or Enterprise (Admin, IT Admin or Super Admin). Pro and legacy Team plans do not include SSO.
- **⚠ Uncertainty:** The domain-verification article says "SSO setup requires the Enterprise plan", and lower plans show "Upgrade to Enterprise plan to use this feature". The Configure SSO article, the Growth article and the pricing page all say Growth includes SAML SSO.
- Identity providers mentioned: Okta, Microsoft Entra ID (Azure AD), Google Workspace.

Steps:
1. Go to admin.wisprflow.ai → **Settings → Organization → User management** → **SSO / SAML Authentication**.
2. Click **Configure SSO**. A setup portal opens in a new tab. You do not need to paste XML or certificates.
3. Create the SAML app in your identity provider using the ACS URL and entity ID the portal provides. Assign users and groups. Complete the test authentication.
4. Return and click **Refresh** ("Changed your SSO configuration? Refresh your SSO connection."). Success shows **"Single sign-on is active."**

- The button label shows the state: **Configure SSO** (not set up), **Finish setup** (inactive), **Manage SSO** (connected).
- **Enforce SSO for all members** is optional, off by default, and appears only after SSO is active. It blocks email/password, Google, Apple and Microsoft sign-in on the domain. It applies only while billing is active, in trial or past due.
- How members sign in with SSO: **Mac/Windows** → **Sign in via browser**. **Android** → **Continue with SSO**. **iOS** → **More Options → Continue with SSO**.
- Error pages: **Your Organization Has Not Configured SSO**, **SSO Requires Being A Part Of An Organization**, **SSO Sign In Required**, **Account Managed by Your Organization**, "You were not invited to this organization". **Your network isn't allowed** (IP allowlist) shows **Retry** / **Sign Out**.

### Domains and DNS verification
- To add or remove domains, email **enterprise@wispr.ai**. The portal lists domains read-only. Matching is exact: `mail.example.com` is not covered by `example.com`.
- Verify a domain: **Start verification** / **Continue verification** → publish the TXT record `_wispr-verify.<domain>` = `wispr-verify=<token>` → **Check verification** → "Domain verified successfully". Tokens do not expire, and checks are manual.
- SSO attaches only verified domains. Domain capture is an Enterprise feature.

### SCIM provisioning (Enterprise only)
- Prerequisites: Enterprise, Admin or IT Admin role, and **SSO active**. Until then, **Configure SCIM** is disabled ("Connect and activate SSO to enable SCIM provisioning.").
- Steps: Organization settings → **Configure SCIM** → **Directory Sync** → choose your identity provider → enable it → map **email, first name, last name** → assign a pilot group → confirm the user appears.
- Effects: manual adds and removes, invites and join approvals are blocked. Desktop hides **Add new user**. SCIM creates users as **Member** with no role mapping and **does not map identity-provider groups to departments**. Activation does not import existing users.
- Removal is blocked if it would leave no admin or no billable member.

---

## MDM deployment (IT)

**Sources:** https://docs.wisprflow.ai/articles/9363440133-deploy-wispr-flow-via-mdm, https://docs.wisprflow.ai/articles/9967754953-configure-auto-update-policy-via-mdm-updatefrequency

- **Plan:** MDM is listed as an Enterprise feature. Downloads are available to any signed-in organization member at **Settings → Organization → MDM Rollout (Optional) → Start MDM Setup** (**Copy link** gives direct URLs).
- **Mac:** a signed, notarized `Wispr Flow-v<version>.pkg` per architecture. The Accessibility `.mobileconfig` must be deployed to the device. Run the **Restore app ownership** `.zsh` script after install, because without it the root-owned app triggers repeated admin-password prompts. Microphone must still be approved by each user.
  - Bundle ID `com.electron.wispr-flow`, Team ID `C9VQZ78H85`, developer **Wispr AI INC**.
- **Windows:** machine-wide `Wispr Flow-v<version>.msi`, deployed as **SYSTEM** with `msiexec /i "<file>.msi" /quiet`. A stable URL is available: `https://dl.wisprflow.ai/windows/msi/latest` (must be enabled for your org). UpgradeCode `396d8b98-0a0d-5d72-8e7e-5d0c442674e9`.
- MDM consoles covered: Jamf Pro, Kandji, Intune, Rippling, Mosyle, Munki, Fleet.
- **UpdateFrequency** is the only MDM-managed setting. Values: **auto** (default, checks every 30 min–5 h), **weekly**, **bi-weekly**, **monthly**.
  - Mac: `wispr-flow-managed-config.mobileconfig`.
  - Windows: `HKLM\SOFTWARE\Policies\WisprAI\Flow\UpdateFrequency` (REG_SZ), or `wispr-flow-set-update-frequency.ps1`.
  - Users then see "Updates managed by your organization." / **Next update check: <date>**. Restart Flow after any policy change.
- Version check: Mac `defaults read /Applications/Wispr\ Flow.app/Contents/Info.plist CFBundleShortVersionString`. Windows: `HKLM\...\Uninstall`.

---

## Uncertainties & gaps (summary)

1. **Article count:** the brief said 40 articles, but the collection has **17**. I added 16 related articles to cover per-platform installation and settings.
2. **Free tier:** "2,000 words/week" (homepage FAQ) vs. 2,000 desktop + 1,000 mobile (pricing table and help center). The iOS hard stop is 1,500.
3. **Weekly reset time:** "Sundays at 23:45 UTC" (Android) vs. "Sunday, 12 a.m. PT" (iOS).
4. **SSO plan eligibility:** Growth and Enterprise (most sources) vs. "requires the Enterprise plan" (domain article).
5. **Model-training lock:** the Android article says Growth always locks sharing off. The Enterprise article says only Enterprise (via MSA/DPA) or a BAA locks it, and that "a paid plan alone does not lock" it.
6. **Language picker in the Flow Bar:** marketing says it exists. The help center says the Flow Bar has none.
7. **Student offer:** 50% off Pro (pricing FAQ) vs. free unlimited Student plan (Android help).
8. **Offline dictation:** the docs say internet is required. The iOS hands-free article mentions "Backup/Offline Dictation" being active for some users, with no further detail.
9. **Mac Input Monitoring:** optional (install article) vs. "grant Input Monitoring so Flow can detect the key being held" (hands-free article).
10. The help center does not publish a full screen-by-screen list of every onboarding survey question. The setup questions are only described generically.

---

## Source index

**Getting Started collection (all 17):**
- https://docs.wisprflow.ai/articles/2772472373-what-is-flow
- https://docs.wisprflow.ai/articles/1036674442-supported-devices-and-system-requirements
- https://docs.wisprflow.ai/articles/3152211871-setup-guide
- https://docs.wisprflow.ai/articles/6409258247-starting-your-first-dictation
- https://docs.wisprflow.ai/articles/6391241694-use-flow-hands-free
- https://docs.wisprflow.ai/articles/8884408990-connect-and-set-up-external-audio-devices
- https://docs.wisprflow.ai/articles/1841503498-sign-up-for-flow-growth
- https://docs.wisprflow.ai/articles/9406031800-sign-up-for-flow-enterprise
- https://docs.wisprflow.ai/articles/2458545840-faqs-for-flow-pro-team-and-flow-enterprise-plans
- https://docs.wisprflow.ai/articles/5744530207-team-consolidation-and-team-aware-onboarding-in-wispr-flow
- https://docs.wisprflow.ai/articles/9258004709-assigning-members-to-a-team-department-as-an-admin
- https://docs.wisprflow.ai/articles/9292860446-teammates-added-daily-digest-email-for-enterprise-admins
- https://docs.wisprflow.ai/articles/8771213223-configure-sso
- https://docs.wisprflow.ai/articles/3897289456-verify-your-domain-for-sso
- https://docs.wisprflow.ai/articles/6159095582-set-up-scim-user-provisioning-in-wispr-flow
- https://docs.wisprflow.ai/articles/9967754953-configure-auto-update-policy-via-mdm-updatefrequency
- https://docs.wisprflow.ai/articles/7890073756-partnership-and-creator-collaboration-inquiries

**Supplementary help articles (16):**
- https://docs.wisprflow.ai/articles/7339517111-manage-your-flow-account
- https://docs.wisprflow.ai/articles/7682075140-how-to-install-wispr-flow-on-mac
- https://docs.wisprflow.ai/articles/9363440133-deploy-wispr-flow-via-mdm
- https://docs.wisprflow.ai/articles/9633655004-installing-wispr-flow-on-windows-what-to-expect-from-the-downloadable-installer
- https://docs.wisprflow.ai/articles/7453988911-set-up-the-flow-keyboard-on-iphone
- https://docs.wisprflow.ai/articles/7523910584-try-flow-in-your-apps-ios-post-onboarding-experience
- https://docs.wisprflow.ai/articles/4500510662-set-up-the-action-button-for-flow-on-iphone
- https://docs.wisprflow.ai/articles/2809924024-android-download-installation-guide
- https://docs.wisprflow.ai/articles/6344532666-android-system-requirements
- https://docs.wisprflow.ai/articles/8858845757-setup-wispr-flow-on-android-android-settings
- https://docs.wisprflow.ai/articles/5906198129-starting-your-first-dictation-on-android
- https://docs.wisprflow.ai/articles/4877130308-plans-upgrades-and-word-limits-on-android
- https://docs.wisprflow.ai/articles/5096240724-navigating-the-wispr-flow-app-desktop-ios-and-android
- https://docs.wisprflow.ai/articles/5284722493-sync-flow-across-your-devices
- https://docs.wisprflow.ai/articles/3191899797-use-flow-with-multiple-languages
- https://docs.wisprflow.ai/articles/1790396454-move-and-dock-the-flow-bar-on-desktop

**Marketing site:** https://wisprflow.ai, https://wisprflow.ai/features, https://wisprflow.ai/pricing, https://wisprflow.ai/get-started


---

# Part 2: Using Wispr Flow (all features)

Source collection: https://docs.wisprflow.ai/collections/7303194563-using_wispr_flow (31 articles; all 31 fetched and verified against the collection index on 2026-10-12).
Method: the raw help-center HTML for each article was retrieved and converted to text. Everything below is taken from the article text. Notes marked **[Uncertain]** point out places where the articles are ambiguous or contradict each other.

Platform shorthand: **Desktop** = Mac + Windows. **iOS** = iPhone. Default shortcuts use the help center's own notation.

---

## 1. Navigating the Wispr Flow app (Desktop, iOS, Android)

Source: https://docs.wisprflow.ai/articles/5096240724-navigating-the-wispr-flow-app-desktop-ios-and-android (updated "4 days ago")

**Available on:** Mac, Windows, iPhone, Android. Menus and features differ by platform.

The main Flow app holds past dictations, personalization tools, account settings and help. To dictate inside other apps, you use a different control on each platform:

| Platform | In-app dictation surface |
|---|---|
| Mac / Windows | **Flow Bar** |
| iPhone | **Flow Keyboard** |
| Android | **Flow Bubble** |

> **Warning (all platforms):** Dictation history is stored on the device where you dictated, and deleting it is permanent everywhere. Cloud copies of synced desktop data or uploaded iOS history may also exist, so local deletion may not remove them.

### 1.1 Mac and Windows: the Hub

The main desktop window is called the **Hub**. Navigation starts from its sidebar.

**Sidebar items (primary pages):**

| Sidebar item | Notes |
|---|---|
| **Home** | Transcript history, word count, shortcut and stats |
| **Meetings** | Requires Notetaker access |
| **Insights** | Usage stats (see section 20) |
| **Dictionary** | See section 4 |
| **Snippets** | See section 5 |
| **Style** | Includes **Auto Cleanup** (see sections 3 and 9) |
| **Transforms** | Beta (see section 7) |
| **Notes** | Organization policy can hide it. The Scratchpad article calls this the "Scratchpad page" **[Uncertain: the sidebar label may be "Notes" while the feature is called Scratchpad]** |
| **Tasks** | No further detail in the article |
| **Extensions** | No further detail in the article |
| **Settings** and **Help** | At the bottom of the sidebar |

- Availability depends on your plan, organization policy and feature rollout.
- When the sidebar is collapsed, hover an icon to see its label.
- The accessibility article also mentions **Referral** and **Team** entries and the buttons **Account**, **Notifications**, **Invite team** and **Refer a friend**. It also describes an account panel containing **Download mobile**, **Manage account**, **Manage team**, **Get Flow Pro** and **Refer a friend**.

**Home**
- Search transcript history, grouped by date.
- Hover an entry to **copy** or **flag** it.
- Shows your word count, your shortcut and statistics.
- The greeting shows your push-to-talk shortcut only while you are under 2,000 dictated words and dictation is available.
- The **statistics card** opens **Insights**. The **weekly-words card** opens **Plans and Billing**.
- Tip: **Up/Down arrow** keys move the highlight through **Dictation history** one entry at a time.
- Each row has a **…** menu with **Undo AI edit**, **Redo AI edit** and **Retry transcript** (see sections 9 and 10).

**Settings tabs (desktop).** Settings opens on **General** unless a link points to another page.

| Settings page | What you can do |
|---|---|
| **General** | Shortcuts, Microphone, Languages |
| **System** | Launch at login, Flow Bar visibility, notifications; on Mac only, **Show app in dock** |
| **Account** | Edit your profile, sign out, delete your account |
| **Plans and Billing** | Manage your subscription (a separate page) |
| **Data & Privacy** | Data storage, Cloud Sync, notes refresh, data export |

Other Settings pages named in other articles:
- **Settings → Experimental** (Command Mode toggle)
- **Settings → Shortcuts** / **Settings → Keyboard shortcuts**
- **Settings → Vibe coding**
- **Settings → MCP**
- **Settings → Connectors**
- **Settings → Notetaker**
- **Settings → System → Notifications**
- **Settings → System → Extras** (LinkedIn)
- **Settings → System → Scratchpad**
- **Settings → Team**

- **Option/Alt + Arrow Up/Down** moves between visible settings pages.
- **Team updates** and **Team leaderboard** notification controls appear only for team members.

**Account and data safeguards**
- You can edit your name but not your email.
- Profile photo: 5 MB or smaller. Names that look like passwords are rejected.
- Sign-out asks for confirmation. Account deletion requires typing a confirmation phrase based on your email.
- **Local data storage** has three options: normal storage, automatic deletion after 24 hours, or no storage. Both deletion options ask for confirmation, and the no-storage confirmation requires typing **delete all**. An organization can restrict you to stricter options or lock no-storage on.
- Cloud Sync can be locked by organization policy or by a signed HIPAA Business Associate Agreement (BAA).
- **Warning:** **System → Data → Reset app** opens **Reset and restart?**. Confirming deletes local data; your dictionary, statistics and settings then re-sync.

**Menu bar / tray**
- The Mac menu-bar icon and the Windows tray icon offer **Open Wispr Flow**, **Help center** and **Talk to support**. On Windows, right-click the icon to open the menu.
- Other articles also mention **Paste last transcript** and **Shortcuts** in this menu, and **Dictation → Copy last transcript** in the Mac app menu.

**Flow Bar:** once setup is complete, drag it to the left, right or bottom screen edge (see section 8).

### 1.2 iPhone: tabs and the side menu

- **Tabs:** **Home**, **Dictionary**, **Snippets**, **Notes**, and **Style** when it is available for your account.
- Flow remembers the tab you last selected. Older tab layouts are hidden while the keyboard is open.
- **Note:** All tabs except Home stay locked until you complete "Dictate in another app". The **Try Flow first** prompt explains this.

**Side menu**
- Open it by tapping the menu icon, or by dragging right across the upper part of the screen (you do not have to start at the edge).
- Close it by tapping the dimmed area or dragging left.
- It contains your profile, **Settings**, **Account** and help options. Tapping your profile opens Account.
- A usage bar appears for eligible Basic or trialing users. It is hidden for student-free-eligible users and for paid non-trial plans.

**Home (history)**
- History is grouped by date, newest first. Statistics appear above it, except while the post-setup card is showing.
- Missing microphone permission replaces the stats with **Go to Settings**.
- Missing keyboard Full Access shows **Finish setup**, which opens the privacy explainer.
- **Copy or retry:** tap the text of a non-failed entry to copy it. Tap a failed entry to retry it. Retry and Delete are disabled while an entry is retrying.
- **Swipe left** reveals **Report**, **Retry**, **Copy** (when text exists) and **Play**. Play appears only when playback is available, the audio is still on the device, its duration is known and the entry is not retrying.
- **Backup dictation:** **Transcribe again with Flow** sends retained audio to the cloud. It is unavailable once the audio is gone. If the attempt fails, the existing transcript is left unchanged.
- Swiping does not delete. To delete: **Long-press** the entry → **Delete** → confirm.
- **Report** opens **Report to improve model**. **Send** submits your note together with the transcript, status, audio and logs.

**iOS Settings**

| Section | Controls |
|---|---|
| **General** | Set language, **Disable Flow after**, Keyboard feedback, Push Notifications |
| **Audio** | Interaction sounds, **Use Built-In Mic** (otherwise iOS uses the system's selected input) |
| **Data & Privacy** | Privacy, **Auto-delete transcripts**, Cloud Sync, HIPAA agreement, **Refresh notes from cloud** |

- Other iOS articles also mention **Settings → Personalization** (Smart Formatting), **Settings → General → Action button shortcut** and **Settings → General → Allow Live Activities**.
- **Disable Flow after** sets when Flow turns off.
- The Push Notifications toggle opens iOS Settings when you turn notifications off, or when turning them on requires system settings.
- **Important:** Turning Cloud Sync off requires a destructive confirmation. Organization policy or a signed HIPAA agreement can lock the privacy controls, and an enforced **Auto-delete transcripts** stays on.

**Flow Keyboard**
- In another app, tap the **globe** key to move to the next keyboard, or hold it to choose the Flow Keyboard. Some Flow Keyboard layouts have no globe key; their keyboard-switch key moves to the next keyboard instead.
- The Flow Keyboard's menu opens the notification and statistics panel. Close it with **X** or by swiping down.

### 1.3 Android: Home, drawer and the bubble

**Bottom bar:** **Home**, **Dictionary**, **Style**, **Snippets**.
- Back closes the drawer first, then the keyboard, then returns to Home.

**Home**
- Shows setup and warning cards, statistics and transcript history.
- Each entry offers copy, report, delete and retry. Retry requires stored audio.
- Home cards help you fix microphone, **Display over other apps**, accessibility and battery permissions.
- Recovery cards offer **Restart Flow**, **End snooze now** or **Turn Back On**, depending on the problem.

**Drawer** (top-bar menu icon): **Report an issue**, **Share feedback**, **Settings**, **Account**.
- **Account** shows your name and email, sign-out, **Manage Plan** and a privacy-policy link.

> **Warning:** Signing out on Android deletes every transcript stored on that device. The confirmation is titled **Sign out and delete transcripts?**

**Flow Bubble**
- Focus a text field, then tap the bubble for hands-free dictation or hold it for push-to-talk. Release to submit.
- The bubble is hidden in banking apps and sensitive fields.
- Drag the bubble to reposition it. During dictation or transcription it can only be dragged; taps and holds are ignored.
- Starting dictation can be blocked when you are offline or microphone permission is missing.

### 1.4 Getting help from the app

| Platform | Path |
|---|---|
| Desktop | **Help → Talk to support** opens the in-app contact form |
| iPhone | **Side menu → Talk to Support** opens **Report an issue** and **Share feedback** |
| Android | **Report an issue** in the drawer |

- On iPhone, **Report an issue** requires a message and a request type (**Issue**, **Billing** or **Account management**) before **Send** activates. **Share feedback** requires only a message.
- Submissions include the app and iOS versions, device name and model, time-zone region and recent logs.
- **Help Center** on desktop and iPhone opens https://docs.wisprflow.ai/ in your browser.
- Desktop contact form limits, from the MCP and LinkedIn articles:
  - The message is required, up to 10,000 characters.
  - You can attach one image of up to 10 MB.
  - Logs are attached automatically.
  - If sending fails, the message is copied to your clipboard.

---

## 2. Command Mode

Source: https://docs.wisprflow.ai/articles/4816967992-how-to-use-command-mode

**Available on:** Mac, Windows. On iOS, spoken Command Mode phrases can open a web search, but in-place text editing does not currently work.

Command Mode lets you edit text, draft a reply or search by voice. On desktop you hold a shortcut, speak an instruction and release to run it.

**Access**
- **Off by default.**
- Available with: active or past-due personal subscriptions, unexpired trials, and enterprise subscriptions that are active, trialing or past due.
- Free and lapsed accounts get no response or notification when they press the shortcut.

| Setup | Default shortcut |
|---|---|
| Mac | **Fn + Ctrl** |
| Mac without an Apple Fn key (set during onboarding) | **Cmd + Ctrl + Option** |
| Windows | **Ctrl + Win + Alt** |

### Run a command
1. **Turn on** Command Mode in **Settings → Experimental**.
2. **Focus** an editable text box (needed for text commands).
3. **Hold** the Command Mode shortcut.
4. **Speak** your instruction naturally. No "Hey Flow" prefix or fixed "ask/search/hey" wording is needed.
5. **Release** the shortcut to run it.

How it behaves:
- Command Mode sends the current text box contents and any selected text along with your instruction. If Flow cannot read the selection directly, it tries copying it.
- Edited or drafted text is pasted exactly as returned, without the normal dictation formatting.
- Desktop searches open **Perplexity** with the selected text appended to your query.
- App-building commands open the result in your browser.
- Saying "Hey Flow" or "ask perplexity" during ordinary dictation does **not** start Command Mode.
- Spoken trigger phrases are **English-only**. Activating with the hotkey works in any dictation language.

Cancelling:
- Press **ESC** or **Backspace** to cancel. ESC is the default **Cancel** shortcut.
- A custom Cancel binding replaces ESC and works even while other keys are held.
- A notification confirms the cancellation.
- Releasing the shortcut before Flow starts listening cancels instead of running the command.

Hands-free and time limits:
- **Hands-free lock:** double-press the shortcut within **500 ms**, then use the stop button when finished. A third press within that window dismisses. During onboarding, locking works only on steps that support hands-free.
- Recording warns at **19 min** and stops at **20 min**.
- Switching to a non-Flow system shortcut within the first second (when not hands-free) cancels the session and shows a notification.

Turning it off:
- Use **Settings → Experimental**, or choose **Disable** in the one-time **"Using Command Mode (beta)"** notice.
- Later activations show "Using Command Mode" instead.

### Customize the shortcut
1. Open **Settings → Shortcuts → Command Mode**.
2. Click the existing shortcut to record a new one.
3. Press and release your chosen keys to save.

Binding limits:
- Every shortcut can have up to **3 keys**.
- Each action can have up to **4 bindings**, except **Cancel**, which allows one. **Add another** disappears once you reach four.
- You cannot remove Command Mode's last binding.

Valid keys:
- A Command Mode shortcut needs a modifier or a supported mouse button. **Fn** counts as a modifier on Mac only.
- **Mouse:** Middle Click, Mouse 4–10 and Aux Button (on supported mice) work on their own. A modifier plus a mouse button (for example Ctrl + Mouse 4) saves as soon as you click.
- **Keyboard:** F1–F20 (Mac) or F1–F24 (Windows), arrows, punctuation and Windows numpad keys work when combined with a modifier or mouse button. Reserved combinations stay blocked.
- **Standalone exceptions:** Escape works alone only for Cancel. Caps Lock works alone only for Push-to-talk and Hands-free, not Command Mode.

While recording a shortcut:
- Escape, left-click, right-click or the **Cancel (X)** button cancels without changing the saved binding, even if you click outside the field.
- For a combination that includes Escape, press the modifier first.
- **Remove (trash)** deletes a binding when removal is allowed.

**Validation errors**

| Message | Cause |
|---|---|
| "This shortcut is not allowed: Cmd + C" (red toast) | Single letters, numbers, punctuation or reserved combinations (Cmd+C/V on Mac, Ctrl+C/V on Windows) |
| "This shortcut is already in use" | Another action already uses it |
| "Shortcut must include a modifier key or a valid mouse button" | No modifier or mouse button |
| "Shortcut must contain 3 or fewer keys" | Too many keys |
| "Shortcut cannot contain both left and right version of the same key" | Both left and right versions of the same modifier |

**Reset to default**
- Finish or cancel recording first, then click **Reset to default**. **Add another** and **Reset to default** are blocked while a shortcut is being recorded; the error may read "Please stop the Notetaker first".
- **Warning:** Reset replaces custom shortcuts across the whole dialog and clears bindings for actions that have no default (such as **Press Enter**). A hidden Notetaker row is not reset.

**FAQs**
- **Command mode is toggled off:** eligible accounts with Command Mode off see "Command mode is toggled off" / "Please turn it on to use it", with **Go to settings** (opens Experimental). This appears at most 3 times in total and once per day.
- **Shortcut does nothing during onboarding:** shortcuts stay inactive until onboarding reaches a step with dictation enabled. Close the mic-test dialog if it is open (ESC closes it).
- **"Transcript currently processing":** the press was ignored while the previous transcript was processing. Presses repeated within 500 ms may show no alert.
- **Nothing was pasted:**
  - Text-editing commands need existing text. With no surrounding text and no selection, the command does nothing.
  - If no editable box is focused, the result appears in a notification instead.
- **Failures:**
  - "Command Mode Servers Are Busy" / "Servers experiencing high demand." means nothing was pasted.
  - "Upgrade for Command Mode" / "Flow commands only available on Flow Pro." appears with an **Upgrade** button.
  - On iOS, a failed edit in the spoken-phrase path shows no error.

---

## 3. Flow Styles (writing styles)

Source: https://docs.wisprflow.ai/articles/2368263928-how-to-setup-flow-styles

**Available on:** Mac, Windows, iOS, Android.

Styles control how Flow capitalizes and punctuates dictation.
- Mac, Windows and Android use **app-category styles**.
- On iOS, **"Your default sound"** applies one style everywhere. Some iOS accounts see category tabs instead; those follow the per-category instructions.

| Style | Categories | What it does |
|---|---|---|
| **Formal.** | All | Capitals + punctuation |
| **Casual** | All | Capitals + less punctuation |
| **very casual** | Personal only | No capitals + less punctuation |
| **Excited!** | Work, Email, Other | More exclamations |

- Category pickers offer three styles per category. The iOS Default Sound picker offers all four.
- **Categories:** Personal messages, Work messages, Email, Other.
  - Flow picks the category from the app you are dictating in. Mac, Windows and Android also recognize web apps by their address.
  - **Email** also applies email formatting (greetings, sign-offs, line breaks). This includes Missive desktop on Mac and Missive in a browser on Mac and Windows.
  - On desktop, AI assistants and terminals use **Other** unless they are also recognized as messaging apps.
  - On the iOS category-tab layout, messengers use Personal, except Slack, Microsoft Teams and LinkedIn, which use Work. Other apps, including AI assistants, use Other.
- **Note:** Style formatting applies **in English only**. The notice saying so appears everywhere except under "Your default sound".
- Before personalization is complete, Flow uses standard formatting. An iOS keyboard style choice can override this.
- Styles affect **only new dictations**.

### Setup: Mac and Windows
1. Open **Wispr Flow → Style** in the left sidebar.
2. If the **"Make Flow sound like you"** banner appears, click **Start now**.
3. Follow the intro, then review **Personal messages → Work messages → Email → Other** using **Next**.
4. Finish the final screen.
5. Select a category tab (Personal messages opens by default) and click a style card.

How saving works:
- Selections save immediately. There is no Save button.
- **Next** keeps the preselected style.
- Clicking Next after Personal messages marks personalization complete and removes the banner.
- **Back** returns to the previous stage.

### iOS: "Your default sound"
1. Open **Wispr Flow → Style**.
2. Tap the card under **Your default sound** to open **Default Sound**.
3. Choose **Formal.**, **Casual**, **very casual** or **Excited!**.
4. Tap **Save**, or **Cancel** to close without saving.

You can also change the sound from the keyboard.

### iOS: category tabs
To change one category:
1. Open **Style**.
2. Pick Personal, Work, Email or Other.
3. Tap the style card to open its sheet (for example **Email Style**).
4. Choose a style.
5. Tap **Save**. Save stays disabled until you change the selection.

Guided setup:
1. Tap **Start now** on "Make Flow sound like you".
2. Tap **Start Personalization**.
3. Go through Personal messages → Work messages → Emails → Other with **Next**.
4. Tap **Done** on "You're all set!".

Notes:
- Back is disabled on the first category. Cancel exits at any stage.
- Dismissing the intro card with **X** marks personalization complete without selecting any styles.
- If you see "Try Flow first" / "Dictate in another app to access the rest of Flow", dictate in another app first.

### Android
1. Open **Style** in the bottom bar.
2. Tap **Start now** → **Start Personalization**.
3. Choose a style for Personal → Work → Email → Other, tapping **Next** to save each one.

To change a style later: tap or swipe to the category, tap its card to open "<Category> Style", choose a style and tap **Save**.

Android errors:
- "Something went wrong. Please try again." → tap **Retry**.
- "Could not save your selection. Please try again." → the change can still show locally, and Flow retries saving later. In guided setup, tap **Next** again.
- A dictation started before saved styles finish loading may use standard formatting.

---

## 4. Dictionary

Source: https://docs.wisprflow.ai/articles/4052411709-teach-flow-your-words-with-the-dictionary

**Available on:** Mac, Windows, iOS, Android.

Add names, technical terms or jargon so Flow recognizes them. Add a **correction** to replace a wrong spelling that keeps appearing.

### Add a word
1. Open Wispr Flow → **Dictionary** (left sidebar on desktop, bottom bar on iOS/Android).
2. Select **Add new** (desktop) or **+** (iOS/Android).
3. Enter the word or phrase.
4. Select **Add word** (desktop), **Save** (iOS) or **Add** (Android).

On iOS, Dictionary unlocks after you dictate in another app and return to Flow.

| Platform | Length limit |
|---|---|
| Mac / Windows | Input stops at 60 characters per word or correction field |
| iOS | 59 characters per field after trimming surrounding spaces |
| Android | 60 characters per word after trimming |

Validation:
- On mobile you can type past the limit, but the entry will not save.
- Empty or spaces-only entries are rejected everywhere. Desktop also rejects entries made only of punctuation or symbols.
- **Duplicates:**
  - Desktop and iOS block duplicates within the dictionary you are adding to, so a personal and a shared copy of the same word can coexist.
  - Android blocks duplicates that differ only in capitalization, and blocks snippet triggers.
- If **+** is missing on Android, select **Retry** under "Something went wrong. Please try again."

### Auto-learned words
When you correct dictated text, Flow can add the corrected word to your dictionary automatically.
- **Learned:** proper nouns, trade or profession terms, field-specific acronyms, uncommon name spellings (for example Geoff, Kathryn, Bryan), foreign terms, complete email addresses.
- **Skipped:** file names and paths, URLs and domains, partial emails, code symbols, keys, hashes, IDs, numbers, dates, markdown, emoji, everyday words, very common names (John, Sarah, Mike), globally famous names, everyday acronyms (PDF, CEO, ASAP).

### Where the dictionary applies
- It applies to dictated text and to meeting text Flow generates, such as meeting titles.
- Free-form and custom-prompt requests run **without** the dictionary.

### Corrections (fix persistent misspellings)
**Correct a misspelling** appears only when adding a new entry on desktop or iOS. Android uses corrections synced from those platforms but cannot create them.

1. Select **Add new** (desktop) or **+** (iOS).
2. Enter the spelling, capitalization and punctuation you want.
3. Turn on **Correct a misspelling**.
4. Enter the wrong spelling Flow produces.
5. Select **Add word** / **Save**, then dictate again to check.

Rules:
- Each entry holds one correction.
- If **Share with team** is off, an existing personal word without a correction is upgraded to carry the new one.
- On iOS, either field is blocked if it matches another entry ("Word already exists.").
- Desktop prefers the personal entry over a shared one when both match exactly.

How desktop applies corrections:
- They match whole words regardless of case, and prefer the longer phrase when rules overlap.
- They keep the capitalization and punctuation you saved.
- Replacements are literal, not language-aware.
- "n't" contractions are left alone (a Don → Dawn rule does not touch don't).
- Possessives are corrected (John → Bob turns "John's" into "Bob's").

### Find, edit, delete
- **Search:** the magnifying glass (desktop) or the top search bar (Android). Search matches words and corrections and excludes snippets. iOS has no search.
- **Edit:**
  1. Open the entry: pencil icon on hover (desktop), tap it (iOS) or swipe right (Android).
  2. Make your change. Desktop uses **Edit word** for plain words, or **Edit replacement** (**Misspelling** + **Correct spelling**) for corrections.
  3. Select **Save changes** / **Save**. An unchanged edit shows "No changes made".
- **Delete:**
  1. Start: trash icon (desktop), swipe left → **Delete** (iOS) or swipe left (Android).
  2. Confirm with **Yes, delete it** (desktop) or **Delete** (mobile).
  - **Warning:** Deletion is permanent on desktop, and auto-learning will not re-add a deleted word.
  - **Desktop bulk delete:** select rows → **Delete** → confirm. **Cmd/Ctrl+Backspace** works only when rows are selected and no text field has focus. Delete or Backspace alone does nothing.

### Personal vs shared
Sharing requires active membership on an active team.

Eligibility:
- **Desktop:** an active, trialing or past-due organization subscription; or an organization without a subscription plus your own active or past-due personal subscription or unexpired trial.
- **iOS:** organization membership plus an active or trialing Team or Business plan.

How it looks on each platform:

| Platform | Behaviour |
|---|---|
| Desktop | Adding on **Shared with team** creates a shared entry |
| iOS | Shows **All / Personal / Team**. Entries added in Team are shared automatically |
| Android | Shows **All / Personal / Shared with team** filters, but has no sharing option |

**Important:** Sharing on desktop *moves* the entry. Flow adds the team copy, then removes the personal copy.

### Sync
Words and corrections sync across devices on the same account while you are online.

| Platform | When it syncs |
|---|---|
| Desktop | When Flow opens and after each edit; also via the toolbar refresh control |
| iOS | At sign-in and when the app returns to the foreground |
| Android | At sign-in and each time you open Dictionary |

**Important:** Signing out on iOS or Android, or switching accounts on Android, clears the dictionary on that device until it syncs again.

---

## 5. Snippets

Source: https://docs.wisprflow.ai/articles/5784437944-create-and-use-snippets

**Available on:** Mac, Windows, iOS, Android. Personal snippets work on **every plan, including Basic**.

A spoken trigger inserts saved text. Choose a distinctive trigger, such as "my email signature" rather than "thanks".

### Create a snippet
1. Open **Snippets** (sidebar on desktop, tab on iOS/Android). On iOS, "Try Flow first" means the tab is still locked.
2. Select **Personal** if it is shown (optional on desktop).
3. Choose **Add new** (desktop) or the floating **+** (mobile).
4. Enter the trigger in **Snippet**.
5. Enter the text in **Expansion**.
6. Save with **Add snippet** (desktop), **Save** (iOS) or **Add** (Android).

**Limits by platform**

| | Desktop | iOS | Android |
|---|---|---|---|
| Trigger | 60 characters (silent cap) | Shorter than 60 after trimming | Max 60 after trimming |
| Expansion | 4,000 characters including formatting | No cap | No cap |
| Tabs/filters | **All** (default), **Personal**, shared | **All / Personal / Team** for active/trialing team & business accounts only | Filter chips for business/enterprise only |

**Desktop rules and errors**
- If the formatted expansion is too long: "This expansion is too long. Please shorten it and try again."
- Empty fields: "Please enter a snippet and its expansion".
- Triggers made only of punctuation or symbols are rejected.
- Exact (case-sensitive) duplicates against snippets or dictionary entries in the same library are blocked: "\"{word}\" already exists in your personal dictionary".
- Similar triggers that differ only in case, punctuation or spacing still save, but a 10-second notice warns you.
- **Cmd+Enter** / **Ctrl+Enter** saves, except inside the formatted editor.

**iOS errors:** "Please enter a snippet", "Snippet too long", "Please enter a word" (empty expansion), "Snippet already exists".

**Android errors:** "Please enter a snippet", "Please enter an expansion", "Snippet is too long (max 60 characters)", "This snippet already exists", "This is already in your dictionary".

**Sharing with your team**
- Requires sign-in and team or business features with an active or trialing subscription. Desktop also allows paying users in teams awaiting their trial.
- Without team features, desktop sharing is disabled and a banner opens **Settings → Team**.

### Use a snippet
Start dictating and say the trigger, on its own or inside a sentence. The expansion replaces it.

Desktop matching:
- Desktop text is **static**. Dynamic variables (such as today's date) are not supported.
- A trigger spoken alone ignores case, punctuation, symbols and spacing, and outputs the exact expansion.
- Inside a sentence, case is ignored, adjacent punctuation is allowed, and internal punctuation must match.
- Triggers cannot touch letters, numbers or underscores.
- Possessives expand; triggers inside "n't" contractions do not.
- Non-Latin, emoji and multi-word triggers all work.
- When triggers conflict, the **longest match wins**, and a personal trigger beats an identical shared one.
- Plain-text expansions keep literal placeholders such as "Reply to <name>".

**Formatted expansions (desktop)**
- The editor supports bold, italic, bulleted and numbered lists, and links.
- **Cmd+K / Ctrl+K** opens **Insert link**. With the cursor inside an existing link, it opens prefilled and shows a **Remove** button.
- Formatting is kept when the destination app accepts formatted paste.
- Formatting falls back to plain text when:
  - the snippet is pasted together with the hyperlink email signature,
  - the same trigger is used twice in one dictation, or
  - the app does not accept formatted text.

### Edit or delete
- **Edit:** pencil icon (desktop), tap the row (iOS) or swipe left-to-right (Android) → change it → **Save changes** / **Save**.
- Desktop edit messages: "Word cannot be empty", "No changes made", "An error occurred while updating the snippet…".
- **Delete:** swipe right-to-left (Android) or long-press / swipe from the trailing edge (iOS), then confirm.
- **Warning:** A failed iOS personal-snippet edit can remove the original from that device. Long-press → **Copy** first to keep the expansion.

### Troubleshooting
- **Trigger doesn't expand:** fix the trigger spelling, dictate it clearly, restart Flow (desktop), then test again.
- **Missing on another device:**
  1. Check both devices use the same account.
  2. On desktop, press **Esc** to clear the selection so **Refresh** appears, then click **Refresh** (unavailable while a sync is running).
  3. On Android, reopen Snippets. On iOS, sign out and back in.
- **Warning:** Signing out or switching accounts clears Android's local snippets until they sync again.

---

## 6. Viewing and managing dictionary and snippet entries (desktop list views)

Source: https://docs.wisprflow.ai/articles/9639977157-view-shared-dictionary-words-and-snippets-in-the-admin-portal
(Note: the URL slug says "admin portal", but the article title is "View dictionary words and snippets in the Flow desktop app" and it describes the **desktop app**.)

**Available on:** Mac, Windows.

| Tab | Shows |
|---|---|
| **All** | Every personal and shared entry visible to you |
| **Personal** | Entries only for you |
| **Shared with team** | Team entries. Organizations with more than one active team see **Shared with department** instead |

**Search**
- Matches words/triggers and their corrections/expansions.
- **Cmd+F** (Mac), **Ctrl+F** (Windows) or **/** focuses search.
- "No results found" means clear the search. An empty tab offers **Add new word** / **Add new snippet**.

**Icons and badges**

| Icon / badge | Meaning |
|---|---|
| People icon | Shared with team or department |
| Building icon | Shared with the whole organization |
| ✨ "Flow learned this word automatically ✨" | Auto-learned |
| "Imported from file" | File import |
| Phone icon, "Imported from contacts" | iOS contact import |

**Team access**
- Any qualifying member, not just admins, can view, edit and delete shared entries.
- Without access, **Add new** and **Import** are disabled on the shared tab. **Import** appears only when bulk import is enabled for your account.
- Without organization membership, the shared tab shows **Invite your team** or **Join your team**.
- **Refresh:** hover to see the last sync time, or "Sync dictionary" / "Sync Snippets" before the first sync.

**Sort by:** **Starred first** (Dictionary only), **Newest first**, **Oldest first**, **Alphabetical (A-Z)**.
- Newest and Oldest use modification dates.
- Hover a dictionary row to **Star** / **Unstar** it. Snippets have no star.

**Selecting rows**
- Click to select. **Cmd/Ctrl-click** toggles a row, **Shift-click** selects a range, **Shift+Up/Down** extends the selection.
- **Esc** clears the selection.
- Selecting rows replaces search/sort/refresh with **Bulk actions**.

**Bulk actions**
- **Share {n} with team** moves entries to the shared list and skips triggers that already exist there.
- **Delete {n}** asks for confirmation, then deletes. One entry confirms with **Yes, delete it**; several confirm with **Delete**.
- **Cmd/Ctrl+Backspace** opens the delete confirmation.

**Edit and limits**
- **Edit word** / **Edit replacement**.
- Limits: 60 characters for words, correction fields and triggers; 4,000 for expansions.
- A trigger can exist once personally and once in the team list.

---

## 7. Transforms (Beta) and iOS Polish

Source: https://docs.wisprflow.ai/articles/8068950331-how-to-use-transforms-beta (article title: "Rewrite text with Transforms and custom prompts")

**Available on:** Mac, Windows and iOS. iOS offers **Polish** with different limits and controls.

Transforms polish drafts, restructure text or apply custom instructions where you write. Base **Polish** keeps your tone; custom prompts can change it.

### Turn on (desktop Beta)
Default shortcuts activate when you open **Transforms**, select **Try it out** or turn **Opt in** on. If you chose Notetaker-only onboarding, you must finish dictation setup first.

1. Open the **Transforms** tab in the Hub.
2. Select **Try it out**.
3. Highlight the sample email text.
4. Press the shortcut shown in the demo.
5. Select **Turn on Transforms** (available only after the demo text has been replaced). The completion screen shows the shortcuts for View Diff and Undo.

### Default shortcuts

| Action | Mac | Windows |
|---|---|---|
| **Polish** | **Opt+1** | **Win+Alt+1** |
| **Prompt Engineer** (turns unstructured spoken thoughts into a structured AI prompt) | **Opt+2** | **Win+Alt+2** |
| **View Diff** | **Opt+O** | **Win+Alt+O** |
| First custom prompt (suggested) | **Opt+3** | **Win+Alt+3** |

### Use
1. Select text in any app.
2. Press the transform's shortcut. The text is replaced in place.

Limits and rules:
- Accepts **1–1,000 words**.
- With no selection, Flow uses the readable text box contents. If the box is empty, it uses your last dictation from the past **60 seconds**.
- Dictation cannot start while a transform is running.
- If auto-paste is off and Scratchpad is enabled, the rewrite opens in Scratchpad instead.

**Changing shortcuts**
- Polish and Prompt Engineer: change from their cards on the Transforms page.
- View Diff: change from **Settings → Keyboard shortcuts**.
- Use **+** to add a binding, up to 4 per action. **Remove shortcut** appears only when the action has more than one binding (View Diff's last binding *can* be removed).
- Each binding: max 3 keys, and it must include a modifier.
- **Reset to default** is in the shortcuts dialog.

### Review, retry, undo
- Click **Done. See changes** in the Flow Bar, or use View Diff.
- **"Your text looks good!"** means nothing was changed.
- The viewer offers **Copy**, thumbs up/down, **Retry polish**, **Accept edits**, **Configure Polish** and **Undo**.
- **Retry** re-runs on the original text. **Undo** restores the most recent transform.
- **Re-transform** options work on the already-transformed result: **Prompt Engineer**, **Turn to list**, **Translate to English** (not on iOS), **Empathize**.
- **Warning:**
  - Plain-text URLs become clickable links.
  - Markdown links and HTML anchors may not be preserved.
  - Slack nested lists can lose formatting.

### Custom transforms
- Up to **10 transforms**: Polish + Prompt Engineer + **8 custom**.
- **Create New** / **Create your own** disappear once all 8 custom slots are used.
- A custom transform needs a **name, prompt and shortcut** to save.
- There is **no Save button**. Edits autosave, and closing with a required field missing discards the changes.

Steps:
1. Click **Create New** or **Create your own**.
2. Name it (for example "Make Formal").
3. Assign a unique shortcut.
4. Write the instructions in **Customize prompt**.
5. Test on selected text.

If saving fails you will see "Failed to save, try again" or "Failed to save prompt, try again".

**Customize base Polish**
- Five toggleable rules: **Make more concise**, **Reword for clarity**, **Reorder for readability**, **Add structure for readability**, **Maintain your tone**.
- **Customize your Polish prompt**: up to **5 custom instructions, max 50 words each**. A duplicate shows "A custom rule with this text already exists".
- Pro rules **Clarify main point** and **Refine phrasing for impact** are **off by default**.

**Writing samples** (optional)
- Up to **5 per prompt, 50–500 words each**.
- Not available on iOS.
- Samples sync unless Privacy Mode or the data-sharing opt-out is on. Enterprise zero data retention keeps them on-device.

### Auto Apply After Dictation
1. Open the Hub **Transforms** page (not the Polish card).
2. Turn on **Auto Apply After Dictation**.
3. Choose Polish, Prompt Engineer or a saved prompt under **Choose a transform**.

How it works:
- The **Flow Bar wand menu** controls the same setting. **Configure transforms** opens the Hub page.
- Auto Apply skips dictations that show an auto-cleanup notification, and runs within 5 seconds of a previous run.
- If you see "We polished your dictation", use **Reveal edit** to review the change.
- If a transform fails, the original dictation is pasted instead.

### Errors

| Message | Fix |
|---|---|
| "Oops, too long to polish" / "Try again with under 1000 words" | Select a shorter passage |
| "Select text to apply a transform" / "Hey, select text first!" | Highlight text |
| "Couldn't detect text in your text box" | Click into the box and retry |
| "Polish mode servers are busy" / "Transform timed out" / "Transform returned no text" | Retry |
| "Flow can't paste right now. Text saved to clipboard" | The field isn't editable; paste manually |

### Reset / turn off
- **Reset** inside a custom transform clears its name, prompt, shortcut and samples.
- **Reset to defaults** on the main page asks for confirmation (**Yes** / **Cancel**) and permanently removes custom transforms. "Settings reset" confirms it.
- Turning **Opt in** off disables shortcuts and hides the wand, but keeps your saved prompts. Turning it back on restores the *default* shortcuts.
- **Organization control:** admins can toggle **Transforms** in **Organization settings** at admin.wisprflow.ai (it is **on by default**). When it is off:
  - Polish is blocked and the Transforms UI is hidden.
  - Shortcuts stop working, but saved bindings are kept.
  - In-progress rewrites are cancelled and the original text is pasted.
  - Dictation, Ask Anything and Notetaker are unaffected.

### iOS Polish
- Accepts **10–1,000 words**. When text is selected, it uses only the selection.
- Five built-in instructions: concision, clearer wording, grammar/spelling/punctuation, readable structure, matching your tone. You can add custom instructions.
- An out-of-range error clears after 10 seconds.

---

## 8. Flow Bar (desktop)

Source: https://docs.wisprflow.ai/articles/1790396454-move-and-dock-the-flow-bar-on-desktop

**Available on:** Mac, Windows.

The Flow Bar is a small floating bubble that shows dictation status: resting, recording or processing. On new installs it stays hidden at rest until initial setup finishes.

**Show it**
1. Open **Settings → System**.
2. Turn on **Show Flow Bar at all times**. This also ends any one-hour hide.

Until setup is complete, only the cancel and confirm buttons on the bar respond, and the language picker is unavailable. (The languages article says the Flow Bar has no language picker. **[Uncertain]** The two articles conflict.)

**Placement**
- After setup, drag it to the left, right or bottom edge of the screen.
- With multiple displays, it follows the display your cursor is on.
- **Mac:**
  - Stays clear of the menu bar and the Dock (bottom, left or right), and reclaims that space when the Dock is hidden.
  - Stays put when you switch Spaces.
  - Sits flush to the edge in full-screen.
- **Windows:** stays clear of the taskbar and leaves a gap for an auto-hide taskbar.
- Menus open from the docked side.
- Full-screen apps and meeting reminders can move it temporarily.
- A calendar reminder appears at bottom-center when the bar is hidden or snoozed and no meeting is running.

**Dock icon (Mac)**
- With **Show app in dock** off, the icon appears only while a Flow window (hub, notepad, scratchpad) is open or minimized.

**Hide it**
- Indefinitely: turn off **Show Flow Bar at all times**. The menu-bar and tray menus have no show/hide/move control.
- For one hour: right-click the *resting* bar while hovering over it → **Hide for 1 hour**. The toggle then reads "Hidden for one hour".

**Other Flow Bar features mentioned in other articles**
- Context menu: **Paste last transcript**, **Transcript history**.
- **Transforms wand** picker.
- **Done. See changes** banner.
- Optional **Scratchpad** button.

**Screen-share privacy**
- By default, the Notepad and Flow Bar appear in screen shares.
- To exclude them: **Settings → Notetaker** → under **While Notetaker is active**, turn on **Don't show Notepad and Flow Bar in screen capture**.
  - The Notepad is then always excluded.
  - The Flow Bar is excluded only while a meeting is recording or reconnecting.
- Windows needs Windows 10 version 2004+ and Desktop Window Manager running.
- The toggle is hidden if Notetaker is blocked for you.

**Accessibility gap:** Flow Bar menu rows cannot be reached by keyboard. Submenus open on hover, and the menu closes only with an outside mouse click, not Escape.

---

## 9. Auto Cleanup (Beta)

Source: https://docs.wisprflow.ai/articles/4283510616-auto-cleanup-control-how-much-flow-edits-your-dictation-beta

**Available on:** Mac, Windows.

Auto Cleanup controls how much Flow edits a dictation after you speak. The level applies to every dictation, in every app.

| Level | Default | What it does |
|---|---|---|
| **None** | — | Pastes the raw transcript, including filler words, false starts and spoken errors |
| **Light** | Default when no level is set | Removes filler words and fixes grammar |
| **Medium** | — | May reword phrases for clarity and concision while keeping the meaning |

If you previously chose **High**, the picker now shows Medium. High is no longer available.

**Change the level**
1. Open the Flow hub.
2. Go to **Style → Auto Cleanup** (marked **Beta**).
3. Click the **None**, **Light** or **Medium** card.

The change applies from the next dictation, with no restart.

**Recover the original**
- **Home** → three-dot menu on a dictation → **Undo AI edit**.
- Or press **Cmd+Z / Ctrl+Z** right after pasting.

**FAQ**
- **Unformatted text:** check whether Auto Cleanup is set to None, or the default transcription format is **"No AI formatting"**. Command Mode dictations and dictations into apps Flow recognizes as AI apps skip formatting by design.
- **Voice Profile:** None does not affect it. Raw dictations still count toward the **2,000 words** needed to unlock **Voice Profile**.

---

## 10. Smart Formatting and Backtrack

Source: https://docs.wisprflow.ai/articles/5373093536-how-do-i-use-smart-formatting-and-backtrack

**Available on:** Mac, Windows, iOS, Android. **Smart Formatting is on by default.**

**Where to change it**

| Platform | Path |
|---|---|
| Mac / Windows | **Personalization → Style** |
| iOS | **Settings → Personalization → Smart Formatting** toggle (syncs with your account) |
| Android | Always on; there is no toggle |

**[Uncertain]** The desktop path "Personalization → Style" does not match the Hub sidebar ("Style"). The two may be the same page.

Formatting cleans up filler words, grammar, punctuation and capitalization. It does **not** fix misheard words.

**Lists:** say numbers or sequence words ("one… two…", "first… second…").

**Spoken punctuation**

| To insert | Say |
|---|---|
| Period | "period" / "full stop" |
| Others | "comma", "question mark", "exclamation point", "colon", "semicolon" |
| Em dash | "em-dash" / "em dash" / "emdash" (may not produce a symbol; Flow avoids adding em dashes automatically) |
| New line | "new line", "next line", "line break", "skip a line" |
| New paragraph | "new paragraph", "start a new paragraph" |

- Line-break and paragraph commands work whatever your Smart Formatting setting, and work best at natural pauses.
- In rich-text output, a new line is one line break and a new paragraph is two.

**Backtrack**
- Removes filler words, false starts and self-corrections. Trigger it with phrases such as "actually", "scratch that" or "never mind", or simply restate what you meant.
- Example: "Let's do coffee at 2 actually 3." → "Let's do coffee at 3."
- Only clear self-corrections are removed.
- Backtrack is part of Smart Formatting, so turning Smart Formatting off disables it.

**Trailing periods (desktop)**
These rules apply only when no text is selected and the current line has no existing period, exclamation mark or question mark.

| Writing Style | Trailing periods removed |
|---|---|
| Formal | Never (by this rule) |
| Casual | Up to 10 sentences, in any app |
| Very Casual | No practical limit, in any app |
| Excited / no style | Up to 2 sentences in messaging apps only |

- Personal, Work, Email and Other default to **Formal** after setup.
- A previously chosen **Gen Z** style uses the Very Casual rules.
- Slack and Teams count as Work but also qualify for the messaging rule.

**Undo an AI edit (desktop)**
1. Open **Home** and find the dictation in **Recent Activity**.
2. Choose **… → Undo AI edit**.
3. Copy the restored transcript and paste it where you need it.

Notes:
- **Redo AI edit** restores the edited version. **Retry transcript** transcribes again.
- **Important:** Saved audio expires after **14 days**. After that, playback and **Extract audio** are unavailable.

**FAQs**
- Smart Formatting supports Chinese, Cantonese and Russian, among other languages.
- Formatting notices (Lists, Emails, Backtrack) appear at most once each plus three reminders. Mute them with **Announcements** under **Settings → System → Notifications**.

---

## 11. Capitalization mid-sentence (context-aware formatting)

Source: https://docs.wisprflow.ai/articles/4518230910-why-flow-capitalizes-words-mid-sentence-and-how-to-control-it

**Available on:** Mac, Windows, iOS, Android.

**Quick checks**
- Flow keeps capitals on words it recognizes as proper nouns.
- Test in macOS Notes or Windows Notepad to see whether the problem is specific to one app.

**Desktop: surrounding-text access**
- Mid-sentence blending on Mac needs Accessibility permission: **System Settings → Privacy & Security → Accessibility**. Windows never asks for it.
- Password fields are excluded.

**Reduce formatting**
- **Desktop per-app formats:** automatic formatting, unformatted transcription, proper-noun capitals only, or all lowercase. **[Uncertain]** The article does not give the exact menu path.
- **iOS:** **Settings → Personalization** → turn **Smart Formatting** off. It sits between Audio and Data & Privacy.

**How desktop adjusts text**
- **Spaces:** Flow adds spaces around the dictation. Chinese and Japanese are joined without spaces.
- **Empty boxes:** on Windows, a box showing only its placeholder text counts as empty.
- **Selections:** Flow matches a lowercase selection start.
- **Continuing sentences:** when the text after the cursor continues the sentence, Flow drops the dictation's ending punctuation.
- **Writing style:** Casual and Very casual drop the final period; Formal keeps it.

**iOS keyboard autocapitalization** is separate from Smart Formatting:
- Sentence fields capitalize; username and email fields never do.
- Manual Shift or caps lock wins.
- Autocorrect is triggered only by manual key taps.

**No surrounding context** (Flow treats the dictation as a new sentence):
- Slack, WhatsApp, Telegram, Discord, Microsoft Teams, Gmail, Notion, Claude, ChatGPT, and Chrome's Google search box and New Tab Page.
- Remote desktops (Citrix, RDP, VMware).
- Flow's own windows on Windows.
- Very large text fields or slow apps.

---

## 12. Multiple languages

Source: https://docs.wisprflow.ai/articles/3191899797-use-flow-with-multiple-languages

**Available on:** Mac, Windows, iOS, Android. **100+ languages.**

How detection works:
- Flow detects **one language per dictation**, not per word.
- Selecting languages narrows the choice.
- **Auto-detect** (desktop and iOS) lets Flow choose from all supported languages.
- The desktop Flow Bar has no language picker.

| Choice | Output |
|---|---|
| **English - British** | UK spelling |
| **English - Canadian** (desktop only) | Canadian spelling |
| **German - Swiss (Deutsch)** | "ss" instead of ß |
| **Chinese - Simplified / Traditional** | Simplified unless Traditional is selected |
| **Cantonese (粵語)** | Can be selected alongside either Chinese variant |
| **Hinglish** | Hindi in Latin letters. Select it explicitly; it is not auto-detected |
| **French** | Narrow no-break spaces before ; : ? ! » and after « (except in coding apps) |

**Mutually exclusive groups** (choosing one replaces the other):
- English / British / Canadian
- Hindi / Hinglish
- Chinese Traditional / Simplified
- German / Swiss

**Urdu, Hebrew and Ukrainian** cannot be recognized from speech alone.
- Select only one of them, except for the pairs **Hindi with Urdu** and **Russian with Ukrainian**. For those pairs Flow double-checks, so transcription may be slightly slower.

### Set languages

**Desktop**
1. Open **Settings → General**.
2. Click **Change** beside **Languages** to open **Dictation languages**.
3. Choose **Auto-detect**, or turn it off and search for languages.
4. Click **Save and close**.

- Saving with nothing selected shows "Please select at least one language or turn on auto-detect".

**iOS**
1. Open **Settings**.
2. Tap **Set language**.
3. Select languages or **Auto-detect**.
4. Close the sheet.

- Each tap saves immediately.

**Android** (no Auto-detect)
1. Open **Settings** → **Languages**.
2. Tap **Add more** to open **Select language(s)**.
3. Select languages, then tap **Done**.
4. Tap **Save**.

- **Warning:** leaving the screen without tapping **Save** discards your changes.

**Wrong language**
- Select only the intended language.
- On desktop, a **"Speaking a different language?"** notice offers **Open language settings** or **Don't show again**. It shows at most once a day.

---

## 13. Scratchpad (desktop notes)

Source: https://docs.wisprflow.ai/articles/9618237082-using-the-scratchpad-to-save-and-edit-notes (article title: "Use and organize notes in Scratchpad")

**Available on:** Mac, Windows. iPhone has a separate Notes feature.

Scratchpad is a tabbed rich-text editor for typed or dictated drafts, images and reference notes. If your organization disables it:
- The page and the notes list are cleared.
- The shortcut row, the Flow Bar button and **Settings → System → Scratchpad** are hidden.

### Create a note
1. Open the Scratchpad page.
2. Select **+**.
3. Type, or select the **microphone** to dictate (or hold your push-to-talk key).
4. Select the green **checkmark** to insert the transcript, or **X** to cancel.

Notes:
- Typing autosaves.
- **Copy** is in the note's floating actions.
- **Auto titles:** the first three words, once the text reaches 10 characters or 3 words. Blank titles display **Untitled**.

### Tabs and windows
- **5 tabs per window.** At the limit, new-tab requests silently do nothing.
- Double-click a tab title to rename it (up to 100 characters). Drag a tab to reorder it, drag it out to make a new window, or drag a window onto another to merge them.
- The in-app window **X** saves and closes every tab. The operating system's close button only hides the window.

| Shortcut | Action |
|---|---|
| **Cmd/Ctrl+E** | Toggle sidebar |
| **Cmd/Ctrl+T** | New tab |
| **Cmd/Ctrl+W** | Close tab |
| **Cmd/Ctrl+Shift+W** | Close window |

**Open Scratchpad shortcut**
- Default: **Opt+S** (Mac) / **Win+Alt+S** (Windows).
- Change it from the shortcut pill on the Scratchpad page, or in **Settings → General → Shortcuts → Open Scratchpad**. Up to 4 bindings.
- A tap shows or hides Scratchpad. Hold or double-tap to start dictating into a fresh tab.

**Flow Bar button:** enable it with the toggle in the Scratchpad page header. It is hidden by default.

### Pin and search
- Hover a card to reveal **Edit**, **Pin/Unpin** and **Delete**.
- Pinned notes sort first. **Pin status is per-device and does not sync.**
- **Sidebar search:** matches a contiguous phrase in the title or body, and highlights matches.
- **Page search:** matches loaded body text only, not titles.
- **Load more** adds 20 notes. Empty states: **No matching notes** / **No notes yet**.

| Page shortcut | Action |
|---|---|
| ↓ / j, ↑ / k | Move through notes |
| Enter | Open the note |
| c or Cmd/Ctrl+N | New note |
| Cmd/Ctrl+F or / | Focus search |

### Version history
1. Select the clock-shaped **Version history** button.
2. Pick an earlier version. It restores immediately, with no confirmation.

What is kept:
- Up to **50 versions**.
- Consecutive edits within 10 minutes are merged into one version.
- Each transform creates its own version.

### Delete
1. Select **Delete**.
2. Confirm "Are you sure you want to delete this note?" with **Yes, delete it**, or choose **Cancel**.

- **Warning:** This cannot be undone. It removes the note's history and images on this device.

### Open behavior
Change it in **Settings → System → Scratchpad** → **Customize** beside *Scratchpad open behavior*. It saves immediately.

| Setting | Effect |
|---|---|
| **Resume last note (default)** | Reopens the existing tabs |
| **Open in new tab** | Adds a blank tab if the active tab has content |
| **Open last active pinned note** | The shortcut opens the last-used pinned note |

### Images and sync
**Images**
- Formats: PNG, JPEG, WebP, GIF, BMP.
- Limits: **10 images per note**, each **≤5 MB after compression**.
- GIFs become a still frame.
- Images are not supported on iPhone.

**Sync**
- Notes save locally and sync automatically while you are signed in and online, regardless of the Dictation Cloud Storage setting.
- For a manual sync, use **Settings → Data and Privacy → Sync notes**. Results: "Notes refreshed" or "Failed to refresh notes". The button stays disabled for 10 seconds afterwards.

---

## 14. Sync across devices

Source: https://docs.wisprflow.ai/articles/5284722493-sync-flow-across-your-devices

**Available on:** Mac, Windows, iPhone, Android.

### Set up another device
1. Install Flow from https://dl.wisprflow.ai or your phone's app store.
2. Sign in with the **same email and original sign-in method** as your first device.
3. In the browser, check the **Log in as <email>** account. If it is wrong, choose **Not <email>?…**.
4. If asked, enter the **6-digit code** from your email. You can request another code after 30 seconds and have 5 tries.
5. On Android, tap **Open Wispr Flow** after browser sign-in.
6. Compare the email and plan on each device's Account screen.

Sign-in options: Apple, Google, Microsoft, SSO, or email and password. On iPhone, Microsoft, SSO and email are under **More options**.

**What syncs**

| Data | Behaviour |
|---|---|
| Subscription | Follows your account; billing stays with the original store or provider |
| Dictionary and snippets | Sync |
| Languages and writing styles | Sync |
| Statistics | Totals, WPM and weekly counts sync; daily counts stay local |
| Shortcuts, microphone, sounds | Per device |
| Dictation history | Per device |

**Missing subscription**
- **Desktop:** **Settings → Plans and Billing** → the header refresh button ("Click to refresh"). Success shows "Your plan is up to date with your account."
- **Android:** open the Plan page → **Explore plan**.

**Missing words**
1. Add a test word on one device.
2. Open Dictionary on the other device.
3. If it hasn't arrived, restart Flow.

- Data folders: **%APPDATA%\Wispr Flow** (Windows) and **~/Library/Application Support/Wispr Flow** (Mac).

**Warning: sign-out**
- **Desktop** sign-out deletes local transcripts, dictionary, notes and images, meetings and more.
- **Android** sign-out permanently deletes transcripts and audio.
- **Account deletion** immediately cancels Stripe subscriptions with no refund.
- Accounts cannot be merged.

---

## 15. Dictate in Microsoft Outlook

Source: https://docs.wisprflow.ai/articles/9272331366-use-flow-with-microsoft-outlook

**Available on:** Mac, Windows, iOS, Android (desktop app, mobile app, or Outlook web in a desktop browser).

**Desktop**
1. Choose **New Email**, or reply to a message.
2. Click in the body or Subject.
3. Hold the shortcut, speak and release.
4. Wait for the text to appear.

Default shortcuts:

| | Mac | Windows |
|---|---|---|
| Dictation | **Fn** | **Ctrl+Win** |
| Hands-free | **Fn+Space** | **Ctrl+Win+Space** |
| Mac without Fn key | **Ctrl+Opt** (hands-free **Ctrl+Opt+Space**) | — |

- On Mac, enable Accessibility for Flow.
- On Windows, the dictation stays on the clipboard for about 3 seconds after inserting into Outlook.
- **Hands-free:** double-tap the dictation shortcut or press the hands-free shortcut; press again to stop. **Esc** cancels.

**iPhone**
- Requires microphone access and **Settings → General → Keyboard → Keyboards → Flow → Allow Full Access**.
- Long-press the globe key → **Wispr Flow**. Tap the dictation button, speak, then tap the checkmark.
- Flow switches keyboards in To/CC/BCC and number fields.
- If your company blocks third-party keyboards, use **Quick Dictation to Clipboard**.

**Android**
1. Tap the Outlook body.
2. Tap the **Flow Bubble** and speak.
3. Tap **Done**.

- **Cancel (X)** discards the dictation.
- If insertion fails, the text goes to the clipboard. Tap **Paste**, or use **Copy to clipboard** (it disappears after 5 seconds).
- Bubble repair indicators: warning triangle (permission problem), retry icon (connection problem), pulsing (reconnecting).

**Desktop recovery shortcuts**

| | Mac | Windows |
|---|---|---|
| **Paste last transcript** | **Cmd+Ctrl+V** | **Shift+Alt+Z** |
| **Copy last transcript** | **Cmd+Ctrl+C** | **Shift+Alt+X** |

- Both are customizable in **Settings → Shortcuts**.

**Word limits**
- **Desktop Free plan:** the week resets Sunday 12 a.m. PT. An 8,000-word bonus raises the limits.
- **Android Basic:** warning at 800 words, 1 attempt blocked at 1,000, all blocked at 1,500 until Sunday 23:45 UTC.
- Retry needs saved audio **within 14 days**.

---

## 16. Cursor, VS Code and other IDEs

Source: https://docs.wisprflow.ai/articles/6434410694-use-flow-with-cursor-vs-code-and-other-ides

**Available on:** Mac, Windows. Vibe coding features are on **all plans**.

| Feature | Where it works |
|---|---|
| **Variable recognition** | Cursor, Windsurf, standard VS Code (Mac/Windows) |
| **File tagging** | Cursor and Windsurf AI chat panels only |

- VS Code Insiders supports neither feature.
- On Mac, Accessibility permission is required.

**Variable recognition** (no Flow toggle; it relies on the IDE's screen-reader mode)
1. Open **Settings → Vibe coding** → **Set up**.
2. Open the Command Palette: **Cmd+Shift+P** / **Ctrl+Shift+P**.
3. Run **Toggle Screen Reader Accessibility Mode**.
4. Confirm **Screen Reader Optimized** shows in the status bar.
5. Keep the file visible and dictate. For example, "user ID" can match `userId`.

**File tagging**
- On by default. Toggle at **Settings → Vibe coding → File Tagging in Chat (Cursor & Windsurf)**.
- Say the full filename with its extension, or say "tag", "tagged", "at" or "@" before the base name.
- The filename must contain a dot. For `.env`, say "dot".
- The longest match wins.
- Any dictionary or snippet substitution disables tagging for that dictation.

**Pasting in terminals and editors**
- On Windows, coding editors use **Shift+Insert** instead of Ctrl+V.
- In Claude Code and Codex CLIs on Mac, long dictations paste in parts.

**Clipboard restore timing**

| Destination | Restore after |
|---|---|
| Local apps | ~0.5 s |
| Outlook, Word, WhatsApp (Windows) | ~3 s |
| Remote desktops | ~5 s |

---

## 17. Remote desktops (Citrix, RDP, VDI)

Source: https://docs.wisprflow.ai/articles/7336156466-use-flow-with-remote-desktops-citrix-rdp-vdi

**Available on:** Mac and Windows as the *local* computer. Run Flow locally, not inside the virtual desktop. Clipboard sharing must be enabled.

| Client | What to check |
|---|---|
| Microsoft Remote Desktop (Windows) | **Show Options → Local Resources → Clipboard** |
| Windows App / Remote Desktop (Mac) | Enable Clipboard in preferences |
| Citrix Workspace | Ask IT to allow clipboard redirection |
| VMware Horizon | Clipboard redirection in connection settings |
| Amazon WorkSpaces | Clipboard redirection in client preferences |
| Windows 365 / AVD | IT host-pool settings |
| VNC, macOS Screen Sharing, Splashtop, TeamViewer | Enable clipboard sync |

**Steps**
1. Grant microphone access (and Accessibility on Mac).
2. Choose the mic in **Settings → General → Microphone → Change**.
3. Click into the remote field.
4. Dictate. On Windows, fully release the modifier keys.

Notes:
- A closed MacBook needs an external microphone.
- Clipboard hold for remote desktops is **5 seconds**.

**Recovery**
- Use **Copy** in the failed-paste notification, then paste with the remote system's paste command.
- **Stray character on Mac:** delete it, then press **Ctrl+V** (Windows guest) or **Cmd+V** (macOS guest).
- **"Update admin settings to paste!" (Windows):** run Flow as administrator.
- **From History:** use **Copy transcript**, or **Retry / Retry transcript / Recover**. Retry needs audio no older than 14 days.

Formatting note: remote sessions give Flow no surrounding text, so it adds no leading space and keeps punctuation.

---

## 18. Linux, WSL and terminals

Source: https://docs.wisprflow.ai/articles/6478598909-using-flow-with-linux-wsl-and-terminal-applications

**Available on:** Mac, Windows. **There is no native Linux app.**

| Terminal | Direct paste | Notes |
|---|---|---|
| Command Prompt, PowerShell, Windows Terminal, WezTerm | Yes | — |
| Terminal.app, iTerm2 | Yes | Needs Accessibility |
| Warp, Ghostty, kitty, Alacritty, Hyper | Yes | Needs Accessibility on Mac |
| VS Code / Cursor / Windsurf terminals | Yes | — |
| VS Code Remote SSH (Windows) | Yes | — |
| Terminal in RDP/VNC (Windows) | Yes | — |
| Terminal in VNC (Mac) | **No** | Use Paste last transcript |
| WSL windows, Linux VMs, remote SSH | **No** | Use Paste last transcript |

**Steps**
1. Enable Accessibility (Mac).
2. Focus the terminal.
3. Enter insert mode in Vim or Nano.
4. Dictate.

**Warnings**
- Context-aware formatting can alter shell commands.
- In terminals, Flow does not warn when no field is focused.

**Recovery shortcuts**

| | Mac | Windows |
|---|---|---|
| Paste last transcript | **Ctrl+Cmd+V** | **Alt+Shift+Z** |
| Copy last transcript | **Ctrl+Cmd+C** | **Alt+Shift+X** |

**Windows clipboard privacy**
- Flow keeps password-manager "sensitive" markings.
- Its own clipboard writes are excluded from Win+V history and cloud clipboard sync.

**Troubleshooting**
- Run Flow as administrator if the terminal runs as administrator.
- Check the Microphone, Accessibility and (Mac) Screen Capture permissions.

---

## 19. Notifications

### 19.1 Desktop notification categories

Source: https://docs.wisprflow.ai/articles/2250194357-customize-notification-preferences-by-category

**Available on:** Mac, Windows (not iOS or Android). Settings are saved per computer.

**Settings → System → Notifications.** Changes apply immediately.

| Category | Default | Controls |
|---|---|---|
| **Suggestions** | On | Tips, Notetaker auto-start offer, Notepad offer, summary-ready alerts |
| **Announcements** | On | Feature discovery, smart formatting, Dictionary, Snippets, Styles, Translate |
| **Milestones** | On | Word counts, streaks, referrals, dictionary and voice-profile milestones |
| **Team updates** | On | Enterprise only: membership, upgrades, trial and billing-grace notices |

**Notifications you cannot mute:** permission and microphone errors, billing and trial alerts, team-access loss, dictation errors, Notetaker recording issues.

**Meeting detection**
- Flow suggests turning notifications off after 3 closes in a row or 5 cards that expire unanswered.
- After **35 unanswered** cards, it turns detection off and shows **Meeting notifications turned off** with **Turn back on** / **Got it**.
- To turn it back on later: **Settings → Notetaker** → auto-detect meetings.

**Teammates Added email (admins only):** admin portal → **Settings → Personal → Your information** → **New teammate notices**.

### 19.2 Email preferences and phone notifications

Source: https://docs.wisprflow.ai/articles/2225791263-email-preferences-and-marketing-opt-out

**Marketing emails** (for example the **Flow State** monthly summary)
- Use the unsubscribe link in the footer.
- Transactional emails (account, billing, security) cannot be disabled.
- There is no self-serve domain-wide opt-out; contact support.

**Teammates Added digest**
- Daily at **16:00 UTC**, admins only, on by default.
- Lists up to 500 members.

**iOS push notifications**
- iOS **Settings → Notifications → Wispr Flow → Allow Notifications**.
- Turning them off also disables the interrupted, time-limit and saved/retry alerts.

**Android**
- No marketing push notifications are sent.
- **Word limit alerts** is its own system notification channel.
- To turn off everything: **Settings → Apps → Wispr Flow → Notifications** → **All Wispr Flow notifications**.

**Android word-limit banners**

| Weekly words | Effect |
|---|---|
| 800 | 200-words-remaining warning (once a week) |
| 1,000–1,499 | "Flow will slow down until next week." |
| 1,500+ | "No words remaining", and every attempt is blocked |

- Resets Sunday **23:45 UTC**.
- **Get unlimited words** opens the upgrade screen.

**Stripe**
- Receipts may come from @stripe.com or @link.com.
- Pro users: **Settings → Plans & Billing → Manage subscription**.
- Teams: **Manage billing**.

---

## 20. Insights: the "Your usage" tab

Source: https://docs.wisprflow.ai/articles/8760230576-your-usage-tab-track-your-dictation-stats-in-wispr-flow

**Available on:** Mac, Windows only.

Open it from **Insights** (sidebar) → **Your usage** (the default tab). Another tab, **Your voice**, is hidden when local-data policy requires deletion.

| Tile | Measures |
|---|---|
| **Words per minute** | Recent speed: up to the last 100 transcripts, each under 400 s |
| **Fixes made by Flow** | "words corrected" plus "dictionary fixes" (desktop + mobile) |
| **Total Words Dictated** | Lifetime words, desktop + mobile |
| **Desktop usage** | 6 categories: personal messages, work messages, emails, AI prompts, documents, other tasks |
| **Activity heatmap** | Daily activity, current and longest streaks |

**Details**
- The WPM percentile label reads "Top X%" and compares you with typing speeds from a published study, not with other Flow users.
- Heatmap shading bands: 0, 1–249, 250–499, 500–749, 750+ words. History starts at account creation or 1 March 2025, whichever is later.
- Usage levels: 🚀 Power (10,000+), 👍 Moderate (1,000–9,999), 🤏 Light (<1,000).
- Stats refresh at app start and about hourly.

**Share**
- Click **Share**, pick a card, then choose **Copy image**, **Download**, **X** or **LinkedIn**.
- **See team usage** is shown to Organization, Super and IT Admins.

**Errors**
- "Something went wrong loading your insights." → **Try again**.
- Heatmap failed → **Retry**.

---

## 21. Snooze the Android Flow Bubble

Source: https://docs.wisprflow.ai/articles/3400534884-snooze-the-dictation-bubble

**Available on:** Android.

**Snooze**
1. Tap a text field.
2. Drag the idle bubble slowly to bottom-center.
3. Release over the snooze target.

- The message reads: "Wispr Flow is snoozed for 10 min. Shake your phone to bring it back."
- The duration is fixed at **10 minutes**.

**End snooze early**
- **Shake** firmly twice within **1.2 seconds** (phone unlocked, outside banking apps).
- Or tap **End snooze now** on the **Bubble is snoozed** card.
- The bubble returns to its default right-edge position.

**Recovery cards**
- **Flow can't insert text** → **Go to Settings**.
- **Flow isn't responding** → **Restart Flow**.
- **Flow Bubble Disabled** → **Turn Back On**.

**FAQs**
- Snooze hides the bubble; shrink leaves a dot.
- A force-stop clears snooze.
- Android sessions are capped at **5 minutes**.

---

## 22. Android: notification replies and browser address bars

Source: https://docs.wisprflow.ai/articles/5090227041-dictating-in-notification-reply-boxes-and-browser-address-bars

**Available on:** Android.

**Requirements and where it works**
- Requires the overlay, accessibility and microphone permissions.
- Works in standard inline notification reply boxes (for example WhatsApp) and in address bars in Chrome, Firefox and Edge.

**Steps**
1. Open the reply box or address bar.
2. Tap it to bring up the keyboard.
3. Tap the Flow Bubble and dictate.
4. Check the text.

**Warnings and rules**
- **Warning:** Do not dictate passwords, PINs or 2FA codes here, because these fields override the usual password protection.
- Reply boxes must be empty.
- Chrome's address bar may reject the text; use the clipboard instead.
- **Session limit:** a warning at about 4 minutes; recording stops at **5 minutes**.

**Failures**
- If insertion fails you see "Text copied to clipboard".
- "Failed to transcribe. Saved in the app." → **Retry**.

**Additional recovery**
- **Wispr Flow stopped** → **Fix in Settings**, then turn accessibility off and on.
- On Android 12+, opening the app restores the bubble.

---

## 23. iPhone shortcuts (Action Button, Back Tap, Control Center)

Source: https://docs.wisprflow.ai/articles/1986921789-how-to-set-up-flow-shortcuts-for-iphone

**Available on:** iOS (latest supported version).

**Before setup**
1. Microphone permission.
2. Keyboard Full Access.
3. **Settings → General → Allow Live Activities** → enable Live Activities. Starting a shortcut requires Live Activities.

**Six actions**

| Action | Result |
|---|---|
| **Quick Dictation to Clipboard** | Returns the transcript; copies it to the clipboard |
| **Dictate a Flow Note** | Saves a note (or returns text when run inside a Shortcut) |
| **Quick Dictation to Notes** | Saves a note |
| **Turn On/Off** | Starts or stops recording |
| **Open Flow Notes** | Opens a new full-screen note and starts dictation |
| **Create a Flow Note** | Saves text you supply |

**Action Button: guided setup** (iPhone 15 Pro/Pro Max, 16 family, 17 family incl. Air; not 17e)
1. Open **Settings → General → Action button shortcut**.
2. Tap **Let's go!** → **Try now**.
3. Add the shortcut.
4. Tap **Go to Settings** and map it to the Action Button.
5. Switch to the Flow keyboard.
6. Tap **Next** → **Finish**.

**Action Button: manual setup**
- iPhone **Settings → Action Button → Shortcuts** → choose the Flow shortcut.

**Back Tap**
- **Settings → Accessibility → Touch → Back Tap** → **Double Tap** or **Triple Tap** → choose the Flow shortcut.

**Control Center**
- **Settings → Control Center** → under More Controls, add **Toggle Flow** or the **Flow Notes** widget.

**Lock Screen and Dynamic Island**
- Controls: **Stop**, **Notes**, **Save Note**.
- Dynamic Island needs iPhone 14 Pro or later.

**Errors**
- "Couldn't start dictation. Turn on Live Activities…"
- "Oops, we didn't hear you.."
- "Poor connection!"
- "Your mic is being used by another app."

---

## 24. Keyboard and screen-reader accessibility

Source: https://docs.wisprflow.ai/articles/3941699399-keyboard-and-screen-reader-accessibility-in-wispr-flow

**Available on:** all platforms.

| Action | Shortcut |
|---|---|
| Move between controls | Tab / Shift+Tab |
| Activate | Space / Enter |
| Sidebar or Settings pages | **Option+↑/↓** (Mac), **Alt+↑/↓** (Windows) |
| Tabs | ← / → |
| Back / forward | Cmd/Ctrl+[ / ] |
| Hub feedback | **Cmd/Ctrl+/** |
| Submit dialog | Cmd/Ctrl+Enter |
| History rows | ↑/↓ or k/j; Enter copies |
| Meetings | Cmd/Ctrl+N records; Cmd/Ctrl+F or / searches |

**Screen readers**
- Tested with VoiceOver (Mac), NVDA and JAWS (Windows), and TalkBack (Android).

**Reduce Motion**
- Flow follows the system setting on Mac, Windows and iOS.

**Mac shortcuts blocked**
- Secure Keyboard Entry (for example 1Password) blocks Fn+Space.
- Quit that app, restart Flow, lock and unlock, or log out.

**Known gaps**
- Hub window controls.
- Account panel.
- Tooltips.
- Dictionary sort.
- Updates indicator.
- Flow Bar menu.

---

## 25. Connect an MCP client (Claude, ChatGPT, etc.)

Source: https://docs.wisprflow.ai/articles/9551372685-connect-an-mcp-client-to-wispr-flow-remote-mcp-server

**Available on:** Mac, Windows. Requires Notetaker and MCP access. **Read-only.**

**What the connection cannot do**
- Create, edit, share or delete content.
- Change sharing settings.
- Read dictation history or Notetaker chat history.

**Before connecting**
- Authorize the correct account.
- Cloud Sync may be needed. It is called **Dictation cloud storage** in Settings and **Private Cloud Sync** in hub prompts.
- MCP is on by default at the organization level.
- An active HIPAA BAA blocks every MCP feature.

### Connect
1. Open **Settings → MCP**.
2. Choose **Add to Claude**, **Add to ChatGPT**, **Add to Gemini** or **Add to Cursor**. Each opens that client's setup page.
3. For other clients, use the **Server URL** `https://api.wisprflow.ai/connect/mcp`:
   - Click **Copy server URL**.
   - Add it as a remote MCP server, with no trailing slash.
4. Sign in and authorize in the browser. SSO sign-in must finish within 5 minutes.
5. In Claude: **+ → Connectors → Wispr Flow** toggle.
6. Test by asking about a recent meeting.

- Claude Team or Enterprise: an Owner may need to add the connector first.

**What it can read**
- Meeting summaries, notes, transcripts, attendees and tasks.
- Scratchpad notes.
- Calendar events.
- Upcoming meetings.
- Shared-note links.
- Account identity.

**Managing connections**
- After a client connects, its card shows **… → Reconnect**.
- To disconnect, remove Wispr Flow in the client's own settings. Flow has no disconnect control.

**Missing calendar events:** **Settings → Connectors** → **Reconnect** / **Finish connecting**.

**Errors**

| Message | Fix |
|---|---|
| "Cloud Sync must be enabled…" | Enable it, or ask your admin |
| "This feature is not available for HIPAA-covered accounts." | Review the BAA |
| "MCP access has been disabled by your organization's administrator." | Ask your admin |
| Too many requests | Wait about a minute |

**Search scope:** search matches titles, summaries and notes, not transcripts. Results show up to 5 attendees.

---

## 26. Shared note links (web viewer)

Source: https://docs.wisprflow.ai/articles/2228313746-what-you-see-when-you-open-a-shared-wispr-flow-note-link

**Available on:** web browsers; the desktop app on Mac/Windows.

| Shared via | Account needed |
|---|---|
| Anyone with the link | None (if the organization allows public links) |
| Email invitation | Any account using the invited email |
| Domain sharing | A member of the owner's Wispr organization |

**What the web viewer shows**
- **Summary only.** The **Transcript** tab is always disabled.
- Owners and invitees can see the transcript in the desktop app.
- **My thoughts** and action items stay private.
- The "Ask anything about this meeting" bar sends you to the desktop app.

**Open in the app**
1. Download and install Flow if needed.
2. Return to the shared link.
3. Click **Open in Wispr Flow**.

After an attempt, the button is suppressed for 30 seconds.

**Errors**
- "You don't have access to this note" → **Switch account**.
- "Note unavailable" → ask the sender for a current link and access.
- "Unable to load note" → **Retry**.

---

## 27. LinkedIn profile integration

Source: https://docs.wisprflow.ai/articles/9886533497-showcase-wispr-flow-on-your-linkedin-profile

**Available on:** Mac, Windows. Free and optional.

**Connect**
1. Open **Settings → System → Extras**.
2. Click **Connect** beside **Add Wispr Flow to LinkedIn**.
3. Sign in to LinkedIn in your browser and authorize.
4. Look for "You're connected to LinkedIn!".

**Disconnect**
- **⋯ → Disconnect**. It takes effect immediately, with no confirmation.

**What appears on your profile**
- A **capability statement** chosen from your usage and role.
- A **Top User trophy**, which requires 100,000+ lifetime words *and* 20,000+ words in the last 30 days.
- Updates run nightly. Flow waits 2 minutes for authorization to finish.

---

## 28. Audio file upload (not supported)

Source: https://docs.wisprflow.ai/articles/7689167034-can-i-upload-audio-files-to-wispr-flow-for-transcription

**No.** Flow transcribes only live microphone speech, on every platform and plan.

**Meeting import**
- **Settings → Notetaker → Meeting import** → **Import**.
- **Otter:** a .zip or folder of .txt/.srt files.
- **Granola:** a .csv or .zip.

**Privacy controls**
- **Improve the model for everyone** (older versions: "Privacy Mode", with the opposite meaning) and **Dictation cloud storage**.
- To keep dictation content off Wispr servers, turn both off.

**Local retention**
- **Desktop:** audio is deleted after 14 days.
- **Android:** history is capped at 25,000–100,000 entries, depending on free storage.

---

## 29. 20-minute dictation sessions

Source: https://docs.wisprflow.ai/articles/4841123325-longer-dictation-sessions-now-up-to-20-minutes

**Available on:** Mac, Windows. Applies to Free and Pro; no setup needed.

- **At 19 minutes:** a warning sound and the message "You have <1 minute left…".
- **At 20 minutes:** the session stops automatically and transcribes, showing **Recover text**.
- **Recovery buttons:** **Recover text**, **Insert**, **Retry** and **Undo** all reinsert the last transcript. **Open History** opens History.
- **Mobile:** limits are unchanged (Android is 5 minutes).

---

## 30. Guided product tours (Notetaker tour and coachmarks)

Source: https://docs.wisprflow.ai/articles/1720463001-guided-product-tours-in-wispr-flow-team-features-intro

**Available on:** Mac, Windows.

**Coachmarks**
- Use **Next**, **Back** and **Done**, or close early with **X**.
- Tips cannot be replayed.

**Notetaker tour**
1. Select **Give it a try**.
2. Grant permissions if asked.
3. **Restart Wispr Flow** if prompted.

- You can also start it from the **Set up Notetaker** card → **Take 2-min tour**.
- The tour needs macOS 13+.
- Pause with Escape. Exit with **X** → **Yes, exit**.
- The demo stays on your device and is deleted afterwards.

---

## Appendix A: Default desktop shortcuts mentioned across the collection

| Action | Mac | Windows |
|---|---|---|
| Push-to-talk dictation | **Fn** (no Fn key: **Ctrl+Option**) | **Ctrl+Win** |
| Hands-free | **Fn+Space** (or double-tap) | **Ctrl+Win+Space** |
| Command Mode | **Fn+Ctrl** (no Fn: **Cmd+Ctrl+Option**) | **Ctrl+Win+Alt** |
| Cancel | **Esc** | **Esc** |
| Paste last transcript | **Cmd+Ctrl+V** | **Shift+Alt+Z** |
| Copy last transcript | **Cmd+Ctrl+C** | **Shift+Alt+X** |
| Polish | **Opt+1** | **Win+Alt+1** |
| Prompt Engineer | **Opt+2** | **Win+Alt+2** |
| First custom transform | **Opt+3** | **Win+Alt+3** |
| View Diff | **Opt+O** | **Win+Alt+O** |
| Open Scratchpad | **Opt+S** | **Win+Alt+S** |

## Appendix B: Inconsistencies and uncertainties noted

1. **Flow Bar language picker:** the Flow Bar article says the picker is unavailable until setup is done, implying one exists. The Languages article says the Flow Bar has no language picker.
2. **Smart Formatting desktop path:** given as "Personalization → Style", while the Hub sidebar shows "Style". Auto Cleanup is at "Style → Auto Cleanup".
3. **Shortcut settings path:** named variously as **Settings → Shortcuts**, **Settings → Keyboard shortcuts** and **Settings → General → Shortcuts**. These are probably the same area.
4. **Scratchpad vs Notes:** the Hub sidebar lists "Notes", while the Scratchpad article refers to the "Scratchpad page".
5. **Article 9639977157:** the slug mentions the "admin portal", but the content describes the desktop app.
6. **Section depth:** sidebar items **Tasks**, **Extensions** and **Meetings** are named but not described in this collection.


---

# Part 3: Wispr Notetaker

> Source collection: https://docs.wisprflow.ai/collections/8559995472-wispr_notetaker (26 articles, all fetched 2026-10-12).
> Base URL for all article links: `https://docs.wisprflow.ai`. Many articles are tagged "(beta)" in their URL slugs.
> Conventions: **bold** = exact UI label as quoted by the help center. "⚠️ Uncertain" = the sources conflict or are silent.

### Article index

| # | Article | Path |
|---|---|---|
| 1 | Getting started with Notetaker | /articles/3665250541-getting-started-with-notetaker-beta |
| 2 | Recording a meeting with Notetaker | /articles/9238501024-recording-a-meeting-with-notetaker-beta |
| 3 | Connect a calendar and use Notetaker reminders | /articles/8955305188-meeting-detection-reminders-and-calendar-in-notetaker-beta |
| 4 | The live transcript in Notetaker | /articles/4091106439-the-live-transcript-in-notetaker-beta |
| 5 | Dictating during a meeting with Notetaker | /articles/8175153619-dictating-during-a-meeting-with-notetaker-beta |
| 6 | Meeting notes and the editor in Notetaker | /articles/9406970664-meeting-notes-and-the-editor-in-notetaker-beta |
| 7 | Flow Summaries in Notetaker | /articles/1422535682-flow-summaries-in-notetaker-beta |
| 8 | The Notetaker hub: your meetings in one place | /articles/9247277218-the-notetaker-hub-your-meetings-in-one-place-beta |
| 9 | Troubleshooting Notetaker transcripts, summaries, and the hub | /articles/4251565280-troubleshooting-notetaker-transcripts-summaries-and-the-hub-beta |
| 10 | Troubleshooting Notetaker recording and audio | /articles/3089221553-troubleshooting-notetaker-recording-and-audio-beta |
| 11 | Control how long Notetaker keeps your meeting data | /articles/1761520520-transcript-retention-syncing-and-deleting-meetings-in-notetaker-beta |
| 12 | Ask Wispr about your meetings and shared notes | /articles/5694642921-ask-wispr-chat-with-your-meetings-and-notes-beta |
| 13 | Sharing meeting notes from Notetaker | /articles/5073796184-sharing-meeting-notes-from-notetaker-beta |
| 14 | Notetaker settings, explained | /articles/9319084321-notetaker-settings-explained-beta |
| 15 | Switching to Wispr Flow: Keep All Your Notetakers in One Place (MCP) | /articles/5166327995-switching-to-wispr-flow-keep-all-your-notetakers-in-one-place-mcp |
| 16 | Notetaker for Enterprise: FAQ | /articles/6858284702-notetaker-for-enterprise-faq |
| 17 | Product-aware onboarding: choosing dictation, Notetaker, or both (macOS) | /articles/5926242953-product-aware-onboarding-choosing-dictation-notetaker-or-both-macos |
| 18 | Enabling Notetaker for your organization (Enterprise admins) | /articles/9941500749-enabling-notetaker-for-your-organization-enterprise-admins |
| 19 | Upcoming meetings in Notetaker on iOS | /articles/3693950131-upcoming-meetings-in-notetaker-on-ios |
| 20 | Connectors in Wispr Flow | /articles/9962971864-connectors-in-wispr-flow-connect-disconnect-and-organization-blocked-connectors |
| 21 | Offline meeting recording in Notetaker | /articles/5810080970-offline-meeting-recording-in-notetaker |
| 22 | The meeting recording-consent notice | /articles/3808660402-the-meeting-recording-consent-notice-how-it-s-posted-and-how-admins-control-it |
| 23 | Use Notetaker with multiple languages | /articles/3512887047-use-notetaker-with-multiple-languages |
| 24 | Notetaker: privacy and security overview | /articles/4497184932-notetaker-privacy-and-security-overview |
| 25 | Import past meetings from Granola or Otter | /articles/4484290718-import-your-past-meetings-from-granola-or-otter-into-notetaker |
| 26 | Restricting Notetaker by domain: the Blocked domains setting | /articles/2670317558-restricting-notetaker-by-domain-the-blocked-domains-setting |

---

## What Notetaker is and how it works (bot-free capture, cloud processing)

Sources: [#1](https://docs.wisprflow.ai/articles/3665250541-getting-started-with-notetaker-beta), [#16](https://docs.wisprflow.ai/articles/6858284702-notetaker-for-enterprise-faq), [#18](https://docs.wisprflow.ai/articles/9941500749-enabling-notetaker-for-your-organization-enterprise-admins), [#24](https://docs.wisprflow.ai/articles/4497184932-notetaker-privacy-and-security-overview)

- Notetaker records meetings in the Wispr Flow desktop app and produces a **live transcript**, a refined post-meeting transcript, and an AI **Flow Summary**. You can also type your own notes in **My thoughts** and chat with meetings via **Ask anything** / Ask Wispr.
- **Bot-free:** Audio is captured *on the user's device* — your **microphone** (you) and **system audio** (other participants). "No bot joins the call," so participants get **no** "joined the meeting" notice from Zoom/Meet/Teams (#16, #18, #24).
- **Capture is local, processing is cloud:** Transcripts and summaries are processed in the cloud using third-party AI providers as subprocessors under the DPA (#24). Transcripts and summaries are stored in Wispr's cloud and #1/#13 state there is **no opt-out** of that storage. The privacy article "does not describe on-device transcription."
  - ⚠️ Uncertain: "on-device" in Wispr's docs refers to *audio capture*, not transcription. Do not claim on-device transcription.
- Wispr says it does **not store the live audio stream** (#24). Uploaded audio is deleted 7 days after upload.
- Recording continues locally if your connection drops; missing words are recovered after the meeting from saved audio (#4, #21).
- Works for scheduled calls, unscheduled/ad-hoc calls, and in-person meetings (**New note**). A calendar connection is optional.
- Because no bot joins, the **user/organization is responsible for notice and consent** (see Consent section).

---

## Platform availability and requirements

Sources: [#1](https://docs.wisprflow.ai/articles/3665250541-getting-started-with-notetaker-beta), [#16](https://docs.wisprflow.ai/articles/6858284702-notetaker-for-enterprise-faq), [#17](https://docs.wisprflow.ai/articles/5926242953-product-aware-onboarding-choosing-dictation-notetaker-or-both-macos), [#19](https://docs.wisprflow.ai/articles/3693950131-upcoming-meetings-in-notetaker-on-ios), [#10](https://docs.wisprflow.ai/articles/3089221553-troubleshooting-notetaker-recording-and-audio-beta), [#18](https://docs.wisprflow.ai/articles/9941500749-enabling-notetaker-for-your-organization-enterprise-admins)

| Platform | Status per sources |
|---|---|
| **macOS 13 (Ventura) or later** | Supported. Flow itself runs on macOS 12, but on macOS 12 Notetaker is disabled everywhere (dialog: "Recording meetings requires macOS 13 or later", **Got it**). Older unsupported Macs show "System audio not available" and **Notetaker blocked**. |
| **Windows** | Supported in most articles. Windows 10 v2004 (build 19041)+ captures all output devices; earlier versions capture only the default output device (#10). |
| **iOS** | Shows **Upcoming** meetings and notes recorded on Mac/Windows; Enterprise accounts not yet supported (#19). |
| **Android** | Not mentioned except that there are no Notetaker admin controls in iOS/Android apps (#18). |

- ⚠️ Uncertain (Windows): #16 (Enterprise FAQ) says "Mac for Notetaker. Windows is available only to accounts granted Windows access," while most other articles list Windows as generally supported. #9 also mentions "Windows-specific restrictions" that explicit account access can bypass.
- ⚠️ Uncertain (iOS recording): #19 says "the notes list and record button still work normally" when the Upcoming section is hidden, but also labels the page "shows meetings recorded on Mac or Windows" and tapping a card "does not open a draft or start a recording." Whether iOS itself records is not clearly stated.

---

## Access, plans, and weekly limits

Sources: [#1](https://docs.wisprflow.ai/articles/3665250541-getting-started-with-notetaker-beta), [#8](https://docs.wisprflow.ai/articles/9247277218-the-notetaker-hub-your-meetings-in-one-place-beta), [#16](https://docs.wisprflow.ai/articles/6858284702-notetaker-for-enterprise-faq), [#18](https://docs.wisprflow.ai/articles/9941500749-enabling-notetaker-for-your-organization-enterprise-admins), [#21](https://docs.wisprflow.ai/articles/5810080970-offline-meeting-recording-in-notetaker)

**Access**
- Notetaker appears by default in the Flow sidebar, even if you chose dictation in onboarding.
- Individual subscription on a **Business** or **Growth** price with no team/org: full access, nothing for an admin to enable (also older Business accounts).
- **Business/Enterprise orgs:** depends on org/account permissions. Enterprise access is *not automatic*; Wispr grants it per organization; Dictation and Notetaker can be bought separately (#16).
- Buying **Growth** turns Notetaker on at checkout (unless org is set **Disabled for everyone**). Org-level Business plans require Notetaker on (#18).
- If Notetaker is missing, ask your admin to review access in the admin portal.

**Weekly recording quota**

| Fact | Source |
|---|---|
| **50 recordings/week** for Basic and non-paying users; paid plans have "a higher cap" | #1 |
| "Paid plans include **150** meeting notes per week. Basic allowances vary." | #8 |
| "Paid accounts can record up to **100** meetings per week." | #16 |
| Organization plans don't block recording based on plan alone | #8 |

- ⚠️ Uncertain: paid cap is stated as 150 (#8) vs 100 (#16). Treat the exact paid number as unconfirmed.
- Resets **Mondays 00:00 UTC**. Only meetings **≥ 5 minutes** (pauses included) count. **Imports don't count.** Resuming within 6 hours uses no second slot. **Discard** returns the slot. Mac sleep time doesn't count toward quota (#21).
- At ≤1 recording left a banner shows the reset date; at the cap: "You have no meeting notes left this week." **New note** is disabled (hover shows reset date).
- **Upgrade** button appears only for non-paying users → Settings → Plans and Billing.

---

## Onboarding and first-time setup (permissions)

Sources: [#1](https://docs.wisprflow.ai/articles/3665250541-getting-started-with-notetaker-beta), [#17](https://docs.wisprflow.ai/articles/5926242953-product-aware-onboarding-choosing-dictation-notetaker-or-both-macos), [#10](https://docs.wisprflow.ai/articles/3089221553-troubleshooting-notetaker-recording-and-audio-beta)

**Product choice in onboarding** — screen "How can Flow help you?": **Dictation**, **Notetaker**, or **Both** → **Continue**.
- *Notetaker only* skips dictation screens; adds meeting questions ("How do you currently record meetings?", "What's frustrating about meetings?"), Privacy, calendar connection, and "Connect your apps".
- *Both* = full dictation setup + meeting questions, Privacy, calendar (no "Connect your apps").
- Calendar step is optional: **Connect** (Google Calendar/Outlook) or expand **I use a different calendar** (iCloud = coming soon; Outlook fallback; Something else; I don't use a calendar).
- Privacy step offers sharing usage data or Privacy mode / **Don't use my data for training** (may be org-locked).
- Until onboarding is finished, every start method shows "Finish setup to use Notetaker". Reinstall, new device, **Restart Onboarding**, **Reset Account** all require re-onboarding. Synced meetings stay viewable read-only.

**Permission checklist** (recorder window, lists only missing items; ends in **All set!**). If you see **Complete setup to start Notetaker** / "Notetaker isn't recording yet" → **Finish Setup** or **Close Notetaker**.

| OS | Steps |
|---|---|
| macOS 14.4+ | **Turn on** beside **Enable System Audio** → **Allow** (no restart). If denied, **Turn on** opens System Settings → enable Wispr Flow under "System Audio Recording". **Don't Allow** shows denial immediately; **Turn on** returns after 30 s if pending. |
| macOS 13–14.3 | **Turn on** beside **Enable System Audio** → allow Screen Recording → **Restart Wispr Flow** (restart required). Row also offers **Open Settings**. |
| Mac microphone | **Turn on** beside **Enable Microphone** → System Settings → Privacy & Security → Microphone. Setup checks ~30 s. |
| Windows | No system-audio step. Windows Settings → Privacy & Security → Microphone: enable access and **Let desktop apps access your microphone**. #1 says route meeting app to the default output device (no output picker); #10 says Win10 2004+ captures all outputs. |

- **Back** or **Escape** closes setup without recording. Revoking permission mid-recording stops capture and reopens setup.
- Accessibility permission (Mac) is part of Flow's app-wide setup; needed for speaker names, Meet detection, split screen, and automatic consent posting.

---

## Starting a recording

Sources: [#1](https://docs.wisprflow.ai/articles/3665250541-getting-started-with-notetaker-beta), [#2](https://docs.wisprflow.ai/articles/9238501024-recording-a-meeting-with-notetaker-beta), [#3](https://docs.wisprflow.ai/articles/8955305188-meeting-detection-reminders-and-calendar-in-notetaker-beta), [#8](https://docs.wisprflow.ai/articles/9247277218-the-notetaker-hub-your-meetings-in-one-place-beta), [#14](https://docs.wisprflow.ai/articles/9319084321-notetaker-settings-explained-beta)

| Method | How |
|---|---|
| Ad-hoc / in-person | Sidebar **Notetaker** → **New note**, or ⌘N (Mac) / Ctrl+N (Windows) |
| Scheduled meeting (hub) | **Join + Start** / **Join and record** on the Upcoming row (appears within 10 min of start). Use **Start** if already on the call, no link, or conflicting meeting. Dropdown: **Join meeting** or **Start Notetaker** |
| Calendar reminder | **Join meeting** "& start Notetaker" → opens call + records. Caret menu: **Join meeting** (no recording) or **Start Notetaker** (record without opening link) |
| Global shortcut | Settings → Notetaker → **Keyboard shortcut** (default Mac **Option + M**, Windows **Win + Alt + M**); **Change shortcut**. Action "Join meeting / start Notetaker" |
| Triple-tap | **Triple tap <your dictation key> for Notetaker** (on by default, per device) |
| Meeting detected card | Shown when a call is detected; **Start Notetaker** |
| Auto-start | **Start Notetaker automatically** (off by default) |
| Other | Menu bar / tray, notepad **Record** button |

- Get consent first. Some orgs require the dialog **Obtain consent to start Notetaker** → **Consent obtained** (cancel = no recording). Skipped in the guided tour.
- Confirm the recording indicator. Starting a new note during another recording asks **Stop Notetaker?**
- Notetaker always uses the OS **default microphone (Auto-detect)**; the Settings mic choice applies only to dictation. No in-app mic picker.

**Auto-start / "Meeting detected" card** (#2, #3)
- Requires **Automatically detect any call** (on by default) + **Start Notetaker automatically** (off by default, per computer). Hub banner may offer **Turn on** / **Not now**.
- Countdown default **10 s** (range 5–60). **Start Notetaker** skips; hover/hide/drag pauses; X, Esc ("Not now"), caret menu, or **Snooze for 2 min** cancels.
- Skipped silently if setup/permissions incomplete, quota hit, another recording running, event already has a note, or the notepad has focus/you're typing.
- After 3 closed cards Flow offers to turn notifications off; after 35 unanswered cards (users who've never recorded) detection turns off → "Meeting notifications turned off" with **Turn back on** / **Got it**.

**Switching meetings while recording:** Flow Bar **Upcoming meetings** drawer → **Open Note** (current) or **Switch** (others). ⚠️ **Switch** in the drawer/reminder ends the current recording with *no confirmation*; hub **Join**/**Start** ask first. Same-browser call change may prompt "Looks like a new meeting. Switch?" / **Keep recording**.

---

## While recording: screens, notepad, Flow Bar

Sources: [#2](https://docs.wisprflow.ai/articles/9238501024-recording-a-meeting-with-notetaker-beta), [#5](https://docs.wisprflow.ai/articles/8175153619-dictating-during-a-meeting-with-notetaker-beta), [#6](https://docs.wisprflow.ai/articles/9406970664-meeting-notes-and-the-editor-in-notetaker-beta), [#8](https://docs.wisprflow.ai/articles/9247277218-the-notetaker-hub-your-meetings-in-one-place-beta)

- **Notepad** (floating window) tabs: **My thoughts** (your private notes), **Summary**, **Transcript**, **Docs** (only when documents are attached). Header: title, **Share**, copy-link icon, **⋯** menu (audio settings with mic meter, **Copy as Markdown**, **Connect to your AI tools**, Report).
- Hub meeting view buttons: **Back**, **Open note in window**, **Open meeting link** (join without recording).
- **Closing the notepad does not stop recording.** Recording continues behind the **Flow Bar** meeting pill; click the pill or the sidebar active-meeting card to return. The Flow Bar has **Stop Notetaker** and no cancel/discard; clicking the bar body opens the note.
- If you close the notepad within 15 s in three meetings in a row: "Hide Notepad when Notetaker starts?" → **Hide it** (Undo) / **Keep as is**.
- **Don't show Notepad and Flow Bar in screen capture** (a.k.a. "Hide from screen shares and screenshots" in #8) hides them from shares.
- **Split the screen when joining**: meeting left, Notepad right.
- Warnings: "System audio turned off" → **Turn on system audio**; "Microphone unavailable — stop and resume the meeting to retry"; "Notetaker isn't hearing audio from your mic" → **Microphone settings** / **Ignore**; "Still there? Notetaker isn't hearing anything."; "We might not be capturing your words" (mic mismatch) → **Open settings** / **Don't show again**.

**Dictating during a meeting** (#5): You can dictate into any text field while Notetaker keeps recording other participants. Dictated words are **not** added to the transcript; a **Dictated** marker is inserted. Mic is handed to dictation and returned afterward. Dictation limit: warning at 19 min, stop at 20 min ("Transcription session ended.", **Recover text**). If mic doesn't return: **Stop** → wait → **Resume**.

---

## Stopping, auto-stop, length limits, and resuming

Sources: [#2](https://docs.wisprflow.ai/articles/9238501024-recording-a-meeting-with-notetaker-beta), [#10](https://docs.wisprflow.ai/articles/3089221553-troubleshooting-notetaker-recording-and-audio-beta), [#14](https://docs.wisprflow.ai/articles/9319084321-notetaker-settings-explained-beta), [#21](https://docs.wisprflow.ai/articles/5810080970-offline-meeting-recording-in-notetaker)

**Manual stop:** **Stop** in the meeting window footer or **Stop Notetaker** in the pill. Capture ends immediately; saving can take up to 15 s. A pause divider is added (hover for "Paused <time> – Resumed <time>").

**Auto-stop** — **Stop Notetaker when a call ends** (on by default; #10 calls it "Stop the Notetaker when the meeting ends"). Turning it off also disables silence stops, silence warnings and check-ins.

| Prompt | Trigger | If ignored |
|---|---|---|
| "Notetaker stopping" | Call ended / silence | Stops at countdown end (max 30 s pending) |
| Silence check-in ("Meeting still going?") | 10 min continuous silence after speech | Stops |
| Calendar / long-meeting check-in ("Still taking notes", "Stop taking notes?") | 10 min after scheduled end, or after 1 h | Continues |
| Max-length warning | 5 min before (2 min for 30-min limit) | Stops at limit (**End recording** / extend) |

- **Keep going** / **Keep recording** / **Keep** answers that prompt. After auto-stop, "Notetaker stopped" offers **Resume** for ~4 s.
- App specifics: Zoom (Mac) most leave actions stop; Teams hang-up stops (English UI needed); Google Meet on Mac needs Chrome/Arc/Dia + Accessibility (Safari/Firefox not detected); Windows browser tab close stops after ~20 s (full confirmation in Chrome/Edge).
- **Maximum recording length**: 30 min, 1 h, **2 h (default)**, 3 h (~2h58m). All resumed segments count.
- **Mac sleep** ends capture ("Notetaker stopped when your Mac went to sleep." → Resume); Windows doesn't end on sleep. Switching macOS users stops immediately (needs manual **Generate summary**). Screen lock does not stop.

**Resume:** Open the meeting → **Resume** appends a new segment, keeps transcript and notes. Requires readable local audio (kept ~7 days by default), undeleted transcript, and remaining length allowance. Shows "Finishing up…" while saving. Failures: "Couldn't resume: …" → **Record as new meeting** (creates a separate meeting).

**Short / failed recordings:** "Started by mistake?" → **Keep** / **Discard** (#11 says **Save** / **Discard**). "Couldn't start recording" → **Try again** / **Discard**. Empty recordings and failed starts under 10 s are auto-discarded unless typed notes exist.

---

## Live transcript and search

Source: [#4](https://docs.wisprflow.ai/articles/4091106439-the-live-transcript-in-notetaker-beta)

- **Transcript** tab; **Show live transcript** / "Live Transcript" is on by default (Settings → Notetaker → Transcription). Off = audio still saved and refined after the meeting. Turning it on mid-meeting doesn't add live transcription.
- Auto-follows when at bottom; scrolling up pauses; **Jump to bottom** resumes.
- Markers: sleep, offline gaps ("Offline for <duration>"), pause/resume, **Dictated**, audio events.
- **Search:** Cmd+F / Ctrl+F / "/" (Transcript tab active). ≥2 characters; Enter/↓ next, Shift+Enter/↑ previous; case-insensitive, partial-word; Escape closes. During recording, rerun to include new speech.
- **Copy transcript** button, or Cmd/Ctrl+C with nothing selected → "Speaker: text" lines (markers excluded). **My thoughts** is never copied here.
- Shared-note recipients must open the note in the desktop app to view the transcript.

---

## Speaker identification

Sources: [#4](https://docs.wisprflow.ai/articles/4091106439-the-live-transcript-in-notetaker-beta), [#6](https://docs.wisprflow.ai/articles/9406970664-meeting-notes-and-the-editor-in-notetaker-beta), [#7](https://docs.wisprflow.ai/articles/1422535682-flow-summaries-in-notetaker-beta), [#9](https://docs.wisprflow.ai/articles/4251565280-troubleshooting-notetaker-transcripts-summaries-and-the-hub-beta)

- **During recording:** mic vs. system audio are grouped as **You** and **Others** (#4) / **You** and **Them** (#6, #9). ⚠️ Label wording differs between articles.
- **After stop:** the transcript is refined; real names appear where identified; others stay **Speaker 1**, **Speaker 2**…
- **How names are found:** reads the meeting app's UI (requires the "attribute names" setting, on by default, and Accessibility on Mac). Flow **does not use voiceprints**; calendar attendees are only *possible* names (#7).
- Your own speech gets your profile name only if a participant name matches your Flow profile name (fails for first-name-only profiles or exact duplicates).

| App | Automatic naming support |
|---|---|
| Google Meet | Chrome (incl. Beta/Dev/Canary), Edge, Brave; Chromium/Arc on Mac. **Safari unsupported.** Keep main or PiP window visible. |
| Zoom | Native app only; Mac needs Accessibility; Windows UI must be English |
| Microsoft Teams | Native app Mac/Windows; Chrome/Edge/Brave on Mac. Non-English Teams needs **People** panel open. Window must be visible (compact view OK). |
| Slack huddles | Desktop app Mac/Windows |
| Webex, Discord | **No** automatic naming (numbered speakers) |
| Arc (Mac) | Google Meet only; quit Dia if names are missing |

- **Manual correction:** click a speaker / person icon → **Assign speaker names** / **Assign Speakers** / **Rename**; search name/email or **Add new contact**; "In this meeting" list first; "(you)" marks you; **Same person** tag merges. Manual names override automatic ones. Unavailable on shared/read-only notes and while a summary generates.
- Error: "Couldn't save the name. Try again." (unsaved choices are copied into My thoughts).
- ⚠️ Names "aren't guaranteed to reflect true identity" — review before sharing.

---

## Meeting notes editor (My thoughts)

Source: [#6](https://docs.wisprflow.ai/articles/9406970664-meeting-notes-and-the-editor-in-notetaker-beta)

- Type in **My thoughts** (hub or floating notepad); edit the title field to rename. Autosaves; syncs across devices.
- Notes are separate from the summary — generating/editing/deleting the summary never changes My thoughts. **My thoughts is excluded when sharing** (but included in **Copy as Markdown**).
- Type **@** to mention a person.
- Title auto-generated after the meeting only if blank; calendar titles and your renames win.
- A meeting can be edited in only one place at a time.
- No note templates are described in the sources.

---

## Flow Summaries

Sources: [#7](https://docs.wisprflow.ai/articles/1422535682-flow-summaries-in-notetaker-beta), [#6](https://docs.wisprflow.ai/articles/9406970664-meeting-notes-and-the-editor-in-notetaker-beta), [#1](https://docs.wisprflow.ai/articles/3665250541-getting-started-with-notetaker-beta)

- Generated **after** the meeting ends. Automatic if total audio **> 5 minutes**; otherwise (or failed start / Mac user switch) the top bar shows **Not auto-generated** → click **Generate summary** (or a 24-hour automatic backstop per #2). Offline-started meetings process automatically with any audio.
- First-meeting notification estimates ~2 minutes, offers **View summary**.
- **Contents:** TL;DR + thematic sections; **Next Steps** (verb-first, grouped by owner, "(Everyone)"/"Unknown"); **Decisions Made**. Empty sections omitted.
- **Language:** follows the dominant spoken language; some headings ("Flow Summary", "Action Items") and speaker labels stay English.
- **Speaker chips:** "Speaker 2" mentions become chips with names (not ranges like "Speakers 1–3").
- **Editing:** click to edit after generation. **Add summary** regenerates a deleted summary.
- **Update Summary** (after resuming and recording new audio): regenerates from the full recording; ⚠️ **replaces your summary edits**. Not offered for imports or when audio is gone.
- Copy: summary copy action / Cmd/Ctrl+C ("Copied summary."); **Copy as Markdown** for full meeting.
- Messages: "The meeting was too short to summarize." (≤50 words per #21); "No transcript or audio available for a summary"; "We hit a snag processing your meeting" (**Retry processing**); "We couldn't process your meeting" (no retry); "Update failed. Showing the previous summary."; "Servers are busy. Flow will retry at {time}."
- **Report an issue:** hub ⋯ → **Report** → "Report This Note" → Issue type (**Summary quality**, **Missing data or stuck processing**, **Speaker labels**, **Notifications**, **Auto-stop**, **Other**) → "What went wrong?" → **Send feedback** → **Done**. Reports include transcript/notes/summary, not audio.

---

## The Notetaker hub

Source: [#8](https://docs.wisprflow.ai/articles/9247277218-the-notetaker-hub-your-meetings-in-one-place-beta)

| Area | What it shows / does |
|---|---|
| **Upcoming** | Next 7 days, up to 50 meetings, 3 at a time; **Show more** / **Show less**; refresh icon / **Sync** |
| **Up Next** | Imminent/in-progress meetings; overlaps stack with a **Conflict** label |
| Row actions | **Join + Start**, **Start**, **Join meeting**, **…** (per-meeting settings), **Open Note** / **Switch** while recording |
| **Past notes** | Finished meetings; **View more** loads older |
| **Shared with me** / **My notes** | Shared notes (read-only) / your notes |
| Ask bar | Ask Wispr across meetings (appears after first recording) |
| Search | Header search button (no filters described) |
| Banners | Remaining weekly notes + reset date; auto-start offer |

- No calendar: "No meetings found" + **Connect calendar**.
- Per-meeting **…** settings: **Auto-share notes with** (No one / your domain / All attendees) and **Calendar** (Off / Notice only / Include link); **Change default settings**.
- Processing progress shows upload → transcript → summary → "Your notes are ready." **Retry** limited to once per 15 s.
- Folders: hub folder list → **⋯** → **Edit folder** (see Sharing).

---

## Calendar integration and reminders

Sources: [#3](https://docs.wisprflow.ai/articles/8955305188-meeting-detection-reminders-and-calendar-in-notetaker-beta), [#20](https://docs.wisprflow.ai/articles/9962971864-connectors-in-wispr-flow-connect-disconnect-and-organization-blocked-connectors), [#24](https://docs.wisprflow.ai/articles/4497184932-notetaker-privacy-and-security-overview)

- **Supported:** Google Calendar, Outlook Calendar (if offered and org-allowed). Both can be connected; **one account per provider**. **iCloud not supported** ("coming soon").
- **Connect:** Settings → **Connectors** → **Connect** → browser sign-in → grant permissions (Google: **Select all**) → "You're all set" → **Open Wispr Flow**. Also via Flow Bar caret → **Connect calendar**, or hub.
- Other connector: **Slack** (adds context to summaries and briefs).
- **Reminders** (per device): **Notify before scheduled meetings start** — **Right before the meeting** (15 s, default), **1 minute before**, **2 minutes before**, **Never**. Never more than 60 s early; disappear 5 min after start; none for declined events. **Snooze for 2 min** in caret menu.
- Upcoming excludes events without invitees, all-day events, events > 6 hours.
- Calendar data collected: titles, times, conference links, colors, recurrence, attendees, descriptions; Google also stores attendee names/photos (#24).
- **Disconnect:** Connectors → **…** (**Connector actions**) → **Disconnect** → confirm. ⚠️ Removes calendar events not linked to saved notes (no warning shown in the dialog). Linked notes keep details. May need to revoke manually in Google account.
- Errors: "Finish connecting", "Ask your admin", "This account can't be connected", "Disconnect … first", "Additional calendar connections aren't available yet", "Connection cancelled", "Couldn't load connectors. Check your connection.", "{connector} connection timed out".
- Org-blocked connectors: hidden if not connected; if connected, row shows "Connected, but unavailable because your organization turned off this connector." with only **Disconnect**. Changes take up to ~45 min.

---

## Asking questions about meetings (Ask Wispr / Ask anything)

Source: [#12](https://docs.wisprflow.ai/articles/5694642921-ask-wispr-chat-with-your-meetings-and-notes-beta), [#6](https://docs.wisprflow.ai/articles/9406970664-meeting-notes-and-the-editor-in-notetaker-beta)

| Where | Scope |
|---|---|
| Meeting note **Ask anything** field (bottom) | That meeting's transcript, notes and earlier chat first; goes beyond only for another meeting/date, public-world questions, or missing answers |
| Hub Ask bar ("Ask Wispr about your meetings") → Ask Wispr page | All your meeting notes + shared notes; "Ask a follow-up about your meetings" |

- Send: Enter or Cmd/Ctrl+Enter; Shift+Enter = new line. Hub: **Submit query**; page: **Submit**. Meeting field has no send button. Works during or after a meeting.
- Ask bar appears only after you've recorded a meeting.
- Up to **5** clickable meeting sources + inline citations. Answers ~**250 words** unless asked for more. Can use **web search** for public-world questions. Date queries use local time; weeks Mon–Sun; up to 1,000 matches.
- Examples: "what meetings did I have yesterday", "my meetings with alex@acme.com on Monday", "what's on my calendar today".
- **Edits:** Only on explicit request (e.g., "Update my notes with the budget decision") — edits notes, summary or title (≤120 chars); no confirmation step; can't edit transcripts or shared notes.
- Shared notes: paste a shared meeting link; access follows your permissions.
- Chat management: **New chat**, **Past chats**, **Switch chat**, **History**, **Load more**, **Stop processing** ("[Request stopped]"), **Chat actions** → **Delete**, **Copy response**.
- Errors: "Chat request failed. Please try again.", "No response from assistant.", "Could not get a response. Try again.", "Could not load chat history." (**Retry**).

---

## Sharing meeting notes

Sources: [#13](https://docs.wisprflow.ai/articles/5073796184-sharing-meeting-notes-from-notetaker-beta), [#14](https://docs.wisprflow.ai/articles/9319084321-notetaker-settings-explained-beta), [#18](https://docs.wisprflow.ai/articles/9941500749-enabling-notetaker-for-your-organization-enterprise-admins), [#24](https://docs.wisprflow.ai/articles/4497184932-notetaker-privacy-and-security-overview)

Requires Private Cloud Sync on; domain-wide sharing requires enterprise.

**Share by link / invite:** notepad header **Share** → **Share notes** → **Search people or emails** → **Visibility** → **Copy link** ("Summary link copied.").

| | Link | Email invite |
|---|---|---|
| Content | **Summary only** | Notes + summary; transcript if owner's org allows ("Summary and Transcript by default") |
| Who | Per Visibility | Named recipients |
| Delivery | You paste it | Flow emails (may include summary preview — can't be retracted) |

- **Visibility:** **Only people invited**, **Anyone with the link** (default for new/unconfigured shares), **Everyone at {domain} with the link**.
- Recipients are read-only; **My thoughts** is never shared.
- **Revoke:** remove under **Shared with** (immediate, no email). Full revocation invalidates the link.
- **Auto-share** (Settings → Notetaker → Sharing): **Auto-share notes** — **No one** / **All attendees** / **@your-domain attendees**; shares after the meeting ends and summary is ready. Per-meeting override in the hub **…** menu. **Default for Notetaker links**: Private / Shared with team / Anyone with the link.
- **Shared folders:** single role **Contributor**; filing a note into a shared folder shares it; **Add to shared folder**, **Create new folder**, **Add all participants**; **Edit folder** (up to 50 emails at a time).
- **Copy as Markdown** (⋯ menu): title, meeting info/attendees, **your private notes**, summary, chat, transcript. ⚠️ Includes private notes — review before sending.
- **Org controls:** **Note sharing** = Disabled / Internal only / Internal and external / Public links (default); **Shared note content** = Notes and transcript (default) / Notes only. Disabled → "Your organization has turned off note sharing."

---

## MCP access for Claude, ChatGPT, Gemini, Cursor

Source: [#15](https://docs.wisprflow.ai/articles/5166327995-switching-to-wispr-flow-keep-all-your-notetakers-in-one-place-mcp)

- Wispr Flow's MCP connector lets an AI tool **read/search** your meetings. Requires Notetaker enabled; page hidden if MCP blocked by org.
- Sign-in must be **Google, Apple, Microsoft, or enterprise SSO** (email/password can't authorize). AI tool must be on a **paid plan** supporting custom connectors. No API keys needed.
- **In-app:** Settings → **MCP** → **Add to Claude** / **Add to ChatGPT** / **Add to Gemini** / **Add to Cursor** → approve in browser → refresh cards. Shortcut: notepad **⋯** → **Connect to your AI tools**. Existing: **⋯ → Reconnect**.
- **Manual server URL:** `https://api.wisprflow.ai/connect/mcp` (no trailing slash).
- **Claude manual:** Settings → Connectors → **+** → **Add custom connector** → paste URL → **Add** → **Connect** → sign in. In chat: **+** → **Connectors** → toggle Wispr Flow on.
- ChatGPT: plugin link; OpenAI clients incl. Codex appear on the ChatGPT card. Gemini: opens Gemini apps. Cursor: marketplace listing.
- **Exposed:** notes, summaries, pre-read briefs, action items, transcripts (on request), Scratchpad notes, Google/Microsoft calendar events, participants + emails, notes shared to you, account info, folder names. **Not exposed:** dictation history.
- ⚠️ Consent grants read access to **every meeting** on the account; no per-meeting/time-range scoping. Enterprise reads are audit-logged.
- Disconnect from the AI tool side (Flow cards can't disconnect).
- Meetings recorded while Cloud Sync was off are never available via MCP. Refusals: Cloud Sync off; HIPAA BAA; MCP disabled by org; Scratchpad disabled by org.
- Use case: keep Granola/Otter/Fireflies MCP connected alongside Wispr to search both, then retire the old one.

---

## Importing from Granola or Otter

Source: [#25](https://docs.wisprflow.ai/articles/4484290718-import-your-past-meetings-from-granola-or-otter-into-notetaker)

- File-based (no account link). Granola: Settings → Profile → generate CSV (.csv/.zip, emailed). Otter: My Notes → bulk export **TXT** with speaker names + timestamps (ZIP).
- Flow: Settings → Notetaker (or **My notes** tab) → **Import** on "Import your meeting notes" → **Granola** / **Otter** → drop file → wait for "Upload complete!".
- Limits: Granola 50 MB / 5,000 rows / ZIP ≤512 entries, ≤64 CSVs. Otter 50 MB zipped / 200 MB unpacked / ≤8,192 files; transcript ≤8 MB, 50,000 lines.
- Imported: titles, dates, summaries ("Summary (Granola AI)" / "Summary (Otter AI)"), Granola notes, transcripts (Otter keeps speakers/timestamps). **Not imported:** audio, calendar links, attendees. No **Update Summary** for imports. Imports don't count toward quota.
- ⚠️ Imports sync to Wispr cloud even if Dictation cloud storage is off (blocked only by HIPAA BAA).
- **Cancel** → **Yes, cancel** / **Go back**; **Import again**; re-importing doesn't duplicate.

---

## Offline recording

Source: [#21](https://docs.wisprflow.ai/articles/5810080970-offline-meeting-recording-in-notetaker)

- Starting offline with Live Transcript on: **Live transcript unavailable** card → **Record offline** / **Cancel**.
- Drop mid-meeting: "You're offline. Don't worry, we're still recording!" Long outages add "Offline for <duration> — audio was captured and will be transcribed after the meeting." Live translation unavailable offline.
- After reconnecting: "Waiting for a connection" → auto-upload, or **Retry** (once / 15 s). Offline-started meetings process automatically even if < 5 min.
- Limits: audio files > **500 MB** can't upload. Requires local storage ("Storage Full" → **Restart Flow** / **Contact us**) and Notetaker cloud sync.

---

## Multiple languages and live translation

Source: [#23](https://docs.wisprflow.ai/articles/3512887047-use-notetaker-with-multiple-languages)

- **22 languages**, auto-detected (no per-meeting selection): Arabic, Bengali, Chinese (incl. Cantonese), Czech, Danish, Dutch, English, French, German, Hindi, Hinglish, Italian, Japanese, Korean, Marathi, Polish, Portuguese, Russian, Spanish, Swedish, Turkish, Urdu.
- Settings → General → Languages affects dictation only.
- Unsupported languages still transcribe with more errors; warning "This sounds like a language we don't support yet" (**Learn more** / **Got it**), at most once per meeting.
- **Live translation (Beta):** Transcript tab → translate button ("Translate transcript", **Beta** pill) → choose language. Failure: "Translation unavailable". Offline: unavailable.

---

## Consent and the recording notice

Sources: [#22](https://docs.wisprflow.ai/articles/3808660402-the-meeting-recording-consent-notice-how-it-s-posted-and-how-admins-control-it), [#1](https://docs.wisprflow.ai/articles/3665250541-getting-started-with-notetaker-beta), [#24](https://docs.wisprflow.ai/articles/4497184932-notetaker-privacy-and-security-overview)

- "Always get consent when transcribing others." User/org is responsible; Wispr's confirmation asks *you*, not participants.
- **Meeting-chat notice:** Flow can auto-post a notice into supported meeting apps' chat (Meet in Chrome on Mac, Zoom, Teams, Slack). Default English text begins "Hi everyone — quick note that I'm using Wispr Notetaker…"; customizable up to **450 chars**; **Reset to default**. Waits for admission from waiting rooms.
- **Manual fallback dialog** (can't be dismissed with Esc): **Copy consent message** → paste → send → **Done**. ⚠️ **Quit and discard meeting** → "Discard this meeting?" permanently deletes it.
- **Calendar notice** (Google only; Outlook not yet): **Calendar notice** = Off / **Notice only** / **Notice and notes link** (per meeting: Off / Notice only / Include link).
- Org may require **Obtain consent to start Notetaker** → **Consent obtained**.
- Org settings (Locked on / Explicitly off / No org=On) control who owns the notice switch.
- Withdrawing consent: delete the whole meeting (no segment-level deletion).

---

## Retention and deletion

Sources: [#11](https://docs.wisprflow.ai/articles/1761520520-transcript-retention-syncing-and-deleting-meetings-in-notetaker-beta), [#24](https://docs.wisprflow.ai/articles/4497184932-notetaker-privacy-and-security-overview), [#16](https://docs.wisprflow.ai/articles/6858284702-notetaker-for-enterprise-faq)

| Data | Default retention | Configurable? |
|---|---|---|
| Transcript | **Never delete** | Settings → Data and Privacy → **Notetaker transcript retention**: Never delete, 1, 7, 30, 90, 180, 365 days |
| Uploaded audio | Deleted **7 days after upload** | No (may be sooner) |
| Local audio | ~**7 days** by default | Varies by account |
| Title, notes, Flow Summary, tasks | Until you delete the meeting | Not affected by transcript retention |

- Shortening retention prompts **Auto-delete older transcripts?** → deletion within 24 h, irreversible → "Retention updated." Deleted transcript shows "Transcript deleted based on your retention settings policy." Resume becomes impossible.
- Growth/Enterprise admins can set an org-wide window that locks member choice (admin.wisprflow.ai; "Are you absolutely sure?" → **Yes, continue**).
- **Delete meeting:** **…** → delete → confirm ("Delete meeting?"). Permanent across devices: notes, summary, transcript, audio, speaker data; ends shared access. Error: "Couldn't delete the meeting. Please try again."
- Export first via **Copy as Markdown** (#11 calls it "Copy to Markdown").
- Enterprise admins can request org-scoped deletion/redaction of a member's data (audited, via support ticket).

---

## Settings reference (Settings → Notetaker)

Source: [#14](https://docs.wisprflow.ai/articles/9319084321-notetaker-settings-explained-beta)

| Section | Setting | Default | Options |
|---|---|---|---|
| Meeting detection | **Notify before scheduled meetings start** | Right before the meeting (15 s) | Right before / 1 min / 2 min / Never |
| Meeting detection | **Show your next meeting in the menu bar** (Mac) | On | On/Off |
| Meeting detection | **Automatically detect any call** | On | On/Off |
| Meeting detection | **Start Notetaker automatically** | Off | On/Off |
| Meeting detection | **Maximum recording length** | 2 hours | 30 min / 1 h / 2 h / 3 h |
| Meeting detection | **Stop Notetaker when a call ends** | On | On/Off |
| While active | **Don't show Notepad and Flow Bar in screen capture** | Off | On/Off |
| Notepad | **Open Notepad when starting Notetaker** | On | On/Off |
| Notepad | **Split the screen when joining** | Off | On/Off |
| Notepad | **Triple tap <your dictation key> for Notetaker** | On | On/Off (per device) |
| Notepad | **Keyboard shortcut** | Mac Option+M; Win Win+Alt+M | **Change shortcut** |
| Transcript | **Show live transcript** | On | On/Off |
| Consent | **Calendar notice** | Off | Off / Notice only / Notice and notes link |
| Sharing | **Default for Notetaker links** | none shown | Private / Shared with team / Anyone with the link |
| Sharing | **Auto-share notes** | Off | No one / All attendees / @your-domain attendees |
| Sharing | Meeting scope picker | All meetings | All meetings / Meetings with a calendar notice |

Related (Settings → Data & Privacy): **Notetaker transcript retention**, **Improve the model for everyone** (on for Free/Pro, off for Enterprise), **Dictation cloud storage** (does not control Notetaker storage), **Local data storage** (dictation only). Settings → **Connectors**, Settings → **MCP**.

---

## Privacy, security, and compliance

Sources: [#24](https://docs.wisprflow.ai/articles/4497184932-notetaker-privacy-and-security-overview), [#16](https://docs.wisprflow.ai/articles/6858284702-notetaker-for-enterprise-faq), [#18](https://docs.wisprflow.ai/articles/9941500749-enabling-notetaker-for-your-organization-enterprise-admins)

- Encryption in transit and at rest; managed, rotated keys; least-privilege RBAC with MFA internally.
- DPA with EU SCCs; UK Addendum available; third-party AI subprocessors.
- **Training:** customer content not used unless you/your org opt in (**Improve the model for everyone**). Off for everyone on Growth/Enterprise.
- **Certifications:** SOC 2 Type I & II (under NDA), ISO/IEC 27001:2022 — ⚠️ but Notetaker **launched after these audits and wasn't assessed** (#16). Docs via Wispr Trust Center.
- **HIPAA:** Notetaker is **not HIPAA-compatible**. A signed personal or org BAA blocks recording/sharing/MCP. Enabling Notetaker with an org BAA prompts "Enabling Notetaker will revoke your BAA." Messages: **Revoke your BAA to use Notetaker** (**Open Settings**), **Unlock Notetaker for your team** (**Open Admin Portal**), **Notetaker is unavailable** (**Got it**).
- Notetaker data can go to Wispr cloud even if dictation cloud storage is off (except with a BAA).

---

## Enterprise admin controls

Sources: [#18](https://docs.wisprflow.ai/articles/9941500749-enabling-notetaker-for-your-organization-enterprise-admins), [#16](https://docs.wisprflow.ai/articles/6858284702-notetaker-for-enterprise-faq), [#26](https://docs.wisprflow.ai/articles/2670317558-restricting-notetaker-by-domain-the-blocked-domains-setting)

- Admin portal **admin.wisprflow.ai** → Settings → Organization → **Notetaker** dropdown: **Enabled for everyone** / **Disabled for everyone** / "Auto-enables Sept 30" (auto-enable on **Sept 30, 2026**; **Enable Notetaker now**). Requires accepting MSA/DPA and cloud-storage terms. Disabling blocks meetings created after; earlier ones remain. Changes take up to ~5 min; members may need to quit/reopen.
- "This setting is managed by Wispr" = locked; contact account team / enterprise@wispr.ai.
- Growth purchase free-Notetaker offer: **Skip** disables Notetaker org-wide.
- Other controls: **Note sharing**, **Shared note content**, transcript retention, consent requirement, connector blocking, MCP blocking, "Enforce zero data retention" (Enterprise).
- **Blocked domains** (Enterprise): card → **Add domains** / **Configure** → "Edit blocked domains"; entries like `*@lawfirm.com` or `alex@wispr.ai` (plus-address variants match); max **200**; overlaps with own domains/gmail.com → "These rules also block your own members" → **Save anyway** / **Go back**. Members see "Notetaker blocked for this meeting" (they can still join). Applies only to calendar-linked meetings with attendee emails; ad-hoc recordings unaffected; in-progress recordings kept; *.calendar.google.com rooms exempt.

---

## Open questions / conflicts found in the sources

- **Paid weekly cap:** 150/week (#8) vs. up to 100/week (#16); Basic = 50/week (#1) vs. "Basic allowances vary" (#8).
- **Windows availability:** generally supported (#1–#14) vs. "only to accounts granted Windows access" (#16).
- **iOS recording:** unclear whether iOS can record; article only covers the Upcoming list.
- **Live speaker labels:** "You/Others" (#4) vs. "You/Them" (#6, #9).
- **Label variants:** "Stop Notetaker when a call ends" (#14) vs. "Stop the Notetaker when the meeting ends" (#10); "Don't show Notepad and Flow Bar in screen capture" (#14) vs. "Hide from screen shares and screenshots" (#8); "Copy as Markdown" vs. "Copy to Markdown" (#11); "Started by mistake?" offers Keep (#2, #21) vs. Save (#11).
- **On-device:** only audio capture is documented as on-device; transcription/summarization are cloud.
- **Templates:** no summary/note templates are documented.


---

# Part 4: Billing, Privacy and Transcription Accuracy

> **How this was compiled.** Fetched 2026-10-12 from the official Wispr Flow help center (https://docs.wisprflow.ai) and the pricing page (https://wisprflow.ai/pricing). All 31 articles in three collections were read in full: Transcription Accuracy & Voice Quality (6), Billing & Plans (14), Privacy, Security & Data (11). Everything below comes from those pages. Notes marked **[Uncertain]** or **[Conflict]** point to gaps or contradictions between sources. UI labels appear in **bold** exactly as the sources write them. Articles were "last updated" between 1 day and 1 month before the fetch date, so details may change.
>
> Collection index pages:
> - Transcription Accuracy & Voice Quality: https://docs.wisprflow.ai/collections/3578722149-transcription_accuracy_voice_quality
> - Billing & Plans: https://docs.wisprflow.ai/collections/9999370675-billing_plans
> - Privacy, Security & Data: https://docs.wisprflow.ai/collections/8370538680-privacy_security_data

---

## Article inventory

| Collection | Article | URL path (prefix https://docs.wisprflow.ai) |
|---|---|---|
| Accuracy | What to expect from Flow: accuracy and known limitations | /articles/4048537120-what-to-expect-from-flow-accuracy-and-known-limitations |
| Accuracy | Flow is transcribing in the wrong language | /articles/5899191431-flow-is-transcribing-in-the-wrong-language |
| Accuracy | Transcription suddenly got worse or feels less accurate | /articles/6901148133-transcription-suddenly-got-worse-or-feels-less-accurate |
| Accuracy | Voice Profile updates | /articles/7470830521-voice-profile-updates-when-the-update-your-voice-profile-notification-appears |
| Accuracy | How Do I Bulk Import Dictionary Items and Snippets? | /articles/8955301725-how-do-i-bulk-import-for-dictionary-and-snippets |
| Accuracy | Using Wispr Flow Discreetly: Microphone Guide | /articles/9192039587-using-wispr-flow-discreetly-microphone-guide |
| Billing | Request a Flow discount or fix student pricing | /articles/1128761434-flow-discounts |
| Billing | CRED Promotion: 10 months of Flow Pro free | /articles/2118965632-cred-promotion-10-months-of-flow-pro-free |
| Billing | Manage users and billing in the Admin Portal | /articles/2277907847-how-do-i-use-the-admin-portal-to-manage-users-and-billing |
| Billing | Review team insights and export usage | /articles/2356896572-admin-usage-v2-team-members-table-and-words-dictated-csv-export |
| Billing | What happens if my Wispr Flow payment fails | /articles/3007009160-what-happens-if-my-wispr-flow-payment-fails |
| Billing | Manage billing, invoices and cancellation | /articles/4152811715-manage-your-billing-invoices-company-details-payment-method-and-cancellation |
| Billing | Free tier weekly word cap and bonus words | /articles/4760791189-free-tier-weekly-word-cap-and-bonus-words-remove-desktop-trial-experiment |
| Billing | Manage Cost Centers in Flow Enterprise | /articles/4847290936-manage-cost-centers-in-flow-enterprise |
| Billing | How to leave a team or enterprise, and what happens to your Flow Pro | /articles/5721680825-i-was-automatically-added-to-a-team-leaving-a-team-or-enterprise-and-your-personal-flow-pro |
| Billing | VAT, GST & tax on Wispr Flow invoices | /articles/6671605687-vat-gst-tax-on-wispr-flow-invoices |
| Billing | Trial End Value Summary in Wispr Flow | /articles/7140488640-trial-end-value-summary-in-wispr-flow |
| Billing | Manage your Flow account | /articles/7339517111-manage-your-flow-account |
| Billing | Zepto Promotion: 3 months of Flow Pro free | /articles/8790474037-zepto-promotion-3-months-of-flow-pro-free |
| Billing | Flow plans and what's included | /articles/9559327591-flow-plans-and-what-s-included |
| Privacy | Audit Logs for Enterprise admins | /articles/1282257172-audit-logs-for-enterprise-admins-track-team-membership-and-join-request-activity |
| Privacy | Configure your network for Wispr Flow | /articles/2021284475-configure-your-network-for-wispr-flow |
| Privacy | Vendor security assessments, questionnaires, and security calls | /articles/2941320990-vendor-security-assessments-and-questionnaires |
| Privacy | Security and privacy overview (Security and compliance FAQ) | /articles/3467817258-security-and-compliance-faq |
| Privacy | HIPAA Compliance & Healthcare Use | /articles/4218718535-hipaa-compliance-healthcare-use |
| Privacy | Context Awareness | /articles/4678293671-feature-context-awareness |
| Privacy | Requesting a Data Processing Addendum (DPA) | /articles/4712082205-requesting-a-data-processing-addendum-dpa |
| Privacy | Restrict org-wide snippet and dictionary sharing | /articles/7133384604-restrict-org-wide-snippet-and-dictionary-sharing-snippet-sharing-policy |
| Privacy | Data requests: get a copy of your data or ask us to delete it | /articles/8254696706-data-requests-get-a-copy-of-your-data-or-ask-us-to-delete-it |
| Privacy | Manage data sharing, cloud storage and local history | /articles/9609615338-private-cloud-sync-and-data-sharing-preferences-in-wispr-flow |
| Privacy | How to Revoke a HIPAA/BAA Agreement | /articles/9642648659-how-to-revoke-a-hipaa-baa-agreement |

---

### Part A: Plans and Billing

## Current plans and pricing (pricing page + plans article)

Sources: https://wisprflow.ai/pricing and https://docs.wisprflow.ai/articles/9559327591-flow-plans-and-what-s-included

### Price table (USD list prices)

| Plan | Monthly billing | Annual billing | Who it's for |
|---|---|---|---|
| **Free** | $0 | $0 | Individuals |
| **Pro** | $15 /user/mo | $12 /user/mo equivalent ($144/user/year) | Individuals and teams ("Our most popular plan") |
| **Student** | Paid Student: $7.50/month | Paid Student: $72/year; free Student plan: $0/year for eligible accounts | Eligible students |
| **Growth**, Dictation only | $23 /user/mo | $18 /user/mo equivalent ($216/user/year) | Teams ("Basic admin controls") |
| **Growth**, Dictation + Notetaker ("Unlimited Notetaker access") | $33 /user/mo | $26 /user/mo equivalent ($312/user/year) | Teams |
| **Enterprise** | Custom | Custom, "Available annually" | "Advanced security"; buy through **Talk to sales** |

- The pricing page toggle offers **Monthly** or **Annual** and labels Annual "20% discount". The plans article says "Annual USD billing saves 20% on Pro."
- **[Uncertain]** The pricing page shows two Growth prices per cycle ($18/$26 annual, $23/$33 monthly) without labels in the static HTML. The plans article confirms the lower price is Dictation only and the higher price is Dictation and Notetaker.
- **Currency:** Currency follows your connection's region and defaults to USD. Each of the **24 supported currencies** has its own fixed price list (not a USD conversion), so prices can differ between users. Existing subscribers keep their original price and currency.
- **Warning (from source):** Changing billing currency cancels your subscription with a prorated refund, then replaces it at the new currency's list price, keeping your plan, seats and discounts.
- **Limited-time offer on the pricing page:** if a team picks Dictation only, the page offers Notetaker free "through October 31": it "Won't automatically increase price after", and members move to a limited plan afterwards. Choices are **Turn on Notetaker** or **Keep Notetaker disabled**. **[Uncertain]** The page doesn't say which year. The fetch date was 2026-10-12, so it most likely means October 31, 2026.

### Features by plan (pricing page cards)

| Free: "Includes" | Pro: "Everything in Free, plus" | Growth: "Everything in Pro, plus" | Enterprise: "Everything in Growth, plus" |
|---|---|---|---|
| Speech-to-text in any app, 100+ languages | Unlimited dictations | Single sign-on (SSO) with SAML | Free IT admin seats |
| Dictation on Mac, Windows, iOS, and Android | Longer Notetaker history | Org-wide HIPAA enforcement with a signed BAA | Model training locked off |
| Learns your names and jargon | Shared dictionary and snippets | Multiple domains for one organization | User provisioning (SCIM) |
| Dictionary and snippets | Shared team workspace | Admin control over model training for your whole team | Audit logs and managed deployment (MDM) |
| Limited Notetaker access | Centralized billing and user management | Individual usage reporting | Domain capture |
| Use your meeting notes in Claude and ChatGPT | Team usage analytics | Admin tools for members, departments, and billing | Custom contract terms |
| | Priority support | (Notetaker bundle option: Unlimited Notetaker access) | Invoicing and PO billing |
| | Early access to new features | | Dedicated support with SLAs (monthly view) / Premium support (annual view) |

### Comparison-table details (pricing page)

| Row | Free | Pro | Growth | Enterprise |
|---|---|---|---|---|
| Word limit | 2,000/week on desktop; 1,000/week on mobile | Unlimited | Unlimited | Unlimited |
| Notetaker meetings | Weekly limit | Higher limits | Unlimited (add-on) | Unlimited (add-on) |
| Customer support | Standard | Priority | Priority | Premium |
| Team usage dashboards | – | Basic | Advanced | Advanced |

**[Uncertain]** The page draws other comparison rows with checkmark images, and the scraped HTML only kept the "–" dashes. The column mapping below is inferred from dash counts:
- Enterprise only (shown as three dashes): Invoicing and PO billing; Customer success manager; User provisioning (SCIM); Audit logs and managed deployment (MDM); **Models never trained on your data**; **Block dictation in chosen apps**; Domain capture; Free IT admin seats.
- Growth and Enterprise only: SSO / SAML; Security & data controls; MSA & DPA (Enterprise listed as "Custom terms").
- Pro and above: Centralized billing; Shared dictionary and snippets; Admin controls; Prioritized feature requests; Early access to new features.
- All plans: Data-sharing preferences and data storage/retention controls ("(Enforced)" on one tier, presumably Enterprise); ISO 27001 and SOC 2 Type II Compliance; HIPAA-ready ("(Enforced)" on two tiers, presumably Growth and Enterprise).

Pricing page security banner: "SOC 2 Type II and ISO 27001 certified. HIPAA-ready dictation with a signed BAA. Notetaker and Scratchpad are disabled on BAA accounts. Opt out of model training at any time. Choose what stays on your device, and delete it whenever you want. Enterprise adds organization-wide enforcement, so admins set these policies once for everyone."

### Plans article summary (help center)

| Plan | What's included (help center wording) |
|---|---|
| **Free** | Limited dictation in any language and app; learns names and jargon; calendar and Slack connections; HIPAA-ready handling and training opt-out. |
| **Pro** | Everything in Free plus unlimited dictation, Notetaker meetings kept longer, early feature access, priority support, centralized billing and user management. |
| **Student** | Unlimited access, with everything in Pro. |
| **Growth** | Everything in Pro, plus SAML SSO and multiple email domains. An admin buys it self-serve in the admin portal. |
| **Enterprise** | Everything in Growth, plus free IT Admin seats, separate billing units, premium support and a dedicated customer success manager. |

- **Notetaker cap:** Pro, Growth and Enterprise can record up to **150 Notetaker meetings per week**. The Plan page on desktop, iOS and Android shows how many remain, and the count resets weekly.
- **Pricing FAQ (Free):** Free includes dictation and the Notetaker (speaker identification, ask questions across meetings, MCP access) with a weekly meeting limit. Quick recordings under five minutes don't count toward that limit. Notetaker runs on Mac and Windows only, and it doesn't use a bot to join calls.

### Growth vs Enterprise (help center)

**Included with both:** Unlimited dictation, centralized billing and user management, SAML SSO set up by an admin in the admin portal, multiple email domains in one organization (support attaches them without DNS verification), automatic addition by domain (on by default), and a standard HIPAA-ready BAA.

| Capability | Growth | Enterprise |
|---|---|---|
| Purchasing and contracts | Self-serve under the standard Wispr MSA and DPA, with no redlines | Sales-led, with custom MSA/DPA review and SLA options; no self-serve purchase |
| Billing | Card only, monthly or annual; no platform fee or volume discounts | Invoice or PO billing at negotiated rates |
| Identity management | SAML SSO and multiple domains | Same, set up with your sales and support contacts |
| Storage and retention | No admin-enforced policies; individual settings and BAA restrictions still apply | Admin controls for dictation cloud storage and Notetaker transcript retention |
| Security and deployment | No MDM deployment | Includes MDM deployment |
| Roles and billing units | Member and Admin roles; one billing unit | Adds free IT Admin seats and separate billing units (cost centers) |
| Support | Priority support, no dedicated CSM | Premium support and a dedicated CSM |

- New Enterprise agreements are billed annually. Existing monthly Enterprise accounts keep their agreed cadence.
- IT Admin seats are management-only and include no product access.
- Growth includes Notetaker in its bundle. Enterprise offers Dictation, Notetaker or both by agreement.
- Buying Growth means accepting the **Master Services Agreement (MSA)** and **Data Processing Addendum (DPA)** through a checkbox at checkout. Pro purchases use the Terms of Service only.

## Where to buy and manage a plan

Sources: https://docs.wisprflow.ai/articles/9559327591-flow-plans-and-what-s-included, https://docs.wisprflow.ai/articles/4152811715-manage-your-billing-invoices-company-details-payment-method-and-cancellation, https://docs.wisprflow.ai/articles/7339517111-manage-your-flow-account

| Purchase source | Where to manage it |
|---|---|
| **Individual Pro (desktop/web, Stripe card)** | Desktop **Settings → Plans and Billing → Manage subscription** opens Stripe's billing portal |
| **Team, Growth or Enterprise** | **Manage billing** opens the admin portal's Billing page (https://admin.wisprflow.ai/app/settings/billing) |
| **Apple App Store** | iPhone **Settings → your name → Subscriptions → Wispr Flow**. On iOS, Flow's **Cancel** or **Resubscribe** opens Apple's sheet |
| **Google Play** | Play Store → profile → **Payments & subscriptions → Subscriptions → Wispr Flow** |
| **Promotional or other mobile subscription** | Contact support |

- Pro Monthly and Pro Annual are sold on desktop (card), iOS (App Store) and Android (Google Play). iOS also offers **weekly Pro**.
- For store-billed subscriptions, desktop shows **You can manage subscription via Apple**, even for Google Play purchases. Use the store that actually bills you.
- On iOS, **Go to the desktop app to manage plan** is informational text and doesn't respond to taps. Manage Stripe, Team, Growth and Enterprise plans on desktop.
- Android: **Account → Manage plan** opens **Plans**. Play-billed plans show **Cancel plan**, which becomes **Resubscribe on Google Play** after cancellation. If you also have a live Play subscription next to a team or desktop plan, **Manage your Google Play subscription** appears so you can cancel the duplicate charge.
- Android restore: use **Restore purchases** on the Plan page. The payment-fails article says restore sits inside the purchase screen, reached through **Explore plan**.
- To refresh plan status on desktop, select the circular-arrow control beside the Plans and Billing title (tooltip **Click to refresh**) and wait 10 seconds between attempts. Success reads "Your plan is up to date with your account."
- Upgrades on Stripe card plans take effect immediately. Downgrades take effect at the end of the billing period. Switching or upgrading a Stripe plan clears any scheduled cancellation.

## Free tier limits, trials and bonus words

Sources: https://docs.wisprflow.ai/articles/4760791189-free-tier-weekly-word-cap-and-bonus-words-remove-desktop-trial-experiment, https://docs.wisprflow.ai/articles/7140488640-trial-end-value-summary-in-wispr-flow, https://docs.wisprflow.ai/articles/3007009160-what-happens-if-my-wispr-flow-payment-fails

### Weekly word limits on Flow Free

| Platform | Limits | What you see |
|---|---|---|
| **Mac and Windows** | 2,000 words/week. An active 8,000-word bonus raises it to 10,000 until the bonus expires | Home card such as "150 words left". At the cap: "0 words left" and "You've hit your weekly dictation limit. Resets Sunday, 12 a.m. PT." Flow bar: "Weekly dictation limit reached" (shown at most once daily). Buttons: **Upgrade to Pro**, **Get Flow Pro**, **Upgrade** |
| **iOS** | Warning card at 200 or fewer words left. Soft limit at 1,000 words (dictation **slows down**). Hard cap at 1,500 words (blocks **Start Flow**) | "Dictation limit reached" card, **Get unlimited access** button. A one-time 5,000-word bonus can raise both limits to 6,000 for seven days |
| **Android** | Warning at 800, soft limit at 1,000, hard cap at 1,500 | "You're approaching your weekly free limit", "You have reached your weekly limit", "No words remaining". **Get unlimited words** button. A 1,500-word bonus moves the thresholds to 2,300/2,500/3,000 |

- iOS and Android share one mobile word pool. Desktop has its own allowance. The desktop limit doesn't apply to Notetaker.
- Restarting the app doesn't reset usage, and unused words don't carry over.
- **[Conflict] Reset time:** The word-cap, trial and plans articles say the reset is **Sunday 12 a.m. PT**. The payment-fails article says "Usage resets Sunday at 23:45 UTC; the new week begins at 23:46 UTC, not midnight Pacific as some desktop copy states." The trial article also says Android resets Sundays at 23:45 UTC.
- **[Conflict] Mobile limit:** The pricing page says "1,000/week on mobile". The help center describes 1,000 as a soft limit where dictation slows down, with the hard block at 1,500.

### Trials

- The **standard trial is 14 days**. Custom-length trials show their real length, for example "6 of 319 days used in trial".
- Trial eligibility is set at your **first desktop login**. A desktop trial requires no previous desktop or mobile trial. An iOS trial requires no previous mobile trial.
- **Android offers no new free trial.** New unsubscribed accounts start on Flow Free.
- Accounts that get no trial: eligible free-student accounts, teams that disable trials or already have an active subscription, non-billable IT Admin roles, and accounts assigned no default trial.
- When a Pro trial ends, the account moves to Flow Free and the weekly cap applies immediately. iOS shows a Trial Ended screen with **Keep unlimited access**. The plans article says "When a trial ends, access reverts after a 3-day grace period." **[Uncertain]** The two statements don't fit together cleanly. The grace period may only apply in some contexts, such as teams.
- Desktop trial cards:
  - Individual: "Trial ends in N day(s)" with **Upgrade to Pro**.
  - Team with billing info: "Full access now. You'll join your team's paid plan when your trial ends." The countdown is prefixed "Growth Trial ends in" or "Enterprise Trial ends in".
  - Team without billing info: **Add billing info**, which opens **Settings → Account → Plans & Billing**.
- **Team trials:** Eligible first-time team creators and joiners get a **14-day team trial**. Once you've used it, creating or rejoining a team without billing gives you **24 hours** to add billing before the team is disbanded. Without a subscription, members are removed after their trial plus a **3-day grace period**, and the team is disbanded if nobody remains.

## Student plan and discounts

Sources: https://docs.wisprflow.ai/articles/1128761434-flow-discounts, https://docs.wisprflow.ai/articles/9559327591-flow-plans-and-what-s-included, https://wisprflow.ai/pricing

### Student pricing

- **Automatic recognition:** Student status is recognized at signup from a listed university domain, a domain ending in **.edu**, or one containing **.edu.** This path has no manual verification upload.
- **Free Student plan:** Selected student accounts on Mac, Windows and iOS qualify for an "annual $0 plan, with no credit card required". There's no monthly free student plan, and the free offer skips the usual student trial.
- **Paid Student:** Other recognized students pay $7.50/month or $72/year (iOS App Store or desktop card). A Student subscription bought on one platform is honored on the others. Student plans can't be bought on Android, but Android honors them.
- The pricing page FAQ says: "Students and educators with an education email get 50% off Flow Pro. We also offer discounted Flow Pro to nonprofit organizations." **[Conflict]** The help center says an educational email alone doesn't guarantee pricing and that "every discount requires verification". $7.50 is 50% of the $15 monthly Pro price.

**Steps to claim the free Student plan (desktop):**
1. Open Flow on Mac or Windows.
2. Go to **Settings → Plans and Billing**.
3. Select **Claim student plan**, or **Claim Free Plan** / **Claim for free** in the plans grid. The card then shows "Free · renews {date}" or "Free · cancels {date}".

On iOS, **Claim for $0** only opens **Claim on desktop** instructions.

**Restrictions:**
- Active App Store Pro subscribers must cancel and wait for the subscription to expire before claiming. Pro trial users must wait for the trial to end.
- A desktop Pro subscription can switch to Student without another checkout. **Student → Pro is not supported in-app.**
- The individual student discount excludes Team, Business and Enterprise subscriptions.
- Some existing student subscriptions were moved to the free plan with prorated refunds for selected university domains.

### Other discount categories (verification required)

| Category | Example verification |
|---|---|
| Student | Current student ID, enrollment letter or equivalent proof |
| Education (not student) | Proof of educator or educational-staff eligibility |
| Non-Profit | Registered non-profit details |
| Military | Active-duty or veteran documentation |
| Senior Citizen | Age confirmation |
| Accessibility Support | Supporting documentation |

**Submit a discount request on desktop:**
1. Open **Help → Talk to support → Report an issue**.
2. Set **Request Type** to **Billing**.
3. Select your **Discount Request** category.
4. Enter a message (up to 10,000 characters).
5. Attach one PNG, JPEG, BMP or WebP image, up to 10 MB. PDFs aren't accepted here.
6. Select **Send message**, or press Cmd+Enter (Mac) / Ctrl+Enter (Windows). The confirmation reads "Feedback sent!"

**Other channels:**
- **Web, required for a PDF:** go to wisprflow.ai/support → **Get Support** → Request Type **Billing**, then attach one file.
- iOS support accepts text only. Android's Billing form has no discount-category field.
- **Share feedback** goes to the product team, not Support. The Plans and Billing **Contact us** link opens Talk to Sales.

## Promotions (CRED, Zepto, promo codes)

Sources: https://docs.wisprflow.ai/articles/2118965632-cred-promotion-10-months-of-flow-pro-free, https://docs.wisprflow.ai/articles/8790474037-zepto-promotion-3-months-of-flow-pro-free

| | CRED | Zepto |
|---|---|---|
| Offer | 10 months of Flow Pro free | 3 months of Flow Pro free |
| Where to claim | CRED offer page in a browser: **Claim your offer** → email → code → **Get Flow Pro** | Zepto offer page in a browser, same steps |
| Activation | A pending offer is attached. Pro starts only after checkout (payment details required) via **Redeem now** on the sidebar card "Claim your {duration} of Pro" | Up to **48 hours**, with no confirmation email |
| After the free period | Paid billing starts when the trial ends unless you cancel | Article says the account returns to Flow Basic with no charge, then flags that as **unconfirmed**: campaign checkout "can request payment information... and bill afterward unless canceled" |

**Rules for both:**
- One promotion per account. Promotions don't stack with other promo codes or affiliate discounts.
- The reward is tied to the email used to claim it, and there's no self-service transfer.
- Enterprise-managed, team and student accounts are ineligible.
- Active, paused, past-due or trialing subscriptions and active App Store or Play subscriptions block redemption.
- Zepto: accounts created in the iOS or Android app can't receive it.

**Enter a code in the desktop app:** **Settings → Plans and Billing → Add promo code** → **Type here** → **Apply**. Codes can be up to 80 characters and aren't case-sensitive.

| Error message | Meaning |
|---|---|
| Code not valid | Unknown or inactive code, or the campaign hasn't started |
| This offer has ended | The campaign is inactive or expired |
| This code has reached its limit | The code or campaign is used up |
| You already have a promo applied | The account already redeemed a promo |
| Promo codes can't be used on an active subscription | A subscription is active |
| Promo codes aren't available on team accounts | The account is enterprise-managed |
| Promo codes can't be used with a student plan | Student account |

## Payment failures and past-due subscriptions

Source: https://docs.wisprflow.ai/articles/3007009160-what-happens-if-my-wispr-flow-payment-fails

- A failed payment puts the subscription into a **past-due** state. Desktop keeps the paid plan name and Pro access while past due, and iOS may change the plan button to **Resubscribe**.
- Wispr emails every team or enterprise admin on the first failure, then sends a final reminder 6 days later if the bill is still unpaid. Individual subscribers don't get the first-failure email.
- Once retries are exhausted and the subscription is marked canceled, the account returns to **Free**. This isn't on a fixed day. Data, dictionary, history and settings are kept, and Pro comes back once you pay the outstanding invoice.

**Fix an individual subscription on desktop:**
1. Open **Settings → Plans and Billing**.
2. In the **Payment past due** banner, click **Update payment** to open the Payment Summary.
3. Click **Continue to Payment**, which opens Stripe.
4. Update your card and pay the outstanding invoice.
5. If the dialog stays open, click **Finished paying? Click to refresh**.

**Fix a team subscription (admins only):** **Manage billing** → admin portal → **Update Payment** / **Manage subscription** → Stripe → update the card and pay.

**Fix a Google Play subscription:** Play Store → profile → **Payments & subscriptions**.

Contact support if the plan isn't restored **24 hours** after payment. Team/Enterprise: **enterprise@wisprflow.ai**. Individuals: **support@wisprflow.ai**.

## Invoices, cancellation and refunds

Sources: https://docs.wisprflow.ai/articles/4152811715-manage-your-billing-invoices-company-details-payment-method-and-cancellation, https://docs.wisprflow.ai/articles/6671605687-vat-gst-tax-on-wispr-flow-invoices

**Invoices:**
- Open the billing portal and select a PDF under **Invoice History**.
- Apple purchases: look for Apple's receipt email or use reportaproblem.apple.com. Google Play purchases: get receipts from Google Play.
- The mobile apps have no invoice viewer.

**Payment method:**
1. Add the new card in the portal.
2. Set it as default.
3. Remove the old card.

**Cancel:**
1. Open your billing provider from the table in "Where to buy and manage a plan".
2. Complete cancellation with that provider.
3. Confirm the provider shows the cancellation and an end date.

How a completed cancellation looks:
- Desktop: **Cancels {date}**. Student plans show **Free · cancels {date}**.
- iOS: the card shows **Canceled**, then **Plan ends in N days**.
- Android: **Expires on <date>** for Play plans, or **Ends on <date>** for Stripe-billed plans.

There's no separate auto-renew switch. Access continues through the end of the period, and cancellation doesn't delete your account or data.

**Refunds (everything the sources say):**

| Situation | Refund outcome |
|---|---|
| Normal cancellation | "There is no automatic prorated refund—contact support about refund requests; Apple manages App Store refunds." |
| Deleting your account | Personal Stripe subscriptions "cancel immediately with no proration or refund". Contact support **before** deleting if you want a refund. |
| Joining a team with live billing | Your personal Stripe subscription is canceled with an "automatic prorated refund of any unused amount due". |
| Changing billing currency | Canceled with a prorated refund, then recreated at the new currency's price. |
| Disbanding an organization | All live Stripe subscriptions are canceled immediately "with no refund". |
| App Store / Google Play | Wispr can't process refunds for store purchases. |

**Warning:** Neither deleting your Flow account nor signing out cancels an App Store or Google Play subscription.

**Tax:** Wispr, Inc. is US-based and **adds no VAT/GST or sales tax**, so the checkout price is final.
- Enter your VAT/GST/ABN number in the Stripe checkout tax-ID field, or ask support to add it. It only applies to future invoices.
- Support can provide a W-9 (with EIN), which is the only tax document Wispr issues.
- Tax-exempt organizations pay the same price, since there's no tax line to remove.
- EU customers without existing active billing can request an invoice payable by bank transfer.
- PO numbers can be added to draft invoices. Adding one to a finalized unpaid invoice voids and replaces it, and paid invoices can't be revised.

## Team seats, admin portal and cost centers

Sources: https://docs.wisprflow.ai/articles/2277907847-how-do-i-use-the-admin-portal-to-manage-users-and-billing, https://docs.wisprflow.ai/articles/4847290936-manage-cost-centers-in-flow-enterprise, https://docs.wisprflow.ai/articles/2356896572-admin-usage-v2-team-members-table-and-words-dictated-csv-export, https://docs.wisprflow.ai/articles/5721680825-i-was-automatically-added-to-a-team-leaving-a-team-or-enterprise-and-your-personal-flow-pro

**Admin portal:** https://admin.wisprflow.ai

| Role | Billable? | Access |
|---|---|---|
| **Member** | Yes | Dictation only; no admin changes or billing view |
| **Admin** | Yes | Dictation plus user, billing and org-settings management |
| **Superadmin** | Yes | Org-wide admin; can't be assigned from the dropdown |
| **IT Admin** | No (free, Enterprise only) | User, billing and settings management; no dictation |

**Invite people:**
1. Open **Team → Members**.
2. Paste addresses into **Emails to add**.
3. Choose a role.
4. Click **Add**.

Invitations expire after 180 days, and a pending invitation can't be resent until you revoke it. A contractual seat cap counts billable members plus pending invites.

**Change a role:** use the role dropdown, then confirm with **Change role**. Switching someone to IT Admin removes their dictation access and their paid seat.

**Remove someone:** click the trash icon (**Remove member**) or the X on a pending invite (**Revoke invite**). A manual removal blocks that person from rejoining until they get a new direct invitation.

**Seat breakdown (Team → Show breakdown):** **Paid seats**, **Trialing**, **Invited** and **IT admin**. Removing someone frees capacity for the current period, and unused seats aren't charged next cycle unless your contract preserves contracted seats.

**Billing:** **Settings → Billing → Manage Subscription** opens Stripe, which handles payment method, invoices and cancellation. Change plans on the Billing page, not in Stripe.
- To move from Pro to Growth, use the Growth card toggle (**Dictation and Notetaker** / **Dictation only**), then **Upgrade**, and tick the MSA/DPA box.
- Organizations already on Growth can't switch Growth options in the portal. Sales-led organizations see **Talk to sales**.

**Cost centers (Enterprise only):** **Settings → Billing → Cost centers** lets you split billing and seats.
- Create one with **+ Create Cost Center** → **Break away your team** → **Continue to Stripe**. Self-service creation requires at least two teams in the current cost center.
- Organizations on negotiated contracts need sales to create a cost center.

**Usage (Insights → See team usage, or admin.wisprflow.ai/app/usage):**
- Charts: Words dictated, Active Users and Desktop Apps.
- The **Export usage data** CSV is limited to 100,000 rows.
- On Pro and legacy Team plans, everything except Words dictated is blurred sample data behind **Upgrade to Enterprise**.

**Leaving a team:**
- There's no self-serve option. An admin removes you via **Admin Portal → Usage → Team members → ⋯ More actions → Remove**. If your org uses directory sync, your IT team or Wispr support removes you.
- Joining a team with live billing cancels your personal Pro subscription with a prorated refund.
- Leaving doesn't restore your old subscription. Get removed first, then resubscribe.
- Account emails can't be changed after signup.

---

### Part B: Privacy, Security and Data

## Privacy controls (Settings → Data and Privacy)

Sources: https://docs.wisprflow.ai/articles/3467817258-security-and-compliance-faq, https://docs.wisprflow.ai/articles/9609615338-private-cloud-sync-and-data-sharing-preferences-in-wispr-flow

> **Note on "Privacy Mode":** None of these articles names a setting "Privacy Mode". The current controls are listed below. The phrase "privacy mode" appears once, in passing, in the HIPAA article ("Accounts with a BAA or privacy mode can use note cloud sync" on iOS). **[Uncertain]** It may be an older or informal name for having model improvement off.

To find these controls on desktop, open Flow from the menu bar or system tray, then go to **Settings → Data and Privacy** (in the Account section). iOS labels the section **Settings → Data & Privacy**.

| Control | What it governs | Default |
|---|---|---|
| **Improve the model for everyone** | Whether your Notetaker and dictation content may be used to improve Wispr's models (the **model training opt-out**) | **On** for Free and Pro, and shown during onboarding. **Off** for Enterprise, and admins can't turn it back on |
| **Dictation cloud storage** (iOS: **Cloud Sync**) | Whether dictation transcripts, audio and history are stored on Wispr's servers for cross-device access. Dictation only, not Notetaker or Scratchpad | On, unless restricted |
| **Context awareness** | Uses limited text from your current app to improve accuracy and formatting | On |
| **Local data storage** | How transcripts are kept on your devices: **Store data locally** (default), **Auto-delete local data every 24hrs**, **Never store data locally** | Store |
| **Download your data** | Requests an export | — |

**Facts to know:**
- These controls are independent. Changing one doesn't change the others.
- Turning off **Improve the model for everyone** doesn't stop cloud processing. Flow still uploads dictation metadata: word count, duration, app, URL, timestamp, processing delay, app version, microphone, detected language and edit statistics.
- "Wispr's third-party AI providers may not use your data to train their models, whatever your model-improvement setting."
- **Reported transcripts** (sent with **Report** or another feedback action) are retained by Wispr and can be used for training even if you opted out.
- **Warning:** The auto-delete and never-store options delete existing transcripts and polish history **across all your devices**. They ask for confirmation first (**Enable auto-delete** / **Delete all data**).
- Wispr does not sell your data.
- Signing out resets the cloud-storage preference to on, so review it after signing back in.

**What these settings don't control:**
- **Notetaker:** Transcripts and summaries are always stored in Wispr's cloud, with no opt-out. Meeting audio is kept for **7 days** after upload, then deleted.
- **Scratchpad notes (desktop):** They sync whatever the cloud-storage setting says. Only an organization disabling Scratchpad stops that sync.
- Dictionaries and snippets, account data, and diagnostics or usage statistics.

**Lock tooltips you may see:**
- "Your HIPAA agreement does not allow data to be used for model training."
- "Your organization does not allow data to be used for model training."
- "Dictation Cloud Storage is locked off because HIPAA BAA is signed."
- "This setting is managed by your organization."

**Org-level controls:**
- The admin portal shows Enterprise model training as **Off for everyone**. Teams and Pro show **Managed individually**.
- Growth admins can turn model improvement off org-wide, and back on.
- Some Enterprise portals show **Enforce zero data retention**.

## Retention, export and deletion

Sources: https://docs.wisprflow.ai/articles/8254696706-data-requests-get-a-copy-of-your-data-or-ask-us-to-delete-it, https://docs.wisprflow.ai/articles/3467817258-security-and-compliance-faq, https://docs.wisprflow.ai/articles/7339517111-manage-your-flow-account, https://docs.wisprflow.ai/articles/6901148133-transcription-suddenly-got-worse-or-feels-less-accurate

### Retention periods mentioned in the sources

| Data | Retention |
|---|---|
| Desktop dictation audio | Expires after **14 days**; transcript text remains |
| Notetaker meeting audio | **7 days** from upload, then deleted; transcripts and summaries remain |
| Data export download | Available for **30 days** |
| Deletion requests | Up to **30 days** to complete, with written confirmation |
| Audit-log streaming (SIEM) | **30 days** or **1 year** |

### Options

| What you want | What to do |
|---|---|
| Get a copy of your data | Mac/Windows: **Settings → Data and Privacy → Download your data → Request a copy**. You get a confirmation email, then a second email when the export is ready; select **Download**. The export is a single ZIP of up to 2 GB. iPhone and Android: contact support |
| Delete your account | Desktop: **Settings → Account → Delete account**, then type your exact email. iOS: **Menu → Account → Delete account**. Android has no in-app button; file **Report an issue → Account management** |
| Delete your content but keep your account | Contact support (not self-serve). This covers data up to the time of the request |
| Clear history only | Desktop **Delete all transcripts** |

- The export includes dictation history (latest version of each), meetings, Scratchpad notes and settings. It doesn't include dictations you deleted or history that was never stored in the cloud.
- **Kept after deletion:** billing and invoice records, a record of the data request, signed agreements (BAA), and organization or team contributions.
- Work accounts: your organization controls the data, so send requests to your admin.

## HIPAA and the BAA

Sources: https://docs.wisprflow.ai/articles/4218718535-hipaa-compliance-healthcare-use, https://docs.wisprflow.ai/articles/9642648659-how-to-revoke-a-hipaa-baa-agreement

**Before dictating PHI:** in **Settings → Data & Privacy**, confirm that **Improve the model for everyone** and **Dictation cloud storage** are both **Off**, and sign the applicable BAA. A signed BAA locks both settings off.

**Warnings from the source:**
- Don't include PHI in support feedback. Typed feedback isn't stripped by these settings or by a BAA.
- For sensitive environments, also turn off **Context awareness**.

**Sign an individual BAA on Mac or Windows:**
1. Open **Settings → Data & Privacy**.
2. Select **View and accept** beside **Enable HIPAA**.
3. Review the agreement.
4. Enter your legal name.
5. Select **I Agree**. The row then shows **HIPAA enabled**.

**Sign an individual BAA on iOS:**
1. Open **Settings → Data & Privacy**.
2. Tap the HIPAA row.
3. Review the agreement and enter your legal name.
4. Tap **I Agree**.

iOS has **no in-app revoke**. Android has no signing or revocation flow.

**Organization BAA:**
- Growth and Enterprise include a standard BAA, which admins sign in the admin portal's organization settings.
- Members of organizations with active billing can't sign personal BAAs.

**Download a signed copy (individuals, desktop only):** **Download signed BAA** saves **HIPAA-BAA-signed.pdf**. Its Signature Record page "is a reference record, not a legal certificate or Wispr countersignature". For a countersigned copy, contact support.

**Effects of a BAA:**
- It blocks Notetaker recording and meeting sync. The pricing page says "Notetaker and Scratchpad are disabled on BAA accounts".
- It blocks Scratchpad cross-device sync on desktop.
- Connected AI assistants (MCP) can't access Scratchpad notes.

**Revoke a personal BAA (desktop only):**
1. Open **Settings → Data and Privacy**.
2. Optionally use **Download signed BAA** first.
3. Click **Revoke BAA** beside **HIPAA enabled**. There's **no confirmation prompt**, and it takes effect immediately. Success reads "HIPAA BAA revoked successfully".

Revoking doesn't turn your sharing or cloud-storage settings back on. They stay off until you enable them. Only an eligible admin can revoke an org BAA. The BAA record is kept even after account deletion.

**Organization enforcement:**
- Growth: admins can toggle model improvement org-wide. Storage and retention stay individual settings.
- Enterprise: model improvement is enforced off. Admins can enforce cloud storage, local-history and Notetaker transcript-retention policies (**Transcript retention**).

## Compliance: SOC 2, ISO 27001, DPA and security reviews

Sources: https://docs.wisprflow.ai/articles/2941320990-vendor-security-assessments-and-questionnaires, https://docs.wisprflow.ai/articles/3467817258-security-and-compliance-faq, https://docs.wisprflow.ai/articles/4712082205-requesting-a-data-processing-addendum-dpa

**Trust Center:** https://trust.wispr.ai/
1. Click **Request Access** and enter a work email.
2. Sign the built-in NDA.
3. Read the documentation once your request is approved.

**Attestations:**
- **SOC 2 Type II** (A-LIGN): Security, Availability and Confidentiality criteria plus HIPAA/HITECH; unqualified opinion, no exceptions.
- **ISO/IEC 27001:2022** (A-LIGN).
- The earlier **SOC 2 Type I**.
- An annual third-party **penetration test**.

**Scope caveat:** Only **Wispr Flow dictation** was in scope. The Meeting **Notetaker** launched after the audit periods and was **not assessed** in either SOC 2 report or the ISO 27001 audit.

**Encryption and access:**
- Data is encrypted in transit and at rest. It is **not end-to-end encrypted**, and Wispr manages the keys (**no customer-managed keys**).
- Production access is restricted and logged, and employees need MFA.
- SAML SSO is available on Growth and Enterprise.

**Data location:** All customer data is processed and stored in the **United States**. There's no EEA or APAC regional processing and no on-premise option.

**Getting the DPA:**
- Any dashboard member on any plan can open it: sign in to the Wispr Flow dashboard, open **Privacy** in the sidebar, then click the **Data processing addendum** card (it opens in Google Drive). Billing pages link to https://wisprflow.ai/legal/dpa instead.
- The DPA includes the EU SCCs, a UK Addendum, and Annex III listing subprocessors, with **at least 10 days' notice** before a new one is added.
- Wispr doesn't provide a TIA. You complete it as the data controller.
- The **SOC 2 and HIPAA compliance** card in the dashboard requires Enterprise.

**Security questionnaires and calls:**
- Enterprise customers and prospects only, with an NDA. Use **Submit a Questionnaire** in the Trust Center.
- Pro, Pro for Teams and Growth customers should use the Trust Center documentation.

**Contacts:**
- security@wispr.ai
- enterprise@wispr.ai (legal requests)
- Vulnerability reports: use the bug bounty form, not direct email.

## Context Awareness

Source: https://docs.wisprflow.ai/articles/4678293671-feature-context-awareness

- **On by default** on Mac, Windows and iOS. iOS has no switch.
- It classifies the active app as Email, Work messaging, Personal messaging or Other, and reads nearby text and on-screen names to improve proper nouns and formatting.
- It doesn't take screenshots. Captured text is cleared when each dictation ends.
- **Excluded:**
  - Password fields. Custom or web password fields may still be read.
  - Numeric-only fields and URL bars.
  - Banking and financial apps.
- **Turn off:** **Settings → Data and Privacy → Context awareness**. When it's off, the app name and website domain are still sent. Nearby text is used only on the device, for capitalization and spacing.
- **Admin control:**
  - Enterprise admins choose **Available** or **Disable for all users**.
  - Growth admins can't enforce it.

## Enterprise admin security controls

Sources: https://docs.wisprflow.ai/articles/1282257172-audit-logs-for-enterprise-admins-track-team-membership-and-join-request-activity, https://docs.wisprflow.ai/articles/2021284475-configure-your-network-for-wispr-flow, https://docs.wisprflow.ai/articles/7133384604-restrict-org-wide-snippet-and-dictionary-sharing-snippet-sharing-policy

**Audit Logs** (admin dashboard → **Audit Logs → Events**; Admin, SuperAdmin and IT Admin roles):
- Logs membership, invite, join-request, domain, Notetaker-consent and membership-policy changes, plus note-view events.
- Filters: 7, 30 or 90 days, or a custom range under 92 days.
- **Export CSV** / **Export JSON**, up to about 10,000 events.
- SIEM streaming via **Configure streaming**, with 30-day or 1-year retention.

**IP allowlist (Enterprise, enabled by Wispr):**
1. Open the admin portal and go to **Settings → Organization → Universal controls**.
2. Turn on the IP allowlist (up to 64 CIDRs). Save stays disabled until your current IP is included.

Users on unapproved networks are signed out with "Your network isn't allowed".

**Firewall domains to allow:** wisprflow.ai, admin.wisprflow.ai, dl.wisprflow.ai, dl.wisprflow.com, docs.wisprflow.ai. This is not the full list.
- For TLS inspection, request the full wildcard list (including *.wisprflow.com) from support@wisprflow.ai and bypass inspection for it on port 443.
- Windows MDM MSI: https://dl.wisprflow.ai/windows/msi/latest. Wispr must enable it for your org first. Silent install: `msiexec /i "Wispr Flow.msi" /quiet`.

**Snippet sharing policy (Settings → Organization):** **Unrestricted** (default) or **Department only**, which limits org-wide sharing to admins.

**Connector access:** toggle each integration on or off: Google Calendar, Outlook Calendar, Slack, Gmail. Admins can't disable GitHub or Linear.

---

### Part C: Transcription Accuracy and Voice Quality

## Expected accuracy and known limitations

Source: https://docs.wisprflow.ai/articles/4048537120-what-to-expect-from-flow-accuracy-and-known-limitations

- **Internet required:** transcription happens in the cloud. Audio the microphone never captured can't be recovered.
- **100+ languages.** Accuracy is strongest in English, Cantonese, Chinese, Hindi, French, Spanish, Korean, Portuguese and Russian.
- Flow detects **one language per dictation**, and the language you spoke longest wins, so mixed-language speech is less reliable.
- Cleanup keeps mixed languages such as Hinglish as they are. Flow only translates if a custom instruction asks it to.
- Long dictations are processed in parts. Desktop dictations stop at **20 minutes**, with a warning at 19. Android sessions stop at **5 minutes**, with a one-minute warning.
- **Text insertion:**
  - Desktop pastes through the clipboard. Your previous clipboard comes back after about 0.5 s. The hold is longer for Outlook, Word and WhatsApp on Windows (3 s) and for remote desktop viewers (5 s).
  - If a paste fails, use **Paste Last Transcript**: **Cmd+Ctrl+V** on Mac, **Shift+Alt+Z** on Windows.

## Wrong language

Source: https://docs.wisprflow.ai/articles/5899191431-flow-is-transcribing-in-the-wrong-language

**Fix:** select only the language you speak.

| Platform | Steps |
|---|---|
| Mac/Windows | Right-click the Flow Bar → **Settings** → **General** → **Change** beside Languages. Turn off **Auto-detect**, select your language ("Search for any languages"), and remove the others with "x". Then click **Save and close** (closing the dialog any other way discards changes) |
| iOS | **Settings → General → Set language**. Each tap saves immediately; swipe the sheet down to close |
| Android | **Settings → General → Languages**. Tap a language to remove it, then **Add more**, select yours, and tap **Done**, then **Save**. Android has no Auto-detect |

- Selecting one variant removes its conflicting variant: English / English - British, Hindi / Hinglish, Chinese - Simplified / Traditional, German / German - Swiss.
- If you speak both Hindi and Urdu, keep both selected (Hinglish counts as Hindi here). The same applies to Russian and Ukrainian. Flow double-checks the language, which adds a slight delay.
- **Hinglish** must be selected explicitly. Auto-detect never produces Hinglish.
- If iOS doesn't pick up your desktop language choice, sign out and back in, or set the language manually on the iPhone.

## Accuracy got worse: troubleshooting checklist

Source: https://docs.wisprflow.ai/articles/6901148133-transcription-suddenly-got-worse-or-feels-less-accurate

1. **Restart Flow** and dictate for more than 3 seconds. Very short desktop recordings can come back empty, and taps under about 0.5 s count as accidental.
2. **Check the active microphone.** A new headset, webcam or Bluetooth device can switch the input.
3. **Record in another app** (Voice Memos or Sound Recorder). If that recording is also bad, fix the microphone first.
4. **Check permissions and input level:**
   - Mac: **System Settings → Privacy & Security → Microphone** and **Sound → Input**.
   - Windows: **Settings → Privacy & security → Microphone** and Sound control panel → Recording.
   - In Flow: **Settings → General → Microphone → Change**, then watch the live level meter.
5. **Mic ranking:** **Auto-detect** uses the system default. **Edit ranking** lets you drag mics into priority order.
6. **Play back and retry:** go to **Home → Recent activity**, then **Play audio** or **⋯ → Retry transcript** (**⋯ → Extract audio** saves a WAV). Audio expires after 14 days.
7. **Check languages**, and fix repeated misspellings with **Add to vocabulary → Correct a misspelling**.
8. **Report:** use **Help → Talk to support → Report an issue → Request Type: Issue**, or the flag icon (**Send feedback**) on an entry. Feedback reports include any retained audio.

Bluetooth microphones can clip your first words. With a MacBook lid closed, the built-in mic is unavailable.

## Microphone guide for quiet or discreet dictation

Source: https://docs.wisprflow.ai/articles/9192039587-using-wispr-flow-discreetly-microphone-guide

**Silence Flow's sounds:**
- Mac/Windows: **Settings → System → Sound → Dictation and notification sounds**.
- iOS: **Settings → Audio → Interaction sounds**.
- Android: dictation sounds can't be turned off.

**Tips:**
- Keep the microphone within a few inches of your mouth, and speak softly but clearly.
- Wispr recommends built-in or wired mics over Bluetooth. AirPods may start slowly and cause more errors.
- iOS has no mic picker. Turn off **Settings → Audio → Built-in mic** to use a Bluetooth mic instead.
- Notetaker always uses **Auto-detect** for its microphone.
- Desktop walkthrough: **Find the right mic for you →** in the microphone picker.

| Setup | Mic type | Best pick (source) | Alternatives |
|---|---|---|---|
| On the go | Clip-on lavalier | DJI Mic Mini | Rode Wireless GO (Gen 3), BOYA Mini 2 (budget) |
| Headphones you already own | Attachable boom | Antlion ModMic Uni 2+ | ModMic USB 2, ModMic Wireless (premium) |
| Fixed desk, best quality | Podcast mic | Shure MV7+ | Elgato Wave:3 |
| Fixed desk, hands-free | Gooseneck | Boya BY-GM18 | Movo GM-7 USB |

**Microphone error messages:**

| Message | What to do |
|---|---|
| Selected microphone is unavailable | Use **Choose Microphone** to pick another mic |
| No microphone detected | Connect a mic, or use **Open Sound Settings** |
| Microphone unavailable | Another app may be using the mic; close it and retry |
| Microphone error | Reconnect the mic; contact support if it persists |
| Microphone disconnected | Select **Insert** to keep the text captured so far |

## Voice Profile

Source: https://docs.wisprflow.ai/articles/7470830521-voice-profile-updates-when-the-update-your-voice-profile-notification-appears

- Voice Profile is available on Mac and Windows only, and only desktop dictation counts toward it.
- First-time users see the "Discover your Voice Profile" notification. Existing users see "Update your Voice Profile".
- The first milestone is 2,000 words. Each milestone also needs a minimum number of words stored locally: 2,000 / 5,000 / 10,000 / 20,000 as the milestones rise.
- Generate it in **Insights → Your Voice → Generate profile** (or **Regenerate profile**).
- Notifications are controlled by **Settings → System → Milestones**.
- Deleting local history, or a 24-hour or never-store local data policy, stops progress or hides Voice Profile.
- Generating a profile sends selected local dictations to Flow for processing.

## Bulk import for dictionary and snippets

Source: https://docs.wisprflow.ai/articles/8955301725-how-do-i-bulk-import-for-dictionary-and-snippets

- Available on Mac and Windows only. It requires a paid, trialing or past-due personal subscription, or membership in an enterprise organization.
- **Enable it:** **Settings → Experimental → Bulk import** ("Import snippets and dictionary items from files").
- **File formats:**
  - Dictionary uses **.csv**: one column for a word, or two columns for `misspelling,correction`. The first field allows 60 characters and the correction allows 4,000.
  - Snippets use **.json**: an array of `{name, text}` objects. Names allow 60 characters and text allows 4,000.
  - Each file can be up to **3 MB** and **1,000 entries**.
- **Import:**
  1. Open Dictionary or Snippets and click **Import**.
  2. Optionally turn on **Share with team**.
  3. Upload the file and review the preview.
  4. Click **Import [N] items** (or **Import [N] snippets**).
  5. Click **Done!**
- Duplicates are skipped regardless of case.
- Sync can be blocked by an organization disabling Cloud Sync, a zero-data-retention lock, or a signed BAA.

---

## Open questions and conflicts

1. **Weekly reset time:** Most articles say Sunday 12 a.m. PT. The payment-fails and trial articles say Sunday 23:45 UTC for some platforms.
2. **Mobile Free limit:** The pricing page says 1,000/week. The help center describes a 1,000-word soft limit (dictation slows) and a 1,500-word hard cap.
3. **Student discount:** The pricing page says 50% off with an education email. The help center says verification is required, a free $0/year plan exists for selected accounts, and paid Student costs $7.50/mo or $72/yr.
4. **Trial end:** One article says a "3-day grace period". Others say the Free cap applies "immediately" when a Pro trial ends.
5. **Zepto billing after 3 months:** The article itself flags the no-card, auto-return terms as unconfirmed.
6. **Pricing comparison checkmarks:** The column mapping is inferred because the checkmark images weren't captured.
7. **"Privacy Mode":** No setting has this name in the current docs. The equivalent controls are **Improve the model for everyone**, **Dictation cloud storage**, **Local data storage** and **Context awareness**.
8. **Notetaker offer expiry:** "Free through October 31" on the pricing page has no year. It's presumably 2026.


---

# Part 5: Shortcuts, Troubleshooting & Known Issues

Sources: Wispr Flow Help Center (https://docs.wisprflow.ai), collections **Troubleshooting** (31 articles, `/collections/6359960513-troubleshooting`) and **Known Issues** (12 articles, `/collections/5686269587-known_issues`). Every article in both collections was fetched. Content below is limited to what those articles state. Base URL for sources: `https://docs.wisprflow.ai/articles/…`.

---

## Keyboard & mouse shortcuts

Source: https://docs.wisprflow.ai/articles/2612050838-supported-unsupported-keyboard-hotkey-shortcuts (supplemented where noted)

**Platforms:** Mac and Windows. Custom shortcuts are **saved per device**, **do not sync** between devices, and **survive app updates**.

### Default shortcuts

| Action | Mac | Windows |
|---|---|---|
| **Push to talk** (hold to dictate) | **Fn** | **Ctrl+Win** |
| **Hands-free** (press to start/stop) | **Fn+Space** | **Ctrl+Win+Space** |
| **Command Mode** | **Fn+Ctrl** | **Ctrl+Win+Alt** |
| **Paste last transcript** | **Cmd+Ctrl+V** | **Shift+Alt+Z** |
| **Copy last transcript** | **Cmd+Ctrl+C** | **Shift+Alt+X** |
| **Cancel** | **Escape** | **Escape** |
| **Press Enter** | unbound by default (Settings only, not onboarding) | unbound by default |

**Mac without an Apple Fn key:** during Mac onboarding, if Push to talk is still Fn and no Apple Fn key is detected, Flow switches automatically to **Ctrl+Opt** (Push to talk), **Ctrl+Opt+Space** (Hands-free) and **Cmd+Ctrl+Opt** (Command Mode). Paste, Copy and Cancel stay unchanged.

Other shortcut defaults mentioned in other articles:

| Action | Mac | Windows | Source |
|---|---|---|---|
| Open **Scratchpad** | **Option+S** | **Win+Alt+S** | /articles/1621472516 |
| Open Settings | **⌘,** | — | /articles/7231650589 |
| **Talk to support** | **Command+/** | — | /articles/7231650589, /articles/2503460374 |
| Send support/report form | **Cmd+Enter** | **Ctrl+Enter** | /articles/7837779518 |
| History search | **Cmd+F** or **/** | **Ctrl+F** or **/** | /articles/4465314211 |
| History row selection | **Arrow Up/Down** or **k/j**; **Enter** copies text or triggers eligible Retry/Recover; **Esc** clears selection | same | /articles/2503460374, /articles/4465314211 |

Onboarding may recommend **control + space** for Push to talk until you change it (must still be unused).

**Dictation gesture behaviour** (from /articles/1078330210, /articles/3566082841, /articles/8841649969):
- Hold Push to talk while speaking, release to stop.
- **Double-press** Push to talk → locks hands-free; a later press stops and submits. Double-tapping Push to talk starts hands-free even without a dedicated Hands-free binding.
- A single quick tap released within **500 ms** does not stop dictation; Flow waits 500 ms then cancels if nothing else happens.
- **Triple rapid press** while hands-free is locked **cancels** dictation (does not paste).
- Using dictation modifiers in a non-Flow shortcut within **1 second** of starting cancels dictation unless hands-free is locked.

### Change or add a shortcut

1. Click the Wispr Flow **menu-bar icon** (Mac) or **system-tray icon** (Windows), open **Settings → General → Shortcuts**.
2. Click **Change** in the Shortcuts row.
3. Click an existing binding to replace it, **+** (**Add another**) to keep it and add another, or an empty field (**Click to add a shortcut**).
4. Press the new combination — **keyboard combinations save on release; mouse buttons save on press**.
5. Click **Done** after **Shortcut saved** confirms.

Also reachable via **Shortcuts** in the tray/menu-bar menu, or the hub sidebar's **Help** menu (Mac also **Help ▸ Shortcuts**).

- Each action supports **up to four shortcuts**; **Cancel** supports **one**. At four bindings, **+** disappears.
- Finish or cancel recording before editing another field; during recording **+** and **Reset to default** do nothing and show **Please stop the Notetaker first**.
- **Cancel recording without changing:** while field says **Press key or mouse button**, click **X** (**Cancel**) or press **Escape** alone. On the **Cancel** row, Escape records a binding instead. Left/right click inside or outside the field also cancels silently (the click doesn't activate its target). Order matters: **Ctrl then Esc** records Ctrl+Esc; **Esc then Ctrl** cancels.

### Rules & rejection messages

A rejected combination leaves the previous binding unchanged.

| Message | What to change |
|---|---|
| **This shortcut is not allowed: {key}** | Avoid standalone letters, numbers, punctuation and platform-reserved combinations |
| **This shortcut is already in use** | Pick a combination unused by any other Flow action |
| **Shortcut must contain 3 or fewer keys** | Max three keys |
| **Shortcut must include a modifier key or a valid mouse button** | Mac: Ctrl, Cmd, Opt, Shift or Fn. Windows: Ctrl, Alt, Shift or Win |
| **Shortcut cannot contain both left and right version of the same key** | Use only one side of each modifier |

- **Standalone exceptions:** **Caps Lock** alone works only for **Push to talk** or **Hands-free** (both platforms) and then no longer toggles capitals. **Escape** alone works only for **Cancel**.
- Re-saving the binding you're editing is allowed (/articles/1078330210).
- Keyboard + mouse combinations (e.g. **Ctrl + Mouse 4**) are allowed (/articles/1078330210).

### Blocked / reserved combinations

| Platform | Blocked |
|---|---|
| **Mac** | **Cmd+Backspace**, **Cmd+Delete**, **Cmd+Space**, **Cmd+Ctrl+F**. (Cmd+Opt with Space/Esc/D/P/F/Left/Right and Opt+Backspace/Opt+Delete are *not* on the reserved list but must still be unused in Flow.) |
| **Windows** | Standalone **Ctrl** (left or right); **Win** with **E, R, L, D, Tab, I, S, X, P, Up, Down, Q** |

**Keyboard effects in other apps:** shortcuts can still reach other apps. On Mac, assigning **Fn alone** prevents its usual system action, and **Escape doesn't reach other apps during dictation**. A Flow shortcut like Ctrl+A+B can block another app's Ctrl+A. **Ctrl+Win** suppresses the Windows Start/Search action while held; Win alone still works.

### Mouse buttons

| | Mac | Windows |
|---|---|---|
| Bindable buttons | **Middle Click**, **Mouse 4–Mouse 10**, supported **Aux Button** | **Middle Click**, **Mouse 4**, **Mouse 5**, supported **Aux Button** |
| Not bindable | Left click, right click | Left click, right click |

- **Eligible mice:** recognized mouse with **more than three buttons** or a supported **Logitech MX** model. **Not eligible:** Apple Magic Mouse, built-in trackpads, mice with ≤3 buttons, unrecognized devices.
- Mouse buttons can replace a modifier and work alone or with modifiers.
- Razer, SteelSeries, HyperX, Corsair, generic and Logitech G-series mice work **without companion software**.
- **Logitech MX side buttons:** set the button to **No action** or a keystroke in **Logi Options+** before recording in Flow. On Windows, MX Master swipe-gesture mappings cannot support push-to-talk.
- Assigned mouse buttons **do not reach other apps**. On Windows, quitting Flow while holding a mouse shortcut can let its release trigger the foreground app's action (e.g. Back/Forward).
- Release one mouse shortcut before pressing another; release a button before changing/removing its binding.
- **Press Enter** action: appears in Settings (not onboarding), starts unbound, sends Enter **on press**. A mouse binding passes through extra modifiers other than Fn (e.g. Shift+Enter).

### Remove or reset

- Click the trash icon (**Remove shortcut**) beside a binding. **Push to talk, Command Mode, Paste last transcript, Copy last transcript and Cancel must keep one binding**; Hands-free and Press Enter can be emptied.
- Removing the last Hands-free or Notetaker binding is remembered across launches.
- **Reset to default** replaces all custom shortcuts with platform defaults — **no undo**. It also restores Transform view changes; Transform shortcuts only when allowed, Open Scratchpad only when enabled/permitted by org, Focus Mode only on Mac when enabled, Notetaker only when unblocked.

### If a saved shortcut doesn't work

| Symptom | Fix |
|---|---|
| **Warning: Your Hands-free mode shortcut is a part of a Push-to-talk shortcut. This may lead to conflicts.** | Choose non-overlapping combinations and save again |
| Shortcut ignored/delayed after a long hold | Release all keys, press full combo again. Stuck keys/buttons auto-recover after **10 seconds** (active dictation keys protected) |
| Mac: key-based shortcuts blocked, Fn still works | Another app's **Secure Keyboard Entry** (e.g. 1Password) — quit and restart that app; if stale, lock/unlock or sign out. See /articles/8841649969 |
| Windows: keyboard utility intercepts keys | End the manufacturer's keyboard process in **Task Manager** and retest (disabling an extended-function keyboard device can remove media keys) |

Still stuck: **Help → Talk to support** in hub sidebar; include platform, keyboard/mouse model, combination, error, steps tried.

---

## Troubleshooting

### Mic / audio

#### Microphone silent or unavailable — Mac, Windows, iOS, Android
Source: https://docs.wisprflow.ai/articles/4351452717-troubleshooting-mic-issues

**Quick checks:** hardware mute switch on headset/keyboard/laptop; record a clip in **Voice Memos** (Mac/iPhone) or **Sound Recorder** (Windows) — silence there = system/mic problem, not Flow.

**Mac & Windows**
1. **Allow access**
   - Mac **Microphone Permission Required** → click **Grant Permission** → allow prompt, or enable Flow in **System Settings → Privacy & Security → Microphone**.
   - Windows **Microphone access is disabled** → **Open Settings** → enable both **Microphone access** and **Let desktop apps access your microphone**.
2. **Test the input:** **Settings → General → Microphone → Change** → select mic by name → speak and watch level indicator (only the selected mic shows levels). Unusable mics are dimmed with reason (e.g. **Laptop lid is closed**). Also via **Help → Essentials → Microphone** (hidden during onboarding). Dismissing the dialog (close, Esc, or **Dismiss** on notification) stops the test and releases the mic.
   - If input stays silent: select mic in system sound settings (Mac **System Settings → Sound → Input**; Windows **Settings → System → Sound → Input**); raise low level; compare built-in/wired vs Bluetooth. Closed MacBook needs external mic; wireless receiver out of range can capture silence.
   - If **every** mic is silent (incl. built-in) with correct permissions: switch output device — on Mac **System Settings → Sound → Output** → built-in speakers.
   - Other controls: right-click the **Flow bar → Microphone**. Picker labels: **Built-in mic (recommended)**, **Headphones (wired)**. Virtual/loopback inputs under **Show virtual mics** are never auto-chosen.
3. **Restart Flow:** for **Unable to access mic** use **Restart App**; otherwise quit from menu-bar/tray menu and reopen. Note: dismissing the recording bubble can leave dictation running — stop it explicitly.
4. **Check saved audio:** play the recording in History. Clear speech + wrong text = transcription → retry. Silent audio = capture problem. Dismissed recordings <0.5 s and never-store policy recordings aren't saved.
5. **Support-guided reset** only if support advises (deletes local data).

| Desktop warning | Action |
|---|---|
| **No microphone detected** | Opens Sound Settings (Mac Sound → Input; Windows Sound → Recording) |
| **Selected microphone is unavailable** | **Choose Microphone** → connected input |
| **Is your microphone muted?** / **We couldn't hear you** | Check mute/levels; **Select microphone** or **Troubleshoot** |
| **Microphone unavailable** | Close other apps using the mic (Flow doesn't identify which) |
| **Microphone error** | Reconnect mic; contact support if recurs |
| **Microphone disconnected** | **Insert** retries saved audio and pastes recovered text |
| No audio ~5 s / ~15 s into dictation | "No audio" notice, then escalated notice; clears when audio returns |
| Mic takes >8 s to open | Access-timeout notice / **Unable to access mic** |

Warnings for device-in-use / generic access appear only if the same failure repeats within 2 minutes. Only one status card shows at a time; blocked during onboarding or while chat panel is open.

**iPhone:** requires **Full Access** and mic permission (only the main app can request mic).
1. Enable **Settings → General → Keyboard → Keyboards → Flow → Allow Full Access** (no restart).
2. Start dictation in main Flow app if Flow is missing from mic settings → **Allow**.
3. If denied: **iOS Settings → Flow → Microphone**, reopen Flow.
- **Can't turn on Flow right now** = another app is using the mic → close call/app → **Retry**. Never-captured audio can't be recovered.
- Connecting/disconnecting an input requires a manual restart.

**Android:** bubble stays available without mic permission; tapping/holding it requests access, or shows **We can't hear you / Go to Settings** sheet (after permanent denial or lapsed **Ask every time** grant). Select **Allow Microphone** (card) or **Go to Settings** → grant → return. A full restart may be needed after changing previously denied permissions.

#### Silent dictation with a Focusrite / multi-input audio interface — Mac, Windows
Source: https://docs.wisprflow.ai/articles/3289651546-fixing-silent-dictation-with-a-focusrite-scarlett-2i2-or-other-multi-input-audio-interface

**Cause:** Flow uses **only the first channel** for mono dictation and has **no channel selector**; a mic on Input 2 is unheard. Flow applies **no gain** of its own.

1. Check cable, hardware mute, input gain. **Flow → Settings → General → Microphone → Change** → select the interface → watch the meter. (Selection affects dictation only; **Notetaker always uses Auto-detect**.)
2. **Scarlett 2i2 / XLR on channel 1:** power off → connect mic to XLR **1** → unplug the 2i2's separate quarter-inch Input 1 (it disables the XLR) → power on → enable **48V** only if required and safe for all connected mics (48V powers both XLR inputs on the 2i2) → adjust Input 1 gain → reselect interface in Flow.
3. **Scarlett Solo 4th gen:** **Focusrite Control 2 → Preferences → Device → Combine Input 1 and Input 2**, or hold the **Direct** button 3 s (both channel LEDs turn green). Reopen Flow, select the Solo. Turn combine off for DAW workflows needing independent channels.
4. **Other models:** use the manufacturer's routing controls; don't apply the Solo's Direct-button procedure. On Mac, avoid an **Aggregate Device** as a shortcut (doesn't necessarily move Input 2 to channel 1).
5. Still silent: close DAWs/recording apps holding the interface, reopen Flow, reconnect interface; compare with built-in or single-input USB mic.

Access warnings table (same as above), plus: Mac **Grant Permission**; Windows **Open Settings**; **Unable to access mic** → **Restart App**. During dictation after audio first received: **5 s** silence → **No audio received** (**Contact us**); **15 s** → persistent **Microphone is not working** (**Select microphone**/**Contact us**).

**Microphone disconnected during dictation:** stops dictation; **Insert** briefly available — retries the most recent transcript in history and pastes; unavailable during active dictation ("Cannot retry while dictating."), with too-short audio, or when org policy prevents local audio storage.

#### AirPods & audio playback issues — Mac, Windows, iOS
Source: https://docs.wisprflow.ai/articles/8533503284-knwon-audio-playback-airpod-issues-ios-macos

- AirPods rows in the picker show ⚠️: "**AirPods may be slow to start and have more errors in dictation. We recommend the built in microphone.**"
- **Choose & test mic:** **Flow → Settings → General → Change** (beside Microphone) → **Built-in mic (recommended)** → speak → close dialog. Finish dictation first — opening the picker mid-dictation doesn't auto-transcribe.
- **Change priority:** **Edit Ranking** → drag → **Done Editing**. **Forget device** (trash) removes disconnected devices only. Auto-detect follows OS default input.
- New non-AirPods mic → "**<device name> detected**" with **Switch** / **Don't Switch** (no auto-switch).
- Tip "**AirPods aren't the best for dictation**" at most once/hour; **Switch microphone** or **Don't show again**.
- **Stop AirPods auto-switching (Mac):** **Apple menu → System Settings → Bluetooth → (i) next to AirPods → Connect to This Mac → When Last Connected to This Mac**. This is Apple's switching, not Flow.

| Notification | Action |
|---|---|
| **Is your microphone muted?** | **Select microphone** / **Troubleshoot** |
| **No audio received** | **Contact us** only |
| **Microphone is not working** | Stop dictation; **Select microphone** or **Contact us** |
| **No microphone detected*** | **Open Sound Settings** |
| **Selected microphone is unavailable*** | **Choose Microphone** |
| **Microphone unavailable*** | Close other mic apps / **Troubleshoot** |
| **Microphone error*** | Reconnect / **Troubleshoot** |
| **Unable to access mic** | **Restart App** only |
| **Microphone Permission Required** (Mac) | **Grant Permission** |
| **Microphone access is disabled** (Windows) | **Open Settings** |
| **Your laptop lid is closed** (Mac) | **Select microphone** (or open lid / external mic) |
| **Microphone disconnected** | **Insert** |
| **Transcription empty** | **Select microphone** / **Troubleshoot** |

\* at most once per 60 s. "Is your microphone muted?" is suppressed 60 s after a lid warning.

**iOS:** incoming call stops dictation (tap mic again); connecting/disconnecting audio devices stops recording; **Microphone access denied** → **Go to Settings**; full-screen "no audio" view offers **Dismiss**/**Retry**; iOS may reject the first audio start right after app opens — Flow auto-retries.

#### Missing first words — see Known issues (/articles/3566082841)

#### Auto-mute music while dictating — Mac, Windows (desktop only)
Source: https://docs.wisprflow.ai/articles/7231650589-auto-mute-music-while-dictating-on-macos-how-audio-detection-works

- Setting: **Settings → System → Sound → Mute all audio while dictating**. **Off by default on Mac, on by default on Windows.** Per device.
- Mac mutes the **entire default output device**; Windows silences each app on the default output and restores each app's previous volume. Muting takes ~**300 ms**.
- Only mutes if playback is detected at dictation start. Mac: some players keep a stream open while paused → counted as playing. macOS ≤14.1: Flow's own sounds can count as playback. Windows checks ~every 2 s; paused players don't count.
- **Pause instead:** **Settings → Experimental → Pause music while dictating** (experimental, off by default; requires active/past-due personal sub, active personal trial, or enterprise membership). Mute and pause are mutually exclusive. Zoom/Teams/Slack don't trigger pausing.
- **Audio stays muted:** reconnect output device → turn **Mute all audio while dictating** off then on → dictate and stop again → play audio → adjust volume manually. Mac Bluetooth headset mode changes can delay restore up to ~5.5 s. Mac stops auto volume recovery after **3 failed attempts** or device disappearance — adjust manually.
- Not available on iOS/Android.

#### iPhone doesn't pause background audio — iOS
Source: https://docs.wisprflow.ai/articles/8415579688-why-wispr-flow-doesn-t-pause-background-audio-on-iphone-ios

- **Cause:** iOS Flow records alongside music/podcasts; speaker audio can appear in transcript. No ducking/mute setting exists.
- **Fix:** pause playback or route it to headphones **before** dictating. Changing the audio route ends an active dictation (no notification).
- **Settings → Audio** has only **Built-in mic** (on by default; excludes Bluetooth headset mic) and **Interaction sounds**. No mic picker on iOS.
- **Can't start recording:** end the call/close app using mic or pause Flow's meeting recording → tap mic → quit/reopen Flow. **Microphone Error** sheet: "Please check if the microphone is being used by another application." → **Retry**. Inline "Couldn't start audio capture…" has no Retry. Setup: "Your mic is being used by another app. Close other apps and try again!"
- **Interrupted dictation:** calls/Siri stop recording; fixed **5-minute** limit. Transcript saved to Home history; notifications "**Your dictation was interrupted**" / "**Your dictation reached the time limit**" → tap to open Home and copy.
- Background-recording setting (default **5 minutes**) stops only an idle mic session; never an active dictation.

#### Play back recordings from History — iOS
Source: https://docs.wisprflow.ai/articles/7143508770-play-back-your-recordings-from-history-on-ios

- **History → swipe left on entry → Play** (beside Retry). Not in long-press menu. Requires saved audio and known duration; hidden while retrying.
- Controls: Play/Pause, scrub bar, speed **1x → 1.5x → 2x**; **⋯** menu: **Copy, Retry, Report, Delete**.
- Playback stops/resets when leaving the screen, Flow backgrounds, dictation starts, call/Siri, or headphone disconnect. No background/Lock Screen playback. Plays with silent switch on.
- **Silent playback screen:** finish any active dictation, tap Play again. Contact support if still silent.
- Desktop: row-level Play/Pause and .wav download; unavailable after 14 days.

---

### Hotkeys

#### Logitech MX Master (Logi Options+) buttons not working — Mac, Windows
Source: https://docs.wisprflow.ai/articles/1078330210-fix-logitech-mx-master-logi-options-mouse-buttons-not-working-as-a-flow-shortcut

**Cause:** on Mac, **Logi Options+** converts MX Master side-button presses into swipe gestures **without a button release**; Push to talk needs press and release. Options+ running in background can intercept presses. **Do not uninstall/quit Logi Options+ on macOS** — MX side buttons won't work with Flow without it.

Quick checks: Options+ running? In a mic test/onboarding (shortcuts ignored there)? Does a keyboard shortcut work in **Settings → Shortcuts**?

**Fix (map to keyboard shortcut):**
1. Open **Logi Options+**, select mouse.
2. Map the button to a keyboard shortcut.
3. Flow **Settings → Shortcuts** → click **Push to talk** field (or **Click to add a shortcut**).
4. Press/release the same combination → "**Shortcut saved**".
5. Hold mouse button while speaking, release.

**Bind directly:** set the button to **No action** in Logi Options+ → click Push to talk field → press the mouse button → test.

Still not working: release button → **Quit** Flow → reopen → test. Some Logitech buttons appear as **Aux Button** but are reported as keyboard keys (still click the app underneath) — use keyboard mapping instead.

#### Shortcuts blocked by macOS Secure Keyboard Entry / Secure Event Input — Mac
Source: https://docs.wisprflow.ai/articles/8841649969-fix-flow-shortcuts-blocked-by-macos-secure-keyboard-entry-secure-event-input

**Symptom:** **Fn+Space** (hands-free) or **Escape** (cancel) stops responding while **Fn hold-to-talk** and typing still work (also affects Ctrl+Opt+Space but not Ctrl+Opt hold).
**Cause:** macOS Secure Event Input held by another app — a focused password field, or **Terminal**/**iTerm2** keeping it on in background; password managers like **1Password**. Flow shows no on-screen alert; macOS can misidentify the app.

Quick checks: Flow enabled in **System Settings → Privacy & Security → Accessibility**; just launched/woke/unlocked (auto-recovers); test typing + Fn hold.

**Fix (test Fn+Space after each):**
1. Click a non-password field in suspected app, or switch apps.
2. **Terminal → Secure Keyboard Entry** → uncheck.
3. Close suspected app's window (start with password managers).
4. Quit the app (**Cmd+Q**). Reopen Flow first if Flow was the suspect.
5. Stale block after the app quit: **Lock** (**Ctrl+Cmd+Q** or **Apple menu → Lock Screen**) → unlock; else **Apple menu → Log Out** → sign in.

**Workaround while blocked:** hold Fn to dictate, double-press Fn for hands-free, triple-press to cancel.
Flow itself can hold secure input if its sign-in password field was focused when the window closed — quit/reopen Flow. Missed key releases auto-clear after **10 s**.

#### Switch 123 / ABC layouts in the Wispr iOS keyboard — iOS
Source: https://docs.wisprflow.ai/articles/3963749774-switch-between-the-123-and-abc-layouts-in-the-wispr-ios-keyboard

- Keyboard opens in numbers-first (**123**) layout. Enable letters:
  - **Keyboard drawer:** settings/tips button on dictation row → tap **abc** in drawer bar ("**Wispr ABC keyboard enabled/disabled**") → **X**. Requires Full Access + mic permission.
  - **Flow Settings → General → Show full QWERTY keyboard**.
- Keys: **123** (to numbers), **#+=** (to symbols), **abc** (back to letters if enabled; else next installed keyboard). Globe key only on iPad and iPhone SE (2nd/3rd gen).
- With ABC on, after switching to 123 the next space/Return returns to letters.

#### Turn off or remove the Flow keyboard — iOS 18.3+
Source: https://docs.wisprflow.ai/articles/7148015379-turn-off-or-remove-the-flow-keyboard-on-iphone

- **Switch temporarily:** tap and hold globe → pick standard keyboard.
- **Stop transcription, keep keyboard:** **Settings → General → Keyboard → Keyboards → Wispr Flow → Allow Full Access** off (shows **Almost there!**/**Finish setup** prompts). Turn back on to restore — no restart.
- **Remove keyboard:** same path → swipe left on Wispr Flow → **Delete** (app/data kept).
- **Remove completely:** Account → **Sign out** (deletes local transcripts) → remove keyboard → remove Lock Screen widget and both Control Center controls (**Flow** toggle, **Flow Notes**) → remove custom Siri Shortcuts → delete app. Deleting the app doesn't cancel a subscription (App Store: **Settings → Apple Account → Subscriptions → Flow → Cancel Subscription**).
- Flow auto-advances to the next keyboard for number pad, phone, decimal, email and numbers-and-punctuation fields (not URL/search/password).
- **Settings → General → Disable Flow after**: Never/1 hour/15 min/5 min/Immediately (default **5 min**), background only.

---

### Pasting / insertion

#### Text not pasting after dictation — Mac, Windows, iOS, Android
Source: https://docs.wisprflow.ai/articles/7971211038-fix-text-not-pasting-after-dictation

**Recover first:**

| Platform | Recovery |
|---|---|
| Mac | **Paste last transcript** Ctrl+Cmd+V; copy only Ctrl+Cmd+C |
| Windows | **Paste last transcript** Alt+Shift+Z; copy only Alt+Shift+X |
| iPhone | Tap a successful History entry's text to copy |
| Android | Tap the bubble's **Paste** action |

**Paste last transcript** cancels a dictation still processing; retries dismissed/failed/unformatted attempts before pasting. Also in Mac menu-bar icon, Windows tray right-click menu, Flow Bar context menu; Mac **Dictation → Copy last transcript**.

**Check target field:** keep field focused until insertion finishes; test in Notes/Notepad. If test app works, quit/reopen target app.

**Mac:** **System Settings → Privacy & Security → Accessibility** → enable Wispr Flow (toggle off/on if already on) → fully quit and relaunch Flow → restart Flow after switching keyboard layout (e.g. Dvorak–QWERTY ⌘).
**Windows:** "**Update admin settings to paste!**" / "**Run Flow as Administrator to insert text everywhere**" = privilege block → check field first (can appear once even when paste succeeded) → run Flow as Administrator → test in Notepad → some terminals/IDEs use **Ctrl+Shift+V** or right-click paste → update Flow, quit from tray, reopen.

- **Click a textbox and use [shortcut] to paste** = no text was produced/copied; use **Copy last transcript** first.
- **Desktop History:** click row to copy (rich text + markdown); **Retry** for failed/empty (≥5 s, <14 days), **Recover** for dismissed/unfinished. **History disabled** = never-store policy.
- **Clipboard:** Flow restores previous clipboard ~**0.5 s** after paste. Windows holds dictation **~3 s** for Outlook, Word, WhatsApp; **~5 s** in remote desktop viewers (VNC, RDP, Citrix, Horizon, AnyDesk, TeamViewer). Mac doesn't preserve file contents, PDF, RTFD, sound; Windows doesn't restore file drops, PDF, RTF, wave, CSV.
- **iPhone:** select Flow Keyboard via globe; enable **Allow Full Access**; grant mic; keep keyboard visible until text arrives; test in Notes. Wrong place → shake to undo / Cmd+Z / **Edit → Undo**.
- **Android:** focus field with keyboard showing; **End snooze now** if snoozed; follow overlay/Accessibility prompts; place cursor at end of draft (Flow refuses insertion that would replace text). **Failed to paste** → text already on clipboard. **Failed to transcribe** → reconnect, **Retry**. Copy button beside bubble for 5 s; **Text copied to clipboard** notification.
- **Remote desktops:** run Flow locally, enable clipboard sharing in remote client.

#### Snippets pasting only part of the text — Mac, Windows, iOS, Android
Source: https://docs.wisprflow.ai/articles/4816874402-troubleshooting-guide-for-snippets-pasting-only-part-of-the-text-or-code

1. **Test app:** TextEdit/Notepad/Notes. Full paste there = target app is the cause.
2. **Check saved expansion:** Mac/Win **Flow Hub → Snippets → All** → clear search → open edit dialog (list preview collapses line breaks). Limits: trigger **60** chars, expansion **4,000** (counter includes formatting); over limit: "**This expansion is too long. Please shorten it and try again.**" iOS: long-press → **Copy** → paste in Notes; trigger <60 chars, no expansion limit. Android shows max four lines (not a content limit).
3. **Mac Accessibility:** **System Settings → Privacy & Security → Accessibility** → Flow on; remove and re-add if persists.
4. **Trigger & formatting:** try trigger alone and in a sentence (alone ignores case/punctuation/spacing; in a sentence punctuation must match, whole word). Remove extra line breaks/tabs/indentation, then reintroduce one by one.
5. **Manual recovery:** click textbox → **Ctrl+Cmd+V** (Mac) / **Alt+Shift+Z** (Windows). Windows "**Update admin settings to paste!**" → relaunch as Administrator.
6. **Overlapping triggers:** personal beats team snippet with same trigger; avoid triggers differing only in punctuation/case; desktop rejects names already used by dictionary entries.

Notices: "**Don't tap. Hold down {{shortcut}}.**" = hold-to-dictate wasn't held. Formatting kept: bold, italic, lists, links, paragraphs; removed: headings, tables, images, colors. Formatting dropped with hyperlink email signature, duplicate trigger in one dictation, apps like lovable.dev; terminal coding agents (Claude, Codex) can receive parts unformatted. Team snippets need active subscription/trial.

#### Retry and recover a failed transcription — Mac, Windows, iOS, Android
Source: https://docs.wisprflow.ai/articles/2503460374-retry-failed-transcriptions

Retry needs internet. Transcripts/audio **don't sync between devices**.

**Mac & Windows**
1. Finish any active dictation ("**Cannot retry while dictating**").
2. **Retry** on the error notification (retries + pastes) or **Open History**.
3. In History/Recent Activity: **Retry**, **Recover**, or **⋯ → Retry transcript**.
4. Copy recovered text (History retries don't paste).
- Inline **Retry**: failed/empty audio **≥5 s**, within **14 days**. **Recover**: dismissed/interrupted entries, no minimum. Recordings <0.5 s dismissed aren't saved.
- **⋯ → Extract audio** saves a .wav before 14-day expiry. Expired: "**Cannot retry transcription as audio is no longer available (older than 14 days)**".
- **Settings → Data and Privacy**: never-store → "**History disabled**", no retry.
- Escape → cancellation notice with **Undo** (re-transcribes and pastes). Triple-press cancels silently. New dictations are rejected while previous is processing ("**Transcript currently processing**").
- Retried text may differ: dictionary replacements, casing, Slack and email-signature formatting not reapplied.

**iPhone:** History on **Home** tab → swipe left or long-press → **Retry** → tap text to copy → paste. Cancelling a recording deletes it permanently; cancelling processing keeps audio. Keyboard: tap **orange triangle** left of mic → **Retry** (server/processing errors only; network/audio errors only **Dismiss**). **Settings → Data & Privacy → Auto-delete transcripts** removes previous days' items.
**Android:** bubble **Retry**, or Home → card **⋯ → Retry Transcript**. Greyed Retry = offline. "**Retry failed. Audio file missing.**" / "**…not found.**" = no audio. Low storage → **Manage Storage**.

#### Flow Bar (desktop) / Flow Bubble (Android) missing or not responding
Source: https://docs.wisprflow.ai/articles/5002934560-why-is-the-wispr-bar-is-not-appearing-or-disappearing

**Mac / Windows**
1. Check menu-bar icon / tray icon (Windows hidden icons under **^**; tooltip **Wispr Flow**).
2. Open Flow (Windows single-click tray; Mac menu-bar icon → **Open Wispr Flow**).
3. Enable **Wispr Flow Settings → System → App settings → Show Flow Bar at all times** (off = hidden or **Hide for 1 hour** snooze; **Hidden for one hour**; snooze notification **Undo** also restores).
4. Mac: enable Flow in **Privacy & Security → Accessibility** and **Microphone** (OS updates can change these). Windows has no accessibility requirement.
5. Test in a normal window outside full screen. 6. Relaunch Flow.
- Mac: bar sits above Dock; briefly disappears entering/leaving full screen. Windows: third-party window managers/security tools can interfere; Windows auto-restores invisible/unclickable bar after update, sleep, lock/wake, gaming.

**Android bubble:** appears only with a focused text field and on-screen keyboard; setup must be complete. Intentionally hidden in banking/financial apps, password/numeric/phone fields, most Flow screens.

| Home card | Action |
|---|---|
| **Enable Flow bubble on screen** | **Go to Settings** → allow **Display over other apps** |
| **Flow can't insert text** | **Go to Settings** → enable accessibility service |
| **Flow isn't responding** | **Restart Flow** (can take up to 60 s to appear) |
| **We can't hear you** | **Allow Microphone** |
| **Keep Wispr Flow running** | **Allow** battery-optimization exemption |
| **Flow Bubble Disabled** | **Turn Back On** |
| **Bubble is snoozed** | **End snooze now** |

- Enable main **Use Wispr Flow** accessibility service, **not** its shortcut.
- Don't disable **Display over other apps** to silence Android's overlay notification.
- Snooze: drag bubble to bottom target = 10 min; end with repeated shakes or Home card.
- **Settings → Flow Bubble Size → Shrink the bubble when not in use** (off by default) enables **Shrink to a dot**.
- **Gray bubble** = offline ("**No internet. Try again later.**"). Pulsing loader = wait; retry icon = restart connection; warning triangle = accessibility recovery.
- Battery: unrestricted battery use required on every device incl. Pixel.

---

### Login & account

#### Login issues — Mac, Windows, iOS, Android
Source: https://docs.wisprflow.ai/articles/1753832329-login-issues-with-wispr-flow

- **Use original method + exact email** (dots/aliases are different addresses). Mac/Win: **Sign in via browser**; iOS: Google/Apple first, **More options** for Microsoft/SSO/email; Android lists all. iOS **Welcome back** / Android **Existing account** (use **Back to login**) name your provider. Login method can't be switched.
- **Incorrect email or password** → **Forgot password** → set **New Password**/**Confirm Password** (≥8 chars). Reset links single-use, expire; "**This link has expired**" etc. → **Send a new link**. Max **3 reset emails / 30 min**.
- **Unverified email:** web/iOS resend; Android checks up to 10 min. "**Session expired. Please sign up again.**", "**Sign in failed after verification.**"
- **Provider asks to confirm email:** **Check your email** page → enter 6-digit code; resend after **30 s**; **5 attempts**; page valid **5 minutes**.
- **Captcha:** see Known issues /articles/8527688318.
- **Browser sign-in stalls:** keep Flow open; select **Open Wispr Flow** on success page (doesn't auto-open). Mac/Win wait **5 min**; emailed link valid **15 min**. No browser → open default browser, confirm default set, **Sign in via browser** again. Android: "**No web browser found. Try another way.**", "**Couldn't open the sign-in page. Please try again.**", "**Sign-in didn't finish. Please try again.**" (after 20 s). Android SSO: **Cancel** → **Continue** → complete in browser.
- **Too many attempts:** wait ~1 min (sign-in), 30 min (reset/resend), 1 hour (repeated signup).
- **Signed out unexpectedly** (desktop **You have been signed out**; Android **Your session has expired. Please sign in again.**) = saved credentials invalid → sign in again.
- **Organization:** **SSO Sign In Required** → SSO with work email. **Account Managed by Your Organization** → request access from IT; Mac/Win **Request to join** → **Refresh**.
- **Your network isn't allowed:** connect to approved network → **Retry**.
- **Last steps:** update Flow → fully quit/reopen → restart device → reinstall (last resort). Sign-out removes local data.

#### Reset password / replace expired setup link — Mac, Windows, iPhone, Android
Source: https://docs.wisprflow.ai/articles/4934269962-how-do-i-reset-my-wispr-flow-password

| Platform | Steps |
|---|---|
| Mac/Windows | **Sign in via browser** → email → **Next** → **Forgot password?** ("Password reset email sent to {email}.") |
| iPhone | **More options → Continue with Email** → **Continue** → **Forgot password?** → complete verification challenge → **Send reset email** |
| Android | **Continue with Email** → **Continue** → **Forgot password?** → **Send reset link** (no challenge; Back twice to change email) |

- Set password on emailed page: **New Password** + **Confirm Password** (≥8) → **Reset Password** → "**Password reset successfully.**" Expect to sign in again on all devices.
- Expired org setup link: same flow → **Send a new link** (no admin resend needed). Don't edit the URL; open the original emailed link.
- Errors: "**Too many requests…**", "**Password cannot contain your email.**", "**Please choose a stronger password.**", "**Verification service unavailable. Please try again later.**" (iOS → **Go back**, reopen later). In-app failures → try **wisprflow.ai/login**.
- Password reset can't bypass required SSO. "**Your password was updated, but we couldn't finish syncing your account…**" → try new password, contact support. Never send password/reset link to anyone.

#### App doesn't start after signing in and clicking "Open Wispr Flow" — all platforms
Source: https://docs.wisprflow.ai/articles/2809372297-what-to-do-if-the-app-doesn-t-start-up-after-signing-in-and-clicking-open-wispr-flow

Quick checks: Mac — click menu-bar/Dock icon (wait, click again) or **Finder → Applications → Wispr Flow**; Windows — click tray icon (with **Launch at login** Flow can start silently); mobile — open from home screen. Start a fresh **Sign in via browser** for **Sign-in link expired**.

| What you see | Fix |
|---|---|
| **Unsupported MacOS Version** | Update to **macOS 12 or later** |
| **Incorrect App Version** (Apple Silicon) | Download the Apple Silicon build |
| **Unsupported Windows Architecture** | Install on **x64** Windows |
| **Move Flow to Applications folder** | Move app to **/Applications** |
| Mac says damaged/missing/zero bytes | Fresh download from wisprflow.ai/downloads |
| Blank white window | Quit and reopen; reinstall if recurs |
| **Flow hit a snag** | **Restart Flow** or **Contact us** |
| **Your network isn't allowed** | Approved network / admin, retry |

Reinstall Mac: quit → move to Trash → download → drag to Applications → **Sign in via browser**. Windows: quit from tray → **Settings → Apps → Installed apps** (Win 11) / **Apps & features** (Win 10) → uninstall → run latest installer. iOS/Android: update → force-close (Android **Settings → Apps → Wispr Flow → Force stop**; clears iOS screen stuck on Wispr logo) → reopen → reinstall last.
Note: the redirect-loop article (/articles/6203703148) states Mac requires **macOS Big Sur or newer**.

#### Accidentally used password as name — all platforms
Source: https://docs.wisprflow.ai/articles/4173150799-how-to-fix-accidentally-using-your-password-as-your-name

1. **Reset password** (email/password accounts only; provider accounts skip). iOS/Android: sign out (not **Delete account**) → email → **Forgot password?**. Desktop: **Sign in via browser** → **Forgot password?**. Reset doesn't sign out other devices.
2. **Update name:** **Account** (mobile, tap profile card → **Edit Profile**) or **Settings → Account** (desktop) → **Save**. Desktop requires both names; rejects password-like names ("**This looks like a password, not a name**": digits, symbols, >30 chars, words like pass/admin/qwerty).
3. **Regenerate referral code** (Mac/Windows only): **Settings → Refer a friend** → refresh beside **Your invite link** → "**Referral code updated**" (old link stops permanently).

#### Find Hide My Email address — iOS
Source: https://docs.wisprflow.ai/articles/1410486313-find-your-hide-my-email-addresses-on-iphone

- **Settings → [your name] → Sign-In & Security → Hide My Email → Wispr Flow** → address ending **@privaterelay.appleid.com** is your account email. (Requires iCloud+ or Apple One.)
- In Flow: menu → name block or **Account**. Email is read-only.
- To use real email: create a new account and contact support to transfer subscription. "+" aliases unsupported for email/password signup. Relay accounts aren't auto-matched to enterprise workspaces.
- Support: menu → **Talk to Support** → **Account Management** → include relay address → **Send**.

#### Email & sign-in method change requests — all platforms
Source: https://docs.wisprflow.ai/articles/7810355955-internal-email-sign-in-method-change-requests

- Email and sign-in method **cannot be changed, transferred, merged or converted — not even by support**. New email = new account; nothing transfers (dictionary, snippets, stats, history, subscription, team membership, styles, notes, referral credits, HIPAA BAA).
- Export first (Mac/Win): **Settings → Data & Privacy → Download your data** → request → download.
- Cancel billing via purchase channel: desktop **Settings → Plans and Billing → Manage subscription** (Stripe portal); App Store **iOS Settings → name → Subscriptions → Wispr Flow → Cancel Subscription**; Google Play **profile → Payments & subscriptions → Subscriptions → Wispr Flow**; admins **Manage billing**. Deleting account with active Wispr-billed sub cancels immediately, no refund.
- Switch: **Settings → Account** → **Sign out** → create new account → check email before purchasing → re-add dictionary/snippets.
- Delete old account: Mac/Win **Settings → Account → Delete account** (type exact email); iOS **Settings → Account → Delete account**; Android — contact support. Default completion 90 days after request.

#### Delete transcripts and history — all platforms
Source: https://docs.wisprflow.ai/articles/4465314211-delete-transcripts-and-history-in-wispr-flow

- **Mac/Win one item:** hover → **⋮** → **Delete transcript** → **Yes, delete it**. **iOS:** long-press → **Delete** → confirm (swipe left doesn't offer Delete). **Android:** **⋮** → **Delete** → confirm.
- **Mac/Win bulk:** **Settings → Data and Privacy → Local data storage**: **Store data locally** (default) / **Auto-delete local data every 24hrs** (**Enable auto-delete**) / **Never store data locally** (**Delete all data**). Syncs across Mac/Windows devices; orgs can enforce stricter.
- **iOS:** **Settings → Data and privacy → Automatically delete transcripts** (keeps today's).
- Android has no Delete all; sign-out deletes transcripts.
- Deleted transcripts cannot be restored; server copies may remain.

#### Referral link — Mac, Windows, iPhone
Source: https://docs.wisprflow.ai/articles/6496688316-how-to-find-your-referral-link

- Desktop: Hub → **Account → Refer a friend → Copy** beside **Your invite link** (`https://wisprflow.ai/r?…`). No referral code → restart Flow. iPhone: menu → **Get a free month**/**Refer a friend** → **Copy**/**Share Invite**; refresh icon if missing ("**Unable to refresh referral link**").
- Apply code after signup: desktop only — **Apply referral**. Errors: **User already referred.**, **Cannot refer yourself.**, **Referrer user not found.**
- Credit: 1 month per referral after friend dictates **2,000 words** or has active/trial personal sub; no credit for App Store/Play subscribers or team billing. Friend gets **30-day Pro trial**. Max 2 **Remind them** reminders, 24 h apart. Contact support if reward not active after 24 h.

#### Contact support / report a transcript — all platforms
Source: https://docs.wisprflow.ai/articles/7837779518-getting-help-with-wispr-flow-reporting-flagging-and-contacting-support

| Platform | Open support |
|---|---|
| Mac/Windows | Sidebar → **Help → Get in touch → Talk to support** (also tray/menu-bar menu, Mac **Help → Talk to support**, **Command+/**) |
| iPhone | **Menu → Talk to Support**, or **Account → Get in touch** |
| Android | Drawer → **Report an issue** / **Share feedback** |

- Use **Report an issue** (types: **Issue, Billing, Account & Data Management**) for problems; **Share feedback** is for ideas. Desktop 10,000-char limit; one image ≤10 MB (PNG/JPEG/BMP/WebP; iPhone text-only). Send with **Cmd/Ctrl+Enter**.
- Failure: "Couldn't send feedback, but we copied it to your clipboard to try again."
- Report a transcript: desktop History flag (**Send feedback**); iPhone long-press → **Report**; Android **Report** on card.
- Signed out on desktop: use the login-screen Help form **Send a message to the Flow team** (two-tab dialog doesn't reach support while signed out). **Flow hit a snag** → **Contact support** emails support@wisprflow.ai ("Flow Desktop Error").
- Fallback: support@wisprflow.ai.

---

### Sync, data & connectivity

Relevant sync facts stated by the sources:
- Custom shortcuts **do not sync** between devices (/articles/2612050838).
- Transcripts and audio **do not sync between devices**; retry only on recording device (/articles/2503460374, /articles/9620169737).
- Desktop **Local data storage** setting syncs across Mac and Windows devices (/articles/4465314211).
- Snippet definitions sync through your account; newer edits win on desktop (/articles/4816874402).
- Dictionary, stats and settings re-sync after **Reset & restart** (/articles/2999006910).
- Signing out clears local data; only account-synced content returns (multiple articles).
- Network/VPN issues: see Known issues /articles/3834764683 and /articles/1102412773.

---

### Performance, startup & app recovery

#### Slow or failed transcription ("Taking longer than usual…") — all platforms
Source: https://docs.wisprflow.ai/articles/4984532368-fix-taking-longer-than-usual-and-transcription-errors

1. Load a website (restore connection). 2. Update (**Check for updates...** / App Store / Play Store). 3. Quit and reopen. 4. Test without VPN/proxy. 5. Re-enable it and configure approved access.
- **Taking longer than usual…**: only action **Don't show again**; clears when text pastes.
- **Something's not right**: **Retry** (retries last transcript + pastes) or **Open History** → **Retry**/**⋯ → Retry transcript**/**Recover**.
- Desktop recordings warn at **19 min**, stop at **20 min**; "**Transcription session ended.**" → **Recover text**/**Copy**.
- Android: 5-minute limit (warning 1 min before); "**No internet. Try again later.**"
- Storage warnings: **Local database corruption** (restart deletes corrupt local data), **Storage Full** (free disk space), **There was an error** (Restart Flow). **Reset & restart** only if support advises.

#### Startup and "No Model Available" errors — all platforms
Source: https://docs.wisprflow.ai/articles/3155947051-troubleshooting-guide-for-no-model-available-error

Quick checks: connection; quit/reopen (or **Restart Flow**); update; confirm selected mic (declining Flow's **Switch** prompt keeps old input).

| Message | Action |
|---|---|
| **Flow is having trouble loading or starting** | **Restart Flow**; repeat → **Contact us** |
| **Audio system failed to load** | Restart Flow; then contact support |
| **Something's not right** | Let recovery finish; **Retry** / **Open History** |
| **Is your internet connected?** | Check network; retry retained audio (can be advisory on desktop) |
| **Microphone Permission Required** / **Microphone access is disabled** | **Grant Permission** / **Open Settings** |
| **Accessibility Permission Required** | **Open Settings** and grant |
| **Microphone disconnected** | **Insert**, then reconnect/select input |

Platform setup: Mac — **Privacy & Security → Microphone** and **Accessibility**; lid closed → external mic; restart Mac. Windows — **Settings → Privacy & security → Microphone** (mic + desktop-app access); restart PC. iPhone — **Allow Full Access** + mic; "**Couldn't start audio capture**" → close other mic apps; wait after cold launch. Android — complete Home cards; **Force stop**; check snoozed bubble/incomplete onboarding.

#### Reset and restart the app — Mac, Windows (mobile: restart/reinstall)
Source: https://docs.wisprflow.ai/articles/2999006910-reset-and-restart-the-wispr-flow-app

- Restart first: quit completely → reopen → test. Updates: menu-bar/tray → **Check for updates...** → **Update ready, restart now?** (during recording: **Restart to update?** → **Cancel**/**Restart anyway**). Managed: **Next update check: <date>**.
- **Recover** interrupted dictations in History within 14 days.

| Message | Text | Next step |
|---|---|---|
| Local database corruption | Some of your local data is corrupted. | **Restart Flow** |
| There was an error | Restarting the app should fix it | **Restart Flow** |
| Storage Full | You are running out of space on your computer | Free disk space, restart |

- **Flow is having trouble starting/loading** → **Restart Flow**/**Contact us**. **Flow hit a snag** (after error or 20 s stalled startup) → **Restart Flow**/**Contact support**.
- **Reset (only if support advises):** **Settings → System** (not Data & Privacy) → scroll to **Data** → **Reset app** row → **Reset & restart** → confirm **Reset & restart**. Deletes local data; dictionary, stats, settings re-sync.
- Flow quits with a dialog for unsupported macOS, Intel build under Rosetta, non-x64 Windows, Mac install outside Applications.
- iOS: update → force-close → delete/reinstall. Android: update → **Force stop** → check battery/autostart → reinstall. Android cards table matches the Flow Bubble table above.

#### Quit and relaunch — all platforms
Source: https://docs.wisprflow.ai/articles/7492559320-quit-and-relaunch-wispr-flow

- Closing main window only hides Flow. **Restart Flow** (**Restart App** on mic timeout) quits and reopens.
- **Mac:** **Wispr Flow → Quit Wispr Flow** (or **Command+Q**) → if still running, **Activity Monitor** (**Command+Space → Activity Monitor**) → search **Wispr** → stop → **Force Quit** each → reopen from **Finder → Applications**. Dock clicks ignored first 10 s after launch.
- **Windows:** right-click tray → **Quit** (jump list **Quit Wispr**) → **Ctrl+Shift+Esc** Task Manager → **End task** on Wispr Flow / **Wispr Flow Helper.exe** → reopen from Start. After wake/unlock wait 5–10 s. Reopens without window: **Launch app at login** makes manual launches background — turn off in **Settings → System → App settings**.
- **iOS:** app switcher → swipe Flow up → reopen; check History.
- **Android:** open Flow first (**Restart Flow** card); else **Settings → Apps → Wispr Flow → Force stop** → reopen. Force-stopping mid-onboarding resumes at push-to-talk tutorial.
- Settings keep reverting → free disk space / ask IT about security software blocking the data folder.

#### Uninstall and remove local data — all platforms
Source: https://docs.wisprflow.ai/articles/3884018196-completely-removing-wispr-flow-from-your-device

- **Mac:** quit from menu bar → Activity Monitor: stop Wispr processes incl. **Wispr Flow Helper** → move app to Trash → **Shift+Command+G** and remove data folders → **System Settings → General → Login Items** → clear permissions for **Wispr Flow** and **Wispr Flow Helper** (Accessibility, Microphone, Screen Recording, Full Disk Access, Bluetooth) → empty Trash.

| Mac location | Items |
|---|---|
| ~/Library/Application Support/ | Wispr Flow; Flow (prefs.yml) |
| ~/Library/Application Support/Caches/ | Wispr Flow |
| ~/Library/Logs/ | Wispr Flow |
| ~/Library/Preferences/ | com.wispr.flowapp.plist; com.electron.wispr-flow.plist; com.electron.wispr-flow.accessibility-mac-app.plist |
| ~/Library/Saved Application State/ | com.wispr.flowapp.savedState |
| ~/Library/HTTPStorages/ | com.wispr.flowapp |
| ~/Library/Caches/ | com.wispr.flowapp; com.electron.wispr-flow |

Terminal: `tccutil reset Microphone com.electron.wispr-flow`, `tccutil reset ScreenCapture com.electron.wispr-flow`, `tccutil reset SystemPolicyAllFiles com.electron.wispr-flow` (Accessibility must be removed manually).

- **Windows:** Task Manager end Wispr processes → **Settings → Apps → Installed apps** uninstall → remove folders → **Win+R** `shell:startup` remove shortcut → remove shortcuts/registry entries → empty Recycle Bin.

| Windows location | Items |
|---|---|
| %APPDATA% | Wispr Flow; WisprFlow; wispr-flow |
| %LOCALAPPDATA% | WisprFlow; Wispr Flow; wispr-flow-updater |
| %LOCALAPPDATA%\Programs | WisprFlow; Wispr Flow |
| %ProgramFiles% / %ProgramFiles(x86)% | Wispr Flow |
| %ProgramData% | Wispr Flow; WisprFlow |
| %TEMP% | Wispr Flow |
| %LOCALAPPDATA%\SquirrelTemp | Squirrel-Install.log, SquirrelSetup.log (if Wispr) |

Registry: Run / StartupApproved values; HKCU\Software\Wispr, Wispr AI, WisprFlow, Wispr Flow; HKLM\SOFTWARE\Wispr AI (+WOW6432Node); HKCU\Software\Classes\wisprflow and wispr-flow. Credentials are in %APPDATA%\Wispr Flow, not Credential Manager.
- **iPhone:** **Menu → Account → Sign out** → remove keyboard → remove Lock Screen widget/Control Center controls → delete Shortcuts → **Remove App → Delete App**.
- **Android:** drawer → **Account → Sign out** → **Settings → Apps → Wispr Flow → Force stop** → **Storage → Clear storage** → **Uninstall**.

---

### Platform-specific

#### Re-verify permissions after updating — all platforms
Source: https://docs.wisprflow.ai/articles/5510622673-re-verify-wispr-flow-permissions-after-updating

- **Mac:** Microphone + Accessibility required (Screen Recording not needed for dictation). Quit Flow → **System Settings → Privacy & Security → Microphone** → toggle Flow off/on → enable in **Accessibility** → reopen from Applications/Dock (won't launch outside Applications). Flow not listed → reinstall.
- **Windows:** system mic access only; **Open Settings** on "**Microphone access is disabled**". "**No microphone detected**" → **Open Sound Settings** (Recording tab). "**Update admin settings to paste!**" → run as Administrator.
- **iOS:** Home "**We can't hear you**" → **Go to Settings** → Microphone on. Full Access: **Almost there!** → **Finish setup** → **Go to Settings**.
- **Android:** **Allow Microphone**; **Enable Flow bubble on screen** → **Go to Settings** → Display over other apps; **Turn Back On**; warning triangle / retry icon; **Keep Wispr Flow running** → **Allow**.
- Repeated mic prompts → toggle permission off/on and restart Flow. Mac shortcuts fail despite Accessibility (space/Esc fail, fn works) → secure keyboard input (see Hotkeys).

#### Android work profiles — Android 13+
Source: https://docs.wisprflow.ai/articles/1522331174-using-wispr-flow-on-android-work-profiles

**Cause:** Flow missing/grayed in Accessibility because it's installed in the **work profile** (briefcase badge); Android doesn't expose work-profile accessibility services. Device security policy can also restrict.
**Fix:** uninstall the briefcase copy → install from personal Google Play → sign in, onboard → grant **Display over other apps** → **Open settings** → **Agree** → enable main service (leave **Wispr Flow shortcut** off).

| Device | Path |
|---|---|
| Samsung | Installed apps → Wispr Flow |
| Xiaomi / Redmi / POCO | Downloaded apps → Wispr Flow → **OK** |
| Vivo / Motorola | Listed directly |
| Pixel / OnePlus / other | Downloaded apps → Wispr Flow |

Test in an ordinary notes app. Full work-profile deployment/enterprise management isn't available on Android (SSO is).

---

## Known issues

#### 1. Website loads but sign-in/downloads fail in one browser — Mac, Windows
Source: https://docs.wisprflow.ai/articles/1102412773-wispr-flow-website-loads-but-sign-in-and-downloads-fail-in-one-browser
- **Cause:** that browser's settings (secure DNS, extensions, security software, VPN/proxy, hosts file).
- **Fix:** check status page; try another browser/device. Adjust DNS: Chrome/Edge **Settings → Privacy and security → Security → Use secure DNS**; Firefox **Settings → Privacy & Security → DNS over HTTPS** → off or Cloudflare (Google on Chrome/Edge) → restart browser. Safari follows **System Settings → Network**. Try incognito; pause security software; disconnect VPN; clean hosts file.
- IT: allow HTTPS to **wisprflow.ai**, ***.wisprflow.ai**, ***.wisprflow.com** (port 443) and TLS inspection bypass.
- Update without website: tray/menu-bar → **Check for updates...** → **Update ready, restart now?**. Direct installers: dl.wisprflow.ai/windows/latest, /mac-apple/latest, /mac-intel/latest; MSI dl.wisprflow.ai/windows/msi/latest (must be enabled for your account). Don't copy installers from another computer.
- Account isn't affected by DNS/browser problems.

#### 2. Fails to detect text fields / inserts incorrectly on non-QWERTY layouts — Mac, Windows, Android
Source: https://docs.wisprflow.ai/articles/1621472516-flow-fails-to-detect-text-fields-or-inserts-incorrectly-on-non-qwerty-keyboard-layouts
- Mac pasting follows active keyboard layout (works on Dvorak–QWERTY ⌘) — **restart Flow after switching layouts**. Windows pasting is layout-independent.
- Recovery: click field → Cmd+V/Ctrl+V if recovery popup ("**Select a textbox first, then dictate**" with **Copy**) appeared → else **Paste Last Text** (Cmd+Ctrl+V / Shift+Alt+Z) or **Copy Last Text** (Cmd+Ctrl+C / Shift+Alt+X). Paste Last Text cancels processing dictation.
- Windows "**Update admin settings to paste!**" → quit → right-click Flow shortcut → **Run as administrator**.
- Scratchpad fallback (Option+S / Win+Alt+S).
- Android: copied to clipboard; bubble **Paste**; "**Failed to paste text. It is still on your clipboard.**"; banking apps "**Flow Bubble is disabled inside banking apps.**"; fallback over 100,000 existing characters.

#### 3. Google Play keeps asking about Flow permissions — Android
Source: https://docs.wisprflow.ai/articles/1842649381-why-does-google-play-keep-asking-about-wispr-flow-permissions
- **Cause:** Google Play periodically asks you to review apps with accessibility access; not a malfunction. Flow can't turn them off.
- Test dictation in a notes app; if it works, ignore. Silence via **Settings → Notifications → App notifications → Google Play Store**. Stop Flow's rating prompt: set **App Feedback** notification category to **None**.
- Re-enable accessibility: **Open settings** → **Agree** → **Accessibility → Downloaded apps → Wispr Flow** → main toggle on (not **Wispr Flow shortcut**) → **OK** on Xiaomi. May need **Allow restricted settings**.
- **Flow isn't responding** → **Restart Flow**; still stuck → toggle Flow off/on in Accessibility. Flow 2.5.2+ on Samsung/Xiaomi may show **Wispr Flow stopped** with **Fix in Settings**.
- Permission keeps dropping: Pixel **Settings → Apps → Wispr Flow → Battery → Unrestricted**; Xiaomi **Background autostart** + **No restrictions**.

#### 4. Switching accounts on Android — Android
Source: https://docs.wisprflow.ai/articles/1846165703-switching-accounts-on-android
- **Switching deletes this device's transcripts** (cannot be restored); copy transcripts out first.
- Sign out: menu → profile card/**Account** → **Sign out** → **Sign Out** in "Sign out and delete transcripts?" → wait.
- Sign in with the other account's method (Google/Apple/Microsoft/SSO/Email). Check profile card name/email.
- Carry-over: languages and bubble size/opacity per account; dictionary/snippets/styles need internet; stats reset then reload ("Unable to load stats" shows zeros). First account after the per-account-settings upgrade inherits device settings once.
- Recovery: Google/Apple/Microsoft interrupted → **Try again**; SSO → **Cancel** → **Continue with SSO**; **Existing account** → **Back to login**.

#### 5. Missing first words in transcriptions — Mac, Windows, iOS, Android
Source: https://docs.wisprflow.ai/articles/3566082841-fix-missing-first-words-in-transcriptions
- **Fix:** pause briefly after pressing hotkey (esp. wireless mics); hold hotkey while speaking (or double-tap for hands-free); test mic in Voice Memos/Sound Recorder.
- Desktop: **Settings → General → Microphone → Change** → choose **Built-in mic (recommended)** or wired USB instead of Auto-detect ("From computer settings") → watch meter. Mac built-in mic can't work with lid closed ("**Laptop lid is closed**").
- Mobile: no device picker; iOS **Flow Settings → Audio → Built-in mic**; or disconnect Bluetooth / plug in wired.
- Windows: **Settings → System → Sound → Input** → **Test your microphone**.
- Check recording: Hub **Home** → Activity list → **⋮** → **Extract audio** (WAV). Words in audio but not transcript → contact support; missing in audio → mic issue. Not available on **Never Store** plans or after 14 days.

#### 6. Weekly word limit not resetting — all platforms
Source: https://docs.wisprflow.ai/articles/3715544288-weekly-word-limit-not-resetting-troubleshooting-guide
- **Reset: Sunday 23:45 UTC** (messages saying "Sunday, 12 a.m. PT." are inaccurate). Limits apply only to Free plan; Notetaker and Instruct-mode don't count. Plan status is per platform (past-due counts as paid on iOS, not Mac).

| Platform | Soft cap | Hard cap |
|---|---|---|
| Mac and Windows | 2,000 words | 5,000 words |
| iOS and Android (shared pool) | 1,000 words | 1,500 words |

- Displays: desktop Home card "**N words left**" (→ **Plans & Billing**); iOS/Android menu (☰). Android warning at 800 words.
- Step 1: restart Flow (Mac **Quit Wispr Flow**; iOS app switcher; Android recent apps). Android after web purchase: tap bubble, wait 30 s, tap again. iOS: "**Couldn't load plans**"/"**Purchase Found, Sync Needed**" → retry; "**Subscription Linked to Another Account**".
- Step 2 (last resort): sign out and back in (Mac avatar → **Manage account** → **Account** → **Sign out**; mobile ☰ → **Account** → **Sign out**). Don't use **Delete all transcripts** or iOS **Delete account**. Clearing Android storage doesn't renew allowance.

#### 7. Connection & network errors / VPNs or security tools blocking Flow — all platforms
Source: https://docs.wisprflow.ai/articles/3834764683-why-vpns-or-security-tools-can-block-wispr-flow
- Symptoms: **Connection lost**, **Couldn't reach Wispr Flow**. **Cause:** VPN, proxy, firewall, filtering/DNS filtering, or service interruption.
- Open a website; quit/reopen Flow. Briefly test without VPN/filter only if you control it, then restore; on managed networks involve IT (Configure your network for Wispr Flow, /articles/2021284475). Allowing website/download domains alone isn't enough for dictation.
- Proxy settings: Mac **System Settings → Network**; Windows **Settings → Network & internet → Proxy**; iPhone **Settings → Wi-Fi → network info → HTTP Proxy**; Android **Settings → Network & internet → VPN**; Chrome extension **No Internet Connection** → reopen popup, **Chrome Settings → System → Open your computer's proxy settings**.
- Android after drop: **Paste** (offline OK) or **Retry** (5 s on bubble, then History).
- Corporate SSO repeatedly signs you out → IT to review proxy certificate.

#### 8. Redirect loops when downloading from the website — all platforms
Source: https://docs.wisprflow.ai/articles/6203703148-redirect-loops-when-attempting-to-download-the-app-from-the-wispr-flow-website
- **Causes:** browser extensions/privacy settings, cached redirects, mistyped links (other download-site paths redirect to wisprflow.ai).
- Fix: try Chrome/Safari/Edge without extensions; clear cache; use direct links — Mac Apple Silicon dl.wisprflow.ai/mac-apple/latest, Intel /mac-intel/latest (check **Apple menu → About This Mac**; requires macOS Big Sur+); Windows dl.wisprflow.ai/windows/latest (x64 only, no ARM). Mobile: App Store / Google Play.
- Mac won't launch → wrong architecture build. Windows SmartScreen → **More info → Run anyway** (direct-link installer only); pause antivirus temporarily. dl.wisprflow.ai blocked by proxy/DNS/firewall breaks downloads and updates.

#### 9. Fake Android apps impersonating Wispr Flow — Android
Source: https://docs.wisprflow.ai/articles/6573848530-fake-android-apps-impersonating-wispr-flow
- Official app: **Wispr Flow** (not "Whisper Flow"), Android 13+, package **com.wispr.flowapp**. Only **Explore plan** starts Google Play purchase; official app never asks for passwords/codes outside sign-in.
- Plan labels: **Pro**, **Pro Trial**, **Student**, **Growth**, **Enterprise**; **Error** = plan couldn't load. Paid plan may take several minutes to appear: drawer → **Account → Manage plan**.
- Installed a fake: contact bank → uninstall → **Flag as inappropriate** on Play → install via wisprflow.ai/android → verify package ID → **Update Now** if **Update Required**. Refund from Google Play support.
- Report: drawer → **Report an issue** → choose Issue/Billing/Account management → **Send**.

#### 10. Captcha issues blocking login, downloads or subscriptions — Mac, Windows, iOS
Source: https://docs.wisprflow.ai/articles/8527688318-fix-captcha-issues-blocking-login-downloads-or-subscriptions
- Messages: "**Captcha error. Please try again.**", "**Too many attempts — please try again later.**" (wait up to 30 min resets/resends, 1 h sign-ups, 1 min network limits; VPN/shared networks hit limits sooner).
- Desktop: disable script-blocking extensions → different browser → clear wisprflow.ai cache/cookies → quit/reopen/update Flow. Web: "**Please complete the captcha.**", "**Captcha expired…**", "**We couldn't verify you're human…**".
- iOS: captcha on sign-up/forgot-password/resend; buttons disabled until complete; switching screens resets it; update via App Store. Errors: "**Verification challenge failed**", "**Network error during verification**", "**Verification cancelled**", "**Unable to initialize verification**". "**Verification service unavailable…**" → **Go Back** → use Google/Apple (**More Options** for Microsoft/SSO/Email).
- Android has no captcha.
- Rejected emails: only digits before @ ("**Invalid email address.**" / "**Authentication failed**", every sign-up path); new "+" aliases for email/password.
- Reset/sign-in links expire **15 minutes** after sending; reset signs you out on all devices.

#### 11. Service status alerts: incident banners & slow-dictation notifications — Mac, Windows, iOS
Source: https://docs.wisprflow.ai/articles/8923966034-service-status-alerts-incident-banners-and-slow-dictation-notifications
- **Orange** = degraded performance (desktop: "Dictation is a bit slower than usual. We're on it."; iOS: "We're seeing slower than normal dictation speeds."). **Red** = outage ("Service disruption: dictation may not work reliably right now."). Red never returns to orange.
- Desktop banner on Hub home only; iOS at top of Home/History. Informational — no action required; no close button.
- Open status: desktop **View status**; iOS tap banner; keyboard incident button. Direct: https://statuspage.incident.io/wispr-flow
- Desktop notifications after a dictation delay >3 s with known incident, max once/hour; not silenced by notification-category prefs. Status-page subscribers get no email for these incidents.
- No banner but slow → check mic or network.

#### 12. iOS missing audio chunks during unstable internet — iOS
Source: https://docs.wisprflow.ai/articles/9620169737-ios-missing-audio-chunks-during-unstable-internet
- Checks: **Almost there!** → **Finish setup** (without Full Access dictations aren't saved); incident button (octagon = outage, triangle = degraded) → **View incident**; load a webpage.
- Mid-dictation drop: Flow keeps transcribing and re-transcribes from saved audio; recovery ends after **30 s** without new speech.
- **Recover:** **Home** tab → long-press/swipe-left → **Retry** ("Retry your 0:42 transcript.") → wait → tap body text to copy ("Transcript copied to clipboard") → paste. No retry limit.
- Notifications: "Tap to view your transcript" (copies); "Your 1:23 dictation is saved" → "Tap to retry".
- 5-minute max dictation; calls/Siri/audio device changes stop recording. Flow auto-retries the latest empty entry >2 min old once per launch.
- Not recoverable: user-cancelled recordings, enforced-privacy mode, previous-day items with **Auto-delete transcripts** on, force-quit/crash mid-recording. Transcripts don't sync iPhone↔Mac. "**The transcription is empty.**" = no sound picked up (muted mic or in use elsewhere).


---

