"use client";

import StepUpload from "./StepUpload";
import StepConfig from "./StepConfig";
import StepProcessing from "./StepProcessing";
import StepResult from "./StepResult";
import { useVideoStore } from "@/store/useVideoStore";

export default function VideoFlow() {
  const currentStep = useVideoStore((state) => state.currentStep);

  return (
    <div className="w-full flex justify-center">
      {currentStep === "UPLOAD" && <StepUpload />}
      {currentStep === "CONFIG" && <StepConfig />}
      {currentStep === "PROCESSING" && <StepProcessing />}
      {currentStep === "RESULT" && <StepResult />}
    </div>
  );
}
