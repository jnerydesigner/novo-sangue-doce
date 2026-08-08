export type AlertType = "info" | "warning" | "danger" | "success";

export interface AlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
}
