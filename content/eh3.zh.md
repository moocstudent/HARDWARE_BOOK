## 核心讲义

### 安灯不是装饰灯塔

丰田式安灯(Andon)的本质:**任何人发现异常都能立刻让产线状态可见,并强制组织响应**。硬件通常包括:

- **拉绳 / 按钮**:工位一拉,呼叫产生;
- **三色灯塔**:红=呼叫、黄=响应中、绿=正常(各地习惯略有差异);
- **声光 / 工位屏**:班组长到场、原因码选择;
- **上行链路**:停机开始写入 MES/ERP,计入 OEE,必要时冻结报工与交期。

本课 IO2(上拉与消抖)、IO3(PWM/LED)几乎就是迷你安灯的全部模拟电子基础。

<div class="spec-strip">
<div class="cell"><div class="k">输入</div><div class="v">拉绳</div></div>
<div class="cell"><div class="k">消抖</div><div class="v">IO2</div></div>
<div class="cell"><div class="k">输出</div><div class="v">灯塔</div></div>
<div class="cell"><div class="k">上行</div><div class="v">原因码</div></div>
</div>

### 从面包板到工业灯塔

| 实验级 | 产线级 | 注意 |
|---|---|---|
| 轻触按钮 + `INPUT_PULLUP` | 工业常开按钮 / 拉绳开关 | 长线加滤波、屏蔽 |
| 红黄绿 LED + 限流电阻 | 24 V 多层灯塔 | **继电器/MOSFET 驱动**,MCU 勿直驱大电流 |
| `tone()` / 有源蜂鸣器 | 声光报警器 | 与灯同状态机 |
| OLED 显示状态 | 工位 HMI / 平板 | 选原因码、看工单 |

24 V 灯塔线圈有反电动势——回顾 AD2:加续流二极管,电机/继电器电源与逻辑电源共地隔离要按现场规范做。

### 状态机(请背下来)

```
GREEN ──拉绳──► CALL(红+声) ──班组长确认──► ACK(黄)
                                              │
                     ◄──关闭(原因码+时长)── CLEAR ─┘
                              │
                              ▼
                            GREEN
```

交互图可点四态,观察哪一层灯亮、原因码字符串如何变化。

伪代码骨架:

```cpp
enum { ST_GREEN, ST_CALL, ST_ACK } st = ST_GREEN;
bool btnFalling(); // 消抖后的下降沿,见 IO2

void loop() {
  switch (st) {
    case ST_GREEN:
      setTower(GREEN);
      if (btnFalling()) { st = ST_CALL; t0 = millis(); publish("ANDON_PULL"); }
      break;
    case ST_CALL:
      setTower(RED); buzz(true);
      if (ackPressed()) { st = ST_ACK; publish("LEAD_ON_SITE"); }
      break;
    case ST_ACK:
      setTower(YELLOW); buzz(false);
      if (clearPressed()) {
        publishClose(reasonCode, millis() - t0);
        st = ST_GREEN;
      }
      break;
  }
}
```

### 上行载荷示例

```json
{
  "eventId": "andon-line3-00042",
  "plant": "1000",
  "line": "L3",
  "station": "OP-20",
  "state": "CALL",
  "reason": "ANDON_PULL",
  "wo": "WO-5521",
  "ts": "2026-07-23T20:31:00+08:00"
}
```

关闭时补上 `reasonCode`(缺料/设备/质量…)、`durationMs`,供 OEE 与成本中心使用——细节见 ERP_BOOK HW2。

### 虚报「绿灯」为什么伤人

- 停机不上系统 → OEE 虚高、维护预算失真;
- 工单进度不冻结 → 下游仓库/销售仍按原承诺备货与回复客户;
- 原因码乱填 → 改善活动打在错误问题上。

硬件侧能做的防呆:关闭必须选原因码、长按确认、关键动作写审计日志。

## 练习

1. 用三颗 LED + 一个按钮实现 GREEN/CALL/ACK 三态,串口打印状态迁移。
2. 给拉绳加 50 ms 软件消抖,用逻辑分析仪或串口时间戳验证。
3. 设计「关闭」报文的字段列表,并说明哪几个必须进 ERP 停机单。

> ✦ **要点:** 安灯 = **消抖输入 + 灯塔输出 + 状态机 + 原因码上行**。电信号要与 ERP/MES 状态咬合,否则红灯只是气氛组——下一章用边缘网关把扫码与安灯事件统一送进 MQTT/HTTPS。
