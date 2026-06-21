export const navItems = [
  { label: "Materias", href: "#materias" },
  { label: "Glicose", href: "#glicose" },
  { label: "Guias", href: "#guias" },
  { label: "Rotina", href: "#rotina" },
];

export const articles = [
  {
    title: "Nova fase dos sensores: leitura continua vira aliada da autonomia",
    excerpt:
      "Monitores continuos sairam do hospital e entraram na rotina. Entenda como a leitura em tempo real muda decisoes sobre comida, movimento e descanso.",
    tag: "Cuidado diario",
    color: "green",
    meta: "Por Helena Marques | 8 min de leitura | Hoje",
    image: "/images/sensor.png",
    imageVertical: "/images/sensor.png",
  },
  {
    title: "Prato equilibrado sem contagem complicada",
    excerpt: "Um metodo visual para montar refeicoes que sustentam a glicemia.",
    tag: "Alimentacao",
    color: "tomato",
    meta: "5 min | Ontem",
    image: "/original-project/screenshots/02-scan.png",
    imageVertical: "/images/comida_saudavel_vertical.png",
  },
  {
    title: "Sono irregular pode afetar a resistencia a insulina",
    excerpt: "O que a ciencia do sono diz sobre noites curtas e picos de acucar.",
    tag: "Prevencao",
    color: "blue",
    meta: "6 min | 2 dias",
    image: "/original-project/screenshots/03-scan.png",
    imageVertical: "/images/comida_saudavel_vertical.png",
  },
];

export type Article = (typeof articles)[number];

export const guides = [
  {
    number: "01",
    title: "Antes da consulta",
    copy: "O que anotar, quais perguntas levar e como chegar preparado para uma conversa que rende.",
    color: "text-tomato",
    href: "/guias/antes-da-consulta",
  },
  {
    number: "02",
    title: "No mercado",
    copy: "Como ler rotulos sem estresse e montar uma cesta que ajuda a estabilizar a glicemia.",
    color: "text-green",
    href: "/guias/no-mercado",
  },
  {
    number: "03",
    title: "Depois do exercicio",
    copy: "Reposicao, hidratacao e sinais de atencao para fechar o treino com seguranca.",
    color: "text-blue",
    href: "/guias/depois-do-exercicio",
  },
];
