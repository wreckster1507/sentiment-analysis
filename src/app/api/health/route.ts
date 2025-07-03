import { NextResponse } from "next/server";

const LOCAL_MODEL_URL = "http://127.0.0.1:8000";

export async function GET() {
  try {
    // Check if local model is running
    const modelHealthResponse = await fetch(`${LOCAL_MODEL_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!modelHealthResponse.ok) {
      return NextResponse.json({
        status: "unhealthy",
        message: "Local sentiment model is not responding",
        timestamp: new Date().toISOString(),
      }, { status: 503 });
    }

    const modelHealth = await modelHealthResponse.json();

    return NextResponse.json({
      status: "healthy",
      message: "API and local model are running",
      localModel: modelHealth,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json({
      status: "unhealthy",
      message: "Local sentiment model is not accessible",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
