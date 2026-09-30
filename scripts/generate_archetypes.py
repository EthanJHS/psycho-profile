"""
60개 원형 이미지 자동 생성 — Gemini Flash Image
  - 12개: public/archetypes/{archetype}.jpg  (무료용 원형 단독)
  - 48개: public/archetypes/{archetype}_{drive}.jpg  (유료용 원형×드라이브)

실행:
  pip install google-genai pillow
  GEMINI_API_KEY="your_key" python scripts/generate_archetypes.py
"""

import os
import sys
import time
import base64
from pathlib import Path
from io import BytesIO

try:
    from google import genai
    from google.genai import types
except ImportError:
    os.system(f"{sys.executable} -m pip install google-genai")
    from google import genai
    from google.genai import types

try:
    from PIL import Image
except ImportError:
    os.system(f"{sys.executable} -m pip install pillow")
    from PIL import Image

# ── 설정 ────────────────────────────────────────────────────────────
API_KEY = os.environ.get("GEMINI_API_KEY") or input("Gemini API 키: ").strip()
OUT_DIR = Path(__file__).parent.parent / "public" / "archetypes"
OUT_DIR.mkdir(parents=True, exist_ok=True)

client = genai.Client(api_key=API_KEY)
MODEL = "gemini-2.5-flash-image"

STYLE = (
    "flat vector illustration, clean white background, simple bold outlines, "
    "bright saturated colors, friendly character design, 2D flat art, "
    "no dark background, no shadows, no text, no letters, "
    "no religious symbols, no buddha, no monks, no halos, no cross, no lotus, "
    "no meditation pose, no religious iconography"
)

# ── 원형 단독 이미지 (12개, 무료용) ─────────────────────────────────
ARCHETYPE_PROMPTS = {
    "architect":   "lavender-haired character in violet-gold outfit standing confidently with geometric blueprints and crystal structures floating around them, purple and gold palette",
    "guardian":    "strong emerald-green character standing with arms wide open, protective warm glow radiating outward, smaller figures safe behind them",
    "explorer":    "amber-haired adventurer holding a glowing compass, maps and star trails surrounding them, teal and gold palette, sense of open horizon",
    "prophet":     "magenta-haired mystical character with eyes half-closed, pink constellation star map floating around their hands, serene knowing expression",
    "warrior":     "red-accented character in strong stance with crimson energy sparking around their fists, fierce determined expression, bold red palette",
    "seeker":   "gold-and-purple-accented character holding a glowing vial as swirling transformation energy flows between their hands, amethyst and gold sparks",
    "sovereign":   "golden-robed character standing tall with arms slightly open, warm radiant golden light cascading outward from their center",
    "sage":        "blue-haired character holding an open glowing book, blue knowledge sparks drifting upward, calm wise expression, deep sky blue palette",
    "harmonizer":  "colorful character with arms raised as multicolor wave frequencies flow around them in perfect harmony, green purple blue rings",
    "rebel":       "orange-accented character mid-stride with sparks flying freely, open sky behind them, liberating expression, bright orange palette",
    "lover":       "pink-haired character with arms wide open as rose petals and heart energy bloom outward in all directions, warm radiant expression",
    "catalyst":    "yellow-accented character reaching forward as yellow lightning sparks radiate outward in a chain reaction, electrified joyful expression",
}

# ── 원형×드라이브 이미지 (48개, 유료용) ─────────────────────────────
DRIVE_PROMPTS = {
    "architect": {
        "achievement": "lavender-haired character in violet-gold outfit standing before a towering completed crystal structure gazing up with deep satisfaction, geometric shapes celebrating around them, purple and gold palette",
        "connection":  "two lavender-haired characters side by side unrolling a giant blueprint together, both smiling as they plan, purple geometric shapes and connecting lines between them",
        "stability":   "lavender-haired character kneeling to inspect a perfectly laid foundation, proud calm expression, solid geometric blocks and grid lines spreading outward beneath them, violet palette",
        "autonomy":    "lavender-haired character alone on a vast empty grid field, drawing the very first line with a glowing tool, no structure yet built, pure possibility ahead, violet glow",
    },
    "guardian": {
        "achievement": "strong emerald-green character standing victorious before a storm that has passed, protected space behind them intact, triumphant expression, green light radiating outward",
        "connection":  "emerald-green character gently sheltering two smaller figures under their arms, warm protective smile, soft green glow wrapping all three together",
        "stability":   "emerald-green character standing like a mountain in the center of swirling chaos around them, perfectly still and calm, green anchor light beneath their feet",
        "autonomy":    "emerald-green character alone at the edge of darkness, back straight, watching the boundary no one asked them to guard, single green torch in hand",
    },
    "explorer": {
        "achievement": "amber-haired character planting a glowing flag at the peak of an unknown place, triumphant grin, gold and teal landscape behind them, compass and stars floating around",
        "connection":  "two amber-haired explorers sitting together examining a shared map spread between them, excited expressions, gold compass and dotted paths connecting them",
        "stability":   "amber-haired character back at a warm cozy camp with lantern glowing, maps and journals around, relaxed satisfied expression, amber light, familiar safe space",
        "autonomy":    "amber-haired character walking alone into an unmapped horizon, rolled map under arm, determined free expression, gold footprint stars trailing behind into open white space",
    },
    "prophet": {
        "achievement": "magenta-haired mystical character watching as exactly what they foresaw unfolds before them, awestruck fulfilled expression, pink and violet star constellation completing around them",
        "connection":  "magenta-haired character with hands raised, sending glowing pink visions outward to three other figures who receive them with wonder, starlight flowing between them",
        "stability":   "magenta-haired character seated at the same ancient spot they have always kept, serene timeless expression, fixed pink constellation above them unchanged through seasons",
        "autonomy":    "magenta-haired character alone at night gazing at a constellation only they can see, private knowing smile, unique pink star map floating just for them",
    },
    "warrior": {
        "achievement": "red-accented character standing at the summit after the final challenge, fist raised, fierce victorious grin, crimson energy bursting upward around them like fireworks",
        "connection":  "two red-accented characters standing back to back, fiercely loyal expressions, crimson energy connecting between them as shared force, fighting as one unit",
        "stability":   "red-accented character planted immovably in front of something precious, arms crossed, calm unbreakable expression, crimson energy coiled tightly around their feet",
        "autonomy":    "red-accented character striding alone down an empty road, answering to no one, determined self-directed gaze, crimson energy sparking freely at every step",
    },
    "seeker": {
        "achievement": "gold-and-purple-accented character holding up a completed glowing vial as dull material transforms into pure light inside it, amazed triumphant expression, gold swirls celebrating",
        "connection":  "two gold-purple characters leaning over a shared experiment together, collaborative discovery expressions, golden and amethyst sparks swirling between their hands",
        "stability":   "gold-purple character in a centuries-old laboratory surrounded by shelves of completed works, calm mastery expression, soft gold and violet light, unchanged timeless space",
        "autonomy":    "gold-purple character alone late at night performing a forbidden experiment, absorbed secret expression, unauthorized golden glow in a dark private corner, solitary discovery",
    },
    "sovereign": {
        "achievement": "golden-robed character standing at the highest point surveying everything below with quiet pride, warm radiant expression, golden light cascading downward from where they stand",
        "connection":  "golden-robed character at center of a gathering, arms open, others drawn toward their warmth, sun-like golden glow radiating out to reach everyone around them",
        "stability":   "golden-robed character seated calmly as seasons and events swirl around them unchanged, eternal serene expression, gold rings of permanence expanding outward",
        "autonomy":    "golden-robed character alone in an empty hall making a decision, no counsel needed, self-assured expression, gold light generated entirely from within themselves",
    },
    "sage": {
        "achievement": "blue-haired character closing a thick glowing book with a deep sigh of completion, eyes lit with understanding, blue knowledge sparks drifting upward all around them",
        "connection":  "blue-haired character holding an open glowing book toward a younger student, warm teaching expression, blue light streaming from the pages into the student's mind",
        "stability":   "blue-haired character seated in an ancient library surrounded by towering bookshelves, timeless tranquil expression, everything around them unchanged for decades",
        "autonomy":    "blue-haired character sitting alone on a mountaintop with one open book, far from any library or teacher, solitary blue flame beside them, self-taught truth",
    },
    "harmonizer": {
        "achievement": "colorful character with arms raised as all the different wave frequencies around them click into perfect harmony, joyful accomplished expression, green purple blue rings aligned",
        "connection":  "colorful character conducting with gentle hands as four others each emit a different color wave, all frequencies weaving together through the harmonizer at center",
        "stability":   "colorful character sitting serenely at the still center as colorful wave energies orbit around them like planets, calm anchor expression, eye of the storm",
        "autonomy":    "colorful character dancing freely alone to their own inner rhythm, joyful liberated expression, a single flowing multicolor ribbon trailing behind as they move",
    },
    "rebel": {
        "achievement": "orange-accented character having just broken through a crumbling gray wall, fierce liberated grin, orange sparks and fragments flying, open sky visible beyond the break",
        "connection":  "orange-accented character at the center of a small group of misfits, arm around one of them, warm defiant group expression, orange sparks shared between all of them",
        "stability":   "orange-accented character carefully placing new bricks to rebuild something from rubble, focused constructive expression, orange light warming the new structure taking shape",
        "autonomy":    "orange-accented character walking away from a collapsing old structure without looking back, fully liberated expression, orange sparks trailing as they step into open space",
    },
    "lover": {
        "achievement": "pink-haired character with both arms wide open as heart energy blooms fully around them in rose petals and light, radiant expression of love fully realized at its peak",
        "connection":  "two pink-haired characters reaching toward each other from opposite sides, fingertips just touching at center, warm inevitable smile, rose petal trails converging between them",
        "stability":   "pink-haired character as a constant warm presence, others gathered around them for comfort, gentle eternal smile, steady pink glow never dimming at the center",
        "autonomy":    "pink-haired character floating freely through open space scattering rose petals in all directions, freely loving expression, giving love without destination or recipient",
    },
    "catalyst": {
        "achievement": "yellow-accented character watching in awe as the chain reaction they started expands enormously around them, electrified triumphant expression, yellow lightning radiating outward in all directions",
        "connection":  "yellow-accented character touching one person who lights up, who touches another who lights up, chain of awakening spreading, yellow spark at the origin point smiling",
        "stability":   "yellow-accented character as a steady constant flame, others coming and going around them energized and renewed, calm endless source expression, yellow glow never flickering",
        "autonomy":    "yellow-accented character running freely through open space sparking everything they pass without stopping or planning, wildly joyful expression, yellow lightning everywhere",
    },
}

DRIVE_ORDER = ["achievement", "connection", "stability", "autonomy"]


def generate_image(filename: str, prompt: str) -> bool:
    out = OUT_DIR / filename
    if out.exists():
        print(f"  ⏭  skip: {filename}")
        return True

    full = f"{prompt}, {STYLE}"
    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=full,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )
        for part in resp.candidates[0].content.parts:
            if hasattr(part, "inline_data") and part.inline_data:
                data = part.inline_data.data
                if isinstance(data, str):
                    data = base64.b64decode(data)
                img = Image.open(BytesIO(data)).convert("RGB")
                img.save(out, "JPEG", quality=92)
                print(f"  ✓  {filename}")
                return True
        print(f"  ✗  이미지 없음: {filename}")
        return False
    except Exception as e:
        print(f"  ✗  오류 ({filename}): {e}")
        return False


def main():
    archetypes = list(ARCHETYPE_PROMPTS.keys())
    total = len(archetypes) + len(archetypes) * len(DRIVE_ORDER)  # 12 + 48
    n, failed = 0, []

    print(f"\n총 {total}개 생성 → {OUT_DIR}\n")

    # 1단계: 원형 단독 12개
    print("=== 1단계: 원형 단독 (12개, 무료용) ===")
    for arc in archetypes:
        n += 1
        filename = f"{arc}.jpg"
        print(f"  ({n}/{total}) {filename} ...", end=" ", flush=True)
        ok = generate_image(filename, ARCHETYPE_PROMPTS[arc])
        if not ok:
            failed.append(filename)
        time.sleep(3)

    # 2단계: 원형×드라이브 48개
    print("\n=== 2단계: 원형×드라이브 (48개, 유료용) ===")
    for arc in archetypes:
        print(f"\n[{arc}]")
        for drive in DRIVE_ORDER:
            n += 1
            filename = f"{arc}_{drive}.jpg"
            print(f"  ({n}/{total}) {filename} ...", end=" ", flush=True)
            ok = generate_image(filename, DRIVE_PROMPTS[arc][drive])
            if not ok:
                failed.append(filename)
            time.sleep(3)

    print(f"\n{'='*40}")
    print(f"완료 {total - len(failed)}/{total}개")
    if failed:
        print(f"실패: {', '.join(failed)}")


if __name__ == "__main__":
    main()
