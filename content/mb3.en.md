## Core Notes

### Two complementary clues: pressure map + orientation

"Has the patient turned? Have they left the bed?" has two complementary readings:

- **Pressure distribution** — a heat-map of the body pressing on the mattress. Where it's heavy and where it's empty is obvious at a glance, and it also reveals bed-exit and prolonged pressure on one spot (pressure-injury risk).
- **Inertial orientation** — an IMU on the body or bed frame that reports heading and motion directly.

Fusing both makes the decision robust: the pressure map shows "how the body is distributed on the bed", the IMU shows "how the body's orientation changes".

### Force-sensing resistors: more pressure, less resistance

Both **FSRs (force-sensing resistors)** and **Velostat conductive film** are "pressure → resistance" elements: more force, lower resistance. Wire one into a divider (see CF3) and read the voltage with an ADC to get the pressure at that point.

- Off-the-shelf: **Interlink FSR 402 / 406** round force sensors;
- Low-cost DIY: a **Velostat film + copper tape** row/column grid.

The interactive figure above is exactly such a pressure map: drag the "posture" slider and the highest-pressure **shoulders and hips** shift left/right with the body; click "simulate exit" and the whole map zeroes — precisely the basis of a bed-exit alarm.

### Scanning the grid with a multiplexer

A pressure mat has many sensing points (say 12×6), but ADC channels are limited. The fix is an **analog multiplexer**:

- The **CD74HC4067** is a 16-channel analog switch; 4 address lines pick "which channel connects to the ADC right now";
- Scan row by row / column by column to "read" the whole grid and assemble the pressure map. More points, more chips in parallel.

<div class="spec-strip">
<div class="cell"><div class="k">Sensor</div><div class="v">FSR</div></div>
<div class="cell"><div class="k">Mux</div><div class="v">16ch</div></div>
<div class="cell"><div class="k">Grid</div><div class="v">row×col</div></div>
<div class="cell"><div class="k">Read</div><div class="v">scan</div></div>
</div>

### IMU: accelerometer + gyro + fusion

An **IMU (Inertial Measurement Unit)** packs an accelerometer and a gyroscope (some add a magnetometer) into one chip, output over **I²C** (see BUS2). It tells you "which way the body faces and whether it's moving":

| Part | Traits |
|---|---|
| **MPU-6050** | 6-axis (accel + gyro), economy |
| **ICM-20948 / BNO055** | 9-axis, **built-in fusion**, gives stable heading directly |

The MPU-6050 is cheap but you do the fusion yourself; the BNO055 computes "orientation" internally — less work. Turning = a sustained change of orientation; bed-exit = the pressure map vanishing, perhaps with a burst of acceleration.

### Fusing into useful care decisions

Combine the two streams and software can produce genuinely useful conclusions:

- **Turn timer:** how long since the last posture change? Past a limit, prompt staff to reposition and prevent **pressure injuries**.
- **Bed-exit alarm:** the pressure map suddenly zeroing → the patient may be rising or falling; alarm immediately.
- **Posture recognition:** supine / left-lying / right-lying.

> ✦ **Key point:** turning and posture use a **pressure array + IMU** as two safeguards. A pressure mat (FSR/Velostat) is scanned into a heat-map through a **multiplexer**, while the IMU reports orientation over **I²C**. Fusing them makes turning, bed-exit and pressure-injury risk reliably detectable.
