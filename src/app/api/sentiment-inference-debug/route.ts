import { NextResponse } from "next/server";
import { env } from "~/env";
import { checkAndUpdateQuota } from "~/lib/quota";
import { db } from "~/server/db";

const LOCAL_MODEL_URL = "http://127.0.0.1:8000";

export async function POST(req: Request) {
  console.log('=== Sentiment Analysis Request Started ===');
  
  try {
    // Get API key from the header
    const apiKey = req.headers.get("Authorization")?.replace("Bearer ", "");
    console.log('API Key received:', apiKey ? 'Yes' : 'No');
    
    if (!apiKey) {
      console.log('Error: No API key provided');
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    // Find the user by API key
    console.log('Looking up user by API key...');
    const quota = await db.apiQuota.findUnique({
      where: {
        secretKey: apiKey,
      },
      select: {
        userId: true,
      },
    });

    if (!quota) {
      console.log('Error: Invalid API key');
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }
    
    console.log('User found:', quota.userId);

    const { key } = await req.json() as { key: string };
    console.log('Video key:', key);

    if (!key) {
      console.log('Error: No key provided');
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    console.log('Finding video file in database...');
    const file = await db.videoFile.findUnique({
      where: { key },
      select: { userId: true, analyzed: true },
    });

    if (!file) {
      console.log('Error: File not found in database');
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    console.log('File found, user check...');
    if (file.userId !== quota.userId) {
      console.log('Error: Unauthorized access attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (file.analyzed) {
      console.log('Error: File already analyzed');
      return NextResponse.json(
        { error: "File already analyzed" },
        { status: 400 },
      );
    }

    console.log('Checking quota...');
    const hasQuota = await checkAndUpdateQuota(quota.userId, true);

    if (!hasQuota) {
      console.log('Error: Quota exceeded');
      return NextResponse.json(
        { error: "Monthly quota exceeded" },
        { status: 429 },
      );
    }

    console.log('=== Starting Video Analysis ===');
    
    // For now, let's return a mock response to test the pipeline
    console.log('Mock analysis - marking as complete...');
    
    await db.videoFile.update({
      where: { key },
      data: {
        analyzed: true,
      },
    });    const mockAnalysis = {
      analysis: {
        utterances: [
          {
            start_time: 0.0,
            end_time: 2.5,
            text: "This is a happy moment in the video",
            emotions: [
              { label: "joy", confidence: 0.8 },
              { label: "neutral", confidence: 0.15 },
              { label: "sadness", confidence: 0.05 }
            ],
            sentiments: [
              { label: "positive", confidence: 0.85 },
              { label: "neutral", confidence: 0.10 },
              { label: "negative", confidence: 0.05 }
            ]
          },
          {
            start_time: 2.5,
            end_time: 5.0,
            text: "Another segment with different emotions",
            emotions: [
              { label: "neutral", confidence: 0.6 },
              { label: "joy", confidence: 0.3 },
              { label: "surprise", confidence: 0.1 }
            ],
            sentiments: [
              { label: "neutral", confidence: 0.7 },
              { label: "positive", confidence: 0.25 },
              { label: "negative", confidence: 0.05 }
            ]
          }
        ]
      }
    };    console.log('=== Analysis Complete ===');
    return NextResponse.json(mockAnalysis);

  } catch (error) {
    console.error("=== Analysis Error ===");
    console.error("Error details:", error);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 },
    );
  }
}
