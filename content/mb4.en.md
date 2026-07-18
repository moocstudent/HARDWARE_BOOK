## Core Notes

### Bed-wetting detection: looks simple, most detail

"Is the bed wet" sounds like the simplest of the four subsystems — isn't it just "detect water"? Yet it's precisely the one closest to real care, and the trickiest. A usable bed-wetting monitor must satisfy several conflicting requirements at once:

- **Sensitive enough**: catch incontinence quickly, or prolonged skin maceration accelerates infection and pressure injuries.
- **Free of false alarms**: sweat, body fluids squeezed out by turning, an accidental spill — none should trigger it. Nag staff with a few false alarms and they switch the alarm off — and then the whole system was for nothing.
- **Corrosion-resistant**: urine is a salty electrolyte, corrosive to metal electrodes; the sensor must live in that environment long-term.
- **Cleanable**: the mattress is wiped and disinfected repeatedly; the sensor must not fear water or scrubbing.

The tension among these requirements is the engineering core of this chapter: **how to be both sensitive and false-alarm-resistant, and to both measure water and survive water.**

### Moisture electrodes: water bridges the poles

The most direct principle is **conductance**: two closely spaced, interlocking conductive electrodes (called **interdigitated electrodes**, shaped like crossed fingers). When dry, the poles are insulated with a very high resistance; the moment urine (a conductive electrolyte) bridges them, ionic conduction drops the resistance sharply. Wire the pair into a divider (see CF3) or read them with a dedicated capacitance/resistance circuit to detect "wet".

The interdigitated shape has a nice property: in a small area it creates a very long "adjacent boundary", so a bridge anywhere along it is detected — high sensitivity and fast response.

### Capacitive vs resistive: a trade-off about corrosion

For sensing wetness there are two measurement methods, and the key trade-off is **corrosion resistance**:

- **Resistive (conductive)**: measure the resistance between the poles directly. Simplest and cheapest circuit, but the electrodes must **touch the electrolyte** to conduct — and soaking long-term in salty urine, metal electrodes **electrolytically corrode** and oxidize, drifting or failing.
- **Capacitive**: measure the change in the **dielectric constant** of the medium between the poles (water's dielectric constant is far higher than air's). The electrodes can sit under a thin insulating layer and **not touch the liquid**, sensing nearby moisture through the electric field. So it's **more corrosion-resistant and durable**, lasting far longer.

> Verdict: **capacitive resists corrosion better than resistive**, so productisation leans capacitive. Prototype with an off-the-shelf "soil-moisture-style capacitive sensor" module — it was literally designed to be buried in damp soil long-term, matching the need well.

<div class="spec-strip">
<div class="cell"><div class="k">Detect</div><div class="v">electrodes</div></div>
<div class="cell"><div class="k">Prefer</div><div class="v">capacitive</div></div>
<div class="cell"><div class="k">Confirm</div><div class="v">SHT40</div></div>
<div class="cell"><div class="k">Bus</div><div class="v">I²C</div></div>
</div>

### Confirming real wetness with an SHT40

A moisture electrode alone all but guarantees false alarms: a touch of sweat or condensation can trigger it. The fix returns to the project's recurring theme of **sensor fusion / cross-validation**: add an **SHT31 / SHT40 temperature-humidity sensor** (**I²C**, see BUS2) as corroboration.

A real wetting event has several cross-checkable signatures:

- **Electrode conducts** (a conductive liquid bridges it);
- **Local relative humidity spikes** (evaporating liquid quickly raises humidity near the sensor);
- **Temperature near body heat** (fresh urine is warm, ~35–37 °C, whereas a cold spill or condensation is cooler).

AND these three together to declare a real event:

```text
real wetness  ≈  electrode conducts  AND  local humidity spikes  AND  temp ≈ body
false trigger ≈  only one (sweat, a cold spill, AC condensation)
```

This rejects sweat (temperature right, but humidity rises slowly over a small area) and a cold spill (temperature wrong), cutting the false-alarm rate sharply. The SHT40 is accurate, low-power and has a simple I²C interface — ideal for this cross-check.

### Durable and cleanable: waterproofing

The sensor must work long-term in a damp environment that's wiped and disinfected repeatedly; without protection it corrodes and fails within weeks. It needs **protection**:

- **Conformal coating**: a protective lacquer over the PCB and non-sensing areas, keeping moisture out and stopping copper and solder joints from corroding. It's the most common, cheapest protection for electronics in damp/outdoor settings.
- **Silicone sealing**: seal wiring and circuit seams with silicone to stop liquid ingress.
- **A wipeable membrane**: a thin film or waterproof-breathable membrane over the sensing electrodes — it "conducts" moisture through to a capacitive sensor while forming a surface you can wipe and disinfect, keeping electrodes away from the patient and from cleaning agents.

These fiddly-sounding details decide whether the system actually holds up on a real ward. A sensor that runs beautifully on the bench but corrodes and dies two weeks after going on a bed is worthless. **In medical and care settings, reliability, durability and cleanability matter as much as accuracy — sometimes more.**

### Real-world pitfalls

- **Alarm strategy**: on detecting wet, sound immediately or confirm for a few seconds first? Usually add a short confirmation delay to avoid momentary triggers. Tier the alarm too: a reminder vs an urgent alert.
- **Localization**: on a large bed, wetting may occur in only one region. Use several zoned electrodes to both localize and reduce single-point failure risk.
- **Baseline drift**: ambient humidity shifts with weather, so the "dry baseline" of a capacitive reading isn't fixed. Judge by a relative change (a sudden rise), not an absolute threshold.
- **Cleaning and replacement**: the membrane and electrodes are wear items; design for easy replacement.

### How capacitive sensing detects water "through" a layer

Why can a capacitive sensor detect wetness without touching the liquid? Recall the capacitor from CF4: the **dielectric** filling the space between two plates, through its **dielectric constant**, sets the capacitance. And water's dielectric constant (~80) is far higher than air's (~1) or dry fabric's.

So even with the interdigitated electrodes under a thin insulating film, not touching the urine, once the nearby fabric goes from "dry" to "wet" the effective dielectric constant of the region between the electrodes rises sharply → the capacitance grows markedly. The measuring circuit just detects this capacitance change (often by putting the capacitor in an oscillator and measuring the frequency shift, or with a dedicated capacitance chip) to know "it's wet". **The electric field penetrates the thin insulator to sense the water outside, while no current need actually flow through the liquid** — precisely why capacitive resists corrosion: the metal electrodes are protected by the insulator and don't react with the electrolyte.

### The simple resistive implementation

For a prototype, just to get it running, resistive is genuinely simple — one resistor and an ADC pin suffice (recall the CF3 divider):

```text
Vcc ── electrodes ──┬── ADC pin
                    │
             fixed resistor R (e.g. 100kΩ)
                    │
                   GND
```

When dry, the electrode resistance is huge and the tap is pulled near GND, so the ADC reads near 0; once urine bridges, the electrode resistance drops, the tap voltage rises, and the ADC reading jumps. Set a threshold to call "wet". Its drawback, as noted, is corrosion from soaking in electrolyte, so it suits only prototypes or setups with easily replaced electrodes. Understanding this minimal version clarifies "where capacitive costs more and gains more".

### The enemies of false alarms: sweat, spills, condensation

This chapter keeps stressing "no false alarms" because interference sources abound in reality. Comparing each with "real wetness" shows why one sensor isn't enough and cross-validation is essential:

| Event | Electrode conducts? | Local humidity? | Temperature? | Area/speed |
|---|---|---|---|---|
| **Real wetness** | yes (strong) | rapid spike | ≈ body (warm) | large area, fast |
| Sweat | weak/slow | slow small rise | ≈ body | diffuse, slow |
| Cold spill | yes | rises | cool | varies |
| AC condensation | weak | ambient | cool | slow |

No **single** signature cleanly separates them: by conductance alone, both sweat and water false-trigger; by temperature alone, sweat is also body temperature. But AND together "strong conduction + rapid humidity spike + temperature near body + large area in a short time" and you pull real wetness out of the interference. This table is the origin of CB4's decision logic, and the most concrete grounding of the project's "multi-sensor cross-validation" philosophy.

### Zoning and localization

An adult care bed has a fair area, and wetting is usually local. **Zoning with several electrodes** (say 4–6 regions across the bed) not only reports "wet" but "which region", so staff act fast; it also reduces the risk of one electrode's failure losing the whole bed, and lets the rest work while one region is fouled/damaged — echoing CB1's **redundancy** and **graceful degradation**.

### Alarm timing and the "confirmation window"

On detecting wet, don't scream instantly. The sensible approach sets a short **confirmation window**: the signal must exceed threshold and persist N seconds (rejecting momentary triggers and electrical glitches) before it's a real event and alarms. The alarm is tiered too — "remind staff to handle when convenient" vs "urgent". Consider **de-duplication**: one wetting event keeps triggering until handled, so the system should alarm once and enter a "known wet, awaiting action" state rather than sounding every few seconds and driving everyone mad. These fiddly-seeming alarm rules decide whether staff trust and keep the feature (see CB1's alarm discussion).

### Hands-on: build a "wet alarm" first

Start with the simplest resistive version to prove the principle, then add an SHT40 for cross-confirmation:

1. **Make electrodes**: two parallel bare copper wires / copper strips, close but not touching, fixed to a small piece of cloth — the simplest moisture electrode.
2. **Wire a divider**: one electrode end to Vcc, the other to "an ADC pin + a fixed resistor to GND" (the resistive wiring above).
3. **Read it**:

```cpp
void setup(){ Serial.begin(115200); }
void loop(){
  int v = analogRead(A0);
  Serial.println(v);            // near 0 when dry; a few drops of salt water jumps it
  delay(200);
}
```

Drop a little salt water (simulating urine) on the electrodes with a pipette, watch the reading jump, and a threshold "alarms". This proves detection.

4. **Add cross-confirmation**: connect an **SHT40** over I²C (recall BUS2) and read temperature/humidity. Change the rule to alarm only when "electrode over threshold **and** humidity rising **and** temperature near body" (the fusion logic above), and test against "a cold spill" and "breathing on it (simulating sweat)" to verify false alarms are rejected.

Feel the difference: with the electrode alone, a cold spill false-alarms; add the temp-humidity cross-check and only "warm + wet + conducting" together alarms — a direct demonstration of sensor fusion suppressing false alarms.

### Troubleshooting (moisture)

| Symptom | Likely cause | Where to look |
|---|---|---|
| High/erratic reading when dry | floating input / residual dampness | check the divider resistor, dry the electrodes |
| No response to drops | electrode gap too big / used pure water (non-conductive) | narrow the gap, test with salt water |
| Sensitivity drops after days | electrode corrosion | go capacitive, add an insulating film, design for replacement |
| Sweat/condensation false alarms | electrode as the only criterion | add SHT40 temp-humidity cross-check |
| One wetting keeps alarming | no event de-duplication | after one alarm, enter a "known wet" state |

### Going further: fitting into the care workflow

For a bed-wetting sensor to truly ease the nursing burden, it can't just "beep" — it must fit a full care loop:

- **Tiered notification**: a bedside indicator + a push to the nurses' station/phone, so staff out of the room learn of it promptly.
- **Response acknowledgment**: staff can one-tap "handled" after dealing with it; the system resets and logs the response time.
- **Trend logging**: count occurrences and time-of-night distribution to help assess the condition and adjust the care plan (e.g. timed nighttime toileting reminders).
- **Interplay with other subsystems**: wetting often coincides with movement, so cross-referencing CB3's posture data reduces false alarms and gives a fuller picture.

Only then does the humble "detect water" become a system of real care value — echoing the project's refrain: **the sensor is only the start; turning data into reliable, usable, workflow-integrated decisions and actions is the hard part.**

### Chapter quick reference

| Item | Point |
|---|---|
| Preferred principle | capacitive (corrosion-resistant, no liquid contact) |
| Cross-confirmation | SHT40 (I²C), using temp + humidity to reject false alarms |
| Real-wetness criteria | conducts + humidity spikes + temp ≈ body + large area |
| Main false-alarm sources | sweat, cold spills, condensation |
| Durability keys | conformal coating, silicone, wipeable membrane, replaceable |

> ✦ **Key point:** bed-wetting monitoring = **interdigitated moisture electrodes** (capacitive preferred — not touching the liquid, hence more corrosion-resistant) + **an SHT40 temperature-humidity cross-check over I²C** (using "conducts + humidity rises + temp ≈ body" to reject sweat and spills), made durable and cleanable by **conformal coating, silicone and a wipeable membrane**. The core engineering challenge isn't "detecting water" but "alarming only on real wetness" — that's the value of sensor fusion and threshold confirmation. In care settings, durability and cleanability matter as much as accuracy.
