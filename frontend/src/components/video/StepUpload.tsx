"use client";
import { useVideoStore } from "@/store/useVideoStore";
import { AlertCircle, CloudUpload } from "lucide-react";
import { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";

const MAX_FILE_SIZE = 100 * 1024 * 1024;

export default function StepUpload() {
  const setFile = useVideoStore((state) => state.setFile);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setError(null);

      if (fileRejections.length > 0) {
        const { code } = fileRejections[0].errors[0];
        if (code === "file-too-large") {
          setError("File exceeds the 100MB limit.");
        } else if (code === "file-invalid-type") {
          setError("Unsupported format. Please use MP4, MOV, or WEBM.");
        } else {
          setError("Error loading the file. Please try again.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
    [setFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
      "video/quicktime": [".mov"],
      "video/webm": [".webm"],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Optimize your videos in seconds
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto">
          Compress, convert, trim, or generate thumbnails instantly. No
          watermarks, fast, and directly from your browser.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed transition-all p-12 rounded-2xl text-center cursor-pointer group outline-none
          ${isDragActive ? "border-indigo-500 bg-indigo-500/10" : "border-slate-700 hover:border-indigo-500 bg-slate-800/40 hover:bg-slate-800/80"}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4 pointer-events-none">
          <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto group-hover:bg-indigo-500/20 transition">
            <CloudUpload className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-lg text-slate-200">
              {isDragActive
                ? "Drop your video here!"
                : "Drag and drop your video here, or browse"}
            </p>
            <p className="text-xs text-slate-500">
              MP4, MOV, or WEBM up to 100MB
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center p-4 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
