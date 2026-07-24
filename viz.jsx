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

/* ============================================================
   H7 · Ballistocardiography — heartbeat + breathing in weight
   ============================================================ */
function BcgViz() {
  const [hr, setHr] = React.useState(72);    // beats per minute
  const [rr, setRr] = React.useState(15);    // breaths per minute
  const draw = (ctx, W, H) => {
    const C = COLORS();
    const pad = 40;
    drawAxes(ctx, W, H, pad, C);
    const plotW = W - pad * 1.4, plotH = H - pad * 1.6, midY = H - pad - plotH / 2;
    const seconds = 10, N = 600;
    // respiration: slow sine; heartbeat: periodic sharp pulses; small noise
    const beatT = 60 / hr, respT = 60 / rr;
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const tt = seconds * i / N;
      const resp = Math.sin((tt / respT) * 2 * Math.PI);            // ±1 slow
      // heartbeat: a decaying pulse each beat period
      const phase = (tt % beatT) / beatT;
      const beat = Math.exp(-Math.pow((phase - 0.12) * 6, 2)) * 0.9
                 - Math.exp(-Math.pow((phase - 0.22) * 7, 2)) * 0.45;
      const noise = (Math.sin(tt * 53.1) + Math.sin(tt * 91.7)) * 0.02;
      pts.push(resp * 0.55 + beat * 0.5 + noise);
    }
    // draw composite
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.beginPath();
    pts.forEach((v, i) => {
      const px = pad + plotW * (i / N);
      const py = midY - (plotH / 2) * v;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.stroke();
    // mark detected beats
    ctx.fillStyle = C.primary;
    for (let tb = beatT * 0.12; tb < seconds; tb += beatT) {
      const px = pad + plotW * (tb / seconds);
      ctx.beginPath(); ctx.arc(px, pad * 0.7, 3, 0, 7); ctx.fill();
    }
    ctx.fillStyle = C.muted; ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillText("● 检测到的心跳 / detected beats", pad + 12, pad * 0.7 + 4);
    ctx.fillText("慢波=呼吸 / slow wave = breathing", pad + 4, H - pad + 14);
    ctx.textAlign = "right"; ctx.fillText("10 s →", W - pad * 0.5, H - pad + 14); ctx.textAlign = "left";
  };
  return (
    <div>
      <Canvas draw={draw} height={230} />
      <div className="viz-ctrl">
        <Slider label="心率 HR" min={40} max={120} step={1} value={hr} onChange={setHr} unit=" bpm" />
        <Slider label="呼吸 RR" min={8} max={30} step={1} value={rr} onChange={setRr} unit=" /min" />
      </div>
      <div className="viz-readout">
        床脚称重信号 = 呼吸慢波 + 心跳脉冲。心率 <b>{hr} bpm</b>、呼吸 <b>{rr} /min</b> —
        BCG 就是从体重的 <b>&lt;1%</b> 起伏里把这两者分离出来。
      </div>
    </div>
  );
}

/* ============================================================
   H7 · Pressure map — posture / turning / bed-exit
   ============================================================ */
function PressureMapViz() {
  const [posture, setPosture] = React.useState(0);   // -100 left .. 0 supine .. +100 right
  const [present, setPresent] = React.useState(true);
  const cols = 12, rows = 6;
  const draw = (ctx, W, H) => {
    const C = COLORS();
    const pad = 16, gw = (W - pad * 2) / cols, gh = (H - pad * 2) / rows;
    // body center shifts with posture; two "shoulders/hips" pressure blobs
    const cx = cols / 2 + (posture / 100) * (cols * 0.28);
    const blobs = present ? [
      { x: cx, y: rows * 0.32, s: 2.1 },   // shoulders
      { x: cx, y: rows * 0.68, s: 2.4 },   // hips (highest pressure)
    ] : [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let p = 0;
        blobs.forEach((b) => {
          const d2 = Math.pow(c + 0.5 - b.x, 2) + Math.pow(r + 0.5 - b.y, 2);
          p += Math.exp(-d2 / b.s);
        });
        p = Math.min(1, p);
        const x = pad + c * gw, y = pad + r * gh;
        // background cell
        ctx.fillStyle = C.surface; ctx.fillRect(x + 1, y + 1, gw - 2, gh - 2);
        if (p > 0.04) {
          ctx.globalAlpha = 0.15 + 0.85 * p;
          ctx.fillStyle = p > 0.75 ? "#c0392b" : C.accent;
          ctx.fillRect(x + 1, y + 1, gw - 2, gh - 2);
          ctx.globalAlpha = 1;
        }
      }
    }
    // frame
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(pad, pad, cols * gw, rows * gh);
  };
  const label = !present ? "离床 / bed-exit ⚠"
    : posture < -30 ? "左侧卧 / left-lying"
    : posture > 30 ? "右侧卧 / right-lying"
    : "仰卧 / supine";
  const risk = present && Math.abs(posture) < 30 ? "长时间仰卧 → 需提醒翻身 / prompt a turn" : "压力分散良好 / pressure well spread";
  return (
    <div>
      <Canvas draw={draw} height={200} />
      <div className="viz-ctrl">
        <Slider label="体位 posture" min={-100} max={100} step={1} value={posture} onChange={setPosture} fmt={(v) => v < -30 ? "左 L" : v > 30 ? "右 R" : "仰 ─"} />
        <button className="btn" style={{ padding: "4px 12px" }} onClick={() => setPresent((p) => !p)}>
          {present ? "模拟离床 / simulate exit" : "回到床上 / back in bed"}
        </button>
      </div>
      <div className="viz-readout">
        判定 / state: <b>{label}</b>　·　<b style={{ color: !present ? "#c0392b" : "var(--accent)" }}>{risk}</b>
      </div>
    </div>
  );
}

/* ============================================================
   H8 · Emulation power — SoC tier vs console generation
   ============================================================ */
function EmuPowerViz() {
  const [tier, setTier] = React.useState(0);   // 0 entry, 1 mid, 2 high
  const TIERS = [
    { label: "入门 RK3326 (R36S)", cap: 2.6 },
    { label: "中端 RK3566/H700", cap: 3.7 },
    { label: "高端 RK3588/骁龙", cap: 6.2 },
  ];
  const SYS = [
    { n: "NES / SNES / GB", d: 1.0 },
    { n: "Genesis / GBA", d: 1.6 },
    { n: "PS1", d: 2.3 },
    { n: "Nintendo 64", d: 3.0 },
    { n: "Dreamcast", d: 3.2 },
    { n: "PSP", d: 3.5 },
    { n: "Nintendo DS", d: 3.6 },
    { n: "Saturn", d: 4.2 },
    { n: "PlayStation 2", d: 5.2 },
    { n: "GameCube / Wii", d: 5.8 },
    { n: "Switch", d: 7.2 },
  ];
  const cap = TIERS[tier].cap;
  const verdict = (m) => m >= 1.2 ? { t: "流畅 great", c: "primary" }
    : m >= 0.1 ? { t: "可玩 playable", c: "accent" }
    : m >= -0.9 ? { t: "吃力 struggles", c: "warn" }
    : { t: "不行 no", c: "no" };
  const draw = (ctx, W, H) => {
    const C = COLORS();
    const padL = 8, rowH = (H - 8) / SYS.length;
    ctx.font = "11px 'JetBrains Mono', monospace";
    SYS.forEach((s, i) => {
      const y = 4 + i * rowH, m = cap - s.d, v = verdict(m);
      const col = v.c === "primary" ? C.primary : v.c === "accent" ? C.accent : v.c === "warn" ? "#b56b00" : "#c0392b";
      // row background
      ctx.fillStyle = C.surface; ctx.globalAlpha = i % 2 ? 0.5 : 0; ctx.fillRect(padL, y, W - padL * 2, rowH - 3); ctx.globalAlpha = 1;
      // status pill
      ctx.fillStyle = col; ctx.globalAlpha = 0.16; ctx.fillRect(W - 118, y + rowH / 2 - 10, 108, 20); ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(padL + 8, y + rowH / 2, 4, 0, 7); ctx.fill();
      // system name
      ctx.fillStyle = C.ink; ctx.textAlign = "left";
      ctx.fillText(s.n, padL + 22, y + rowH / 2 + 4);
      // verdict text
      ctx.fillStyle = col; ctx.textAlign = "right";
      ctx.fillText(v.t, W - 16, y + rowH / 2 + 4);
    });
    ctx.textAlign = "left";
  };
  return (
    <div>
      <Canvas draw={draw} height={300} />
      <div className="viz-ctrl">
        <Slider label="SoC 档次 / tier" min={0} max={2} step={1} value={tier} onChange={setTier} fmt={() => TIERS[tier].label} />
      </div>
      <div className="viz-readout">
        以 <b>{TIERS[tier].label}</b> 为例:绿=流畅、橙=可玩、黄=吃力、红=跑不动。
        R36S 属入门档,<b>PS1 及更早</b>基本流畅,N64/PSP/DS 视游戏而定,PS2 及以上超出能力。
      </div>
    </div>
  );
}

/* ============================================================
   H8 · Interactive 3D model of the handheld (glTF via model-viewer)
   ============================================================ */
function ConsoleModelViz() {
  const lang = (typeof useLang === "function") ? useLang() : "zh";
  const base = "assets/handheld/";
  const L = (zh, en) => (lang === "en" ? en : zh);
  return (
    <div className="model3d">
      <model-viewer
        src={base + "handheld_console.glb"}
        alt={L("掌上游戏机 3D 模型", "Handheld game console 3D model")}
        loading="eager"
        reveal="auto"
        camera-controls=""
        auto-rotate=""
        rotation-per-second="20deg"
        interaction-prompt="none"
        touch-action="pan-y"
        shadow-intensity="1"
        exposure="1.05"
        camera-orbit="30deg 72deg 110%"
        style={{ width: "100%", height: "380px", display: "block" }}
      >
        <img slot="poster" src={base + "renders/iso.png"} alt=""
          style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </model-viewer>
      <div className="model3d-bar">
        <span className="m3-hint">◍ {L("拖动旋转 · 滚轮缩放 · R36S 示意模型", "Drag to rotate · scroll to zoom · R36S (illustrative model)")}</span>
        <span className="m3-dl">
          <span className="m3-dl-lbl">{L("下载 CAD", "Download CAD")}</span>
          <a href={base + "handheld_console.step"} download>STEP</a>
          <a href={base + "handheld_console.stl"} download>STL</a>
          <a href={base + "handheld_console.3mf"} download>3MF</a>
          <a href={base + "handheld_console.glb"} download>GLB</a>
          <a href={base + "handheld_console.py"} download>PY</a>
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   H7 · Smart Care Bed — interactive 3D system topology
   ------------------------------------------------------------
   A dependency-free canvas 3D projection you can orbit with the
   mouse. Shows every device, the hardware behind it, the software
   that runs on it, and the color-coded buses / links that wire
   them together (devices · hardware · software · network).
   ============================================================ */

// Bus / link types — the "network connection methods".
const CB_LINKS = {
  analog: { zh: "模拟信号", en: "Analog", c: "#b0842e", dash: [] },
  serial: { zh: "串行数字", en: "Serial digital", c: "#0e8a8a", dash: [] },
  i2c:    { zh: "I²C 总线", en: "I²C bus", c: "#2f6db0", dash: [] },
  usb:    { zh: "USB / UART", en: "USB / UART", c: "#7a5cff", dash: [] },
  dsi:    { zh: "DSI 显示", en: "DSI display", c: "#8a7d6a", dash: [] },
  wifi:   { zh: "Wi-Fi / 以太网", en: "Wi-Fi / Ethernet", c: "#2d8a4e", dash: [6, 5] },
  can:    { zh: "CAN 床间总线", en: "CAN inter-bed", c: "#b0308a", dash: [10, 6] },
  power:  { zh: "隔离供电", en: "Isolated power", c: "#c0392b", dash: [2, 5] },
};

// Node categories → box color.
const CB_CAT = {
  sensor:     "#e8703a",
  frontend:   "#0e8a8a",
  mcu:        "#7a5cff",
  controller: "#2f6db0",
  ui:         "#c65d21",
  network:    "#2d8a4e",
  power:      "#c0392b",
};

// Devices placed in 3D world space  (x = bed length, y = up, z = width).
const CB_NODES = [
  { id: "lc1", p: [-3.6, -0.5, -1.7], cat: "sensor", code: "LC1", zh: "称重传感器", en: "Load cell", leg: true,
    catZh: "传感器", catEn: "Sensor", link: "analog",
    hwZh: "50 kg 半桥 ×4(合成全桥),每床脚一个", hwEn: "50 kg half-bridge ×4 (one per bed leg)",
    swZh: null, swEn: null,
    netZh: "模拟毫伏差分 → HX711", netEn: "Analog mV differential → HX711",
    roleZh: "从床脚重量的 <1% 起伏里听呼吸与心跳(BCG)", roleEn: "Hears breathing & heartbeat from <1% weight ripple (BCG)" },
  { id: "lc2", p: [ 3.6, -0.5, -1.7], cat: "sensor", code: "LC2", alias: "lc1" },
  { id: "lc3", p: [ 3.6, -0.5,  1.7], cat: "sensor", code: "LC3", alias: "lc1" },
  { id: "lc4", p: [-3.6, -0.5,  1.7], cat: "sensor", code: "LC4", alias: "lc1" },
  { id: "hx",  p: [ 4.6, -0.4,  0.9], cat: "frontend", code: "HX711", zh: "24 位 ADC", en: "24-bit ADC",
    catZh: "模拟前端", catEn: "Analog front-end", link: "serial",
    hwZh: "HX711(入门)/ ADS1232(低噪 BCG)", hwEn: "HX711 (starter) / ADS1232 (low-noise BCG)",
    netZh: "两线串行(DOUT/SCK)→ ESP32", netEn: "2-wire serial (DOUT/SCK) → ESP32",
    roleZh: "把 4 路称重桥放大并数字化", roleEn: "Amplifies & digitizes the four load-cell bridges" },
  { id: "fsr", p: [ 1.0,  0.12,-0.2], cat: "sensor", code: "FSR", zh: "压力阵列", en: "Pressure array",
    catZh: "传感器", catEn: "Sensor", link: "analog",
    hwZh: "FSR 402/406 网格 或 Velostat + 铜箔", hwEn: "FSR 402/406 grid or Velostat + copper foil",
    netZh: "行/列模拟电压 → 多路复用器", netEn: "Row/col analog voltage → MUX",
    roleZh: "画出体压分布:体位、翻身、离床", roleEn: "Maps body pressure: posture, turning, bed-exit" },
  { id: "mux", p: [-4.4, -0.35, 1.3], cat: "frontend", code: "MUX", zh: "16 通道复用", en: "16-ch MUX",
    catZh: "模拟前端", catEn: "Analog front-end", link: "serial",
    hwZh: "CD74HC4067 ×N", hwEn: "CD74HC4067 ×N",
    netZh: "地址线扫描 → ESP32 ADC", netEn: "Address-scanned → ESP32 ADC",
    roleZh: "逐点扫描 FSR 网格的每个交点", roleEn: "Scans every crossing of the FSR grid" },
  { id: "imu", p: [-1.1,  0.28, 0.8], cat: "sensor", code: "IMU", zh: "惯性测量", en: "IMU",
    catZh: "传感器", catEn: "Sensor", link: "i2c",
    hwZh: "MPU-6050(经济)/ BNO055(自带姿态融合)", hwEn: "MPU-6050 (cheap) / BNO055 (fused)",
    netZh: "I²C 挂在共享两线总线", netEn: "I²C on the shared two-wire bus",
    roleZh: "床架倾角与振动 → 辅助判断翻身", roleEn: "Frame tilt & vibration → aids turn detection" },
  { id: "sht", p: [-2.7,  0.16,-0.7], cat: "sensor", code: "SHT40", zh: "温湿 / 尿湿", en: "Temp / wet",
    catZh: "传感器", catEn: "Sensor", link: "i2c",
    hwZh: "SHT31/40 + 叉指电容湿度电极", hwEn: "SHT31/40 + interdigital moisture electrode",
    netZh: "I²C(与 IMU 共总线)", netEn: "I²C (shares bus with IMU)",
    roleZh: "确认是真尿湿而非误报", roleEn: "Confirms real bed-wetting, not a false trigger" },
  { id: "esp", p: [ 2.9,  0.95, 3.2], cat: "mcu", code: "ESP32", zh: "传感器节点 MCU", en: "Sensor node MCU",
    catZh: "微控制器", catEn: "Microcontroller", link: "usb",
    hwZh: "ESP32-DevKitC 或 STM32 Nucleo", hwEn: "ESP32-DevKitC or STM32 Nucleo",
    swZh: ["实时采样 (RTOS)", "滤波 / 打包", "Wi-Fi / BLE"], swEn: ["Real-time sampling", "Filter / packetize", "Wi-Fi / BLE"],
    netZh: "USB / UART 上行到 Pi;内置 Wi-Fi/BLE", netEn: "USB / UART up to the Pi; on-board Wi-Fi/BLE",
    roleZh: "硬实时采集所有传感器,先做边缘滤波", roleEn: "Hard-real-time captures every sensor, filters at the edge" },
  { id: "pi",  p: [ 6.2,  1.9,  1.3], cat: "controller", code: "Pi 5", zh: "主控计算机", en: "Main controller",
    catZh: "单板计算机", catEn: "Single-board computer", link: null,
    hwZh: "树莓派 5(4–8 GB)+ microSD", hwEn: "Raspberry Pi 5 (4–8 GB) + microSD",
    swZh: ["传感器融合", "边缘机器学习", "本地 UI", "网络服务"], swEn: ["Sensor fusion", "Edge ML", "Local UI", "Network service"],
    netZh: "汇聚节点;上行 Wi-Fi/以太网", netEn: "Aggregator; uplinks over Wi-Fi/Ethernet",
    roleZh: "融合、判读、报警,并对外通信", roleEn: "Fuses, infers, alerts, and talks to the world" },
  { id: "scr", p: [ 6.5,  2.8, -1.6], cat: "ui", code: '7" LCD', zh: "床旁触摸屏", en: "Bedside touchscreen",
    catZh: "人机界面", catEn: "User interface", link: "dsi",
    hwZh: "7 英寸树莓派触摸屏", hwEn: '7" Raspberry Pi touch display',
    netZh: "DSI 排线直连 Pi", netEn: "DSI ribbon straight to the Pi",
    roleZh: "护理人员就地查看波形与状态", roleEn: "Bedside view of waveforms & status" },
  { id: "net", p: [ 2.6,  4.7, -4.5], cat: "network", code: "NET", zh: "护士站 / 云", en: "Nurse station / cloud",
    catZh: "上行网络", catEn: "Uplink network", link: "wifi",
    hwZh: "以太网 / Wi-Fi 主干", hwEn: "Ethernet / Wi-Fi backbone",
    swZh: ["集中看板", "报警推送", "长期记录"], swEn: ["Central dashboard", "Alert push", "Long-term log"],
    netZh: "Wi-Fi / 以太网上行", netEn: "Wi-Fi / Ethernet uplink",
    roleZh: "多床集中监护与留档", roleEn: "Central multi-bed monitoring & records" },
  { id: "bed2", p: [-5.9,  0.4,  3.7], cat: "controller", code: "Bed #2", zh: "邻床节点", en: "Neighbor bed",
    catZh: "邻床节点", catEn: "Neighbor node", link: "can", faint: true,
    hwZh: "同款床节点", hwEn: "Identical bed node",
    netZh: "CAN 总线串联多床", netEn: "CAN bus chains multiple beds",
    roleZh: "工业级 CAN 主干把病房里的床连起来", roleEn: "An industrial CAN spine links beds across the ward" },
  { id: "pwr", p: [-6.1,  1.7, -2.9], cat: "power", code: "PWR", zh: "隔离电源", en: "Isolated power",
    catZh: "供电 / 安全", catEn: "Power / safety", link: "power",
    hwZh: "原型 5V/12V;产品级 IEC 60601-1 医疗电源", hwEn: "Prototype 5V/12V; product-grade IEC 60601-1 PSU",
    netZh: "隔离 DC-DC + 数字隔离器护患安全", netEn: "Isolated DC-DC + digital isolators for patient safety",
    roleZh: "把市电与患者电气隔离开", roleEn: "Keeps mains electrically isolated from the patient" },
];

const CB_EDGES = [
  ["lc1", "hx", "analog"], ["lc2", "hx", "analog"], ["lc3", "hx", "analog"], ["lc4", "hx", "analog"],
  ["fsr", "mux", "analog"], ["mux", "esp", "serial"], ["hx", "esp", "serial"],
  ["imu", "esp", "i2c"], ["sht", "esp", "i2c"],
  ["esp", "pi", "usb"], ["pi", "scr", "dsi"], ["pi", "net", "wifi"], ["pi", "bed2", "can"],
  ["pwr", "pi", "power"], ["pwr", "esp", "power"],
];

function CareBedTopologyViz() {
  const lang = (typeof useLang === "function") ? useLang() : "zh";
  const L = (zh, en) => (lang === "en" ? en : zh);
  const canvasRef = React.useRef(null);
  const cam = React.useRef({ yaw: -0.72, pitch: 0.46 });
  const drag = React.useRef(null);
  const [auto, setAuto] = React.useState(true);
  const [filter, setFilter] = React.useState(null);   // link type to isolate, or null = all
  const [sel, setSel] = React.useState("pi");          // selected node id
  const st = React.useRef({ auto, filter, sel, hover: null });
  React.useEffect(() => { st.current.auto = auto; st.current.filter = filter; st.current.sel = sel; }, [auto, filter, sel]);

  const nodeById = (id) => CB_NODES.find((n) => n.id === id);
  const info = (n) => (n && n.alias ? nodeById(n.alias) : n);

  // ---- 3D → 2D projection ----
  const project = (p, W, H) => {
    const c = cam.current, D = 24, S = Math.min(W, H) / 12.5;
    const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw);
    const x1 = p[0] * cy + p[2] * sy;
    const z1 = -p[0] * sy + p[2] * cy;
    const cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
    const y2 = p[1] * cp - z1 * sp;
    const z2 = p[1] * sp + z1 * cp;
    const f = D / (D - z2);
    return { x: W / 2 + x1 * S * f, y: H * 0.6 - y2 * S * f, depth: z2, f };
  };

  const drawRef = React.useRef(() => {});
  React.useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const roundRect = (ctx, x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    };

    const render = (ts) => {
      const s = st.current;
      const C = COLORS();
      const dpr = window.devicePixelRatio || 1;
      const W = Math.max(300, cv.clientWidth || 600), H = 440;
      if (cv.width !== W * dpr || cv.height !== H * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
      const ctx = cv.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // --- bed slab (surface quad + 4 legs) ---
      const corners = [[-4, 0, -2], [4, 0, -2], [4, 0, 2], [-4, 0, 2]].map((p) => project(p, W, H));
      const legs = [[-3.6, -2.2, -1.7], [3.6, -2.2, -1.7], [3.6, -2.2, 1.7], [-3.6, -2.2, 1.7]];
      const legTops = [[-3.6, 0, -1.7], [3.6, 0, -1.7], [3.6, 0, 1.7], [-3.6, 0, 1.7]];
      ctx.strokeStyle = C.hair; ctx.lineWidth = 2;
      legs.forEach((lp, i) => {
        const a = project(legTops[i], W, H), b = project(lp, W, H);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      ctx.beginPath(); corners.forEach((c2, i) => i ? ctx.lineTo(c2.x, c2.y) : ctx.moveTo(c2.x, c2.y)); ctx.closePath();
      ctx.fillStyle = C.surface; ctx.globalAlpha = 0.55; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.stroke();

      // --- FSR pressure grid drawn on the surface ---
      ctx.strokeStyle = CB_LINKS.analog.c; ctx.globalAlpha = (!s.filter || s.filter === "analog") ? 0.5 : 0.12; ctx.lineWidth = 1;
      for (let gx = -3; gx <= 3; gx++) {
        const a = project([gx, 0.02, -1.4], W, H), b = project([gx, 0.02, 1.4], W, H);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      for (let gz = -1; gz <= 1; gz++) {
        const a = project([-3, 0.02, gz * 1.4], W, H), b = project([3, 0.02, gz * 1.4], W, H);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // --- edges (buses / links) ---
      CB_EDGES.forEach(([aId, bId, type]) => {
        const a = project(nodeById(aId).p, W, H), b = project(nodeById(bId).p, W, H);
        const link = CB_LINKS[type];
        const active = !s.filter || s.filter === type;
        const touchesSel = s.sel && (aId === s.sel || bId === s.sel || info(nodeById(aId)).id === s.sel || info(nodeById(bId)).id === s.sel);
        ctx.strokeStyle = link.c;
        ctx.globalAlpha = active ? (touchesSel ? 1 : 0.85) : 0.1;
        ctx.lineWidth = touchesSel && active ? 3 : 1.8;
        ctx.setLineDash(link.dash.length ? link.dash : []);
        ctx.lineDashOffset = link.dash.length ? -(ts / 45) % 1000 : 0;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      ctx.setLineDash([]); ctx.globalAlpha = 1;

      // --- nodes, painter-sorted far → near ---
      const drawn = CB_NODES.map((n) => ({ n, pr: project(n.p, W, H) })).sort((u, v) => u.pr.depth - v.pr.depth);
      drawn.forEach(({ n, pr }) => {
        const meta = info(n);
        const col = CB_CAT[n.cat];
        const isSel = s.sel === n.id || (n.alias && s.sel === n.alias);
        const dim = s.filter && meta.link !== s.filter;
        const isLeg = !!(n.alias || n.leg);
        const w = (isLeg ? 30 : 62) * Math.max(0.72, Math.min(1.35, pr.f));
        const h = (isLeg ? 16 : 30) * Math.max(0.72, Math.min(1.35, pr.f));
        const x = pr.x - w / 2, y = pr.y - h / 2;
        ctx.globalAlpha = (n.faint ? 0.5 : 1) * (dim ? 0.32 : 1);
        // connector stub to the surface for floating nodes
        if (n.p[1] > 0.4) {
          const foot = project([n.p[0], 0.02, n.p[2]], W, H);
          ctx.strokeStyle = C.hair; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
          ctx.beginPath(); ctx.moveTo(pr.x, y + h); ctx.lineTo(foot.x, foot.y); ctx.stroke(); ctx.setLineDash([]);
        }
        roundRect(ctx, x, y, w, h, 5);
        ctx.fillStyle = C.bg; ctx.fill();
        ctx.globalAlpha *= 0.18; ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = (n.faint ? 0.5 : 1) * (dim ? 0.32 : 1);
        ctx.lineWidth = isSel ? 2.4 : 1.4; ctx.strokeStyle = isSel ? C.accent : col; roundRect(ctx, x, y, w, h, 5); ctx.stroke();
        ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = `600 ${isLeg ? 8 : 11}px 'JetBrains Mono', monospace`;
        ctx.fillText(n.code, pr.x, pr.y);
        if (!isLeg) {
          ctx.font = "10px 'Noto Sans SC', sans-serif"; ctx.fillStyle = C.muted;
          ctx.fillText(L(meta.zh, meta.en), pr.x, y + h + 9);
        }
        ctx.globalAlpha = 1;
      });

      // --- software stack chips: shown for the selected node only (keeps the scene legible) ---
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      const swNode = CB_NODES.find((n) => n.id === s.sel && L(n.swZh, n.swEn));
      if (swNode && !s.filter) {
        const sw = L(swNode.swZh, swNode.swEn);
        const pr = project(swNode.p, W, H);
        const rightRoom = pr.x < W - 150;
        ctx.font = "9px 'JetBrains Mono', monospace";
        sw.forEach((line, i) => {
          const ty = pr.y - 30 - i * 15, tw = ctx.measureText(line).width + 14;
          const tx = rightRoom ? pr.x + 30 : pr.x - 30 - tw;
          ctx.globalAlpha = 0.94; roundRect(ctx, tx, ty - 7, tw, 14, 7);
          ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = CB_CAT[swNode.cat]; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.fillStyle = C.ink; ctx.fillText(line, tx + 7, ty);
          ctx.strokeStyle = C.hair; ctx.beginPath(); ctx.moveTo(pr.x, pr.y - 14); ctx.lineTo(rightRoom ? tx : tx + tw, ty); ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }

    };
    drawRef.current = render;
    render(performance.now());                       // paint once immediately (no rAF dependency)
    const onResize = () => render(performance.now());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [lang]);

  // Redraw on demand when the selection or link filter changes.
  React.useEffect(() => { drawRef.current(performance.now()); }, [sel, filter, lang]);

  // Auto-rotate: an animation loop that runs only while spinning.
  React.useEffect(() => {
    if (!auto) return;
    let raf;
    const tick = (ts) => {
      if (!drag.current) cam.current.yaw += 0.0035;
      drawRef.current(ts);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto]);

  // ---- pointer: orbit + click-to-select ----
  const onDown = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    drag.current = { x: e.clientX, y: e.clientY, moved: false,
      px: e.clientX - r.left, py: e.clientY - r.top, y0: cam.current.yaw, p0: cam.current.pitch };
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.current.moved = true;
    cam.current.yaw = drag.current.y0 + dx * 0.008;
    cam.current.pitch = Math.max(-0.15, Math.min(1.15, drag.current.p0 + dy * 0.006));
    if (!st.current.auto) drawRef.current(performance.now());   // live redraw while paused
  };
  const onUp = () => {
    const d = drag.current; drag.current = null;
    if (!d || d.moved) return;
    // hit-test nodes (nearest to camera wins)
    const cv = canvasRef.current, W = cv.clientWidth, H = 440;
    let best = null;
    CB_NODES.forEach((n) => {
      const leg = !!(n.alias || n.leg);
      const pr = project(n.p, W, H), w = leg ? 30 : 62, h = leg ? 16 : 30;
      if (Math.abs(d.px - pr.x) < w / 2 + 4 && Math.abs(d.py - pr.y) < h / 2 + 4) {
        if (!best || pr.depth > best.depth) best = { id: n.alias || n.id, depth: pr.depth };
      }
    });
    if (best) setSel(best.id);
  };

  const cur = info(nodeById(sel)) || nodeById("pi");

  return (
    <div className="cbt">
      <div className="cbt-bar mono">
        <span>◍ {L("拖动旋转 · 点设备看详情", "Drag to orbit · click a device")}</span>
        <span className="cbt-actions">
          <button className={`cbt-btn ${auto ? "on" : ""}`} onClick={() => setAuto((a) => !a)}>{auto ? L("⏸ 暂停", "⏸ Pause") : L("▶ 自转", "▶ Spin")}</button>
          <button className="cbt-btn" onClick={() => { cam.current.yaw = -0.72; cam.current.pitch = 0.46; drawRef.current(performance.now()); }}>{L("⟲ 复位", "⟲ Reset")}</button>
        </span>
      </div>
      <canvas ref={canvasRef} className="cbt-canvas"
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
        style={{ width: "100%", height: 440, touchAction: "none", cursor: drag.current ? "grabbing" : "grab" }} />

      <div className="cbt-legend">
        <button className={`cbt-key ${!filter ? "on" : ""}`} onClick={() => setFilter(null)}>
          <span className="cbt-sw" style={{ background: "var(--ink)" }} />{L("全部", "All")}
        </button>
        {Object.entries(CB_LINKS).map(([k, v]) => (
          <button key={k} className={`cbt-key ${filter === k ? "on" : ""}`} onClick={() => setFilter((f) => (f === k ? null : k))}>
            <span className="cbt-sw" style={{ background: v.c, borderStyle: v.dash.length ? "dashed" : "solid" }} />{L(v.zh, v.en)}
          </button>
        ))}
      </div>

      <div className="cbt-panel">
        <div className="cbt-p-head">
          <span className="cbt-p-code mono" style={{ color: CB_CAT[cur.cat] }}>{cur.code}</span>
          <span className="cbt-p-name">{L(cur.zh, cur.en)}</span>
          <span className="cbt-p-cat" style={{ borderColor: CB_CAT[cur.cat], color: CB_CAT[cur.cat] }}>{L(cur.catZh, cur.catEn)}</span>
        </div>
        <p className="cbt-p-role">{L(cur.roleZh, cur.roleEn)}</p>
        <div className="cbt-facets">
          <div><span className="cbt-f-lbl">{L("硬件", "Hardware")}</span><span>{L(cur.hwZh, cur.hwEn)}</span></div>
          <div><span className="cbt-f-lbl">{L("软件", "Software")}</span><span>{(L(cur.swZh, cur.swEn) || []).join(" · ") || L("—(纯硬件器件)", "— (hardware only)")}</span></div>
          <div><span className="cbt-f-lbl">{L("网络", "Network")}</span><span>{cur.link ? <><span className="cbt-dot" style={{ background: CB_LINKS[cur.link].c }} />{L(cur.netZh, cur.netEn)}</> : L(cur.netZh, cur.netEn)}</span></div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   H9 · ERP floor hardware map (zone → device → document)
   ============================================================ */
function ErpFloorMapViz() {
  const lang = (typeof useLang === "function") ? useLang() : "zh";
  const L = (zh, en) => (lang === "en" ? en : zh);
  const zones = [
    { id: "line", zh: "产线", en: "Line", c: "#0e3a3a",
      items: [
        { zh: "安灯灯塔", en: "Andon tower", doc: { zh: "停机码 / OEE", en: "Downtime / OEE" } },
        { zh: "工位平板", en: "Station tablet", doc: { zh: "报工确认", en: "Confirm WO" } },
        { zh: "PLC 脉冲", en: "PLC pulse", doc: { zh: "自动计件", en: "Piece count" } },
      ] },
    { id: "wh", zh: "仓储", en: "Warehouse", c: "#ff4d1f",
      items: [
        { zh: "手持扫码", en: "Handheld scan", doc: { zh: "收发货", en: "GR / GI" } },
        { zh: "标签机", en: "Labeler", doc: { zh: "批次条码", en: "Batch label" } },
        { zh: "RFID 门", en: "RFID gate", doc: { zh: "整托过账", en: "Pallet post" } },
      ] },
    { id: "qi", zh: "质检", en: "QI", c: "#5a6b2a",
      items: [
        { zh: "检重秤", en: "Checkweigher", doc: { zh: "合格判定", en: "Pass / fail" } },
        { zh: "温湿度", en: "TH probe", doc: { zh: "环境超限", en: "Env alarm" } },
      ] },
    { id: "edge", zh: "边缘", en: "Edge", c: "#6b4c2a",
      items: [
        { zh: "网关", en: "Gateway", doc: { zh: "协议翻译", en: "Translate" } },
        { zh: "MQTT/HTTPS", en: "MQTT/HTTPS", doc: { zh: "进 ERP", en: "Into ERP" } },
      ] },
  ];
  const [sel, setSel] = React.useState("wh");
  const z = zones.find((x) => x.id === sel) || zones[0];
  return (
    <div>
      <div className="viz-ctrl" style={{ flexWrap: "wrap", gap: 8 }}>
        {zones.map((zn) => (
          <button key={zn.id} className={`btn ${sel === zn.id ? "btn-accent" : ""}`}
            style={{ padding: "6px 12px", fontSize: 12 }}
            onClick={() => setSel(zn.id)}>{L(zn.zh, zn.en)}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginTop: 12 }}>
        {z.items.map((it, i) => (
          <div key={i} style={{
            border: "1.5px solid var(--ink)", padding: "12px 14px", background: "var(--surface)",
            borderLeft: `4px solid ${z.c}`,
          }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--muted)" }}>{String(i + 1).padStart(2, "0")}</div>
            <div style={{ fontFamily: "Noto Serif SC, serif", fontSize: 18, margin: "4px 0 8px" }}>{L(it.zh, it.en)}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>→ {L(it.doc.zh, it.doc.en)}</div>
          </div>
        ))}
      </div>
      <div className="viz-readout" style={{ marginTop: 12 }}>
        {L("点分区看「设备 → 写入单据」。第一波通常是:扫码枪 + 工位屏 + 安灯 + 边缘缓存。",
           "Click a zone for device → document. First wave is usually: scanner + station screen + andon + edge buffer.")}
      </div>
    </div>
  );
}

/* ============================================================
   H9 · Scanner → HID/UART → payload
   ============================================================ */
function ScanHidViz() {
  const lang = (typeof useLang === "function") ? useLang() : "zh";
  const L = (zh, en) => (lang === "en" ? en : zh);
  const modes = [
    { id: "hid", zh: "USB HID 键盘楔", en: "USB HID wedge" },
    { id: "uart", zh: "TTL UART", en: "TTL UART" },
    { id: "rs232", zh: "RS-232", en: "RS-232" },
  ];
  const [mode, setMode] = React.useState("uart");
  const [step, setStep] = React.useState(0);
  const samples = ["PO-7781", "MAT-WHEEL", "BIN-A01", "QTY*12"];
  const barcode = samples[Math.min(step, samples.length - 1)];
  const payload = {
    eventId: "scan-" + (1000 + step),
    code: barcode,
    iface: mode,
    ts: "2026-07-23T20:30:00Z",
  };
  const draw = (ctx, W, H) => {
    const C = COLORS();
    const boxes = [
      { x: 20, w: 110, zh: "扫码头", en: "Engine" },
      { x: 160, w: 120, zh: mode === "hid" ? "HID 芯片" : "串口芯片", en: mode === "hid" ? "HID IC" : "UART IC" },
      { x: 310, w: 110, zh: "MCU/App", en: "MCU/App" },
      { x: 450, w: 100, zh: "ERP API", en: "ERP API" },
    ];
    const scale = Math.min(1, (W - 40) / 560);
    ctx.save();
    ctx.translate((W - 560 * scale) / 2, 0);
    ctx.scale(scale, scale);
    boxes.forEach((b, i) => {
      const y = 50, h = 56;
      const active = step >= i;
      ctx.fillStyle = active ? C.surface : C.bg;
      ctx.strokeStyle = active ? C.accent : C.hair;
      ctx.lineWidth = active ? 2.2 : 1.2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(b.x, y, b.w, h, 6) : (() => { ctx.rect(b.x, y, b.w, h); })();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = "13px 'Noto Sans SC', sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(L(b.zh, b.en), b.x + b.w / 2, y + h / 2);
      if (i < boxes.length - 1) {
        const x0 = b.x + b.w + 4, x1 = boxes[i + 1].x - 4, ym = y + h / 2;
        ctx.strokeStyle = step > i ? C.accent : C.hair; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x0, ym); ctx.lineTo(x1, ym); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x1 - 6, ym - 4); ctx.lineTo(x1, ym); ctx.lineTo(x1 - 6, ym + 4); ctx.stroke();
      }
    });
    // barcode glyph
    ctx.fillStyle = C.ink;
    for (let i = 0; i < 28; i++) {
      const bw = (i % 3 === 0) ? 3 : 1.5;
      ctx.fillRect(40 + i * 4, 18, bw, 22);
    }
    ctx.font = "11px 'JetBrains Mono', monospace"; ctx.textAlign = "left";
    ctx.fillStyle = C.muted; ctx.fillText(barcode, 40, 14);
    ctx.restore();
  };
  return (
    <div>
      <Canvas draw={draw} height={140} />
      <div className="viz-ctrl" style={{ flexWrap: "wrap", gap: 8 }}>
        {modes.map((m) => (
          <button key={m.id} className={`btn ${mode === m.id ? "btn-primary" : ""}`}
            style={{ padding: "6px 12px", fontSize: 12 }}
            onClick={() => { setMode(m.id); setStep(0); }}>{L(m.zh, m.en)}</button>
        ))}
        <button className="btn btn-accent" style={{ padding: "6px 12px", fontSize: 12 }}
          onClick={() => setStep((s) => (s + 1) % 4)}>
          {L("模拟扫一下 →", "Simulate scan →")}
        </button>
      </div>
      <div className="viz-readout" style={{ marginTop: 8 }}>
        <div><b>{L("原始字符", "Raw")}</b>: <span className="mono">{barcode}{"\\r\\n"}</span>
          {mode === "hid" ? L(" → 像键盘敲入", " → typed like a keyboard")
            : mode === "uart" ? L(" → TX 接 MCU RX,共地", " → TX→MCU RX, common GND")
            : L(" → 需电平转换(±12V)", " → needs level shift (±12V)")}
        </div>
        <pre className="mono" style={{ margin: "8px 0 0", fontSize: 12, whiteSpace: "pre-wrap" }}>{JSON.stringify(payload, null, 2)}</pre>
      </div>
    </div>
  );
}

/* ============================================================
   H9 · Andon I/O state machine
   ============================================================ */
function AndonIoViz() {
  const lang = (typeof useLang === "function") ? useLang() : "zh";
  const L = (zh, en) => (lang === "en" ? en : zh);
  const states = [
    { id: "green", zh: "正常(绿)", en: "Normal (G)", color: "#2a8f4a", reason: "" },
    { id: "call", zh: "呼叫(红)", en: "Call (R)", color: "#d62828", reason: "ANDON_PULL" },
    { id: "ack", zh: "已响应(黄)", en: "Ack (Y)", color: "#d4a017", reason: "LEAD_ON_SITE" },
    { id: "clear", zh: "关闭→绿", en: "Clear→G", color: "#2a8f4a", reason: "CLOSED" },
  ];
  const [si, setSi] = React.useState(0);
  const st = states[si];
  const draw = (ctx, W, H) => {
    const C = COLORS();
    const cx = W * 0.28, cy = H / 2;
    // tower body
    ctx.fillStyle = C.ink; ctx.fillRect(cx - 14, 30, 28, H - 50);
    const colors = ["#d62828", "#d4a017", "#2a8f4a"];
    colors.forEach((col, i) => {
      const y = 40 + i * 48;
      const on = (si === 1 && i === 0) || (si === 2 && i === 1) || ((si === 0 || si === 3) && i === 2);
      ctx.beginPath(); ctx.arc(cx, y + 18, 16, 0, Math.PI * 2);
      ctx.fillStyle = on ? col : C.surface; ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
      if (on) {
        ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.arc(cx, y + 18, 26, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = 1;
      }
    });
    // button
    const bx = W * 0.62, by = H * 0.55;
    ctx.beginPath(); ctx.arc(bx, by, 28, 0, Math.PI * 2);
    ctx.fillStyle = si === 1 ? C.accent : C.surface; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = "12px 'Noto Sans SC', sans-serif";
    ctx.textAlign = "center"; ctx.fillText(L("拉绳/按钮", "Cord / Btn"), bx, by + 50);
    ctx.font = "11px 'JetBrains Mono', monospace"; ctx.fillStyle = C.muted;
    ctx.fillText("GPIO INPUT_PULLUP", bx, by + 66);
    // state arrow
    ctx.strokeStyle = C.hair; ctx.beginPath();
    ctx.moveTo(cx + 40, cy); ctx.lineTo(bx - 40, cy); ctx.stroke();
  };
  return (
    <div>
      <Canvas draw={draw} height={220} />
      <div className="viz-ctrl" style={{ flexWrap: "wrap", gap: 8 }}>
        {states.map((s, i) => (
          <button key={s.id} className={`btn ${si === i ? "btn-accent" : ""}`}
            style={{ padding: "6px 12px", fontSize: 12, borderColor: s.color }}
            onClick={() => setSi(i)}>{L(s.zh, s.en)}</button>
        ))}
      </div>
      <div className="viz-readout">
        {L("状态", "State")}: <b style={{ color: st.color }}>{L(st.zh, st.en)}</b>
        {st.reason && <> · reason=<span className="mono">{st.reason}</span></>}
        {" · "}{L("消抖后再进状态机,再组 MQTT 载荷(见 EH4)。", "Debounce, then state machine, then MQTT payload (see EH4).")}
      </div>
    </div>
  );
}

/* ============================================================
   H9 · Four-layer ERP integration stack
   ============================================================ */
function ErpStackViz() {
  const lang = (typeof useLang === "function") ? useLang() : "zh";
  const L = (zh, en) => (lang === "en" ? en : zh);
  const layers = [
    { id: 0, zh: "① 现场总线", en: "① Field bus", proto: "RS-485 / Modbus RTU",
      detailZh: "差分多点、寄存器读写。帧里没有物料号/工单号。", detailEn: "Differential multi-drop, register R/W. No material/WO in the frame." },
    { id: 1, zh: "② 边缘网关", en: "② Edge gateway", proto: "poll · map · validate · queue",
      detailZh: "轮询从站 → 映射工单 → 校验 → 断网本地队列。", detailEn: "Poll slaves → map WO → validate → offline local queue." },
    { id: 2, zh: "③ 消息层", en: "③ Messaging", proto: "MQTT QoS1 / HTTPS REST",
      detailZh: "主题或 API 运载业务事件;至少一次投递 → 必须幂等。", detailEn: "Topics/APIs carry business events; at-least-once ⇒ must be idempotent." },
    { id: 3, zh: "④ ERP 事务", en: "④ ERP transaction", proto: "报工 / 收货 / 停机码",
      detailZh: "用 eventId 防重,校验主数据,过账后 ACK。", detailEn: "Idempotent on eventId, validate master data, ACK after post." },
  ];
  const scenes = [
    { id: "a", zh: "A 计件报工", en: "A piece confirm", path: [0, 1, 2, 3] },
    { id: "b", zh: "B 手持收货", en: "B handheld GR", path: [1, 2, 3] },
    { id: "c", zh: "C OPC-UA 机床", en: "C OPC-UA machine", path: [1, 2, 3] },
  ];
  const [scn, setScn] = React.useState("a");
  const [layer, setLayer] = React.useState(0);
  const scene = scenes.find((s) => s.id === scn) || scenes[0];
  const draw = (ctx, W, H) => {
    const C = COLORS();
    const pad = 16, rowH = (H - pad * 2) / 4;
    layers.forEach((ly, i) => {
      const y = pad + i * rowH;
      const onPath = scene.path.includes(i);
      const sel = layer === i;
      ctx.globalAlpha = onPath ? 1 : 0.35;
      ctx.fillStyle = sel ? C.surface : C.bg;
      ctx.strokeStyle = sel ? C.accent : (onPath ? C.primary : C.hair);
      ctx.lineWidth = sel ? 2.4 : 1.4;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pad, y + 4, W - pad * 2, rowH - 10, 6);
      else ctx.rect(pad, y + 4, W - pad * 2, rowH - 10);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = "600 13px 'Noto Sans SC', sans-serif";
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(L(ly.zh, ly.en), pad + 14, y + rowH / 2 - 6);
      ctx.font = "11px 'JetBrains Mono', monospace"; ctx.fillStyle = C.muted;
      ctx.fillText(ly.proto, pad + 14, y + rowH / 2 + 12);
      if (onPath && i < 3 && scene.path.includes(i + 1)) {
        ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.globalAlpha = 1;
        const x = W - pad - 28, y0 = y + rowH - 6, y1 = y + rowH + 4;
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });
  };
  const cur = layers[layer];
  return (
    <div>
      <Canvas draw={draw} height={240} />
      <div className="viz-ctrl" style={{ flexWrap: "wrap", gap: 8 }}>
        {scenes.map((s) => (
          <button key={s.id} className={`btn ${scn === s.id ? "btn-accent" : ""}`}
            style={{ padding: "6px 12px", fontSize: 12 }}
            onClick={() => { setScn(s.id); setLayer(s.path[0]); }}>{L(s.zh, s.en)}</button>
        ))}
      </div>
      <div className="viz-ctrl" style={{ flexWrap: "wrap", gap: 8, marginTop: 6 }}>
        {layers.map((ly) => (
          <button key={ly.id} className={`btn ${layer === ly.id ? "btn-primary" : ""}`}
            style={{ padding: "4px 10px", fontSize: 11, opacity: scene.path.includes(ly.id) ? 1 : 0.4 }}
            onClick={() => setLayer(ly.id)}>{L(ly.zh, ly.en)}</button>
        ))}
      </div>
      <div className="viz-readout">
        <b>{L(cur.zh, cur.en)}</b> · <span className="mono">{cur.proto}</span><br />
        {L(cur.detailZh, cur.detailEn)}
        {scn === "b" && layer === 0 && <> {L("(手持收货常跳过 485,枪走 USB/Wi-Fi。)", "(Handheld GR often skips 485 — gun is USB/Wi-Fi.)")}</>}
        {scn === "c" && layer === 0 && <> {L("(OPC-UA 多在车间以太网,不是 485。)", "(OPC-UA usually sits on plant Ethernet, not 485.)")}</>}
      </div>
    </div>
  );
}

/* ---------------- registry & dispatch ---------------- */
const VIZ = {
  careBedTopology: () => <CareBedTopologyViz />,
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
  bcg: () => <BcgViz />,
  pressureMap: () => <PressureMapViz />,
  emuPower: () => <EmuPowerViz />,
  consoleModel: () => <ConsoleModelViz />,
  erpFloorMap: () => <ErpFloorMapViz />,
  scanHid: () => <ScanHidViz />,
  andonIo: () => <AndonIoViz />,
  erpStack: () => <ErpStackViz />,
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
