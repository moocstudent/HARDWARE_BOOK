## Core Notes

### The moment it touches a patient, safety outranks everything

The previous four chapters were about measuring accurately. This one is about the **bottom line**: once a device is electrically connected to a body, safety outranks everything, and no accuracy is worth a hazard. The most central requirement of medical electronics — and the biggest difference from ordinary electronics — is **patient safety**: no dangerous current may ever flow through the patient.

Why so strict? The body conducts, and the heart is extremely sensitive to tiny currents: **tens of microamps** through the heart region can trigger arrhythmia or even fibrillation. If ordinary electronics leak a little charge to the case, a person touching it feels at most a tingle; but for a patient lying in bed, skin damp, perhaps with other leads attached, the same leakage current can be fatal. So medical devices have extremely strict limits on **leakage current**.

### Isolation: cutting the dangerous current path

The core means of patient safety is **isolation**. "Isolation" means signals and energy can cross, but the **dangerous current loop is physically broken** — the patient-contacting side has no direct conductive path to mains or to earth. It's achieved by "non-conductive coupling":

- **Transformers**: couple energy magnetically; primary and secondary don't conduct;
- **Optocouplers / digital isolators**: couple signals by light or capacitance; input and output are insulated;
- **Capacitive coupling**: passes signals by an alternating electric field.

This project isolates at several levels:

- **Isolated power**: a plain 5 V / 12 V supply is fine to validate function while prototyping; a product must switch to an **IEC 60601-1 medical-grade supply** (e.g. Mean Well GST / RPS series). What sets a medical supply apart is that its isolation rating and leakage figures are **designed for patient contact**, with certification behind them.
- **Isolation amplifier / digital isolators**: place an isolation barrier between the "patient-contacting front-end" and the "controller". Pass analog signals through an **ISO124** isolation amplifier; pass digital buses (I²C / SPI) through **ADuM** digital isolators — signal crosses, dangerous current doesn't. So even if the front-end faults, dangerous current can't reach the patient, and vice versa.
- **Level shifting**: when mixing 3.3 V and 5 V parts, use a level shifter (see MC2) to avoid over-voltage damage — not directly patient safety, but the same class of "interface protection".

<div class="spec-strip">
<div class="cell"><div class="k">Power</div><div class="v">60601</div></div>
<div class="cell"><div class="k">Digital iso</div><div class="v">ADuM</div></div>
<div class="cell"><div class="k">Analog iso</div><div class="v">ISO124</div></div>
<div class="cell"><div class="k">Goal</div><div class="v">low leak</div></div>
</div>

### Grounding, common ground and "ground isolation"

Beginners often confuse "isolation" with "common ground". Recall earlier modules: many sensors and buses require a **common ground** to communicate (UART's shared ground, I²C's ground reference). But in a medical device, the "patient side" and the "mains side" precisely **must not** share ground — otherwise mains ground-potential swings and leakage would travel through the patient's path.

The fix is exactly the digital isolator: it has an **independent ground on each side**, signals cross the barrier by light/capacitance, and the two grounds have no direct connection. The "patient side" becomes a floating, safe electrical island — its internal parts still share ground and communicate normally, while the island is firmly isolated from mains. Understand this and you understand the essence of medical-electronics layout.

### Never interrupt, even on power loss: battery backup

Patient monitoring is a critical function that **must not stop**: on a power cut or a transfer to a new bed, monitoring can't just quit — those are exactly the moments a patient needs watching most. So add a **backup battery** for uninterrupted power:

- **LiFePO4 pack**: versus common lithium-polymer, LiFePO4 is **more thermally stable, safer and longer-cycling** — favoured in medical/industrial settings (safety is itself part of patient safety).
- **BMS (Battery Management System)**: balances cells and provides over-charge/discharge/current/temperature protection. A lithium pack without a BMS is dangerous.
- **Seamless switchover**: charges and powers from mains normally, and the battery takes over instantly on an outage — no reboot, no data loss.

### Multi-bed networking: CAN bus (optional)

To chain a whole ward's many bed nodes into one monitoring network aggregating to a central station, the **CAN bus** is the industrial choice (recall the BUS module's comparison of buses):

- **Strong noise immunity**: differential signal + twisted pair, reliable in an electrically noisy hospital;
- **Many nodes, long distance**: dozens of nodes on one bus over hundreds of meters;
- **Built-in arbitration**: several nodes transmitting at once don't collide; high priority (e.g. alarms) goes first.

Use an **SN65HVD230 transceiver** (or an **MCP2515** controller + transceiver) to hang each bed's node on a CAN backbone. Note: for cross-bed comms, the bus itself should be isolated too, so one bed's fault can't propagate through the bus to others.

### The bench: what to have to develop this

These are one-time dev-tool purchases, useful for any hardware project:

- **Multimeter**: voltage, current, continuity — the first debugging tool;
- **Bench power supply**: adjustable voltage/current limit to power circuits and experiment safely;
- **Soldering iron / station**: for soldering parts and wiring;
- **Logic analyzer (Saleae-compatible)**: capture I²C / SPI / UART timing — the key tool for bus debugging (recall the BUS module);
- **Oscilloscope (or USB scope)**: view analog waveforms — essential for tuning BCG and seeing noise;
- **Breadboard + jumpers**: quick prototyping;
- **Calibration weights**: known masses for calibrating the load cells (see CB2).

### What separates a prototype from a regulated medical product

This is the most honest — and most important — section. The hobby-grade design above proves the principles and makes an impressive demo, but it **is not a medical device** and can't actually go on a patient. To pass standards like **IEC 60601-1 (general safety) / -1-2 (EMC) / -1-8 (alarm systems)** and become a marketable, compliant product, swap/upgrade these:

| Prototype | → Product |
|---|---|
| plain 5V/12V supply | **IEC 60601-1 medical supply**, certified isolation barriers |
| HX711 / breadboard front-end | medical-grade **isolated analog front-end** + **ADS1220 / ADS131**-class ADC |
| DIY Velostat pressure grid | commercial **calibrated pressure mat** (Tekscan / XSensor) |
| jumper wires / serial | industrial **CAN bus backbone** + shielded cabling |
| exposed breadboard | sealed, **IP-rated**, cleanable enclosure |
| no EMC consideration | **EMC shielding** and filtering, passing -1-2 immunity/emission tests |

These aren't "nice to have" — they're the **dividing line** between "can" and "can't" be used on a patient legally. Compliance also involves a whole engineering-and-regulatory process — risk management (ISO 14971), software lifecycle (IEC 62304), clinical validation — far beyond the hardware itself.

### How small must leakage current be to be safe

We said "tens of microamps can be dangerous" — not a throwaway line, but numbers written into standards. IEC 60601-1 sets upper limits on **leakage current** under various conditions (orders of magnitude for illustration; consult the standard for specifics):

| Leakage type | Normal-condition limit (order) | Meaning |
|---|---|---|
| Earth leakage | hundreds of µA | current flowing out via the protective earth |
| Touch (enclosure) leakage | ~100 µA | may flow through a person touching the case |
| Patient leakage | ~10–100 µA | flows through the patient via connected parts |

Note the strictest limit is "patient leakage" — it goes directly through the patient. And limits are also specified for the **single-fault condition** (a component has failed): even with one part broken, leakage must not exceed the dangerous value. This is the **single-fault safe** principle: the device must tolerate any one component failing without harming anyone. Understand these numbers and you see why medical design isolates in layers with ample margin — not over-caution, but a hard requirement of the standard.

### Classifying applied parts: B, BF, CF

In a medical device, the part contacting the patient directly or indirectly is the **applied part**, classed by protection level in three grades, stricter down the list:

- **Type B**: basic protection; the applied part may be earthed.
- **Type BF** (F = Floating): the applied part is **floating and isolated**, not tied to earth — better protection. Our bed's sensor-contacting parts should at least follow BF-level isolation thinking.
- **Type CF** (C = Cardiac): the highest grade, for possible direct cardiac contact (e.g. intracardiac catheters), with the strictest leakage limits.

Though a care bed doesn't touch the heart, any electrode/sensor against the patient means following "float-isolate, limit patient leakage" — exactly what the digital isolators and isolated supply above solve.

### Two lines of defense: MOOP and MOPP

IEC 60601 calls anti-shock measures **Means of Protection (MOP)** and distinguishes two:

- **MOPP (Means of Patient Protection)**: the isolation barrier protecting the patient, with the highest requirements (larger creepage distances, higher insulation withstand).
- **MOOP (Means of Operator Protection)**: protecting the operator (nurse/doctor), with lower requirements.

The standard typically requires **two independent means** (2× MOP) — one isolation isn't enough; a second provides redundancy so either failing leaves the other. Another structural expression of "single-fault safe". When you see "2 MOPP" on a medical supply or isolator, it means it provides two patient-grade isolations internally.

### Electromagnetic compatibility (EMC) in hospitals

A hospital is an **electromagnetically brutal** place: electrosurgery, MRI, high-power equipment, radios… A monitor must neither be disturbed by them into misjudging/crashing (**immunity**) nor emit interference affecting other devices (**emissions**). That's what **IEC 60601-1-2 (EMC)** governs. Countermeasures: shielded cabling and enclosures, filtering on power and signal lines, proper grounding, careful PCB layout… Our prototype runs on jumper wires on a breadboard, with essentially zero EMC — an important reason it's "demo only, not clinical".

### Not just hardware: compliance is a whole engineering process

Finally, dispel a common myth: **turning a prototype into a compliant medical product is far more than "swap in a few medical-grade parts".** It's a whole regulated engineering process:

- **Risk management (ISO 14971)**: systematically identify every way it could harm a patient, assess, mitigate and document.
- **Software lifecycle (IEC 62304)**: medical software has rules for development, verification and maintenance — your breathing-detection algorithm needs a full chain of requirements, design, tests and traceability in a product.
- **Usability engineering (IEC 62366)**: the interface must prevent nurse errors when tired or in an emergency.
- **Clinical validation**: prove it's actually effective and safe on real patients.
- **Quality system (ISO 13485)**, regulatory registration (NMPA/FDA/CE)…

Hardware isolation is only the foundation of this edifice. Understanding this lets you neither dismiss the prototype (it proves the core principles) nor overrate it (a whole regulatory-and-engineering system still separates it from a product). **Between "can build a demo" and "can legally go on a patient" lies exactly all of this.**

### Safety floor at the prototype stage (even just tinkering)

Even if you're only building a desk prototype and never touching a real patient, a few safety lines must hold — after all, *you* are the "person touching the device":

- **Don't bench-test bare mains in a prototype**: power low-voltage circuits from a ready, certified USB supply or battery; don't build your own mains-to-low-voltage conversion. Mains is lethal, not a place to practice.
- **Anything touching a body is isolated/low-voltage**: any electrode against skin should run at a safe low voltage and be isolated from anything that might touch mains.
- **Batteries with protection**: a lithium battery must have a BMS; don't use unprotected bare cells, don't short, don't overcharge.
- **Mark it "this is a toy"**: a prototype's data must not drive any real medical decision. Write it down, label it, don't let anyone mistake it for a real device.

### Design self-check list (compare against when going to product)

If you ever really push it toward a product, this list helps you measure the gap (each item points at a concept above):

- [ ] Is the patient-contacting part **floating-isolated** (BF thinking)?
- [ ] Are there **two independent means of protection** (2× MOP)?
- [ ] Is **leakage current** within limits under all conditions, including **single fault**?
- [ ] Is the supply an **IEC 60601-1 medical grade**?
- [ ] Do digital/analog signals cross the isolation barrier through **isolators** (ADuM/ISO124)?
- [ ] Is **EMC** handled (shielding, filtering, grounding) for the hospital environment?
- [ ] Is there **battery + BMS** seamless backup on power loss?
- [ ] Is the **alarm system** tiered, miss-proof and self-testing (IEC 60601-1-8)?
- [ ] Is there **risk management (ISO 14971)** and **software lifecycle (IEC 62304)** documentation?

### Common questions

| Question | Answer |
|---|---|
| Can the prototype use a plain 5V supply? | Fine for desk validation, but never on a real patient; a product needs a medical supply |
| Is isolation alone enough for safety? | Isolation is core, but leakage, single-fault and EMC matter as a whole |
| Do common ground and isolation conflict? | The patient side shares ground internally; the patient side and mains side are isolated — no conflict |
| Can I certify it myself? | Compliance involves third-party testing and regulatory registration, far beyond solo DIY |
| Then is prototyping even worth it? | Yes — it proves the principle, builds skill, makes a demo; just don't cross the "not a medical device" line |

> ⚠ **Key point:** the first principle of medical electronics is **patient safety**: **isolate** the patient-contacting part from mains/earth and hold **leakage current** below the safe line — via isolated supplies and analog/digital isolators, making the patient side a floating electrical island. Keep running through outages with a **LiFePO4 battery + BMS**, and network multiple beds over **CAN**. Stay clear-eyed: a hobby prototype teaches the principles and demos well, but a whole layer of isolation, certification, EMC and safety engineering (the IEC 60601 series) still separates it from a compliant medical device.
