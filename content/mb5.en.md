## Core Notes

### The moment it touches a patient, safety outranks everything

The earlier chapters were about measuring accurately. This one is about the **bottom line**: when a device contacts a body, no dangerous current may ever flow through the patient. The central requirement of medical electronics is **patient isolation** — electrically separating the patient-contacting part from mains and from earth, and holding any **leakage current** that could pass through the patient below a safe threshold.

### Isolation: cutting the dangerous current path

"Isolation" means signals and energy can cross, but the **dangerous current loop is broken** (via transformers, optocouplers, capacitive coupling, etc.). This project isolates at several levels:

- **Isolated power:** a standard 5 V / 12 V supply is fine for prototyping; a product must switch to an **IEC 60601-1 medical-grade supply** (e.g. Mean Well GST/RPS series), whose isolation and leakage figures are designed for patient contact.
- **Isolation amplifier / digital isolators:** insert an isolation barrier between the acquisition front-end and the controller. On the analog side, an **ISO124** isolation amplifier; on the digital buses (I²C / SPI), the **ADuM** family of digital isolators lets the signal through but not dangerous current.
- **Level shifting:** when mixing 3.3 V and 5 V parts, use a level shifter (see MC2) to avoid over-voltage damage.

<div class="spec-strip">
<div class="cell"><div class="k">Power</div><div class="v">60601</div></div>
<div class="cell"><div class="k">Digital iso</div><div class="v">ADuM</div></div>
<div class="cell"><div class="k">Analog iso</div><div class="v">ISO124</div></div>
<div class="cell"><div class="k">Goal</div><div class="v">low leak</div></div>
</div>

### Never interrupt, even on power loss: battery backup

Patient monitoring can't stop for a power cut or a transfer. Add a **backup battery**:

- A **LiFePO4 pack + BMS (Battery Management System)**;
- Charging on mains, seamlessly taking over during an outage or transport to keep the system running.

The BMS handles balancing and over-charge/over-discharge protection — battery safety is itself part of patient safety.

### Multi-bed networking: CAN bus (optional)

To chain multiple beds' nodes into one monitoring network, the **CAN bus** is the industrial choice: strong noise immunity, long distances, many nodes. Use an **SN65HVD230 transceiver** (or an **MCP2515 controller**) to hang each bed node on a CAN backbone that aggregates to a central nurses' station.

### The bench: what to have to develop this

One-time tool purchases: a **multimeter, bench power supply, soldering iron/station, logic analyzer (Saleae-compatible), oscilloscope (or USB scope), breadboard + jumpers, and calibration weights** (essential for calibrating the load cells, see CB2).

### What separates a prototype from a regulated medical product

This is the most honest section. The hobby-grade design above proves the principles but **is not a medical device**. To pass **IEC 60601-1 / -1-2 / -1-8** and become a compliant product, swap in:

- A medical-grade **isolated analog front-end** + an **ADS1220 / ADS131**-class ADC;
- An **IEC 60601-1 medical supply** and certified **isolation barriers**;
- Commercial **calibrated pressure mats** (Tekscan / XSensor) instead of a DIY grid;
- An industrial **CAN bus backbone**;
- A sealed, **IP-rated**, cleanable enclosure;
- **EMC-shielded cabling**.

> ⚠ **Key point:** the first principle of medical electronics is **patient isolation** and **low leakage current** — achieved with isolated supplies and digital/analog isolators; keep running through outages with a **battery + BMS**, and network multiple beds over **CAN**. Stay clear-eyed: a hobby prototype teaches the principles and demonstrates well, but a whole layer of isolation, certification and safety engineering still separates it from a compliant medical device.
