"""Dressed mannequin rig (angled pose) as a Rive RML scene, with outfit slots.

Parts are the see-through layers of the mannequin and of three outfit pictures drawn on it,
with the original pictures' pixels put back by project_layers.py (art/pilot/18-rig/rig-dressed/),
all on the same 1280 canvas, so they stack with no offsets.
Slots are view model numbers (top, bottom, shoes: 0 = bare, then OUTFITS in the game's order);
each drives one state machine layer that shows that outfit's parts and hides the others. Arms bend: each arm and sleeve image is a mesh skinned to a
shoulder -> elbow -> wrist bone chain, which only breathes with the idle (raised arms looked
comic, 2026-10-27); `pose` (number: 0 rest, 1 cold) shivers the body. The face takes two more view model inputs: `talking`
(the mouth runs through speech shapes) and `mood` (the mouth and brows at rest, and the face he
goes back to when he stops talking; see MOOD_FACES). The game sets them; nothing else changes. The
face of a pose is the game's: cold goes with mood 4 (worried); joy is only mood 2 (laugh).
Eye and mouth patches come from face_patches.py.
Usage: python3 scripts/rig/gen3.py art/pilot/18-rig/rive/dressrig [--game]
"""
import base64, glob, math, os, re, sys
import numpy as np
from PIL import Image

PROJ = sys.argv[1]
# --game: the game's file: see-through background and webp parts (a quarter of the size, no
# visible change); without it a light grey background for videos, png parts.
GAME = "--game" in sys.argv
BOARD_BG = "00000000" if GAME else "FFE8EEF4"
PART_EXT = "webp" if GAME else "png"


def save_part(im, name):
    """A part image; the png is always written (later steps read it), the webp for the game."""
    im.save(os.path.join(PROJ, "parts", f"{name}.png"), optimize=True)
    if GAME:
        im.save(os.path.join(PROJ, "parts", f"{name}.webp"), "WEBP", quality=90, method=6)
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
R = os.path.join(ROOT, "art/pilot/18-rig/rig-dressed/")
M, H, J, K = "manken", "hoodie", "jeans", "sneakers"
# Slot value - 1, in the order of the game's outfits (core/config/lifestyle.ts); parts come from
# see-through (project_layers.py), or from wear_cut.py for a picture see-through has not split yet.
OUTFITS = ["hoodie", "work", "smart", "coat", "suit", "threepiece", "tux"]
OX, OY, W, H_ = 20, -140, 1200, 1400   # room around the body

# name: (source folder, layer file, slot)
SRC = {
    "arm-far": (M, "00-handwear-l", None),
    "back-hair": (M, "01-back hair", None), "legs": (M, "02-legwear", None),
    "shorts": (M, "04-bottomwear", None), "neck": (M, "03-neck", None),
    "arm-near": (M, "05-handwear-r", None), "tank": (M, "06-topwear", None),
    "ears": (M, "07-ears", None), "face": (M, "08-face", None), "mouth": (M, "09-mouth", None),
    "nose": (M, "10-nose", None), "eyewhite-r": (M, "11-eyewhite-r", None),
    "eyewhite-l": (M, "12-eyewhite-l", None), "irides-l": (M, "13-irides-l", None),
    "irides-r": (M, "14-irides-r", None), "eyelash-l": (M, "15-eyelash-l", None),
    "eyelash-r": (M, "16-eyelash-r", None), "eyebrow-l": (M, "17-eyebrow-l", None),
    "eyebrow-r": (M, "18-eyebrow-r", None), "front-hair": (M, "19-front hair", None),
}
for o in OUTFITS:
    street = o == "hoodie"
    SRC[f"sleeve-far-{o}"] = (H if street else f"{o}-top", "handwear-l", "top")
    SRC[f"top-{o}"] = (H if street else f"{o}-top", "topwear", "top")
    SRC[f"sleeve-near-{o}"] = (H if street else f"{o}-top", "handwear-r", "top")
    SRC[f"bottom-{o}"] = (J if street else f"{o}-bottom", "bottomwear", "bottom")
    SRC[f"shoes-{o}"] = (K if street else f"{o}-shoes", "footwear", "shoes")
# see-through filed the tuxedo trousers as legwear (they reach the shoes); the layer is clean.
SRC["bottom-tux"] = ("tux-bottom", "legwear", "bottom")
# Patches from the side face close-ups: eye states (blink, half blink, glances) and mouths.
EYE_STATES = ["blink", "halfblink", "look-left", "neutral"]
for st in EYE_STATES:
    for s in "lr":
        SRC[f"eyes-{st}-{s}"] = ("eyes", f"{st}-{s}", None)
MOUTHS = ["mouth", "mouth-smile", "mouth-laugh", "mouth-sad"]
TALK = ["mouth-talk-a", "mouth-talk-e", "mouth-talk-o"]
for m in MOUTHS[1:] + TALK:
    SRC[m] = ("mouth", m[len("mouth-"):], None)
BROWS = ["brows", "brows-worried", "brows-determined", "brows-raised"]   # "brows" = the mannequin's own
for b in BROWS[1:]:
    for s in "lr":
        SRC[f"{b}-{s}"] = ("brows", f"{b[len('brows-'):]}-{s}", None)
# View model `mood` (index): (mouth, brows).
MOOD_FACES = [("mouth", "brows"),                       # 0 neutral
              ("mouth-smile", "brows"),                 # 1 smile
              ("mouth-laugh", "brows-raised"),          # 2 laugh
              ("mouth-sad", "brows-worried"),           # 3 sad
              ("mouth", "brows-worried"),               # 4 worried
              ("mouth", "brows-determined"),            # 5 determined
              ("mouth-talk-o", "brows-raised")]         # 6 surprised
SLOTS = ["top", "bottom", "shoes"]

def layer_file(src, layer):
    """A layer by its see-through name; files may carry a stack number (05-topwear.png), which
    differs from picture to picture."""
    exact = f"{R}{src}/{layer}.png"
    if os.path.exists(exact):
        return exact
    found = [f for f in glob.glob(f"{R}{src}/*.png") if re.sub(r"^\d+-", "", os.path.basename(f)[:-4]) == layer]
    if len(found) != 1:
        sys.exit(f"{src}: {len(found)} files for layer {layer}")
    return found[0]


os.makedirs(os.path.join(PROJ, "parts"), exist_ok=True)
meta, masks = {}, {}
for name, (src, layer, _) in SRC.items():
    im = Image.open(layer_file(src, layer)).convert("RGBA")
    box = im.getbbox()
    save_part(im.crop(box), name)
    meta[name] = box
    masks[name] = np.asarray(im)[..., 3] > 128

# The bare near arm is cut in two: its top (under the tank's armhole, which covers the shoulder)
# draws under the torso, the forearm and hand over it, so a hand brought in (cold) passes in front
# of the chest. The cut is above the elbow's blend, where both pieces move rigidly with the upper arm.
SPLITS = {"arm-near": 420}
for name, cut in SPLITS.items():
    src, layer, _ = SRC[name]
    full = np.asarray(Image.open(layer_file(src, layer)).convert("RGBA"))
    for part, rows in (("top", slice(cut, None)), ("low", slice(None, cut))):
        a = full.copy(); a[rows, :, 3] = 0
        im = Image.fromarray(a); box = im.getbbox()
        save_part(im.crop(box), f"{name}-{part}")
        meta[f"{name}-{part}"] = box


def top_centre(name, rows=30):
    m = masks[name]
    y0 = meta[name][1]
    ys, xs = np.nonzero(m[y0:y0 + rows])
    return (float(xs.mean()), float(y0 + rows * 0.55))


def center(name):
    b = meta[name]
    return ((b[0] + b[2]) / 2, (b[1] + b[3]) / 2)


ART = (OX, OY)
BODY = (center("shorts")[0], meta["shorts"][1])          # hips
ARM_NEAR = top_centre("arm-near")                          # shoulder joints
ARM_FAR = top_centre("arm-far")
HEAD = (center("neck")[0], meta["face"][3] - 4)          # where the jaw meets the neck

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

def image(name, pivot):
    x0, y0 = meta[name][:2]
    i = nid(); ids[name] = i
    return (f'<Image x="{x0 - pivot[0]:.1f}" y="{y0 - pivot[1]:.1f}" originX="0" originY="0" '
            f'assetId="{asset(name)}" name="{name}" id="{i}"/>')

def node(name, pivot, parent_pivot, children):
    """children are listed top-most first (Rive draws the first child on top)."""
    i = nid(); ids[name] = i
    return (f'<Node x="{pivot[0] - parent_pivot[0]:.1f}" y="{pivot[1] - parent_pivot[1]:.1f}" name="{name}" id="{i}">\n'
            + "\n".join(children) + "\n</Node>")

def slot_node(name, pivot, parent_pivot, parts):
    """A slot part sits in its own node so its state machine layer can fade it."""
    return node(name, pivot, parent_pivot, [image(p, pivot) for p in parts])

# ---- arms: bones and skinned meshes ----------------------------------------------------------
# Joints on the canvas, from the arm layers' width profile (elbow and wrist = the narrow rows).
JOINTS = {"near": [(534, 300), (498, 465), (488, 612), (500, 740)],   # shoulder, elbow, wrist, hand tip
          "far": [(698, 305), (721, 455), (774, 632), (775, 739)]}
BONE_NAMES = ["upper", "fore", "hand"]
bones = {}   # arm -> [(id, world angle, world position)] for the bind pose

def angle(a, b):
    return math.atan2(b[1] - a[1], b[0] - a[0])

def arm_bones(arm, pivot, inside=None):
    """RootBone chain inside the arm's node (which sits at `pivot`); returns the RML. `inside`:
    {bone name: RML} put inside that bone (in its space: origin at its start, x along it)."""
    inside = inside or {}
    j = JOINTS[arm]
    out, prev, chain = "", 0.0, []
    for k, nm in enumerate(BONE_NAMES):
        a, b = j[k], j[k + 1]
        th = angle(a, b)
        i = nid(); ids[f"{arm}-{nm}"] = i
        chain.append((i, th, (a[0] - ART[0], a[1] - ART[1]), th - prev))
        length = math.dist(a, b)
        if k == 0:
            out += (f'<RootBone x="{a[0] - pivot[0]:.2f}" y="{a[1] - pivot[1]:.2f}" length="{length:.2f}" '
                    f'rotation="{th:.5f}" name="{arm}-{nm}" id="{i}">')
        else:
            out += f'<Bone length="{length:.2f}" rotation="{th - prev:.5f}" name="{arm}-{nm}" id="{i}">'
        out += inside.get(nm, "")
        prev = th
    out += "</Bone>" * (len(BONE_NAMES) - 1) + "</RootBone>"
    bones[arm] = chain
    return out

def varuint(n):
    b = bytearray()
    while True:
        byte = n & 0x7F; n >>= 7
        if n: b.append(byte | 0x80)
        else:
            b.append(byte); return bytes(b)

ELBOW_BLEND = 34   # px on each side of the elbow where the arm curves (narrow = a sharp fold)
# The hand is cut from the forearm with no blend (see skinned_image); for a sleeve the cut is at
# the cuff's edge, where the cuff hides it.
def cuff_row(name):
    """first row below the elbow where the sleeve image is mostly skin (the hand out of the cuff)."""
    src, layer, _ = SRC[name]
    a = np.asarray(Image.open(layer_file(src, layer)).convert("RGBA")).astype(int)
    on = a[..., 3] > 128
    skin = on & (a[..., 0] > 150) & (a[..., 0] - a[..., 2] > 40)
    el = JOINTS["near" if "near" in name else "far"][1]
    for y in range(int(el[1]), a.shape[0]):
        if on[y].sum() and skin[y].sum() / on[y].sum() > 0.5:
            return y
    raise ValueError(name)

def smooth(x, half):
    t = min(max((x + half) / (2 * half), 0.0), 1.0)
    return t * t * (3 - 2 * t)

def skinned_image(name, arm, pivot, cell=(20, 16)):
    """The image on a grid mesh; each vertex follows upper arm, forearm and hand (blended at the
    elbow). The hand is its own piece of the mesh, cut from the forearm along a line square to the
    hand bone (at the wrist, or for a sleeve at the cuff's edge). The wrist does not bend, so the
    two pieces move as one."""
    x0, y0, x1, y1 = meta[name]
    w, h = x1 - x0, y1 - y0
    cols, rows = max(2, round(w / cell[0])), max(2, round(h / cell[1]))
    sh, el, wr, tip = JOINTS[arm]
    ax = np.subtract(wr, sh) / math.dist(sh, wr)              # along the arm
    axh = np.subtract(tip, wr) / math.dist(wr, tip)            # along the hand
    hand_at = np.array(wr, float)
    if name.startswith("sleeve"):
        y = cuff_row(name)
        hand_at = np.array(wr) + (np.subtract(tip, wr)) * (y - wr[1]) / (tip[1] - wr[1])
    xs = [w * c / cols for c in range(cols + 1)]

    def cut_y(vx):
        """local y of the cut line at local x (the line through hand_at, square to the hand)."""
        X = x0 + vx
        return hand_at[1] - (X - hand_at[0]) * axh[0] / axh[1] - y0

    ys = [h * r / rows for r in range(rows + 1)]
    lo, hi = min(cut_y(0), cut_y(w)), max(cut_y(0), cut_y(w))
    if hi > 1 and lo < h - 1:   # the cut crosses this image: forearm piece, then hand piece
        pieces = [([y for y in ys if y < lo - 6] + ["cut"], False), (["cut"] + [y for y in ys if y > hi + 6], True)]
    else:
        pieces = [(ys, lo <= 0)]
    verts, tris = [], []
    for rows_, is_hand in pieces:
        base = len(verts)
        for ry in rows_:
            for vx in xs:
                vy = cut_y(vx) if ry == "cut" else ry
                p = np.array([x0 + vx, y0 + vy])
                fore = smooth(float(np.dot(p - el, ax)), ELBOW_BLEND)
                hand = 1.0 if is_hand else 0.0
                ws = [1 - fore, fore * (1 - hand), fore * hand]
                vals = [round(v * 255) for v in ws]
                vals[int(np.argmax(ws))] += 255 - sum(vals)
                used = [(k + 1, v) for k, v in enumerate(vals) if v > 0]
                idx = sum(k << (8 * n) for n, (k, _) in enumerate(used))
                val = sum(v << (8 * n) for n, (_, v) in enumerate(used))
                verts.append(f'<MeshVertex x="{vx:.2f}" y="{vy:.2f}" u="{vx / w:.5f}" v="{vy / h:.5f}">'
                             f'<Weight values="{val}" indices="{idx}"/></MeshVertex>')
        n = cols + 1
        for r in range(len(rows_) - 1):
            for c in range(cols):
                a = base + r * n + c
                tris += [a, a + 1, a + n + 1, a, a + n + 1, a + n]
    tb = base64.b64encode(b"".join(varuint(t) for t in tris)).decode()
    tendons = "".join(
        f'<Tendon boneId="{bid}" xx="{math.cos(th):.6f}" xy="{math.sin(th):.6f}" yx="{-math.sin(th):.6f}" '
        f'yy="{math.cos(th):.6f}" tx="{pos[0]:.2f}" ty="{pos[1]:.2f}" name="{nm}"/>'
        for (bid, th, pos, _), nm in zip(bones[arm], BONE_NAMES))
    i = nid(); ids[name] = i
    return (f'<Image x="{x0 - pivot[0]:.1f}" y="{y0 - pivot[1]:.1f}" originX="0" originY="0" '
            f'assetId="{asset(name)}" name="{name}" id="{i}">'
            f'<Mesh triangleIndexBytes="{tb}" name="{name}-mesh" id="{nid()}">' + "".join(verts)
            + f'<Skin tx="{x0 - ART[0]:.2f}" ty="{y0 - ART[1]:.2f}" name="Skin">{tendons}</Skin></Mesh></Image>')

# Outfit slots split across draw depths; each piece gets its own node, all keyed together.
# slot -> outfit -> its nodes.
SLOT_NODES = {"top": {o: [f"top-sleeve-far-{o}", f"top-body-{o}", f"top-sleeve-near-{o}"] for o in OUTFITS},
              "bottom": {o: [f"slot-bottom-{o}"] for o in OUTFITS},
              "shoes": {o: [f"slot-shoes-{o}"] for o in OUTFITS}}

# ---- hierarchy (top-most first) ----------------------------------------------------------
eyes = []
for s in "lr":
    eyes += [node(f"eye-{s}", HEAD, HEAD, [image(f"eyelash-{s}", HEAD), image(f"irides-{s}", HEAD),
                                           image(f"eyewhite-{s}", HEAD)])]
iris = {}
# The mouth is a Solo: one of its children shows (the mannequin's own mouth at rest).
def solo(name, children, active):
    body_ = "\n".join(children)
    i = nid(); ids[name] = i
    return f'<Solo x="0" y="0" activeComponentId="{ids[active]}" name="{name}" id="{i}">\n{body_}\n</Solo>'
mouth = solo("Mouth", [image(m, HEAD) for m in MOUTHS + TALK], "mouth")
# Brows: a Solo of pairs (the mannequin's own brows at rest).
brows = solo("Brows", [node(b, HEAD, HEAD, [image(f"{'eyebrow' if b == 'brows' else b}-{s}", HEAD) for s in "lr"])
                       for b in BROWS], "brows")
# Each eye state is one node over both eyes; the blink states sit above the glances.
eye_patches = [node(f"eyes-{st}", HEAD, HEAD, [image(f"eyes-{st}-{s}", HEAD) for s in "lr"])
               .replace("<Node ", '<Node opacity="0" ', 1) for st in EYE_STATES]   # hidden at rest
features = node("features", HEAD, HEAD,
                [brows] + eye_patches + eyes
                + [image("nose", HEAD), mouth])
head = node("Head", HEAD, BODY, [image("front-hair", HEAD), features, image("face", HEAD), image("ears", HEAD)])
# Bones first: the skinned images below need their ids.
near_bones = arm_bones("near", ARM_NEAR)
far_bones = arm_bones("far", ARM_FAR)
arm_near = node("ArmNear", ARM_NEAR, BODY, [skinned_image("arm-near-top", "near", ARM_NEAR), near_bones])
arm_near_low = node("ArmNearLow", ARM_NEAR, BODY, [skinned_image("arm-near-low", "near", ARM_NEAR)])
sleeve_near = node("SleeveNear", ARM_NEAR, BODY, [node(f"top-sleeve-near-{o}", ARM_NEAR, ARM_NEAR,
                                                      [skinned_image(f"sleeve-near-{o}", "near", ARM_NEAR)]) for o in OUTFITS])
torso = node("Torso", BODY, BODY, [slot_node(f"top-body-{o}", BODY, BODY, [f"top-{o}"]) for o in OUTFITS] + [image("tank", BODY)])
body_front = node("Body", BODY, ART, [head, sleeve_near, arm_near_low, torso, arm_near, image("neck", BODY)])

legs = node("Legs", BODY, ART, [slot_node(f"slot-bottom-{o}", BODY, BODY, [f"bottom-{o}"]) for o in OUTFITS]
            + [image("shorts", BODY)]
            + [slot_node(f"slot-shoes-{o}", BODY, BODY, [f"shoes-{o}"]) for o in OUTFITS] + [image("legs", BODY)])

hair_back = node("HeadBack", HEAD, BODY, [image("back-hair", HEAD)])
arm_far = node("ArmFar", ARM_FAR, BODY, [node(f"top-sleeve-far-{o}", ARM_FAR, ARM_FAR, [skinned_image(f"sleeve-far-{o}", "far", ARM_FAR)])
                                         for o in OUTFITS] + [skinned_image("arm-far", "far", ARM_FAR), far_bones])
body_back = node("BodyBack", BODY, ART, [hair_back, arm_far])
scene_nodes = "\n".join([body_front, legs, body_back])

# ---- view model ---------------------------------------------------------------------------
VM, VMI = nid(), nid()
BOOLS, NUMBERS = ["talking"], SLOTS + ["mood", "pose"]
DEFAULTS = {s: 1 for s in SLOTS}   # the street outfit, the game's first
VMP = {s: nid() for s in BOOLS + NUMBERS}
viewmodel = (f'<ViewModel defaultInstanceId="{VMI}" name="Hero" id="{VM}">\n'
             + "".join(f'    <ViewModelPropertyBoolean name="{s}" id="{VMP[s]}"/>\n' for s in BOOLS)
             + "".join(f'    <ViewModelPropertyNumber name="{s}" id="{VMP[s]}"/>\n' for s in NUMBERS)
             + f'    <ViewModelInstance exports="true" name="Default" id="{VMI}">\n'
             + "".join(f'        <ViewModelInstanceBoolean propertyValue="false" viewModelPropertyId="{VMP[s]}"/>\n'
                       for s in BOOLS)
             + "".join(f'        <ViewModelInstanceNumber propertyValue="{DEFAULTS.get(s, 0)}" viewModelPropertyId="{VMP[s]}"/>\n'
                       for s in NUMBERS)
             + '    </ViewModelInstance>\n</ViewModel>')

# ---- animation helpers ---------------------------------------------------------------------
def kf(v, f, interp="cubic"):
    if interp == "cubic":
        return (f'<KeyFrameDouble value="{v:.5f}" frame="{f}" interpolationType="cubic">'
                f'<CubicEaseInterpolator x1="0.42" y1="0" x2="0.58" y2="1"/></KeyFrameDouble>')
    return f'<KeyFrameDouble value="{v:.5f}" frame="{f}" interpolationType="{interp}"/>'

def track(obj, prop, keys, interp="cubic"):
    body_ = "".join(kf(v, f, k[2] if len(k) > 2 else interp) for k in keys for f, v in [k[:2]])
    return (f'<KeyedObject objectId="{ids[obj]}"><KeyedProperty property="{prop}">'
            f'{body_}</KeyedProperty></KeyedObject>')

def anim(name, dur, tracks, loop="loop"):
    i = nid()
    return i, f'<LinearAnimation loopValue="{loop}" duration="{dur}" name="{name}" id="{i}">\n' + "\n".join(tracks) + "\n</LinearAnimation>"

S = 60
loops = []

# Idle, 4.4 s: breathing, a gentle sway (front and back halves of the body move as one), arms swing.
d = int(4.4 * S)
sway = [(0, -0.006), (d // 2, 0.006), (d, -0.006)]
breath = [(0, 1.0), (d // 2, 1.006), (d, 1.0)]
near = [(0, 0.02), (d // 2, -0.012), (d, 0.02)]
loops.append(anim("Idle", d, [
    track("Body", "rotation", sway), track("BodyBack", "rotation", sway),
    track("Body", "scaleY", breath), track("BodyBack", "scaleY", breath),
    track("ArmNear", "rotation", near),
    track("ArmFar", "rotation", [(0, 0.01), (d // 2, -0.018), (d, 0.01)]),
]))

# Blink, 5.3 s: half closed, closed, half closed (patches over the open eyes), with a double
# blink now and then.
d = int(5.3 * S)
def shown(spans):
    """opacity keys: 1 inside each (start, end) frame span, 0 elsewhere."""
    keys = [(0, 0, "hold")]
    for a, b in spans:
        keys += [(a, 1, "hold"), (b, 0, "hold")]
    return keys + [(d, 0, "hold")]
starts = [int(t * S) for t in (1.2, 4.2, 4.5)]
loops.append(anim("Blink", d, [
    track("eyes-halfblink", "opacity", shown([(a, a + 3) for a in starts] + [(a + 8, a + 11) for a in starts])),
    track("eyes-blink", "opacity", shown([(a + 3, a + 8) for a in starts])),
]))

# Gaze, 11 s (not a multiple of the blink, so they drift apart): at rest he looks ahead (the
# mannequin's own eyes); now and then a glance back to the side, and one at the viewer.
d = 11 * S
def glance(a, b, fade=8):
    a, b = int(a * S), int(b * S)
    return [(a, 0), (a + fade, 1), (b - fade, 1), (b, 0)]
loops.append(anim("Gaze", d, [
    track("eyes-look-left", "opacity", [(0, 0)] + glance(2.5, 4.0) + [(d, 0)], "linear"),
    track("eyes-neutral", "opacity", [(0, 0)] + glance(7.0, 9.2) + [(d, 0)], "linear"),
]))

# Head, 13 s: a gentle tilt; the whole head moves as one. (Sliding only the eyes, nose and
# mouth for a 2.5D turn read as the face pushing out and back in: the face outline stays put.)
d = 13 * S
tilt = [(0, 0.0), (int(3.0 * S), 0.03), (int(5.5 * S), 0.0), (int(8.0 * S), -0.025), (int(10.5 * S), 0.0), (d, 0.0)]
loops.append(anim("Head", d, [track("Head", "rotation", tilt), track("HeadBack", "rotation", tilt)]))

# Slot layers: one held pose per slot value (0 = bare, then each outfit).
slot_anims = {}
# Parts a worn slot replaces: the sleeves carry their own hands, and the bare arm would peek out
# at the shoulder cap.
SLOT_HIDES = {"top": ["arm-near-top", "arm-near-low", "arm-far"], "bottom": [], "shoes": []}
for s in SLOTS:
    def worn(v):
        keys = [track(n, "opacity", [(0, 1 if k == v else 0, "hold")])
                for k, o in enumerate(OUTFITS, 1) for n in SLOT_NODES[s][o]]
        return keys + [track(n, "opacity", [(0, 0 if v else 1, "hold")]) for n in SLOT_HIDES[s]]
    slot_anims[s] = [anim(f"{s}-{v}", 1, worn(v), "oneShot") for v in range(len(OUTFITS) + 1)]

# Mouth: one held pose per mood, and a talk loop (2.4 s, uneven rhythm with short pauses).
def solo_keys(solo_, seq, end):
    keys = "".join(f'<KeyFrameId value="{ids[m]}" frame="{int(t * S)}"/>' for t, m in seq)
    return (f'<KeyedObject objectId="{ids[solo_]}"><KeyedProperty property="activeComponentId">'
            f'{keys}<KeyFrameId value="{ids[seq[0][1]]}" frame="{end}"/></KeyedProperty></KeyedObject>')
def mouth_keys(seq, end):
    return solo_keys("Mouth", seq, end)
mood_anims = [anim(f"mood-{i}", 1, [mouth_keys([(0, m)], 1), solo_keys("Brows", [(0, b)], 1)], "oneShot")
              for i, (m, b) in enumerate(MOOD_FACES)]
a, e, o, rest = TALK + ["mouth"]
talk_seq = [(0, a), (.12, e), (.24, rest), (.34, o), (.48, a), (.6, e), (.72, rest), (.98, a), (1.1, o),
            (1.24, e), (1.36, a), (1.5, rest), (1.8, e), (1.92, a), (2.06, o), (2.2, rest)]
talk_anim = anim("talk", int(2.4 * S), [mouth_keys(talk_seq, int(2.4 * S))])

# Arms: the elbows breathe with the idle sway and the arms never leave the sides (raised arms
# looked comic; joy is the face alone). `pose` holds a loop of its own (the mix into and out of it
# is the transition's).
def arm_pose(arm, deltas):
    """keys for one held pose: each bone's bind rotation plus a delta (upper arm, forearm). The hand
    keeps its bind angle to the forearm: it is cut from it with no blend, so bending the wrist
    would open a wedge at the cut."""
    deltas = tuple(deltas) + (0.0,)
    return {f"{arm}-{nm}": rel + dd for (_, _, _, rel), nm, dd in zip(bones[arm], BONE_NAMES, deltas)}
def pose(near_, far_):
    return {**arm_pose("near", near_), **arm_pose("far", far_)}
def pose_tracks(frames, d_):
    """frames: [(frame, {bone: rotation})] -> one track per bone."""
    names = frames[0][1].keys()
    return [track(n, "rotation", [(f, p[n]) for f, p in frames] + [(d_, frames[0][1][n])]) for n in names]
d = int(4.4 * S)
arms_rest = anim("arms-rest", d, pose_tracks([(0, pose((0, 0), (0, 0))), (d // 2, pose((0, -0.07), (0, -0.05)))], d))
# Cold, 0.5 s: the head sunk into the shoulders, the upper body shivering (small fast steps,
# uneven so it does not read as a rhythm; the hanging arms only follow it) and the teeth chattering
# (this layer keys the mouth over the mood's).
d = int(0.5 * S)
shiver = [(0, 0), (4, 0.012), (8, -0.01), (13, 0.014), (17, -0.012), (22, 0.01), (26, -0.014)]
SUNK = 7   # px the head drops
chatter = [(t / S, "mouth" if k % 2 else TALK[1]) for k, t in enumerate(range(0, d, 3))]
cold_anim = anim("cold", d, pose_tracks([(0, pose((0, 0), (0, 0)))], d)
                 + [track(n, "rotation", shiver + [(d, 0)], "linear") for n in ("Body", "BodyBack")]
                 + [track(n, "y", [(0, HEAD[1] - BODY[1] + SUNK), (d, HEAD[1] - BODY[1] + SUNK)]) for n in ("Head", "HeadBack")]
                 + [mouth_keys(chatter, d)])
POSES = [arms_rest, cold_anim]

def vm_number(s, value, op=0):
    return (f'<TransitionViewModelCondition opValue="{op}"><TransitionPropertyViewModelComparator><BindablePropertyNumber>'
            f'<DataBindContext sourcePathIds="{VM}-{VMP[s]}" propertyKey="636"/>'
            f'</BindablePropertyNumber></TransitionPropertyViewModelComparator>'
            f'<TransitionValueNumberComparator value="{value}"/></TransitionViewModelCondition>')

def vm_condition(s, value):
    return (f'<TransitionViewModelCondition><TransitionPropertyViewModelComparator><BindablePropertyBoolean>'
            f'<DataBindContext sourcePathIds="{VM}-{VMP[s]}" propertyKey="634"/>'
            f'</BindablePropertyBoolean></TransitionPropertyViewModelComparator>'
            f'<TransitionValueBooleanComparator value="{value}"/></TransitionViewModelCondition>')

layers = []
for i, (aid, _) in enumerate(loops):
    st = nid()
    layers.append(f'''<StateMachineLayer name="{_.split('name="')[1].split('"')[0]}" id="{nid()}">
    <AnyState x="200" y="-120"/><ExitState x="400" y="-120"/>
    <EntryState><StateTransition stateToId="{st}"/></EntryState>
    <AnimationState x="200" animationId="{aid}" id="{st}"/>
</StateMachineLayer>''')
for s in SLOTS:
    sids = [nid() for _ in slot_anims[s]]
    states = [f'<AnimationState x="{100 * v}" animationId="{aid}" id="{sids[v]}">'
              + "".join(f'<StateTransition stateToId="{sids[k]}">{vm_number(s, k)}</StateTransition>'
                        for k in range(len(sids)) if k != v) + '</AnimationState>'
              for v, (aid, _) in enumerate(slot_anims[s])]
    layers.append(f'''<StateMachineLayer name="slot-{s}" id="{nid()}">
    <AnyState x="200" y="-120"/><ExitState x="400" y="-120"/>
    <EntryState><StateTransition stateToId="{sids[DEFAULTS[s]]}"/></EntryState>
    {chr(10).join(states)}
</StateMachineLayer>''')

# Mouth layer: mood states, all linked to each other and to Talk.
mood_states = [nid() for _ in MOOD_FACES]
talk_state = nid()
states = []
for i, (aid, _) in enumerate(mood_anims):
    tr = [f'<StateTransition stateToId="{talk_state}">{vm_condition("talking", "true")}</StateTransition>']
    tr += [f'<StateTransition stateToId="{mood_states[j]}">{vm_number("mood", j)}</StateTransition>'
           for j in range(len(MOOD_FACES)) if j != i]
    states.append(f'<AnimationState x="{100 * i}" animationId="{aid}" id="{mood_states[i]}">' + "".join(tr) + '</AnimationState>')
tr = [f'<StateTransition stateToId="{mood_states[j]}">{vm_condition("talking", "false")}{vm_number("mood", j)}</StateTransition>'
      for j in range(len(MOOD_FACES))]
states.append(f'<AnimationState x="150" y="150" animationId="{talk_anim[0]}" id="{talk_state}">' + "".join(tr) + '</AnimationState>')
layers.append(f'''<StateMachineLayer name="mouth" id="{nid()}">
    <AnyState x="200" y="-120"/><ExitState x="400" y="-120"/>
    <EntryState><StateTransition stateToId="{mood_states[0]}"/></EntryState>
    {chr(10).join(states)}
</StateMachineLayer>''')

pose_states = [nid() for _ in POSES]
states = [f'<AnimationState x="{100 * v}" animationId="{aid}" id="{pose_states[v]}">'
          + "".join(f'<StateTransition stateToId="{pose_states[k]}" duration="300" interpolationType="cubic">'
                    f'{vm_number("pose", k)}</StateTransition>' for k in range(len(POSES)) if k != v)
          + '</AnimationState>' for v, (aid, _) in enumerate(POSES)]
layers.append(f'''<StateMachineLayer name="arms" id="{nid()}">
    <AnyState x="200" y="-120"/><ExitState x="400" y="-120"/>
    <EntryState><StateTransition stateToId="{pose_states[0]}"/></EntryState>
    {chr(10).join(states)}
</StateMachineLayer>''')

all_anims = ([a for _, a in loops] + [a for _, a in POSES] + [a for anims_ in slot_anims.values() for _, a in anims_]
             + [a for _, a in mood_anims] + [talk_anim[1]])
rml = f'''<Rive version="1" kind="fragment">
{chr(10).join(assets)}
{viewmodel}
    <Artboard viewModelId="{VM}" viewModelInstanceId="{VMI}" defaultStateMachineId="0:7" styleId="0:5" width="{W}" height="{H_}" name="Hero" id="0:2">
        <LayoutComponentStyle name="Artboard Style" id="0:5"/>
        <Fill name="Background"><SolidColor colorValue="{BOARD_BG}" name="Color"/></Fill>
{scene_nodes}
        <StateMachine name="State Machine 1" id="0:7">
{chr(10).join(layers)}
        </StateMachine>
{chr(10).join(all_anims)}
    </Artboard>
</Rive>
'''
open(os.path.join(PROJ, "scene.rml"), "w").write(rml)
print("ok", len(assets), "images; pivots body", BODY, "head", HEAD, "arms", ARM_NEAR, ARM_FAR)
