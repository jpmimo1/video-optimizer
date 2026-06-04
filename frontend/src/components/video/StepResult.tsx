"use client";
import { formatBytes } from "@/lib/utils";
import { useVideoStore } from "@/store/useVideoStore";
import { CheckCircle2, ArrowDownCircle, Info } from "lucide-react";

export default function StepResult() {
  const reset = useVideoStore((state) => state.reset);
  const file = useVideoStore((state) => state.file);
  const jobResult = useVideoStore((state) => state.jobResult);

  if (!file || !jobResult) return null;

  const originalMB = formatBytes(file.size);
  const processedMB = formatBytes(jobResult.sizeProcessed);

  let savingsPercent = 0;
  if (jobResult.sizeProcessed < file.size) {
    savingsPercent = Math.round(
      (1 - jobResult.sizeProcessed / file.size) * 100,
    );
  }

  return (
    <div className="w-full max-w-xl bg-slate-800/50 border border-slate-800 p-8 rounded-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-2xl text-slate-200">
          Ready to download!
        </h3>
        <p className="text-sm text-slate-400">
          Optimization complete. Your video is ready to use.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-center">
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider block">
            Original Size
          </span>
          <span className="text-xl font-bold text-slate-400">{originalMB}</span>
        </div>
        <div className="border-l border-slate-800">
          <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider block">
            Optimized Size
          </span>
          <span className="text-xl font-bold text-emerald-400">
            {processedMB}{" "}
            {savingsPercent > 0 && (
              <span className="text-xs font-normal text-emerald-500">
                (-{savingsPercent}%)
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-xl transition border border-slate-700"
        >
          Optimize another
        </button>
        <a
          href={jobResult.url}
          download={`optimized-${file.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition text-center shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
        >
          <ArrowDownCircle className="w-5 h-5" /> Download Video
        </a>
      </div>

      <div className="text-center text-xs text-slate-500 flex justify-center items-center gap-1">
        <Info className="w-3 h-3 min-w-3" /> For your privacy and security, this
        file will be permanently deleted from our servers in 24 hours.
      </div>
    </div>
  );
}
