"use client";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, CloudUpload, Hourglass } from "lucide-react";
import { useVideoStore } from "@/store/useVideoStore";
import { api } from "@/lib/api";

export default function StepProcessing() {
  const file = useVideoStore((state) => state.file);
  const jobConfig = useVideoStore((state) => state.jobConfig);
  const setStep = useVideoStore((state) => state.setStep);
  const reset = useVideoStore((state) => state.reset);
  const setJobResult = useVideoStore((state) => state.setJobResult);

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Preparing file...");
  const [title, setTitle] = useState("Starting...");
  const [isUploading, setIsUploading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useRef to prevent double execution in React 18 StrictMode
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!file || !jobConfig || hasStarted.current) return;
    hasStarted.current = true;

    let eventSource: EventSource | null = null;

    const runProcess = async () => {
      try {
        // ==========================================
        // PHASE 1: UPLOAD TO CLOUD (AXIOS)
        // ==========================================
        setTitle("Uploading to cloud");
        setStatus("Requesting secure connection...");

        const { uploadUrl, fileKey } = await api.getPresignedUrl(
          file.name,
          file.type,
          file.size,
        );

        setStatus("Uploading original file...");

        await api.uploadToR2(uploadUrl, file, (percent) => {
          setProgress(percent);
          if (percent === 100) {
            setStatus("Upload complete. Verifying...");
          }
        });

        // ==========================================
        // PHASE 2: JOB CREATION
        // ==========================================
        setIsUploading(false); // Switch UI from "Uploading" to "Processing"
        setProgress(0); // Reset bar for the next phase
        setTitle("Processing video");
        setStatus("Queuing your video for optimization...");

        const job = await api.createJob({
          fileKey,
          fileSize: file.size,
          type: jobConfig.type,
          settings: JSON.stringify(jobConfig.settings),
        });

        // ==========================================
        // PHASE 3: LISTEN TO PROGRESS (SSE)
        // ==========================================
        setStatus("Status: Queued (Preparing servers...)");

        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

        await new Promise<void>((resolve, reject) => {
          eventSource = new EventSource(
            `${API_BASE_URL}/jobs/${job.id}/progress`,
          );

          eventSource.onmessage = async (event: MessageEvent) => {
            const data = JSON.parse(event.data);

            if (data.status === "PROCESSING") {
              setStatus("Status: Processing (Applying magic...)");
              setProgress(data.progress);
            }

            if (data.status === "COMPLETED") {
              setProgress(100);
              setStatus("Optimization complete!");
              eventSource?.close();

              try {
                const finalJobData = await api.getJobDetails(job.id);
                setJobResult({
                  url: finalJobData.videoUrl,
                  sizeProcessed: finalJobData.sizeProcessed,
                });

                setTimeout(() => setStep("RESULT"), 1000);
                resolve();
              } catch (err) {
                console.error(err);
                reject(
                  new Error(
                    "The video was processed, but we couldn't retrieve the download link.",
                  ),
                );
              }
            }

            if (data.status === "FAILED") {
              console.error(data.error);
              eventSource?.close();
              // Reject promise to fall into the catch block and show Error UI
              reject(new Error("Failed to process the video."));
            }
          };

          eventSource.onerror = () => {
            eventSource?.close();
            reject(new Error("Lost real-time connection with the server."));
          };
        });
      } catch (err: unknown) {
        if (eventSource) eventSource.close();
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
      }
    };

    runProcess();

    // Cleanup if the user forcibly closes or unmounts the component
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [file, jobConfig, setStep, setJobResult]);

  if (error) {
    return (
      <div className="w-full max-w-md bg-slate-800/50 border border-slate-800 p-8 rounded-2xl text-center space-y-6">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="font-semibold text-lg text-slate-200">
          Processing Error
        </h3>
        <p className="text-sm text-slate-400">{error}</p>
        <button
          onClick={reset}
          className="mt-4 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-6 rounded-xl transition"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-slate-800/50 border border-slate-800 p-8 rounded-2xl text-center space-y-6">
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>

        {isUploading ? (
          <CloudUpload className="w-8 h-8 text-indigo-400" />
        ) : (
          <Hourglass className="w-8 h-8 text-indigo-400" />
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-lg text-slate-200">{title}</h3>
        <p className="text-sm text-slate-400 px-4">
          {isUploading
            ? "Securely uploading your file to our cloud servers."
            : "Your video is being optimized to deliver the best quality and size."}
        </p>
      </div>

      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
        <div
          className="bg-linear-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-mono text-indigo-400">{status}</span>
        <span className="text-xs font-bold text-slate-300">{progress}%</span>
      </div>
    </div>
  );
}
