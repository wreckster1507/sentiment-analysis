import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from "next/server";
import { env } from "~/env";
import { checkAndUpdateQuota } from "~/lib/quota";
import { db } from "~/server/db";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME as string,
  api_key: env.CLOUDINARY_API_KEY as string,
  api_secret: env.CLOUDINARY_API_SECRET as string,
});

const LOCAL_MODEL_URL = "http://127.0.0.1:8000";

export async function POST(req: Request) {
  console.log('=== Real Sentiment Analysis Started ===');
  
  try {
    // Get API key from the header
    const apiKey = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    // Find the user by API key
    const quota = await db.apiQuota.findUnique({
      where: { secretKey: apiKey },
      select: { userId: true },
    });

    if (!quota) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const { key } = await req.json() as { key: string };
    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const file = await db.videoFile.findUnique({
      where: { key },
      select: { userId: true, analyzed: true },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (file.userId !== quota.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (file.analyzed) {
      return NextResponse.json({ error: "File already analyzed" }, { status: 400 });
    }

    const hasQuota = await checkAndUpdateQuota(quota.userId, true);
    if (!hasQuota) {
      return NextResponse.json({ error: "Monthly quota exceeded" }, { status: 429 });
    }

    // Generate Cloudinary URL for the video
    const cloudinaryUrl = cloudinary.url(key, {
      resource_type: 'video',
      secure: true,
    });

    console.log('Generated Cloudinary URL:', cloudinaryUrl);
    console.log('Sending video to local model...');

    // Check if local model is running first
    try {
      const healthCheck = await fetch(`${LOCAL_MODEL_URL}/health`);
      if (!healthCheck.ok) {
        return NextResponse.json(
          { error: "Local sentiment model is not running. Please start your model server." },
          { status: 503 }
        );
      }
      console.log('Local model health check passed');
    } catch {
      return NextResponse.json(
        { error: "Cannot connect to local sentiment model at http://127.0.0.1:8000" },
        { status: 503 }
      );
    }

    // Try sending video file to local model
    try {
      console.log('Downloading video from Cloudinary...');
      const videoResponse = await fetch(cloudinaryUrl);
      if (!videoResponse.ok) {
        throw new Error(`Failed to fetch video: ${videoResponse.status}`);
      }

      const videoBlob = await videoResponse.blob();
      console.log('Downloaded video, size:', videoBlob.size, 'bytes');

      const formData = new FormData();
      formData.append('video_file', videoBlob, `${key.split('/')[1]}.mp4`);

      console.log('Sending video to local model for analysis...');
      const modelResponse = await fetch(`${LOCAL_MODEL_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!modelResponse.ok) {
        const errorText = await modelResponse.text();
        console.error('Local model error:', errorText);
        throw new Error(`Model analysis failed: ${modelResponse.status} - ${errorText}`);
      }

      const analysis = await modelResponse.json();
      console.log('Local model analysis successful!');
      console.log('Raw model response:', JSON.stringify(analysis, null, 2));

      // Transform the model response to match frontend expectations
      const transformedAnalysis = {
        analysis: {
          utterances: [
            {
              start_time: 0,
              end_time: 156.8, // Use video duration from Cloudinary if available
              text: `Overall video analysis - Primary emotion: ${analysis.emotion?.prediction || 'unknown'}, Primary sentiment: ${analysis.sentiment?.prediction || 'unknown'}`,
              emotions: analysis.emotion?.probabilities ? 
                Object.entries(analysis.emotion.probabilities).map(([label, confidence]) => ({
                  label,
                  confidence: confidence as number
                })) : [],
              sentiments: analysis.sentiment?.probabilities ?
                Object.entries(analysis.sentiment.probabilities).map(([label, confidence]) => ({
                  label,
                  confidence: confidence as number  
                })) : []
            }
          ]
        }
      };

      console.log('Transformed analysis:', JSON.stringify(transformedAnalysis, null, 2));

      await db.videoFile.update({
        where: { key },
        data: { analyzed: true },
      });

      return NextResponse.json(transformedAnalysis);

    } catch (error) {
      console.error('Video analysis failed:', error);
      return NextResponse.json(
        { 
          error: "Video analysis failed", 
          details: error instanceof Error ? error.message : "Unknown error",
          suggestion: "Make sure your local model at http://127.0.0.1:8000 is running and can process video files."
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("=== Analysis Error ===", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
