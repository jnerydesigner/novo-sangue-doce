const API_URL =
  process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export type DiabetesType = "TYPE_1" | "TYPE_2" | "GESTATIONAL" | "OTHER" | "UNKNOWN";
export type UserRole = "ADMIN" | "USER";

export type User = {
  id: string;
  name: string;
  email: string;
  birthDate?: string;
  diabetesType: DiabetesType;
  role: UserRole;
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

export type RequestEmailLoginCodePayload = {
  email: string;
};

export type VerifyEmailLoginCodePayload = {
  email: string;
  code: string;
};

export type UpdateProfilePayload = {
  name: string;
  birthDate?: string | null;
  diabetesType: DiabetesType;
};

export type SetPasswordPayload = {
  password: string;
};

export type UpdateAuthorProfilePayload = {
  bio?: string | null;
  role: string;
};

export type CreateAuthorPayload = {
  name: string;
  slug: string;
  role: string;
  bio?: string | null;
  email?: string;
  userId: string;
};

export type CreatePostCategoryPayload = {
  name: string;
  slug: string;
  color: PostAccentColor;
};

export type CreatePostTagPayload = {
  name: string;
  slug: string;
};

export type AuthProfile = {
  sub: string;
  name: string;
  email: string;
  avatarUrl?: string;
  birthDate?: string;
  diabetesType: string;
  role: UserRole;
  roles: UserRole[];
  passwordSetupRequired: boolean;
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
  userAvatarUrl?: string;
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

export type PostAccentColor = "GREEN" | "TOMATO" | "BLUE";
export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type PostAuthor = {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
  email?: string;
  userId: string;
};

export type PostCategory = {
  id: string;
  name: string;
  slug: string;
  color: PostAccentColor;
};

export type PostTag = {
  id: string;
  name: string;
  slug: string;
};

export type PostContentBlock =
  | {
      type: "paragraph";
      content: string;
    }
  | {
      type: "heading";
      level: 2 | 3;
      content: string;
    }
  | {
      type: "quote";
      content: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "ordered-list";
      items: string[];
    }
  | {
      type: "link";
      label?: string;
      text: string;
      href: string;
    }
  | {
      type: "image";
      src: string;
      alt?: string;
      caption?: string;
    }
  | {
      type: "callout";
      title: string;
      content: string;
    };

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  standfirst?: string | null;
  content: PostContentBlock[];
  status: PostStatus;
  featured: boolean;
  readingMinutes: number;
  coverImageUrl: string;
  coverImageAlt?: string | null;
  coverCaption?: string | null;
  verticalImageUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  publishedAt?: string | null;
  authorId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  category: PostCategory;
  tags: PostTag[];
};

export type CreatePostPayload = {
  slug: string;
  title: string;
  excerpt: string;
  content: PostContentBlock[];
  status: PostStatus;
  featured?: boolean;
  readingMinutes: number;
  coverImageUrl: string;
  coverImageAlt?: string;
  coverCaption?: string;
  verticalImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: string;
  authorId: string;
  categoryId: string;
  tagIds?: string[];
};

export type RecipeDifficulty = "EASY" | "MEDIUM" | "HARD";

export type RecipeIngredient = {
  quantity: number | null;
  unit: string | null;
  name: string;
  note?: string | null;
};

export type RecipeInstruction = {
  title?: string | null;
  description: string;
};

export type CreateRecipePayload = CreatePostPayload & {
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  servingSize?: string;
  difficulty: RecipeDifficulty;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  caloriesKcal?: number;
  carbohydratesGrams?: number;
  fiberGrams?: number;
  proteinGrams?: number;
  fatGrams?: number;
  sodiumMg?: number;
};

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: PostContentBlock[];
  status: PostStatus;
  featured: boolean;
  readingMinutes: number;
  coverImageUrl: string;
  coverImageAlt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  publishedAt?: string | null;
  authorId: string;
  categoryId: string;
  author: PostAuthor;
  category: PostCategory;
  tags: PostTag[];
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  servingSize?: string | null;
  difficulty: RecipeDifficulty;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  caloriesKcal?: number | null;
  carbohydratesGrams?: number | null;
  fiberGrams?: number | null;
  proteinGrams?: number | null;
  fatGrams?: number | null;
  sodiumMg?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type RecipeImportPreview = {
  recipe: {
    sourceUrl: string;
    sourceCanonicalUrl?: string | null;
    title: string;
    excerpt: string;
    coverImageSourceUrl?: string | null;
    prepMinutes: number;
    cookMinutes: number;
    servings: number;
    servingSize?: string | null;
    ingredients: Array<RecipeIngredient & { originalText: string }>;
    instructions: RecipeInstruction[];
    nutrition?: {
      caloriesKcal?: number | null;
      carbohydratesGrams?: number | null;
      fiberGrams?: number | null;
      proteinGrams?: number | null;
      fatGrams?: number | null;
      sodiumMg?: number | null;
    } | null;
  };
  confidence: "HIGH" | "MEDIUM" | "LOW";
  warnings: string[];
  fingerprint: string;
  extractor: string;
};

export type DeleteResponse = {
  ok: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type SocialPublicationStatus =
  | "PENDING"
  | "QUEUED"
  | "PROCESSING"
  | "GENERATING_TEXT"
  | "GENERATING_IMAGE"
  | "CONVERTING_IMAGE"
  | "UPLOADING_IMAGE"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "STANDBY";

export type SocialNetwork = "LINKEDIN" | "INSTAGRAM" | "FACEBOOK";
export type SocialPublicationResult = {
  status: "PUBLISHED";
  externalPostId: string | null;
  mediaUrn: string | null;
  publishedAt: string;
};
export type SocialPublicationGenerationMode =
  | "NEW_PUBLICATION"
  | "REGENERATE_TEXT"
  | "REGENERATE_IMAGE";

export type SocialPublication = {
  id: string;
  postId: string;
  status: SocialPublicationStatus;
  generationMode: SocialPublicationGenerationMode;
  parentPublicationId: string | null;
  imageEditInstruction: string | null;
  articleUrl: string | null;
  generatedContent: string | null;
  generatedHashtags: string[] | null;
  generatedShortTitle: string | null;
  generatedImageUrl: string | null;
  socialNetworks: SocialNetwork[];
  publicationResults: Partial<Record<SocialNetwork, SocialPublicationResult>>;
  textModel: string | null;
  imageModel: string | null;
  promptVersion: string | null;
  attemptCount: number;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
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
    requestEmailCode: (payload: RequestEmailLoginCodePayload) =>
      apiFetch<{ ok: true }>("/auth/email-code/request", {
        method: "POST",
        body: payload,
      }),
    verifyEmailCode: (payload: VerifyEmailLoginCodePayload) =>
      apiFetch<LoginResponse>("/auth/email-code/verify", {
        method: "POST",
        body: payload,
      }),
    profile: (accessToken: string) =>
      apiFetch<AuthProfile>("/auth/profile", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    updateProfile: (payload: UpdateProfilePayload, accessToken: string) =>
      apiFetch<{ access_token: string; profile: AuthProfile }>("/auth/profile", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        method: "PATCH",
        body: payload,
      }),
    setPassword: (payload: SetPasswordPayload, accessToken: string) =>
      apiFetch<{ access_token: string; profile: AuthProfile }>("/auth/password", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        method: "PATCH",
        body: payload,
      }),
  },
  users: {
    create: (payload: CreateUserPayload) =>
      apiFetch<User>("/users", {
        method: "POST",
        body: payload,
      }),
    list: (params: AuthenticatedApiParams) =>
      apiFetch<User[]>("/users", {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      }),
    get: (id: string, params: AuthenticatedApiParams) =>
      apiFetch<User>(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      }),
    getEmail: (email: string, params: AuthenticatedApiParams) =>
      apiFetch<User>(`/users/search?email=${encodeURIComponent(email)}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      }),
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
    monthlyReport: (
      params: AuthenticatedApiParams & {
        endDate?: string;
        month?: number;
        startDate?: string;
        year?: number;
      },
    ) => {
      const searchParams = new URLSearchParams();

      if (params.year) {
        searchParams.set("year", String(params.year));
      }

      if (params.month) {
        searchParams.set("month", String(params.month));
      }

      if (params.startDate) {
        searchParams.set("startDate", params.startDate);
      }

      if (params.endDate) {
        searchParams.set("endDate", params.endDate);
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
  posts: {
    list: (params: { page?: number; limit?: number } = {}) => {
      const searchParams = new URLSearchParams();

      if (params.page) {
        searchParams.set("page", String(params.page));
      }

      if (params.limit) {
        searchParams.set("limit", String(params.limit));
      }

      const query = searchParams.toString();

      return apiFetch<PaginatedResponse<Post>>(`/posts${query ? `?${query}` : ""}`);
    },
    create: (payload: CreatePostPayload, params: AuthenticatedApiParams) =>
      apiFetch<Post>("/posts", {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
        method: "POST",
        body: payload,
      }),
    adminList: (params: AuthenticatedApiParams & { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();

      if (params.page) {
        searchParams.set("page", String(params.page));
      }

      if (params.limit) {
        searchParams.set("limit", String(params.limit));
      }

      const query = searchParams.toString();

      return apiFetch<PaginatedResponse<Post>>(`/posts/admin${query ? `?${query}` : ""}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      });
    },
    update: (id: string, payload: CreatePostPayload, params: AuthenticatedApiParams) =>
      apiFetch<Post>(`/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
        method: "PATCH",
        body: payload,
      }),
    delete: (id: string, params: AuthenticatedApiParams) =>
      apiFetch<DeleteResponse>(`/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
        method: "DELETE",
      }),
    get: (id: string, params?: AuthenticatedApiParams) =>
      apiFetch<Post>(`/posts/${id}`, {
        headers: params
          ? {
              Authorization: `Bearer ${params.accessToken}`,
            }
          : undefined,
      }),
    listByAuthor: (authorId: string) => apiFetch<Post[]>(`/posts/authors/${authorId}`),
    getBySlug: (slug: string) => apiFetch<Post>(`/posts/slug/${slug}`),
    categories: () => apiFetch<PostCategory[]>("/posts/categories"),
    createCategory: (payload: CreatePostCategoryPayload, params: AuthenticatedApiParams) =>
      apiFetch<PostCategory>("/posts/categories", {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
        method: "POST",
        body: payload,
      }),
    updateCategory: (
      id: string,
      payload: CreatePostCategoryPayload,
      params: AuthenticatedApiParams,
    ) =>
      apiFetch<PostCategory>(`/posts/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
        method: "PATCH",
        body: payload,
      }),
    tags: () => apiFetch<PostTag[]>("/posts/tags"),
    createTag: (payload: CreatePostTagPayload, params: AuthenticatedApiParams) =>
      apiFetch<PostTag>("/posts/tags", {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
        method: "POST",
        body: payload,
      }),
    updateTag: (id: string, payload: CreatePostTagPayload, params: AuthenticatedApiParams) =>
      apiFetch<PostTag>(`/posts/tags/${id}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
        method: "PATCH",
        body: payload,
      }),
  },
  recipes: {
    list: (params: { page?: number; limit?: number } = {}) => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", String(params.page));
      if (params.limit) searchParams.set("limit", String(params.limit));
      const query = searchParams.toString();
      return apiFetch<PaginatedResponse<Recipe>>(`/recipes${query ? `?${query}` : ""}`);
    },
    adminList: (params: AuthenticatedApiParams & { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", String(params.page));
      if (params.limit) searchParams.set("limit", String(params.limit));
      const query = searchParams.toString();
      return apiFetch<PaginatedResponse<Recipe>>(`/recipes/admin${query ? `?${query}` : ""}`, {
        headers: { Authorization: `Bearer ${params.accessToken}` },
      });
    },
    create: (payload: CreateRecipePayload, params: AuthenticatedApiParams) =>
      apiFetch<Recipe>("/recipes", {
        headers: { Authorization: `Bearer ${params.accessToken}` },
        method: "POST",
        body: payload,
      }),
    update: (id: string, payload: CreateRecipePayload, params: AuthenticatedApiParams) =>
      apiFetch<Recipe>(`/recipes/${id}`, {
        headers: { Authorization: `Bearer ${params.accessToken}` },
        method: "PATCH",
        body: payload,
      }),
    delete: (id: string, params: AuthenticatedApiParams) =>
      apiFetch<DeleteResponse>(`/recipes/${id}`, {
        headers: { Authorization: `Bearer ${params.accessToken}` },
        method: "DELETE",
      }),
    get: (id: string, params: AuthenticatedApiParams) =>
      apiFetch<Recipe>(`/recipes/${id}`, {
        headers: { Authorization: `Bearer ${params.accessToken}` },
      }),
    getBySlug: (slug: string) => apiFetch<Recipe>(`/recipes/slug/${slug}`),
    importFromUrl: (url: string, params: AuthenticatedApiParams) =>
      apiFetch<RecipeImportPreview>("/recipes/import", {
        headers: { Authorization: `Bearer ${params.accessToken}` },
        method: "POST",
        body: { url },
      }),
    authors: () => apiFetch<PostAuthor[]>("/recipes/authors"),
    categories: () => apiFetch<PostCategory[]>("/recipes/categories"),
    tags: () => apiFetch<PostTag[]>("/recipes/tags"),
  },
  socialPublications: {
    publishLinkedin: (
      payload: { postId?: string; socialPublicationId?: string },
      params: AuthenticatedApiParams,
    ) =>
      apiFetch<{
        postId: string;
        socialPublicationId: string;
        linkedinPostId: string | null;
        linkedinImageUrn: string;
        status: "PUBLISHED";
      }>("/publish/linkedin", {
        headers: { Authorization: `Bearer ${params.accessToken}` },
        method: "POST",
        body: payload,
      }),
    list: (params: AuthenticatedApiParams & { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();

      if (params.page) searchParams.set("page", String(params.page));
      if (params.limit) searchParams.set("limit", String(params.limit));

      const query = searchParams.toString();

      return apiFetch<PaginatedResponse<SocialPublication>>(
        `/social-publications/publications${query ? `?${query}` : ""}`,
        { headers: { Authorization: `Bearer ${params.accessToken}` } },
      );
    },
    retry: (id: string, params: AuthenticatedApiParams) =>
      apiFetch<{ id: string; postId: string; status: SocialPublicationStatus; message: string }>(
        `/social-publications/social-publications/${id}/retry`,
        {
          headers: { Authorization: `Bearer ${params.accessToken}` },
          method: "POST",
        },
      ),
    generate: (
      payload: {
        postId: string;
        generationMode: SocialPublicationGenerationMode;
        parentPublicationId?: string;
        imageEditInstruction?: string;
      },
      params: AuthenticatedApiParams,
    ) =>
      apiFetch<{ id: string; postId: string; status: SocialPublicationStatus; message: string }>(
        "/social-publications/posts/social-transform",
        {
          headers: { Authorization: `Bearer ${params.accessToken}` },
          method: "POST",
          body: payload,
        },
      ),
    update: (
      id: string,
      payload: { description: string; socialNetworks: SocialNetwork[] },
      params: AuthenticatedApiParams,
    ) =>
      apiFetch<SocialPublication>(`/social-publications/social-publications/${id}`, {
        headers: { Authorization: `Bearer ${params.accessToken}` },
        method: "PATCH",
        body: payload,
      }),
  },
  postBanners: {
    generate: (postId: string, params: AuthenticatedApiParams) =>
      apiFetch<{ jobId: string; postId: string; status: "queued" }>(
        `/post-banners/posts/${postId}/generate`,
        {
          headers: { Authorization: `Bearer ${params.accessToken}` },
          method: "POST",
        },
      ),
    status: (jobId: string, params: AuthenticatedApiParams) =>
      apiFetch<{
        jobId: string;
        status: "queued" | "processing" | "completed" | "failed";
        progress: number;
        result?: { coverImageAlt: string; coverImageUrl: string; postId: string };
        message?: string;
      }>(`/post-banners/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${params.accessToken}` },
      }),
  },
  authors: {
    list: (params: AuthenticatedApiParams) =>
      apiFetch<PostAuthor[]>("/authors", {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      }),
    create: (payload: CreateAuthorPayload, params: AuthenticatedApiParams) =>
      apiFetch<PostAuthor>("/authors", {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
        method: "POST",
        body: payload,
      }),
    me: (params: AuthenticatedApiParams) =>
      apiFetch<PostAuthor>("/authors/me", {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      }),
    updateMe: (payload: UpdateAuthorProfilePayload, params: AuthenticatedApiParams) =>
      apiFetch<PostAuthor>("/authors/me", {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
        method: "PATCH",
        body: payload,
      }),
    get: (id: string, params: AuthenticatedApiParams) =>
      apiFetch<PostAuthor>(`/authors/${id}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      }),
    getBySlug: (slug: string) => apiFetch<PostAuthor>(`/authors/slug/${slug}`),
    searchByEmail: (email: string, params: AuthenticatedApiParams) =>
      apiFetch<PostAuthor>(`/authors/search?email=${encodeURIComponent(email)}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      }),
  },
};
