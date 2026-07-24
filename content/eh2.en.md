## Core notes

### What is inside a scan engine

An industrial barcode gun roughly has three blocks:

1. **Optics / imaging**: laser line or CMOS camera "sees" the code;
2. **Decode silicon**: turns black/white bars into an ASCII/UTF-8 string;
3. **Interface IC**: ships that string as keyboard wedge, USB HID, or UART.

For this course you master block 3 — **how to get that string reliably into an MCU or terminal app**, then into a business request with an `eventId`.

<div class="spec-strip">
<div class="cell"><div class="k">HID</div><div class="v">like a keyboard</div></div>
<div class="cell"><div class="k">UART</div><div class="v">to MCU</div></div>
<div class="cell"><div class="k">RS-232</div><div class="v">needs level shift</div></div>
<div class="cell"><div class="k">Suffix</div><div class="v">CR/LF</div></div>
</div>

### Four common interfaces

| Interface | Behaviour | Pros | Watch-outs |
|---|---|---|---|
| **USB HID keyboard wedge** | Types into the focused field | Zero driver, fast on PC/tablet | Hard for bare MCU; wrong focus = garbage |
| **USB CDC / virtual COM** | Enumerates as COMx | Easy for apps | Needs a USB host stack |
| **TTL UART (3.3/5 V)** | TX/RX + GND | **Best for ESP32/Arduino labs** | Cross TX↔RX, common GND, matching levels |
| **RS-232** | DB9, ±12 V | Common on old scales/PLCs | Needs MAX3232 etc. — never wire straight to MCU |

Switch modes in the interactive figure to watch characters flow engine → interface → MCU/App → ERP.

### Minimal gun reader (ESP32)

Most guns can be set to **9600 8N1** and append `\r` or `\r\n` after each scan.

```cpp
// Arduino / ESP32 — gun TX → GPIO16 (RX2), common ground
HardwareSerial Gun(2);

void setup() {
  Serial.begin(115200);
  Gun.begin(9600, SERIAL_8N1, 16, 17); // RX, TX
}

void loop() {
  static String buf;
  while (Gun.available()) {
    char c = Gun.read();
    if (c == '\r' || c == '\n') {
      if (buf.length()) {
        handleBarcode(buf);
        buf = "";
      }
    } else {
      buf += c;
      if (buf.length() > 64) buf = ""; // refuse noise floods
    }
  }
}
```

Recall BUS1: this is UART at the application layer — **agree baud, cross TX/RX, frame on line endings**.

### Minimum business payload

A raw string is not enough. Posting must answer: which doc, which material, how many, which bin. Suggested minimum JSON:

```json
{
  "eventId": "esp32a-20260723-203012-0007",
  "doc": "PO-7781",
  "material": "MAT-WHEEL",
  "qty": 12,
  "bin": "A-01",
  "source": { "iface": "uart", "device": "gun-01" },
  "ts": "2026-07-23T20:30:12+08:00"
}
```

- **eventId**: globally unique; ERP uses it as the idempotency key — weak-network retries will not double-receive;
- **ts**: edge and ERP should NTP-sync or reconciliation hurts;
- multi-scan flows (doc → material → bin) assemble in a terminal state machine — do not post on every beep.

### Scan → HTTPS / MQTT

| Path | Fits | Notes |
|---|---|---|
| Terminal app **HTTPS POST** | RF gun + Android/Win handheld | Strong validation, immediate error codes |
| MCU **Wi-Fi → MQTT** | Fixed ESP32 mount | QoS1 + local queue; ERP must be idempotent |
| MCU **Wi-Fi → HTTPS** | Low-rate confirm/andon | Design certs and timeouts |

On link loss: **write a local queue (SPIFFS/SD), flush later** — same discipline as ERP_BOOK HW3, landed in device firmware.

### Common traps

- Gun still in HID while MCU waits on UART → reconfigure with the vendor tool;
- 5 V TTL into ESP32 3.3 V RX → may damage — level-shift;
- Missing common ground → gibberish;
- Treating the scanned string as quantity → always validate master data and ranges.

## Exercises

1. Read a gun in a serial monitor (or simulate `\r\n`-terminated strings) and strip/validate length.
2. Design a three-scan state machine: PO → material → bin, emitting the JSON above.
3. Intentionally POST the same `eventId` twice; say what a mock ERP should return.

> ✦ **Key point:** a scanner = sense + decode + interface. Prefer **TTL UART** in the lab; always carry **eventId** and minimum document fields before HTTPS/MQTT into ERP — the andon chapter feeds another class of "event" into the same discipline.
