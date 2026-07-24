## Core notes

### One sentence to keep

**RS-485 / Modbus solves "how devices talk to devices"; MQTT / HTTPS solves "how events enter IT/ERP".**  
An **edge gateway** must translate in between — ERP never "listens" to registers on a 485 bus.

This is the industrial finale of the course's comms track: differential multi-drop UART (BUS1) + ESP32 Wi-Fi publishing (MC2) + business events from EH2/EH3.

<div class="spec-strip">
<div class="cell"><div class="k">Field</div><div class="v">485</div></div>
<div class="cell"><div class="k">Edge</div><div class="v">gateway</div></div>
<div class="cell"><div class="k">Msg</div><div class="v">MQTT</div></div>
<div class="cell"><div class="k">Ledger</div><div class="v">idempotent</div></div>
</div>

### Four-layer stack

```
┌─────────────────────────────────────────────┐
│ ④ ERP / MES transaction                      │
│    confirm, GR, downtime, stock moves        │
│    entry: REST API / middleware adapters     │
├─────────────────────────────────────────────┤
│ ③ Messaging / integration                    │
│    MQTT broker, HTTPS callbacks, retry, DLQ  │
├─────────────────────────────────────────────┤
│ ② Edge gateway                               │
│    translate · enrich · validate · offline Q │
├─────────────────────────────────────────────┤
│ ① Field bus / devices                        │
│    RS-485 + Modbus RTU, UART guns, GPIO andon│
└─────────────────────────────────────────────┘
```

Switch scenes A/B/C in the figure and click each layer for protocol and duty.

### ① Field layer: RS-485 + Modbus

| Point | Note |
|---|---|
| **RS-485** | Physical: differential, multi-drop, noisy floors, ~100 m — UART's cousin with A/B pair + termination |
| **Modbus RTU** | Application: master polls slaves, reads holding registers/coils (counts, run bits…) |
| **Not for ERP** | Frames carry address + register values — no material, WO, or fiscal period |

Typical wiring:

```
[counter]──┐
[meter]────┼── RS-485 ──► [edge gateway = Modbus master]
[andon ctl]┘
```

Lab: two ESP32s + two MAX485 modules — one fake slave (yield in a register), one master polling.

### ② Gateway's four jobs

1. **Poll** Modbus: `read slave 3 regs 40001–40004`;
2. **Map**: registers + station config → `{ wo, op, goodQty }`;
3. **Validate**: WO released? qty sane? clocks synced?;
4. **Publish**: build JSON, `MQTT publish` or `HTTPS POST`; on failure, local queue.

Without this layer ERP drowns in register floods, or the line "forgets" when the WAN drops.

### ③ MQTT topic & payload

```
Topic:  plant/{plantId}/line/{lineId}/confirm
QoS:    1 (at least once)  →  ERP must be idempotent
Retain: false              →  do not retain confirm events
```

```json
{
  "eventId": "gw01-20260723-153012-0007",
  "plant": "1000",
  "wo": "WO-5521",
  "op": "0020",
  "goodQty": 12,
  "scrapQty": 0,
  "source": { "bus": "modbus-rtu", "slave": 3, "reg": 40001 },
  "ts": "2026-07-23T15:30:12+08:00"
}
```

**How ERP consumes**

- Path A: MES/ERP MQTT adapter → internal confirm API;
- Path B: middleware subscribes MQTT → REST/IDoc (common on legacy suites);
- Path C: gateway `HTTPS POST /api/confirmations` (typical for guns/tablets).

MQTT fits high volume, async, weak links; REST fits request/response with immediate validation. Plants often run both — scan GR on HTTPS, high-speed piece count on MQTT.

### ④ ERP transaction: received ≠ posted

1. **Idempotent** on `eventId` (retries must not double-post);
2. Validate WO / material master data;
3. Call the standard transaction (confirm, GR, downtime…);
4. **Ack**: success ACK; failures to DLQ with alarm — never silent drop.

### Three contrast scenes

| Scene | Field side | IT side | Typical use |
|---|---|---|---|
| **A piece confirm** | PLC↔GW **RS-485/Modbus** | GW→**MQTT**→ERP | High-speed line |
| **B handheld GR** | RF gun **USB/Wi-Fi** | App **HTTPS REST**→ERP | Warehouse GR/GI |
| **C machine** | CNC **OPC-UA** | GW→MQTT or OPC bridge | Utilization, alarms |

OPC-UA usually sits on plant Ethernet, not 485; the layering "field protocol → gateway → IT message" still holds.

### Mini lab (~half day)

1. Slave ESP32: Modbus reg `40001` = fake yield (button increments);
2. Master/gateway ESP32: poll each second; on delta > 0 build JSON;
3. Publish to local Mosquitto, or `POST` a mock API that returns 200;
4. Kill Wi-Fi; confirm events queue locally; on restore flush by `eventId` without duplicates.

Align JSON field names with ERP_BOOK HW4 for cheapest joint debugging.

## Exercises

1. Draw your (real or imagined) plant's four layers with real protocol names.
2. Write MQTT topic + JSON for an andon CALL; justify QoS 1.
3. List one case where the gateway should reject locally vs send to DLQ on validation failure.

> ✦ **Key point:** the edge gateway is the heart — **poll, map, validate, queue, publish**. 485/Modbus never enters ERP; business events with `eventId` do. Finish H9 and you can wire it in HARDWARE_BOOK and post it in ERP_BOOK.
