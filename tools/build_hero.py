#!/usr/bin/env python3
"""Chibi pixel hero of Abdelrahman, from the uploaded photo.

Pale gray hood up, black curls spilling over it, washed denim jacket,
charcoal tee. Four directions. Idle breathes and blinks. Walk is a
4-frame cycle with an obvious stride. Left is the right sprite flipped.
"""

import math
from PIL import Image, ImageDraw

W, H = 48, 64

HAIR_D = (16, 12, 11)
HAIR = (34, 25, 22)
HAIR_H = (64, 48, 40)
SKIN = (232, 186, 148)
SKIN_S = (206, 152, 114)
SKIN_D = (176, 120, 88)
BROW = (32, 22, 18)
EYE = (22, 16, 14)
WHITE = (248, 244, 236)
LIP = (184, 102, 96)
LIP_D = (146, 74, 70)
HOOD = (176, 178, 180)
HOOD_S = (142, 144, 148)
HOOD_D = (108, 110, 114)
DENIM = (104, 162, 196)
DENIM_L = (158, 202, 224)
DENIM_D = (58, 108, 146)
DENIM_E = (36, 74, 104)
SHIRT = (74, 76, 82)
SHIRT_D = (52, 54, 60)
JEAN = (44, 56, 82)
JEAN_D = (30, 38, 56)
SHOE = (26, 28, 32)
SHOE_L = (72, 76, 84)
SOLE = (236, 232, 222)
OUT = (20, 14, 16)


class Spr:
    def __init__(self):
        self.w = W
        self.h = H
        self.px = {}

    def p(self, x, y, c):
        x = int(round(x))
        y = int(round(y))
        if c is not None and 0 <= x < W and 0 <= y < H:
            self.px[(x, y)] = c

    def rect(self, x, y, w, h, c):
        for yy in range(int(h)):
            for xx in range(int(w)):
                self.p(x + xx, y + yy, c)

    def ellipse(self, cx, cy, rx, ry, c):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                nx = (x + 0.5 - cx) / rx
                ny = (y + 0.5 - cy) / ry
                if nx * nx + ny * ny <= 1:
                    self.p(x, y, c)

    def outline(self):
        extra = []
        filled = self.px
        for (x, y) in filled:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                if (x + dx, y + dy) not in filled:
                    extra.append((x + dx, y + dy))
        for x, y in extra:
            self.p(x, y, OUT)

    def image(self):
        im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        px = im.load()
        for (x, y), c in self.px.items():
            px[x, y] = (*c, 255)
        return im

    def flip(self):
        n = Spr()
        for (x, y), c in self.px.items():
            n.p(W - 1 - x, y, c)
        return n


def hair(s, cx, cy, rx, ry):
    """Bumpy curl mass. The silhouette wobbles so it reads as curls, not a helmet."""
    for y in range(int(cy - ry) - 3, int(cy + ry) + 4):
        for x in range(int(cx - rx) - 3, int(cx + rx) + 4):
            ang = math.atan2(y - cy, x - cx)
            bump = 0.20 * math.sin(ang * 8.0) + 0.06 * math.sin(ang * 3.0 + 0.7)
            rrx = rx * (1 + bump)
            rry = ry * (1 + bump * 0.55)
            if rrx <= 0 or rry <= 0:
                continue
            nx = (x + 0.5 - cx) / rrx
            ny = (y + 0.5 - cy) / rry
            d = nx * nx + ny * ny
            if d > 1:
                continue
            if d > 0.72:
                c = HAIR_D
            elif ((x * 5 + y * 3) % 13) == 0 and d < 0.55:
                c = HAIR_H
            else:
                c = HAIR
            s.p(x, y, c)


def bangs(s, cx, y):
    """Curls sitting on the forehead, in front of the hood."""
    for i, dx in enumerate((-7, -2, 3, 8)):
        x = cx + dx
        s.rect(x - 1, y, 4, 2, HAIR_D)
        s.rect(x, y, 3, 2, HAIR)
        if i % 2 == 0:
            s.p(x + 1, y, HAIR_H)


def eye(s, x, y, blink, side=False):
    s.rect(x, y, 5, 1, BROW)
    s.p(x + 4, y + 1, BROW)
    if blink:
        s.rect(x, y + 3, 5, 1, EYE)
        return
    s.rect(x, y + 2, 5, 1, EYE)
    s.p(x, y + 3, SKIN_S)
    s.p(x + 1, y + 3, EYE)
    s.p(x + 2, y + 3, WHITE)
    s.p(x + 3, y + 3, EYE)
    s.p(x + 4, y + 3, SKIN_D if not side else SKIN_S)
    s.p(x + 1, y + 4, SKIN_D)
    s.p(x + 2, y + 4, SKIN_S)


def arm(s, x, y, swing, shade=False):
    den, hi, lo = (DENIM_D, DENIM_D, DENIM_E) if shade else (DENIM, DENIM_L, DENIM_D)
    skin, skin_d = (SKIN_S, SKIN_D) if shade else (SKIN, SKIN_D)
    yy = y + swing * 3
    s.rect(x, yy, 7, 11, den)
    s.rect(x, yy, 7, 2, hi)
    s.rect(x + 1, yy + 9, 5, 2, lo)
    s.rect(x + 1, yy + 11, 5, 3, skin)
    s.rect(x + 1, yy + 14, 5, 1, skin_d)


def leg(s, x, hip, sole, phase, shade=False):
    jean, jean_d = (JEAN_D, JEAN_D) if shade else (JEAN, JEAN_D)
    if phase > 0:
        s.rect(x - 1, hip, 7, sole - 3 - hip, jean)
        s.rect(x - 1, hip, 2, sole - 3 - hip, jean_d)
        s.rect(x - 2, sole - 4, 9, 3, SHOE)
        s.rect(x, sole - 4, 3, 1, SHOE_L)
        s.rect(x - 2, sole - 1, 9, 2, SOLE)
    elif phase < 0:
        lift = 4
        s.rect(x + 1, hip, 6, max(2, sole - lift - 3 - hip), jean)
        s.rect(x + 1, hip, 2, 3, jean_d)
        s.rect(x + 1, sole - lift - 4, 7, 3, SHOE)
        s.rect(x + 1, sole - lift - 1, 7, 2, SOLE)
    else:
        s.rect(x, hip, 7, sole - 3 - hip, jean)
        s.rect(x, hip, 2, 4, jean_d)
        s.rect(x, sole - 4, 8, 3, SHOE)
        s.rect(x + 1, sole - 4, 3, 1, SHOE_L)
        s.rect(x, sole - 1, 8, 2, SOLE)


def jacket_front(s, bob, hip):
    top = 36 + bob
    # Shoulders.
    s.rect(13, top, 22, 5, DENIM)
    s.rect(13, top, 6, 4, DENIM_L)
    s.rect(29, top, 6, 4, DENIM_D)
    # Open front: denim on the sides, charcoal tee in the middle.
    s.rect(13, top + 4, 5, hip - top - 4, DENIM)
    s.rect(30, top + 4, 5, hip - top - 4, DENIM_D)
    s.rect(18, top + 4, 12, hip - top - 4, SHIRT)
    s.rect(18, top + 4, 12, 2, SHIRT_D)
    s.rect(14, top + 6, 3, 1, DENIM_E)
    s.rect(31, top + 6, 3, 1, DENIM_E)


def head_front(s, bob, blink):
    # Thin hood rims. They frame the face and stop at the collar, not a beard.
    s.rect(9, 20 + bob, 5, 16, HOOD_D)
    s.rect(10, 19 + bob, 4, 16, HOOD)
    s.rect(34, 20 + bob, 5, 16, HOOD_D)
    s.rect(34, 19 + bob, 4, 16, HOOD_S)
    hair(s, 24, 16 + bob, 15, 12)
    s.ellipse(24, 27 + bob, 8, 8, SKIN_S)
    s.ellipse(24, 26 + bob, 7, 7, SKIN)
    bangs(s, 24, 18 + bob)
    # Hood edge tucked against the cheeks.
    s.rect(15, 22 + bob, 2, 10, HOOD)
    s.rect(31, 22 + bob, 2, 10, HOOD_S)
    eye(s, 17, 23 + bob, blink)
    eye(s, 26, 23 + bob, blink)
    s.p(23, 30 + bob, SKIN_D)
    s.p(24, 30 + bob, SKIN_D)
    s.rect(22, 33 + bob, 4, 1, LIP)
    s.p(23, 34 + bob, LIP_D)
    s.p(24, 34 + bob, LIP_D)
    # Neck, then the collar covers it.
    s.rect(20, 35 + bob, 8, 4, SKIN_S)
    s.rect(21, 38 + bob, 6, 2, HOOD_S)


def draw_front(blink=False, bob=0, lleg=0, rleg=0, larm=0, rarm=0):
    s = Spr()
    sole = 60
    hip = 48 + bob
    leg(s, 15, hip, sole, lleg)
    leg(s, 27, hip, sole, rleg)
    jacket_front(s, bob, hip)
    arm(s, 6, 38 + bob, larm)
    arm(s, 35, 38 + bob, rarm)
    head_front(s, bob, blink)
    s.rect(14, 44 + bob, 6, 3, DENIM_L)
    s.rect(28, 44 + bob, 6, 3, DENIM_D)
    s.outline()
    return s


def draw_back(blink=False, bob=0, lleg=0, rleg=0, larm=0, rarm=0):
    s = Spr()
    sole = 60
    hip = 48 + bob
    leg(s, 15, hip, sole, lleg)
    leg(s, 27, hip, sole, rleg)
    top = 36 + bob
    s.rect(13, top, 22, hip - top, DENIM)
    s.rect(13, top, 4, hip - top, DENIM_L)
    s.ellipse(24, top + 2, 12, 5, DENIM)
    s.rect(16, top + 4, 16, 1, DENIM_D)
    s.rect(23, top + 4, 1, hip - top - 6, DENIM_D)
    s.rect(18, hip - 3, 12, 3, HOOD_S)
    arm(s, 6, 38 + bob, larm, shade=False)
    arm(s, 35, 38 + bob, rarm, shade=True)
    # Back of the head is curls. The hood only shows as a cuff at the neck
    # and two side panels, so it doesn't read as a blank face.
    hair(s, 24, 18 + bob, 14, 12)
    s.rect(10, 28 + bob, 4, 10, HOOD)
    s.rect(34, 28 + bob, 4, 10, HOOD_S)
    s.ellipse(24, 38 + bob, 10, 5, HOOD)
    s.ellipse(24, 37 + bob, 8, 3, HOOD_S)
    s.rect(14, 44 + bob, 20, 3, DENIM_D)
    s.outline()
    return s


def side_leg(s, x, hip, sole, phase, shade=False):
    """Profile leg. Positive phase steps toward +x."""
    jean = JEAN_D if shade else JEAN
    if phase > 0:
        s.rect(x + 4, hip, 5, sole - 3 - hip, jean)
        s.rect(x + 6, sole - 4, 9, 3, SHOE)
        s.rect(x + 8, sole - 4, 2, 1, SHOE_L)
        s.rect(x + 6, sole - 1, 9, 2, SOLE)
    elif phase < 0:
        s.rect(x - 3, hip + 1, 5, max(2, sole - 7 - hip), jean)
        s.rect(x - 5, sole - 7, 7, 3, SHOE)
        s.rect(x - 5, sole - 4, 7, 2, SOLE)
    else:
        s.rect(x + 1, hip, 5, sole - 3 - hip, jean)
        s.rect(x + 1, sole - 4, 8, 3, SHOE)
        s.rect(x + 1, sole - 1, 8, 2, SOLE)


def draw_side(blink=False, bob=0, phase=0, swing=1):
    s = Spr()
    sole = 60
    hip = 48 + bob
    if phase in (0, 2):
        near = 1 if phase == 0 else -1
        far = -near
    else:
        near = far = 0
    # Far limbs first.
    side_leg(s, 16, hip, sole, far, shade=True)
    far_swing = -swing
    s.rect(12, 40 + bob + far_swing * 3, 5, 10, DENIM_D)
    s.rect(13, 49 + bob + far_swing * 3, 4, 3, SKIN_S)
    side_leg(s, 18, hip, sole, near, shade=False)

    top = 36 + bob
    s.rect(14, top, 16, hip - top, DENIM)
    s.rect(14, top, 3, hip - top, DENIM_D)
    s.ellipse(22, top + 2, 9, 5, DENIM)
    s.rect(26, top + 4, 4, 8, SHIRT)
    s.rect(24, top + 4, 3, 8, HOOD_S)
    # Near arm, opposite the near leg.
    arm(s, 20, 38 + bob, swing)

    # Hood behind the profile, then curls, then the face.
    s.rect(12, 22 + bob, 6, 16, HOOD)
    s.rect(12, 24 + bob, 2, 12, HOOD_D)
    hair(s, 20, 15 + bob, 12, 11)
    s.ellipse(24, 28 + bob, 6, 7, SKIN_S)
    s.ellipse(23, 27 + bob, 5, 6, SKIN)
    # Nose points right.
    s.rect(28, 28 + bob, 3, 3, SKIN)
    s.p(31, 29 + bob, SKIN)
    s.p(30, 31 + bob, SKIN_D)
    s.rect(27, 33 + bob, 3, 1, LIP)
    s.p(28, 34 + bob, LIP_D)
    eye(s, 21, 23 + bob, blink, side=True)
    bangs(s, 22, 18 + bob)
    s.rect(18, 36 + bob, 8, 3, SKIN_S)
    s.rect(16, 40 + bob, 10, 3, HOOD_S)
    s.rect(15, 43 + bob, 10, 3, DENIM_D)
    s.outline()
    return s


def build():
    idle = [
        dict(bob=0),
        dict(bob=1),
        dict(bob=0, blink=True),
        dict(bob=0),
    ]
    walk = [
        dict(lleg=1, rleg=-1, larm=1, rarm=-1, bob=0),
        dict(lleg=0, rleg=0, larm=0, rarm=0, bob=1),
        dict(lleg=-1, rleg=1, larm=-1, rarm=1, bob=0),
        dict(lleg=0, rleg=0, larm=0, rarm=0, bob=1),
    ]

    def pack(fn, specs):
        return [fn(**spec) for spec in specs]

    side_idle = [
        draw_side(bob=0, phase=1, swing=0),
        draw_side(bob=1, phase=1, swing=0),
        draw_side(blink=True, bob=0, phase=1, swing=0),
        draw_side(bob=0, phase=1, swing=0),
    ]
    side_walk = [
        draw_side(phase=0, swing=-1, bob=0),
        draw_side(phase=1, swing=0, bob=1),
        draw_side(phase=2, swing=1, bob=0),
        draw_side(phase=3, swing=0, bob=1),
    ]
    rows = [
        pack(draw_front, idle),
        pack(draw_front, walk),
        pack(draw_back, idle),
        pack(draw_back, walk),
        side_idle,
        side_walk,
        [f.flip() for f in side_idle],
        [f.flip() for f in side_walk],
    ]
    sheet = Image.new("RGBA", (W * 4, H * len(rows)), (0, 0, 0, 0))
    for r, frames in enumerate(rows):
        for c, frame in enumerate(frames):
            sheet.alpha_composite(frame.image(), (c * W, r * H))
    return sheet


def preview(sheet):
    scale = 4
    bgc = (198, 214, 176, 255)
    big = sheet.resize((sheet.width * scale, sheet.height * scale), Image.Resampling.NEAREST)
    bg = Image.new("RGBA", big.size, bgc)
    bg.alpha_composite(big)
    rgb = bg.convert("RGB")
    draw = ImageDraw.Draw(rgb)
    for i, label in enumerate(
        ["down idle", "down walk", "up idle", "up walk", "right idle", "right walk", "left idle", "left walk"]
    ):
        draw.text((4, i * H * scale + 2), label, fill=(20, 30, 20))
    rgb.save("/tmp/hero_preview.jpg", quality=90)


if __name__ == "__main__":
    sheet = build()
    sheet.save("/workspace/assets/hero.png")
    preview(sheet)
    print("sheet", sheet.size)
