from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json

root = Path(__file__).resolve().parents[1]
out = root / 'output' / 'COPLAF_Landing_Page.zip'
files = [
    'README.md', 'serve.cjs',
    'dist/index.html', 'dist/styles.css', 'dist/content.js', 'dist/app.js',
    'dist/geography.js', 'dist/scroll-film.js', 'dist/loader.css', 'dist/loader.js',
    'dist/film-index.js', 'dist/experience.css', 'dist/refinements.css', 'art/entidades-prompts.md',
    'art/brasil-junior-logo.png', 'art/fejepar-logo.png',
    'dist/assets/brasil-junior-logo.webp', 'dist/assets/fejepar-logo.webp',
    'dist/assets/nucleo-curitiba-logo.png',
    'dist/assets/forest-new.webp', 'dist/assets/tree.webp', 'dist/assets/tractor.webp',
    'dist/assets/campus.webp', 'dist/assets/coplaf-logo.webp', 'dist/assets/gralho-new.webp',
    'dist/assets/scroll-60fps.mp4', 'dist/assets/scroll-samples.json',
    'dist/assets/services/inventario-florestal.webp',
    'dist/assets/services/levantamento-floristico.webp',
    'dist/assets/services/cadastro-ambiental-rural.webp',
    'dist/assets/services/arborizacao-paisagismo.webp',
    'dist/assets/services/recuperacao-areas.webp',
    'dist/assets/services/mapeamento.webp',
    'dist/assets/services/planejamento-silvicultural.webp',
    'dist/assets/services/laudo-fitossanitario.webp',
    'dist/assets/services/educacao-ambiental.webp',
    'art/educacao-ambiental-prompts.md',
]
for name in files:
    assert (root / name).is_file(), name
with ZipFile(out, 'w', compression=ZIP_DEFLATED, compresslevel=3) as archive:
    for name in files:
        archive.write(root / name, 'COPLAF_Landing_Page/' + name)
with ZipFile(out) as archive:
    assert archive.testzip() is None
    count = len(archive.namelist())
    metadata = json.loads(archive.read('COPLAF_Landing_Page/dist/assets/scroll-samples.json'))
    assert metadata['frameCount'] == 596 and metadata['fps'] == 60
    content = archive.read('COPLAF_Landing_Page/dist/content.js').decode()
    assert 'Laudo fitossanitário' in content and 'nucleocuritiba.com.br' in content
print(json.dumps({'archive':str(out),'files':count,'frames':metadata['frameCount'],
                  'size_mb':round(out.stat().st_size/1024/1024,2),'verified':True}))

