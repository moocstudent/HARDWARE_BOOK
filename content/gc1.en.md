## Core Notes

> ✦ This project flips the angle: earlier modules **built hardware**; here you learn to **evaluate and tame a finished device** — using an affordable Linux handheld like the R36S as the example.

### Don't be fooled by "15,000 games preloaded"

Handheld ads love "10,000+ built-in games" and "supports 21 emulators". Those numbers say **almost nothing about performance**. What actually decides the experience is: **which console generation can this machine's SoC emulate smoothly, and do the screen and feel hold up?** Learn to read specs and you won't pay for marketing words.

### The SoC is the heart: RK3326 as an example

The **SoC (System-on-Chip)** integrates CPU, GPU and memory controller into one chip — the handheld's heart. The R36S uses Rockchip's **RK3326**:

<div class="spec-strip">
<div class="cell"><div class="k">CPU</div><div class="v">4×A35</div></div>
<div class="cell"><div class="k">Clock</div><div class="v">1.5GHz</div></div>
<div class="cell"><div class="k">GPU</div><div class="v">Mali-G31</div></div>
<div class="cell"><div class="k">RAM</div><div class="v">~1GB</div></div>
</div>

- **CPU:** quad-core ARM Cortex-**A35**, 64-bit, up to ~1.5 GHz. The A35 is an **efficiency core** — low power but limited compute, which directly caps emulation ability.
- **GPU:** Mali-G31, enough for 2D and early 3D.
- **RAM:** around 1 GB LPDDR.

### Power vs emulation era: how far you get

The later a console, the more CPU/GPU its emulation demands. A rough mapping (drag the SoC tier in the interactive figure):

| Console generation | Entry tier (RK3326 / R36S) |
|---|---|
| NES / SNES / GB / GBA / Genesis | ✅ smooth |
| PS1 | ✅ mostly smooth |
| N64 / PSP / NDS | ⚠️ depends on the game |
| Saturn / Dreamcast | ⚠️ struggles |
| PS2 / GameCube and up | ❌ won't run |

**Takeaway:** entry machines like the R36S are excellent for "PS1 and the earlier golden age"; steady PSP/N64/DS wants a mid tier (RK3566 / H700), and PS2-and-up needs a high-end SoC (RK3588, etc.).

### Screen, battery, feel and build

Beyond the spec sheet, these "feel" items decide whether you keep using it:

- **Screen:** the R36S has a **3.5-inch IPS, 640×480**, fully laminated. Check resolution, colour and viewing angle — TN panels shift colour and have poor angles.
- **Battery:** **3500 mAh, ~6 hours**, ~2 h to charge. Runtime is the balance of capacity against SoC power draw.
- **Feel:** the tactility and layout of the D-pad, sticks and shoulder buttons matter for long sessions — invisible on a spec sheet, so read reviews.
- **Cooling and build:** plastic tolerances, wobbly buttons, heat — budget units often cut corners here.

### Avoiding traps: clones and inflated specs

The budget-handheld market is full of clones: the same shell may hide different silicon, and "Wi-Fi" might require a separate USB-C adapter (as on the R36S). **Identify the SoC model**, not the game count; check for an active firmware community (models that can run ArkOS/JELOS are usually more trustworthy, see GC2).

> ✦ **Key point:** choose a handheld by its **SoC** — it decides "which generation it can emulate" — then verify **screen, battery, feel and build**. The R36S (RK3326) is a value pick for the PS1 era. The game-count number is marketing; the SoC and community support are the truth.
