## Core Notes

### Two complementary clues: pressure map + orientation

"Has the patient turned? Left the bed? Is the posture right?" — no single sensor answers reliably; you need two **complementary** clues cross-checking each other:

- **Pressure distribution** — a heat-map of the body on the mattress. Where it presses hard and where it floats is clear at a glance: whether someone is in bed, what shape they lie in, whether they've pressed dead-still on one spot too long (pressure-injury risk), even pinpointing high-risk points like shoulders, hips and heels.
- **Inertial orientation** — an IMU on the body or bed frame reporting "heading" and "motion" directly. It doesn't know where the body presses, but it knows whether the body is supine or on its side and whether it's moving.

Why two clues? Each has a blind spot: the pressure map shows "shape" but not fine "orientation"; the IMU measures orientation but doesn't know if the person has left the bed. **Fusing** them makes the decision both sensitive and false-alarm-resistant — another instance of the project's "multi-sensor cross-validation" philosophy.

### Force-sensing resistors: more pressure, less resistance

The pressure map's base part is the **FSR (Force-Sensing Resistor)** or **Velostat conductive film**. Their principle is "pressure → resistance": unpressed, the resistance is high (megohms); the harder you press, the tighter the internal conductive particles touch, and the lower the resistance (down to hundreds of ohms).

How to read a resistance change as a voltage? Exactly the **voltage division** from CF3: put the FSR in series with a fixed resistor, tap the middle, and read it with an ADC (see IO4). More pressure → lower FSR resistance → the tap voltage changes → the ADC reads the pressure.

Two routes for parts:

- **Off-the-shelf: Interlink FSR 402 / 406** round sensors, consistent and durable, good for point measurements (bed legs, an alarm button).
- **Low-cost DIY: Velostat film + copper tape** in a crossed row/column grid. Two orthogonal layers of copper strips sandwich a Velostat layer; each crossing is one pressure point. This builds a whole **pressure mat** covering the bed for very little money — ideal for prototyping.

The interactive figure above is such a map: drag the "posture" slider and the two highest-pressure blobs — **shoulders and hips** — shift left/right with the body (pressure concentrates on one side when side-lying); click "simulate exit" and the whole map zeroes — the direct basis of a bed-exit alarm. Note the hips are usually both the highest-pressure and the most pressure-injury-prone site.

### Scanning the grid with a multiplexer

A pressure mat has many points. A 12×6 grid alone has 72, while an ESP32 or Arduino has only a few ADC channels — you can't wire one line per point. The fix is an **analog multiplexer**, an "electronic rotary switch":

- The **CD74HC4067** is a common 16-channel analog switch. **4 address lines** (2⁴ = 16) pick "which of the 16 inputs connects to the common output right now", and that output feeds the ADC.
- To scan, the MCU rapidly steps the address 0→15, connecting each channel and reading the ADC once — "scanning" all 16 points. More points, more chips in parallel or more address lines.

For a row/column grid, the usual approach is **energize a row, read the columns**: apply voltage to row 1, read each column's voltage in turn (the pressure at each point of row 1), then switch to row 2… scan all rows to get the full map. This is the same idea as scanning an LED matrix or a keyboard.

<div class="spec-strip">
<div class="cell"><div class="k">Sensor</div><div class="v">FSR</div></div>
<div class="cell"><div class="k">Mux</div><div class="v">16ch</div></div>
<div class="cell"><div class="k">Grid</div><div class="v">row×col</div></div>
<div class="cell"><div class="k">Read</div><div class="v">row scan</div></div>
</div>

### IMU: accelerometer + gyroscope + fusion

The second clue comes from an **IMU (Inertial Measurement Unit)**, which packs two or three sensors into one chip, output over **I²C** (see BUS2):

- **Accelerometer**: measures acceleration on three axes. At rest it feels gravity, so it can compute the chip's **tilt** relative to horizontal — the source of "facing up / left / right".
- **Gyroscope**: measures **angular velocity** (how fast it rotates) on three axes; integrate over time for the angle turned. It excels at capturing the rotation of "a turn".
- **Magnetometer** (only on 9-axis IMUs): like a compass, providing an absolute heading reference.

| Part | Traits |
|---|---|
| **MPU-6050** | 6-axis (accel + gyro), economy, you do the fusion |
| **ICM-20948 / BNO055** | 9-axis, **on-chip fusion**, outputs stable heading directly |

The accelerometer alone is disturbed by movement; the gyro alone **drifts** over time (integration error accumulates). **Fusing** the two with an algorithm (complementary or Kalman filter) yields an orientation estimate that's both stable and responsive. The MPU-6050 is cheap but you do the fusion on the Pi; the BNO055 computes quaternions / Euler angles internally so you just read a stable heading — easier but pricier.

Using the IMU: **a turn** = a sustained orientation change past a threshold (not a brief jitter); a **bed-exit precursor** = detecting sitting up or a large acceleration; combined with the pressure map suddenly zeroing, you can call bed-exit with high confidence.

### Fusing into useful care decisions

Hand both streams — pressure map and IMU — to the Pi to fuse, and software produces genuinely clinical conclusions:

- **Turn timer**: track "how long since the last posture change". Past a set limit (commonly 2 hours), prompt staff to reposition the patient and prevent **pressure injuries**. This is the subsystem's core value.
- **Bed-exit / fall alarm**: the pressure map suddenly clearing, or the IMU detecting violent motion followed by pressure vanishing → the patient may be rising or has fallen → alarm immediately. Critical for frail and post-op patients.
- **Posture recognition**: combine the pressure shape with IMU heading to classify supine / left-lying / right-lying / prone / sitting up.
- **Pressure-injury risk map**: accumulate "duration × pressure" per point and flag high-risk sites.

### Real-world pitfalls

- **FSR inconsistency**: FSRs from one batch can vary widely in resistance, and DIY Velostat grids vary point to point. Either calibrate each point, or use only relative/threshold decisions ("is there pressure" is more reliable than "how many pascals").
- **Creep and hysteresis**: under sustained pressure an FSR's reading drifts slowly (creep) and doesn't snap back to zero when released (hysteresis). Minor for change-detecting uses like turn detection, but watch it for absolute pressure measurement.
- **Scan crosstalk**: during grid scanning, unselected paths can leak current and create "ghosts". Diodes or active scanning mitigate it.
- **Wiring and durability**: with the bed surface repeatedly pressed and cleaned, a flexible grid's conductors fatigue and crack; choose flex-tolerant materials and secure them well.

### Pressure injuries: the condition this subsystem really prevents

To grasp this subsystem's value, first grasp the condition it prevents. A **pressure injury (pressure ulcer, "bedsore")** is the most common complication in bedridden patients and the one that best reflects care quality. The cause is direct: sustained pressure at a spot → capillaries there are pinched shut → tissue ischemia → cell death. It has two key variables: the **magnitude of pressure** and the **duration**. Low pressure for a long time, and high pressure for a shorter time, can both injure.

The high-risk sites are exactly where bone protrudes under thin soft tissue: the **sacrum (buttocks), heels, hips, shoulder blades, back of the head**. That's why CB3's figure draws the shoulders and hips as the two highest-pressure blobs — they're both load-bearing and injury-prone. The clinical golden rule for prevention is **timed repositioning** (commonly every 2 hours), and the seemingly simple timer "how long since the last turn" is this subsystem's most direct contribution to care: it turns "from memory and habit" into "with data and a reminder".

### Point FSRs vs a full-bed mat: two granularities

Pressure sensing has two approaches, very different in granularity and cost:

- **A few point FSRs**: one FSR at each key site (sacrum, heels). Cheap and simple, answering "how long has this high-risk point been pressed", but blind to the whole distribution.
- **A full-bed mat (dense grid)**: measurement points across the whole surface, drawing a complete pressure heat-map to localize precisely, compute a center of pressure and read posture shape. Rich but costly, with complex wiring and multiplexed scanning (above).

Prototypes often start with "point FSRs + a DIY sparse grid" to validate, moving to a commercial calibrated mat (Tekscan / XSensor) for a product. Another instance of "cheap first, then upgrade".

### Center of Pressure (CoP): from a pile of numbers to a decision

Given a full pressure map, how do you get a decision like "posture" out of dozens of values? A common intermediate quantity is the **Center of Pressure (CoP)** — treat every point's pressure as a weight and compute the weighted-average position, i.e. "the projection of the body's pressure centroid onto the bed".

- CoP centered, symmetric distribution → supine;
- CoP shifted to one side, pressure concentrated → side-lying (whichever side);
- CoP position making one clear, sustained migration over time → a turn occurred;
- CoP vanishing (total pressure dropping near zero) → bed-exit.

Reducing the high-dimensional pressure map to one or two understandable quantities like CoP, then combining with the IMU's heading, makes the decision both simple and robust. This is a very general idea in sensor processing: extract physically meaningful features first, then decide on the features.

### How an accelerometer measures tilt

Many wonder: how does a chip measuring "acceleration" know whether the person is supine or on their side? The key is **gravity**. At rest, an accelerometer doesn't read zero but reads the components of **gravitational acceleration g** along its three axes. Lying flat, g falls entirely on the Z-axis; stood up, g moves to other axes. From the ratio of g across the three axes, an inverse trig function gives the chip's **tilt** relative to horizontal.

So the IMU on the patient's chest or the bed frame judges orientation by "which axis gravity leans toward". Note this only works when **relatively still** — once motion acceleration mixes in, you can't tell gravity from motion, which is exactly where the gyroscope helps (trust the gyro when moving, the accelerometer when still, fuse them).

### Real-world pitfalls (more)

- **Thresholds aren't constants**: different patient weights and mattress firmnesses make the same "turn" change the pressure map by wildly different amounts. A good system self-calibrates or uses relative change rather than a fixed threshold.
- **Blankets and bedding**: a thick blanket spreads pressure and blurs the map; an IMU on top of the blanket measures the blanket, not the person. Think through the mounting.
- **Distinguish "a turn" from "a small movement"**: reaching or kicking changes pressure/posture but isn't an effective turn. Filter with amplitude threshold + duration + fusion.
- **Comfort and hygiene of long wear**: if the IMU is body-worn, consider attachment, skin irritation and cleanability — back to the care-setting theme of "durable and cleanable" (see CB4).

### Hands-on: build an IMU posture detector first

The pressure array involves a grid and multiplexing and is more complex; the IMU path is easiest to bring up first, so start there:

1. Connect an **MPU-6050** to the ESP32 over I²C (VCC/GND/SDA/SCL, recall BUS2).
2. Run an I²C scan first (the scanner from BUS2) to confirm you see its address (usually 0x68).
3. Read the accelerometer's three axes with a ready library and compute tilt:

```cpp
#include <Wire.h>
#include <MPU6050.h>
MPU6050 mpu;
void setup(){ Wire.begin(); Serial.begin(115200); mpu.initialize(); }
void loop(){
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);
  // at rest, judge orientation from gravity's components on each axis
  Serial.print(ax); Serial.print(' ');
  Serial.print(ay); Serial.print(' ');
  Serial.println(az);
  delay(200);
}
```

Lay the sensor flat, stand it up, roll it on its side, and watch which axis reads near ±1g — you see with your own eyes how "which axis gravity falls on" maps to orientation (the principle above). Set a few thresholds and you can tell supine / left-lying / right-lying — already a usable posture detector.

For the pressure array, go further: get "pressure → value" working with a **single FSR** on a divider + ADC, then expand to many points with a CD74HC4067 multiplexer scanning row by row (above). Again "smallest first, then scale".

### Troubleshooting (posture)

| Symptom | Likely cause | Where to look |
|---|---|---|
| Can't read the IMU over I²C | no common ground / no pull-ups / wrong address | check SDA/SCL, pull-ups, run an I²C scan first |
| Orientation reading drifts | gyro-only integration | fuse the accelerometer (complementary/Kalman) |
| Orientation jumps even at rest | motion acceleration mixed in / vibration | still-detection + filtering, mount rigidly |
| FSR grid shows "ghosts" | scan crosstalk | add diode isolation or active scanning |
| Same turn sometimes detected, sometimes not | threshold doesn't fit different people | self-calibrate, use relative change |

### Going further: from "detection" to "machine learning"

So far everything has been **rule-based**: set a threshold, watch a change, simple logic. That's fine to start, but real patients vary enormously and fixed rules easily miss cases. A step further is **machine learning**: collect lots of labelled data (this segment is supine, this a turn, this a bed-exit), train a classifier, and let it learn to judge posture from pressure-map + IMU features.

This is exactly why CB1 uses the Pi as the "brain" — rule logic runs on an ESP32, but training/inference needs compute. A typical flow: nodes sample raw data → the Pi extracts features (center of pressure, distribution shape, orientation, rate of change) → feed a lightweight model (decision tree, small neural net) → output posture class and events. Understand the "rules to learning" progression and you see how deep this subsystem can go.

### Going further: actively preventing pressure injuries

Detection is only step one; the greater value is **intervention**. With a pressure map, the system can not only prompt "time to turn" but:

- **Pressure-redistribution prompts**: point out "the sacrum has been under high pressure for 90 minutes", precise to the site, not just a generic timer.
- **Paired with a dynamic mattress**: high-end care beds use zoned inflatable air cushions, and the system **automatically** adjusts each zone's pressure from the pressure map to shift load off high-risk points — evolving from "prompt a human to turn" to "the bed relieves pressure itself".

This pushes the subsystem from "monitoring" toward "closed-loop control", stitching together the course's sensing and actuation (see the H5 actuators module).

### Chapter quick reference

| Quantity | Typical value/range | From |
|---|---|---|
| Turn-reminder interval | commonly 2 hours | clinical pressure-injury prevention |
| CD74HC4067 channels | 16 (4 address lines) | multiplexing |
| MPU-6050 I²C address | 0x68 | BUS2 |
| High-risk pressure sites | sacrum, heels, hips, shoulders, back of head | pressure-injury-prone spots |

> ✦ **Key point:** turning and posture use a **pressure array + IMU** as two safeguards. A pressure mat (FSR / Velostat) uses **voltage division** to turn pressure into voltage, then **row-by-row multiplexed scanning** into a heat-map; the IMU (accelerometer + gyro, fused) reports stable heading over **I²C**. Fusing them enables reliable **turn timing (prevent pressure injuries)**, **bed-exit alarms (prevent falls)** and posture recognition. Every single sensor has a blind spot — cross-validation is the key.
