# COPLAF — O futuro tem raízes

Landing page independente atualizada em 06/10/2026.

## Apresentar localmente

Execute `node serve.cjs` nesta pasta e abra `http://127.0.0.1:4173`.
Nenhuma instalação npm é necessária. O servidor entrega apenas o diretório `dist`.

Também é possível abrir `dist/index.html` diretamente: o índice é incorporado em JavaScript e o vídeo local usa o player HTML. A prévia via servidor é recomendada, por oferecer WebCodecs quando disponível.

## Preparação real do vídeo

O arquivo aprovado no chat “Criar voo da floresta ao trator” tem **596 quadros**, não 600: 60 fps, 1280 × 720, aproximadamente 9,93 segundos. Árvore → floresta → campo/trator → universidade.

A abertura tem duas etapas reais:

1. Baixa o MP4 (aproximadamente 23,6 MB), com progresso de bytes.
2. Decodifica e verifica todos os 596 quadros antes de liberar a experiência.

A abertura permanece por pelo menos cinco segundos. Se a preparação levar mais tempo, ela aguarda; o percentual acompanha o trabalho sem expor etapas técnicas ou contadores de quadros. A interface mostra apenas uma frase por vez e o progresso. Existem três sequências de três frases, alternadas a cada abertura na mesma sessão; as trocas acontecem aos 1,65 e 3,3 segundos, com transição suave e respeito a movimento reduzido. Um quadro verificado é fechado imediatamente: não se armazenam centenas de bitmaps na memória. O player mantém o arquivo comprimido e decodifica o quadro solicitado pelo scroll.

O carregamento usa a logo, sem o gralho. O mascote continua nas seções da rede e de contato.

Quando WebCodecs não está disponível, o player HTML busca e verifica cada quadro antes da entrada. Essa alternativa pode levar mais tempo, dependendo do navegador/dispositivo. Ao descer, o vídeo avança; ao subir, volta; ao parar, deixa de avançar. Não há reprodução automática contínua.

Uma falha mostra uma mensagem simples, “Tentar novamente” e a opção explícita “Continuar sem vídeo”. Esses botões não aparecem durante o carregamento normal ou quando tudo está pronto: a entrada é automática. A escolha de continuar sem vídeo preserva o conteúdo e oferece “Preparar a viagem” na página. Não há saída automática silenciosa para uma página estática.

Movimento reduzido **não desativa a rolagem do vídeo**: retira suavização, voo automático, perspectiva e animações decorativas, mantendo os quatro capítulos e a navegação manual.

O filme e as fotos tratadas são recursos de apresentação, não registro documental de projetos realizados.

## Design e interações

- Navbar anexada ao topo, arredondada na base, com vidro fosco, versão compacta no scroll, indicação da seção atual e menu móvel.
- COPLAF em primeiro plano: apresentação institucional, origem em 1994, vínculo com Engenharia Florestal da UFPR, campus em faixa de largura inteira com paralaxe e dois cards sobrepostos em cascata.
- Os nove serviços têm cards com fotos distintas, usando todas as oito imagens enviadas e uma cena ilustrativa própria para educação ambiental. O painel destacado preserva os detalhes, transições e navegação por teclado, mouse e toque. No celular, tocar em uma foto leva suavemente ao painel de detalhes.
- Mapa ilustrativo dos 27 estados ampliado, com superfícies de profundidade, conexões animadas a partir de Curitiba, informações por estado, seleção por teclado/lista e visão nacional. O estado selecionado tem divisórias claras, sem contorno preto; foco por teclado é dourado. Clique não cria onda, brilho ou zoom.
- Rede com as três marcas enviadas, card maior da COPLAF, entrada escalonada, inclinação e reflexo acompanhando o mouse, perspectiva vinculada ao scroll e links oficiais clicáveis.
- Navegação interna com rolagem suave, enquadramento abaixo da navbar e interrupção por roda do mouse, toque ou teclado. A animação também movimenta o vídeo de fundo durante o percurso; movimento reduzido leva ao destino imediatamente.
- Entradas progressivas, transições de conteúdo e movimentos discretos; sem impedir leitura ou acesso em dispositivos de toque.
- A viagem não mostra instrução de scroll, nome da cena ou contador de quadros. Foram retirados os prefixos numéricos das chamadas de seção e das entidades, o link de site oficial em “Quem somos” e o link de portfólio ao final dos serviços. A legenda do campus é “Cifloma UFPR”.
- Os sete pontos de conexão ficam ao lado das siglas dos estados, sem cobri-las. DF tem uma chamada externa curta, clicável e acessível por teclado.

## Fotos dos serviços

As oito fotos enviadas foram incorporadas sem alterações por IA. Elas aparecem diretamente na galeria de serviços, sem depender da troca da foto principal. As versões para a página usam WebP, com as dimensões originais preservadas e enquadramento por serviço em `dist/content.js` (`image`, `alt` e `position`). Nenhuma foto é repetida entre os nove serviços. O card CAR preenche a largura com foco no topo, sem faixas brancas e sem recortar a identificação; seu painel mantém a imagem completa.

- Medição do tronco: inventário florestal.
- Registro da vegetação com prancheta: levantamento florístico.
- Imagem com a identificação CAR: Cadastro Ambiental Rural.
- Praça arborizada: arborização e paisagismo.
- Plantio da muda: recuperação de áreas degradadas.
- Aprendizado com identificação de folhas: educação ambiental, cena ilustrativa gerada com imagegen, não registro de uma ação real da COPLAF.
- Vista aérea da floresta: mapeamento.
- Análise do solo: planejamento silvicultural.
- Análise da planta em viveiro: laudo fitossanitário.

Os arquivos usados estão em `dist/assets/services/` e no ZIP. Cópias inalteradas dos anexos estão preservadas localmente em `art/servicos-originais/`. As fotos são ilustrativas dos serviços; não foi afirmado que registram projetos da COPLAF.

A imagem nova está em `dist/assets/services/educacao-ambiental.webp`; seu PNG original fica em `art/educacao-ambiental.png`. Prompt exato, modo de geração e validação: `art/educacao-ambiental-prompts.md`. As demais fotos fornecidas não foram alteradas.

## Logos das entidades

Brasil Júnior e FEJEPAR ganharam variantes raster maiores e com transparência, usadas nos cards claros com proporções preservadas. São versões de apresentação geradas a partir das imagens enviadas, **não matrizes vetoriais nem arquivos oficiais da marca**. Pequenas diferenças de desenho exigem aprovação das entidades antes do uso institucional.

Núcleo Curitiba mantém o original fornecido, em um card escuro e em tamanho compatível com os pixels disponíveis. A restauração gerada mudou a tipografia e foi rejeitada; não foi aplicada. Substituir pelo arquivo oficial em alta resolução é preferível a deformar a identidade.

Os prompts exatos, modo de edição e decisões de fidelidade estão em `art/entidades-prompts.md`. As artes anteriores e fontes originais continuam preservadas no projeto local.

## Manutenção

- `dist/content.js`: serviços, entidades, links e indicadores.
- `dist/index.html`: estrutura e textos.
- `dist/styles.css`: base visual.
- `dist/experience.css`: novo visual, cards, mapa, responsividade e efeitos.
- `dist/refinements.css`: galeria com todas as fotos, campus panorâmico, cascata, mapa ampliado e interação dos cards da rede.
- `dist/loader.js` / `loader.css`: progresso real, entrada e recuperação.
- `dist/scroll-film.js`: preparação, reprodução por scroll e alternativa HTML.
- `dist/film-index.js` / `assets/scroll-samples.json`: índice do vídeo.
- `dist/geography.js`: geometria local simplificada.
- `dist/app.js`: capítulos, navegação, serviços, mapa e entidades.

O MP4 e seus dois índices precisam permanecer sincronizados; não basta trocar o nome do vídeo. A cartografia é ilustrativa, não uma malha oficial. As linhas expressam conexões, não itinerários reais.

## Conteúdo e fontes

Identidade, orientação acadêmica, e-mail e os nove serviços seguem o [portfólio institucional da UFPR](https://supri.ufpr.br/portfolio/prestacao-de-servicos/empresas-juniores/empresa-junior-de-consultoria-e-planejamento-florestais-coplaf/).

O contato `coplaf.jr@gmail.com` abre o aplicativo de e-mail. Não há envio simulado.

Canais preservados:

- [Brasil Júnior](https://brasiljunior.org.br/)
- [FEJEPAR](https://www.instagram.com/fejepar/)
- [Núcleo Curitiba](https://www.nucleocuritiba.com.br/inicio)
- [COPLAF](https://sites.google.com/view/coplaf/in%C3%ADcio)

Indicadores 8 estados, 29 cidades, 22 cidades no Paraná e 93% vêm do material enviado e não são atualização para 2026. Não foram inventadas quantidades de projetos por cidade/estado. Validar artes, contatos e indicadores com a equipe antes da publicação oficial.

Fontes Google têm alternativas de sistema caso não haja conexão.

## Verificação da revisão

`tools/check-loader-phrases.cjs` verifica as três sequências de três frases em aberturas consecutivas, remoção das informações técnicas, progresso acessível, espera real pelos 596 quadros, duração mínima, navegação pelo vídeo e recuperação após uma falha de conexão. Capturas da abertura simplificada: `output/loader-simple-*.png`.

`tools/check-refinements.cjs` verifica em Chrome: nove cards e nove fotos distintas carregadas; seleção de todos os serviços; largura inteira do campus; paralaxe/cascata; mapa maior e foco acessível sem borda preta; inclinação dos cards e links oficiais desobstruídos; rolagem suave e interrupção; menu de toque; movimento reduzido; preservação dos 596 quadros. Também verifica ausência de rolagem horizontal em larguras de 320 a 1920 px. Capturas da revisão ficam em `output/refinement-*.png`.

`tools/check-cleanup.cjs` verifica a remoção dos elementos solicitados, legenda Cifloma UFPR, ausência de repetição das fotos, enquadramento CAR, pontos separados das siglas, chamada DF por mouse/teclado e vídeo avançando e voltando sem os antigos contadores. Capturas: `output/cleanup-*.png`. Os indicadores históricos continuam documentados aqui, embora a nota pública seja apenas “De Curitiba a diferentes regiões do Brasil. As linhas ilustram nossas conexões.”

A prévia é estática, sem hot reload. Depois de editar, recarregue a aba já aberta (Ctrl+R). Não é necessário abrir várias abas ou reiniciar o servidor para carregar as alterações.

## Google Sites e hospedagem

O projeto está preparado para GitHub Pages: `.github/workflows/pages.yml` publica apenas `dist` a cada envio à branch `main`. Ao criar o repositório, selecione **Settings → Pages → Source: GitHub Actions**. A presença desse arquivo não confirma que o repositório foi criado ou que o site já foi publicado; autenticação, envio e execução bem-sucedida ainda são necessários.

Esta demonstração é código independente. Para incorporar no Google Sites, hospedar `dist` em HTTPS e incorporar a URL. O scroll do filme acompanha o documento incorporado, não automaticamente o scroll externo do Google Sites; a integração precisa ser testada no destino.

A hospedagem Sites registrada não tem publicação confirmada. O endereço local não é um link público compartilhável. Não foi inventada URL de publicação.

