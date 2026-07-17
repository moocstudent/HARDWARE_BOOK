## Core Notes

> ✦ This module is a **research / prototype-grade** project — the goal is to grasp the principles and build a working prototype. All parts are off-the-shelf hobby components; this is **not a medical device**. Turning it into a regulated commercial product requires medical-grade isolated parts and certification (IEC 60601, see CB5).

### A bed that reads the patient

Combine what the first six modules taught — sensors, ADCs, I²C, buses, power — and you can build something genuinely useful: a **smart care bed** that continuously monitors a patient. It answers four questions:

1. **Is the patient still breathing normally?** (breathing & heart rate → CB2)
2. **How long since they turned? Are they leaving the bed?** (posture & turning → CB3)
3. **Is the bed wet?** (bed-wetting → CB4)
4. **If the power fails, or it touches the patient — is it safe?** (power & isolation → CB5)

### A layered architecture: brain + senses

The system splits into two layers, each with its job:

- **Controller (brain):** a **Raspberry Pi 5** (4–8 GB) + power supply + microSD card. It handles **sensor-data fusion, edge machine learning, the user interface and network communication**. Powerful and Linux-based, it's suited to the "thinking".
- **Sensor node (senses):** one or more **ESP32-DevKitC** boards (or STM32 Nucleo, Cortex-M). They do **real-time sampling** — sitting close to the sensors, taking readings on a fixed beat. The ESP32 has Wi-Fi/BLE to send data back to the Pi wirelessly.

Why layer it? Real-time sampling (say hundreds of load-cell reads per second) is timing-sensitive and best left to a dedicated MCU, while the heavy lifting — fusion, UI, networking — goes to the powerful Pi. This "co-processor" division of labour is very common in embedded systems.

<div class="spec-strip">
<div class="cell"><div class="k">Brain</div><div class="v">Pi 5</div></div>
<div class="cell"><div class="k">Senses</div><div class="v">ESP32</div></div>
<div class="cell"><div class="k">UI</div><div class="v">7" screen</div></div>
<div class="cell"><div class="k">Uplink</div><div class="v">WiFi/Eth</div></div>
</div>

### Four monitoring subsystems

| Subsystem | Monitors | Core parts | Chapter |
|---|---|---|---|
| Breathing / heart rate | breathing, heartbeat (BCG) | 4× load cells + HX711/ADS1232 | CB2 |
| Turning / posture / exit | orientation, pressure map | FSR pressure array + IMU | CB3 |
| Bed-wetting / moisture | is it wet | moisture electrodes + SHT40 | CB4 |
| Power / isolation / safety | patient safety, backup | isolated PSU + digital isolators + battery | CB5 |

### The prototype BOM and sourcing

This project's bill of materials (BOM) is **directly purchasable**: every part is in stock at **Digi-Key, Mouser, Amazon, Adafruit, SparkFun** and similar. The selection logic is "prove the principle with the cheapest thing that runs, then upgrade as needed" — e.g. start the weighing ADC with a cheap HX711, and swap to an ADS1232 for higher-quality BCG.

**Minimal starter kit** (the cheapest runnable prototype):
> Raspberry Pi 5 · ESP32 · 4×50 kg load cells · HX711 · Velostat film + copper tape (pressure grid) · MPU-6050 · capacitive moisture sensor · SHT40 · breadboard + jumpers + 5 V supply.

> ✦ **Key point:** the smart care bed = **a Raspberry Pi for fusion and UI + ESP32 nodes for real-time sampling**, with four sensing subsystems below. Prototype with off-the-shelf hobby parts to prove the principles; medical-grade parts and compliance come with productisation (CB5).
