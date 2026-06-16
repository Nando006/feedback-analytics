/**
 * Explicações em linguagem simples dos CONCEITOS DE CONFIGURAÇÃO DA COLETA que
 * costumam confundir o gestor (catálogo, escopo de itens, perguntas/subperguntas,
 * toggles "Ativa", QR Code, link, etc.). Centralizadas aqui para reuso pelo
 * componente HelpHint (ícone "?") nas telas de configuração.
 *
 * É o par de `metricExplanations.ts` (que cuida das MÉTRICAS); separados de
 * propósito para não misturar "o que significa este número" com "o que faz este
 * controle". Ambos compartilham a mesma apresentação via HelpPopover.
 */

export type HelpTopicKey =
  | 'catalogHub'
  | 'feedbackTypeToggle'
  | 'itemScope'
  | 'generalFeedback'
  | 'evaluationQuestions'
  | 'starsOnly'
  | 'subquestions'
  | 'questionActiveToggle'
  | 'removeQuestion'
  | 'preview'
  | 'questionLength'
  | 'qrCollectionToggle'
  | 'qrCodePurpose'
  | 'formLink'
  | 'itemQrStatus'
  | 'removeCatalogItem'
  | 'aiContextFields';

export type HelpTopicContent = {
  title: string;
  paragraphs: string[];
  /** Exemplo prático opcional, destacado no modal. */
  example?: string;
};

export const HELP_TOPICS: Record<HelpTopicKey, HelpTopicContent> = {
  catalogHub: {
    title: 'O que é o Catálogo',
    paragraphs: [
      'Aqui você decide COMO os seus clientes vão avaliar a sua empresa. Pode coletar um feedback geral, sobre o negócio como um todo, e também feedbacks separados por Produtos, Serviços e Departamentos.',
      'Separar por tipo serve para você enxergar com clareza o que agrada e o que precisa melhorar em cada parte do negócio. Ative só os tipos que fazem sentido para você; depois é só cadastrar os itens de cada um e gerar os QR Codes.',
    ],
    example: 'Uma loja pode separar a avaliação de Produtos da avaliação de Departamentos como o Caixa.',
  },
  feedbackTypeToggle: {
    title: 'Ativar um tipo',
    paragraphs: [
      'Ligar um tipo (Produtos, Serviços ou Departamentos) libera a tela onde você cadastra os itens daquele tipo, cada um com o seu QR Code. Só aparece para o cliente o que você ativar e salvar.',
      'Desligar um tipo apenas o esconde das novas coletas. Nada do que você já cadastrou é apagado e os feedbacks antigos continuam guardados. Se reativar depois, tudo volta como estava.',
    ],
  },
  itemScope: {
    title: 'O que é este item',
    paragraphs: [
      'Este item é UM ponto específico da sua operação: um produto, um serviço ou um departamento. Tudo o que você configura aqui (nome, perguntas e QR Code) vale só para ele.',
      'Cada item tem o seu próprio QR Code e gera métricas separadas, então você compara o desempenho de cada um sem misturar as respostas.',
      'É diferente do Feedback geral, que avalia a empresa como um todo. Use os itens para enxergar os detalhes; use o Feedback geral para a visão do conjunto.',
    ],
    example: 'Uma loja pode ter os itens Caixa, Estoque e Atendimento, cada um com QR Code e nota próprios.',
  },
  generalFeedback: {
    title: 'O que é o Feedback geral',
    paragraphs: [
      'O Feedback geral é a avaliação da sua empresa COMO UM TODO, sem separar por produto, serviço ou departamento. É a visão ampla do seu negócio.',
      'São 3 perguntas para manter essa avaliação comparável ao longo do tempo. Se você quiser a opinião sobre algo específico, configure as perguntas dentro do item correspondente, no Catálogo.',
      'O que você salva aqui vale apenas para o Feedback geral e não altera as perguntas dos itens do Catálogo.',
    ],
    example: '"Como foi sua experiência com nosso atendimento?" mede a empresa toda, não uma loja só.',
  },
  evaluationQuestions: {
    title: 'Perguntas de avaliação',
    paragraphs: [
      'São as perguntas que o cliente responde ao escanear o QR Code deste item, além da nota em ESTRELAS. Servem para você entender o porquê da nota, não só o número.',
      'Você pode ter até 3 perguntas, cada uma com subperguntas opcionais. Quanto mais curto o formulário, maior a chance de o cliente responder até o fim; por isso o limite.',
      'O que você salva aqui vale só para este item: não muda as perguntas dos outros itens nem as do Feedback geral.',
    ],
    example: 'Depois da nota, o cliente vê: "O que mais pesou na sua avaliação?".',
  },
  starsOnly: {
    title: 'Coletar só a nota',
    paragraphs: [
      'Se você não preencher nenhuma pergunta, o cliente avalia este item apenas com a nota em ESTRELAS, sem perguntas de texto. É uma opção válida, não um erro de configuração.',
      'Use isso quando quer uma avaliação rápida, com o menor esforço possível para o cliente. Você pode acrescentar perguntas mais tarde, quando quiser aprofundar.',
    ],
    example: 'Um totem na saída pode pedir só de 1 a 5 estrelas, sem mais nada a digitar.',
  },
  subquestions: {
    title: 'O que são subperguntas',
    paragraphs: [
      'A pergunta principal é o tema central que você quer avaliar. As subperguntas desdobram esse tema em pontos mais específicos, para você entender o que puxou a nota para cima ou para baixo.',
      'Cada subpergunta é avaliada em separado e tem as suas próprias métricas no relatório. São opcionais: deixe só a pergunta principal e adicione subperguntas apenas onde fizer sentido.',
    ],
    example: 'Pergunta: "Como foi o atendimento na recepção?" · Subpergunta: "A recepcionista foi cordial e prestativa?"',
  },
  questionActiveToggle: {
    title: 'Ativar ou pausar a pergunta',
    paragraphs: [
      'Quando uma pergunta está ATIVA, ela aparece no formulário que o cliente responde pelo QR Code. Ao desativar, ela some do formulário a partir daquele momento, mas nada é apagado.',
      'Todo o histórico de respostas continua guardado e visível nos relatórios, marcado como pergunta desativada. Você pode reativar quando quiser, e ela volta com tudo o que já foi coletado.',
      'Ou seja, pausar uma pergunta é seguro e reversível. Use sem medo de perder dados, seja para descansar uma pergunta sazonal ou para preparar uma nova antes de colocá-la no ar.',
    ],
    example: 'Você pausa uma pergunta no inverno e reativa no verão; as respostas das duas estações continuam somadas.',
  },
  removeQuestion: {
    title: 'O que acontece ao remover',
    paragraphs: [
      'Remover ESVAZIA o espaço desta pergunta para você reaproveitá-lo com outra. O texto sai do formulário, mas as respostas já coletadas não são apagadas.',
      'No relatório, o histórico continua disponível, identificado como pergunta antiga. Você nunca perde o que já foi medido.',
      'Use Remover quando quiser limpar o espaço e recomeçar; use o botão Ativa quando quiser apenas pausar, mantendo a pergunta pronta para voltar.',
    ],
    example: 'Você remove uma pergunta pouco útil; a nova entra no lugar e a antiga segue visível no histórico.',
  },
  preview: {
    title: 'Para que serve a Prévia',
    paragraphs: [
      'A PRÉVIA mostra exatamente como o formulário aparece para o cliente que escaneia o QR Code, com as perguntas e subperguntas que você ativou.',
      'É só uma visualização: nada é enviado, publicado ou salvo aqui. Volte para Editar para fazer mudanças e lembre-se de salvar para que elas valham de verdade.',
    ],
    example: 'Antes de salvar, abra a Prévia para conferir se as perguntas fazem sentido na ordem em que o cliente vai vê-las.',
  },
  questionLength: {
    title: 'Por que o limite de caracteres',
    paragraphs: [
      'Cada pergunta precisa ter entre 20 e 150 caracteres. O mínimo evita perguntas curtas demais e vagas; o máximo mantém a pergunta direta para o cliente responder rápido.',
      'Enquanto a pergunta não chegar ao mínimo, o contador fica em alerta e o sistema não deixa salvar. Quando estiver no tamanho certo, aparece um sinal verde.',
    ],
    example: 'Em vez de "Gostou?" (curto demais), escreva "O que você achou do nosso atendimento hoje?".',
  },
  qrCollectionToggle: {
    title: 'Ativar ou pausar a coleta',
    paragraphs: [
      'Este botão LIGA ou desliga a coleta de feedback deste QR Code. Com a coleta ativa, quem escaneia consegue responder; pausada, o formulário fica indisponível e ninguém envia novas respostas.',
      'Pausar não apaga nada. Todos os feedbacks e métricas que você já recebeu continuam guardados; é só uma pausa nas respostas novas, útil durante uma reforma ou enquanto você revisa as perguntas.',
      'Você pode reativar quando quiser. Ao religar, o mesmo QR Code (inclusive os já impressos) volta a funcionar normalmente, sem precisar gerar outro.',
    ],
    example: 'Você pausa o QR fora de temporada e religa na reabertura; nenhum feedback antigo é perdido.',
  },
  qrCodePurpose: {
    title: 'Para que serve este QR Code',
    paragraphs: [
      'Cada QR Code é uma porta de entrada diferente para o feedback. O QR Code do ITEM coleta a opinião sobre aquele produto, serviço ou departamento específico, e as respostas ficam ligadas só a ele.',
      'Já o QR Code GERAL da empresa coleta a impressão sobre o negócio como um todo, sem amarrar a um item. Use os dois em conjunto: o geral na recepção ou no caixa, e os de item junto de cada produto ou setor.',
      'Quanto mais específico o QR Code, mais fácil descobrir exatamente onde melhorar.',
    ],
    example: 'O QR do prato na mesa avalia o prato; o QR geral na saída avalia a visita inteira.',
  },
  formLink: {
    title: 'O link do formulário',
    paragraphs: [
      'Este é o mesmo destino do QR Code, só que em formato de LINK. Quem escaneia o código e quem clica no link cai exatamente no mesmo formulário de feedback.',
      'Serve para quando não dá para imprimir o QR: você copia o link e envia por WhatsApp, e-mail ou redes sociais, ou coloca no seu site. É seguro compartilhar, pois ele abre só o formulário de avaliação, sem acesso ao seu painel.',
      'Se você pausar a coleta, tanto o QR quanto este link param de receber respostas até reativar.',
    ],
    example: 'Cole o link na mensagem de confirmação do pedido para o cliente avaliar depois da entrega.',
  },
  itemQrStatus: {
    title: 'QR ativo ou inativo',
    paragraphs: [
      'Este selo mostra se o item já está pronto para receber feedback. "QR ativo" significa que o QR Code dele está no ar e os clientes conseguem avaliar; "QR inativo" significa que a coleta dele ainda está pausada.',
      'Para ativar, abra o item em Configurar e habilite o QR Code. Itens inativos não recebem novas avaliações, mas mantêm todo o histórico do que já foi coletado.',
    ],
  },
  removeCatalogItem: {
    title: 'Remover um item',
    paragraphs: [
      'Remover tira o item da sua lista e pausa a coleta dele: o QR Code daquele item deixa de funcionar para novas avaliações.',
      'Os feedbacks que esse item já recebeu não somem. Continuam contando nas suas métricas, identificados como item removido, então o seu histórico fica preservado.',
    ],
  },
  aiContextFields: {
    title: 'Para que servem estes campos',
    paragraphs: [
      'Aqui você explica, com as suas palavras, o que a sua empresa faz, qual é o seu foco no momento e o que você quer descobrir nos feedbacks. É o CONTEXTO que a inteligência artificial usa para entender e analisar o que os clientes escrevem.',
      'Quanto mais claro e específico você for, mais útil e direcionada fica a análise. Esses textos não aparecem para o cliente: servem só para deixar a IA por dentro do seu negócio.',
    ],
  },
};
