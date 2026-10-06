# Prédio do campus — aprimoramento

Ferramenta: ImageGen built-in. Objetivo: aumento de resolução e nitidez, mantendo a composição original, sem solicitar expansão do campo de visão ou troca do cenário. O original foi preservado. Por ser restauração generativa, detalhes pequenos reconstruídos podem diferir da fotografia de origem; não usar como registro documental exato.

Arquivo final: `predio-campus-resolucao-melhorada.png`. A resolução efetiva deve ser consultada no próprio PNG; a dimensão solicitada no prompt não é garantia da dimensão gerada.

## Prompt utilizado

```text
Use case: precise-object-edit. Edit target: the attached existing photograph of a red-orange brick university building, central arched tall glass window, blue entrance canopy, pale blue metal roofs, palm trees, parked cars and bicycles. The user's request is ONLY better image quality and higher resolution. Perform a conservative photographic restoration and faithful super-resolution, ideally 3072x1904 pixels (four times the supplied 768x476 dimensions), preserving the exact original aspect ratio. Preserve the entire original framing, camera position, perspective, architecture, window layout, facade colors, sky, original lighting and shadows, plants, parked vehicles, bicycles, signs and all existing objects in exactly their original places. Improve fine definition, reduce JPEG compression noise and pixelation, gently restore naturally plausible brick mortar, window edges and foliage detail; retain a natural photographic appearance. Keep original color balance and saturation, not a new cinematic grade. Invariants: no crop, no expanded scene, no wider FOV, no stretch, no perspective correction, no sky replacement, no new architecture or landscaping, no object removal or additions, no retouching that redesigns the building, no new text or logos, no invented readable small sign text, no painterly AI look, no oversharpening halos or artificial HDR. This is an enhancement of the same photograph, not a reinterpretation or a new scene. One finished high-resolution restored photograph.
```
