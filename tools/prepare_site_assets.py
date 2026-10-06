"""Mechanical resize/export of approved artwork. No redrawing or recoloring."""
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[1]
for source, target, limit in [
    ('floresta-serra-16x9.png', 'forest-new.webp', 1672),
    ('arvore-copa-16x9-sem-texto.png', 'tree.webp', 1672),
    ('trator-campo-16x9-sem-texto.png', 'tractor.webp', 1672),
    ('predio-campus-resolucao-melhorada.png', 'campus.webp', 1594),
    ('logo-coplaf-renovada.png', 'coplaf-logo.webp', 1200),
    ('gralho-renovado-camiseta.png', 'gralho-new.webp', 900),
]:
    artwork = Image.open(root / 'art' / source)
    artwork.thumbnail((limit, limit), Image.Resampling.LANCZOS)
    output = root / 'dist' / 'assets' / target
    artwork.save(output, 'WEBP', quality=90, method=6)
    print(f'{target}: {artwork.size}, {output.stat().st_size} bytes')
