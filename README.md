# 硬件自学 · self-taught hardware

A bilingual (中文 / English) self-study site for **electronics and embedded hardware** — from Ohm's law to microcontrollers, sensors, actuators, communication buses, and **ERP floor-hardware integration**. Every chapter ships an **interactive circuit / waveform / topology figure** so you grasp the *why* before writing code.

Built in the editorial style of the sibling **MATH_BOOK** project (beige paper, big serif display, orange-red accent, teal primary, running labels and ticker). Topic and part selection follow what the [Wokwi](https://wokwi.com) online simulator covers, so each chapter is "read it, then simulate it". Factory-integration chapters cross-reference the sibling **ERP_BOOK** (documents & posting discipline on that side; signals & wiring on this side).

## Curriculum — 9 modules, 33 chapters

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
| H9 | ERP 工厂硬件对接 · ERP Floor Hardware (project) | floor architecture map · scanner UART/USB HID · andon GPIO state machine · edge gateway (RS-485/Modbus → MQTT/HTTPS → ERP) |

The H8 module features an **interactive 3D model** of a parametric RG35XX-style handheld (82×130×16 mm) rendered with Google `model-viewer` (orbit/zoom, iso-render poster fallback), plus downloadable CAD in STEP/STL/3MF/GLB/build123d-`.py`. Assets live in `assets/handheld/`.

All chapters have full bilingual "Core Notes" (`content/*.md`) with tables, code and spec strips. Three **project modules** apply the course: **H7** smart care bed, **H8** Linux handheld, **H9** ERP floor capture (bridge to ERP_BOOK E11).

### Printable BOM shopping list

`#/bom` renders printable shopping lists for **H7** (care bed), **H8** (console catalog), and **H9** (ERP floor starter kit: scanner, andon, MAX485, ESP32 gateway). A dedicated `@media print` stylesheet strips the site chrome and prints ink-on-white.

## Interactive figures (`viz.jsx`)

Dependency-free canvas 2D, theme-aware, driven by sliders: Ohm's law water-pipe, LED + resistor (with over-current warning), voltage divider, RC charging curve, digital waveform, pull-up/pull-down, PWM duty cycle, ADC quantization staircase, servo pulse-width→angle, ultrasonic time-of-flight, UART frame, I²C transaction, BCG (heartbeat + breathing in a load-cell signal), a live posture/bed-exit pressure map, an emulation-power chart (SoC tier → which console generation is playable), plus H9 floor-zone map, scan→HID/UART flow, andon state machine, and the four-layer ERP protocol stack.

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
