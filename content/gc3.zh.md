## 核心讲义

### 从按键到画面,中间隔着三层

你选中一个游戏、按下 A 键,屏幕上就出现了童年的画面。这背后是**一整层软件栈**在协作:

```text
你 → EmulationStation(前端:浏览/选择游戏)
   → RetroArch(统一的运行环境 / 调度器)
   → libretro 内核(真正在模拟某台主机)
   → ROM(游戏数据) + BIOS(主机固件)
   → 画面 / 声音 / 手柄
```

看懂这三层——**前端、RetroArch、内核**——你就知道遇到问题该去哪一层调。

### 前端:EmulationStation

**EmulationStation(ES)**是你开机看到的界面:它按主机分类,展示游戏封面、扫描媒体、让你用手柄浏览和启动游戏。它本身**不模拟**任何东西,只是一个漂亮的「启动器」。选中游戏后,它把「哪台主机 + 哪个 ROM」交给下一层。

### RetroArch 与 libretro 内核

**RetroArch** 是一个统一的前端/运行框架,它本身也不模拟主机,而是加载一个个**libretro 内核(core)**——每个内核就是一台主机的模拟器,打包成统一接口:

| 主机 | 常用内核(举例) |
|---|---|
| NES | FCEUmm / Nestopia |
| SNES | Snes9x |
| GBA | mGBA |
| PS1 | PCSX-ReARMed(ARM 优化) |
| N64 | Mupen64Plus-Next |

同一台主机常有多个内核可选:有的**准确**但吃性能,有的**快**但兼容性略差。在 R36S 这类入门机上,常选**为 ARM 优化、偏快**的内核(如 PS1 用 PCSX-ReARMed),这也是「同样的机器,选对内核就能流畅」的原因。

<div class="spec-strip">
<div class="cell"><div class="k">前端</div><div class="v">ES</div></div>
<div class="cell"><div class="k">框架</div><div class="v">RetroArch</div></div>
<div class="cell"><div class="k">模拟</div><div class="v">core</div></div>
<div class="cell"><div class="k">接口</div><div class="v">libretro</div></div>
</div>

### BIOS、ROM 与文件放置

- **ROM:** 游戏本身的数据文件,按主机放进对应目录(见 GC4 的 SD 卡布局),如 `/roms/psx/`、`/roms/snes/`。
- **BIOS:** 有些主机(PS1、世嘉土星、部分 GBA 等)需要原机的**固件文件**才能启动,放在指定的 `bios` 目录,且文件名/校验和必须精确匹配。**缺 BIOS** 是「游戏进不去、黑屏」的头号原因。
- **格式:** 常见 `.zip`、`.chd`(压缩光盘镜像,PS1/土星等大容量游戏首选)。

> ⚠ 请只使用**你合法拥有**的游戏与固件的备份。版权归原厂所有;本课程只讲技术原理,不提供任何 ROM/BIOS。

### 存档、金手指与着色器

RetroArch 的通用功能,在任何内核上都能用:

- **即时存档(Save State):** 随时保存/恢复完整运行状态,不依赖游戏自带存档点。
- **金手指(Cheats):** 加载作弊码。
- **着色器(Shader):** 用 CRT 扫描线、LCD 网格等滤镜还原老屏幕质感——但着色器吃 GPU,入门机上要权衡。
- **快进 / 倒带、手柄映射、每游戏配置**等。

> ✦ **要点:** 模拟栈 = **前端(ES)选游戏 → RetroArch 调度 → libretro 内核模拟 → ROM+BIOS 提供数据**。卡顿先换更快的内核,黑屏先查 BIOS 与文件位置。这套分层在任何 Linux 掌机上都通用。
