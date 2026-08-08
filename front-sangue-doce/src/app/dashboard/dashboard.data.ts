import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ChartNoAxesCombined,
  CircleUserRound,
  CookingPot,
  Droplet,
  KeyRound,
  Landmark,
  LayoutDashboard,
  Moon,
  Newspaper,
  PenTool,
  Share2,
  Tags,
  Users,
  Utensils,
} from "lucide-react";

export type DashboardTone = "blue" | "green" | "tomato";

export const glucoseValues = [112, 98, 134, 121, 105, 96, 118, 142, 108, 101, 99, 115];

export const glucoseTimes = ["06h", "08h", "10h", "12h", "14h", "16h", "18h", "20h", "22h", "00h"];

export const glucosePoints = glucoseValues.map((value, index) => ({
  id: `${glucoseTimes[index] ?? `${index}h`}-${value}`,
  index,
  time: glucoseTimes[index],
  value,
}));

export type SidebarItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

export type SidebarGroup = {
  items: SidebarItem[];
  label: string;
};

export const adminSidebarItems: SidebarItem[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Visao geral" },
  { href: "/admin/posts", icon: Newspaper, label: "Materias" },
  { href: "/admin/receitas", icon: CookingPot, label: "Receitas" },
  { href: "/admin/publicacoes-sociais", icon: Share2, label: "Publicacoes sociais" },
  { href: "/admin/publicacoes-institucionais", icon: Landmark, label: "Institucional" },
  { href: "/admin/taxonomia", icon: Tags, label: "Tags e Categorias" },
  { href: "/admin/usuarios", icon: Users, label: "Usuarios" },
  { href: "/admin/autores", icon: PenTool, label: "Autores" },
];

export const dashboardSidebarItems: SidebarItem[] = [
  { href: "/dashboard", icon: CalendarDays, label: "Hoje" },
  { href: "/dashboard/glucose", icon: Droplet, label: "Glicemia" },
  { href: "/dashboard/sleep", icon: Moon, label: "Sono" },
  { href: "/dashboard/meals", icon: Utensils, label: "Refeicoes" },
  { href: "/dashboard/reports", icon: ChartNoAxesCombined, label: "Relatorios" },
  { href: "/dashboard/account", icon: CircleUserRound, label: "Minha conta" },
  { href: "/dashboard/account/password", icon: KeyRound, label: "Senha" },
];

export const adminSidebarGroups: SidebarGroup[] = [
  {
    label: "Painel",
    items: [adminSidebarItems[0]],
  },
  {
    label: "Conteudo",
    items: adminSidebarItems.slice(1, 5),
  },
  {
    label: "Organizacao",
    items: adminSidebarItems.slice(5, 8),
  },
];

export const dashboardSidebarGroups: SidebarGroup[] = [
  {
    label: "Rotina",
    items: dashboardSidebarItems.slice(0, 4),
  },
  {
    label: "Analises",
    items: [dashboardSidebarItems[4]],
  },
  {
    label: "Conta",
    items: dashboardSidebarItems.slice(5, 7),
  },
];

export type SummaryTile = {
  label: string;
  value: string;
  unit: string;
  detail: string;
  tone: DashboardTone;
};

export const summaryTiles: SummaryTile[] = [
  {
    label: "Glicemia",
    value: "115",
    unit: "mg/dL",
    detail: "Ultima leitura estavel",
    tone: "green",
  },
  {
    label: "Tempo na meta",
    value: "78",
    unit: "%",
    detail: "Faixa 70-140 mg/dL",
    tone: "green",
  },
  {
    label: "Sono",
    value: "7h10",
    unit: "",
    detail: "Ontem, meta 7h30",
    tone: "blue",
  },
  {
    label: "Carboidratos",
    value: "77",
    unit: "g",
    detail: "2 refeicoes registradas",
    tone: "tomato",
  },
];

export const readings = [
  {
    day: "Hoje",
    time: "10h05",
    value: 134,
    tag: "Pos-refeicao",
    tone: "green",
  },
  { day: "Hoje", time: "07h10", value: 98, tag: "Jejum", tone: "green" },
  { day: "Ontem", time: "22h40", value: 142, tag: "Noite", tone: "tomato" },
  {
    day: "Ontem",
    time: "13h20",
    value: 121,
    tag: "Pos-refeicao",
    tone: "green",
  },
  { day: "Ontem", time: "07h05", value: 105, tag: "Jejum", tone: "green" },
] satisfies Array<{
  day: string;
  time: string;
  value: number;
  tag: string;
  tone: Exclude<DashboardTone, "blue">;
}>;

export const quickActions = ["Glicemia", "Refeicao", "Sono", "Atividade"];

export const timelineItems = [
  {
    title: "07h10 · Glicemia em jejum",
    description: "98 mg/dL, dentro da meta.",
  },
  {
    title: "13h00 · Almoco",
    description: "Aproximadamente 45 g de carboidratos.",
  },
  {
    title: "18h30 · Caminhada",
    description: "32 minutos em ritmo leve.",
  },
];
