"""Dressed mannequin rig (angled pose) as a Rive RML scene, with outfit slots.

Parts are the see-through layers of the mannequin and of three outfit pictures drawn on it,
with the original pictures' pixels put back by project_layers.py (art/pilot/18-rig/rig-dressed/),
all on the same 1280 canvas, so they stack with no offsets.
Slots are view model booleans (top, bottom, shoes); each drives one state machine layer
that shows or hides the slot's parts. The face takes two more view model inputs: `talking`
(the mouth runs through speech shapes) and `mood` (0 neutral, 1 smile, 2 laugh, 3 sad: the mouth
at rest, and the one he goes back to when he stops talking). The game sets them; nothing else changes.
Eye and mouth patches come from face_patches.py.
Usage: python3 scripts/rig/gen3.py art/pilot/18-rig/rive/dressrig
"""
import os, sys
import numpy as np
from PIL import Image

PROJ = sys.argv[1]
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
R = os.path.join(ROOT, "art/pilot/18-rig/rig-dressed/")
M, H, J, K = "manken", "hoodie", "jeans", "sneakers"
OX, OY, W, H_ = 380, 0, 520, 1260

# name: (source folder, layer file, slot)
SRC = {
    "arm-far": (M, "00-handwear-l", None), "sleeve-far": (H, "00-handwear-l", "top"),
    "back-hair": (M, "01-back hair", None), "legs": (M, "02-legwear", None),
    "sneakers": (K, "03-footwear", "shoes"), "shorts": (M, "04-bottomwear", None),
    "jeans": (J, "03-bottomwear", "bottom"), "neck": (M, "03-neck", None),
    "arm-near": (M, "05-handwear-r", None), "tank": (M, "06-topwear", None),
    "hoodie": (H, "05-topwear", "top"), "sleeve-near": (H, "06-handwear-r", "top"),
    "ears": (M, "07-ears", None), "face": (M, "08-face", None), "mouth": (M, "09-mouth", None),
    "nose": (M, "10-nose", None), "eyewhite-r": (M, "11-eyewhite-r", None),
    "eyewhite-l": (M, "12-eyewhite-l", None), "irides-l": (M, "13-irides-l", None),
    "irides-r": (M, "14-irides-r", None), "eyelash-l": (M, "15-eyelash-l", None),
    "eyelash-r": (M, "16-eyelash-r", None), "eyebrow-l": (M, "17-eyebrow-l", None),
    "eyebrow-r": (M, "18-eyebrow-r", None), "front-hair": (M, "19-front hair", None),
}
# Patches from the side face close-ups: eye states (blink, half blink, glances) and mouths.
EYE_STATES = ["blink", "halfblink", "look-left", "neutral"]
for st in EYE_STATES:
    for s in "lr":
        SRC[f"eyes-{st}-{s}"] = ("eyes", f"{st}-{s}", None)
MOODS = ["mouth", "mouth-smile", "mouth-laugh", "mouth-sad"]   # index = view model `mood`
TALK = ["mouth-talk-a", "mouth-talk-e", "mouth-talk-o"]
for m in MOODS[1:] + TALK:
    SRC[m] = ("mouth", m[len("mouth-"):], None)
SLOTS = ["top", "bottom", "shoes"]

os.makedirs(os.path.join(PROJ, "parts"), exist_ok=True)
meta, masks = {}, {}
for name, (src, layer, _) in SRC.items():
    im = Image.open(f"{R}{src}/{layer}.png").convert("RGBA")
    box = im.getbbox()
    im.crop(box).save(os.path.join(PROJ, "parts", f"{name}.png"), optimize=True)
    meta[name] = box
    masks[name] = np.asarray(im)[..., 3] > 128


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
        assets.append(f'    <ImageAsset file="parts/{name}.png" name="{name}" id="{asset_ids[name]}"/>')
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

# Outfit slots split across draw depths; each piece gets its own node, all keyed together.
SLOT_NODES = {"top": ["top-sleeve-far", "top-body", "top-sleeve-near"], "bottom": ["bottom-jeans"],
              "shoes": ["shoes-sneakers"]}

# ---- hierarchy (top-most first) ----------------------------------------------------------
eyes = []
for s in "lr":
    eyes += [node(f"eye-{s}", HEAD, HEAD, [image(f"eyelash-{s}", HEAD), image(f"irides-{s}", HEAD),
                                           image(f"eyewhite-{s}", HEAD)])]
iris = {}
# The mouth is a Solo: one of its children shows (the mannequin's own mouth at rest).
mouth = (f'<Solo x="0" y="0" activeComponentId="{{active}}" name="Mouth" id="{{solo}}">\n'
         + "\n".join(image(m, HEAD) for m in MOODS + TALK) + "\n</Solo>")
ids["Mouth"] = nid()
mouth = mouth.replace("{active}", ids["mouth"]).replace("{solo}", ids["Mouth"])
# Each eye state is one node over both eyes; the blink states sit above the glances.
eye_patches = [node(f"eyes-{st}", HEAD, HEAD, [image(f"eyes-{st}-{s}", HEAD) for s in "lr"])
               .replace("<Node ", '<Node opacity="0" ', 1) for st in EYE_STATES]   # hidden at rest
features = node("features", HEAD, HEAD,
                [image("eyebrow-l", HEAD), image("eyebrow-r", HEAD)] + eye_patches + eyes
                + [image("nose", HEAD), mouth])
head = node("Head", HEAD, BODY, [image("front-hair", HEAD), features, image("face", HEAD), image("ears", HEAD)])
arm_near = node("ArmNear", ARM_NEAR, BODY, [image("arm-near", ARM_NEAR)])
sleeve_near = slot_node("top-sleeve-near", ARM_NEAR, BODY, ["sleeve-near"])
torso = node("Torso", BODY, BODY, [slot_node("top-body", BODY, BODY, ["hoodie"]), image("tank", BODY)])
body_front = node("Body", BODY, ART, [head, sleeve_near, torso, arm_near, image("neck", BODY)])

legs = node("Legs", BODY, ART, [slot_node("bottom-jeans", BODY, BODY, ["jeans"]), image("shorts", BODY),
                                 slot_node("shoes-sneakers", BODY, BODY, ["sneakers"]), image("legs", BODY)])

hair_back = node("HeadBack", HEAD, BODY, [image("back-hair", HEAD)])
arm_far = node("ArmFar", ARM_FAR, BODY, [slot_node("top-sleeve-far", ARM_FAR, ARM_FAR, ["sleeve-far"]),
                                         image("arm-far", ARM_FAR)])
body_back = node("BodyBack", BODY, ART, [hair_back, arm_far])
scene_nodes = "\n".join([body_front, legs, body_back])

# ---- view model ---------------------------------------------------------------------------
VM, VMI = nid(), nid()
BOOLS, NUMBERS = SLOTS + ["talking"], ["mood"]
VMP = {s: nid() for s in BOOLS + NUMBERS}
viewmodel = (f'<ViewModel defaultInstanceId="{VMI}" name="Hero" id="{VM}">\n'
             + "".join(f'    <ViewModelPropertyBoolean name="{s}" id="{VMP[s]}"/>\n' for s in BOOLS)
             + "".join(f'    <ViewModelPropertyNumber name="{s}" id="{VMP[s]}"/>\n' for s in NUMBERS)
             + f'    <ViewModelInstance exports="true" name="Default" id="{VMI}">\n'
             + "".join(f'        <ViewModelInstanceBoolean propertyValue="false" viewModelPropertyId="{VMP[s]}"/>\n'
                       for s in BOOLS)
             + "".join(f'        <ViewModelInstanceNumber propertyValue="0" viewModelPropertyId="{VMP[s]}"/>\n'
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
    track("ArmNear", "rotation", near), track("top-sleeve-near", "rotation", near),
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

# Slot layers: one Off and one On pose per slot (single-frame, held).
slot_anims = {}
# Parts a worn slot replaces: the sleeves carry their own hands, and the bare arm would peek out
# at the shoulder cap.
SLOT_HIDES = {"top": ["arm-near", "arm-far"], "bottom": [], "shoes": []}
for s in SLOTS:
    shown = lambda v: ([track(n, "opacity", [(0, v, "hold")]) for n in SLOT_NODES[s]]
                       + [track(n, "opacity", [(0, 1 - v, "hold")]) for n in SLOT_HIDES[s]])
    off = anim(f"{s}-off", 1, shown(0), "oneShot")
    on = anim(f"{s}-on", 1, shown(1), "oneShot")
    slot_anims[s] = (off, on)

# Mouth: one held pose per mood, and a talk loop (2.4 s, uneven rhythm with short pauses).
def mouth_keys(seq, end):
    keys = "".join(f'<KeyFrameId value="{ids[m]}" frame="{int(t * S)}"/>' for t, m in seq)
    return (f'<KeyedObject objectId="{ids["Mouth"]}"><KeyedProperty property="activeComponentId">'
            f'{keys}<KeyFrameId value="{ids[seq[0][1]]}" frame="{end}"/></KeyedProperty></KeyedObject>')
mood_anims = [anim(f"mood-{i}", 1, [mouth_keys([(0, m)], 1)], "oneShot") for i, m in enumerate(MOODS)]
a, e, o, rest = TALK + ["mouth"]
talk_seq = [(0, a), (.12, e), (.24, rest), (.34, o), (.48, a), (.6, e), (.72, rest), (.98, a), (1.1, o),
            (1.24, e), (1.36, a), (1.5, rest), (1.8, e), (1.92, a), (2.06, o), (2.2, rest)]
talk_anim = anim("talk", int(2.4 * S), [mouth_keys(talk_seq, int(2.4 * S))])

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
    (off_id, _), (on_id, _) = slot_anims[s]
    so, sn = nid(), nid()
    layers.append(f'''<StateMachineLayer name="slot-{s}" id="{nid()}">
    <AnyState x="200" y="-120"/><ExitState x="400" y="-120"/>
    <EntryState><StateTransition stateToId="{so}"/></EntryState>
    <AnimationState x="100" animationId="{off_id}" id="{so}">
        <StateTransition stateToId="{sn}">{vm_condition(s, "true")}</StateTransition>
    </AnimationState>
    <AnimationState x="300" animationId="{on_id}" id="{sn}">
        <StateTransition stateToId="{so}">{vm_condition(s, "false")}</StateTransition>
    </AnimationState>
</StateMachineLayer>''')

# Mouth layer: mood states, all linked to each other and to Talk.
mood_states = [nid() for _ in MOODS]
talk_state = nid()
states = []
for i, (aid, _) in enumerate(mood_anims):
    tr = [f'<StateTransition stateToId="{talk_state}">{vm_condition("talking", "true")}</StateTransition>']
    tr += [f'<StateTransition stateToId="{mood_states[j]}">{vm_number("mood", j)}</StateTransition>'
           for j in range(len(MOODS)) if j != i]
    states.append(f'<AnimationState x="{100 * i}" animationId="{aid}" id="{mood_states[i]}">' + "".join(tr) + '</AnimationState>')
tr = [f'<StateTransition stateToId="{mood_states[j]}">{vm_condition("talking", "false")}{vm_number("mood", j)}</StateTransition>'
      for j in range(len(MOODS))]
states.append(f'<AnimationState x="150" y="150" animationId="{talk_anim[0]}" id="{talk_state}">' + "".join(tr) + '</AnimationState>')
layers.append(f'''<StateMachineLayer name="mouth" id="{nid()}">
    <AnyState x="200" y="-120"/><ExitState x="400" y="-120"/>
    <EntryState><StateTransition stateToId="{mood_states[0]}"/></EntryState>
    {chr(10).join(states)}
</StateMachineLayer>''')

all_anims = ([a for _, a in loops] + [a for pair in slot_anims.values() for _, a in pair]
             + [a for _, a in mood_anims] + [talk_anim[1]])
rml = f'''<Rive version="1" kind="fragment">
{chr(10).join(assets)}
{viewmodel}
    <Artboard viewModelId="{VM}" viewModelInstanceId="{VMI}" defaultStateMachineId="0:7" styleId="0:5" width="{W}" height="{H_}" name="Hero" id="0:2">
        <LayoutComponentStyle name="Artboard Style" id="0:5"/>
        <Fill name="Background"><SolidColor colorValue="FFE8EEF4" name="Color"/></Fill>
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
