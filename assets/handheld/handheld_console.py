"""Parametric handheld retro game console — Anbernic RG35XX-style (upgrade).

Portrait vertical handheld modeled from the labeled product reference:
82 mm wide x 130 mm tall x 16 mm thick, translucent smoke shell.

Front: recessed glossy screen (3.5" 4:3) up top; cross D-pad lower-left;
color-coded ABXY diamond lower-right; a small function-button cluster + FN
between them; dual thumbsticks (L3/R3) lower down with SELECT/START pills
between; small power/volume/reset controls and TF slots on the top edge;
USB-C / 3.5 mm / DC ports on the bottom edge; four shoulder triggers
(L1/L2/R1/R2) on the top-rear edge; ribbed heat-sink cavity + SoC window on
the translucent back.

Units: millimeters. Origin: body center on the XY plane, front face at +Z.
"""

from build123d import *

# ----------------------------------------------------------------------------
# Parameters (mm) — from the labeled reference (82 x 130)
# ----------------------------------------------------------------------------
BODY_W = 82.0           # width  (X)
BODY_H = 130.0          # height (Y) — portrait
BODY_T = 16.0           # thickness (Z), front face at Z = BODY_T
CORNER_R = 8.0
RIM_FILLET = 2.5

# Screen: recessed glossy panel, upper area (3.5" 4:3 active display)
SCREEN_CY = 32.0
PANEL_W = 78.0
PANEL_H = 60.0
PANEL_R = 4.0
DISP_W = 71.0
DISP_H = 53.0
RECESS_D = 1.0

# D-pad (lower-left)
DPAD_CX = -25.0
DPAD_CY = -16.0
DPAD_ARM = 8.5
DPAD_LEN = 24.0
DPAD_H = 3.5

# ABXY diamond (lower-right)
ABXY_CX = 25.0
ABXY_CY = -16.0
ABXY_OFF = 9.5          # tighter diamond (narrowed spacing)
ABXY_R = 3.4            # colored buttons shrunk ~20%
ABXY_H = 3.2

# Function-button cluster + FN (center, between D-pad and ABXY)
FUNC_CX = 0.0
FUNC_CY = -9.0
FUNC_R = 1.7
FUNC_H = 1.4
FUNC_DX = 6.0           # column spacing
FUNC_DY = 5.0           # row spacing
FN_CY = -20.0
FN_R = 3.0
FN_H = 2.2

# Thumbsticks L3 / R3 (lower area)
STICK_LX = -20.0
STICK_RX = 20.0
STICK_CY = -46.0
STICK_PLAT_R = 10.0
STICK_R = 7.5
STICK_H = 5.5

# SELECT / START pills (between the sticks)
CTRL_CY = -32.0
PILL_W = 11.0
PILL_H = 4.0
PILL_TH = 2.0
PILL_DX = 9.0

# Ergonomic back triggers L1/L2/R1/R2 — angled paddles on the rear, placed where
# the index (L1/R1) and middle (L2/R2) fingertips rest while the thumbs work the
# front face. Left pair and right pair, angled as chevrons toward the grip.
TRIG_LEN = 15.4        # paddle long axis (shrunk ~30%)
TRIG_W = 6.3           # paddle width (shrunk ~30%)
TRIG_PROUD = 3.2       # stand-off from the back face (shrunk ~30%)
TRIG_TILT = 11.0       # ramp tilt (deg) so the press end lifts to the fingertip
# (x, y, z_rotation, label). Pair centered on the 2/5-down line (Y~+13) where
# the fingers wrap onto the back; L1/L2 near the left grip edge, staggered for
# the index (upper) and middle (lower) fingertips; R mirrors.
TRIG_SPECS = (
    (-30.0, 19.0,  18.0, "trig_l1"),   # index  — upper, near the edge
    (-23.0,  7.0,  18.0, "trig_l2"),   # middle — lower, slight inboard curl
    ( 30.0, 19.0, -18.0, "trig_r1"),
    ( 23.0,  7.0, -18.0, "trig_r2"),
)

# Top-edge controls
PWR_X = 30.0            # power button nub
VOL_X = 16.0           # volume rocker nub
RST_X = 37.0           # reset pinhole
TF_XS = (-22.0, -30.0)  # two TF card slots

# Bottom-edge ports
USBC_W = 10.0
USBC_H = 3.4
JACK_X = -28.0         # 3.5 mm headphone jack
JACK_R = 2.2
DC_X = 28.0            # DC power
DC_R = 2.0

FRONT_Z = BODY_T
MIDZ = BODY_T / 2.0
TOP_Y = BODY_H / 2.0
BOT_Y = -BODY_H / 2.0


def _round_button(x, y, r, h, z_base, top_fillet=None):
    btn = Pos(x, y, z_base + h / 2) * Cylinder(r, h)
    if top_fillet:
        try:
            e = btn.edges().filter_by(GeomType.CIRCLE).sort_by(Axis.Z)[-1]
            btn = fillet(e, top_fillet)
        except Exception:
            pass
    return btn


def _thumbstick(x, y):
    platform = Pos(x, y, FRONT_Z + 0.75) * Cylinder(STICK_PLAT_R, 1.5)
    cap = Pos(x, y, FRONT_Z + 1.5 + STICK_H / 2) * Cylinder(STICK_R, STICK_H)
    try:
        e = cap.edges().filter_by(GeomType.CIRCLE).sort_by(Axis.Z)[-1]
        cap = fillet(e, 3.0)
    except Exception:
        pass
    return platform + cap


def gen_step():
    parts = []

    # --- Body ---------------------------------------------------------------
    body = extrude(RectangleRounded(BODY_W, BODY_H, CORNER_R), BODY_T)
    try:
        top_face = body.faces().sort_by(Axis.Z)[-1]
        bot_face = body.faces().sort_by(Axis.Z)[0]
        body = fillet(top_face.edges() + bot_face.edges(), RIM_FILLET)
    except Exception:
        pass

    # Screen recess (front)
    body -= Pos(0, SCREEN_CY, FRONT_Z - RECESS_D) * extrude(
        RectangleRounded(PANEL_W + 3, PANEL_H + 3, PANEL_R + 1), RECESS_D + 2.0
    )

    # Heat-sink cavity (back) — shallow pocket removed from the back face
    back_pocket = Pos(0, -8.0, -1.0) * extrude(
        RectangleRounded(66.0, 96.0, 6.0), 1.0 + 2.0
    )
    body -= back_pocket

    # Edge port cuts
    body -= Pos(0, BOT_Y, MIDZ) * Box(USBC_W, 8.0, USBC_H)                 # USB-C bottom
    body -= Pos(JACK_X, BOT_Y, MIDZ) * Rot(90, 0, 0) * Cylinder(JACK_R, 12.0)  # 3.5mm jack
    body -= Pos(DC_X, BOT_Y, MIDZ) * Rot(90, 0, 0) * Cylinder(DC_R, 12.0)      # DC
    for tx in TF_XS:                                                        # TF slots (top)
        body -= Pos(tx, TOP_Y, MIDZ) * Box(9.0, 8.0, 2.4)
    body -= Pos(RST_X, TOP_Y, MIDZ) * Rot(90, 0, 0) * Cylinder(0.9, 12.0)  # reset pinhole

    body.label = "body"
    body.color = Color(0.30, 0.28, 0.36)  # translucent smoke look
    parts.append(body)

    # --- Screen -------------------------------------------------------------
    panel = Pos(0, SCREEN_CY, FRONT_Z - RECESS_D) * extrude(
        RectangleRounded(PANEL_W, PANEL_H, PANEL_R), RECESS_D + 0.3
    )
    panel.label = "screen_panel"
    panel.color = Color(0.05, 0.05, 0.06)
    parts.append(panel)

    display = Pos(0, SCREEN_CY, FRONT_Z - RECESS_D + 0.3) * extrude(
        Rectangle(DISP_W, DISP_H), 0.15
    )
    display.label = "display"
    display.color = Color(0.16, 0.34, 0.52)
    parts.append(display)

    # --- Back heat-sink fins + SoC window -----------------------------------
    fin_floor = -1.0 + 3.0 - 2.0  # pocket floor at Z ~ 0.0 .. keep fins near back
    for i, fx in enumerate(range(-26, 27, 6)):
        fin = Pos(float(fx), -27.0, 0.6) * Box(1.6, 46.0, 1.6)
        fin.label = f"fin_{i}"
        fin.color = Color(0.14, 0.14, 0.16)
        parts.append(fin)
    chip = Pos(0.0, 44.0, 0.6) * Box(16.0, 16.0, 1.4)
    chip.label = "soc_chip"
    chip.color = Color(0.10, 0.10, 0.12)
    parts.append(chip)

    # --- D-pad --------------------------------------------------------------
    arm_v = extrude(RectangleRounded(DPAD_ARM, DPAD_LEN, 2.0), DPAD_H)
    arm_h = extrude(RectangleRounded(DPAD_LEN, DPAD_ARM, 2.0), DPAD_H)
    dpad = Pos(DPAD_CX, DPAD_CY, FRONT_Z) * (arm_v + arm_h)
    try:
        dpad = fillet(dpad.faces().sort_by(Axis.Z)[-1].edges(), 1.0)
    except Exception:
        pass
    dpad.label = "dpad"
    dpad.color = Color(0.10, 0.10, 0.11)
    parts.append(dpad)

    # --- ABXY diamond -------------------------------------------------------
    for name, dx, dy, col in [
        ("btn_x", 0.0, ABXY_OFF, Color(0.20, 0.35, 0.85)),
        ("btn_a", ABXY_OFF, 0.0, Color(0.85, 0.15, 0.15)),
        ("btn_b", 0.0, -ABXY_OFF, Color(0.90, 0.75, 0.10)),
        ("btn_y", -ABXY_OFF, 0.0, Color(0.15, 0.65, 0.25)),
    ]:
        b = _round_button(ABXY_CX + dx, ABXY_CY + dy, ABXY_R, ABXY_H, FRONT_Z, 1.4)
        b.label = name
        b.color = col
        parts.append(b)

    # --- Function-button cluster (2x3) + FN ---------------------------------
    idx = 0
    for row in (1, 0):
        for col in (-1, 0, 1):
            fb = _round_button(FUNC_CX + col * FUNC_DX,
                               FUNC_CY + row * FUNC_DY,
                               FUNC_R, FUNC_H, FRONT_Z, 0.6)
            fb.label = f"func_{idx}"
            fb.color = Color(0.12, 0.12, 0.13)
            parts.append(fb)
            idx += 1
    fn = _round_button(FUNC_CX, FN_CY, FN_R, FN_H, FRONT_Z, 0.8)
    fn.label = "fn"
    fn.color = Color(0.12, 0.12, 0.13)
    parts.append(fn)

    # --- Thumbsticks --------------------------------------------------------
    ls = _thumbstick(STICK_LX, STICK_CY); ls.label = "stick_left_l3"
    ls.color = Color(0.08, 0.08, 0.09); parts.append(ls)
    rs = _thumbstick(STICK_RX, STICK_CY); rs.label = "stick_right_r3"
    rs.color = Color(0.08, 0.08, 0.09); parts.append(rs)

    # --- SELECT / START -----------------------------------------------------
    for name, dx in (("select", -PILL_DX), ("start", PILL_DX)):
        pill = Pos(dx, CTRL_CY, FRONT_Z + PILL_TH / 2) * Box(PILL_W, PILL_H, PILL_TH)
        try:
            pill = fillet(pill.edges().filter_by(Axis.Z), PILL_H / 2 - 0.05)
        except Exception:
            pass
        pill.label = name
        pill.color = Color(0.12, 0.12, 0.13)
        parts.append(pill)

    # --- Ergonomic back triggers L1/L2/R1/R2 (angled rear paddles) ----------
    # Each paddle protrudes backward (-Z) from the upper-rear, angled as a
    # chevron toward the grip, with a ramp tilt so the fingertip end lifts.
    for tx, ty, zrot, name in TRIG_SPECS:
        pad = extrude(RectangleRounded(TRIG_LEN, TRIG_W, TRIG_W / 2 - 0.5),
                      -TRIG_PROUD)
        pad = Rot(0, TRIG_TILT, 0) * pad      # ramp along the long axis
        pad = Rot(0, 0, zrot) * pad           # chevron angle
        pad = Pos(tx, ty, 0.0) * pad          # position on the upper rear
        try:
            pad = fillet(pad.faces().sort_by(Axis.Z)[0].edges(), 1.6)
        except Exception:
            pass
        pad.label = name
        pad.color = Color(0.09, 0.09, 0.10)
        parts.append(pad)

    # --- Top-edge power / volume nubs ---------------------------------------
    pwr = Pos(PWR_X, TOP_Y - 3.0, FRONT_Z) * extrude(
        RectangleRounded(3.5, 7.0, 1.5), 1.6)
    pwr.label = "power"; pwr.color = Color(0.85, 0.15, 0.15); parts.append(pwr)
    vol = Pos(VOL_X, TOP_Y - 3.0, FRONT_Z) * extrude(
        RectangleRounded(4.0, 12.0, 1.8), 1.6)
    vol.label = "volume"; vol.color = Color(0.12, 0.12, 0.13); parts.append(vol)

    assembly = Compound(children=parts)
    assembly.label = "handheld_console"
    return assembly


if __name__ == "__main__":
    shape = gen_step()
    print("children:", len(shape.children))
    print("bbox:", shape.bounding_box())
