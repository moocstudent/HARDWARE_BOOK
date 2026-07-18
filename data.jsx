/* =========================================================
   Curriculum data — 6 modules / 20 chapters
   ---------------------------------------------------------
   Metadata only (bilingual). The teaching content for each
   chapter (core notes with code, tables, spec strips) lives in
   content/<id>.<lang>.md and is fetched on demand by the
   chapter page. `viz` names an interactive figure from viz.jsx.
   Part selection follows what the Wokwi simulator covers.
   ========================================================= */

const MODULES = [
  {
    id: "h1", code: "H1", accent: "primary", level: 1,
    zh: "电路基础", en: "Circuit Foundations",
    tagline: { zh: "电压、电流、电阻——一切的地基。", en: "Voltage, current, resistance — the bedrock." },
    description: {
      zh: "从欧姆定律出发,理解电压如何推动电流、电阻如何限制电流,再到 LED 限流、分压电路与电容 RC 充放电。这一模块是读懂后面每一张电路图的前提。",
      en: "Start from Ohm's law: how voltage pushes current and resistance limits it, then LED current-limiting, voltage dividers and RC charging. This module is the prerequisite for reading every circuit that follows.",
    },
  },
  {
    id: "h2", code: "H2", accent: "primary", level: 1,
    zh: "数字与模拟 I/O", en: "Digital & Analog I/O",
    tagline: { zh: "让引脚读懂世界,也让世界听懂引脚。", en: "Make a pin read the world, and the world hear the pin." },
    description: {
      zh: "微控制器与外界打交道的四种基本方式:数字输入输出、上拉下拉与按钮消抖、用 PWM 假装模拟输出、用 ADC 读取模拟输入。掌握它们,就掌握了绝大多数嵌入式程序的骨架。",
      en: "The four basic ways a microcontroller talks to the world: digital in/out, pull-ups and debouncing, faking analog output with PWM, and reading analog input with an ADC. Master these and you have the skeleton of most embedded programs.",
    },
  },
  {
    id: "h3", code: "H3", accent: "primary", level: 2,
    zh: "微控制器", en: "Microcontrollers",
    tagline: { zh: "一整台计算机,装在一颗芯片里。", en: "A whole computer, in a single chip." },
    description: {
      zh: "认识三块最常见的开发板:Arduino Uno(ATmega328P)、ESP32(带 Wi-Fi/蓝牙)、树莓派 Pico(RP2040)。理解引脚复用、Flash/SRAM/EEPROM 三种存储,以及 setup()/loop() 背后的运行模型。",
      en: "Meet the three most common boards: Arduino Uno (ATmega328P), ESP32 (with Wi-Fi/Bluetooth) and Raspberry Pi Pico (RP2040). Understand pin multiplexing, the Flash/SRAM/EEPROM memory split, and the run model behind setup()/loop().",
    },
  },
  {
    id: "h4", code: "H4", accent: "primary", level: 2,
    zh: "传感器", en: "Sensors",
    tagline: { zh: "把温度、光、距离和运动变成数字。", en: "Turn heat, light, distance and motion into numbers." },
    description: {
      zh: "传感器是硬件的「感官」。本模块讲电位器与光敏电阻(模拟量)、DHT22 温湿度(单总线数字量)、HC-SR04 超声波测距(时间差)与 PIR/红外(事件)。每一种都对应一类读取原理。",
      en: "Sensors are the hardware's senses. This module covers potentiometers and photoresistors (analog), the DHT22 temperature/humidity sensor (one-wire digital), HC-SR04 ultrasonic ranging (time-of-flight) and PIR/IR (events) — each a different reading principle.",
    },
  },
  {
    id: "h5", code: "H5", accent: "primary", level: 2,
    zh: "执行器与显示", en: "Actuators & Displays",
    tagline: { zh: "让电路动起来、亮起来、显示出来。", en: "Make the circuit move, glow and show." },
    description: {
      zh: "从舵机的脉宽控制,到直流电机与步进电机的驱动,再到 LCD1602 字符屏与 SSD1306 OLED。重点是理解「小信号如何控制大功率」以及显示屏背后的数据总线。",
      en: "From the servo's pulse-width control to driving DC and stepper motors, up to the LCD1602 character display and the SSD1306 OLED. The focus: how a small signal controls real power, and the data bus behind a display.",
    },
  },
  {
    id: "h6", code: "H6", accent: "accent", level: 3,
    zh: "通信总线", en: "Communication Buses",
    tagline: { zh: "芯片之间如何对话:UART、I²C、SPI。", en: "How chips talk: UART, I²C, SPI." },
    description: {
      zh: "几乎每个模块都靠总线连接。UART 点对点异步串口、I²C 两线多从机、SPI 高速四线全双工——理解它们的时序与取舍,你就能看懂任何数据手册里的通信章节。",
      en: "Almost every module hangs off a bus. UART's point-to-point async serial, I²C's two-wire multi-drop, SPI's fast four-wire full-duplex — learn their timing and trade-offs and you can read the comms section of any datasheet.",
    },
  },
  {
    id: "h7", code: "H7", accent: "accent", level: 3,
    zh: "智能护理床(项目)", en: "Smart Care Bed (Capstone)",
    tagline: { zh: "把所学的传感器与总线,变成一张会「读」病人的床。", en: "Turn every sensor and bus you've learned into a bed that reads the patient." },
    description: {
      zh: "一个把全课程串起来的实战项目:用床脚的称重传感器听呼吸与心跳、用压力阵列与 IMU 判断翻身与离床、用湿度电极监测尿床,再加上供电、隔离与患者安全。全部基于可现货采购的原型级器件——同时讲清「要做成真正的医疗产品还差什么」。",
      en: "A hands-on project that ties the whole course together: hear breathing and heartbeat from load cells under the bed legs, detect turning and bed-exit with a pressure array and IMU, catch bed-wetting with moisture electrodes — plus power, isolation and patient safety. Built from off-the-shelf, purchasable prototype parts — and honest about what it would take to become a real medical device.",
    },
  },
  {
    id: "h8", code: "H8", accent: "accent", level: 2,
    zh: "掌上游戏机(项目)", en: "Handheld Game Console (Project)",
    tagline: { zh: "如何挑一台掌机,又如何让软件跑在上面。", en: "How to pick a handheld — and how software runs on it." },
    description: {
      zh: "换个角度:不再自己造硬件,而是学会「评估并驯服」一台成品设备。以 R36S 这类 Linux 掌上游戏机为例,读懂 SoC、屏幕、电池与手感的选型取舍,再拆解从固件、模拟器前端到 RetroArch 内核的软件栈,学会用 SD 卡布局、Wi-Fi/SSH、手柄映射对接程序,甚至跑自己写的代码。",
      en: "A different angle: instead of building hardware, learn to evaluate and tame a finished device. Using a Linux handheld like the R36S, read the trade-offs in SoC, screen, battery and feel, then dissect the software stack from firmware to the emulator frontend and RetroArch cores — and learn to interface via SD-card layout, Wi-Fi/SSH and controller mapping, even running your own code.",
    },
  },
];

const CHAPTERS = [
  /* ============ H1 电路基础 ============ */
  {
    id: "e1", code: "CF1", moduleId: "h1", difficulty: 1, hours: 4, prereq: [], viz: "ohm",
    parts: ["电源 / Supply", "电阻 / Resistor"],
    title: { zh: "电压、电流与电阻", en: "Voltage, Current & Resistance" },
    summary: {
      zh: "用「水管模型」建立直觉,再用欧姆定律 V = IR 把三者精确联系起来。",
      en: "Build intuition with the water-pipe model, then tie the three together precisely with Ohm's law, V = IR.",
    },
    objectives: [
      { zh: "分清电压、电流、电阻各是什么", en: "Tell voltage, current and resistance apart" },
      { zh: "熟练使用欧姆定律 V = I·R 求解", en: "Solve fluently with Ohm's law V = I·R" },
      { zh: "理解功率 P = VI 与发热", en: "Understand power P = VI and heating" },
      { zh: "会读电阻单位与常见量级", en: "Read resistance units and common magnitudes" },
    ],
    outline: [
      { zh: "水管模型:电压=压强,电流=流量", en: "Water-pipe model: voltage = pressure, current = flow" },
      { zh: "欧姆定律 V = I·R 的三种变形", en: "Ohm's law and its three rearrangements" },
      { zh: "串联与并联电阻", en: "Resistors in series and parallel" },
      { zh: "功率 P = VI = I²R,以及散热", en: "Power P = VI = I²R and dissipation" },
    ],
  },
  {
    id: "e2", code: "CF2", moduleId: "h1", difficulty: 1, hours: 4, prereq: ["e1"], viz: "ledCircuit",
    parts: ["LED", "电阻 / Resistor"],
    title: { zh: "LED 与限流电阻", en: "LEDs & Current-Limiting Resistors" },
    summary: {
      zh: "LED 不是电阻,它有「正向压降」。学会用一颗电阻保护它,并算出合适的阻值。",
      en: "An LED is not a resistor — it has a forward voltage drop. Learn to protect it with one resistor and compute the right value.",
    },
    objectives: [
      { zh: "理解 LED 的正向压降与极性", en: "Understand LED forward voltage and polarity" },
      { zh: "推导限流电阻公式 R = (Vs − Vf)/I", en: "Derive R = (Vs − Vf)/I for the limiting resistor" },
      { zh: "选择合适的电阻阻值与功率", en: "Pick a suitable resistor value and power rating" },
      { zh: "知道为什么不能不接电阻", en: "Know why you must never omit the resistor" },
    ],
    outline: [
      { zh: "二极管的伏安特性与正向压降 Vf", en: "Diode I–V curve and forward voltage Vf" },
      { zh: "限流电阻的计算", en: "Sizing the current-limiting resistor" },
      { zh: "极性:长脚为正、平边为负", en: "Polarity: long leg positive, flat side negative" },
      { zh: "Arduino 上点亮一颗 LED", en: "Blinking an LED from an Arduino pin" },
    ],
  },
  {
    id: "e3", code: "CF3", moduleId: "h1", difficulty: 1, hours: 5, prereq: ["e1"], viz: "divider",
    parts: ["电阻 / Resistor", "电位器 / Potentiometer"],
    title: { zh: "分压电路", en: "Voltage Dividers" },
    summary: {
      zh: "两个电阻就能把电压「按比例切一刀」。这是电位器、传感器读数的核心。",
      en: "Two resistors slice a voltage in proportion. This is the core of potentiometers and countless sensor readings.",
    },
    objectives: [
      { zh: "推导分压公式 Vout = Vin·R2/(R1+R2)", en: "Derive Vout = Vin·R2/(R1+R2)" },
      { zh: "理解负载对分压的影响", en: "Understand how a load affects the divider" },
      { zh: "用分压解释电位器的工作方式", en: "Explain a potentiometer as a divider" },
      { zh: "认识光敏/热敏电阻的分压读法", en: "Read LDR/thermistor values via a divider" },
    ],
    outline: [
      { zh: "分压公式的推导", en: "Deriving the divider formula" },
      { zh: "电位器:可调的分压器", en: "The potentiometer as an adjustable divider" },
      { zh: "传感器分压:LDR 与热敏电阻", en: "Sensor dividers: LDR and thermistor" },
      { zh: "负载效应与输出阻抗", en: "Loading effects and output impedance" },
    ],
  },
  {
    id: "e4", code: "CF4", moduleId: "h1", difficulty: 2, hours: 5, prereq: ["e1"], viz: "rcCharge",
    parts: ["电容 / Capacitor", "电阻 / Resistor"],
    title: { zh: "电容与 RC 充放电", en: "Capacitors & RC Charging" },
    summary: {
      zh: "电容储存电荷,和电阻搭在一起就有了「时间」——去耦、滤波、延时都从这里来。",
      en: "A capacitor stores charge; paired with a resistor it introduces time — decoupling, filtering and delays all start here.",
    },
    objectives: [
      { zh: "理解电容储能 Q = C·V", en: "Understand stored charge Q = C·V" },
      { zh: "掌握 RC 时间常数 τ = R·C", en: "Master the RC time constant τ = R·C" },
      { zh: "读懂充放电指数曲线", en: "Read the exponential charge/discharge curve" },
      { zh: "认识去耦电容的作用", en: "Understand what a decoupling capacitor does" },
    ],
    outline: [
      { zh: "电容是什么:两块板与电场", en: "What a capacitor is: two plates and a field" },
      { zh: "RC 充电曲线与 τ = RC", en: "The RC charge curve and τ = RC" },
      { zh: "去耦与旁路电容", en: "Decoupling and bypass capacitors" },
      { zh: "RC 低通滤波初步", en: "First look at an RC low-pass filter" },
    ],
  },

  /* ============ H2 数字与模拟 I/O ============ */
  {
    id: "d1", code: "IO1", moduleId: "h2", difficulty: 1, hours: 4, prereq: ["e2"], viz: "digitalWave",
    parts: ["按钮 / Pushbutton", "LED"],
    title: { zh: "数字输入与输出", en: "Digital Input & Output" },
    summary: {
      zh: "在数字世界里只有 HIGH 与 LOW。学会用 pinMode / digitalWrite / digitalRead 让引脚说话和倾听。",
      en: "In the digital world there is only HIGH and LOW. Use pinMode / digitalWrite / digitalRead to make a pin speak and listen.",
    },
    objectives: [
      { zh: "理解逻辑电平 HIGH/LOW 与阈值", en: "Understand HIGH/LOW logic levels and thresholds" },
      { zh: "掌握 pinMode 的输入/输出模式", en: "Master pinMode input/output modes" },
      { zh: "用 digitalWrite 驱动 LED", en: "Drive an LED with digitalWrite" },
      { zh: "用 digitalRead 读取按钮", en: "Read a button with digitalRead" },
    ],
    outline: [
      { zh: "逻辑电平:什么算 1,什么算 0", en: "Logic levels: what counts as 1 or 0" },
      { zh: "输出模式与灌/拉电流", en: "Output mode and sink/source current" },
      { zh: "输入模式与高阻态", en: "Input mode and the high-impedance state" },
      { zh: "Blink 与读按钮的最小程序", en: "Minimal Blink and read-button sketches" },
    ],
  },
  {
    id: "d2", code: "IO2", moduleId: "h2", difficulty: 2, hours: 4, prereq: ["d1"], viz: "pullup",
    parts: ["按钮 / Pushbutton", "电阻 / Resistor"],
    title: { zh: "上拉、下拉与按钮消抖", en: "Pull-ups, Pull-downs & Debouncing" },
    summary: {
      zh: "悬空的输入脚会「乱跳」。上拉/下拉电阻给它一个确定的默认值,消抖则去掉机械抖动。",
      en: "A floating input pin reads garbage. Pull-up/pull-down resistors give it a defined default; debouncing removes the mechanical bounce.",
    },
    objectives: [
      { zh: "理解「悬空输入」为什么危险", en: "Understand why a floating input is dangerous" },
      { zh: "区分外部上拉/下拉与内部上拉", en: "Distinguish external pull-up/down from internal pull-up" },
      { zh: "使用 INPUT_PULLUP 简化接线", en: "Use INPUT_PULLUP to simplify wiring" },
      { zh: "用软件或硬件消除按钮抖动", en: "Debounce a button in software or hardware" },
    ],
    outline: [
      { zh: "悬空输入与噪声", en: "Floating inputs and noise" },
      { zh: "上拉与下拉电阻的接法", en: "Wiring pull-up vs pull-down resistors" },
      { zh: "内部上拉 INPUT_PULLUP", en: "The internal pull-up, INPUT_PULLUP" },
      { zh: "抖动的成因与消抖方法", en: "Why contacts bounce, and how to debounce" },
    ],
  },
  {
    id: "d3", code: "IO3", moduleId: "h2", difficulty: 2, hours: 5, prereq: ["d1"], viz: "pwm",
    parts: ["LED", "电阻 / Resistor"],
    title: { zh: "PWM 与模拟输出", en: "PWM & Analog Output" },
    summary: {
      zh: "数字引脚只能开或关,但快速开关 + 占空比就能「假装」输出任意亮度或电压——这就是 PWM。",
      en: "A digital pin is only on or off, but switching fast with a duty cycle fakes any brightness or voltage — that's PWM.",
    },
    objectives: [
      { zh: "理解占空比与平均电压的关系", en: "Relate duty cycle to average voltage" },
      { zh: "掌握 analogWrite 的 0–255 范围", en: "Master analogWrite's 0–255 range" },
      { zh: "认识 PWM 频率与其影响", en: "Understand PWM frequency and its effects" },
      { zh: "用 PWM 调 LED 亮度与电机转速", en: "Dim an LED and set motor speed with PWM" },
    ],
    outline: [
      { zh: "占空比:开的时间占多少", en: "Duty cycle: what fraction is on" },
      { zh: "平均电压 = 占空比 × Vcc", en: "Average voltage = duty × Vcc" },
      { zh: "analogWrite 与可用引脚", en: "analogWrite and the PWM-capable pins" },
      { zh: "频率、抖动与 RC 平滑", en: "Frequency, flicker and RC smoothing" },
    ],
  },
  {
    id: "d4", code: "IO4", moduleId: "h2", difficulty: 2, hours: 5, prereq: ["e3", "d1"], viz: "adc",
    parts: ["电位器 / Potentiometer", "光敏电阻 / LDR"],
    title: { zh: "ADC 与模拟输入", en: "ADC & Analog Input" },
    summary: {
      zh: "现实是连续的,芯片是离散的。ADC 把电压「量化」成整数,analogRead 一步读出。",
      en: "The world is continuous, the chip is discrete. An ADC quantizes a voltage into an integer that analogRead returns in one step.",
    },
    objectives: [
      { zh: "理解模数转换与量化", en: "Understand analog-to-digital conversion and quantization" },
      { zh: "掌握分辨率:10 位 = 0–1023", en: "Master resolution: 10-bit = 0–1023" },
      { zh: "把读数换算回电压", en: "Convert a reading back to a voltage" },
      { zh: "认识参考电压与采样率", en: "Understand reference voltage and sample rate" },
    ],
    outline: [
      { zh: "量化:把电压切成台阶", en: "Quantization: slicing voltage into steps" },
      { zh: "分辨率与参考电压 Vref", en: "Resolution and the reference voltage Vref" },
      { zh: "analogRead 与电压换算", en: "analogRead and converting to volts" },
      { zh: "不同板子的位数差异", en: "Bit-depth differences across boards" },
    ],
  },

  /* ============ H3 微控制器 ============ */
  {
    id: "u1", code: "MC1", moduleId: "h3", difficulty: 2, hours: 5, prereq: ["d4"], viz: null,
    parts: ["Arduino Uno", "ATmega328P"],
    title: { zh: "Arduino Uno 与 ATmega328P", en: "Arduino Uno & ATmega328P" },
    summary: {
      zh: "最经典的入门板。看懂它的引脚图、供电、时钟与存储,你就有了一切外设的落脚点。",
      en: "The classic starter board. Read its pinout, power, clock and memory and you have a home for every peripheral.",
    },
    objectives: [
      { zh: "读懂 Uno 的数字/模拟/电源引脚", en: "Read the Uno's digital, analog and power pins" },
      { zh: "认识 PWM、I²C、SPI、串口的复用脚", en: "Locate the PWM, I²C, SPI and serial pins" },
      { zh: "理解 5V 逻辑与供电方式", en: "Understand 5V logic and power options" },
      { zh: "了解 Flash/SRAM/EEPROM 三种存储", en: "Know the Flash/SRAM/EEPROM split" },
    ],
    outline: [
      { zh: "ATmega328P 核心参数", en: "ATmega328P core specs" },
      { zh: "引脚图与功能复用", en: "Pinout and function multiplexing" },
      { zh: "供电、稳压与 USB", en: "Power, regulation and USB" },
      { zh: "三种存储器各管什么", en: "What each of the three memories does" },
    ],
  },
  {
    id: "u2", code: "MC2", moduleId: "h3", difficulty: 2, hours: 5, prereq: ["u1"], viz: null,
    parts: ["ESP32"],
    title: { zh: "ESP32 与无线", en: "ESP32 & Wireless" },
    summary: {
      zh: "带 Wi-Fi 与蓝牙的双核 32 位主控。3.3V 逻辑、更多外设,是物联网项目的默认选择。",
      en: "A dual-core 32-bit MCU with Wi-Fi and Bluetooth. 3.3V logic, more peripherals — the default for IoT projects.",
    },
    objectives: [
      { zh: "对比 ESP32 与 Uno 的差异", en: "Contrast the ESP32 with the Uno" },
      { zh: "注意 3.3V 逻辑与电平匹配", en: "Mind 3.3V logic and level shifting" },
      { zh: "了解 Wi-Fi/蓝牙与深睡眠", en: "Understand Wi-Fi/BT and deep sleep" },
      { zh: "认识可重映射的外设引脚", en: "Understand remappable peripheral pins" },
    ],
    outline: [
      { zh: "双核、主频与内存", en: "Dual core, clock and memory" },
      { zh: "3.3V 逻辑与 5V 器件相接", en: "Interfacing 3.3V logic to 5V parts" },
      { zh: "Wi-Fi、蓝牙与低功耗", en: "Wi-Fi, Bluetooth and low power" },
      { zh: "GPIO 矩阵与引脚复用", en: "The GPIO matrix and pin remapping" },
    ],
  },
  {
    id: "u3", code: "MC3", moduleId: "h3", difficulty: 2, hours: 4, prereq: ["u1"], viz: null,
    parts: ["Raspberry Pi Pico", "RP2040"],
    title: { zh: "树莓派 Pico 与 RP2040", en: "Raspberry Pi Pico & RP2040" },
    summary: {
      zh: "RP2040 双核 M0+,亮点是可编程 I/O(PIO)。支持 C/C++ 与 MicroPython 两条路。",
      en: "The RP2040 is a dual-core M0+ whose highlight is programmable I/O (PIO). It supports both C/C++ and MicroPython.",
    },
    objectives: [
      { zh: "认识 RP2040 与 Pico 引脚", en: "Get to know the RP2040 and Pico pinout" },
      { zh: "理解 PIO 可编程状态机的价值", en: "Understand the value of the PIO state machines" },
      { zh: "对比 C/C++ 与 MicroPython", en: "Compare C/C++ with MicroPython" },
      { zh: "了解 3.3V 逻辑与 ADC", en: "Know the 3.3V logic and ADC" },
    ],
    outline: [
      { zh: "RP2040 架构概览", en: "RP2040 architecture overview" },
      { zh: "PIO:用状态机造外设", en: "PIO: building peripherals from state machines" },
      { zh: "两种开发语言", en: "The two development languages" },
      { zh: "供电与引脚要点", en: "Power and pin essentials" },
    ],
  },

  /* ============ H4 传感器 ============ */
  {
    id: "s1", code: "SN1", moduleId: "h4", difficulty: 1, hours: 4, prereq: ["d4"], viz: "divider",
    parts: ["电位器 / Potentiometer", "光敏电阻 / LDR"],
    title: { zh: "电位器与光敏电阻", en: "Potentiometer & Photoresistor" },
    summary: {
      zh: "最简单的两个模拟传感器,都靠分压把「位置」或「光强」变成一个可读的电压。",
      en: "The two simplest analog sensors: both use a divider to turn position or light into a readable voltage.",
    },
    objectives: [
      { zh: "用分压理解电位器读数", en: "Read a potentiometer through the divider" },
      { zh: "用 LDR + 电阻搭光强传感器", en: "Build a light sensor from an LDR and resistor" },
      { zh: "选择合适的固定电阻", en: "Choose a suitable fixed resistor" },
      { zh: "用 map() 标定读数", en: "Calibrate readings with map()" },
    ],
    outline: [
      { zh: "电位器:三脚的可调分压器", en: "The potentiometer: a three-pin adjustable divider" },
      { zh: "LDR 的阻值随光变化", en: "How an LDR's resistance tracks light" },
      { zh: "选固定电阻定工作区间", en: "Sizing the fixed resistor for range" },
      { zh: "读数标定与 map()", en: "Calibration and map()" },
    ],
  },
  {
    id: "s2", code: "SN2", moduleId: "h4", difficulty: 2, hours: 4, prereq: ["d1"], viz: null,
    parts: ["DHT22"],
    title: { zh: "DHT22 温湿度传感器", en: "DHT22 Temperature & Humidity" },
    summary: {
      zh: "一根数据线,自带时序协议。理解单总线如何在一根线上串出一串比特。",
      en: "One data wire with its own timing protocol. Understand how a one-wire bus streams a string of bits down a single line.",
    },
    objectives: [
      { zh: "理解单总线(1-wire 式)时序", en: "Understand the one-wire-style timing" },
      { zh: "认识数据帧:湿度+温度+校验", en: "Read the frame: humidity + temperature + checksum" },
      { zh: "用库读取并校验数据", en: "Read and checksum with a library" },
      { zh: "注意采样间隔与上拉电阻", en: "Mind the sample interval and pull-up" },
    ],
    outline: [
      { zh: "为什么一根线也能传数据", en: "How one wire carries data" },
      { zh: "40 位数据帧与校验和", en: "The 40-bit frame and its checksum" },
      { zh: "库的使用与常见坑", en: "Using a library and common pitfalls" },
      { zh: "采样率与稳定读取", en: "Sample rate and stable reads" },
    ],
  },
  {
    id: "s3", code: "SN3", moduleId: "h4", difficulty: 2, hours: 4, prereq: ["d1"], viz: "ultrasonic",
    parts: ["HC-SR04"],
    title: { zh: "HC-SR04 超声波测距", en: "HC-SR04 Ultrasonic Ranging" },
    summary: {
      zh: "发一声、听回声、数时间。距离 = 声速 × 时间 ÷ 2,一把「电子卷尺」就成了。",
      en: "Ping, listen for the echo, time it. Distance = speed of sound × time ÷ 2 — an electronic tape measure.",
    },
    objectives: [
      { zh: "理解飞行时间(ToF)测距原理", en: "Understand time-of-flight ranging" },
      { zh: "掌握 trig/echo 的触发时序", en: "Master the trig/echo trigger timing" },
      { zh: "用 pulseIn 测回声脉宽", en: "Measure the echo pulse with pulseIn" },
      { zh: "把时间换算成距离", en: "Convert time to distance" },
    ],
    outline: [
      { zh: "声速与回声", en: "Speed of sound and echoes" },
      { zh: "触发脉冲与回响脉冲", en: "The trigger pulse and the echo pulse" },
      { zh: "pulseIn 与距离公式", en: "pulseIn and the distance formula" },
      { zh: "量程、盲区与误差", en: "Range, blind zone and error" },
    ],
  },

  /* ============ H5 执行器与显示 ============ */
  {
    id: "a1", code: "AD1", moduleId: "h5", difficulty: 2, hours: 4, prereq: ["d3"], viz: "servoPwm",
    parts: ["舵机 / Servo"],
    title: { zh: "舵机控制", en: "Servo Motors" },
    summary: {
      zh: "舵机听「脉宽」的话:1ms→0°,2ms→180°。它内部有电机+齿轮+反馈,你只管发角度。",
      en: "A servo obeys pulse width: 1 ms → 0°, 2 ms → 180°. Inside sits a motor, gears and feedback; you just send an angle.",
    },
    objectives: [
      { zh: "理解舵机的脉宽-角度关系", en: "Understand the pulse-width-to-angle mapping" },
      { zh: "区分舵机 PWM 与调光 PWM", en: "Distinguish servo PWM from dimming PWM" },
      { zh: "用 Servo 库写角度", en: "Write angles with the Servo library" },
      { zh: "注意舵机供电与共地", en: "Mind servo power and a common ground" },
    ],
    outline: [
      { zh: "舵机内部:电机、齿轮、反馈", en: "Inside a servo: motor, gears, feedback" },
      { zh: "50Hz、1–2ms 的控制脉冲", en: "The 50 Hz, 1–2 ms control pulse" },
      { zh: "Servo 库与 write()", en: "The Servo library and write()" },
      { zh: "供电、电流与共地", en: "Power, current and common ground" },
    ],
  },
  {
    id: "a2", code: "AD2", moduleId: "h5", difficulty: 3, hours: 5, prereq: ["d3"], viz: null,
    parts: ["直流电机 / DC Motor", "步进电机 / Stepper", "H 桥 / H-bridge"],
    title: { zh: "直流与步进电机", en: "DC & Stepper Motors" },
    summary: {
      zh: "电机电流大、会反冲,不能直接接引脚。用 H 桥驱动直流电机、用驱动板走步进电机。",
      en: "Motors draw current and kick back — never wire them straight to a pin. Drive DC motors with an H-bridge and steppers with a driver.",
    },
    objectives: [
      { zh: "理解为什么要用驱动器件", en: "Understand why a driver is required" },
      { zh: "用 H 桥实现正反转与调速", en: "Use an H-bridge for direction and speed" },
      { zh: "认识续流二极管与反电动势", en: "Understand flyback diodes and back-EMF" },
      { zh: "掌握步进电机的分步驱动", en: "Grasp step-by-step stepper driving" },
    ],
    outline: [
      { zh: "电机电流与反电动势", en: "Motor current and back-EMF" },
      { zh: "H 桥:正反转的秘密", en: "The H-bridge: direction control" },
      { zh: "PWM 调速与续流保护", en: "PWM speed control and flyback protection" },
      { zh: "步进电机与驱动板", en: "Steppers and driver boards" },
    ],
  },
  {
    id: "a3", code: "AD3", moduleId: "h5", difficulty: 2, hours: 4, prereq: ["u1"], viz: null,
    parts: ["LCD1602", "SSD1306 OLED", "I²C"],
    title: { zh: "LCD1602 与 OLED 显示", en: "LCD1602 & OLED Displays" },
    summary: {
      zh: "字符屏 LCD1602 与像素屏 SSD1306 OLED——两类显示,一个共同话题:数据怎么送进去。",
      en: "The character LCD1602 and the pixel SSD1306 OLED — two kinds of display, one shared question: how the data gets in.",
    },
    objectives: [
      { zh: "区分字符屏与像素屏", en: "Distinguish character from pixel displays" },
      { zh: "用 I²C 背包简化 LCD 接线", en: "Simplify LCD wiring with an I²C backpack" },
      { zh: "用库在 OLED 上绘制", en: "Draw on an OLED with a library" },
      { zh: "理解显存与刷新", en: "Understand the frame buffer and refresh" },
    ],
    outline: [
      { zh: "LCD1602 的字符与并口", en: "LCD1602 characters and the parallel port" },
      { zh: "I²C 背包:把 16 脚变 4 脚", en: "The I²C backpack: 16 pins to 4" },
      { zh: "SSD1306 OLED 与显存", en: "The SSD1306 OLED and its frame buffer" },
      { zh: "显示库的通用套路", en: "The common pattern of display libraries" },
    ],
  },

  /* ============ H6 通信总线 ============ */
  {
    id: "c1", code: "BUS1", moduleId: "h6", difficulty: 2, hours: 4, prereq: ["u1"], viz: "uartFrame",
    parts: ["UART / 串口"],
    title: { zh: "UART 串口通信", en: "UART Serial" },
    summary: {
      zh: "最古老也最常用的点对点串口:两根线、约好波特率,一帧一帧异步收发。",
      en: "The oldest, most common point-to-point serial: two wires, an agreed baud rate, sending frames asynchronously.",
    },
    objectives: [
      { zh: "理解异步串行与波特率", en: "Understand asynchronous serial and baud rate" },
      { zh: "读懂一帧:起始/数据/校验/停止", en: "Read a frame: start/data/parity/stop" },
      { zh: "正确连接 TX↔RX 与共地", en: "Cross TX↔RX and share ground correctly" },
      { zh: "用 Serial 调试与通信", en: "Use Serial for debugging and comms" },
    ],
    outline: [
      { zh: "异步的含义:没有时钟线", en: "What asynchronous means: no clock line" },
      { zh: "波特率与位时间", en: "Baud rate and bit time" },
      { zh: "帧结构与校验位", en: "Frame structure and parity" },
      { zh: "TX/RX 交叉与电平", en: "TX/RX crossing and logic levels" },
    ],
  },
  {
    id: "c2", code: "BUS2", moduleId: "h6", difficulty: 3, hours: 5, prereq: ["c1"], viz: "i2cFrame",
    parts: ["I²C", "SSD1306", "DS1307"],
    title: { zh: "I²C 两线总线", en: "I²C Two-Wire Bus" },
    summary: {
      zh: "两根线挂一串器件,每个都有地址。SDA 传数据、SCL 传时钟,主机点名、从机应答。",
      en: "Two wires, many devices, each with an address. SDA carries data, SCL the clock; the master calls, the slave answers.",
    },
    objectives: [
      { zh: "理解 SDA/SCL 与开漏上拉", en: "Understand SDA/SCL and open-drain pull-ups" },
      { zh: "掌握地址、读写位与 ACK", en: "Master addresses, the R/W bit and ACK" },
      { zh: "读懂起始/停止条件", en: "Read the start and stop conditions" },
      { zh: "用 Wire 库扫描与通信", en: "Scan and talk with the Wire library" },
    ],
    outline: [
      { zh: "两线、多从机、开漏", en: "Two wires, many slaves, open-drain" },
      { zh: "起始条件、地址与 ACK", en: "Start condition, address and ACK" },
      { zh: "读写时序一帧走完", en: "A full read/write transaction" },
      { zh: "上拉电阻与总线速度", en: "Pull-up resistors and bus speed" },
    ],
  },
  {
    id: "c3", code: "BUS3", moduleId: "h6", difficulty: 3, hours: 4, prereq: ["c1"], viz: null,
    parts: ["SPI", "microSD", "ILI9341"],
    title: { zh: "SPI 高速总线", en: "SPI High-Speed Bus" },
    summary: {
      zh: "四根线、全双工、有时钟,最快。每个从机一根片选(CS),适合显示屏、SD 卡等大流量器件。",
      en: "Four wires, full-duplex, clocked — the fastest. One chip-select (CS) per slave, ideal for displays, SD cards and other high-throughput parts.",
    },
    objectives: [
      { zh: "认识 MOSI/MISO/SCK/CS 四线", en: "Learn the MOSI/MISO/SCK/CS lines" },
      { zh: "理解全双工与移位寄存器模型", en: "Understand full-duplex and the shift-register model" },
      { zh: "用 CS 选择多个从机", en: "Select among slaves with CS" },
      { zh: "认识 SPI 模式(CPOL/CPHA)", en: "Understand SPI modes (CPOL/CPHA)" },
    ],
    outline: [
      { zh: "四根线各是什么", en: "What each of the four lines does" },
      { zh: "移位寄存器:同时收发", en: "Shift registers: send and receive at once" },
      { zh: "片选与多从机", en: "Chip-select and multiple slaves" },
      { zh: "时钟极性与相位", en: "Clock polarity and phase" },
    ],
  },

  /* ============ H7 智能护理床(项目) ============ */
  {
    id: "mb1", code: "CB1", moduleId: "h7", difficulty: 2, hours: 4, prereq: ["u2", "c2"], viz: null,
    parts: ["Raspberry Pi 5", "ESP32", "以太网 / Ethernet"],
    title: { zh: "系统架构与物料清单", en: "System Architecture & BOM" },
    summary: {
      zh: "先看全局:一台树莓派做大脑,多个 ESP32 节点做感官,如何分工、如何组成一份可现货采购的物料清单。",
      en: "The big picture first: a Raspberry Pi as the brain, ESP32 nodes as the senses — how they split the work and form an off-the-shelf, purchasable bill of materials.",
    },
    objectives: [
      { zh: "理解「主控 + 传感器节点」的分层架构", en: "Understand the layered 'controller + sensor node' architecture" },
      { zh: "分清树莓派与 ESP32 各自的角色", en: "Tell apart the roles of the Pi and the ESP32" },
      { zh: "读懂一份原型级 BOM 的组织方式", en: "Read how a prototype-grade BOM is organised" },
      { zh: "知道现货采购渠道与选型思路", en: "Know the sourcing channels and selection logic" },
    ],
    outline: [
      { zh: "分层:边缘采样 vs 融合与界面", en: "Layers: edge sampling vs fusion and UI" },
      { zh: "核心计算与通信模块", en: "The core compute and comms modules" },
      { zh: "四类监测子系统概览", en: "Overview of the four monitoring subsystems" },
      { zh: "原型级 BOM 与采购渠道", en: "The prototype BOM and where to buy" },
    ],
  },
  {
    id: "mb2", code: "CB2", moduleId: "h7", difficulty: 3, hours: 5, prereq: ["d4", "mb1"], viz: "bcg",
    parts: ["称重传感器 / Load cell ×4", "HX711", "ADS1232", "INA333"],
    title: { zh: "呼吸与心率:称重传感器 + BCG", en: "Breathing & Heart Rate: Load Cells + BCG" },
    summary: {
      zh: "床脚下的四个称重传感器,能称出体重里那一丝随心跳与呼吸起伏的微小变化——这就是心冲击图(BCG)。",
      en: "Four load cells under the bed legs weigh the tiny ripple in body weight from each heartbeat and breath — that's ballistocardiography (BCG).",
    },
    objectives: [
      { zh: "理解称重传感器(应变片全桥)的原理", en: "Understand the load cell (strain-gauge full bridge)" },
      { zh: "理解 BCG:从体重信号里提取心跳与呼吸", en: "Understand BCG: extracting heartbeat and breathing from weight" },
      { zh: "选择 24 位 ADC:HX711 vs ADS1232", en: "Choose a 24-bit ADC: HX711 vs ADS1232" },
      { zh: "认识信号调理与噪声的重要性", en: "Appreciate signal conditioning and noise" },
    ],
    outline: [
      { zh: "称重传感器与惠斯通电桥", en: "Load cells and the Wheatstone bridge" },
      { zh: "四脚合成一个全桥,称总重", en: "Four legs into one bridge, weighing the total" },
      { zh: "BCG:体重里的心跳与呼吸波", en: "BCG: heartbeat and breathing in the weight" },
      { zh: "24 位 ADC 与信号调理", en: "The 24-bit ADC and signal conditioning" },
    ],
  },
  {
    id: "mb3", code: "CB3", moduleId: "h7", difficulty: 3, hours: 5, prereq: ["d4", "c2"], viz: "pressureMap",
    parts: ["FSR / Velostat", "CD74HC4067", "MPU-6050", "BNO055"],
    title: { zh: "翻身与体位:压力阵列 + IMU", en: "Turning & Posture: Pressure Array + IMU" },
    summary: {
      zh: "一张压力分布垫画出身体压在床上的「热力图」,配合 IMU 的姿态数据,判断病人翻身、体位与是否离床。",
      en: "A pressure mat paints a heat-map of the body on the bed; combined with an IMU's orientation, it tells turning, posture and bed-exit.",
    },
    objectives: [
      { zh: "理解 FSR/Velostat 力敏电阻的原理", en: "Understand FSR/Velostat force-sensing resistors" },
      { zh: "用模拟多路复用器扫描传感器网格", en: "Scan a sensor grid with an analog multiplexer" },
      { zh: "用 IMU 检测体位与翻身", en: "Detect posture and turning with an IMU" },
      { zh: "把压力图与姿态融合成体位判断", en: "Fuse the pressure map and orientation into posture" },
    ],
    outline: [
      { zh: "力敏电阻:压力越大电阻越小", en: "Force-sensing resistors: more pressure, less resistance" },
      { zh: "行列网格与 CD74HC4067 扫描", en: "The row/column grid and CD74HC4067 scanning" },
      { zh: "IMU:加速度计 + 陀螺仪 + 姿态融合", en: "IMU: accelerometer + gyro + fusion" },
      { zh: "离床与压疮风险判断", en: "Bed-exit and pressure-injury risk" },
    ],
  },
  {
    id: "mb4", code: "CB4", moduleId: "h7", difficulty: 2, hours: 3, prereq: ["c2", "mb1"], viz: null,
    parts: ["湿度电极 / Moisture electrode", "SHT40", "三防漆 / Conformal coating"],
    title: { zh: "尿床与湿度监测", en: "Bed-Wetting & Moisture Sensing" },
    summary: {
      zh: "叉指电极感知潮湿、SHT40 交叉确认温湿度,既要灵敏又要耐腐蚀、可清洁——这是最贴近护理现场的细节。",
      en: "Interdigitated electrodes sense wetness while an SHT40 cross-checks temperature and humidity — sensitive yet corrosion-resistant and cleanable, the detail closest to real care.",
    },
    objectives: [
      { zh: "理解电阻式与电容式湿度感知", en: "Understand resistive vs capacitive moisture sensing" },
      { zh: "用 SHT40 交叉确认「真湿」", en: "Confirm real wetness with an SHT40" },
      { zh: "认识防腐蚀与可清洁设计", en: "Understand corrosion resistance and cleanability" },
      { zh: "降低误报:阈值与确认逻辑", en: "Reduce false alarms with thresholds and confirmation" },
    ],
    outline: [
      { zh: "叉指导电电极垫的原理", en: "How an interdigitated electrode pad works" },
      { zh: "电容式 vs 电阻式:耐腐蚀之争", en: "Capacitive vs resistive: the corrosion trade-off" },
      { zh: "SHT40(I²C)交叉验证", en: "SHT40 (I²C) cross-validation" },
      { zh: "三防处理与可擦拭隔膜", en: "Conformal coating and a wipeable membrane" },
    ],
  },
  {
    id: "mb5", code: "CB5", moduleId: "h7", difficulty: 3, hours: 4, prereq: ["mb2", "mb3"], viz: null,
    parts: ["医疗电源 / IEC 60601", "数字隔离器 / ADuM", "LiFePO4 + BMS", "CAN 收发器"],
    title: { zh: "供电、隔离与患者安全", en: "Power, Isolation & Patient Safety" },
    summary: {
      zh: "只要接触病人,安全就压倒一切:隔离供电、数字隔离器、备用电池,以及从「原型」走到「受监管医疗产品」到底还差什么。",
      en: "The moment it touches a patient, safety outranks everything: isolated power, digital isolators, battery backup — and honestly, what separates a prototype from a regulated medical device.",
    },
    objectives: [
      { zh: "理解患者隔离与漏电流为何是底线", en: "Understand why patient isolation and leakage current are the bottom line" },
      { zh: "认识隔离电源与数字隔离器", en: "Understand isolated supplies and digital isolators" },
      { zh: "用备用电池保证断电不中断", en: "Keep running through power loss with a backup battery" },
      { zh: "看清原型与合规产品之间的差距", en: "See the gap between a prototype and a compliant product" },
    ],
    outline: [
      { zh: "为什么医疗电子必须隔离", en: "Why medical electronics must be isolated" },
      { zh: "隔离电源、隔离放大器与数字隔离器", en: "Isolated power, isolation amps and digital isolators" },
      { zh: "备用电池 + BMS 与多床 CAN 组网", en: "Battery + BMS backup and multi-bed CAN networking" },
      { zh: "从原型到 IEC 60601 合规", en: "From prototype to IEC 60601 compliance" },
    ],
  },

  /* ============ H8 掌上游戏机(项目) ============ */
  {
    id: "gc1", code: "GC1", moduleId: "h8", difficulty: 2, hours: 3, prereq: [], viz: "emuPower",
    parts: ["R36S", "RK3326", "IPS 640×480", "3500mAh"],
    title: { zh: "选硬件:SoC、屏幕、电池、手感", en: "Choosing the Hardware: SoC, Screen, Battery, Feel" },
    summary: {
      zh: "买掌机不是看「预装多少游戏」,而是看 SoC 能模拟到哪一代、屏幕与手感能不能用得住。以 R36S 为标尺,学会读规格。",
      en: "Buying a handheld isn't about how many games are preloaded — it's about which console generation the SoC can emulate, and whether the screen and feel hold up. Use the R36S as a yardstick for reading specs.",
    },
    objectives: [
      { zh: "读懂 SoC 规格:核心、频率、GPU", en: "Read SoC specs: cores, clock, GPU" },
      { zh: "把 SoC 性能对应到「能玩哪代主机」", en: "Map SoC power to 'which console generation runs'" },
      { zh: "评估屏幕、电池、按键与散热", en: "Assess screen, battery, buttons and cooling" },
      { zh: "识别克隆机与虚标,避坑", en: "Spot clones and inflated specs, avoid traps" },
    ],
    outline: [
      { zh: "SoC 是心脏:以 RK3326 为例", en: "The SoC is the heart: RK3326 as example" },
      { zh: "性能 vs 模拟世代:能玩到哪", en: "Power vs emulation era: how far you get" },
      { zh: "屏幕、电池、手感与做工", en: "Screen, battery, feel and build" },
      { zh: "真伪与虚标:采购避坑", en: "Authenticity and inflated specs" },
    ],
  },
  {
    id: "gc2", code: "GC2", moduleId: "h8", difficulty: 2, hours: 3, prereq: ["gc1"], viz: null,
    parts: ["ArkOS", "JELOS", "microSD", "U-Boot"],
    title: { zh: "系统与固件:Linux 与从 SD 启动", en: "OS & Firmware: Linux, Booting from SD" },
    summary: {
      zh: "这些掌机本质是一台跑 Linux 的小电脑。理解它如何从 SD 卡启动、为什么要刷第三方固件(ArkOS/JELOS),以及双卡槽的分工。",
      en: "These handhelds are really little Linux computers. Understand how they boot from an SD card, why you'd flash third-party firmware (ArkOS/JELOS), and what the dual card slots are for.",
    },
    objectives: [
      { zh: "理解「从 SD 卡启动」的引导流程", en: "Understand the boot-from-SD flow" },
      { zh: "对比原厂固件与第三方固件", en: "Contrast stock vs third-party firmware" },
      { zh: "认识 ArkOS / JELOS / AmberELEC", en: "Get to know ArkOS / JELOS / AmberELEC" },
      { zh: "理解双 SD 卡槽:系统卡 vs 游戏卡", en: "Understand dual SD slots: OS card vs games card" },
    ],
    outline: [
      { zh: "掌机 = 一台 Linux 小电脑", en: "The handheld = a little Linux computer" },
      { zh: "SoC → U-Boot → 内核 → 前端 的启动链", en: "SoC → U-Boot → kernel → frontend boot chain" },
      { zh: "刷固件:为什么与怎么做", en: "Flashing firmware: why and how" },
      { zh: "双卡槽分工与备份", en: "Dual-slot roles and backups" },
    ],
  },
  {
    id: "gc3", code: "GC3", moduleId: "h8", difficulty: 2, hours: 4, prereq: ["gc2"], viz: null,
    parts: ["EmulationStation", "RetroArch", "libretro", "BIOS / ROM"],
    title: { zh: "模拟器栈:前端 + RetroArch/libretro", en: "The Emulation Stack: Frontend + RetroArch/libretro" },
    summary: {
      zh: "从你按下按键到游戏画面出现,中间隔着一整层软件:前端选游戏、RetroArch 载入内核、内核模拟主机。看懂这条栈,就会调、会修。",
      en: "Between pressing a button and a game appearing sits a whole layer of software: a frontend to pick games, RetroArch to load a core, the core to emulate the console. Understand this stack and you can tune and fix it.",
    },
    objectives: [
      { zh: "理解「前端 → RetroArch → 内核」的分层", en: "Understand the frontend → RetroArch → core layering" },
      { zh: "认识 libretro 内核与如何选核", en: "Understand libretro cores and how to pick one" },
      { zh: "搞懂 BIOS、ROM 与文件放置", en: "Sort out BIOS, ROMs and where files go" },
      { zh: "会用即时存档、金手指、着色器", en: "Use save states, cheats and shaders" },
    ],
    outline: [
      { zh: "前端 EmulationStation 的角色", en: "The role of the EmulationStation frontend" },
      { zh: "RetroArch 与 libretro 内核", en: "RetroArch and libretro cores" },
      { zh: "BIOS、ROM 与目录约定", en: "BIOS, ROMs and directory conventions" },
      { zh: "存档、金手指、着色器与调优", en: "Saves, cheats, shaders and tuning" },
    ],
  },
  {
    id: "gc4", code: "GC4", moduleId: "h8", difficulty: 3, hours: 4, prereq: ["gc3"], viz: null,
    parts: ["SSH", "Wi-Fi dongle", "Python", "GPIO"],
    title: { zh: "对接与扩展:SD 布局、SSH、手柄、自编程序", en: "Interfacing & Extending: SD Layout, SSH, Gamepad, Your Code" },
    summary: {
      zh: "把掌机当成一台可编程的 Linux 设备:看懂 SD 卡目录结构,用 Wi-Fi + SSH 远程进去,理解手柄如何映射成输入,甚至跑上你自己写的程序。",
      en: "Treat the handheld as a programmable Linux device: read the SD-card directory layout, get in remotely over Wi-Fi + SSH, understand how the gamepad maps to input, and even run your own programs on it.",
    },
    objectives: [
      { zh: "读懂 SD 卡目录与 ROM/BIOS 放置", en: "Read the SD-card layout and where ROMs/BIOS go" },
      { zh: "用 Wi-Fi + SSH 远程管理设备", en: "Manage the device remotely over Wi-Fi + SSH" },
      { zh: "理解手柄如何映射成按键/事件", en: "Understand how the gamepad maps to buttons/events" },
      { zh: "在掌机上运行自己的程序(Python 等)", en: "Run your own programs (Python, etc.) on the handheld" },
    ],
    outline: [
      { zh: "SD 卡目录结构与文件传输", en: "SD-card layout and moving files" },
      { zh: "联网:Wi-Fi 适配器与 SSH", en: "Networking: a Wi-Fi adapter and SSH" },
      { zh: "输入:手柄映射与 evdev", en: "Input: gamepad mapping and evdev" },
      { zh: "跑自己的代码,把它当计算机用", en: "Running your own code, using it as a computer" },
    ],
  },
];

// Structured bill of materials for the H7 Smart Care Bed — rendered on the
// printable shopping-list page (#/bom). tier: core | optional | product.
const CARE_BED_BOM = [
  {
    group: { zh: "核心计算与通信", en: "Core Compute & Comms" },
    items: [
      { starter: true, tier: "core", name: { zh: "主控单板计算机", en: "Main single-board computer" }, model: { zh: "树莓派 5(4–8 GB)+ 电源 + microSD 卡", en: "Raspberry Pi 5 (4–8 GB) + PSU + microSD" }, qty: "1", note: { zh: "传感器融合、边缘 ML、界面、网络", en: "Sensor fusion, edge ML, UI, networking" } },
      { starter: true, tier: "core", name: { zh: "传感器节点 MCU", en: "Sensor-node MCU" }, model: { zh: "ESP32-DevKitC(或 STM32 Nucleo)", en: "ESP32-DevKitC (or STM32 Nucleo)" }, qty: "1–3", note: { zh: "实时采样;ESP32 自带 Wi-Fi/BLE", en: "Real-time sampling; ESP32 has Wi-Fi/BLE" } },
      { tier: "optional", name: { zh: "触摸屏(可选)", en: "Touchscreen (optional)" }, model: { zh: "7 英寸树莓派显示屏", en: "7-inch Raspberry Pi display" }, qty: "0–1", note: { zh: "本地床旁用户界面", en: "Local bedside UI" } },
      { tier: "core", name: { zh: "网络", en: "Networking" }, model: { zh: "板载以太网 / Wi-Fi", en: "Onboard Ethernet / Wi-Fi" }, qty: "—", note: { zh: "上行网络连接", en: "Uplink connectivity" } },
    ],
  },
  {
    group: { zh: "呼吸 / 心率监测(BCG)", en: "Breathing / Heart Rate (BCG)" },
    items: [
      { starter: true, tier: "core", name: { zh: "称重传感器 ×4", en: "Load cells ×4" }, model: { zh: "50 kg 半桥(合成全桥)或 4×200 kg 条形", en: "50 kg half-bridge (into a full bridge) or 4×200 kg bar" }, qty: "4", note: { zh: "每个床脚一个", en: "One under each bed leg" } },
      { starter: true, tier: "core", name: { zh: "24 位 ADC", en: "24-bit ADC" }, model: { zh: "HX711(便宜)或 ADS1232 / ADS1220(更低噪声)", en: "HX711 (cheap) or ADS1232 / ADS1220 (lower noise)" }, qty: "1–4", note: { zh: "起步用 HX711;高质量 BCG 用 ADS1232", en: "Start with HX711; ADS1232 for quality BCG" } },
      { tier: "optional", name: { zh: "仪表放大器(若不用 HX711)", en: "Instrumentation amp (if not HX711)" }, model: { zh: "INA125 / INA333", en: "INA125 / INA333" }, qty: "按需", note: { zh: "信号调理", en: "Signal conditioning" } },
      { tier: "core", name: { zh: "安装五金件", en: "Mounting hardware" }, model: { zh: "称重传感器支脚/支架、隔离柱", en: "Load-cell feet/brackets, standoffs" }, qty: "4 套", note: { zh: "安装于每个床脚下", en: "Mount under each bed leg" } },
    ],
  },
  {
    group: { zh: "翻身 / 体位 / 离床", en: "Turning / Posture / Bed-exit" },
    items: [
      { starter: true, tier: "core", name: { zh: "压力分布传感单元", en: "Pressure sensing" }, model: { zh: "FSR 阵列(Interlink 402/406)或 Velostat 薄膜 + 铜箔胶带", en: "FSR array (Interlink 402/406) or Velostat film + copper tape" }, qty: "1 网格", note: { zh: "正式产品用商用压力垫(Tekscan)", en: "Commercial pressure mat for product (Tekscan)" } },
      { tier: "core", name: { zh: "模拟多路复用器", en: "Analog multiplexer" }, model: { zh: "CD74HC4067(16 通道)×N", en: "CD74HC4067 (16-channel) ×N" }, qty: "N", note: { zh: "扫描 FSR 网格的行/列", en: "Scan the FSR grid rows/columns" } },
      { starter: true, tier: "core", name: { zh: "IMU 惯性测量单元", en: "IMU" }, model: { zh: "MPU-6050(经济型)或 BNO055 / ICM-20948(9 轴)", en: "MPU-6050 (economy) or BNO055 / ICM-20948 (9-axis)" }, qty: "1", note: { zh: "体位 + 翻身检测", en: "Posture + turning detection" } },
    ],
  },
  {
    group: { zh: "尿床 / 湿度监测", en: "Bed-wetting / Moisture" },
    items: [
      { starter: true, tier: "core", name: { zh: "湿度 / 潮湿传感器", en: "Moisture sensor" }, model: { zh: "叉指导电电极垫,或电容式湿度传感器", en: "Interdigitated electrode pad, or a capacitive moisture sensor" }, qty: "1+", note: { zh: "电容式比电阻式更耐腐蚀", en: "Capacitive resists corrosion better than resistive" } },
      { starter: true, tier: "core", name: { zh: "温度 + 湿度传感器", en: "Temp + humidity sensor" }, model: { zh: "SHT31 / SHT40(I²C 接口)", en: "SHT31 / SHT40 (I²C)" }, qty: "1", note: { zh: "确认真尿湿而非误触发", en: "Confirm real wetness vs false trigger" } },
      { tier: "core", name: { zh: "防水处理", en: "Waterproofing" }, model: { zh: "三防漆、硅胶、可擦拭隔膜", en: "Conformal coating, silicone, wipeable membrane" }, qty: "1 套", note: { zh: "便于清洁", en: "For cleaning" } },
    ],
  },
  {
    group: { zh: "供电 / 隔离 / 安全 / 辅料", en: "Power / Isolation / Safety / Misc" },
    items: [
      { starter: true, tier: "core", name: { zh: "隔离 DC-DC / 电源", en: "Isolated DC-DC / power" }, model: { zh: "原型:5 V/12 V;产品:IEC 60601-1 医疗电源(明纬 GST/RPS)", en: "Prototype: 5 V/12 V; product: IEC 60601-1 medical PSU (Mean Well GST/RPS)" }, qty: "1", note: { zh: "产品阶段必须医疗级", en: "Must be medical-grade for a product" } },
      { tier: "product", name: { zh: "隔离放大器 / 数字隔离器", en: "Isolation amp / digital isolators" }, model: { zh: "ISO124,或 ADuM 数字隔离器(I²C/SPI)", en: "ISO124, or ADuM digital isolators (I²C/SPI)" }, qty: "按需", note: { zh: "患者安全隔离", en: "Patient-safety isolation" } },
      { tier: "core", name: { zh: "ADC 转接板 / 原型板", en: "ADC breakout / proto board" }, model: { zh: "—", en: "—" }, qty: "按需", note: { zh: "接线用", en: "For wiring" } },
      { tier: "core", name: { zh: "电平转换器", en: "Level shifter" }, model: { zh: "—", en: "—" }, qty: "按需", note: { zh: "3.3 V 与 5 V 混用时", en: "When mixing 3.3 V and 5 V" } },
      { starter: true, tier: "core", name: { zh: "线材、连接器", en: "Wiring & connectors" }, model: { zh: "JST/Molex 端子、冷压头、跳线", en: "JST/Molex terminals, crimps, jumpers" }, qty: "1 套", note: { zh: "—", en: "—" } },
      { tier: "optional", name: { zh: "CAN 收发器(可选)", en: "CAN transceiver (optional)" }, model: { zh: "SN65HVD230 / MCP2515", en: "SN65HVD230 / MCP2515" }, qty: "每节点 1", note: { zh: "串联多个床位节点", en: "Chain multiple bed nodes" } },
      { tier: "core", name: { zh: "外壳", en: "Enclosure" }, model: { zh: "可擦拭 / 密封外壳", en: "Wipeable / sealed enclosure" }, qty: "1", note: { zh: "便于清洁", en: "For cleaning" } },
      { tier: "optional", name: { zh: "备用电池 + 充电器", en: "Backup battery + charger" }, model: { zh: "磷酸铁锂电池组 + BMS", en: "LiFePO4 pack + BMS" }, qty: "1", note: { zh: "转运或断电时持续工作", en: "Keeps running on transfer / outage" } },
    ],
  },
  {
    group: { zh: "工作台 / 开发工具(一次性)", en: "Bench / Dev Tools (one-time)" },
    items: [
      { tier: "core", name: { zh: "基础工具", en: "Core tools" }, model: { zh: "万用表、台式电源、烙铁/焊台、面包板 + 跳线", en: "Multimeter, bench PSU, soldering iron/station, breadboard + jumpers" }, qty: "1 套", note: { zh: "—", en: "—" } },
      { tier: "core", name: { zh: "调试仪器", en: "Debug instruments" }, model: { zh: "逻辑分析仪(Saleae 兼容)、示波器(或 USB 示波器)", en: "Logic analyzer (Saleae-compatible), oscilloscope (or USB scope)" }, qty: "1 套", note: { zh: "看时序与波形", en: "For timing and waveforms" } },
      { tier: "core", name: { zh: "标定砝码", en: "Calibration weights" }, model: { zh: "已知质量的标定砝码", en: "Known-mass calibration weights" }, qty: "1 套", note: { zh: "校准称重传感器", en: "Calibrate the load cells" } },
    ],
  },
];

// Aggregates used on the home hero.
const TOTAL_HOURS = CHAPTERS.reduce((s, c) => s + c.hours, 0);
const ALL_PARTS = Array.from(new Set(CHAPTERS.flatMap((c) => c.parts || [])));

window.MODULES = MODULES;
window.CHAPTERS = CHAPTERS;
window.TOTAL_HOURS = TOTAL_HOURS;
window.ALL_PARTS = ALL_PARTS;
window.CARE_BED_BOM = CARE_BED_BOM;
