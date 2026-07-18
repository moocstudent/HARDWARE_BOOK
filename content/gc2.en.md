## Core Notes

### The handheld is really a little Linux computer

There's nothing mysterious about these handhelds: each is a small ARM **Linux computer** — a close cousin of the Raspberry Pi (see the MC module). It has no fixed built-in system disk; it **boots from an SD card**. That brings one key freedom: swap the SD card and you swap the whole operating system.

### The boot chain from SD

Pressing power does much the same as a PC turning on, just leaner:

```text
power on → SoC's internal BootROM → read the bootloader (U-Boot) from SD
        → U-Boot loads the Linux kernel + device tree
        → kernel mounts the root filesystem → launches the emulator frontend (EmulationStation)
```

The **Device Tree** tells the kernel "what hardware this machine has and how the pins connect" — one kernel plus different device trees adapts to different models. Understand this chain and you'll see why "flashing the wrong firmware gives a black screen" and "swapping the card recovers it".

### Stock firmware vs third-party firmware

The stock system on a budget handheld is often **bloated, ad-laden and abandoned**. Happily, the open-source community builds high-quality third-party firmware for these common SoCs; burn it to an SD card to replace the stock one:

| Firmware | Traits |
|---|---|
| **ArkOS** | Debian-based, stable, approachable — a common default for the R36S |
| **JELOS / ROCKNIX** | Linux + read-only system, more "appliance-like" and low-maintenance |
| **AmberELEC** | aimed at the RG351 family, same idea |

Third-party firmware usually brings better performance tuning, more emulators, a cleaner UI, and active updates and community support.

<div class="spec-strip">
<div class="cell"><div class="k">Really</div><div class="v">Linux</div></div>
<div class="cell"><div class="k">Boots</div><div class="v">SD card</div></div>
<div class="cell"><div class="k">Loader</div><div class="v">U-Boot</div></div>
<div class="cell"><div class="k">Firmware</div><div class="v">ArkOS</div></div>
</div>

### How to flash: writing an image to the SD card

The process is identical to making a Raspberry Pi system card:

1. Download the firmware image file (`.img`);
2. Use **balenaEtcher** or **Raspberry Pi Imager** to write it to a microSD card;
3. Put it back in the handheld's **system slot** and power on; the first boot auto-expands partitions and creates directories.

> ⚠ Back up first, and match the firmware build to your exact model (SoC and device tree must agree). Flashing the wrong model gives a black screen — but because the system lives on the SD card, **just re-flash a card to recover**; you can't brick it.

### Dual slots: OS card vs games card

Machines like the R36S often have **two microSD slots** with a clear split:

- **Slot 1 (OS card):** holds the operating system/firmware. Usually small (say 16–32 GB).
- **Slot 2 (games card):** holds ROMs and assets. Can be large (say 128–256 GB).

The benefit of separating them: upgrading or replacing the system leaves your games untouched, and backups are simpler. The 128 GB card the R36S ships with is typically this preloaded "games card".

> ✦ **Key point:** the handheld = a **Linux computer that boots from SD**, chain BootROM→U-Boot→kernel→frontend. Flash third-party firmware like **ArkOS/JELOS** to renew it; since the system is on the card, a bad flash is recoverable by re-writing it. Use the **dual slots**: system separate from games.
