export type JwtPayload = {
  sub: string;
  name: string;
  email: string;
  birthDate?: string;
  diabetesType: string;
  role: 'ADMIN' | 'USER';
  roles: ('ADMIN' | 'USER')[];
  createdAt: string;
  updatedAt: string;
};
