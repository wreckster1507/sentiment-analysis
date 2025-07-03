import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME as string,
  api_key: env.CLOUDINARY_API_KEY as string,
  api_secret: env.CLOUDINARY_API_SECRET as string,
});

export async function POST(req: NextRequest) {
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
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileId = formData.get('fileId') as string;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const fileName = file.name;
    if (!fileName.match(/\.(mp4|mov|avi)$/i)) {
      return NextResponse.json(
        { error: "Invalid file type. Only .mp4, .mov, .avi are supported" },
        { status: 400 }
      );
    }

    const publicId = `inference/${fileId}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('Uploading to Cloudinary:', {
      publicId,
      originalName: fileName,
      size: buffer.length
    });    // Upload to Cloudinary using server-side method
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          public_id: publicId,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result?.public_id);
            resolve(result);
          }
        }
      ).end(buffer);
    });

    // Store file record in database
    await db.videoFile.create({
      data: {
        key: publicId,
        userId: quota.userId,
        analyzed: false,
      },
    });

    return NextResponse.json({
      success: true,
      key: publicId,
      cloudinaryResult: uploadResult,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
