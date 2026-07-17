## Core Notes

### Listening to a heartbeat by weighing?

This is the project's prettiest trick. As a person lies in bed, every heartbeat and every breath produces a tiny mass displacement — and the force carried through the bed legs to the floor **ripples** slightly with it. Reading a heartbeat out of the whole-body weight fluctuation is called **ballistocardiography (BCG)**. It's completely **contactless**: no electrodes to stick, no straps — the patient just lies there.

The catch: that ripple is **less than 1% of body weight**. Distinguishing a few tens of grams of heartbeat variation within a 70 kg reading demands a **high-resolution, low-noise** measurement chain.

### Load cells: strain gauges + a Wheatstone bridge

Inside a **load cell** are several **strain gauges** — elements whose resistance changes as they deform. They're wired into a **Wheatstone bridge (full bridge)**: under load the bridge goes unbalanced and outputs a tiny voltage difference (millivolts) proportional to the force.

This project puts **one load cell under each bed leg**, **4** in total:

- Common approach: four **50 kg half-bridge** cells combined into **one full bridge**;
- Or four **200 kg bar cells** carrying the load directly.

Summing the four gives the total weight on the bed; and hidden in their **shared ripple** are the breathing and heartbeat.

<div class="spec-strip">
<div class="cell"><div class="k">Legs</div><div class="v">×4</div></div>
<div class="cell"><div class="k">Each</div><div class="v">50/200kg</div></div>
<div class="cell"><div class="k">Bridge</div><div class="v">full</div></div>
<div class="cell"><div class="k">Signal</div><div class="v">mV</div></div>
</div>

### A 24-bit ADC: amplify the millivolts and quantize

A load cell's output is only a few millivolts, and the heartbeat component within it is at the microvolt level. An ordinary 10-bit ADC (see IO4) simply can't resolve it. So you use a **dedicated 24-bit ADC** with a built-in high-gain amplifier and very fine resolution:

| Part | Role | When |
|---|---|---|
| **HX711** | cheap, classic | starting out; total weight, rough breathing |
| **ADS1232** | low noise, good | for genuinely usable BCG quality |
| **ADS1220** | low noise, flexible | when you need more channels/config |

Use 1–4 ADCs: one for the combined bridge, or one per leg with digital summing. If you don't use an integrated part like the HX711, add an **instrumentation amplifier** (INA125 / INA333) for signal conditioning.

The interactive figure above draws this signal: **the slow wave is breathing, the sharp pulses are the heartbeat**, superimposed — and a BCG algorithm's job is exactly to separate the two and count their rates.

### From signal to heart rate and respiration rate

Given this ripple curve, software filters it into two bands:

- **Low band (~0.1–0.5 Hz)** → breathing wave → count peaks for **respiration rate**;
- **Higher band (~0.8–2 Hz)** → heartbeat pulses → count peaks for **heart rate**.

All of this runs on the Pi (recall CB1's layering: ESP32 samples, Pi fuses).

> ⚠ **Key point:** BCG uses **4 load cells under the bed legs** to contactlessly "weigh" the **<1%** heartbeat and breathing ripple within body weight. Success lives in the chain: **full-bridge load cells → a 24-bit low-noise ADC (HX711 to start, ADS1232 to advance) → filtering to separate**. Mount everything rigidly — mechanical vibration will drown the signal.
