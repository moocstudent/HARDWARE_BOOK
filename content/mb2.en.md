## Core Notes

### Listening to a heartbeat by weighing?

This is the project's prettiest trick. As a person lies in bed, every heartbeat and every breath shifts the body's mass distribution ever so slightly — blood is pumped, the chest rises and falls, the center of mass moves a touch. The force carried through the bed legs to the floor **ripples** with it. Reading a heartbeat and breathing out of the whole-body weight fluctuation is called **ballistocardiography (BCG)**.

BCG has a huge advantage: it's completely **contactless and imperceptible**. The patient sticks on no electrodes, wears no chest strap, needn't even know the bed is measuring — they just lie there. For bedridden, fragile-skinned or uncooperative patients (e.g. elderly with dementia), this "zero-disturbance" monitoring is extremely valuable. The price is a **very weak signal**: the weight ripple from breathing is a few percent of body weight, and from the heartbeat it's **less than 1%** — distinguishing a few tens of grams of heartbeat variation within a 70 kg reading places harsh demands on the chain's resolution and noise. The heart of this chapter is building a chain that can "hear" a signal this faint.

### Load cells: strain gauges + a Wheatstone bridge

To understand the measurement, first understand the **load cell** itself. At its core is a **strain gauge** — a resistive wire bonded to a metal elastic body; when the metal deforms minutely under load, the wire stretches or compresses and its resistance changes. Deformation → resistance change is the first step of turning "force" into "electricity".

But a single gauge's resistance change is tiny and highly temperature-sensitive (metal expands/contracts with heat, changing resistance too). The fix is to arrange four gauges into a **Wheatstone bridge**:

```text
        Vcc
         │
    ┌────┴────┐
   R1        R2
    │────┬────│  ← output V+ / V− (differential)
   R4        R3
    └────┬────┘
        GND
```

Four gauges form the four arms of the bridge, two in tension, two in compression. Unloaded, the bridge is balanced and the output is zero; under load it goes unbalanced and outputs a **differential voltage** proportional to the force. Two elegant benefits: sensitivity **doubles** (tension and compression changes add), and temperature is **auto-compensated** (all four arms drift together and cancel). That's why load cells almost always use a full bridge rather than a lone gauge.

Its output is usually given as a **sensitivity** in **mV/V**: e.g. 2 mV/V means, at full-scale load, 2 mV out per volt of excitation. With 5 V excitation and 2 mV/V, full scale is only 10 mV — **millivolts**, and only when fully loaded; the heartbeat component we care about is a **few microvolts** within those 10 mV. That's how faint the signal is.

<div class="spec-strip">
<div class="cell"><div class="k">Legs</div><div class="v">×4</div></div>
<div class="cell"><div class="k">Each</div><div class="v">50/200kg</div></div>
<div class="cell"><div class="k">Bridge</div><div class="v">full</div></div>
<div class="cell"><div class="k">Sens.</div><div class="v">~2mV/V</div></div>
</div>

### Four bed legs into a "scale + stethoscope"

This project puts **one load cell under each bed leg**, **4** in total. Why four? Because we're weighing "the whole bed + patient", and the weight is distributed over four supports — all four must be measured and summed for the total. Two common wirings:

- Four **50 kg half-bridge** cells combined electrically into **one full bridge** feeding a single ADC. The most economical (same as a bathroom scale); the four "half-bridge corners" make one complete Wheatstone bridge.
- Four **200 kg bar (full-bridge)** cells, each carrying and read independently, summed digitally. Higher capacity, for heavier beds.

Summing the four is the "scale" part — telling you whether someone's on the bed and roughly how heavy. The **shared ripple** of the four — the part that jitters gently over time — is the "stethoscope" part, holding breathing and heartbeat. Mount everything **rigidly, with no wobble**: any mechanical looseness or frame resonance produces interference far larger than the heartbeat signal and drowns it completely.

### A 24-bit ADC: amplify and quantize the microvolts

An ordinary MCU's 10-bit ADC (see IO4) spans 5 V in 1024 steps, ~5 mV each — but our whole signal is 10 mV and the heartbeat component a few microvolts. Using it for BCG is like measuring a hair with a meter stick — **thousands of times too coarse**. So you need a **24-bit ADC designed for weighing**, with a built-in low-noise high-gain amplifier (PGA) and very fine resolution:

| Part | Resolution / traits | Role | When |
|---|---|---|---|
| **HX711** | 24-bit, gain 128, cheap (a few dollars) | classic starter | starting out; total weight, rough breathing |
| **ADS1232** | 24-bit, low noise, dual channel | advanced | for genuinely usable BCG (heartbeat) quality |
| **ADS1220** | 24-bit, configurable, flexible | flexible | when you need more channels/sample-rate config |

Their interface is simple: the HX711 uses an SPI-like two-wire protocol (clock + data), wrapped by libraries. Use 1–4 chips: one for the combined bridge, or one per leg summed digitally (the latter also reveals each leg's load separately — useful for posture, echoing CB3).

If you don't use an HX711-style part with a **built-in amplifier** and instead take a generic ADC, you must add an **instrumentation amplifier (INA125 / INA333)** up front — it specifically amplifies the weak differential signal and rejects common-mode noise, lifting the millivolt signal into a range the ADC reads comfortably. That's **signal conditioning**: shaping the signal to the right amplitude and signal-to-noise ratio before quantizing.

### From raw waveform to respiration rate and heart rate

The interactive figure above draws this signal: **the slow, large wave is breathing, the sharp small pulses are the heartbeat**, superimposed (with noise mixed in). Given this composite curve, the Pi (recall CB1's layering: ESP32 samples, Pi does the heavy compute) uses **digital filtering** to split it into two bands:

- **Low band (~0.1–0.5 Hz, i.e. 6–30 per minute)** → low-pass to extract the breathing wave → count the interval between adjacent peaks → **respiration rate**.
- **Higher band (~0.8–2 Hz, i.e. 48–120 per minute)** → band-pass to extract the heartbeat pulses → count peaks → **heart rate**.

Drag the "heart rate" and "respiration" sliders in the figure above and you can see how the two components coexist in one curve and how their frequencies differ — exactly the physical basis that lets filtering separate them. Real algorithms also do **peak detection, outlier rejection and moving averages** to fight noise and patient movement.

### Real-world pitfalls

- **Movement drowns everything**: a turn or a cough produces weight changes orders of magnitude larger than the heartbeat; those seconds of BCG are unusable. The algorithm must detect and skip movement segments.
- **Mechanical coupling and resonance**: the frame, the floor, someone walking nearby all inject vibration. Mount sensors rigidly and add mechanical isolation if needed.
- **Thermal drift**: though the full bridge compensates most temperature effects, long-term monitoring still has a slow baseline drift; remove the DC component with a high-pass filter.
- **Calibration**: for accurate "weight", calibrate each channel with **known-mass calibration weights** (see the CB5 bench list). BCG's "heart/respiration rate" depends more on timing (frequency) than absolute amplitude, so it's less demanding on calibration.

### Ratiometric measurement: why the excitation needn't be rock-steady

A load cell's output is in mV/V — note that unit: the output is proportional to the **excitation voltage**. This gives a clever property: if the bridge excitation and the ADC's reference voltage come from the **same supply**, then when that supply drifts, the sensor output and the ADC's full scale **change in proportion and cancel**. This is **ratiometric measurement**.

Its practical meaning: you don't need an expensive, ultra-stable reference — use an ordinary 5 V rail for both excitation and ADC reference, and supply drift cancels automatically. Chips like the HX711 are designed exactly this way: they provide a regulated output for the bridge and use it as the ADC reference too. Understand ratiometric measurement and you see why cheap weighing schemes still achieve decent stability.

### The HX711's sample rate and BCG's bandwidth

The HX711 has two sample rates: **10 SPS (per second)** and **80 SPS**. Don't dismiss this — it directly decides whether you can capture a heartbeat. By the **Nyquist sampling theorem**, to reconstruct a signal of frequency f without distortion, you must sample at least 2f.

- **Breathing** is ~0.2–0.5 Hz; 10 SPS (well above 2×0.5=1) is plenty.
- **Heartbeat** is ~1–2 Hz; in theory 10 SPS suffices (2×2=4 < 10), but the BCG heartbeat waveform has sharper components, and sampling too slowly loses waveform detail and misplaces the peaks. So for heart rate you usually use **80 SPS** to give the waveform enough bandwidth.

That's why "rough breathing is fine on the HX711's 10 SPS, but serious heartbeat wants 80 SPS or an ADS1232 (up to hundreds of SPS)" — match the sample rate to the frequency of the signal you care about. It's the IO4 ADC knowledge put to real use.

### What a BCG waveform looks like

A real BCG heartbeat waveform isn't a simple spike but a set of named undulations: mainly the **I, J, K waves** (plus smaller G, H, L), corresponding to cardiac ejection, blood striking the aortic arch and a chain of mechanical events. The **J wave** is the largest and most stable, so heart-rate detection usually **counts J-wave intervals**. You needn't memorise the letters, but knowing "BCG has a fixed waveform morphology" helps: a good algorithm doesn't just find zero-crossings but recognises this characteristic shape, robustly locating each heartbeat in noise.

### Where the noise comes from, and how to fight it

The BCG signal is weak but noise is everywhere. Categorise the noise to treat it:

| Noise source | Character | Countermeasure |
|---|---|---|
| Body movement (turning, cough) | huge amplitude, sudden | detect and skip that segment |
| Mains hum (50/60 Hz) | fixed frequency | notch filter + shielding/grounding |
| Mechanical vibration (walking, equipment) | broadband, intermittent | rigid mounting, isolation |
| Thermal drift | very slow baseline drift | high-pass to remove DC |
| ADC/amplifier noise floor | random, continuous | low-noise parts, averaging |

A good pipeline is usually: **remove DC (high-pass) → remove mains (notch) → split bands (band-pass for breathing/heartbeat) → peak detection → movement rejection → smoothing**. Each step targets a row of the table.

### The calibration procedure

For accurate absolute weight, do a two-point calibration with **known-mass weights**:

1. **Zero**: read with no one on the bed, the raw value for 0 kg (tare).
2. **Span**: place a known weight (e.g. 20 kg), record the raw value, and compute the **scale factor** ("raw counts per kilogram").

Then `weight = (raw − zero) × scale factor`. Ideally calibrate each of the four channels and sum. BCG's heart/respiration rate looks only at frequency and is insensitive to absolute calibration, but **taring matters** — remove the static weight to amplify and see the tiny dynamic ripple.

### Why BCG rather than something else

There are other routes to contactless breathing/heart-rate sensing, each a trade-off; the comparison sharpens BCG's place:

- **Piezo film / pneumatic mattress**: a piezo or air sensor in the mattress feels the undulation. Sensitive, but needs a special mattress and differs from the bed-leg approach.
- **mmWave radar**: transmit EM waves and measure chest micro-motion. Fully contactless, even through a blanket, but the part is pricey, the algorithm complex, and it's disturbed by other motion.
- **Camera (rPPG)**: analyse tiny skin-colour changes for heart rate. Needs good lighting and a visible face — unsuited to sleeping under a blanket.

**The unique benefit of BCG with load cells**: the sensors hide under the bed legs, the patient feels nothing, and it doubles as a scale and a bed-occupancy detector (echoing CB3's bed-exit). The cost is the weakest signal and the most sensitivity to mounting and movement. Choosing it is a trade-off between "zero disturbance" and "signal difficulty" — the essence of engineering selection: no free lunch, only trade-offs.

### Hands-on: from "electronic scale" to "hearing a heartbeat"

Build in two stages, easy first, validating each:

**Stage one: make a breathing scale.**

1. Wire the 4 × 50 kg half-bridge load cells in the "combine into a full bridge" configuration (standard diagrams abound: the four outputs merge into one bridge as E+/E−/A+/A−).
2. Connect the bridge to the **HX711**'s differential inputs; the HX711's clock/data pins to an ESP32 (or Arduino).
3. Read with a ready HX711 library and `Serial.println`:

```cpp
#include "HX711.h"
HX711 scale;
void setup() {
  Serial.begin(115200);
  scale.begin(/*DT*/2, /*SCK*/3);
  scale.set_scale();   // no factor yet
  scale.tare();        // tare: record current weight as 0
}
void loop() {
  Serial.println(scale.get_units(1), 3);   // one read, 3 decimals
}
```

Set `set_scale()`'s factor with calibration weights (see the calibration procedure above), and you have a scale that reads body weight — **the foundation of all BCG**.

**Stage two: "mine" breathing and heartbeat from the scale.**

Set the sample rate to 80 SPS, have someone lie down and stay still, and record raw data continuously for tens of seconds. Export and plot it, and you'll see, riding on the body-weight baseline, a slow breathing wave (in sync with the chest). That's BCG entry-level. To separate the heartbeat further, move to a lower-noise ADS1232 and add digital band-pass filtering (above).

**Key reminder: mounting decides success.** The sensors must sit firmly under the bed legs, the frame must not wobble, the floor must be stable. Simulate a "bed" with a small tabletop + four sensors first to exclude a full bed's resonance and see a clear breathing wave more easily.

### Troubleshooting (BCG)

| Symptom | Likely cause | Where to look |
|---|---|---|
| Readings jump erratically | miswiring / bridge wrong / loose wire | verify the full-bridge wiring, check joints and connectors |
| Stable reading but no breathing wave | sample rate too low / not tared / mounted too "dead" | raise to 80 SPS, tare, check there's room for tiny deflection |
| Breathing wave but heartbeat lost in noise | HX711 noise floor / mains hum | switch to ADS1232, add notch + band-pass, improve grounding |
| Off-scale on any movement | normal (movement >> heartbeat) | the algorithm must detect and skip movement segments |
| Slow baseline drift | thermal drift | high-pass to remove DC |

> ⚠ **Key point:** BCG uses **4 load cells under the bed legs** to contactlessly "weigh" the **<1%** heartbeat and breathing ripple within body weight. The whole chain's success is about fighting a weak signal: **full-bridge load cells (strain gauges + Wheatstone bridge, with built-in sensitivity doubling and temperature compensation) → a 24-bit low-noise ADC (HX711 to start, ADS1232 to advance, with an INA instrumentation amp for signal conditioning if needed) → digital band-pass filtering to separate breathing from heartbeat**. Mount rigidly — mechanical vibration and body movement are enemy number one.
