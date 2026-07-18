## Core Notes

### Treat the handheld as a programmable Linux device

The previous three chapters used it as a game machine: choosing hardware, flashing the system, running emulators. This chapter uses it as a **computer** — read its file structure, log in remotely, understand its input system, and even run your own programs on it. That's the real line between "mastering the hardware" and "just playing", and the landing point of this module and the whole course: from "reading one pin" all the way to "programming a device".

### The SD-card layout

The games card (recall GC2's dual slots) has a highly conventional layout. On ArkOS, ROMs live in per-console folders:

```text
/roms/
  ├── snes/          SNES games
  ├── nes/           NES games
  ├── gba/           GBA games
  ├── psx/           PS1 games (.chd / .zip)
  ├── arcade/        arcade ROMs
  ├── ...
  └── bios/          BIOS files each console needs
```

One folder per console, with fixed names (the frontend uses them to recognise the console). Drop ROMs of the right format inside, then "update / refresh the game list" in the frontend to rescan, and new games appear. Some firmwares also have subfolders like `roms/xxx/images` for box art.

**The plainest way to add games**: power off, pull the games card, plug it into a PC, copy files, put it back. Works but is tedious (frequent card swaps, and you must power off). The elegant way is over the network — which first needs the handheld online.

### Networking: a Wi-Fi adapter + SSH

Many entry machines (the R36S included) have **no built-in Wi-Fi** (recall GC1's traps) and need an external **USB-C Wi-Fi adapter**. The key when choosing one is that **the chip is supported by the Linux kernel** — commonly supported chips include the **RTL8188** family; check the firmware community's compatibility list before buying, or you'll get one with no driver that isn't recognised.

Once online, because it's fundamentally a Linux machine, you can manage it with standard Linux remote tools, like a server:

```bash
# SSH into the handheld from your PC (default user/pass in the firmware docs;
# ArkOS is often ark / ark)
ssh ark@192.168.1.50

# once in, you have a full Linux terminal:
ls /roms/snes            # look at the games folder
df -h                    # SD-card space
top                      # CPU/memory usage
```

No more pulling the card to add games — push them with **scp** from your PC:

```bash
scp Chrono_Trigger.zip ark@192.168.1.50:/roms/snes/
```

Many firmwares also enable **network shares (Samba)** by default: type `\\handheld-ip` (Windows) or `smb://handheld-ip` (Mac/Linux) in your file manager and the `roms` folder shows up like a network drive for drag-and-drop — the easiest of all.

<div class="spec-strip">
<div class="cell"><div class="k">Network</div><div class="v">USB WiFi</div></div>
<div class="cell"><div class="k">Remote</div><div class="v">SSH</div></div>
<div class="cell"><div class="k">Transfer</div><div class="v">scp/Samba</div></div>
<div class="cell"><div class="k">Input</div><div class="v">evdev</div></div>
</div>

### Input: how the gamepad becomes button presses

To understand "how to program it to read the gamepad", first understand how Linux sees the gamepad. In Linux everything is a file — the handheld's physical buttons, D-pad and sticks are abstracted by the kernel's **evdev (event device)** subsystem into an input-device file, typically something like `/dev/input/event0`.

That device continuously reports **input events**: "a key was pressed", "a key released", "the stick X-axis reached some value". Each event carries a type (button or axis), a code (which key/axis) and a value. RetroArch and the frontend read these evdev events and, via your **mapping table**, translate physical buttons to virtual gamepad buttons (mapping the physical X to the emulator's "A", say).

Understand this and you see: "remapping buttons" changes this mapping table; and when you write your own program, reading the same evdev device gets you the gamepad input.

### Running your own programs

Since it's a Linux machine, usually with Python preinstalled, you can treat it as a little computer and write your own apps. Here's a minimal example: read gamepad events directly (with the `evdev` library):

```python
# minimal example: read gamepad events
from evdev import InputDevice
dev = InputDevice('/dev/input/event0')
print('listening on', dev.name)
for event in dev.read_loop():
    if event.type == 1 and event.value == 1:   # type 1 = key, value 1 = pressed
        print('key', event.code, 'pressed')
```

With "read input + full Linux + Python", the possibilities open up:

- **Automation scripts**: batch-organise ROMs, rename them, sort by rules, auto-fetch box art.
- **A custom launcher / menu**: write your own interface to launch games or tools.
- **Lightweight games / apps**: use Python (e.g. Pygame) to run your own little games, an e-book reader or a music player on the handheld.
- **Hardware mods**: some models break out debug pins / GPIO on the board; the hands-on can attach sensors or lights for a hardware mod (putting the whole course's GPIO, I²C, etc. back to use).

At this point the handheld is **no longer just a toy but a pocket Linux computer you fully control and can program**. You can read its specs (GC1), change its system (GC2), understand its software stack (GC3), and log in to modify it and write programs for it (GC4) — the full meaning of "mastering the hardware": not being bound by a device's intended use, but understanding it, commanding it, extending it.

### Real-world pitfalls

- **Default passwords and security**: many firmwares ship a public default SSH password (like ark/ark). If the handheld often joins public Wi-Fi, consider changing it.
- **Read-only systems**: under read-only firmware like JELOS the system partition isn't writable; to persist your own scripts, put them on the writable user/games partition.
- **Python version and libraries**: the preinstalled Python may be old or missing libraries. Installing them may need networking, or cross-preparing on a PC.
- **Don't touch system files carelessly**: back up before editing configs; if you truly break it, re-flash the OS card (games card unaffected, see GC2).

### File transfer methods, compared

"How to get games in" has several routes; compare by convenience and barrier:

| Method | Needs network? | Barrier | Suits |
|---|---|---|---|
| Pull card, copy on PC | no | lowest | one-off bulk, or no Wi-Fi |
| Samba network share | yes | low | daily drag-and-drop, easiest |
| scp / SFTP | yes | medium | command-line folks, automation |
| Direct USB (some models) | no | medium | if USB-OTG and firmware support |

Beginners start safest with "pull and copy", move to Samba once online for comfort, and reach for scp to automate. Understanding "this is a Linux machine, so standard Linux file-transfer works" matters more than memorizing commands.

### Saves: the thing most worth backing up

Games can be re-downloaded, but **a lost save is gone** — dozens of hours can vanish overnight. Saves usually live in a `saves` folder on the games card/data partition (or each emulator's own directory). Build the habit: periodically copy the whole `saves` folder out. Especially back up saves before changing firmware or reflashing (recall GC2). With SSH/Samba, a backup is one command:

```bash
scp -r ark@192.168.1.50:/roms/saves ./backup_saves
```

### What else networking enables: achievements and netplay

Once the handheld is online, beyond file transfer it unlocks some play:

- **RetroAchievements**: adds a modern achievement system to old games — clearing levels and finding secrets unlock badges, giving a sense of goals to revisiting classics. Needs an online login.
- **Netplay**: RetroArch lets you play the same emulated game with others over the network (arcade versus, say). Latency-sensitive, but the principle is interesting.
- **Online scraping**: online, the frontend auto-downloads box art and metadata (see GC3), instantly beautifying the library.

These exist "because it's fundamentally a networked Linux computer", again confirming this module's theme of "use it as a computer".

### Not just emulators: native programs and ported games

Because the base is standard ARM Linux, many **native programs** run directly or with light porting:

- **Native game ports**: the community has ported many PC classics to run natively on these handhelds — *Doom*, *Quake*, *OpenTTD*, *Cave Story*, various puzzle/indie games. They aren't emulated but compiled straight to ARM, often smoother than emulation.
- **Utilities**: file managers, music/video players, e-book readers all exist.
- **Your own creations**: with the earlier evdev gamepad example, Python + Pygame runs your own little games or tools on the handheld.

"Running native ARM Linux programs" turns the handheld from a "dedicated emulator box" fully into a "general-purpose pocket computer".

### Advanced: cross-compiling and development

To run heavier home-grown programs, compiling on the handheld is slow and tool-starved, so the common approach is **cross-compiling**: on a powerful PC, use an ARM-targeting toolchain to build the program into an executable the handheld can run, then transfer and run it. This is the standard embedded workflow — looking back over the whole course, from "flashing" a program to an Arduino to "cross-compiling and deploying" a program to this ARM Linux handheld, you've traversed the full spectrum from the smallest microcontroller to a complete Linux device.

### Interface themes and personalization

Being open firmware, the interface is changeable too. EmulationStation supports **themes**, and the community has built many beautiful ones — swap one to refresh your handheld's whole look; you can also tweak the boot splash, sound effects, favourites and game categories. These don't change performance, but they're the tangible sign that "this device is truly mine, under my control" — from passively accepting factory settings to actively customizing everything, the shift from "user" to "owner".

### Hands-on: SSH into your handheld for the first time

Turn "it's a Linux computer" into a hands-on experience:

1. **Get online**: plug in a supported USB-C Wi-Fi adapter and, in the system's network settings, join the same Wi-Fi as your PC.
2. **Find the IP**: read its IP in the handheld's network info (e.g. 192.168.1.50), or find it in your router.
3. **Confirm SSH is on**: most firmwares (ArkOS, etc.) enable SSH by default; if not, turn it on in settings.
4. **Log in from your PC**:

```bash
ssh ark@192.168.1.50      # default user/pass in firmware docs; ArkOS is often ark/ark
```

5. **Verify you're on Linux**:

```bash
uname -a                  # kernel and architecture (ARM)
ls /roms                  # the games directory
free -h                   # memory
```

6. **Push a game** (no card removal):

```bash
scp Sonic.zip ark@192.168.1.50:/roms/genesis/
```

Back on the handheld, "update game list" and the new game appears. At this moment you've crossed from "playing a game console" to "remotely managing a Linux device".

Advanced: push a `hello.py` (say the gamepad-reading example above) and run it over SSH with `python3 hello.py` — you're now running your own program on the handheld.

### Troubleshooting (interfacing)

| Symptom | Likely cause | Where to look |
|---|---|---|
| Wi-Fi won't connect | adapter chip unsupported | switch to a supported chip like RTL8188 (see GC1/GC2) |
| SSH won't connect | SSH off / IP changed / different subnet | enable SSH, check the latest IP, confirm same Wi-Fi |
| Password rejected on login | wrong default credentials | check the firmware docs' default user/pass |
| Copied game doesn't show | wrong folder/format, list not refreshed | put it in `/roms/<console>/`, update the game list |
| Script gone after reboot | read-only system, saved to a read-only area | save to the writable user/games partition (see GC2) |
| Gamepad reads no events | wrong event device number | `ls /dev/input/` to find the right eventN, install the evdev library |

> ✦ **Key point:** treat the handheld as a programmable Linux device: the **SD layout** holds ROMs/BIOS per console; plug in **USB Wi-Fi** and manage/transfer via **SSH / scp / Samba**; the gamepad is abstracted by the kernel's **evdev** into events, mapped to buttons; and finally **run your own code (Python, etc.) on it**. Walk through these steps and you go from "user" to "developer who can modify and program it" — the end of this module and the course's arc from "reading a pin" to "writing a program".
