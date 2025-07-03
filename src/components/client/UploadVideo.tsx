"use client";

import { useState } from "react";
import { FiUpload } from "react-icons/fi";
import type { Analysis } from "./Inference";

interface UploadVideoProps {
  apiKey: string;
  onAnalysis: (analysis: Analysis) => void;
}

function UploadVideo({ apiKey, onAnalysis }: UploadVideoProps) {
  const [status, setStatus] = useState<"idle" | "uploading" | "analyzing">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    try {
      setStatus("uploading");
      setError(null);

      const fileType = `.${file.name.split(".").pop()}`;

      // 1. Get upload URL
      const res = await fetch("/api/upload-url", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileType: fileType }),
      });

      if (!res.ok) {
        const error = await res.json() as { error?: string };
        throw new Error(error?.error ?? "Failed to get upload URL");
      }

      const { uploadMethod, fileId } = await res.json() as { uploadMethod: string; fileId: string; key: string };
      console.log('Upload method:', uploadMethod);

      // 2. Upload file via server-side endpoint
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileId', fileId);

      const uploadRes = await fetch('/api/upload-video', {
        method: "POST",
        headers: {
          Authorization: "Bearer " + apiKey,
        },
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error('Server upload error:', errorText);
        throw new Error(`Failed to upload file: ${uploadRes.status} - ${errorText}`);
      }

      const uploadResult = await uploadRes.json() as { success: boolean };
      console.log('Upload successful:', uploadResult);

      setStatus("analyzing");

      // 3. Analyze video - Direct call to local model
      const analysisFormData = new FormData();
      analysisFormData.append('video_file', file);
      
      const analysisRes = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: analysisFormData,
      });

      if (!analysisRes.ok) {
        const error = await analysisRes.json() as { error?: string };
        console.error('Analysis failed:', error);
        throw new Error(error?.error ?? "Failed to analyze video");
      }

      const analysis = await analysisRes.json() as Analysis;

      console.log("Analysis response status:", analysisRes.status);
      console.log("Analysis response headers:", Object.fromEntries(analysisRes.headers.entries()));
      console.log("Analysis raw response:", analysis);
      console.log("Analysis structure:", JSON.stringify(analysis, null, 2));
      
      onAnalysis(analysis);
      setStatus("idle");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed");
      console.error("Upload failed", error);
      throw error;
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
        <div className="relative flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white p-12 hover:border-violet-400 hover:bg-gradient-to-br hover:from-violet-50 hover:to-indigo-50 transition-all duration-300 group">
          <input
            type="file"
            accept="video/mp4,video/mov,video/avi"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                void handleUpload(file);
              }
            }}
            id="video-upload"
            disabled={status !== "idle"}
          />
          <label
            htmlFor="video-upload"
            className="flex cursor-pointer flex-col items-center"
          >
            <div className="relative">
              {status === "idle" && (
                <div className="p-4 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <FiUpload className="w-8 h-8 text-white" />
                </div>
              )}
              {status === "uploading" && (
                <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg animate-pulse">
                  <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4" />
                  </svg>
                </div>
              )}
              {status === "analyzing" && (
                <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg">
                  <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              )}
            </div>
            <h3 className="text-xl font-semibold mt-4 text-slate-800 group-hover:text-violet-700 transition-colors duration-300">
              {status === "uploading"
                ? "Uploading your video..."
                : status === "analyzing"
                  ? "Analyzing emotions..."
                  : "Upload a video"}
            </h3>
            <p className="text-center text-sm text-slate-500 mt-2 max-w-md">
              {status === "idle" && "Select a video file to analyze emotions and sentiment. Supports MP4, MOV, and AVI formats."}
              {status === "uploading" && "Please wait while we securely upload your video file."}
              {status === "analyzing" && "Our AI is processing your video to detect emotions and sentiment patterns."}
            </p>
            {status === "idle" && (
              <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-slate-100 rounded-full text-xs text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Files are processed locally and securely</span>
              </div>
            )}
          </label>
        </div>
      </div>
      
      {error && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800">Upload Error</h4>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadVideo;