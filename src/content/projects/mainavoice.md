---
title: 'Maina Voice - Free Speech-to-Text Dictation Born from a Failed Desktop App'
description: A local-first speech-to-text workbench built after 29 hours of agent coding sessions and failed desktop experiments.
publishDate: 'Aug 2026'
isFeatured: false
seo:
  image:
    src: '/media/projects/mainavoice.png'
    alt: Maina Voice dictation workbench preview
---

![Project preview](/media/projects/mainavoice.png)

<a href="https://mainavoice.lat" target="_blank">Visit Maina Voice</a>

I wanted a free, lightweight alternative to tools like <mark>Wispr Flow</mark>.

My actual friction was simple: I spend hours every day inside terminal sessions and coding agent environments. Typing out multi-paragraph instructions or detailed context by hand is slow and breaks focus. I wanted a quick tool where I could speak, get accurate text in seconds, and paste it straight into my terminal, without paying a $15 monthly subscription or sending my voice recordings to a random server.

I named the project after the Maina (or Myna), the famous South Asian talking bird legendary across Pakistan and India for mimicking human speech with remarkable fidelity.

Getting it to work took over twenty-nine hours of active agent coding sessions, plus countless unrecorded hours of staring at crash logs.

## Desktop App Rabbit Hole

I did not start with a web app. I wanted a native desktop utility that would sit quietly in my system tray.

First, I tried building it with <mark>Flutter</mark> for desktop. I designed a Warm Neutral palette with cream and charcoal tones, but Linux audio capture plugins were completely unstable. They crashed unpredictably and produced corrupted audio headers. To even play back audio files, I had to resort to messy subprocess calls to `ffplay`.

Then I threw that away and rebuilt it in <mark>Tauri</mark> with Rust and Vue 3. That opened a whole new set of headaches: window drag region glitches and persistent microphone permission bugs across Linux and macOS.

My session telemetry shows 16.8 hours of active terminal work across more than 4,600 interaction events on the desktop attempts alone. And that was just the time the tools were running. It does not count the time I spent pacing around, reading ALSA audio documentation, and trying to figure out why the microphone buffer dropped.

I had to stop and be honest with myself. Fighting native audio drivers and desktop operating system permissions was a massive sinkhole. I decided to scrap the native desktop code and build a clean, local-first web app instead.

## Web Pivot and How It Works

Moving to the browser made everything simpler. Modern browsers already have dependable audio APIs, and you do not need to compile native binaries just to turn voice into text.

1. **Lightweight Capture**: You open the tab, hit record, and talk. The browser's native `MediaRecorder` API captures a compact WebM Opus stream directly from your microphone. There is zero client-side audio encoding overhead.
2. **Local Storage Only**: Every recording, generated transcript, and configuration stays in your browser's IndexedDB. Nothing touches a central server.
3. **Bring Your Own Key**: You plug in your own API key for <mark>OpenRouter</mark> or <mark>Groq</mark>. The audio payload goes directly from your browser to the provider over HTTPS, so no middleman server ever logs your voice.
4. **Side-by-Side Model Comparison**: You can benchmark multiple engines on the exact same audio clip. It tests <mark>OpenAI</mark> GPT-Transcribe ($0.0045/min), <mark>Deepgram</mark> Nova-3 ($0.0043/min), <mark>NVIDIA</mark> Parakeet TDT v3 ($0.0015/min), <mark>Fish Audio</mark> Transcribe-1 ($0.0001/min), and <mark>Groq</mark> Whisper to see which model delivers the fastest results for your accent.
5. **Offline Transliteration**: When models transcribe mixed Hindustani audio, text often returns in Devanagari script. Instead of making another paid API call, an offline character map converted from the `Indic-PersoArabic-Script-Converter` project translates Devanagari to Urdu instantly in the browser.

## Technical Stack

- **Frontend:** Vue 3 using `<script setup>` with Vite and Pinia
- **Components:** Reka UI primitives styled with Tailwind CSS
- **Audio Pipeline:** Browser MediaRecorder API capturing compact WebM Opus payloads
- **Storage:** IndexedDB (`mainavoice_indexeddb`) for client-side privacy
- **Open Source:** Available on GitHub at [osspakistan/mainavoice-web](https://github.com/osspakistan/mainavoice-web)

## Unrecorded Hours and the Reality Check

When I look at the telemetry across all 17 agent coding sessions on this project, the numbers look tidy: 29.43 active hours and 7,493 interactive messages over 56 calendar days. The web version took less than 11 active hours to build once the desktop dead-ends were cleared out.

What those logs never show is the time between prompts. The minutes spent testing an audio input, checking a transcription output, and deciding whether an architectural direction was worth pursuing. Coding tools only record keystrokes and execution cycles; the hardest engineering decisions happen in the silence between messages.

Maina Voice solved my personal problem. Whenever I need to feed a long prompt or instruction into my terminal, I open the site, dictate for thirty seconds, grab the text, and get back to work.

I am not going to pretend this is an actively maintained business. I got it to the point where it scratched my personal itch, open-sourced the repository, and moved on. I no longer push new features, but the web version is live, free, and does its job without any subscription nonsense.
