## 核心讲义

### 扫码头里有什么

一把工业扫码枪,拆开看大致是三块:

1. **光电 / 成像**:激光线或 CMOS 摄像头「看见」条码;
2. **解码芯片**:把黑白条纹变成 ASCII/UTF-8 字符串;
3. **接口芯片**:把字符串以键盘楔、USB HID 或 UART 送出。

对本课而言,你要掌握的是第 3 块——**如何把那一串字符可靠地接进 MCU 或终端 App**,再变成带 `eventId` 的业务请求。

<div class="spec-strip">
<div class="cell"><div class="k">HID</div><div class="v">像键盘</div></div>
<div class="cell"><div class="k">UART</div><div class="v">接 MCU</div></div>
<div class="cell"><div class="k">RS-232</div><div class="v">要电平转换</div></div>
<div class="cell"><div class="k">结尾</div><div class="v">CR/LF</div></div>
</div>

### 四种常见接口对照

| 接口 | 表现 | 优点 | 注意 |
|---|---|---|---|
| **USB HID 键盘楔** | 扫完像键盘敲入焦点框 | 零驱动、接 PC/平板极快 | 难给裸 MCU;焦点错就乱输入 |
| **USB CDC / 虚拟串口** | 枚举成 COMx | 程序好读 | 依赖 USB 主机栈 |
| **TTL UART(3.3/5 V)** | TX/RX + GND | **最适合 ESP32/Arduino 实验** | 交叉 TX↔RX、共地、电平一致 |
| **RS-232** | DB9、±12 V 电平 | 老秤、老 PLC 常见 | 必须 MAX3232 等转换,不能直插 MCU |

交互图可切换三种模式,看字符如何沿「引擎 → 接口 → MCU/App → ERP」流动。

### 串口读枪:最小程序(ESP32)

多数枪出厂可配成 **9600 8N1**,扫完自动追加 `\r` 或 `\r\n`。

```cpp
// Arduino / ESP32 — 枪 TX → GPIO16(RX2), 共地
HardwareSerial Gun(2);

void setup() {
  Serial.begin(115200);
  Gun.begin(9600, SERIAL_8N1, 16, 17); // RX, TX
}

void loop() {
  static String buf;
  while (Gun.available()) {
    char c = Gun.read();
    if (c == '\r' || c == '\n') {
      if (buf.length()) {
        handleBarcode(buf);
        buf = "";
      }
    } else {
      buf += c;
      if (buf.length() > 64) buf = ""; // 防噪声撑爆
    }
  }
}
```

对照 BUS1:这就是 UART 帧在应用层的用法——**约定波特率、交叉 TX/RX、用行结束符分包**。

### 最小业务载荷(别少字段)

扫到字符串还不够。过账至少要能回答:「哪张单、什么料、多少、在哪」。推荐最小 JSON:

```json
{
  "eventId": "esp32a-20260723-203012-0007",
  "doc": "PO-7781",
  "material": "MAT-WHEEL",
  "qty": 12,
  "bin": "A-01",
  "source": { "iface": "uart", "device": "gun-01" },
  "ts": "2026-07-23T20:30:12+08:00"
}
```

- **eventId**:全链路唯一,ERP 侧做幂等键——弱网重传不会双倍收货;
- **ts**:边缘与 ERP 都要对钟(NTP),否则对账困难;
- 多段扫码(先单号再物料再库位)时,在终端状态机里拼齐再提交,不要每扫一下就过账。

### 从扫码到 HTTPS / MQTT

| 路径 | 适用 | 要点 |
|---|---|---|
| 终端 App **HTTPS POST** | RF 枪 + 安卓/Win 手持 | 强校验、即时返回错误码 |
| MCU **Wi-Fi → MQTT** | ESP32 固定枪位 | QoS1 + 本地队列;ERP 必须幂等 |
| MCU **Wi-Fi → HTTPS** | 小流量报工/安灯 | 证书与超时要设计好 |

断网时:**先写入本地队列(SPIFFS/SD),恢复后再发**——这与 ERP_BOOK HW3 的「断网缓存 + 防重」是同一纪律,只是落地在设备固件里。

### 常见坑

- 枪默认 HID,MCU 空等串口 → 先用厂商工具改成 UART 模式;
- 5 V TTL 枪直插 ESP32 3.3 V RX → 可能损坏,加电平转换;
- 忘记共地 → 乱码;
- 把「扫到的字符」直接当数量 → 必须校验主数据与数量范围。

## 练习

1. 用串口监视器读一把枪(或手机串口助手模拟 `\r\n` 结尾字符串),写函数去掉结尾并校验长度。
2. 设计三段扫码状态机:PO → 物料 → 库位,拼出上面的 JSON。
3. 故意连发两次相同 `eventId`,说明 ERP/假 API 应返回什么。

> ✦ **要点:** 扫码枪 = 传感 + 解码 + 接口。实验优先 **TTL UART**;业务侧永远带 **eventId** 与最小单据字段,再经 HTTPS 或 MQTT 交给 ERP——安灯章把另一类「事件」也接进同一套纪律。
