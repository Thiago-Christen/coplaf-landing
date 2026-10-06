"""Import only the eight supplied service photos. Mechanical WebP export, no AI edits."""
from pathlib import Path
from PIL import Image
import shutil
import json

root = Path(__file__).resolve().parents[1]
source_dir = Path('C:/Users/thiag/AppData/Local/Temp')
originals_dir = root / 'art' / 'servicos-originais'
assets_dir = root / 'dist' / 'assets' / 'services'
photos = [
    ('codex-clipboard-7faa42d7-c23b-4bc5-8c63-accd69805570.png', 'inventario-florestal'),
    ('codex-clipboard-9465877d-555e-4da4-8d58-9d572d5a2090.png', 'recuperacao-areas'),
    ('codex-clipboard-647467b4-3d56-4935-90d2-6b06780be5fc.png', 'laudo-fitossanitario'),
    ('codex-clipboard-cf36593c-df93-4ac1-b47b-54c2e924ef8c.png', 'levantamento-floristico'),
    ('codex-clipboard-d61b9da4-799d-403b-b043-199f8f64d001.png', 'arborizacao-paisagismo'),
    ('codex-clipboard-38b97cfa-4bfd-4595-9e96-dc56ff37da6d.png', 'cadastro-ambiental-rural'),
    ('codex-clipboard-4b4c468b-5b66-4b20-b3a4-c542d1ec94fc.png', 'planejamento-silvicultural'),
    ('codex-clipboard-6bedcc13-bc26-4dbe-86d3-99b0b7b2f9dc.png', 'mapeamento'),
]
# Check the complete source set before exporting anything.
for source_name, _ in photos:
    assert (source_dir / source_name).is_file(), source_name
originals_dir.mkdir(parents=True, exist_ok=True)
assets_dir.mkdir(parents=True, exist_ok=True)
results = []
for source_name, basename in photos:
    source = source_dir / source_name
    shutil.copy2(source, originals_dir / (basename + '.png'))
    with Image.open(source) as original:
        image = original.convert('RGB')
        image.save(assets_dir / (basename + '.webp'), 'WEBP', quality=90, method=6)
        with Image.open(assets_dir / (basename + '.webp')) as exported:
            assert exported.size == original.size
        results.append({'asset':basename + '.webp', 'dimensions':image.size,
                        'bytes':(assets_dir / (basename + '.webp')).stat().st_size})
print(json.dumps({'exported':results,'total_kb':round(sum(r['bytes'] for r in results)/1024,1)}))
