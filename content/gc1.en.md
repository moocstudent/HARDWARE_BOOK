## Core Notes

> ✦ This project flips the angle: earlier modules **built hardware**; here you learn to **evaluate and tame a finished device** — using an affordable Linux handheld like the R36S as the example. Read the specs, flash the system, interface with programs, and you go from "user" to "developer who can modify and program it".

### Don't be fooled by "15,000 games preloaded"

A handheld's store page loves "10,000+ built-in games" and "supports 21 emulators". Those numbers say **almost nothing about performance** — ten thousand games is just an SD card stuffed with ROMs, which any machine can "ship with"; whether it *runs* them is another matter. What actually decides the experience is two things the marketing won't stress:

1. **Which console generation can this machine's SoC emulate smoothly?**
2. **Will the screen, battery, button feel and build hold up over time?**

Learn to read these two and you won't pay for a hollow metric like "game count" — you'll judge whether a machine is worth it and suits what you want to play.

### The SoC is the heart: RK3326 as an example

The **SoC (System-on-Chip)** integrates CPU, GPU, memory controller and peripherals into one chip — the handheld's heart, and **it all but sets the performance ceiling**. The R36S uses Rockchip's **RK3326**:

<div class="spec-strip">
<div class="cell"><div class="k">CPU</div><div class="v">4×A35</div></div>
<div class="cell"><div class="k">Clock</div><div class="v">1.5GHz</div></div>
<div class="cell"><div class="k">GPU</div><div class="v">Mali-G31</div></div>
<div class="cell"><div class="k">RAM</div><div class="v">~1GB</div></div>
</div>

Read the table line by line:

- **CPU: quad-core ARM Cortex-A35**, 64-bit, up to ~1.5 GHz. The key is that **the A35 is an "efficiency core"** — ARM's cores split into two kinds: performance "big" cores (A7x, A5x) and power-saving "little" cores (A35, A53, A55). The A35 is the most frugal tier: low heat and long battery life, at the cost of **limited per-core compute**. And most emulators are **single-threaded CPU-bound** (a game leans mainly on one core), so "quad-core" doesn't make old games faster — what matters is **single-core performance**, and the A35's is modest. That directly frames the emulation ceiling.
- **GPU: Mali-G31**, entry-level, plenty for 2D and early 3D, but out of its depth on heavy 3D like PS2 or GameCube.
- **RAM: ~1 GB LPDDR**, enough for emulators and the Linux frontend, but not roomy.

**The core habit for reading specs: don't just look at core count and clock; look at the architecture (big vs little core) and per-core performance.** A 1.5 GHz A35 is far weaker per core than a 1.8 GHz A55 or A76.

### Power vs emulation era: how far you get

How hard a console is to emulate depends on the **complexity of the emulated machine** — later consoles have more complex architectures and demand more compute. And emulation isn't "just run at native speed": an emulator translates the target CPU's instructions in software, usually needing **several times the original machine's power** to reach full speed. That's why a modern handheld easily emulates a 30-year-old NES yet is helpless against a PS2 from a dozen years ago.

A rough mapping (drag the "SoC tier" slider in the figure above for different tiers):

| Console generation | Entry tier (RK3326 / R36S) |
|---|---|
| NES / SNES / GB / GBC / Genesis | ✅ perfectly smooth |
| GBA / PC Engine | ✅ perfectly smooth |
| PS1 | ✅ mostly smooth (right core) |
| N64 / PSP / NDS | ⚠️ depends on the game, some struggle |
| Saturn / Dreamcast | ⚠️ struggles, many run poorly |
| PS2 / GameCube / Wii | ❌ won't run |
| Switch / PS3 and up | ❌ no chance |

**Takeaway:** entry machines like the R36S are an excellent-value pick for "**PS1 and the earlier golden age**" — the vast classics of the NES, SNES, GBA, arcade and original PlayStation all run smoothly. Steady PSP / N64 / DS wants a **mid tier** (RK3566, H700-class); touching PS2 / GameCube needs a **high-end SoC** (RK3588, Snapdragon, etc.), with price and size rising to match. **Decide which generation you mainly want to play, then pick the SoC tier accordingly** — don't overpay for power you won't use, and don't buy only to find you can't play the game you were after.

### Screen, battery, feel and build

Beyond the spec sheet, these "feel" items decide whether you actually keep using it — often glossed over on the spec page, yet they most shape the long-term experience:

- **Screen**: the R36S has a **3.5-inch IPS, 640×480**, fully laminated (OCA). Check three things: **resolution** (sharpness; old games are low-res anyway, so 640×480 is fine), **panel type** (IPS has true colour and wide angles; TN is cheap but shifts colour off-axis), and **full lamination** (no air gap between glass and display for a clearer look that resists dust).
- **Battery**: the R36S is **3500 mAh, ~6 hours**, ~2 h to charge. Runtime is the **balance of capacity against SoC power draw** — the A35 sips power, so a mid capacity lasts a while. Don't read mAh alone; pair it with the chip's consumption.
- **Feel**: the D-pad's tactility, a stick's precision and re-centering, and the shoulder-button layout (analog triggers vs digital buttons) are key to long-session comfort. These are **completely invisible on a spec sheet** — only hands-on reviews show them. Budget units often cut corners on button feel.
- **Cooling and build**: plastic tolerances, button wobble, heat over long runs, even seam alignment — a budget machine's cost pressure often shows in these details.

### Avoiding traps: clones and inflated specs

The budget-handheld market is full of clones, rebrands and inflated specs; buy carefully:

- **Same shell, different silicon**: many "identical-looking" machines hide entirely different, much weaker chips. **Identify the SoC model**, not the shape or seller's pitch.
- **Inflated specs**: claimed RAM, battery capacity and screen quality may be padded. Trust third-party reviews and teardowns over the store page.
- **"Wi-Fi" sold separately**: many entry machines (the R36S included) have **no built-in Wi-Fi**; getting online needs an extra USB-C wireless adapter (see GC4). Don't assume.
- **Look at the community**: a healthy, active firmware community (models that can run ArkOS / JELOS, see GC2) is a strong signal the machine is solid and worth buying — a community bothering to build systems for it means the hardware is well-documented, the user base is large, and the pitfalls are already mapped.

### RAM and storage: two overlooked parts

Beyond the SoC, two parts are often glossed over yet shape the experience:

- **RAM**: emulators hold the game, state and buffers in memory. ~1 GB is ample for PS1 and earlier, but tightens on heavier emulators (N64/PSP) or with large buffers and shaders. Too little RAM causes stutter or crashes. It doesn't decide "can it run" like the SoC, but it decides "how smoothly".
- **Storage (SD card)**: games load from the SD card. The card's **speed class** (Class 10, U1/U3, A1/A2) affects load times and the smoothness of large disc games (PS1 .chd). A genuine, fast card matters more than saving a few dollars — fake high-capacity cards are one of the handheld community's biggest traps (labelled 256 GB but really 32 GB, losing data once full).

### Screen aspect ratio and integer scaling

Most old games are **4:3** (or squarer). The R36S's 640×480 is exactly 4:3, matching the native ratio of the SNES, PS1, etc. — not a coincidence but a retro choice. Buy a 16:9 widescreen handheld to play 4:3 games and you either get black bars on the sides or stretch and distort them.

A step further is **integer scaling**: when the screen resolution is an integer multiple of the game's native resolution, each source pixel becomes exactly n×n screen pixels, sharp and unblurred; a non-integer multiple needs interpolation, blurring the image or creating uneven pixels. Pixel-perfect players prize this. Understand it and you see why "screen resolution" isn't higher-is-better but should "match" the generation you play.

### Form factor, ergonomics and cooling

- **Horizontal vs vertical**: horizontal (like the R36S, a mini PSP) suits action, fighting and analog-stick games; vertical (Game Boy shape) suits classic NES/GB handheld games and is more pocketable. Pick by what you mainly play and how you carry it.
- **Weight and grip**: too heavy tires the hands, too light feels cheap; grip contours and button placement decide long-session comfort.
- **Cooling**: an entry SoC's low power usually needs only passive cooling (the case), but heavy emulation at sustained load heats up and may trigger **thermal throttling** — the chip auto-slows to cool, showing as "smooth at first, then stutters". Better-built machines cool more sensibly.

### Sound and the rest

The spec page often skips **audio**: the R36S claims an "8W cavity speaker + aux (headphone) support". Speaker quality, a headphone jack, Bluetooth-audio latency all affect the experience. Small details like **vibration, button backlight, Type-C power and play-while-charging** are worth checking against your needs too.

### Know the whole handheld landscape

The R36S is one member of a vast budget-Linux-handheld ecosystem. Knowing the rough map helps you compare across and choose by need:

| Chip tier | Example models | Roughly plays up to |
|---|---|---|
| Entry (RK3326) | R36S, RG351 series | PS1 and earlier |
| Mid (RK3566 / H700) | RG353, RG40xx, Anbernic mid | + PSP / N64 / DS |
| High (RK3588 / Snapdragon) | high-end Retroid, AYN Odin, etc. | + PS2 / GC / some Switch |

By brand, **Anbernic, Miyoo, Powkiddy, Retroid** are common players. Different models may share a chip (similar performance) but differ in shape and build. **First lock the chip tier by "which generation you want to reach", then within that tier compare shape, screen, build and community support to pick a model** — the buying method that ties all this chapter's points together.

### A repeatable buying decision flow

Chain this chapter's points into executable steps to follow next time you buy:

1. **First decide "up to which generation"**: honestly ask what you'll mainly play. Only NES/SNES/GBA/arcade/PS1? An entry tier suffices — don't overspend. Steady PSP/N64/DS? Mid. Want PS2/GC? High-end.
2. **Lock the SoC tier accordingly**: use the "chip tier → plays up to" table above to circle a tier (e.g. entry = RK3326).
3. **Within that tier, check a model's community support**: prefer ones that run ArkOS/JELOS with an active community (a trust signal).
4. **Compare the feel items**: horizontal or vertical? Screen ratio (4:3 retro / 16:9)? Button-feel reputation in reviews? Enough battery?
5. **Check hidden costs**: need a separate Wi-Fi adapter? Is the bundled SD card fast enough and genuine?
6. **Order by SoC model**: don't be swayed by "10,000 games", confirm the chip model and specs, and buy from a well-reviewed seller.

Finish these six steps and you've bought not "a box stuffed with games" but "a little computer matched to your needs, whose limits you understand, and which you can deeply tinker with".

### Common questions

| Question | Answer |
|---|---|
| Is more cores stronger? | No. Emulation is mostly single-threaded; **per-core performance** is what matters — a quad A35 loses to a dual big core |
| Is higher screen resolution better? | No. Match it to the game generation; 4:3 and integer scaling matter more for retro |
| Is "10,000 games preloaded" valuable? | That's just an SD card's contents, not performance — don't pay a premium for it |
| Can a cheap machine play PS2? | Entry tier can't; PS2 needs a high-end SoC (see the capability table) |
| Is no built-in Wi-Fi a trap? | It's common — confirm in advance whether you need a separate USB-C adapter |
| How to avoid clones/inflated specs? | Identify the SoC model, read third-party teardowns, pick models with active community support |

### Spec quick reference: what each word really means

Translate the common store-page specs into "the one thing you should actually care about":

| Spec word | What to really look at |
|---|---|
| CPU core count | not the count — the **architecture (big/little) and per-core performance** |
| Clock GHz | comparable only within one architecture; A35@1.5G ≠ A55@1.5G |
| GPU | sets 3D ability; matters little for 2D classics |
| RAM | ≥1GB for old generations; bigger is steadier for heavy emulation |
| Screen resolution | match the game generation; higher isn't better |
| Screen type | IPS beats TN; full lamination is clearer |
| Battery mAh | read runtime with the SoC's draw, not the number alone |
| Preloaded game count | a marketing number — **ignore** |
| "Supports XX emulators" | supports ≠ smooth; can the SoC actually drive it? |

### Three sentences to remember for buying

1. **Which generation you can play = the SoC's per-core performance** — decide this first.
2. **Whether it's good long-term = screen/feel/build/battery** — invisible on the spec page, found in reviews.
3. **Avoiding a bad buy = identify the SoC model + check community activity** — ignore "10,000 games".

When unsure, return to the most basic question: **"what do I mainly want to play?"** — the answer decides everything.

> ✦ **Key point:** to choose a handheld, **first look at the SoC** — it decides "which generation it can emulate", and reading a SoC means looking at **architecture and per-core performance**, not core count and clock. The R36S (RK3326, quad A35) is a value pick for the PS1 era. **Second, look at screen, battery, feel and build** — the "feel" items absent from the spec page that most shape long-term use. Game count is marketing; the SoC tier, build and community support are the truth. Decide which generation you want to play, then pick to match.
