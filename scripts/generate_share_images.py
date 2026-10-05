"""원형별 공유 이미지 생성 — 링크 미리보기(1200x630)와 스토리용 세로 카드(1080x1920), 한국어·영어.

실행 순서 (문구나 원형 이름이 바뀌면 다시 실행):
  1) npx tsx scripts/export_archetypes.mts scripts/.archetypes.json
  2) python scripts/generate_share_images.py scripts/.archetypes.json

출력: public/archetypes/og/{ko,en}/{id}.jpg, public/archetypes/story/{ko,en}/{id}.jpg
그림은 public/archetypes/{id}.png(원본, 저장소에는 올리지 않음)를 사용. Windows 기본 글꼴 기준.
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, 'public', 'archetypes')
FONTS = r'C:\Windows\Fonts'

INK = (11, 9, 16)
GOLD = (200, 160, 48)
GOLD_L = (226, 192, 100)
PARCH = (239, 230, 210)
MUTED = (176, 168, 152)

def font(name, size, index=0):
    return ImageFont.truetype(os.path.join(FONTS, name), size, index=index)

# 언어별 글꼴 — 한국어는 바탕(굵기는 외곽선으로 보강), 영어는 Georgia
def title_font(lang, size): return font('batang.ttc', size) if lang == 'ko' else font('georgiab.ttf', size)
def body_font(lang, size): return font('batang.ttc', size) if lang == 'ko' else font('georgiai.ttf', size)
def label_font(size): return font('georgiab.ttf', size)
def small_font(lang, size): return font('malgun.ttf', size) if lang == 'ko' else font('georgia.ttf', size)
STROKE = {'ko': 1, 'en': 0}

def text_w(d, s, f): return d.textlength(s, font=f)

def fit(d, s, make, size, max_w, min_size=28):
    """max_w 안에 들어갈 때까지 글자 크기를 줄임"""
    while size > min_size and text_w(d, s, make(size)) > max_w:
        size -= 2
    return make(size)

def wrap(d, s, f, max_w):
    lines, cur = [], ''
    for word in s.split(' '):
        nxt = (cur + ' ' + word).strip()
        if cur and text_w(d, nxt, f) > max_w:
            lines.append(cur); cur = word
        else:
            cur = nxt
    if cur: lines.append(cur)
    return lines

def glow(size, box, strength=70, blur=140):
    g = Image.new('L', size, 0)
    ImageDraw.Draw(g).ellipse(box, fill=strength)
    return g.filter(ImageFilter.GaussianBlur(blur))

def framed_card(art, w):
    h = int(w * 1.5)
    a = art.resize((w, h), Image.LANCZOS)
    b = max(4, w // 60)
    c = Image.new('RGBA', (w + b * 2, h + b * 2), GOLD + (255,))
    c.paste(a, (b, b))
    inset = b + max(5, w // 50)
    ImageDraw.Draw(c).rectangle((inset, inset, w + b * 2 - inset - 1, h + b * 2 - inset - 1), outline=GOLD_L + (150,), width=1)
    return c

def paste_with_shadow(base, card, cx, cy, angle=0):
    r = card.rotate(angle, expand=True, resample=Image.BICUBIC) if angle else card
    sh = Image.new('RGBA', r.size, (0, 0, 0, 0))
    sh.putalpha(r.getchannel('A').point(lambda a: int(a * 0.7)))
    sh = sh.filter(ImageFilter.GaussianBlur(18))
    x, y = cx - r.width // 2, cy - r.height // 2
    base.paste(sh, (x + 12, y + 20), sh)
    base.paste(r, (x, y), r)

def load_art(aid):
    return Image.open(os.path.join(ART, f'{aid}.png')).convert('RGB')

def spaced(s): return ' '.join(s)

# ── 링크 미리보기 1200x630 ──────────────────────────────────────────────────
def make_og(a, lang):
    W, H = 1200, 630
    d0 = a[lang]
    img = Image.new('RGB', (W, H), INK)
    img = Image.composite(Image.new('RGB', (W, H), (64, 46, 16)), img, glow((W, H), (660, 30, 1180, 600)))
    base = img.convert('RGBA')
    paste_with_shadow(base, framed_card(load_art(a['id']), 300), 930, 318, angle=-3)
    d = ImageDraw.Draw(base)
    X, MAXW = 72, 600

    d.text((X, 96), spaced('CORE TRAIT'), font=label_font(20), fill=GOLD)
    d.line((X, 134, X + 56, 134), fill=GOLD, width=2)

    y = 168
    if lang == 'ko':
        d.text((X, y), d0['nameEn'], font=label_font(22), fill=GOLD_L); y += 44
    nf = fit(d, d0['name'], lambda s: title_font(lang, s), 92 if lang == 'ko' else 76, MAXW, 44)
    d.text((X, y), d0['name'], font=nf, fill=PARCH, stroke_width=STROKE[lang], stroke_fill=PARCH)
    y += nf.size + 34

    bf = body_font(lang, 32)
    quote = d0['tagline'] if lang == 'ko' else f'“{d0["tagline"]}”'
    for line in wrap(d, quote, bf, MAXW)[:3]:
        d.text((X, y), line, font=bf, fill=GOLD_L); y += 46

    cta = '나는 어떤 원형일까?  ·  core-trait.com' if lang == 'ko' else 'What’s your archetype?  ·  core-trait.com/en'
    d.text((X, H - 82), cta, font=small_font(lang, 24), fill=MUTED)

    out = os.path.join(ART, 'og', lang); os.makedirs(out, exist_ok=True)
    base.convert('RGB').save(os.path.join(out, f'{a["id"]}.jpg'), quality=88, optimize=True)

# ── 스토리용 세로 카드 1080x1920 ────────────────────────────────────────────
def make_story(a, lang):
    W, H = 1080, 1920
    d0 = a[lang]
    img = Image.new('RGB', (W, H), INK)
    img = Image.composite(Image.new('RGB', (W, H), (70, 50, 18)), img, glow((W, H), (140, 260, 940, 1260), strength=80, blur=190))
    base = img.convert('RGBA')
    d = ImageDraw.Draw(base)

    def center(y, s, f, fill, stroke=0):
        d.text(((W - text_w(d, s, f)) / 2, y), s, font=f, fill=fill, stroke_width=stroke, stroke_fill=fill)

    center(120, spaced('CORE TRAIT'), label_font(30), GOLD)
    center(176, '나의 원형' if lang == 'ko' else spaced('MY ARCHETYPE'), small_font(lang, 30) if lang == 'ko' else label_font(22), MUTED)

    paste_with_shadow(base, framed_card(load_art(a['id']), 620), W // 2, 730)

    y = 1240
    if lang == 'ko':
        center(y, d0['nameEn'], label_font(30), GOLD_L); y += 56
    nf = fit(d, d0['name'], lambda s: title_font(lang, s), 124 if lang == 'ko' else 100, W - 160, 60)
    center(y, d0['name'], nf, PARCH, STROKE[lang] * 2)
    y += nf.size + 40

    bf = body_font(lang, 42)
    quote = d0['tagline'] if lang == 'ko' else f'“{d0["tagline"]}”'
    for line in wrap(d, quote, bf, W - 200)[:3]:
        center(y, line, bf, GOLD_L); y += 60

    # 특징 3개 — 한 줄씩. 마름모는 글꼴에 없는 경우가 있어 직접 그림
    y += 28
    for trait in d0['traits'][:3]:
        f2 = fit(d, trait, lambda z: small_font(lang, z), 32, W - 260, 24)
        tw, gap, r = text_w(d, trait, f2), 20, 7
        x0 = (W - (tw + gap + r * 2)) / 2
        cy = y + f2.size * 0.62
        d.polygon([(x0 + r, cy - r), (x0 + r * 2, cy), (x0 + r, cy + r), (x0, cy)], fill=GOLD)
        d.text((x0 + r * 2 + gap, y), trait, font=f2, fill=(214, 206, 190)); y += 52

    d.line((W // 2 - 60, H - 190, W // 2 + 60, H - 190), fill=GOLD, width=2)
    center(H - 160, '나는 어떤 원형일까?' if lang == 'ko' else 'What’s your archetype?', small_font(lang, 34), PARCH)
    center(H - 104, 'core-trait.com' if lang == 'ko' else 'core-trait.com/en', label_font(30), GOLD)

    out = os.path.join(ART, 'story', lang); os.makedirs(out, exist_ok=True)
    base.convert('RGB').save(os.path.join(out, f'{a["id"]}.jpg'), quality=86, optimize=True)

if __name__ == '__main__':
    data = json.load(open(sys.argv[1], encoding='utf-8'))
    only = sys.argv[2:]  # 원형 id를 주면 그것만 다시 만듦
    for a in data:
        if only and a['id'] not in only: continue
        for lang in ('ko', 'en'):
            make_og(a, lang); make_story(a, lang)
        print('ok', a['id'])
