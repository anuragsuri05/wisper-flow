// bewithflow key helper (macOS)
//
// Watches for the push-to-talk chord (e.g. Fn, or Control+Option) anywhere in
// macOS, pastes with a native Cmd+V, and reports the frontmost app so styles
// can follow the app you dictate into.
//
// Privacy: it never reports what you type. The only events it emits are about
// the configured chord: pressed, released, Space/Esc while held, or "broken"
// (another key was pressed during the hold).
//
// stdout (JSON lines): ready | need_permission | ptt_down | ptt_up | ptt_space
//                      | ptt_esc | ptt_broken | front{name,bundle,title} | pasted
// stdin  (lines):      chord <tokens>   e.g. "chord fn", "chord ctrl+alt"
//                      paste | front | quit

import AppKit
import ApplicationServices
import Foundation

setvbuf(stdout, nil, _IOLBF, 0)

func emit(_ obj: [String: Any]) {
    if let data = try? JSONSerialization.data(withJSONObject: obj),
       let line = String(data: data, encoding: .utf8) {
        print(line)
    }
}

// Device-dependent modifier bits (IOKit NX_DEVICE*KEYMASK) plus the Fn/Globe flag.
let LCTRL: UInt64 = 0x0000_0001, LSHIFT: UInt64 = 0x0000_0002, RSHIFT: UInt64 = 0x0000_0004
let LCMD: UInt64 = 0x0000_0008, RCMD: UInt64 = 0x0000_0010
let LALT: UInt64 = 0x0000_0020, RALT: UInt64 = 0x0000_0040, RCTRL: UInt64 = 0x0000_2000
let FN: UInt64 = 0x0080_0000

struct Held {
    var fn = false, lctrl = false, rctrl = false, lalt = false, ralt = false
    var lcmd = false, rcmd = false, shift = false
    var ctrl: Bool { lctrl || rctrl }
    var alt: Bool { lalt || ralt }
    var cmd: Bool { lcmd || rcmd }

    init() {}
    init(_ raw: UInt64) {
        fn = raw & FN != 0
        lctrl = raw & LCTRL != 0; rctrl = raw & RCTRL != 0
        lalt = raw & LALT != 0; ralt = raw & RALT != 0
        lcmd = raw & LCMD != 0; rcmd = raw & RCMD != 0
        shift = raw & (LSHIFT | RSHIFT) != 0
    }
}

var chord: Set<String> = ["fn"]

/// Chord is active when every named key is held and no other modifier group is.
func matches(_ h: Held) -> Bool {
    let wantCtrl = chord.contains("ctrl") || chord.contains("lctrl") || chord.contains("rctrl")
    let wantAlt = chord.contains("alt") || chord.contains("lalt") || chord.contains("ralt")
    let wantCmd = chord.contains("cmd") || chord.contains("lcmd") || chord.contains("rcmd")
    let wantShift = chord.contains("shift")
    for t in chord {
        switch t {
        case "fn": if !h.fn { return false }
        case "ctrl": if !h.ctrl { return false }
        case "lctrl": if !h.lctrl { return false }
        case "rctrl": if !h.rctrl { return false }
        case "alt": if !h.alt { return false }
        case "lalt": if !h.lalt { return false }
        case "ralt": if !h.ralt { return false }
        case "cmd": if !h.cmd { return false }
        case "lcmd": if !h.lcmd { return false }
        case "rcmd": if !h.rcmd { return false }
        case "shift": if !h.shift { return false }
        default: return false
        }
    }
    if !wantCtrl && h.ctrl { return false }
    if !wantAlt && h.alt { return false }
    if !wantCmd && h.cmd { return false }
    if !wantShift && h.shift { return false }
    return !chord.isEmpty
}

var active = false
var broken = false
var swallowedKeys = Set<Int64>()
var tap: CFMachPort?

let KEY_SPACE: Int64 = 49, KEY_ESC: Int64 = 53

let callback: CGEventTapCallBack = { _, type, event, _ in
    if type == .tapDisabledByTimeout || type == .tapDisabledByUserInput {
        if let t = tap { CGEvent.tapEnable(tap: t, enable: true) }
        return Unmanaged.passUnretained(event)
    }
    switch type {
    case .flagsChanged:
        let h = Held(event.flags.rawValue)
        let now = matches(h)
        if now && !active {
            active = true; broken = false
            emit(["e": "ptt_down"])
        } else if !now && active {
            active = false
            if !broken { emit(["e": "ptt_up"]) }
        }
        // A lone Fn chord: keep the Fn press away from apps so it doesn't type or toggle anything.
        if chord == ["fn"] && event.getIntegerValueField(.keyboardEventKeycode) == 63 {
            return nil
        }
    case .keyDown:
        guard active else { break }
        let code = event.getIntegerValueField(.keyboardEventKeycode)
        if code == KEY_SPACE {
            swallowedKeys.insert(code)
            if event.getIntegerValueField(.keyboardEventAutorepeat) == 0 { emit(["e": "ptt_space"]) }
            return nil
        }
        if code == KEY_ESC {
            swallowedKeys.insert(code)
            emit(["e": "ptt_esc"])
            return nil
        }
        if !broken { broken = true; emit(["e": "ptt_broken"]) }
    case .keyUp:
        let code = event.getIntegerValueField(.keyboardEventKeycode)
        if swallowedKeys.remove(code) != nil { return nil }
    default:
        break
    }
    return Unmanaged.passUnretained(event)
}

func installTap() -> Bool {
    let mask = (1 << CGEventType.flagsChanged.rawValue) | (1 << CGEventType.keyDown.rawValue) | (1 << CGEventType.keyUp.rawValue)
    guard let t = CGEvent.tapCreate(tap: .cgSessionEventTap, place: .headInsertEventTap, options: .defaultTap,
                                    eventsOfInterest: CGEventMask(mask), callback: callback, userInfo: nil) else {
        return false
    }
    tap = t
    let source = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, t, 0)
    CFRunLoopAddSource(CFRunLoopGetMain(), source, .commonModes)
    CGEvent.tapEnable(tap: t, enable: true)
    return true
}

func paste() {
    let src = CGEventSource(stateID: .combinedSessionState)
    let vKey: CGKeyCode = 9
    let down = CGEvent(keyboardEventSource: src, virtualKey: vKey, keyDown: true)
    let up = CGEvent(keyboardEventSource: src, virtualKey: vKey, keyDown: false)
    down?.flags = .maskCommand
    up?.flags = .maskCommand
    down?.post(tap: .cghidEventTap)
    up?.post(tap: .cghidEventTap)
    emit(["e": "pasted"])
}

func frontApp() {
    guard let app = NSWorkspace.shared.frontmostApplication else { emit(["e": "front"]); return }
    var title = ""
    let ax = AXUIElementCreateApplication(app.processIdentifier)
    var win: CFTypeRef?
    if AXUIElementCopyAttributeValue(ax, kAXFocusedWindowAttribute as CFString, &win) == .success, let w = win {
        var t: CFTypeRef?
        if AXUIElementCopyAttributeValue(w as! AXUIElement, kAXTitleAttribute as CFString, &t) == .success {
            title = (t as? String) ?? ""
        }
    }
    emit(["e": "front", "name": app.localizedName ?? "", "bundle": app.bundleIdentifier ?? "", "title": title])
}

func setChord(_ spec: String) {
    let tokens = spec.lowercased().split(separator: "+").map { String($0).trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
    chord = Set(tokens)
    active = false
    broken = false
}

if let i = CommandLine.arguments.firstIndex(of: "--chord"), i + 1 < CommandLine.arguments.count {
    setChord(CommandLine.arguments[i + 1])
}

// stdin commands, handled on the main thread
FileHandle.standardInput.readabilityHandler = { handle in
    let data = handle.availableData
    if data.isEmpty { exit(0) } // parent went away
    guard let text = String(data: data, encoding: .utf8) else { return }
    for line in text.split(separator: "\n") {
        let cmd = line.trimmingCharacters(in: .whitespaces)
        DispatchQueue.main.async {
            if cmd == "paste" { paste() }
            else if cmd == "front" { frontApp() }
            else if cmd == "quit" { exit(0) }
            else if cmd.hasPrefix("chord ") { setChord(String(cmd.dropFirst(6))) }
        }
    }
}

// Install the tap; without Accessibility permission, keep retrying until it's granted.
if installTap() {
    emit(["e": "ready"])
} else {
    emit(["e": "need_permission"])
    Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { timer in
        if installTap() {
            timer.invalidate()
            emit(["e": "ready"])
        }
    }
}

CFRunLoopRun()
