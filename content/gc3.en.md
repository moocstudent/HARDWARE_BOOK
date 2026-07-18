## Core Notes

### From button to picture, three layers between

You pick a game, press A, and a childhood screen appears. Behind it a **whole software stack** collaborates:

```text
you → EmulationStation (frontend: browse / pick games)
    → RetroArch (unified runtime / dispatcher)
    → libretro core (the thing actually emulating a console)
    → ROM (game data) + BIOS (console firmware)
    → picture / sound / gamepad
```

Understand these three layers — **frontend, RetroArch, core** — and you know which layer to tune when something breaks.

### The frontend: EmulationStation

**EmulationStation (ES)** is the interface you see at boot: it groups by console, shows box art, scrapes media, and lets you browse and launch with the gamepad. It **emulates nothing** itself — it's a pretty launcher. Once you pick a game, it hands "which console + which ROM" to the next layer.

### RetroArch and libretro cores

**RetroArch** is a unified frontend/runtime framework; it doesn't emulate a console either, but loads individual **libretro cores** — each core is one console's emulator, packaged behind a common interface:

| Console | Common cores (examples) |
|---|---|
| NES | FCEUmm / Nestopia |
| SNES | Snes9x |
| GBA | mGBA |
| PS1 | PCSX-ReARMed (ARM-optimised) |
| N64 | Mupen64Plus-Next |

One console often has several cores: some are **accurate** but heavy, others **fast** but slightly less compatible. On an entry machine like the R36S you'll often pick the **ARM-optimised, faster** core (e.g. PCSX-ReARMed for PS1) — which is why "the same machine runs smoothly once you pick the right core".

<div class="spec-strip">
<div class="cell"><div class="k">Frontend</div><div class="v">ES</div></div>
<div class="cell"><div class="k">Framework</div><div class="v">RetroArch</div></div>
<div class="cell"><div class="k">Emulate</div><div class="v">core</div></div>
<div class="cell"><div class="k">API</div><div class="v">libretro</div></div>
</div>

### BIOS, ROMs and where files go

- **ROM:** the game's own data file, placed in the folder for its console (see the SD layout in GC4), e.g. `/roms/psx/`, `/roms/snes/`.
- **BIOS:** some consoles (PS1, Saturn, some GBA, etc.) need the machine's original **firmware file** to boot, placed in the designated `bios` folder, with the filename/checksum matching exactly. A **missing BIOS** is the number-one cause of "the game won't launch / black screen".
- **Formats:** commonly `.zip`, and `.chd` (compressed disc image, preferred for large disc games like PS1/Saturn).

> ⚠ Use only backups of games and firmware you **legally own**. Copyright belongs to the original makers; this course teaches the technical principles only and provides no ROMs/BIOS.

### Save states, cheats and shaders

RetroArch's general features work across any core:

- **Save State:** save/restore the full running state at any moment, independent of the game's own save points.
- **Cheats:** load cheat codes.
- **Shaders:** filters like CRT scanlines or LCD grids to recreate old-screen feel — but shaders cost GPU, a trade-off on entry machines.
- **Fast-forward / rewind, controller mapping, per-game configs**, and more.

> ✦ **Key point:** the emulation stack = **frontend (ES) picks the game → RetroArch dispatches → a libretro core emulates → ROM+BIOS supply the data**. For stutter, try a faster core; for a black screen, check the BIOS and file locations. This layering is universal across Linux handhelds.
