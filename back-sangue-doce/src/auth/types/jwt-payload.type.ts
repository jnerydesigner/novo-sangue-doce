export type JwtPayload = {
  sub: string;
  name: string;
  email: string;
  avatarUrl?: string;
  birthDate?: string;
  diabetesType: string;
  role: "ADMIN" | "USER";
  roles: ("ADMIN" | "USER")[];
  passwordSetupRequired: boolean;
  createdAt: string;
  updatedAt: string;
};
