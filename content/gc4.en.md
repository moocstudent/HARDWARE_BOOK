## Core Notes

### Treat the handheld as a programmable Linux device

So far we used it as a game machine. This chapter uses it as a **computer**: read its file structure, log in remotely, understand its input system, and even run your own programs. That's the line between "mastering the hardware" and "just playing".

### The SD-card layout

The games card (see GC2) has a highly conventional layout. On ArkOS, ROMs live in per-console folders:

```text
/roms/
  ├── snes/        SNES games
  ├── psx/         PS1 games (.chd/.zip)
  ├── gba/         GBA games
  ├── nes/  ...
  └── bios/        BIOS files per console
```

Adding games = copy ROMs into the right folder, then "update game list" in the frontend to rescan. The simplest transfer: pull the card and plug it into a PC; the elegant way is over the network (below).

### Networking: a Wi-Fi adapter + SSH

Many entry machines (the R36S included) have **no built-in Wi-Fi** and need an external **USB-C Wi-Fi adapter** (pick a chip the Linux kernel supports, e.g. RTL8188). Once online, because it's Linux you can log in remotely with **SSH** and operate it like a server:

```bash
# SSH into the handheld from your PC (default user/pass in the firmware docs)
ssh ark@192.168.1.50

# push a game straight to the games card with scp, no card removal
scp Chrono_Trigger.zip ark@192.168.1.50:/roms/snes/
```

Many firmwares also enable **network shares (Samba)**, so `\\handheld-ip\roms` shows up in your PC's file manager for drag-and-drop. Once in over SSH you have a full Linux terminal — read logs, install software, edit configs.

<div class="spec-strip">
<div class="cell"><div class="k">Network</div><div class="v">USB WiFi</div></div>
<div class="cell"><div class="k">Remote</div><div class="v">SSH</div></div>
<div class="cell"><div class="k">Transfer</div><div class="v">scp/Samba</div></div>
<div class="cell"><div class="k">Input</div><div class="v">evdev</div></div>
</div>

### Input: how the gamepad becomes button presses

In Linux, the handheld's physical buttons/sticks are exposed through the kernel's **evdev** subsystem as an input device (e.g. `/dev/input/event0`) that reports events like "press/release/stick value". RetroArch and the frontend read these events and, via your **mapping table**, translate physical keys to virtual gamepad buttons. Understand this and you know which layer "remapping" changes, and how your own program reads the pad.

### Running your own programs

Since it's Linux with Python usually preinstalled, you can treat it as a little computer and write your own apps:

```python
# a minimal example: read gamepad events (needs the evdev library)
from evdev import InputDevice, categorize
dev = InputDevice('/dev/input/event0')
print('listening on', dev.name)
for event in dev.read_loop():
    if event.type == 1 and event.value == 1:   # a key was pressed
        print('key', event.code, 'pressed')
```

From there you can: script auto-organising ROMs, build a homemade launch menu, run a lightweight Python game, even wire up GPIO for a hardware mod (some models break out debug pins). **The handheld stops being a toy and becomes a pocket Linux computer you can program** — putting everything from "reading a pin" to "writing a program" in this course to use.

> ✦ **Key point:** treat the handheld as a Linux device: the **SD layout** holds ROMs/BIOS, **USB Wi-Fi + SSH/Samba** manage it remotely, **evdev** explains gamepad input, and finally you **run your own code**. Master these steps and you go from "user" to "developer who can modify and program it" — the landing point of the whole course.
