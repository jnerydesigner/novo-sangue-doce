const sensorPostContent = [
  {
    type: "paragraph",
    content:
      "Durante anos, medir a glicemia significou um ritual pontual: a picada no dedo, a fita, o numero isolado de um instante. Esse numero dizia pouco sobre o que acontecia antes e depois, e quase nada sobre o porque. A chegada dos sensores de leitura continua mudou essa relacao. Em vez de fotografias soltas, agora e possivel assistir ao filme inteiro do dia.",
  },
  {
    type: "paragraph",
    content:
      "Um sensor de monitoramento continuo, tambem conhecido como CGM, e um pequeno filamento aplicado sob a pele que mede a glicose no liquido entre as celulas a cada poucos minutos. Os dados aparecem no celular como uma curva: sobe, desce, estabiliza. O que parecia abstrato vira visivel.",
  },
  { type: "heading", level: 2, content: "Do numero isolado a tendencia" },
  {
    type: "paragraph",
    content:
      "O ganho mais importante nao e o valor de agora, mas a direcao. Uma glicemia de 140 subindo rapido pede uma decisao diferente de uma glicemia de 140 ja em queda. Essa seta de tendencia, para cima, estavel ou para baixo, e o que transforma o dado em conduta.",
  },
  {
    type: "paragraph",
    content:
      "Com o tempo, padroes emergem sozinhos. A pessoa percebe que aquele lanche da tarde provoca um pico mais alto do que imaginava, ou que uma caminhada curta depois do almoco suaviza a curva de forma consistente. Sao descobertas pessoais, nao regras de bula.",
  },
  {
    type: "quote",
    content:
      "O sensor nao decide por voce. Ele devolve a informacao no momento em que ela ainda pode mudar a proxima escolha.",
  },
  { type: "heading", level: 2, content: "O que a leitura continua revela" },
  {
    type: "paragraph",
    content: "Tres aspectos costumam surpreender quem comeca a acompanhar a curva de perto:",
  },
  {
    type: "list",
    items: [
      "As madrugadas. Variacoes noturnas que passavam despercebidas no exame de ponta de dedo agora aparecem e ajudam a ajustar jantar e rotina de sono.",
      "O efeito do movimento. Pequenas atividades, como subir escadas ou uma caminhada leve, tem impacto mensuravel e imediato.",
      "O tempo no alvo. Em vez de perseguir um numero perfeito, o foco passa a ser quanto do dia se mantem dentro de uma faixa saudavel.",
    ],
  },
  {
    type: "image",
    src: "/original-project/screenshots/01-scan.png",
    alt: "Curva de glicemia ao longo do dia em um aplicativo",
    caption:
      "A curva de um dia comum: refeicoes, exercicio e sono deixam marcas reconheciveis na linha.",
  },
  { type: "heading", level: 2, content: "Tecnologia e meio, nao fim" },
  {
    type: "paragraph",
    content:
      "Ha um risco silencioso na abundancia de dados: transformar o cuidado em vigilancia ansiosa, checando a tela a cada minuto. O objetivo e o oposto. Bem usada, a leitura continua reduz a incerteza e devolve liberdade. Voce confia mais no proprio corpo porque entende melhor como ele responde.",
  },
  {
    type: "callout",
    title: "Para levar com voce",
    content:
      "Antes de mudar qualquer rotina com base no que o sensor mostra, vale conversar com a equipe de saude. A leitura continua e uma ferramenta de apoio a decisao, nao substitui ajustes de tratamento, dose ou medicacao.",
  },
  { type: "heading", level: 3, content: "Por onde comecar" },
  {
    type: "paragraph",
    content:
      "Quem tem interesse pode pedir orientacao ao endocrinologista ou a equipe de saude sobre o modelo mais adequado ao seu caso. Vale lembrar que disponibilidade, custo e cobertura variam, e que o melhor sensor e aquele que cabe na sua vida e que voce consegue usar de forma consistente.",
  },
  {
    type: "paragraph",
    content:
      "No fim, a tecnologia so cumpre seu papel quando se dissolve na rotina: deixa de ser novidade e vira habito, um aliado discreto a favor de decisoes mais tranquilas, dia apos dia.",
  },
];

function buildSimplePostContent(title, excerpt) {
  return [
    {
      type: "paragraph",
      content: excerpt,
    },
    {
      type: "paragraph",
      content:
        "A proposta desta materia e transformar observacoes do cotidiano em decisoes mais claras, sem alarmismo e sem prometer respostas universais. Cada rotina tem contexto, historico e combinacoes proprias.",
    },
    {
      type: "heading",
      level: 2,
      content: title,
    },
    {
      type: "paragraph",
      content:
        "O melhor ponto de partida e registrar o que aconteceu antes e depois da leitura: horario, refeicao, movimento, sono, sintomas e qualquer mudanca recente. Com esse conjunto, a conversa com a equipe de saude fica mais objetiva.",
    },
    {
      type: "callout",
      title: "Nota de cuidado",
      content:
        "Este conteudo tem carater educativo e nao substitui avaliacao profissional. Ajustes de tratamento, dose ou medicacao devem ser combinados com a equipe de saude.",
    },
  ];
}

module.exports = {
  buildSimplePostContent,
  sensorPostContent,
};
