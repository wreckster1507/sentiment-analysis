import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from "next/server";
import { env } from "~/env";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME as string,
  api_key: env.CLOUDINARY_API_KEY as string,
  api_secret: env.CLOUDINARY_API_SECRET as string,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json({ error: "Key parameter required" }, { status: 400 });
    }

    // Generate different URL formats to test
    const urls = {
      basic: cloudinary.url(key, {
        resource_type: 'video',
        secure: true,
      }),
      withFormat: cloudinary.url(key, {
        resource_type: 'video',
        secure: true,
        format: 'mp4'
      }),
      publicUrl: `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/video/upload/${key}`,
      publicUrlMp4: `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/video/upload/${key}.mp4`,
    };

    console.log('Testing Cloudinary URLs for key:', key);
    console.log('Generated URLs:', urls);

    // Test each URL
    const results = {};
    
    for (const [name, url] of Object.entries(urls)) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        results[name] = {
          url,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          accessible: response.ok
        };
      } catch (error) {
        results[name] = {
          url,
          error: error instanceof Error ? error.message : 'Unknown error',
          accessible: false
        };
      }
    }

    return NextResponse.json({
      key,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      urls,
      testResults: results
    });

  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json({
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
