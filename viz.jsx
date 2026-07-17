/* =========================================================
   viz.jsx — interactive circuit & waveform figures
   ---------------------------------------------------------
   Dependency-free canvas 2D. Each chapter may set
   `viz: "<name>"` in data.jsx; the chapter page renders
   <Viz name={...} /> in a free "Interactive" section.
   Figures read CSS theme vars live and redraw on theme flip.
   ========================================================= */

function cssvar(name, fb) {
  try { const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); return v || fb; }
  catch (e) { return fb; }
}
function COLORS() {
  return {
    ink: cssvar("--ink", "#141414"),
    accent: cssvar("--accent", "#ff4d1f"),
    accentInk: cssvar("--accent-ink", "#1a0700"),
    primary: cssvar("--primary", "#0e3a3a"),
    muted: cssvar("--muted", "#6b6657"),
    hair: cssvar("--hairline-strong", "#14141433"),
    surface: cssvar("--surface", "#ebe6d9"),
    bg: cssvar("--bg", "#f3efe6"),
  };
}
function useThemeTick() {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    const obs = new MutationObserver(() => setT((x) => x + 1));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return t;
}
// Canvas that redraws on every render (params/theme/resize → re-render).
function Canvas({ draw, height }) {
  const ref = React.useRef(null);
  const tick = useThemeTick();
  const [, setRsz] = React.useState(0);
  React.useEffect(() => {
    const on = () => setRsz((x) => x + 1);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  React.useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const W = Math.max(280, cv.clientWidth || 560), H = height || 260;
    cv.width = W * dpr; cv.height = H * dpr;
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    draw(ctx, W, H);
  });
  return <canvas ref={ref} className="viz-canvas" style={{ width: "100%", height: (height || 260) + "px", display: "block" }} />;
}

// A labelled slider that returns [value, control-element].
function Slider({ label, min, max, step, value, onChange, unit, fmt }) {
  return (
    <label>
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step || 1} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))} />
      <span className="val">{fmt ? fmt(value) : value}{unit || ""}</span>
    </label>
  );
}

const round = (x, n) => { const p = Math.pow(10, n || 0); return Math.round(x * p) / p; };
const fmtEng = (x, unit) => {
  const a = Math.abs(x);
  if (a >= 1e6) return round(x / 1e6, 2) + " M" + unit;
  if (a >= 1e3) return round(x / 1e3, 2) + " k" + unit;
  return round(x, 2) + " " + unit;
};

/* ---------- axes helper for waveform plots ---------- */
function drawAxes(ctx, W, H, pad, C) {
  ctx.strokeStyle = C.hair; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, H - pad); ctx.lineTo(W - pad * 0.4, H - pad); // x
  ctx.moveTo(pad, H - pad); ctx.lineTo(pad, pad * 0.6);         // y
  ctx.stroke();
}

/* ============================================================
   H1 · Ohm's law   —  V = I · R
   ============================================================ */
function OhmViz() {
  const [V, setV] = React.useState(5);
  const [R, setR] = React.useState(220);
  const I = V / R;            // amps
  const P = V * I;            // watts
  const t = useT ? useT() : ((k) => k);
  const draw = (ctx, W, H) => {
    const C = COLORS();
    // water-pipe metaphor: pressure (V) pushes flow (I) through a narrowing (R)
    const y = H / 2;
    const pipeH = Math.max(6, 44 - Math.log10(R) * 8); // narrower pipe = more R
    ctx.fillStyle = C.surface;
    ctx.fillRect(40, y - 24, W - 80, 48);
    ctx.strokeStyle = C.hair; ctx.strokeRect(40, y - 24, W - 80, 48);
    // flow band, thickness ∝ current
    const flowH = Math.max(3, Math.min(46, I * 900));
    ctx.fillStyle = C.accent;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(40, y - flowH / 2, W - 80, flowH);
    ctx.globalAlpha = 1;
    // the resistor "narrowing"
    ctx.fillStyle = C.primary;
    ctx.fillRect(W / 2 - 16, y - 24, 32, (48 - pipeH) / 2);
    ctx.fillRect(W / 2 - 16, y + pipeH / 2 + (24 - pipeH / 2 - (48 - pipeH) / 2), 32, (48 - pipeH) / 2);
    ctx.fillRect(W / 2 - 16, y - pipeH / 2, 32, pipeH);
    // labels
    ctx.fillStyle = C.ink; ctx.font = "12px 'JetBrains Mono', monospace";
    ctx.fillText("V = " + V + " V  (pressure)", 44, 26);
    ctx.textAlign = "right"; ctx.fillText("R = " + fmtEng(R, "Ω")+"  (narrowing)", W - 44, 26);
    ctx.textAlign = "left";
    ctx.fillStyle = C.accent;
    ctx.fillText("I = " + fmtEng(I, "A") + "  (flow)", 44, H - 16);
  };
  return (
    <div>
      <Canvas draw={draw} height={200} />
      <div className="viz-ctrl">
        <Slider label="V" min={1} max={12} step={0.5} value={V} onChange={setV} unit=" V" />
        <Slider label="R" min={10} max={10000} step={10} value={R} onChange={setR} fmt={(v) => fmtEng(v, "Ω")} />
      </div>
      <div className="viz-readout">
        I = V / R = {V} / {R} = <b>{fmtEng(I, "A")}</b> = <b>{round(I * 1000, 1)} mA</b>　·　P = V·I = <b>{round(P, 3)} W</b>
      </div>
    </div>
  );
}

/* ============================================================
   H1 · LED + current-limiting resistor
   ============================================================ */
function LedCircuitViz() {
  const [Vs, setVs] = React.useState(5);
  const [R, setR] = React.useState(220);
  const Vf = 2.0;               // typical red LED
  const I = Math.max(0, (Vs - Vf)) / R;   // amps
  const mA = I * 1000;
  const status = mA > 30 ? "over" : mA < 2 ? "dim" : "ok";
  const draw = (ctx, W, H) => {
    const C = COLORS();
    const y = H / 2;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.lineJoin = "round";
    // battery (left)
    ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(50, y - 40); ctx.lineTo(120, y - 40); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillText(Vs + "V", 52, y - 46);
    // resistor (top) — zigzag
    ctx.beginPath();
    let x = 120; const zw = 10;
    ctx.moveTo(x, y - 40);
    for (let i = 0; i < 6; i++) { x += zw; ctx.lineTo(x, y - 40 + (i % 2 ? 12 : -12)); }
    ctx.lineTo(x + 12, y - 40); ctx.lineTo(W - 90, y - 40);
    ctx.stroke();
    ctx.fillText(fmtEng(R, "Ω"), 150, y - 52);
    // LED (right side going down) — triangle + bar
    const lx = W - 90;
    ctx.beginPath(); ctx.moveTo(lx, y - 40); ctx.lineTo(lx, y - 8); ctx.stroke();
    const glow = status === "over" ? 1 : Math.min(1, mA / 20);
    ctx.fillStyle = status === "over" ? "#c0392b" : C.accent;
    ctx.globalAlpha = 0.25 + 0.75 * glow;
    ctx.beginPath(); ctx.moveTo(lx - 12, y - 8); ctx.lineTo(lx + 12, y - 8); ctx.lineTo(lx, y + 12); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(lx - 12, y + 12); ctx.lineTo(lx + 12, y + 12); ctx.stroke();
    // wires back to battery negative
    ctx.beginPath(); ctx.moveTo(lx, y + 12); ctx.lineTo(lx, y + 40); ctx.lineTo(50, y + 40); ctx.lineTo(50, y); ctx.stroke();
    // glow halo
    if (status !== "dim") {
      ctx.fillStyle = status === "over" ? "#c0392b" : C.accent;
      ctx.globalAlpha = 0.15 * glow;
      ctx.beginPath(); ctx.arc(lx, y + 2, 26, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  };
  const label = { over: "⚠ 电流过大 / over-current", dim: "偏暗 / dim", ok: "正常 / healthy" }[status];
  return (
    <div>
      <Canvas draw={draw} height={200} />
      <div className="viz-ctrl">
        <Slider label="Vs" min={3} max={12} step={0.5} value={Vs} onChange={setVs} unit=" V" />
        <Slider label="R" min={47} max={2200} step={1} value={R} onChange={setR} fmt={(v) => fmtEng(v, "Ω")} />
        <span>Vf = {Vf} V (red LED)</span>
      </div>
      <div className="viz-readout">
        I = (Vs − Vf) / R = ({Vs} − {Vf}) / {R} = <b>{round(mA, 1)} mA</b>　→
        <b style={{ color: status === "over" ? "#c0392b" : "var(--accent)" }}>{label}</b>
      </div>
    </div>
  );
}

/* ============================================================
   H1 · Voltage divider
   ============================================================ */
function DividerViz() {
  const [Vin, setVin] = React.useState(5);
  const [R1, setR1] = React.useState(1000);
  const [R2, setR2] = React.useState(1000);
  const Vout = Vin * R2 / (R1 + R2);
  const draw = (ctx, W, H) => {
    const C = COLORS();
    const cx = 90, top = 24, bot = H - 24, mid = top + (bot - top) * (R1 / (R1 + R2));
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    // rail
    ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, bot); ctx.stroke();
    // R1 block (top) and R2 block (bottom) drawn as bars whose length ∝ resistance share
    ctx.fillStyle = C.primary;
    ctx.fillRect(cx - 14, top + 6, 28, mid - top - 12);
    ctx.fillStyle = C.accent;
    ctx.fillRect(cx - 14, mid + 6, 28, bot - mid - 12);
    ctx.fillStyle = C.bg; ctx.font = "11px 'JetBrains Mono', monospace"; ctx.textAlign = "center";
    ctx.fillText("R1", cx, (top + mid) / 2 + 4);
    ctx.fillText("R2", cx, (mid + bot) / 2 + 4);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink;
    ctx.fillText("Vin = " + Vin + " V", cx + 26, top + 8);
    ctx.fillText("GND", cx + 26, bot);
    // tap
    ctx.strokeStyle = C.accent; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(cx, mid); ctx.lineTo(W - 150, mid); ctx.stroke();
    ctx.setLineDash([]);
    // Vout gauge
    const gx = W - 130, gy = top, gh = bot - top;
    ctx.strokeStyle = C.hair; ctx.strokeRect(gx, gy, 40, gh);
    const fillH = gh * (Vout / Vin || 0);
    ctx.fillStyle = C.accent; ctx.fillRect(gx, gy + gh - fillH, 40, fillH);
    ctx.fillStyle = C.ink; ctx.font = "13px 'JetBrains Mono', monospace";
    ctx.fillText("Vout", gx + 48, gy + gh / 2);
    ctx.fillText("= " + round(Vout, 2) + " V", gx + 48, gy + gh / 2 + 18);
  };
  return (
    <div>
      <Canvas draw={draw} height={220} />
      <div className="viz-ctrl">
        <Slider label="Vin" min={1} max={12} step={0.5} value={Vin} onChange={setVin} unit=" V" />
        <Slider label="R1" min={100} max={10000} step={100} value={R1} onChange={setR1} fmt={(v) => fmtEng(v, "Ω")} />
        <Slider label="R2" min={100} max={10000} step={100} value={R2} onChange={setR2} fmt={(v) => fmtEng(v, "Ω")} />
      </div>
      <div className="viz-readout">
        Vout = Vin · R2/(R1+R2) = {Vin} · {R2}/({R1}+{R2}) = <b>{round(Vout, 2)} V</b>
      </div>
    </div>
  );
}

/* ============================================================
   H1 · RC charging curve
   ============================================================ */
function RcChargeViz() {
  const [R, setR] = React.useState(10000);     // ohms
  const [C_, setC] = React.useState(100);       // microfarads
  const Vs = 5;
  const tau = R * (C_ * 1e-6);                   // seconds
  const draw = (ctx, W, H) => {
    const C = COLORS();
    const pad = 44;
    drawAxes(ctx, W, H, pad, C);
    const plotW = W - pad * 1.4, plotH = H - pad * 1.6;
    const Tmax = tau * 5;
    // curve V(t) = Vs (1 - e^{-t/τ})
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const tt = Tmax * i / 120;
      const v = Vs * (1 - Math.exp(-tt / tau));
      const px = pad + plotW * (i / 120);
      const py = (H - pad) - plotH * (v / Vs);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    // τ marker (63%)
    const pxT = pad + plotW * (1 / 5);
    const pyT = (H - pad) - plotH * 0.632;
    ctx.strokeStyle = C.primary; ctx.setLineDash([4, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pxT, H - pad); ctx.lineTo(pxT, pyT); ctx.lineTo(pad, pyT); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = C.primary; ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillText("τ", pxT - 4, H - pad + 14);
    ctx.fillText("63%", pad + 4, pyT - 4);
    ctx.fillStyle = C.muted;
    ctx.fillText("Vs = 5V", pad + 4, pad * 0.6 + 4);
    ctx.textAlign = "right"; ctx.fillText("t →", W - pad * 0.5, H - pad + 14); ctx.textAlign = "left";
  };
  return (
    <div>
      <Canvas draw={draw} height={240} />
      <div className="viz-ctrl">
        <Slider label="R" min={1000} max={100000} step={1000} value={R} onChange={setR} fmt={(v) => fmtEng(v, "Ω")} />
        <Slider label="C" min={1} max={1000} step={1} value={C_} onChange={setC} unit=" µF" />
      </div>
      <div className="viz-readout">
        τ = R·C = {fmtEng(R, "Ω")} · {C_}µF = <b>{round(tau, 3)} s</b>　·　5τ ≈ <b>{round(tau * 5, 2)} s</b> 充满 / to full
      </div>
    </div>
  );
}

/* ============================================================
   H2 · Digital waveform (animated)
   ============================================================ */
function DigitalWaveViz() {
  const [level, setLevel] = React.useState(1);
  const draw = (ctx, W, H) => {
    const C = COLORS();
    const pad = 40, hi = pad + 8, lo = H - pad - 8;
    drawAxes(ctx, W, H, pad, C);
    // threshold band
    ctx.fillStyle = C.hair; ctx.globalAlpha = 0.5;
    ctx.fillRect(pad, (hi + lo) / 2 - 14, W - pad * 1.4, 28); ctx.globalAlpha = 1;
    ctx.fillStyle = C.muted; ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillText("undefined / 阈值区", pad + 6, (hi + lo) / 2 + 3);
    ctx.fillText("HIGH · 1 · 5V", pad + 6, hi - 2);
    ctx.fillText("LOW · 0 · 0V", pad + 6, lo + 14);
    // a fixed bit pattern, last state = current level
    const bits = [0, 1, 1, 0, 1, 0, 0, level];
    const seg = (W - pad * 1.4) / bits.length;
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath();
    let prevY = bits[0] ? hi : lo; ctx.moveTo(pad, prevY);
    bits.forEach((b, i) => {
      const y = b ? hi : lo, x0 = pad + seg * i, x1 = pad + seg * (i + 1);
      if (y !== prevY) ctx.lineTo(x0, y);
      ctx.lineTo(x1, y); prevY = y;
    });
    ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = "12px 'JetBrains Mono', monospace";
  };
  return (
    <div>
      <Canvas draw={draw} height={210} />
      <div className="viz-ctrl">
        <button className="btn" style={{ padding: "4px 14px" }} onClick={() => setLevel((l) => (l ? 0 : 1))}>
          digitalWrite(pin, {level ? "HIGH" : "LOW"})
        </button>
      </div>
      <div className="viz-readout">
        当前引脚电平 / current pin level: <b>{level ? "HIGH (1, ~5V)" : "LOW (0, 0V)"}</b>　—　点击按钮翻转 / click to toggle
      </div>
    </div>
  );
}

/* ============================================================
   H2 · Pull-up / pull-down + button
   ============================================================ */
function PullupViz() {
  const [mode, setMode] = React.useState("up");   // "up" | "down"
  const [pressed, setPressed] = React.useState(false);
  // pull-up: idle HIGH, pressed LOW.  pull-down: idle LOW, pressed HIGH.
  const reads = mode === "up" ? (pressed ? 0 : 1) : (pressed ? 1 : 0);
  const draw = (ctx, W, H) => {
    const C = COLORS();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    const cx = W / 2, top = 26, bot = H - 26, midY = H / 2;
    // top rail = Vcc, bottom rail = GND
    ctx.fillStyle = C.muted; ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillText("Vcc (5V)", 20, top + 4);
    ctx.fillText("GND", 20, bot + 4);
    ctx.beginPath(); ctx.moveTo(60, top); ctx.lineTo(W - 60, top); ctx.moveTo(60, bot); ctx.lineTo(W - 60, bot); ctx.stroke();
    // resistor position depends on mode
    const drawRes = (y0, y1) => {
      ctx.beginPath(); let y = y0; const zh = 8;
      ctx.moveTo(cx, y);
      for (let i = 0; i < 6; i++) { y += (y1 - y0) / 6; ctx.lineTo(cx + (i % 2 ? 9 : -9), y); }
      ctx.lineTo(cx, y1); ctx.stroke();
    };
    if (mode === "up") { drawRes(top, midY - 30); ctx.beginPath(); ctx.moveTo(cx, midY - 30); ctx.lineTo(cx, midY); ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(cx, midY); ctx.lineTo(cx, midY + 30); ctx.stroke(); drawRes(midY + 30, bot); }
    // pin tap to the right
    ctx.strokeStyle = C.accent; ctx.beginPath(); ctx.moveTo(cx, midY); ctx.lineTo(W - 70, midY); ctx.stroke();
    ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(W - 70, midY, 4, 0, 7); ctx.fill();
    ctx.fillStyle = C.ink; ctx.fillText("digital pin", W - 130, midY - 8);
    // button connects pin node to the opposite rail
    ctx.strokeStyle = pressed ? C.accent : C.hair; ctx.lineWidth = pressed ? 3 : 2;
    const by = mode === "up" ? bot : top;
    ctx.beginPath(); ctx.moveTo(cx, midY); ctx.lineTo(cx - 40, midY);
    if (pressed) ctx.lineTo(cx - 40, by); else { ctx.lineTo(cx - 40, midY + (mode === "up" ? 26 : -26)); }
    ctx.stroke();
    ctx.fillStyle = C.muted; ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillText(pressed ? "button ↓ pressed" : "button ↑ open", cx - 90, midY + (mode === "up" ? 40 : -30));
  };
  return (
    <div>
      <Canvas draw={draw} height={230} />
      <div className="viz-ctrl">
        <button className="btn" style={{ padding: "4px 12px" }} onClick={() => setMode((m) => (m === "up" ? "down" : "up"))}>
          模式 / mode: {mode === "up" ? "pull-up (INPUT_PULLUP)" : "pull-down"}
        </button>
        <button className="btn" style={{ padding: "4px 12px" }} onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)}
          onTouchStart={() => setPressed(true)} onTouchEnd={() => setPressed(false)}>
          按住按钮 / hold button
        </button>
      </div>
      <div className="viz-readout">
        digitalRead(pin) = <b>{reads ? "HIGH (1)" : "LOW (0)"}</b>　—
        {mode === "up" ? "上拉:空闲为高,按下拉低" : "下拉:空闲为低,按下拉高"}
      </div>
    </div>
  );
}

/* ============================================================
   H2 · PWM duty cycle
   ============================================================ */
function PwmViz() {
  const [duty, setDuty] = React.useState(128);   // 0..255
  const frac = duty / 255;
  const avg = frac * 5;
  const draw = (ctx, W, H) => {
    const C = COLORS();
    const pad = 40, hi = pad + 6, lo = H - pad - 6;
    drawAxes(ctx, W, H, pad, C);
    const plotW = W - pad * 1.4, cycles = 4, cw = plotW / cycles;
    // square wave
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath();
    ctx.moveTo(pad, lo);
    for (let c = 0; c < cycles; c++) {
      const x0 = pad + cw * c, xh = x0 + cw * frac;
      ctx.lineTo(x0, hi); ctx.lineTo(xh, hi); ctx.lineTo(xh, lo); ctx.lineTo(x0 + cw, lo);
    }
    ctx.stroke();
    // average line
    const ay = lo - (lo - hi) * frac;
    ctx.strokeStyle = C.primary; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(pad, ay); ctx.lineTo(W - pad * 0.5, ay); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.primary; ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillText("avg " + round(avg, 2) + "V", W - 96, ay - 5);
    // LED brightness swatch
    ctx.fillStyle = C.accent; ctx.globalAlpha = 0.15 + 0.85 * frac;
    ctx.beginPath(); ctx.arc(W - pad, pad + 6, 12, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  };
  return (
    <div>
      <Canvas draw={draw} height={220} />
      <div className="viz-ctrl">
        <Slider label="analogWrite" min={0} max={255} step={1} value={duty} onChange={setDuty} />
      </div>
      <div className="viz-readout">
        占空比 / duty = {duty}/255 = <b>{round(frac * 100, 1)}%</b>　→　平均电压 / avg = <b>{round(avg, 2)} V</b>
      </div>
    </div>
  );
}

/* ============================================================
   H2 · ADC quantization
   ============================================================ */
function AdcViz() {
  const [mv, setMv] = React.useState(2500);   // input in millivolts, 0..5000
  const Vref = 5.0, bits = 10, levels = (1 << bits);   // 1024
  const raw = Math.round((mv / 1000) / Vref * (levels - 1));   // 0..1023
  const draw = (ctx, W, H) => {
    const C = COLORS();
    const pad = 40;
    // staircase transfer curve
    drawAxes(ctx, W, H, pad, C);
    const plotW = W - pad * 1.4, plotH = H - pad * 1.6;
    const steps = 16; // draw a coarse staircase for readability
    ctx.strokeStyle = C.hair; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const x = pad + plotW * (i / steps);
      const y = (H - pad) - plotH * (i / steps);
      ctx.lineTo(x, y); ctx.lineTo(pad + plotW * ((i + 1) / steps), y);
    }
    ctx.stroke();
    // ideal line
    ctx.strokeStyle = C.muted; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(pad, H - pad); ctx.lineTo(pad + plotW, H - pad - plotH); ctx.stroke(); ctx.setLineDash([]);
    // current input marker
    const fx = pad + plotW * (mv / 5000);
    const fy = (H - pad) - plotH * (raw / (levels - 1));
    ctx.strokeStyle = C.accent; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(fx, H - pad); ctx.lineTo(fx, fy); ctx.lineTo(pad, fy); ctx.stroke();
    ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(fx, fy, 4, 0, 7); ctx.fill();
    ctx.fillStyle = C.muted; ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillText("Vin →", pad + plotW - 34, H - pad + 14);
    ctx.fillText("raw ↑", pad + 4, pad * 0.6 + 4);
  };
  return (
    <div>
      <Canvas draw={draw} height={230} />
      <div className="viz-ctrl">
        <Slider label="Vin" min={0} max={5000} step={10} value={mv} onChange={setMv} fmt={(v) => round(v / 1000, 2) + " V"} />
        <span>Vref = 5.0 V · 10-bit</span>
      </div>
      <div className="viz-readout">
        analogRead = round(Vin/Vref × 1023) = <b>{raw}</b>　·　还原电压 / back to V = raw/1023×5 = <b>{round(raw / 1023 * 5, 2)} V</b>
      </div>
    </div>
  );
}

/* ============================================================
   H5 · Servo pulse-width → angle
   ============================================================ */
function ServoPwmViz() {
  const [angle, setAngle] = React.useState(90);   // 0..180
  const pulse = 1.0 + (angle / 180) * 1.0;         // 1.0..2.0 ms
  const draw = (ctx, W, H) => {
    const C = COLORS();
    // left: pulse train (20ms period, 1-2ms high)
    const pad = 36, hi = pad, lo = H - pad;
    ctx.strokeStyle = C.hair; ctx.beginPath(); ctx.moveTo(pad, lo); ctx.lineTo(W / 2 - 20, lo); ctx.stroke();
    const period = 20, hw = (W / 2 - 20 - pad); // maps 20ms
    const highW = hw * (pulse / period);
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath();
    ctx.moveTo(pad, lo); ctx.lineTo(pad, hi); ctx.lineTo(pad + highW, hi); ctx.lineTo(pad + highW, lo); ctx.lineTo(W / 2 - 20, lo);
    ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillText(round(pulse, 2) + " ms", pad, hi - 6);
    ctx.fillStyle = C.muted; ctx.fillText("period 20 ms (50 Hz)", pad, lo + 16);
    // right: servo horn
    const ox = W * 0.75, oy = H / 2, r = Math.min(W * 0.18, H * 0.34);
    ctx.strokeStyle = C.hair; ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI * 2); ctx.stroke();
    const a = (-90 + angle - 90) * Math.PI / 180; // 0°→left, 180°→right, sweep across top
    const th = (180 - angle) * Math.PI / 180;      // 0..180 → π..0
    const hx = ox + r * Math.cos(th), hy = oy - r * Math.sin(th);
    ctx.strokeStyle = C.accent; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = C.primary; ctx.beginPath(); ctx.arc(ox, oy, 5, 0, 7); ctx.fill();
    ctx.fillStyle = C.ink; ctx.font = "13px 'JetBrains Mono', monospace"; ctx.textAlign = "center";
    ctx.fillText(angle + "°", ox, oy + r + 18); ctx.textAlign = "left";
  };
  return (
    <div>
      <Canvas draw={draw} height={220} />
      <div className="viz-ctrl">
        <Slider label="servo.write" min={0} max={180} step={1} value={angle} onChange={setAngle} unit="°" />
      </div>
      <div className="viz-readout">
        角度 {angle}° → 脉宽 / pulse = <b>{round(pulse, 2)} ms</b>　(1 ms→0°, 1.5 ms→90°, 2 ms→180°)
      </div>
    </div>
  );
}

/* ============================================================
   H4 · Ultrasonic time-of-flight
   ============================================================ */
function UltrasonicViz() {
  const [dist, setDist] = React.useState(50);   // cm
  const speed = 0.0343;                          // cm per microsecond
  const echoUs = dist * 2 / speed;               // round-trip microseconds
  const draw = (ctx, W, H) => {
    const C = COLORS();
    const y = H / 2, sx = 60, wallX = 60 + (W - 140) * (dist / 200);
    // sensor
    ctx.fillStyle = C.primary; ctx.fillRect(sx - 30, y - 18, 30, 36);
    ctx.fillStyle = C.bg; ctx.font = "10px 'JetBrains Mono', monospace"; ctx.fillText("SR04", sx - 28, y + 3);
    // wall / target
    ctx.fillStyle = C.ink; ctx.fillRect(wallX, y - 40, 8, 80);
    // sound arcs
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.8 - i * 0.22;
      ctx.beginPath(); ctx.arc(sx, y, 18 + i * 16 + (dist % 40) * 0.4, -0.6, 0.6); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // distance bracket
    ctx.strokeStyle = C.muted; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(sx, y + 46); ctx.lineTo(wallX, y + 46); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink; ctx.font = "12px 'JetBrains Mono', monospace"; ctx.textAlign = "center";
    ctx.fillText(dist + " cm", (sx + wallX) / 2, y + 62); ctx.textAlign = "left";
  };
  return (
    <div>
      <Canvas draw={draw} height={200} />
      <div className="viz-ctrl">
        <Slider label="distance" min={2} max={200} step={1} value={dist} onChange={setDist} unit=" cm" />
      </div>
      <div className="viz-readout">
        回声时间 / echo = 2·d / v = <b>{round(echoUs, 0)} µs</b>　·　距离 / distance = echo·0.0343/2 = <b>{dist} cm</b>
      </div>
    </div>
  );
}

/* ============================================================
   H6 · UART frame
   ============================================================ */
function UartFrameViz() {
  const [val, setVal] = React.useState(0x41);   // 'A'
  const bits = []; for (let i = 0; i < 8; i++) bits.push((val >> i) & 1);   // LSB first
  const frame = [{ b: 0, t: "start" }].concat(bits.map((b, i) => ({ b, t: "d" + i }))).concat([{ b: 1, t: "stop" }]);
  const draw = (ctx, W, H) => {
    const C = COLORS();
    const pad = 30, hi = 40, lo = H - 44, seg = (W - pad * 2) / frame.length;
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath();
    let prevY = frame[0].b ? hi : lo; ctx.moveTo(pad, prevY);
    frame.forEach((f, i) => {
      const y = f.b ? hi : lo, x0 = pad + seg * i, x1 = pad + seg * (i + 1);
      if (y !== prevY) ctx.lineTo(x0, y);
      ctx.lineTo(x1, y); prevY = y;
    });
    ctx.stroke();
    ctx.font = "10px 'JetBrains Mono', monospace"; ctx.textAlign = "center";
    frame.forEach((f, i) => {
      const xc = pad + seg * (i + 0.5);
      ctx.fillStyle = f.t === "start" ? C.primary : f.t === "stop" ? C.primary : C.muted;
      ctx.fillText(f.t === "start" ? "S" : f.t === "stop" ? "P" : f.b, xc, lo + 16);
      ctx.strokeStyle = C.hair; ctx.beginPath(); ctx.moveTo(pad + seg * i, hi - 6); ctx.lineTo(pad + seg * i, lo + 6); ctx.stroke();
    });
    ctx.textAlign = "left"; ctx.fillStyle = C.muted;
    ctx.fillText("idle HIGH → start(0) → 8 data (LSB first) → stop(1)", pad, hi - 12);
  };
  const chr = (val >= 32 && val < 127) ? String.fromCharCode(val) : "·";
  return (
    <div>
      <Canvas draw={draw} height={190} />
      <div className="viz-ctrl">
        <Slider label="byte" min={0} max={255} step={1} value={val} onChange={setVal} fmt={(v) => "0x" + v.toString(16).toUpperCase().padStart(2, "0")} />
      </div>
      <div className="viz-readout">
        发送字节 / byte = <b>0x{val.toString(16).toUpperCase().padStart(2, "0")}</b> = {val} = '<b>{chr}</b>'　·　二进制 {val.toString(2).padStart(8, "0")}
      </div>
    </div>
  );
}

/* ============================================================
   H6 · I2C transaction
   ============================================================ */
function I2cFrameViz() {
  const [addr, setAddr] = React.useState(0x3C);   // SSD1306
  const rw = 0;
  const seq = [
    { l: "START", sda: "↓", scl: 1, c: "primary" },
    ...Array.from({ length: 7 }, (_, i) => ({ l: "A" + (6 - i), sda: (addr >> (6 - i)) & 1, scl: 0, c: "muted" })),
    { l: "R/W", sda: rw, scl: 0, c: "muted" },
    { l: "ACK", sda: 0, scl: 0, c: "accent" },
    { l: "STOP", sda: "↑", scl: 1, c: "primary" },
  ];
  const draw = (ctx, W, H) => {
    const C = COLORS();
    const pad = 26, seg = (W - pad * 2) / seq.length;
    const sdaY = 46, sclY = H - 52, hiOff = -14, loOff = 14;
    ctx.font = "10px 'JetBrains Mono', monospace";
    // labels for two lines
    ctx.fillStyle = C.muted; ctx.fillText("SDA", 4, sdaY + 4); ctx.fillText("SCL", 4, sclY + 4);
    // SDA
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2.2; ctx.beginPath();
    seq.forEach((s, i) => {
      const x0 = pad + seg * i, x1 = pad + seg * (i + 1);
      let y = sdaY + (typeof s.sda === "number" ? (s.sda ? hiOff : loOff) : 0);
      ctx.moveTo(x0, y); ctx.lineTo(x1, y);
    });
    ctx.stroke();
    // SCL clock ticks
    ctx.strokeStyle = C.primary; ctx.beginPath();
    seq.forEach((s, i) => {
      const xc = pad + seg * (i + 0.5);
      ctx.moveTo(xc, sclY + loOff); ctx.lineTo(xc, sclY + hiOff);
    });
    ctx.stroke();
    // column labels + separators
    ctx.textAlign = "center";
    seq.forEach((s, i) => {
      const xc = pad + seg * (i + 0.5);
      ctx.fillStyle = s.c === "accent" ? C.accent : s.c === "primary" ? C.primary : C.ink;
      ctx.fillText(s.l, xc, H - 22);
      ctx.fillStyle = C.muted;
      if (typeof s.sda === "number") ctx.fillText(String(s.sda), xc, sdaY - 22);
      ctx.strokeStyle = C.hair; ctx.beginPath(); ctx.moveTo(pad + seg * i, 30); ctx.lineTo(pad + seg * i, H - 34); ctx.stroke();
    });
    ctx.textAlign = "left";
  };
  return (
    <div>
      <Canvas draw={draw} height={200} />
      <div className="viz-ctrl">
        <Slider label="7-bit addr" min={0} max={127} step={1} value={addr} onChange={setAddr} fmt={(v) => "0x" + v.toString(16).toUpperCase().padStart(2, "0")} />
      </div>
      <div className="viz-readout">
        主机寻址 / addressing <b>0x{addr.toString(16).toUpperCase().padStart(2, "0")}</b> + R/W(<b>{rw ? "读" : "写/W"}</b>),从机拉低 SDA 给出 <b>ACK</b>
      </div>
    </div>
  );
}

/* ---------------- registry & dispatch ---------------- */
const VIZ = {
  ohm: () => <OhmViz />,
  ledCircuit: () => <LedCircuitViz />,
  divider: () => <DividerViz />,
  rcCharge: () => <RcChargeViz />,
  digitalWave: () => <DigitalWaveViz />,
  pullup: () => <PullupViz />,
  pwm: () => <PwmViz />,
  adc: () => <AdcViz />,
  servoPwm: () => <ServoPwmViz />,
  ultrasonic: () => <UltrasonicViz />,
  uartFrame: () => <UartFrameViz />,
  i2cFrame: () => <I2cFrameViz />,
};

function Viz({ name }) {
  const names = (Array.isArray(name) ? name : [name]).filter((n) => VIZ[n]);
  if (!names.length) return null;
  return (
    <>
      {names.map((n) => <div className="viz" key={n}>{VIZ[n]()}</div>)}
    </>
  );
}

window.Viz = Viz;
