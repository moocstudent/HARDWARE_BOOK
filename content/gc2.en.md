## Core Notes

### The handheld is really a little Linux computer

There's nothing mysterious about these handhelds: each is a small ARM **Linux computer** — a close cousin of the Raspberry Pi you met in the MC module (both ARM SoC + Linux). It differs from an Arduino-style "microcontroller": an Arduino runs one fixed program you flashed in, whereas the handheld runs a full operating system with a kernel, a filesystem and multitasking.

One key fact sets its hackability: **it has no fixed built-in system disk; it boots from an SD card.** That means swapping the SD card swaps the whole operating system. This design gives you enormous freedom and is the physical basis of "flashing".

### The boot chain from SD

Pressing power does much the same as a PC turning on, just leaner. Understand this chain and everything downstream (why you can flash, why a bad flash blanks the screen, why it recovers) falls into place:

```text
power on
 → the SoC's built-in BootROM runs
 → reads the bootloader (U-Boot) from a set location on the SD card
 → U-Boot loads the Linux kernel + device tree
 → the kernel initializes hardware, mounts the root filesystem
 → launches the emulator frontend (EmulationStation)
 → you see the game-picking screen
```

Key players:

- **BootROM**: a tiny, unchangeable boot routine burned into the SoC. It runs first on power-up, its sole task being "where to find the next stage (the bootloader)". It's what mandates "boot from SD".
- **U-Boot**: a powerful bootloader that loads the kernel and device tree from SD into memory, sets boot parameters, and hands control to the kernel.
- **Device Tree**: a data file describing "what hardware this machine has, how the pins connect, how big the screen is, where the buttons are". **The same Linux kernel plus a different device tree adapts to a different handheld model.** That's why firmware must match your exact model — a wrong device tree and the kernel can't find the screen or buttons, showing as a black screen or no response.

Understand this chain and you see: **flashing the wrong firmware gives at most a black screen, never a "brick" — because the whole system is on the SD card, and re-writing a card recovers it.**

### Stock firmware vs third-party firmware

The stock system on a budget handheld is often **bloated, ad-laden, abandoned and rough**. Happily, the open-source community builds plenty of high-quality third-party firmware for these common SoCs (especially Rockchip), which you burn to an SD card to replace wholesale:

| Firmware | Based on | Traits |
|---|---|---|
| **ArkOS** | Debian | stable, approachable, customizable — a common default for the R36S |
| **JELOS / ROCKNIX** | read-only Linux | "appliance-like", read-only system for stability and low maintenance |
| **AmberELEC** | read-only Linux | aimed at the Anbernic RG351 family, same idea |
| **Batocera** | read-only Linux | cross-platform, supports many devices |

Third-party firmware usually brings **better performance tuning** (a kernel and core choices optimised for the chip), **more emulators and updates**, a **cleaner UI**, and **active community support** (someone to answer when you're stuck). That's why GC1 called "look at the community" a key buying signal — a machine with active third-party firmware essentially means "solid, fun, pitfalls already filled".

"Read-only system" firmwares (JELOS, etc.) have an extra benefit: the system partition is read-only, so however you mess with games and configs you can't corrupt the system itself, and power loss won't easily damage the filesystem — ideal for a device switched off at any moment.

<div class="spec-strip">
<div class="cell"><div class="k">Really</div><div class="v">Linux</div></div>
<div class="cell"><div class="k">Boots</div><div class="v">SD card</div></div>
<div class="cell"><div class="k">Loader</div><div class="v">U-Boot</div></div>
<div class="cell"><div class="k">Firmware</div><div class="v">ArkOS</div></div>
</div>

### How to flash: write an image to the SD card

The process is identical to making a Raspberry Pi system card (recall the MC module), and very simple:

1. **Download** the **image file** for your model's firmware (usually a `.img` or an archive). **Match the model** — an RK3326 R36S needs the R36S/RG351-family build so the device tree matches.
2. Use **balenaEtcher** or **Raspberry Pi Imager** to **write** the image to a microSD card. Writing erases everything on the card, so back up first.
3. Put the card back in the handheld's **system slot** and power on. The first boot usually **auto-expands partitions** (fills the whole card) and creates `roms`, `bios` and other folders.

> ⚠ **Three flashing rules**: (1) back up the original card first (especially the bundled one preloaded with games); (2) match the firmware build to the model (SoC + device tree); (3) don't panic on a bad flash — since the system is on the SD card, re-writing one recovers it, no brick. This is exactly where a handheld is "safer to tinker with" than a phone or an Arduino.

### Dual slots: OS card vs games card

Machines like the R36S often have **two microSD slots** — not decoration but a clear division of labour:

- **Slot 1 (OS card / TF1)**: holds the operating system / firmware. A small card (16–32 GB) suffices.
- **Slot 2 (games card / TF2)**: holds ROMs and assets (box art, etc.). Use a large card (128–256 GB). The 128 GB "10,000 games preloaded" card the R36S ships with is typically this one.

**Benefits of separating them:**
- **Upgrading/changing the system leaves the games card untouched** — you can freely reflash the OS card to try firmwares while your precious games and saves are safe.
- **Simpler backups** — the two data types are separate, backed up independently.
- **Flexible capacity** — small OS, large games, each on a fitting card, saving money.

Understand the dual slots and you know which card to touch when "trying a different firmware" (the OS card) and where to put games (the games card, see GC4's layout).

### What's actually on the SD card: the partition layout

A flashed system card isn't one big file but is split into several **partitions** with distinct jobs. Understand the layout and flashing, expanding and un-bricking won't confuse you:

- **Boot partition**: holds U-Boot, the kernel, device tree and boot scripts. The BootROM finds the next stage here. Usually small, with a special format.
- **System partition (root)**: holds the OS proper (frontend, RetroArch, libraries). Read-only firmwares (JELOS) set it read-only to protect the system from corruption.
- **Data/games partition**: holds your ROMs, saves and configs. On first boot the system often **auto-expands this partition** to fill the rest of the card (so it's small right after flashing and grows on boot).

Writing the image essentially copies this whole partition structure onto the card; the first-boot "auto-expand" then enlarges that last data partition to use the whole card.

### Updating firmware vs a fresh reflash

Firmware needs updating over time, in two ways — don't confuse them:

- **Incremental update (on-device)**: many firmwares have "online update / OTA" that updates only system files, **keeping your games, saves and configs**. Use it for routine minor upgrades.
- **Fresh reflash (re-writing the image)**: re-write the whole system card. It **wipes the system card** (a separate games card is unaffected, see dual slots). Use it to change firmware or "factory reset" a messed-up system.

**Always back up saves before reflashing** — saves usually live on the games card or data partition, but some firmwares keep them on the system card, so if unsure, image the whole card first (with something like Win32DiskImager).

### Black screen? The un-brick mindset

Beginners dread "black screen after flashing". Back to GC's core insight — **the system is on the SD card, so a true brick is nearly impossible**. Black-screen triage:

1. **Right firmware build?** A model/device-tree mismatch is the top cause. Re-download the correct firmware for **your exact machine**.
2. **Did it write successfully?** Use balenaEtcher's verify to confirm; try another card (a bad card is a common culprit).
3. **Right slot?** The system card goes in the system slot (TF1).
4. Still black after all that → check the model's community guide, which often has a specific key combo or recovery image.

As long as the original card survives (or you backed one up), re-writing one returns to a working state — the "tinker without fear" safety that makes Linux handhelds fun.

### Practical firmware choice

One machine often has several third-party firmwares — how to pick?

- **Hardware support**: prefer a firmware with mature support for **your machine** (Wi-Fi adapter, screen and buttons all driven correctly). Check the community compatibility list.
- **Read-only vs writable**: read-only (JELOS) is more stable and power-loss-safe, good for "grab and play"; writable (ArkOS/Debian-based) is freer for installing software and running scripts (see GC4), good for deep tinkering.
- **Interface and features**: some firmwares have a pretty UI and full box-art scraping; some are geeky and highly tweakable. Try by taste — changing firmware is just changing a card.
- **Community activity**: a firmware updated often, with someone to answer questions, is a better long-term experience.

This is why many keep **several system cards**, each flashed with a firmware, swapping to switch the whole system at a stroke — the biggest freedom "boot from SD" gives the player.

### Hands-on: the full first-time flashing flow

Walk the whole path from a blank card to a booted system (ArkOS on an R36S as the example; other models are the same idea):

1. **Back up the original card**: if the machine came with a preloaded card, first image the whole card with Win32DiskImager / balenaEtcher's "read image from card" and store it safely. It's your undo button.
2. **Download the right firmware**: on the model's official/community page, download a firmware image that **explicitly says it supports your machine** (the R36S usually uses the matching RG351-family build). Confirm it's for your screen and chip.
3. **Flash**: insert a fast genuine microSD into your PC, use **balenaEtcher** to pick the image, pick the card, write, and wait for verify to pass.
4. **Insert and boot**: put the card in the **system slot (TF1)** and power on. The first boot auto-expands and initializes, maybe rebooting once or twice — be patient.
5. **First-boot setup**: set language and time zone; if you have a Wi-Fi adapter, connect; confirm buttons, screen and sound all work.
6. **Add games**: put ROMs in `/roms/<console>/` on the games card (or same card) and "update game list" in the frontend (see GC4).

The two most error-prone steps are "downloading the wrong firmware build" and "using a poor/fake card" — remember these two and it usually works first try.

### Troubleshooting (firmware)

| Symptom | Likely cause | Where to look |
|---|---|---|
| Black screen / no response on boot | firmware doesn't match the model (wrong device tree) | re-download firmware specific to your model, not another's |
| Reboot loop, won't enter | bad card / write not verified | switch to a genuine fast card, reflash and verify |
| Boots but no Wi-Fi | adapter chip not kernel-supported | switch to a supported Wi-Fi chip (see GC4) |
| Games card space shrank | first boot didn't auto-expand / partition not filled | expand the partition with a tool, or reflash |
| Want to revert after flashing | — | reflash the backup image from step 1 |

> ✦ **Key point:** the handheld = a **Linux computer that boots from SD**, chain BootROM→U-Boot→kernel (with a matching **device tree**)→frontend. Because the system is on the card, flashing third-party firmware like **ArkOS / JELOS** renews it wholesale, and a bad flash is **recoverable by re-writing, no brick**. Use the **dual slots**: OS card separate from games card, so tinkering with the system leaves games alone. "The device tree must match the model" is the key to flashing without a black screen.
