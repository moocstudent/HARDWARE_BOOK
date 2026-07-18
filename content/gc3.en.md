## Core Notes

### From button to picture, three layers between

You pick a game, press A, and a childhood screen appears. Behind it isn't "an emulator" at work but a **whole software stack** collaborating. Miss this stack and "the game won't launch / it stutters / no sound" leaves you helpless; understand it and you know which layer to tune for each problem.

```text
you (button)
 → EmulationStation (frontend: browse, pick, launch)
 → RetroArch (unified runtime / dispatcher)
 → libretro core (the code actually emulating a console)
 → ROM (game data) + BIOS (console firmware)
 → picture / sound / gamepad feedback
```

Three key layers — **frontend, RetroArch, core** — each own a stage. Let's take them apart.

### The frontend: EmulationStation

**EmulationStation (ES)** is the pretty interface you see at boot. It groups by console (NES, SNES, PS1…), shows box art, scrapes media, and lets you browse, pick and launch with the gamepad.

The key thing: **ES emulates nothing** — it's a "launcher / storefront". Its job is "let you comfortably find and select a game"; once chosen, it hands "which console + which ROM file" to the next layer to actually run. So ES's problems are mostly about "interface, categories, box art"; how well the game itself runs isn't its concern.

Different firmwares may use different frontends (some use ES, some a custom UI), but "the frontend only picks, it doesn't run" is consistent.

### RetroArch and libretro cores

Once a game is picked, the real worker is **RetroArch**. But note — **RetroArch doesn't emulate a console either**! It's a **unified frontend / runtime framework** providing a heap of common features (menus, saves, controller mapping, shaders, recording), then loading individual **libretro cores** to do the actual emulation.

**libretro** is a common interface spec. Each **core** is "one console's emulator", packaged as a plugin conforming to that interface. The elegance: all cores share RetroArch's common features (saves, cheats, shaders work the same across cores), and RetroArch needn't care how each core emulates internally.

| Console | Common cores (examples) | Note |
|---|---|---|
| NES | FCEUmm / Nestopia | Nestopia more accurate, FCEUmm faster |
| SNES | Snes9x / snes9x2010 | latter tuned for slow machines |
| GBA | mGBA / gpSP | mGBA accurate, gpSP fast |
| PS1 | PCSX-ReARMed | **ARM-optimised, the entry pick** |
| N64 | Mupen64Plus-Next | heavy, marginal on entry machines |
| Arcade | FBNeo / MAME | must match ROM version |

**One console often has several cores** — a key point: some cores are **accurate** (faithful to the real machine but heavy), others **fast** (tuned for weak hardware, trading a little compatibility/accuracy). On an entry machine like the R36S (see GC1), PS1 runs smoothly on the **ARM-optimised PCSX-ReARMed**, but an "accurate but heavy" core might stutter. **"Same machine, same game, the right core turns stutter into smooth" — that's the practical value of understanding this stack.**

### BIOS, ROMs and where files go

To run, an emulator needs two kinds of file:

- **ROM**: the game's data (a cartridge/disc image). Placed in the folder for its console (see GC4's SD layout), e.g. `/roms/psx/`, `/roms/snes/`. The frontend scans these folders to build the game list.
- **BIOS**: some consoles (PS1, Saturn, some GBA, NDS, etc.) need the machine's **original firmware file** to boot — because the emulator emulates not just the CPU but the firmware that runs at power-on. BIOS files go in the designated `bios` folder, and the **filename and checksum (MD5) must match exactly** — a single byte off fails.

> ⚠ **The number-one cause of "game won't launch / black screen / error" is a missing or wrong BIOS.** If every game for one console fails to start, first check whether it needs a BIOS and whether your BIOS filename and checksum are right.

Common formats: `.zip` (compressed ROM, readable directly by most cores) and `.chd` (compressed disc image, preferred for large disc games like PS1/Saturn — small and directly runnable).

> ⚠ **Copyright note**: use only backups of games and firmware you **legally own**. ROMs and BIOS are copyrighted by their makers; this course teaches the technical principles only and **provides and links to no ROM/BIOS files**.

<div class="spec-strip">
<div class="cell"><div class="k">Frontend</div><div class="v">ES</div></div>
<div class="cell"><div class="k">Framework</div><div class="v">RetroArch</div></div>
<div class="cell"><div class="k">Emulate</div><div class="v">core</div></div>
<div class="cell"><div class="k">API</div><div class="v">libretro</div></div>
</div>

### Saves, cheats, shaders: RetroArch's common powers

Because these features live in the RetroArch layer (not inside a core), they work across **almost every core** — the value of a unified framework:

- **Save State**: at any moment, save the emulator's entire running state (memory, registers, screen) to a file, and restore it instantly. It doesn't depend on the game's own save points — save on any frame. Want to save just before a boss? Anytime.
- **Cheats**: load cheat codes that modify game memory for invincibility, infinite money, etc.
- **Shaders**: GPU filters that recreate old-screen feel — CRT scanlines, shadow mask, LCD grid, curvature — for period authenticity. **But shaders cost GPU**, a trade-off on entry machines like the R36S: a heavy shader may drop frames, so pick a light one or none.
- **Fast-forward / rewind**: speed through grinding, or "rewind" a few seconds to retry (great for mistakes).
- **Per-game config**: set a core, buttons or shader for a single game without affecting others.

### A debugging mindset: locate by layer

With the three-layer stack understood, debugging has structure:

- **Every game for one console won't launch** → usually a **BIOS** problem or that console's core isn't installed right (core/BIOS layer).
- **Launches but stutters/drops frames** → switch to a **faster core**, disable heavy shaders, or the machine simply can't handle that generation (GC1's performance ceiling).
- **Games don't appear in the interface** → the **frontend** didn't scan them; check the ROMs are in the right folder and format, and update the game list.
- **No sound, wrong buttons** → RetroArch's audio/input settings or controller mapping (see GC4).

### What emulation is actually "emulating"

What does a running core do inside? It must **pretend, in software, to be the whole of that old machine's hardware**: emulate its CPU (read the game's machine instructions one by one and perform equivalent operations), emulate its display chip (draw the data the game writes into "video memory" into a picture), emulate its sound chip, gamepad interface, cartridge/disc reads… The game was written for real hardware and doesn't know it's in an emulator; the core has to fool it.

Translating CPU instructions has two approaches, worlds apart in performance:

- **Interpreter**: read and translate the original instructions one at a time. Simple, accurate, portable — but slow, as every instruction takes a long detour.
- **Dynamic recompilation (Dynarec / JIT)**: **batch-translate a block of original instructions into the host's (ARM) native instructions** and cache them, running the translation directly next time. Much faster, but complex and written specifically for the host CPU architecture.

That's why an "ARM-optimised core" (like PS1's PCSX-ReARMed) is fast on a handheld — it has ARM dynamic recompilation. Understand this layer and you see the principle behind GC1's "the right core turns stutter into smooth": for the same game, an interpreter core may stutter where an ARM-dynarec core is smooth.

### Why later consoles are exponentially harder to emulate

GC1 said "later consoles demand more compute"; here's the principle. The difficulty explodes from several stacked factors:

- **Faster, more complex CPUs**: more, fancier instructions to emulate;
- **Multiple parallel chips**: PS2 and Saturn had several co-processors working at once, and the emulator must emulate several chips in sync — much harder;
- **3D graphics**: early 2D just draws pixels, but later 3D means emulating a whole GPU pipeline (geometry, rasterization, textures), demanding on the host GPU;
- **Accuracy needs**: many games depend on the original machine's timing details, and inaccurate emulation bugs out — while chasing accuracy is slower.

So PS1 to PS2 isn't "a bit harder" but "an order of magnitude harder" — explaining the clear chasm between PS1 and PS2 in GC1's capability table.

### Frame rate, audio-video sync and overclocking

Emulation must not only "compute it" but "compute it in time". Old consoles mostly refresh at **50/60 Hz**, so the core must finish a frame within 1/60 s or it **drops frames** (stutter). Audio is fussier: sound must be fed continuously, and if compute falls short and the buffer underruns you get "crackling, stutter, pitch shift". So "it crackles when it stutters" is often a sign of insufficient compute.

RetroArch offers countermeasures: **frameskip** (skip rendering when it can't keep up, saving game logic and sound), **audio sync**, and some cores' **overclock/accuracy options** (e.g. an N64 core can lower accuracy for speed). These are knobs that "trade visual quality/accuracy for smoothness" — on entry machines, learning to tune them often turns "barely playable" into "smoothly playable".

### Getting games recognised: scraping and game lists

After copying ROMs into folders, how does the frontend show nice box art and game info? By **scraping**: the frontend matches the filename against an online or local database, downloads metadata (box art, blurb, release year) and generates a **gamelist** file.

So sometimes "the game's there but no art / garbled name" means scraping wasn't done or didn't match — not a problem with the game itself. Consistent filenames greatly improve scraping success. This is a **frontend-layer** matter, unrelated to whether the game runs — confirming GC3's opening "locate problems by layer".

### RetroArch cores vs standalone emulators

Not every emulator is a libretro core. Some complex consoles (certain PSP, PS2 emulators) have **standalone** versions with fuller features and more specialised tuning. Many firmwares mix "RetroArch cores for simple consoles, standalone emulators for complex ones". Understand this and you won't be puzzled that "PSP doesn't go through RetroArch on this machine" — the layering idea is unchanged, just a more specialised implementation at one layer.

### Hotkeys: the handheld's hidden controls

A handheld has no keyboard, so RetroArch's menu, saves and exit all use **combo hotkeys** — usually a **Hotkey button (often mapped to SELECT or a dedicated function key)** plus another key. E.g. "Hotkey + X" opens the menu, "Hotkey + R1" saves state, "Hotkey + Start" exits the game (depends on firmware). Memorizing your firmware's hotkey chart is a prerequisite for smooth use. Not finding the menu or not exiting a game is almost always not knowing the hotkeys — one of beginners' most common confusions.

### Hands-on: make a stuttering game smooth

This best shows the value of "understanding the stack". Say a PS1 or N64 game stutters; try these in order (cheapest to costliest):

1. **Confirm the bottleneck**: turn on RetroArch's **frame-rate display** and see whether it holds 60 or drops to 40. Dropped frames are a performance issue, not something else.
2. **Switch to a faster core**: in the RetroArch menu, change to an ARM-optimised fast core (PCSX-ReARMed for PS1). The most common, most effective move.
3. **Disable heavy shaders**: if a CRT-style shader is on, turn it off first — they're GPU-hungry.
4. **Tune core options**: many cores have "speed vs accuracy" options (lower internal resolution, disable some enhancements, enable dynamic recompilation) — push toward "fast".
5. **Enable frameskip**: if it still can't keep up, allow skipping frames to preserve smoothness and sound.
6. **Recognise the ceiling**: if nothing helps, the machine may simply not handle that generation (back to GC1's performance ceiling) — not a settings problem but a hardware ceiling.

Walk this flow and you truly feel that "same machine, same game, the right core and settings turn stutter into smooth" — the practical reward of understanding the three-layer stack.

### Troubleshooting (emulation)

| Symptom | Which layer | Where to look |
|---|---|---|
| Every game for one console won't launch | core / BIOS | check whether it needs a BIOS, and the filename/checksum |
| Launches but stutters/drops frames | core / performance | faster core, disable shaders, tune options, frameskip |
| Games don't appear in the list | frontend | right folder, right format, update the game list |
| No box art / garbled name | frontend | re-scrape, normalize filenames |
| No sound / crackling | RetroArch / performance | check audio settings; crackling is often insufficient compute |
| Wrong buttons / can't exit | RetroArch input | reset button mapping, learn the hotkeys (Hotkey combos) |

### One sentence per layer

| Layer | One-sentence job | Typical symptom when it breaks |
|---|---|---|
| Frontend (ES) | let you browse, pick, launch | games missing, no box art |
| RetroArch | unified menu, saves, mapping, shaders; dispatch cores | buttons, saves, menu related |
| libretro core | actually emulate that console | stutter, compatibility, accuracy |
| ROM | game data | missing file, wrong format |
| BIOS | console firmware | whole console won't launch, black screen |

Remember this "layer — job — symptom" map, and for any problem, first ask "which layer is this?", turning debugging from "random trials" into "follow the map".

### Chapter quick reference

| Item | Point |
|---|---|
| Three layers | frontend → RetroArch → core |
| Fast-core key | dynamic recompilation (dynarec), ARM-optimised |
| PS1 entry core | PCSX-ReARMed |
| Top launch-failure cause | missing/wrong BIOS (filename/checksum must be exact) |
| Stutter, try first | faster core → disable shaders → tune options → frameskip |
| Common powers | save states, cheats, shaders, rewind |

> ✦ **Key point:** the emulation stack is three layers: **the frontend (ES) picks the game → RetroArch dispatches and provides common features → a libretro core actually emulates a console → with ROM + BIOS supplying the data**. Practical knowledge: **one console has several cores, and picking the right one (especially a fast ARM-optimised core) turns stutter into smooth**; **a missing/wrong BIOS is the top cause of games not launching**; saves, cheats and shaders are RetroArch's common powers. This layering is universal across Linux handhelds.
