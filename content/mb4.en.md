## Core Notes

### Bed-wetting detection: looks simple, most detail

"Is the bed wet" sounds like the simplest channel, but it's the closest to real care and the trickiest: it must be **sensitive** enough to catch it immediately, yet **corrosion-resistant, cleanable** and **free of false alarms** (sweat or a spilled drink shouldn't trigger it).

### Moisture electrodes: water bridges the poles

The most direct principle: two closely spaced, interlocking conductive electrodes (**interdigitated electrodes**). When dry, the poles are insulated from each other; the moment urine (a conductive electrolyte) bridges them, resistance drops sharply and capacitance changes — an ADC or a capacitance read detects it.

- **Resistive:** measure the resistance between poles — simple and direct, but electrodes soaking in electrolyte long-term **corrode easily**.
- **Capacitive:** measure the dielectric change; the electrodes can sit under a layer of dielectric and **not touch the liquid directly**, so it's more corrosion-resistant and durable.

> Verdict: **capacitive is more corrosion-resistant than resistive**, so productisation leans capacitive; you can also start with an off-the-shelf "soil-moisture-style capacitive sensor" module.

### Confirming real wetness with an SHT40

A moisture electrode alone false-alarms easily. Add an **SHT31 / SHT40 temperature-humidity sensor** (**I²C**, see BUS2) for **cross-validation**: real wetting raises **local humidity** and shows a temperature **near body heat**. Requiring "electrode triggered + humidity up + temperature plausible" together before declaring an event cuts false alarms dramatically.

```text
real wetness  ≈  electrode conducts  AND  local humidity↑  AND  temp ≈ body
false trigger ≈  only one (sweat, a spill, condensation)
```

<div class="spec-strip">
<div class="cell"><div class="k">Detect</div><div class="v">electrodes</div></div>
<div class="cell"><div class="k">Prefer</div><div class="v">capacitive</div></div>
<div class="cell"><div class="k">Confirm</div><div class="v">SHT40</div></div>
<div class="cell"><div class="k">Bus</div><div class="v">I²C</div></div>
</div>

### Durable and cleanable: waterproofing

The sensor must work long-term in a damp environment that needs repeated wiping, so it needs **protection**:

- **Conformal coating** over the circuitry to keep moisture out;
- **Silicone** to seal seams;
- A wipeable **membrane** over the electrodes that conducts wetness through yet is easy to clean and disinfect.

These sound like trivia, but they decide whether the system actually holds up on a real ward.

> ✦ **Key point:** bed-wetting monitoring = **interdigitated moisture electrodes** (capacitive preferred, corrosion-resistant) + **SHT40 temperature-humidity cross-confirmation**, made durable and cleanable by **waterproofing**. The core engineering challenge isn't "detecting water" but "alarming only on real wetness" — that's the value of sensor fusion and threshold confirmation.
