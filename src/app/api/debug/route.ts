import { NextResponse } from "next/server";
import { env } from "~/env";

export async function GET() {
  try {
    return NextResponse.json({
      cloudinary_configured: {
        cloud_name: env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Missing",
        api_key: env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing", 
        api_secret: env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing",
      },
      values: {
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key_first_chars: env.CLOUDINARY_API_KEY?.toString().substring(0, 4),
        api_secret_first_chars: env.CLOUDINARY_API_SECRET?.toString().substring(0, 4),
      }
    });

  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({
      error: "Error checking environment variables",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
