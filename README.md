# 硬件自学 · self-taught hardware

A bilingual (中文 / English) self-study site for **electronics and embedded hardware** — from Ohm's law to microcontrollers, sensors, actuators and communication buses. Every chapter ships an **interactive circuit / waveform figure** so you grasp the *why* before writing code.

Built in the editorial style of the sibling **MATH_BOOK** project (beige paper, big serif display, orange-red accent, teal primary, running labels and ticker). Topic and part selection follow what the [Wokwi](https://wokwi.com) online simulator covers, so each chapter is "read it, then simulate it".

## Curriculum — 7 modules, 25 chapters

| # | Module | Chapters |
|---|---|---|
| H1 | 电路基础 · Circuit Foundations | Ohm's law · LED current-limiting · voltage dividers · capacitors & RC |
| H2 | 数字与模拟 I/O · Digital & Analog I/O | digital I/O · pull-ups & debouncing · PWM · ADC |
| H3 | 微控制器 · Microcontrollers | Arduino Uno / ATmega328P · ESP32 · Raspberry Pi Pico |
| H4 | 传感器 · Sensors | potentiometer & LDR · DHT22 · HC-SR04 ultrasonic |
| H5 | 执行器与显示 · Actuators & Displays | servos · DC & stepper motors · LCD1602 & OLED |
| H6 | 通信总线 · Communication Buses | UART · I²C · SPI |
| H7 | 智能护理床 · Smart Care Bed (capstone) | system & BOM · breathing/heart-rate (load cells + BCG) · turning/posture (pressure array + IMU) · bed-wetting & moisture · power/isolation & patient safety |

All 25 chapters have full bilingual "Core Notes" (`content/*.md`) with tables, Arduino code and spec strips. The **H7 capstone** applies the whole course to a real smart-care-bed monitoring system, grounded in a purchasable prototype BOM; it stays explicit that hobby-grade parts are *not* a medical device (compliance would need IEC 60601-class isolation).

## Interactive figures (`viz.jsx`)

Dependency-free canvas 2D, theme-aware, driven by sliders: Ohm's law water-pipe, LED + resistor (with over-current warning), voltage divider, RC charging curve, digital waveform, pull-up/pull-down, PWM duty cycle, ADC quantization staircase, servo pulse-width→angle, ultrasonic time-of-flight, UART frame, I²C transaction, BCG (heartbeat + breathing in a load-cell signal), and a live posture/bed-exit pressure map.

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
