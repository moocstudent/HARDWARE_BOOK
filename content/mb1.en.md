## Core Notes

> ✦ This module is a **research / prototype-grade** project — the goal is to grasp the principles and build a working prototype. All parts are off-the-shelf hobby components; this is **not a medical device**. Turning it into a regulated commercial product requires medical-grade isolated parts and certification (IEC 60601, see CB5).

### A bed that reads the patient

Combine what the first six modules taught — voltage and current, digital and analog I/O, microcontrollers, sensors, communication buses — and you can build something genuinely useful: a **smart care bed** that continuously monitors a patient. It's not a single instrument but a **distributed sensing-and-decision system** tucked quietly into the bed, answering four questions that truly matter in care, 24/7:

1. **Is the patient still breathing normally?** Apnea and sudden changes in respiration rate are early signs of many acute events. The traditional approach — a chest strap or electrodes — is uncomfortable and poorly tolerated. We want to measure it **completely contactlessly** (see CB2).
2. **How long since they turned? Are they leaving the bed?** A bedridden patient who doesn't turn for a few hours develops ischemia and tissue death in the pressure points — a **pressure injury (bedsore)**, one of the most important indicators of care quality. And frail, post-op or cognitively impaired patients who leave the bed unaided fall easily (see CB3).
3. **Is the bed wet?** Untreated incontinence macerates skin, invites infection and accelerates pressure injuries. Timely, accurate alerts markedly ease the nursing burden (see CB4).
4. **If the power fails, or it touches the patient — is it safe?** The moment a device is electrically connected to a body, patient safety (isolation, leakage current) outranks everything; and monitoring must not stop for a power cut or a transfer (see CB5).

Each of these four questions maps to a class of sensing principle, and each maps to a block of knowledge from earlier in this course. **Fusing** them is what "smart" really means: any single sensor false-alarms, but cross-checking several streams makes the decision reliable.

### Why "layer" it: brain + senses

Beginners often think, "Can't one Arduino do it all?" No — because this system holds two **fundamentally different** kinds of task:

- **Real-time, high-frequency, timing-sensitive sampling**: reading load cells hundreds to thousands of times per second, precisely timing an ultrasonic echo. These demand a "steady beat" and distort the moment something interrupts them.
- **Heavy, not-so-real-time computation**: filtering raw waveforms, running ML to classify posture, rendering a touchscreen UI, uploading over Wi-Fi. These can hiccup tens of milliseconds without harm, but they're compute-hungry.

Cram both into one chip and they drag each other down: sampling gets interrupted by a UI redraw, or an algorithm saturates the CPU and drops samples. The standard engineering answer is a **layered / co-processor architecture** — a dedicated small chip handles real time, a powerful controller handles thinking.

<div class="spec-strip">
<div class="cell"><div class="k">Brain</div><div class="v">Pi 5</div></div>
<div class="cell"><div class="k">Senses</div><div class="v">ESP32</div></div>
<div class="cell"><div class="k">UI</div><div class="v">7" screen</div></div>
<div class="cell"><div class="k">Uplink</div><div class="v">WiFi/Eth</div></div>
</div>

### The controller (brain): Raspberry Pi 5

The system's "brain" is a **Raspberry Pi 5** (4–8 GB RAM) + PSU + microSD card. It's a full Linux computer (recall the MC module's distinction between microcontrollers and single-board computers) and takes on everything that needs "thinking":

- **Sensor-data fusion**: align, weight and cross-validate streams from several nodes and sensor types into conclusions like "respiration = X, posture = left-lying, bed dry".
- **Edge machine learning**: run lightweight models locally to tell "a turn" from "normal small movements", or separate heartbeat from weight ripple — without shipping sensitive health data to the cloud.
- **User interface**: drive a 7-inch touchscreen with live traces and alarms for bedside staff.
- **Networking**: report status and alarms to a nurses' station or phone over Ethernet / Wi-Fi.
- **Storage and logging**: record trends for a clinician to review.

The Pi runs Linux, has ample RAM and compute, and a rich ecosystem (Python, OpenCV, ML frameworks all ready to go) — perfect for these jobs. But it's **poorly suited** to hard-real-time sampling: Linux isn't a real-time OS, and its scheduler introduces unpredictable latency.

### The sensor nodes (senses): ESP32

Sitting right on the sensors, sampling on a fixed beat, are one or more **ESP32-DevKitC** boards (or Cortex-M MCUs like the STM32 Nucleo). They're the system's "sensory endings":

- **Real-time sampling**: the ESP32 is a bare-metal / RTOS environment that reads the ADC and times events at a steady rate, undisturbed by UI or network.
- **Local processing**: do preliminary filtering and packing on the node to cut the data volume sent to the Pi.
- **Wireless return**: the ESP32 has **Wi-Fi and Bluetooth (BLE)** built in, so sensor nodes on the bed legs, mattress and rails can each be independent with minimal wiring.

Why several nodes instead of one? Because the sensors live in different places (four bed legs, mattress, moisture pad); putting a node close to each is far more noise-immune and maintainable than dragging dozens of analog wires back to one center. This is the same **distributed acquisition** logic used on industrial sites.

### How the two layers talk

The brain and senses need a link. Common choices, each a trade-off:

| Link | Traits | Suits |
|---|---|---|
| **Wi-Fi (TCP/MQTT)** | wireless, high bandwidth, cross-room | distant nodes, cloud |
| **BLE** | low power, short range | battery-powered small nodes |
| **UART serial** (see BUS1) | simple, reliable, wired | nodes inside the bed |
| **CAN bus** (see CB5) | noise-immune, multi-node, long | networking many beds |

Whichever link, node and controller must agree on a **message format**: each frame carrying "node ID + timestamp + sensor type + value + checksum". The timestamp matters especially — to fuse data from several nodes you must know when each was sampled, or they won't align.

### The four subsystems and the knowledge map

| Subsystem | Monitors | Core parts | Prerequisite knowledge | Chapter |
|---|---|---|---|---|
| Breathing / heart rate | breathing, heartbeat (BCG) | 4× load cells + HX711/ADS1232 | ADC (IO4), signal conditioning | CB2 |
| Turning / posture / exit | orientation, pressure map | FSR array + IMU | ADC, I²C (BUS2), multiplexing | CB3 |
| Bed-wetting / moisture | is it wet | moisture electrodes + SHT40 | dividers (CF3), I²C | CB4 |
| Power / isolation / safety | patient safety, backup | isolated PSU + digital isolators + battery | power, isolation, CAN | CB5 |

Notice the project uses nearly the whole course: **resistor dividers** read the moisture electrode, **the ADC** reads load cells and pressure, **PWM/GPIO** drive alarms, **I²C** connects the IMU and temp-humidity sensor, **UART/CAN** carry node comms, and **power and isolation** keep it safe. That's the point of a "project module" — stitching scattered topics into one real system.

### The end-to-end data pipeline

Unpack one "detect apnea and alarm" event and the data flows like this:

```text
load cell (mV ripple)
  → 24-bit ADC amplify + quantize (HX711)
  → ESP32 samples, pre-filters, packs
  → Wi-Fi/serial to the Raspberry Pi
  → Pi filters out the breathing wave
  → detects 15 s with no breathing ripple
  → raises an alarm: screen + buzzer + report to station
```

Every link can fail: a loose sensor, ADC noise, a dropped wireless packet, an algorithm misjudgement… a robust system considers the failure mode at every link (see each chapter's "pitfalls").

### BOM philosophy: get it running, then upgrade

This project's bill of materials (BOM) is **directly purchasable**: every part is in stock at **Digi-Key, Mouser, Amazon, Adafruit, SparkFun** and similar. The core selection logic is:

> **Prove the principle with the cheapest thing that runs, then upgrade item by item as needed.**

For example, run the breathing wave with a few-dollar HX711 first to confirm the whole chain works, then swap in a pricier, lower-noise ADS1232 to chase real heartbeat quality. That way every dollar goes where it's "proven worth upgrading", instead of buying expensive parts up front only to find the approach was wrong.

The list is also tiered "prototype vs product": prototype favours cheap and available for fast validation; product favours medical compliance and durability. **The full printable shopping list is on the [BOM page](#/bom)**, grouped by subsystem and tagged with the starter kit, optional items and product-grade swaps.

### The minimal "starter kit"

If you just want to build a moving prototype for the least money, these suffice:

> Raspberry Pi 5 · ESP32 · 4×50 kg load cells · HX711 · Velostat film + copper tape (pressure grid) · MPU-6050 · capacitive moisture sensor · SHT40 · breadboard + jumpers + 5 V supply.

With it you can run a minimal version of each of the four subsystems and build intuition for the whole chain. Then decide where to dig deeper and upgrade.

### Time synchronization: the hidden prerequisite for fusion

Multi-node systems have an easily overlooked problem that decides success: **time synchronization**. To fuse "bed-leg A's breathing wave" with "the IMU's turn event", you must know when each happened. But two ESP32 nodes each have their own crystal, and their clocks slowly diverge (**clock drift**) — within minutes they can differ by tens of milliseconds, enough to misalign events that should coincide.

Common fixes, simple to complex:

- **Controller timestamps**: stamp node data with its "arrival time" at the Pi. Simple, but ignores transmission-delay jitter, so limited precision.
- **Node-local timestamps + periodic sync**: nodes timestamp each sample themselves, and the Pi periodically broadcasts a reference time to calibrate them (a simplified NTP). Much better precision.
- **Hardware sync pulse**: the controller runs a shared sync line to all nodes, everyone beats to it. Highest precision, but one more wire.

For a care bed's "second-scale events", the second approach usually suffices. Understanding that "multi-node means you must sync clocks" matters more than the specific method.

### The alarm system: harder than the sensors

In a real care device, **the alarm system is often harder to get right than the sensors themselves** — so much so that a dedicated standard, **IEC 60601-1-8**, governs it. The core tension:

- **A missed alarm (should sound but didn't) is fatal** — apnea with no alarm is catastrophic;
- **A false alarm (sounds when it shouldn't) destroys trust** — nag a nurse with false alarms and they'll lower the sensitivity or switch it off, and the system fails.

Good alarm design handles: **tiers** (info / warning / urgent, distinguished by different sound and light), **priority** (report the most critical first when several fire), **acknowledge and mute** (a nurse can temporarily mute, but the system logs it), and **self-test** (a broken alarm must itself be detectable — "the alarm system has failed" is itself a top-priority alarm). That's why this project treats "alarming" as a subsystem to design carefully, not "on anomaly, `digitalWrite(BUZZER, HIGH)`".

### Reliability and redundancy: assume every link fails

The design philosophy of medical/care devices is **"assume every part fails at the worst moment"**, and make the system enter a **safe state** on failure and make that failure **detectable**. Common means:

- **Watchdog**: the MCU must periodically "feed the dog"; if the program hangs and stops feeding, the watchdog resets the chip, preventing a silent stop of monitoring after a crash.
- **Heartbeat detection**: nodes periodically send "I'm alive" packets to each other and to the controller. If a node's heartbeat vanishes, the controller immediately knows "that sensor dropped out" and alarms — **a silent sensor and a working sensor must be distinguishable**.
- **Redundancy**: measure a critical metric (breathing) by two independent principles, so one failing leaves the other.
- **Graceful degradation**: if one subsystem breaks, the rest keeps working rather than the whole device quitting.

"Make failure detectable" is especially important: a monitor that quietly stops working while still showing stale data is far more dangerous than one that clearly reports "I've failed".

### Data and privacy: why local-first

Health data is highly sensitive. This project leans **edge / local-first** — do fusion and decisions on the Pi locally, uploading only when necessary (alarms, trend summaries) rather than streaming raw physiological data to the cloud. That lowers privacy risk and compliance burden and reduces dependence on the network (core monitoring can't stop when the link drops). It's one deeper reason CB1 chose "local ML on the Pi" over "everything in the cloud".

### Cost tiers: keep a mental budget

The rough cost split of the prototype BOM (for intuition only; prices float):

| Part | Rough share | Note |
|---|---|---|
| Controller (Pi 5 + screen + card) | largest | the price of a small computer |
| Sensors and ADCs | moderate | HX711/FSR/IMU/SHT40 are all cheap |
| Power, wiring, enclosure, misc | easily underestimated | connectors, case, protection add up |
| Tools (one-time) | depends on what you own | multimeter, iron, etc. are reusable |

The "run it first, upgrade later" idea is essentially spending money first on validating the approach (cheap), then investing in expensive product-grade parts once it's proven worthwhile — avoiding paying up front for an unproven design.

### Hands-on: build a minimal working system from scratch

Don't start with all four subsystems at once. In this order you can bring the whole chain up on the desk step by step, validating at each stage:

1. **Bring up the controller**: flash a system card for the Pi 5 (see the MC module / GC2 flashing flow), attach a screen, boot, join Wi-Fi. Confirm Python runs.
2. **One node, one sensor**: do breathing first — combine the 4 load cells into a full bridge, wire the HX711, connect it to an ESP32. Read the weight with a ready library and print over serial. See the number change as you press the bed, and the first link works.
3. **Go wireless**: have the ESP32 send readings to the Pi over Wi-Fi (or serial); the Pi receives and plots a trace. This validates the "senses → brain" link.
4. **Add a channel, validate fusion**: connect an IMU (I²C) to the ESP32 and send both "weight ripple" and "orientation" to the Pi. You now have a minimal multi-sensor fusion prototype.
5. **Close the alarm loop**: write a simple rule on the Pi (e.g. "alarm on 15 s with no breathing ripple") that triggers a buzzer + on-screen alert. A full "sense → fuse → decide → alarm" loop now runs.

Then expand as needed to the pressure array (CB3), moisture (CB4), power and isolation (CB5). **Get one shortest chain running end to end first, then widen from there** — the steadiest rhythm for building a complex system, avoiding connecting a pile of things at once with no idea where a problem lies.

### Troubleshooting (system level)

| Symptom | Likely cause | Where to look |
|---|---|---|
| No node data received | Wi-Fi not connected / IP changed / wrong message format | check node serial log, fix the IP, verify the frame format |
| Multi-channel data doesn't align | no time synchronization | add timestamps, periodic sync (above) |
| Occasional Pi stutter | UI/network preempting the CPU | move real-time sampling to the node, off the Pi |
| A sensor fails silently, unnoticed | no heartbeat detection | add node heartbeats, alarm on dropout |
| All noise on any movement | mechanical looseness, ground/earth issues | mount rigidly, check common ground (see CB2/CB5) |

### From desktop prototype to bed deployment

Finally, don't forget: this is a system that goes onto a **real bed**, where mechanical integration matters as much as the electronics. Load cells must sit firmly under the bed legs without wobble (or BCG is all noise, see CB2); the pressure mat must lie flat under the mattress and survive repeated pressure; moisture electrodes must contact yet be replaceable; all wiring must be secured, not trip anyone, and flex with the frame; the enclosure must be washable. **A prototype that runs perfectly on the desk yet fails completely on a bed due to wobble, wiring and cleaning is the norm, not the exception** — desktop to bed is this project's real "last mile".

> ✦ **Key point:** the smart care bed = **a Raspberry Pi for fusion, ML and UI + one or more ESP32 nodes for real-time sampling**, with four subsystems below: breathing, posture, moisture, power. The reason to layer is that "real-time sampling" and "heavy computation" are opposite in nature and drag each other down in one chip. Prototype with off-the-shelf hobby parts on a "run it first, upgrade later" basis; medical-grade and compliance come with productisation (CB5). The whole project is a full rehearsal of the first seven modules.
