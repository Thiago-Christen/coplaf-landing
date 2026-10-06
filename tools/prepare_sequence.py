"""Create a six-second, 144-frame camera sequence from the generated forest art.

This is an original animated camera move, not stock footage or location footage.
The WebP frames are the exact source used by the scroll player and WebM export.
"""
from pathlib import Path
from PIL import Image, ImageEnhance
import math
import json

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'art' / 'coplaf-araucaria-hero.png'
OUT = ROOT / 'dist' / 'assets'
FRAMES = OUT / 'frames'
FRAMES.mkdir(parents=True, exist_ok=True)
image = Image.open(SOURCE).convert('RGB')
image.save(OUT / 'forest.webp', quality=90, method=6)

count = 144
width, height = 1280, 720
for index in range(count):
    progress = index / (count - 1)
    ease = progress * progress * (3 - 2 * progress)
    # Slow aerial push-in with lateral travel and a gentle lens roll.
    zoom = 1.045 + ease * 0.30
    crop_w = image.width / zoom
    crop_h = crop_w * height / width
    center_x = image.width * (0.5 + 0.035 * math.sin(progress * 1.4))
    center_y = image.height * (0.49 + 0.034 * ease)
    left = min(max(center_x - crop_w / 2, 0), image.width - crop_w)
    top = min(max(center_y - crop_h / 2, 0), image.height - crop_h)
    frame = image.crop((left, top, left + crop_w, top + crop_h)).resize((width, height), Image.Resampling.LANCZOS)
    frame = ImageEnhance.Brightness(frame).enhance(1.0 - ease * 0.035)
    frame.save(FRAMES / f'{index:03d}.webp', quality=78, method=4)

metadata = {'count':count, 'fps':24, 'duration':6, 'width':width, 'height':height,
            'type':'generated camera animation from original AI forest art',
            'source':'coplaf-araucaria-hero.png'}
(OUT / 'sequence.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'frames':count, 'size_mb':round(sum(p.stat().st_size for p in FRAMES.glob('*.webp'))/1024/1024,2)}))
