## 核心讲义

### 把掌机当成一台可编程的 Linux 设备

前面把它当游戏机用。这一章把它当**电脑**用:看懂文件结构、远程登进去、理解输入系统,甚至跑你自己写的程序。这才是「掌握硬件」与「只会玩」的分界线。

### SD 卡目录布局

游戏卡(见 GC2)的目录高度约定俗成。以 ArkOS 为例,ROM 按主机分文件夹:

```text
/roms/
  ├── snes/        SNES 游戏
  ├── psx/         PS1 游戏(.chd/.zip)
  ├── gba/         GBA 游戏
  ├── nes/  ...
  └── bios/        各主机 BIOS 文件
```

加游戏 = 把 ROM 拷进对应文件夹,再在前端「更新游戏列表」重新扫描。最简单的传输方式:把卡拔下来插电脑;更优雅的方式是走网络(见下)。

### 联网:Wi-Fi 适配器 + SSH

许多入门机(包括 R36S)**没有内置 Wi-Fi**,需外接一个 **USB-C Wi-Fi 适配器**(认准 Linux 内核支持的芯片,如 RTL8188)。联网后,因为它是 Linux,你可以用 **SSH** 远程登录,像操作服务器一样操作它:

```bash
# 从电脑通过 SSH 登入掌机(默认用户/口令见固件文档)
ssh ark@192.168.1.50

# 用 scp 直接把游戏推到游戏卡,免拔卡
scp Chrono_Trigger.zip ark@192.168.1.50:/roms/snes/
```

很多固件还开了**网络共享(Samba)**,能直接在电脑的文件管理器里看到 `\\掌机IP\roms`,拖拽拷贝。SSH 进去后,你就拥有一个完整的 Linux 终端——可以看日志、装软件、改配置。

<div class="spec-strip">
<div class="cell"><div class="k">联网</div><div class="v">USB WiFi</div></div>
<div class="cell"><div class="k">远程</div><div class="v">SSH</div></div>
<div class="cell"><div class="k">传输</div><div class="v">scp/Samba</div></div>
<div class="cell"><div class="k">输入</div><div class="v">evdev</div></div>
</div>

### 输入:手柄如何变成按键

在 Linux 里,掌机的实体按键/摇杆通过内核的 **evdev** 子系统暴露成一个输入设备(如 `/dev/input/event0`),上报「按下/松开/摇杆数值」这样的事件。RetroArch 和前端读取这些事件,再按你的**映射表**把物理键对应到虚拟手柄键。理解这一点,你就知道「重新映射按键」改的是哪一层,也知道自己的程序如何读手柄。

### 跑你自己的程序

既然是 Linux + Python 常已预装,你完全可以把它当一台小电脑,写自己的应用:

```python
# 一个最小示例:读手柄事件(需 evdev 库)
from evdev import InputDevice, categorize
dev = InputDevice('/dev/input/event0')
print('listening on', dev.name)
for event in dev.read_loop():
    if event.type == 1 and event.value == 1:   # 某个键被按下
        print('key', event.code, 'pressed')
```

进一步可以:写脚本自动整理 ROM、做一个自制的启动菜单、跑轻量 Python 游戏、甚至接 GPIO 做硬件改装(部分机型引出了调试脚)。**这台掌机不再只是玩具,而是一台你能编程的手持 Linux 计算机**——正好把本课程从「读引脚」到「写程序」的能力都用上了。

> ✦ **要点:** 把掌机当 Linux 设备:**SD 目录**放 ROM/BIOS、**USB Wi-Fi + SSH/Samba** 远程管理、**evdev** 理解手柄输入,最后**跑自己的代码**。会了这几步,你就从「用户」变成了「能改能编的开发者」——这也是整门课的落点。
