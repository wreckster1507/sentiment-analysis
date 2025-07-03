import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

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
    }    const { fileType } = await req.json() as { fileType: string };

    if (!fileType?.match(/\.(mp4|mov|avi)$/i)) {
      return NextResponse.json(
        { error: "Invalid file type. Only .mp4, .mov, .avi are supported" },
        { status: 400 },
      );
    }    const id = crypto.randomUUID();
    const publicId = `inference/${id}`;
    
    // Instead of signed upload, let's use server-side upload
    // We'll return a different approach: upload to our server first, then to Cloudinary
    
    return NextResponse.json({
      uploadMethod: "server",
      fileId: id,
      fileType,
      key: publicId,
      message: "Upload via server endpoint"
    });
  } catch (error) {
    console.error("Upload error: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}