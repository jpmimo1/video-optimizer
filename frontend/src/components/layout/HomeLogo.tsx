"use client";

import { useVideoStore } from "@/store/useVideoStore";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export const HomeLogo = () => {
  const reset = useVideoStore((state) => state.reset);
  return (
    <Link
      href="/"
      onClick={reset}
      className="flex items-center gap-2 font-bold text-xl text-indigo-400 hover:opacity-80 transition-opacity"
    >
      <Sparkles className="w-5 h-5 text-indigo-400" />
      <span>
        Video<span className="text-white">Optima</span>
      </span>
    </Link>
  );
};
