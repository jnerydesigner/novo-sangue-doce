import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

export const alertVariants = {
  info: {
    icon: Info,
    title: "Importante",
    container: "border-[#b9d9fb] bg-[#eff7ff] text-[#55718f]",
    titleColor: "text-[#1e6dc4]",
    iconColor: "text-[#1e6dc4]",
  },

  warning: {
    icon: TriangleAlert,
    title: "Atenção",
    container: "border-[#f6d58d] bg-[#fff9e8] text-[#80672f]",
    titleColor: "text-[#b7791f]",
    iconColor: "text-[#d69e2e]",
  },

  danger: {
    icon: CircleAlert,
    title: "Perigo",
    container: "border-[#f3b8b8] bg-[#fff1f1] text-[#8b4b4b]",
    titleColor: "text-[#c53030]",
    iconColor: "text-[#dc2626]",
  },

  success: {
    icon: CircleCheck,
    title: "Sucesso",
    container: "border-[#b9e4cc] bg-[#effaf4] text-[#4e7460]",
    titleColor: "text-[#258052]",
    iconColor: "text-[#2f9e67]",
  },
};
