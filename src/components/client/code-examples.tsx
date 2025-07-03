"use client";

import { useState } from "react";

function CodeExamples() {
  const [activeTab, setActiveTab] = useState<"ts" | "curl">("ts");

  const tsCode = `// Upload and analyze video with TypeScript
const uploadAndAnalyze = async (file: File, apiKey: string) => {
  const fileType = "." + file.name.split(".").pop();
  
  // 1. Get upload signature
  const uploadRes = await fetch("/api/upload-url", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileType }),
  });
  
  const { fileId } = await uploadRes.json();
  
  // 2. Upload to Cloudinary
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileId', fileId);
  
  await fetch('/api/upload-video', {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey },
    body: formData,
  });
  
  // 3. Analyze with local model
  const analysisData = new FormData();
  analysisData.append('video_file', file);
  
  const analysisRes = await fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    body: analysisData,
  });
  
  const analysis = await analysisRes.json();
  console.log("Analysis:", analysis);
  
  return analysis;
};`;

  const curlCode = `# Upload and analyze video with cURL

# 1. Get upload signature
curl -X POST \\
  -H "Authorization: Bearer \${YOUR_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{"fileType": ".mp4"}' \\
  http://localhost:3000/api/upload-url

# 2. Upload to Cloudinary (server-side)
curl -X POST \\
  -H "Authorization: Bearer \${YOUR_API_KEY}" \\
  -F "file=@video.mp4" \\
  -F "fileId=\${FILE_ID}" \\
  http://localhost:3000/api/upload-video

# 3. Analyze with local model
curl -X POST \\
  -F "video_file=@video.mp4" \\
  http://127.0.0.1:8000/predict`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-50 rounded-lg">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900">API Examples</h3>
          <p className="text-sm text-slate-500">
            Code samples for integrating video sentiment analysis
          </p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl overflow-hidden shadow-inner">
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab("ts")}
            className={`
              px-4 py-3 text-sm font-medium transition-all duration-200
              ${activeTab === "ts" 
                ? "bg-slate-800 text-white border-b-2 border-blue-400" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }
            `}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.418.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/>
              </svg>
              TypeScript
            </div>
          </button>
          <button
            onClick={() => setActiveTab("curl")}
            className={`
              px-4 py-3 text-sm font-medium transition-all duration-200
              ${activeTab === "curl" 
                ? "bg-slate-800 text-white border-b-2 border-green-400" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }
            `}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
              </svg>
              cURL
            </div>
          </button>
        </div>
        <div className="p-6">
          <pre className="max-h-80 overflow-y-auto text-sm text-slate-300 leading-relaxed">
            <code className="language-typescript">{activeTab === "ts" ? tsCode : curlCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export default CodeExamples;