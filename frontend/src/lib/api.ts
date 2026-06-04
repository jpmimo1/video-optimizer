import axios from "axios";

// Requires NEXT_PUBLIC_API_URL defined in your Next.js .env.local
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = {
  getPresignedUrl: async (
    fileName: string,
    mimeType: string,
    fileSize: number,
  ) => {
    const response = await axios.post(`${API_BASE_URL}/jobs/upload-url`, {
      fileName,
      mimeType,
      fileSize,
    });
    // Returns: { uploadUrl: 'https://...', fileKey: 'uploads/xyz.mp4' }
    return response.data;
  },

  // Leverages Axios onUploadProgress for real-time chunk tracking
  uploadToR2: async (
    presignedUrl: string,
    file: File,
    onProgressCallback: (progress: number) => void,
  ) => {
    await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgressCallback(percentCompleted);
        }
      },
    });
  },

  createJob: async (jobData: {
    fileKey: string;
    fileSize: number;
    type: string;
    settings?: string;
  }) => {
    const response = await axios.post(`${API_BASE_URL}/jobs`, jobData);
    return response.data;
  },

  getJobDetails: async (jobId: string) => {
    const response = await axios.get(`${API_BASE_URL}/jobs/${jobId}`);
    return response.data;
  },
};
