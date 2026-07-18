# 硬件自学 · self-taught hardware

A bilingual (中文 / English) self-study site for **electronics and embedded hardware** — from Ohm's law to microcontrollers, sensors, actuators and communication buses. Every chapter ships an **interactive circuit / waveform figure** so you grasp the *why* before writing code.

Built in the editorial style of the sibling **MATH_BOOK** project (beige paper, big serif display, orange-red accent, teal primary, running labels and ticker). Topic and part selection follow what the [Wokwi](https://wokwi.com) online simulator covers, so each chapter is "read it, then simulate it".

## Curriculum — 8 modules, 29 chapters

| # | Module | Chapters |
|---|---|---|
| H1 | 电路基础 · Circuit Foundations | Ohm's law · LED current-limiting · voltage dividers · capacitors & RC |
| H2 | 数字与模拟 I/O · Digital & Analog I/O | digital I/O · pull-ups & debouncing · PWM · ADC |
| H3 | 微控制器 · Microcontrollers | Arduino Uno / ATmega328P · ESP32 · Raspberry Pi Pico |
| H4 | 传感器 · Sensors | potentiometer & LDR · DHT22 · HC-SR04 ultrasonic |
| H5 | 执行器与显示 · Actuators & Displays | servos · DC & stepper motors · LCD1602 & OLED |
| H6 | 通信总线 · Communication Buses | UART · I²C · SPI |
| H7 | 智能护理床 · Smart Care Bed (project) | system & BOM · breathing/heart-rate (load cells + BCG) · turning/posture (pressure array + IMU) · bed-wetting & moisture · power/isolation & patient safety |
| H8 | 掌上游戏机 · Handheld Game Console (project) | choosing hardware (SoC/screen/battery) · OS & firmware (Linux, boot-from-SD) · emulation stack (EmulationStation + RetroArch/libretro) · interfacing (SD layout, SSH, gamepad, your own code) |

All 29 chapters have full bilingual "Core Notes" (`content/*.md`) with tables, code and spec strips. Two **project modules** apply the course to real devices: **H7** to a smart-care-bed monitor (grounded in a purchasable prototype BOM; explicit that hobby parts are *not* a medical device — compliance needs IEC 60601-class isolation), and **H8** to evaluating and hacking a Linux handheld game console (R36S-class).

### Printable BOM shopping list

`#/bom` renders the H7 care-bed bill of materials as a **print-ready shopping list** (checkboxes, per-subsystem groups, starter/optional/product-grade tags, a "starter kit only" filter, and a Print / Save-as-PDF button). A dedicated `@media print` stylesheet strips the site chrome and prints ink-on-white.

## Interactive figures (`viz.jsx`)

Dependency-free canvas 2D, theme-aware, driven by sliders: Ohm's law water-pipe, LED + resistor (with over-current warning), voltage divider, RC charging curve, digital waveform, pull-up/pull-down, PWM duty cycle, ADC quantization staircase, servo pulse-width→angle, ultrasonic time-of-flight, UART frame, I²C transaction, BCG (heartbeat + breathing in a load-cell signal), a live posture/bed-exit pressure map, and an emulation-power chart (SoC tier → which console generation is playable).

## Stack

Zero build step. React 18 + Babel-standalone (in-browser JSX), `marked` for markdown. Progress and preferences (theme, language) persist in `localStorage` — no login, no backend.

| File | Role |
|---|---|
| `index.html` | shell + CDN scripts |
| `styles.css` | design system (shared with MATH_BOOK + hardware additions) |
| `i18n.jsx` | zh/en helpers + UI dictionary |
| `data.jsx` | curriculum metadata (modules, chapters) |
| `viz.jsx` | interactive canvas figures |
| `pages.jsx` | Home / Module / Chapter / About |
| `app.jsx` | router · theme · language · progress · nav |
| `content/*.md` | per-chapter bilingual notes |

## Run locally

Any static file server works; content is fetched over HTTP (so `file://` won't load the notes):

```bash
cd HARDWARE_BOOK
python -m http.server 8123
# open http://localhost:8123/
```

## License

MIT.
