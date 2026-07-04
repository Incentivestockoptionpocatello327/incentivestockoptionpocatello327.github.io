# Ideias de Design — Site JSF Elétrico (jsfeletrico.com)

## Contexto
Landing page oficial do simulador de comandos elétricos "JSF Elétrico" (Play Store).
Requisito central do usuário: o site deve **puxar o estilo do próprio simulador**.
O simulador tem tema escuro (#0f172a/#1e293b), cor de marca #166184 (azul petróleo),
gradientes azuis, grade de circuito escura com fios coloridos (vermelho/azul/verde/amarelo),
glow neon nos componentes ativos e tipografia sans-serif pesada.

## Três abordagens consideradas

### 1. Painel de Comando (Simulator-Native Dark)
Intro: o site é uma extensão visual do próprio app — fundo de bancada escura com
grade de circuito, componentes com glow e a paleta exata do simulador (#166184).
Probabilidade: 0.09

### 2. Manual Técnico Retrô
Intro: estética de apostila de eletrotécnica anos 80, papel bege, diagramas em traço
preto, carimbos. Probabilidade: 0.02

### 3. Neon Industrial Brutalista
Intro: blocos pesados, tipografia gigante, amarelo de advertência dominante e alto
contraste industrial. Probabilidade: 0.01

## Abordagem escolhida: **Painel de Comando (Simulator-Native Dark)**
Escolhida porque o usuário pediu explicitamente que o site siga o estilo do simulador.
A referência de estilo (o próprio app) é a especificação ground-truth.

- **Design Movement**: Dark-UI técnico / HMI industrial (interfaces de supervisório SCADA modernizadas), fiel à identidade do app.
- **Core Principles**:
  1. Fidelidade ao simulador: mesmas cores, mesma sensação de "bancada de comandos".
  2. Conteúdo enxuto e correto: só informações oficiais da Play Store e materiais do usuário.
  3. Grade de circuito como textura estrutural: fundo com grid escuro e linhas de fio coloridas como elementos decorativos.
  4. Glow funcional: brilho neon apenas em elementos ativos/importantes (CTAs, destaques), como no app.
- **Color Philosophy**: Fundo #07131d→#0f172a (bancada escura), marca #166184 (azul petróleo do theme-color oficial), acento ciano #38bdf8 (energia), amarelo #ffc107 reservado para avisos/destaques (como no app), verde #28a745 para estados "ligado". O vermelho aparece apenas como fio de fase decorativo.
- **Layout Paradigm**: Hero assimétrico — texto à esquerda, mockup de celular com screenshot real à direita, atravessado por "fios" decorativos horizontais. Seções alternam entre painéis tipo "modal do app" (cards com borda #166184 e cantos 12px) e faixas de largura total com screenshots.
- **Signature Elements**:
  1. Fios coloridos (vermelho/azul/verde) como divisores e detalhes de borda.
  2. Cards estilo "painel de configuração" do app: fundo #0f172a, borda #334155, cantos arredondados.
  3. Pontos de conexão (bolinhas de terminal) como marcadores de lista e decoração.
- **Interaction Philosophy**: Interações como acionamentos elétricos — hover "energiza" o elemento (glow ciano sutil), clique tem feedback imediato scale(0.97), como botões de botoeira.
- **Animation**: Entradas rápidas (≤300ms, ease-out), glow pulsante lento apenas no CTA principal, fios com animação sutil de "corrente" (dash animado) no hero. Respeitar prefers-reduced-motion.
- **Typography System**: Chakra Petch (display, técnico e quadrado, remete a HMI) + Inter/system sans para corpo. Títulos weight 700-800 como no app.
- **Brand Essence**: Simulador de comandos elétricos no celular para quem quer aprender e praticar montagens — direto, prático, brasileiro. Adjetivos: técnico, acessível, confiável.
- **Brand Voice**: Direta e prática, sem jargão desnecessário. Ex.: "Monte, ligue e veja funcionar." / "Erros que ensinam: curto, sobrecarga e falta de fase simulados de verdade."
- **Wordmark & Logo**: Usar o logo real enviado pelo usuário (JSF elétrico prateado) e o ícone oficial do app (capacete). Não recriar.
- **Signature Brand Color**: #166184 (azul petróleo oficial do app).

## Regras de conteúdo (do usuário)
- NÃO incluir informações desnecessárias ou incorretas — usar apenas dados da Play Store e materiais enviados.
- Apresentar o simulador como ferramenta para hobbyistas e aprendizes (não enfatizar "para técnicos e engenheiros").
- Deixar claro que o acesso ao simulador é gerenciado: requer contato com o administrador.
- NUNCA usar o termo "Manus" ou "JSF Elétrico Manus" em nenhum texto.
- Usar as imagens/screenshots reais enviados (recortadas), não imagens de IA para os diagramas.
- Contatos: jsfeletrico@gmail.com | site www.jsfeletrico.com | Play Store: https://play.google.com/store/apps/details?id=com.jsfeletrico.app
