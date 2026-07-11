export type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

export type CarbAnalysisResult = {
  ingredientes?: string[];
  confianca?: "alta" | "media" | "baixa" | string;
  observacoes?: string;
  carboidratos?: string | number | null;
  proteinas?: string | number | null;
  gorduras?: string | number | null;
  glicose_estimada?: number | null;
  erro?: string;
  bruto?: string;
  [key: string]: unknown;
};

export type PublicCarbAnalysis = {
  id: string;
  userId: string;
  imageUrl?: string | null;
  result: CarbAnalysisResult;
  estimatedGlucose?: number | null;
  totalCarbsGrams?: number | null;
  confidence?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CountCarbJobData = {
  userId: string;
  imageUrl: string;
  mimetype: string;
  originalName: string;
};

export type QueuedCarbAnalysis = {
  jobId: string;
  status: "queued";
  imageUrl: string;
};

export type CarbAnalysisJobStatus = {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed" | "unknown";
};
