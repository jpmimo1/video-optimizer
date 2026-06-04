import VideoFlow from "@/components/video/VideoFlow";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Online Tool",
};

export default function HomePage() {
  return (
    <div className="w-full">
      <VideoFlow />
    </div>
  );
}
