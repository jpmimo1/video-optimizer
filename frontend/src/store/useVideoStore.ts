import { create } from "zustand";

export type Step = "UPLOAD" | "CONFIG" | "PROCESSING" | "RESULT";
export type Tool = "COMPRESS" | "CONVERT" | "TRIM" | "THUMBNAIL";

export interface JobConfig {
  type: Tool;
  settings: Record<string, string | number | boolean>;
}

export interface JobResult {
  url: string;
  sizeProcessed: number;
}

interface VideoState {
  currentStep: Step;
  file: File | null;
  jobConfig: JobConfig | null;
  jobResult: JobResult | null;

  setStep: (step: Step) => void;
  setFile: (file: File | null) => void;
  setJobConfig: (config: JobConfig | null) => void;
  setJobResult: (result: JobResult) => void;
  reset: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  currentStep: "UPLOAD",
  file: null,
  jobConfig: null,
  jobResult: null,

  setStep: (step) => set({ currentStep: step }),
  setFile: (file) => set({ file, currentStep: file ? "CONFIG" : "UPLOAD" }),
  setJobConfig: (config) => set({ jobConfig: config }),
  setJobResult: (result) => set({ jobResult: result }),
  reset: () => set({ currentStep: "UPLOAD", file: null, jobConfig: null }),
}));
