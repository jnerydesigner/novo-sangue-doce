const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export type DiabetesType = "TYPE_1" | "TYPE_2" | "GESTATIONAL" | "OTHER" | "UNKNOWN";

export type User = {
  id: string;
  name: string;
  email: string;
  birthDate?: string;
  diabetesType: DiabetesType;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  birthDate?: string;
  diabetesType?: DiabetesType;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
};

export type AuthProfile = {
  sub: string;
  name: string;
  email: string;
  birthDate?: string;
  diabetesType: string;
  createdAt: string;
  updatedAt: string;
};

export type ReadingContext =
  | "FASTING"
  | "BEFORE_MEAL"
  | "AFTER_MEAL"
  | "BEDTIME"
  | "EXERCISE"
  | "MANUAL"
  | "RANDOM";

export type MeasurementSource = "MANUAL" | "SENSOR" | "IMPORT";

export type MeasurementNoteType =
  | "FASTING_WAKE_UP"
  | "BEFORE_BREAKFAST"
  | "AFTER_BREAKFAST"
  | "MORNING_RANDOM_CHECK"
  | "BEFORE_LUNCH"
  | "AFTER_LUNCH"
  | "AFTERNOON_RANDOM_CHECK"
  | "BEFORE_DINNER"
  | "AFTER_DINNER"
  | "BEFORE_SLEEP"
  | "NIGHT_RANDOM_CHECK"
  | "BEFORE_EXERCISE"
  | "AFTER_EXERCISE"
  | "FEELING_UNWELL"
  | "ROUTINE_CHECK"
  | "DAWN_RANDOM_CHECK";

export type Measurement = {
  id: string;
  userId: string;
  measuredAt: string;
  glucoseValueMgDl: number;
  readingContext: ReadingContext;
  source: MeasurementSource;
  noteType?: MeasurementNoteType;
  noteLabel?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateMeasurementPayload = {
  measuredAt: string;
  glucoseValueMgDl: number;
  readingContext?: ReadingContext;
  source?: MeasurementSource;
  noteType?: MeasurementNoteType;
  timeZone?: string;
};

type AuthenticatedApiParams = {
  accessToken: string;
};

export type MonthlyMeasurementReportDay = {
  date: string;
  day: number;
  measurements: Measurement[];
  summary: {
    averageGlucoseMgDl: number | null;
    totalMeasurements: number;
  };
};

export type MonthlyMeasurementReport = {
  userId: string;
  userName: string;
  year: number;
  month: number;
  period: {
    startDate: string;
    endDate: string;
  };
  excludedContexts: string[];
  summary: {
    averageGlucoseMgDl: number | null;
    daysWithMeasurements: number;
    totalMeasurements: number;
  };
  days: MonthlyMeasurementReportDay[];
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(message || `Erro ${response.status} ao chamar a API.`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (payload: LoginPayload) =>
      apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: payload,
      }),
    profile: (accessToken: string) =>
      apiFetch<AuthProfile>("/auth/profile", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
  },
  users: {
    create: (payload: CreateUserPayload) =>
      apiFetch<User>("/users", {
        method: "POST",
        body: payload,
      }),
    list: () => apiFetch<User[]>("/users"),
    get: (id: string) => apiFetch<User>(`/users/${id}`),
    getEmail: (email: string) => apiFetch<User>(`/users/search?email=${encodeURIComponent(email)}`),
  },
  measurements: {
    create: (payload: CreateMeasurementPayload, params: AuthenticatedApiParams) =>
      apiFetch<Measurement>("/measurements", {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
        method: "POST",
        body: payload,
      }),
    list: (params: AuthenticatedApiParams & { startDate?: string; endDate?: string }) => {
      const searchParams = new URLSearchParams();

      if (params.startDate) {
        searchParams.set("startDate", params.startDate);
      }

      if (params.endDate) {
        searchParams.set("endDate", params.endDate);
      }

      const query = searchParams.toString();

      return apiFetch<Measurement[]>(`/measurements${query ? `?${query}` : ""}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      });
    },
    get: (id: string, params: AuthenticatedApiParams) =>
      apiFetch<Measurement>(`/measurements/${id}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      }),
    today: (params: AuthenticatedApiParams & { timeZone?: string }) => {
      const searchParams = new URLSearchParams();

      if (params.timeZone) {
        searchParams.set("timeZone", params.timeZone);
      }

      const query = searchParams.toString();

      return apiFetch<Measurement[]>(`/measurements/today${query ? `?${query}` : ""}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      });
    },
    monthlyReport: (params: AuthenticatedApiParams & { year?: number; month?: number }) => {
      const searchParams = new URLSearchParams();

      if (params.year) {
        searchParams.set("year", String(params.year));
      }

      if (params.month) {
        searchParams.set("month", String(params.month));
      }

      return apiFetch<MonthlyMeasurementReport>(
        `/measurements/reports/monthly?${searchParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
          },
        },
      );
    },
  },
};
