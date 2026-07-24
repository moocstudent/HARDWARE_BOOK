## Core notes

### Andon is not décor

Toyota-style andon means: **anyone who sees an abnormality can make line state visible and force an organisational response**. Hardware usually includes:

- **Cord / button**: one pull creates a call;
- **Three-colour tower**: red = call, yellow = acknowledged, green = normal (local habits vary);
- **Alarm / station screen**: lead arrives, reason-code pick;
- **Uplink**: downtime posts to MES/ERP, hits OEE, may freeze confirmations and promises.

This course's IO2 (pull-ups & debounce) and IO3 (PWM/LED) are almost the entire analog/digital basis of a mini-andon.

<div class="spec-strip">
<div class="cell"><div class="k">Input</div><div class="v">cord</div></div>
<div class="cell"><div class="k">Debounce</div><div class="v">IO2</div></div>
<div class="cell"><div class="k">Output</div><div class="v">tower</div></div>
<div class="cell"><div class="k">Uplink</div><div class="v">reason code</div></div>
</div>

### From breadboard to industrial tower

| Lab grade | Plant grade | Notes |
|---|---|---|
| Tactile switch + `INPUT_PULLUP` | Industrial NO button / cord switch | Filter/shield long runs |
| R/Y/G LEDs + resistors | 24 V multi-tier tower | **Relay/MOSFET drive** — MCU must not source tower current |
| `tone()` / active buzzer | Audible beacon | Same state machine as lights |
| OLED status | Station HMI / tablet | Pick reason codes, show WO |

24 V tower coils kick back — recall AD2: flyback diodes; keep motor/relay supplies and logic grounds per site rules.

### State machine (memorise)

```
GREEN ──pull──► CALL(red+sound) ──lead ack──► ACK(yellow)
                                              │
                     ◄──clear(reason+duration)── CLEAR ─┘
                              │
                              ▼
                            GREEN
```

Click the four states in the figure to see which tier lights and how the reason string changes.

Skeleton:

```cpp
enum { ST_GREEN, ST_CALL, ST_ACK } st = ST_GREEN;
bool btnFalling(); // falling edge after debounce — see IO2

void loop() {
  switch (st) {
    case ST_GREEN:
      setTower(GREEN);
      if (btnFalling()) { st = ST_CALL; t0 = millis(); publish("ANDON_PULL"); }
      break;
    case ST_CALL:
      setTower(RED); buzz(true);
      if (ackPressed()) { st = ST_ACK; publish("LEAD_ON_SITE"); }
      break;
    case ST_ACK:
      setTower(YELLOW); buzz(false);
      if (clearPressed()) {
        publishClose(reasonCode, millis() - t0);
        st = ST_GREEN;
      }
      break;
  }
}
```

### Example uplink payload

```json
{
  "eventId": "andon-line3-00042",
  "plant": "1000",
  "line": "L3",
  "station": "OP-20",
  "state": "CALL",
  "reason": "ANDON_PULL",
  "wo": "WO-5521",
  "ts": "2026-07-23T20:31:00+08:00"
}
```

On clear, add `reasonCode` (material/equipment/quality…) and `durationMs` for OEE and cost centers — detail in ERP_BOOK HW2.

### Why fake "green" hurts

- Downtime never posts → OEE inflated, maintenance budgets wrong;
- WO progress does not freeze → warehouse/sales still promise the old date;
- Junk reason codes → improvement work attacks the wrong problem.

Hardware poka-yoke: require a reason to clear, long-press confirm, audit-log critical actions.

## Exercises

1. Build GREEN/CALL/ACK with three LEDs + one button; print transitions on serial.
2. Add 50 ms software debounce on the cord; verify with a logic analyzer or serial timestamps.
3. List fields for a "clear" message and mark which must enter the ERP downtime document.

> ✦ **Key point:** andon = **debounced input + tower output + state machine + reason uplink**. The signal must lock with ERP/MES state, or red is décor — next chapter unifies scan and andon events through an edge gateway into MQTT/HTTPS.
