"""Şans (the dog) as a Rive RML scene: one picture on a skinned mesh, face patches and collars.

The dog is one image (sans_cut.py cuts it out of its grey background) on a grid mesh skinned to
bones: hips (still, holds the paws on the ground), chest, head, the two ears and a three-bone tail.
Weights come from one field over the canvas (soft region masks for the tail and the ears, height
bands for the head and the chest), so the face patches and the collars, each a small mesh with the
same weights, follow the fur under them exactly.
Face patches are cut from the face pictures (sans-base.png with one feature changed) where they
differ from the base; collars from the wear pictures the same way. All pictures share one canvas.
View model `Dog`: `happy` (boolean: happy face, fast wag), `collar` (number: 0 none, 1 rope,
2 leather, 3 silver, 4 gold, 5 ruby), `scarf` (boolean; the scarf sits under the collar).
Usage: python3 scripts/rig/sans_rig.py art/pilot/19-sans-rig/rive/sansrig [--game]
"""
import base64, math, os, sys
import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from sans_cut import cut

PROJ = sys.argv[1]
# --game: the game's file: see-through background and webp parts (a quarter of the size, no
# visible change); without it a light grey background for videos, png parts.
GAME = "--game" in sys.argv
BOARD_BG = "00000000" if GAME else "FFE8EEF4"
PART_EXT = "webp" if GAME else "png"


def write_part(im, name):
    """A part image; the png is always written (later steps read it), the webp for the game."""
    im.save(os.path.join(PROJ, "parts", f"{name}.png"), optimize=True)
    if GAME:
        im.save(os.path.join(PROJ, "parts", f"{name}.webp"), "WEBP", quality=90, method=6)
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
D = os.path.join(ROOT, "art/pilot/19-sans-rig/")
ART = (100, 150)                 # artboard's top left on the canvas
W, H_ = 800, 1170
DOG = (575, 1285)                # the Dog node: bottom centre, so breathing keeps the paws down
BG = np.array([213.0, 213.0, 212.0])

# ---- bones (canvas coordinates, from the base picture) ------------------------------------------
# name: (start, end, parent); a child starts where its parent ends. "link" bones carry no weight;
# they only move an ear's pivot to the ear's base.
BONES = {
    "hips": ((575, 1270), (575, 980), None),
    "chest": ((575, 980), (575, 720), "hips"),
    "head": ((575, 720), (575, 400), "chest"),
    "ear-r-link": ((575, 400), (715, 425), "head"),
    "ear-r": ((715, 425), (748, 205), "ear-r-link"),
    "ear-l-link": ((575, 400), (440, 385), "head"),
    "ear-l": ((440, 385), (340, 535), "ear-l-link"),
    "tail-1": ((305, 1155), (220, 1125), None),
    "tail-2": ((220, 1125), (160, 1045), "tail-1"),
    "tail-3": ((160, 1045), (226, 922), "tail-2"),
}
WEIGHTED = ["hips", "chest", "head", "ear-r", "ear-l", "tail-1", "tail-2", "tail-3"]

# ---- weight field -------------------------------------------------------------------------------
SH = (1536, 1024)
def soft_poly(points, sigma):
    m = np.zeros(SH, np.float32)
    cv2.fillPoly(m, [np.array(points, np.int32)], 1.0)
    return cv2.GaussianBlur(m, (0, 0), sigma)

TAIL = soft_poly([(120, 880), (275, 880), (275, 1095), (318, 1135), (318, 1190), (120, 1190)], 5)
EAR_R = soft_poly([(640, 180), (800, 180), (800, 455), (690, 440), (650, 425)], 9)
EAR_L = soft_poly([(290, 345), (462, 345), (455, 405), (420, 445), (408, 565), (290, 565)], 9)

def smooth(x, a, b):
    """0 at a, 1 at b (either order), smoothstep between."""
    t = min(max((x - a) / (b - a), 0.0), 1.0)
    return t * t * (3 - 2 * t)

TAIL_PTS = [BONES["tail-1"][0], BONES["tail-2"][0], BONES["tail-3"][0], BONES["tail-3"][1]]
def tail_split(p):
    """arc length of p's projection on the tail line -> weights of the three tail bones."""
    best, s0 = None, 0.0
    for k in range(3):
        a, b = np.array(TAIL_PTS[k], float), np.array(TAIL_PTS[k + 1], float)
        L = np.linalg.norm(b - a)
        t = min(max(np.dot(p - a, b - a) / L ** 2, 0), 1)
        d = np.linalg.norm(a + t * (b - a) - p)
        if best is None or d < best[0]:
            best = (d, s0 + t * L)
        s0 += L
    s = best[1]
    j1 = np.linalg.norm(np.subtract(TAIL_PTS[1], TAIL_PTS[0]))
    j2 = j1 + np.linalg.norm(np.subtract(TAIL_PTS[2], TAIL_PTS[1]))
    a1, a2 = smooth(s, j1 - 22, j1 + 22), smooth(s, j2 - 22, j2 + 22)
    return [1 - a1, a1 - a2, a2]

def weights(x, y):
    xi, yi = int(min(max(x, 0), SH[1] - 1)), int(min(max(y, 0), SH[0] - 1))
    w = dict.fromkeys(WEIGHTED, 0.0)
    t = float(TAIL[yi, xi])
    for k, v in enumerate(tail_split(np.array([x, y], float))):
        w[f"tail-{k + 1}"] = t * v
    rest = 1 - t
    head = rest * smooth(y, 765, 665)
    er, el = float(EAR_R[yi, xi]), float(EAR_L[yi, xi])
    w["ear-r"], w["ear-l"], w["head"] = head * er, head * el, head * max(0.0, 1 - er - el)
    body = rest - head
    w["chest"] = body * smooth(y, 1065, 930)
    w["hips"] = body - w["chest"]
    top = sorted(w.items(), key=lambda kv: -kv[1])[:4]    # Rive takes four bones per vertex
    tot = sum(v for _, v in top)
    return [(WEIGHTED.index(n) + 1, v / tot) for n, v in top if v > 0]

# ---- parts --------------------------------------------------------------------------------------
os.makedirs(os.path.join(PROJ, "parts"), exist_ok=True)
meta = {}

def save_part(name, rgba):
    im = Image.fromarray(rgba)
    box = im.getbbox()
    write_part(im.crop(box), name)
    meta[name] = box

base_rgba = np.asarray(Image.open(D + "rig/sans.png").convert("RGBA"))
save_part("dog", base_rgba)
base = np.asarray(Image.open(D + "sans-base.png").convert("RGB")).astype(int)

def patch(src, name, dilate=6, feather=4, region=None, min_area=200):
    """the pixels of `src` that differ from the base (a soft mask), cut from its own background."""
    im = np.asarray(Image.open(D + src).convert("RGB"))
    diff = np.abs(im.astype(int) - base).max(axis=2) > 26
    m = diff.astype(np.uint8)
    if region is not None:
        x0, y0, x1, y1 = region
        keep = np.zeros_like(m); keep[y0:y1, x0:x1] = 1; m &= keep
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    m = np.isin(lab, [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] >= min_area]).astype(np.uint8)
    # fill holes (the inside of a ring)
    ff = m.copy(); cv2.floodFill(ff, None, (0, 0), 1)
    m |= (1 - ff)
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * dilate + 1,) * 2))
    soft = cv2.GaussianBlur(m.astype(np.float32), (0, 0), feather) if feather else m.astype(np.float32)
    soft = np.minimum(soft * 2, 1) * m      # full inside, the ramp only on the inner side of the edge
    a = cut(im, BG) * soft
    save_part(name, np.dstack([im, (a * 255).astype(np.uint8)]))

FACES = {"face-blink": ("face-blink.png", (420, 400, 800, 540)),
         "face-pant": ("face-pant.png", (420, 520, 800, 760)),
         "face-happy": ("face-happy.png", (420, 400, 800, 760))}
for name, (src, region) in FACES.items():
    patch(src, name, region=region)
COLLARS = ["rope", "leather", "silver", "gold", "ruby"]          # view model collar 1..5
for c in COLLARS + ["scarf"]:
    patch(f"wear-{c}.png", f"wear-{c}", dilate=2, feather=1.2, region=(380, 640, 860, 1000), min_area=400)

# ---- RML ----------------------------------------------------------------------------------------
_id = [100]
def nid():
    _id[0] += 1
    return f"0:{_id[0]}"

assets, asset_ids, ids = [], {}, {}
def asset(name):
    if name not in asset_ids:
        asset_ids[name] = nid()
        assets.append(f'    <ImageAsset file="parts/{name}.{PART_EXT}" name="{name}" id="{asset_ids[name]}"/>')
    return asset_ids[name]

def varuint(n):
    b = bytearray()
    while True:
        byte = n & 0x7F; n >>= 7
        if n: b.append(byte | 0x80)
        else:
            b.append(byte); return bytes(b)

# bind pose: world angle and start of every bone (relative to the artboard)
bind = {}
def bones_rml(name):
    (a, b, parent) = BONES[name]
    th = math.atan2(b[1] - a[1], b[0] - a[0])
    i = nid(); ids[name] = i
    bind[name] = (th, (a[0] - ART[0], a[1] - ART[1]))
    kids = "".join(bones_rml(k) for k, v in BONES.items() if v[2] == name)
    length = math.dist(a, b)
    if parent is None:
        return (f'<RootBone x="{a[0] - DOG[0]:.2f}" y="{a[1] - DOG[1]:.2f}" length="{length:.2f}" '
                f'rotation="{th:.5f}" name="{name}" id="{i}">{kids}</RootBone>')
    pth = bind[parent][0]
    return f'<Bone length="{length:.2f}" rotation="{th - pth:.5f}" name="{name}" id="{i}">{kids}</Bone>'

bone_rml = "".join(bones_rml(k) for k, v in BONES.items() if v[2] is None)

def skinned(name, alpha_pad=8, cell=16):
    """a grid mesh over the part (cells with no picture in them left out), skinned by the field."""
    x0, y0, x1, y1 = meta[name]
    w, h = x1 - x0, y1 - y0
    cols, rows = max(2, math.ceil(w / cell)), max(2, math.ceil(h / cell))
    a = np.asarray(Image.open(os.path.join(PROJ, "parts", f"{name}.png")))[..., 3] > 0
    a = cv2.dilate(a.astype(np.uint8), np.ones((2 * alpha_pad + 1,) * 2, np.uint8)) > 0
    gx = [w * c / cols for c in range(cols + 1)]
    gy = [h * r / rows for r in range(rows + 1)]
    used, tris, vid = {}, [], []
    def v(r, c):
        if (r, c) not in used:
            used[(r, c)] = len(vid); vid.append((r, c))
        return used[(r, c)]
    for r in range(rows):
        for c in range(cols):
            if a[int(gy[r]):int(math.ceil(gy[r + 1])) + 1, int(gx[c]):int(math.ceil(gx[c + 1])) + 1].any():
                p, q, s, t = v(r, c), v(r, c + 1), v(r + 1, c + 1), v(r + 1, c)
                tris += [p, q, s, p, s, t]
    verts = []
    for r, c in vid:
        vx, vy = gx[c], gy[r]
        ws = weights(x0 + vx, y0 + vy)
        vals = [round(v_ * 255) for _, v_ in ws]
        vals[int(np.argmax(vals))] += 255 - sum(vals)
        used_ = [(k, val) for (k, _), val in zip(ws, vals) if val > 0]
        idx = sum(k << (8 * n) for n, (k, _) in enumerate(used_))
        val = sum(v_ << (8 * n) for n, (_, v_) in enumerate(used_))
        verts.append(f'<MeshVertex x="{vx:.2f}" y="{vy:.2f}" u="{vx / w:.5f}" v="{vy / h:.5f}">'
                     f'<Weight values="{val}" indices="{idx}"/></MeshVertex>')
    tb = base64.b64encode(b"".join(varuint(t) for t in tris)).decode()
    tendons = "".join(
        f'<Tendon boneId="{ids[n]}" xx="{math.cos(bind[n][0]):.6f}" xy="{math.sin(bind[n][0]):.6f}" '
        f'yx="{-math.sin(bind[n][0]):.6f}" yy="{math.cos(bind[n][0]):.6f}" '
        f'tx="{bind[n][1][0]:.2f}" ty="{bind[n][1][1]:.2f}" name="{n}"/>' for n in WEIGHTED)
    i = nid(); ids[name] = i
    return (f'<Image x="{x0 - DOG[0]:.1f}" y="{y0 - DOG[1]:.1f}" originX="0" originY="0" '
            f'assetId="{asset(name)}" name="{name}" id="{i}">'
            f'<Mesh triangleIndexBytes="{tb}" name="{name}-mesh" id="{nid()}">' + "".join(verts)
            + f'<Skin tx="{x0 - ART[0]:.2f}" ty="{y0 - ART[1]:.2f}" name="Skin">{tendons}</Skin></Mesh></Image>')

def node(name, children, x=0, y=0, extra=""):
    i = nid(); ids[name] = i
    return f'<Node x="{x:.1f}" y="{y:.1f}" {extra}name="{name}" id="{i}">\n' + "\n".join(children) + "\n</Node>"

def solo(name, children, active):
    i = nid(); ids[name] = i
    return f'<Solo x="0" y="0" activeComponentId="{ids[active]}" name="{name}" id="{i}">\n' + "\n".join(children) + "\n</Solo>"

# draw order: top-most first
collar = solo("Collar", [node("collar-none", [])] + [node(f"collar-{c}", [skinned(f"wear-{c}")]) for c in COLLARS],
              "collar-none")
scarf = node("Scarf", [skinned("wear-scarf")], extra='opacity="0" ')
blink = node("Blink", [skinned("face-blink")], extra='opacity="0" ')
face = solo("Face", [node("face-rest", []), node("face-pant-n", [skinned("face-pant")]),
                     node("face-happy-n", [skinned("face-happy")])], "face-rest")
dog = node("Dog", [collar, scarf, blink, face, skinned("dog"), bone_rml], DOG[0] - ART[0], DOG[1] - ART[1])

# ---- view model ---------------------------------------------------------------------------------
VM, VMI = nid(), nid()
BOOLS, NUMBERS = ["happy", "scarf"], ["collar"]
VMP = {s: nid() for s in BOOLS + NUMBERS}
viewmodel = (f'<ViewModel defaultInstanceId="{VMI}" name="Dog" id="{VM}">\n'
             + "".join(f'    <ViewModelPropertyBoolean name="{s}" id="{VMP[s]}"/>\n' for s in BOOLS)
             + "".join(f'    <ViewModelPropertyNumber name="{s}" id="{VMP[s]}"/>\n' for s in NUMBERS)
             + f'    <ViewModelInstance exports="true" name="Default" id="{VMI}">\n'
             + "".join(f'        <ViewModelInstanceBoolean propertyValue="false" viewModelPropertyId="{VMP[s]}"/>\n'
                       for s in BOOLS)
             + "".join(f'        <ViewModelInstanceNumber propertyValue="0" viewModelPropertyId="{VMP[s]}"/>\n'
                       for s in NUMBERS)
             + '    </ViewModelInstance>\n</ViewModel>')

# ---- animations ---------------------------------------------------------------------------------
S = 60
def kf(v, f, interp="cubic"):
    if interp == "cubic":
        return (f'<KeyFrameDouble value="{v:.5f}" frame="{f}" interpolationType="cubic">'
                f'<CubicEaseInterpolator x1="0.42" y1="0" x2="0.58" y2="1"/></KeyFrameDouble>')
    return f'<KeyFrameDouble value="{v:.5f}" frame="{f}" interpolationType="{interp}"/>'

def track(obj, prop, keys, interp="cubic"):
    """keys: (seconds, value[, interpolation]); a bone's rotation is added to its bind rotation."""
    off = 0.0
    if prop == "rotation" and obj in BONES:
        a, b, parent = BONES[obj]
        off = math.atan2(b[1] - a[1], b[0] - a[0]) - (bind[parent][0] if parent else 0.0)
    body_ = "".join(kf(k[1] + off, int(round(k[0] * S)), k[2] if len(k) > 2 else interp) for k in keys)
    return (f'<KeyedObject objectId="{ids[obj]}"><KeyedProperty property="{prop}">'
            f'{body_}</KeyedProperty></KeyedObject>')

def anim(name, dur, tracks, loop="loop"):
    i = nid()
    return i, f'<LinearAnimation loopValue="{loop}" duration="{int(round(dur * S))}" name="{name}" id="{i}">\n' + "\n".join(tracks) + "\n</LinearAnimation>"

def solo_keys(solo_, seq, end):
    keys = "".join(f'<KeyFrameId value="{ids[m]}" frame="{int(round(t * S))}"/>' for t, m in seq)
    return (f'<KeyedObject objectId="{ids[solo_]}"><KeyedProperty property="activeComponentId">'
            f'{keys}<KeyFrameId value="{ids[seq[-1][1]]}" frame="{int(round(end * S))}"/></KeyedProperty></KeyedObject>')

def wave(t0, t1, amp, period, phase=0.0):
    """(time, value) keys of a sine from t0 to t1 that starts and ends at 0 (amplitude ramps in and out)."""
    out, n = [], max(2, int((t1 - t0) / (period / 4)))
    for k in range(n + 1):
        t = t0 + (t1 - t0) * k / n
        env = math.sin(math.pi * (t - t0) / (t1 - t0))
        out.append((t, amp * env * math.sin(2 * math.pi * (t - t0) / period - phase)))
    return out

# Breath, 3.2 s: the whole dog swells a little from the paws up, the chest sways.
d = 3.2
breath = anim("Breath", d, [
    track("Dog", "scaleY", [(0, 1.0), (d / 2, 1.008), (d, 1.0)]),
    track("Dog", "scaleX", [(0, 1.0), (d / 2, 1.004), (d, 1.0)]),
    track("chest", "rotation", [(0, -0.006), (d / 2, 0.006), (d, -0.006)]),
])
# Head, 12 s: a curious tilt to one side, back, a smaller one to the other; the folded ear lags.
d = 12.0
tilt = [(0, 0), (2.6, 0.085), (5.0, 0.085), (6.4, 0), (8.8, -0.05), (10.4, -0.05), (11.4, 0), (d, 0)]
lag = [(t + 0.18 if 0 < t < d else t, -0.6 * v) for t, v in tilt]
head_anim = anim("Head", d, [track("head", "rotation", tilt), track("ear-l", "rotation", lag)])
# Ears, 7.3 s: the standing ear twitches (a double flick), later the folded ear lifts and drops.
d = 7.3
ears = anim("Ears", d, [
    track("ear-r", "rotation", [(0, 0), (2.0, 0), (2.07, 0.2), (2.3, 0), (2.42, 0.12), (2.65, 0), (d, 0)]),
    track("ear-l-link", "rotation", [(0, 0), (5.0, 0), (5.15, -0.1), (5.6, 0), (d, 0)]),
])
# Tail, 9 s: a slow lazy sway, then a burst of wagging.
d = 9.0
def tail_tracks(keys_root, follow=(1.0, 1.4)):
    """the two outer bones follow the root's swing with more bend and a little delay."""
    out = [track("tail-1", "rotation", keys_root)]
    for k, (gain, delay) in enumerate([(follow[0], 0.06), (follow[1], 0.12)]):
        out.append(track(f"tail-{k + 2}", "rotation",
                         [(min(t + delay, d) if 0 < t < d else t, v * gain) for t, v in keys_root]))
    return out
sway = [(0, 0), (1.5, 0.07), (3.0, 0), (4.5, -0.05), (6.0, 0)]
wag = wave(6.0, 8.2, 0.22, 0.32)
tail_idle = anim("Tail", d, tail_tracks(sway + wag[1:] + [(d, 0)]))
d = 0.36
tail_happy = anim("TailHappy", d, tail_tracks([(0, -0.24), (d / 2, 0.24), (d, -0.24)], (1.1, 1.3)))
# Blink, 4.7 s: one blink, then a double one.
d = 4.7
def shown(spans, d_):
    keys = [(0, 0, "hold")]
    for a, b in spans:
        keys += [(a, 1, "hold"), (b, 0, "hold")]
    return keys + [(d_, 0, "hold")]
blink_anim = anim("Blink", d, [track("Blink", "opacity", shown([(1.4, 1.53), (3.9, 4.02), (4.2, 4.33)], d))])
# Face: at rest now and then he pants a while; happy (petted) = squinting eyes, tongue out.
d = 15.0
face_idle = anim("face-idle", d, [solo_keys("Face", [(0, "face-rest"), (8.0, "face-pant-n"), (12.5, "face-rest")], d)])
face_happy = anim("face-happy", 1 / S, [solo_keys("Face", [(0, "face-happy-n")], 1 / S)], "oneShot")
# Collars and the scarf: one held pose each.
collar_anims = [anim(f"collar-{k}", 1 / S, [solo_keys("Collar", [(0, n)], 1 / S)], "oneShot")
                for k, n in enumerate(["collar-none"] + [f"collar-{c}" for c in COLLARS])]
scarf_off = anim("scarf-off", 1 / S, [track("Scarf", "opacity", [(0, 0, "hold")])], "oneShot")
scarf_on = anim("scarf-on", 1 / S, [track("Scarf", "opacity", [(0, 1, "hold")])], "oneShot")

# ---- state machine ------------------------------------------------------------------------------
def vm_bool(s, value):
    return (f'<TransitionViewModelCondition><TransitionPropertyViewModelComparator><BindablePropertyBoolean>'
            f'<DataBindContext sourcePathIds="{VM}-{VMP[s]}" propertyKey="634"/>'
            f'</BindablePropertyBoolean></TransitionPropertyViewModelComparator>'
            f'<TransitionValueBooleanComparator value="{value}"/></TransitionViewModelCondition>')

def vm_number(s, value):
    return (f'<TransitionViewModelCondition opValue="0"><TransitionPropertyViewModelComparator><BindablePropertyNumber>'
            f'<DataBindContext sourcePathIds="{VM}-{VMP[s]}" propertyKey="636"/>'
            f'</BindablePropertyNumber></TransitionPropertyViewModelComparator>'
            f'<TransitionValueNumberComparator value="{value}"/></TransitionViewModelCondition>')

def layer(name, states, entry):
    return (f'<StateMachineLayer name="{name}" id="{nid()}">\n'
            f'    <AnyState x="200" y="-120"/><ExitState x="400" y="-120"/>\n'
            f'    <EntryState><StateTransition stateToId="{entry}"/></EntryState>\n'
            + "\n".join(states) + "\n</StateMachineLayer>")

def state(sid, aid, transitions, x=100, y=0):
    return f'    <AnimationState x="{x}" y="{y}" animationId="{aid}" id="{sid}">' + "".join(transitions) + '</AnimationState>'

def switch(name, a, b, cond_on, cond_off, mix=0):
    """two states: a while the condition is off, b while it is on."""
    sa, sb = nid(), nid()
    m = f' duration="{mix}" interpolationType="cubic"' if mix else ""
    return layer(name, [state(sa, a[0], [f'<StateTransition stateToId="{sb}"{m}>{cond_on}</StateTransition>']),
                        state(sb, b[0], [f'<StateTransition stateToId="{sa}"{m}>{cond_off}</StateTransition>'], 300)], sa)

layers = []
for a in (breath, head_anim, ears, blink_anim):
    sid = nid()
    layers.append(layer(a[1].split('name="')[1].split('"')[0], [state(sid, a[0], [])], sid))
layers.append(switch("tail", tail_idle, tail_happy, vm_bool("happy", "true"), vm_bool("happy", "false"), 200))
layers.append(switch("face", face_idle, face_happy, vm_bool("happy", "true"), vm_bool("happy", "false")))
layers.append(switch("scarf", scarf_off, scarf_on, vm_bool("scarf", "true"), vm_bool("scarf", "false")))
cs = [nid() for _ in collar_anims]
layers.append(layer("collar", [state(cs[k], a[0], [f'<StateTransition stateToId="{cs[j]}">{vm_number("collar", j)}</StateTransition>'
                                                   for j in range(len(cs)) if j != k], 100 * k)
                               for k, a in enumerate(collar_anims)], cs[0]))

all_anims = [a[1] for a in [breath, head_anim, ears, tail_idle, tail_happy, blink_anim, face_idle, face_happy,
                            scarf_off, scarf_on] + collar_anims]
rml = f'''<Rive version="1" kind="fragment">
{chr(10).join(assets)}
{viewmodel}
    <Artboard viewModelId="{VM}" viewModelInstanceId="{VMI}" defaultStateMachineId="0:7" styleId="0:5" width="{W}" height="{H_}" name="Sans" id="0:2">
        <LayoutComponentStyle name="Artboard Style" id="0:5"/>
        <Fill name="Background"><SolidColor colorValue="{BOARD_BG}" name="Color"/></Fill>
{dog}
        <StateMachine name="State Machine 1" id="0:7">
{chr(10).join(layers)}
        </StateMachine>
{chr(10).join(all_anims)}
    </Artboard>
</Rive>
'''
open(os.path.join(PROJ, "scene.rml"), "w").write(rml)
print("ok", len(assets), "images", {k: v for k, v in meta.items()})
