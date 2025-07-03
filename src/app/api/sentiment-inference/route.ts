import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from "next/server";
import { env } from "~/env";
import { checkAndUpdateQuota } from "~/lib/quota";
import { db } from "~/server/db";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Local model configuration
const LOCAL_MODEL_URL = "http://127.0.0.1:8000";

export async function POST(req: Request) {
  try {
    // Get API key from the header
    const apiKey = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    // Find the user by API key
    const quota = await db.apiQuota.findUnique({
      where: {
        secretKey: apiKey,
      },
      select: {
        userId: true,
      },
    });

    if (!quota) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }    const { key } = await req.json() as { key: string };

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

    if (file.userId !== quota!.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (file.analyzed) {
      return NextResponse.json(
        { error: "File already analyzed" },
        { status: 400 },
      );
    }

    const hasQuota = await checkAndUpdateQuota(quota!.userId, true);

    if (!hasQuota) {
      return NextResponse.json(
        { error: "Monthly quota exceeded" },
        { status: 429 },
      );    }

    // Generate Cloudinary URL for the video
    const cloudinaryUrl = cloudinary.url(key, {
      resource_type: 'video',
      secure: true,
    });

    console.log('Generated Cloudinary URL:', cloudinaryUrl);
    console.log('Video key:', key);    // Call local sentiment analysis model
    console.log('Sending video to local model:', cloudinaryUrl);
    
    try {
      // Option 1: Try sending the URL directly to the local model (if it supports URLs)
      const urlData = new FormData();
      urlData.append('video_url', cloudinaryUrl);
      
      console.log('Trying URL-based approach first...');
      let modelResponse = await fetch(`${LOCAL_MODEL_URL}/predict`, {
        method: 'POST',
        body: urlData,
      });      // Option 2: If URL approach fails, try downloading and uploading
      if (!modelResponse.ok) {
        console.log('URL approach failed, trying download approach...');
        
        // Add a small delay and retry mechanism for Cloudinary processing
        let videoResponse;
        let retries = 3;
        
        while (retries > 0) {
          console.log(`Fetching video from Cloudinary (attempt ${4 - retries})...`);
          videoResponse = await fetch(cloudinaryUrl);
          console.log('Cloudinary response status:', videoResponse.status);
          
          if (videoResponse.ok) break;
          
          retries--;
          if (retries > 0) {
            console.log('Waiting 2 seconds before retry...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        
        if (!videoResponse.ok) {
          throw new Error(`Failed to fetch video from Cloudinary after retries: ${videoResponse.status} - ${videoResponse.statusText}`);
        }
        
        const videoBlob = await videoResponse.blob();
        console.log('Video blob size:', videoBlob.size);

        const formData = new FormData();
        formData.append('video_file', videoBlob, `${key.split('/')[1]}.mp4`);
        
        modelResponse = await fetch(`${LOCAL_MODEL_URL}/predict`, {
          method: 'POST',
          body: formData,
        });
      }

      if (!modelResponse.ok) {
        const errorText = await modelResponse.text();
        console.error('Local model error:', errorText);
        throw new Error(`Model prediction failed: ${modelResponse.status} - ${errorText}`);
      }

      const analysis = await modelResponse.json();
      console.log('Analysis received from local model:', analysis);

      await db.videoFile.update({
        where: { key },
        data: {
          analyzed: true,
        },
      });

      return NextResponse.json({
        analysis,
      });
      
    } catch (modelError) {
      console.error('Local model error:', modelError);
      
      // Fallback: try to get health status from local model
      try {
        const healthResponse = await fetch(`${LOCAL_MODEL_URL}/health`);
        if (!healthResponse.ok) {
          throw new Error('Local model is not healthy');
        }
        console.log('Local model is running but failed to process video');
      } catch (healthError) {
        console.error('Local model is not accessible:', healthError);
        return NextResponse.json(
          { error: "Local sentiment analysis model is not available" },
          { status: 503 }
        );
      }
      
      throw modelError;
    }
  } catch (error) {
    console.error("Analysis error: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}