"""Mechanical import of the approved generated illustration; no bitmap editing."""
from pathlib import Path
from PIL import Image
import shutil
import json

root = Path(__file__).resolve().parents[1]
source = root.parent / 'asset-work' / 'educacao-ambiental' / 'educacao-ambiental-editorial.png'
original = root / 'art' / 'educacao-ambiental.png'
asset = root / 'dist' / 'assets' / 'services' / 'educacao-ambiental.webp'
assert source.is_file()
shutil.copy2(source, original)
with Image.open(source) as image:
    image.convert('RGB').save(asset, 'WEBP', quality=90, method=6)
    with Image.open(asset) as exported:
        assert exported.size == image.size
    print(json.dumps({'asset': str(asset), 'original': str(original),
                      'dimensions': image.size, 'bytes': asset.stat().st_size}))
