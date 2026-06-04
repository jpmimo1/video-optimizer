"use client";
import { useState } from "react";
import {
  FileVideo,
  Trash2,
  Minimize,
  RefreshCw,
  Scissors,
  ImageIcon,
  Settings,
  LucideIcon,
} from "lucide-react";
import { Tool, useVideoStore } from "@/store/useVideoStore";
import { formatBytes } from "@/lib/utils";

export default function StepConfig() {
  const file = useVideoStore((state) => state.file);
  const setJobConfig = useVideoStore((state) => state.setJobConfig);
  const setStep = useVideoStore((state) => state.setStep);
  const reset = useVideoStore((state) => state.reset);

  const [activeTool, setActiveTool] = useState<Tool>("COMPRESS");
  const [compressLevel, setCompressLevel] = useState("balanced");
  const [convertFormat, setConvertFormat] = useState("mp4");
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:00:10");
  const [thumbnailTime, setThumbnailTime] = useState("5");

  if (!file) return null;

  const handleStart = () => {
    let settings: Record<string, string | number | boolean> = {};

    if (activeTool === "COMPRESS") settings = { level: compressLevel };
    if (activeTool === "CONVERT") settings = { format: convertFormat };
    if (activeTool === "TRIM") settings = { startTime, endTime };
    if (activeTool === "THUMBNAIL") settings = { timestamp: thumbnailTime };

    setJobConfig({ type: activeTool, settings });
    setStep("PROCESSING");
  };

  return (
    <div className="w-full bg-slate-800/50 border border-slate-800 p-8 rounded-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <FileVideo className="text-indigo-400 w-6 h-6" />
          <div>
            <h2 className="font-semibold text-slate-200 truncate max-w-50 sm:max-w-xs">
              {file.name}
            </h2>
            <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-rose-400 transition"
        >
          <Trash2 className="w-4 h-4" /> Cancel
        </button>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-400 block">
          What would you like to do?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ToolButton
            id="COMPRESS"
            icon={Minimize}
            label="Compress"
            activeTool={activeTool}
            onClick={() => setActiveTool("COMPRESS")}
          />
          <ToolButton
            id="CONVERT"
            icon={RefreshCw}
            label="Convert"
            activeTool={activeTool}
            onClick={() => setActiveTool("CONVERT")}
          />
          <ToolButton
            id="TRIM"
            icon={Scissors}
            label="Trim"
            activeTool={activeTool}
            onClick={() => setActiveTool("TRIM")}
          />
          <ToolButton
            id="THUMBNAIL"
            icon={ImageIcon}
            label="Thumbnail"
            activeTool={activeTool}
            onClick={() => setActiveTool("THUMBNAIL")}
          />
        </div>
      </div>

      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800/60 min-h-25 flex items-center">
        {activeTool === "COMPRESS" && (
          <div className="w-full space-y-3">
            <label className="text-sm font-medium text-slate-400 block">
              Compression Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              <RadioOption
                name="comp"
                value="balanced"
                label="Balanced"
                currentVal={compressLevel}
                onChange={setCompressLevel}
              />
              <RadioOption
                name="comp"
                value="high"
                label="High Quality"
                currentVal={compressLevel}
                onChange={setCompressLevel}
              />
              <RadioOption
                name="comp"
                value="low"
                label="Max Compress"
                currentVal={compressLevel}
                onChange={setCompressLevel}
              />
            </div>
          </div>
        )}

        {activeTool === "CONVERT" && (
          <div className="w-full space-y-3">
            <label className="text-sm font-medium text-slate-400 block">
              Target Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              <RadioOption
                name="fmt"
                value="mp4"
                label="MP4 (.mp4)"
                currentVal={convertFormat}
                onChange={setConvertFormat}
              />
              <RadioOption
                name="fmt"
                value="webm"
                label="WebM (.webm)"
                currentVal={convertFormat}
                onChange={setConvertFormat}
              />
              <RadioOption
                name="fmt"
                value="mov"
                label="MOV (.mov)"
                currentVal={convertFormat}
                onChange={setConvertFormat}
              />
            </div>
          </div>
        )}

        {activeTool === "TRIM" && (
          <div className="w-full space-y-3">
            <label className="text-sm font-medium text-slate-400 block">
              Trim Range (Time)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 block mb-1">
                  Start (hh:mm:ss)
                </span>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">
                  End (hh:mm:ss)
                </span>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {activeTool === "THUMBNAIL" && (
          <div className="w-full space-y-3">
            <label className="text-sm font-medium text-slate-400 block">
              Capture timestamp
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                value={thumbnailTime}
                onChange={(e) => setThumbnailTime(e.target.value)}
                className="w-32 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
              />
              <span className="text-sm text-slate-500">seconds from start</span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleStart}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
      >
        <Settings className="w-5 h-5" /> Optimize Video
      </button>
    </div>
  );
}

type ToolButtonProps = {
  icon: LucideIcon;
  label: string;
  id: string;
  activeTool: string;
  onClick: () => void;
};

function ToolButton({
  icon: Icon,
  label,
  id,
  activeTool,
  onClick,
}: ToolButtonProps) {
  const isActive = activeTool === id;
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border flex flex-col items-center gap-2 font-medium transition text-sm
        ${isActive ? "border-indigo-500 bg-indigo-500/10 text-indigo-400" : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700"}`}
    >
      <Icon className="w-5 h-5" /> {label}
    </button>
  );
}

type RadioOptionProps = {
  name: string;
  label: string;
  defaultChecked?: boolean;
  value: string;
  currentVal: string;
  onChange: (newValue: string) => void;
};

function RadioOption({
  name,
  label,
  value,
  currentVal,
  onChange,
}: RadioOptionProps) {
  const isChecked = currentVal === value;
  return (
    <label
      className={`border p-3 rounded-lg text-center cursor-pointer block transition text-sm
      ${isChecked ? "border-indigo-500 bg-indigo-500/10 text-indigo-100" : "border-slate-700 bg-slate-800 text-slate-300 hover:border-indigo-400"}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={isChecked}
        onChange={() => onChange(value)}
        className="hidden"
      />
      {label}
    </label>
  );
}
