# Migration from S3 to Cloudinary

## Changes Made

### 1. Dependencies
- Removed AWS SDK dependencies for S3
- Added Cloudinary SDK: `cloudinary`

### 2. Environment Variables
Updated `src/env.js` to include Cloudinary configuration:
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: 898836234121745
- `CLOUDINARY_API_SECRET`: IZR45p4CqbfexWqWEAlPTehoVFI

### 3. API Routes Updated

#### Upload URL Route (`src/app/api/upload-url/route.ts`)
- Changed from S3 signed URL generation to Cloudinary direct upload signature
- Now returns upload parameters including signature, timestamp, and Cloudinary upload URL
- Videos are stored in the `inference/` folder on Cloudinary

#### Sentiment Inference Route (`src/app/api/sentiment-inference/route.ts`)
- Updated to generate Cloudinary URLs instead of S3 URLs
- SageMaker endpoint now receives Cloudinary video URLs

### 4. Frontend Changes

#### UploadVideo Component (`src/components/client/UploadVideo.tsx`)
- Changed from S3 PUT upload to Cloudinary POST upload with form data
- Now sends multipart form data with signature authentication

### 5. Database Schema
Updated Prisma schema to include required models:
- `ApiQuota`: For API key management and quota tracking
- `VideoFile`: For tracking uploaded video files

## Setup Instructions

1. **Update Environment Variables**
   - Copy the values from `.env.local` to your actual environment file
   - Replace `your_cloud_name_here` with your actual Cloudinary cloud name

2. **Database Migration**
   ```bash
   npx prisma db push
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run the Application**
   ```bash
   npm run dev
   ```

## How It Works

1. **Upload Flow**:
   - Client requests upload parameters from `/api/upload-url`
   - Server generates Cloudinary signature and returns upload parameters
   - Client uploads video directly to Cloudinary using the signature
   - Video is stored in Cloudinary under the `inference/` folder

2. **Analysis Flow**:
   - Client requests analysis via `/api/sentiment-inference`
   - Server generates Cloudinary URL for the video
   - SageMaker endpoint receives the Cloudinary URL for processing

## Benefits of Cloudinary

- **Better Video Processing**: Cloudinary specializes in media processing
- **Automatic Optimization**: Videos are automatically optimized for delivery
- **CDN Distribution**: Global CDN for faster video loading
- **Transformation API**: Can apply transformations on-the-fly
- **No Storage Management**: No need to manage buckets or permissions

## Notes

- Videos are now stored as `inference/{uuid}` on Cloudinary
- The system maintains backward compatibility with the existing API structure
- SageMaker endpoints receive HTTPS URLs from Cloudinary instead of S3 URLs
- Make sure your SageMaker model can access public HTTPS URLs
