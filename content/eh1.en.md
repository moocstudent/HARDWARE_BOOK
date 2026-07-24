## Core notes

> ✦ This module bridges **HARDWARE_BOOK** and **ERP_BOOK**: here you wire signals; there you post documents. Read both sides so the floor does not end up "hardware up, ledger wrong".

### ERP has no eyes of its own

If a plant only keys confirmations and GR/GI from an office keyboard, progress, stock and cost lag systematically. **Hardware is the nerve ending of ERP/MES**: it turns physical events into postable signals and messages.

That matches this course's throughline — sensors read the world, actuators/displays show it, buses and MCUs ship the signal — the plant simply packages those parts into andon, scanners, PLCs and edge gateways.

<div class="spec-strip">
<div class="cell"><div class="k">Wave 1</div><div class="v">gun+screen+light</div></div>
<div class="cell"><div class="k">Translate</div><div class="v">edge GW</div></div>
<div class="cell"><div class="k">Into ERP</div><div class="v">MQTT/HTTPS</div></div>
<div class="cell"><div class="k">Discipline</div><div class="v">idempotency</div></div>
</div>

### Zone hardware map

| Zone | Common hardware | Typical write | Course anchors |
|---|---|---|---|
| **Line** | Andon, station tablet, PLC/CNC, torque tools | Downtime, confirm, utilization | IO1–IO3, AD3, EH3 |
| **Warehouse** | Handheld/fixed scan, RFID gate, labeler, pick-to-light | GR/GI, pick, batch labels | BUS1, EH2 |
| **QI** | Checkweigher, vision, TH probes | Pass/fail, scrap reasons | SN, CB2 weighing |
| **Infra** | Edge gateway, IPC, industrial switch | Protocol translate, offline buffer | MC2, EH4 |

Click zones in the interactive figure for short "device → document" chains.

### Rollout priority (pragmatic)

**Wave one (usually best ROI):**

1. Barcode/QR gun + label printer (make materials and docs scannable);
2. Station tablet or simple confirm terminal (end "backfill after shift");
3. Andon (exceptions visible, downtime measurable);
4. Stable network + edge offline buffer.

**Wave two:** PLC/OPC-UA piece counts, RFID gates, pick-to-light, checkweigh and vision.  
**Wave three:** AGV fleets, plant-wide twin dashboards — without the first two, the big screen is a cartoon.

### Four-layer stack (preview; detail in EH4)

```
④ ERP / MES transaction     confirm, GR, downtime…  REST / adapters
③ Messaging / integration   MQTT broker, HTTPS callbacks, retry & DLQ
② Edge gateway              translate · enrich · validate · offline queue
① Field bus / devices       RS-485+Modbus, UART guns, GPIO andon…
```

**One sentence to keep:** RS-485/Modbus solves "how devices talk to devices"; MQTT/HTTPS solves "how events enter IT/ERP". A gateway is mandatory — ERP never "listens" to raw registers.

### Bridge to this course and ERP_BOOK

| HARDWARE_BOOK | Plant landing | ERP_BOOK |
|---|---|---|
| Sensors, ADC, weighing | Scan engines, checkweighers, photo eyes | HW1 map |
| Digital I/O, debounce, PWM/LED | Andon cords, towers, pick lights | HW2 andon |
| UART frames, serial debug | Gun serial, scale serial | HW3 scan-to-post |
| MCU + Wi-Fi (ESP32) | Edge node / soft gateway | HW4 protocol layers |

### "Fake ERP" symptoms without hardware

- Stock only "matches" on month-end count day;
- WO progress is the lead's oral report;
- OEE is all green while customer due dates slip;
- Andon lights but never posts — red is décor.

## Exercises

1. List four wave-one hardware classes for an assembly plant, each with one sentence on "cost of not buying".
2. In course vocabulary, sketch layers from andon cord press to tower turning red (implement in EH3).
3. Open ERP_BOOK HW1, pick one device from this chapter's figure, and write hardware → floor event → document.

> ✦ **Key point:** plant hardware is this course's sense/IO/bus stack at industrial scale. Ship "scannable, confirmable, exception-visible" first, then let the edge gateway translate signals into ERP events — next chapter wires the scanner interface.
