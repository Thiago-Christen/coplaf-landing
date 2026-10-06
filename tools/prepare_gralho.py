"""Mechanically optimize the generated transparent sheet, preserving all four cells."""
from pathlib import Path
from PIL import Image
import json

root = Path(__file__).resolve().parents[1]
source = root / 'art' / 'gralho-flight-source.png'
target = root / 'dist' / 'assets' / 'gralho-flight.webp'
with Image.open(source) as image:
    image = image.convert('RGBA')
    assert image.width == image.height and image.width % 2 == 0
    assert image.getchannel('A').getextrema()[0] == 0
    image = image.resize((1000, 1000), Image.Resampling.LANCZOS)
    image.save(target, 'WEBP', quality=90, method=6, exact=True)
with Image.open(target) as image:
    assert image.mode == 'RGBA' and image.size == (1000, 1000)
print(json.dumps({'asset': str(target), 'bytes': target.stat().st_size, 'transparent': True, 'cells': 4}))
