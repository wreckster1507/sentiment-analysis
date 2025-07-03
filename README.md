# SentimentAI - Video Emotion Analysis Platform

A modern, AI-powered web application that analyzes emotions and sentiment in video content using cutting-edge machine learning models. Built with Next.js, featuring a beautiful glassmorphism UI and real-time video processing capabilities.

![SentimentAI](https://img.shields.io/badge/SentimentAI-v1.0.0-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- **🎭 Real-time Emotion Detection** - Analyze facial expressions and vocal patterns
- **💭 Sentiment Analysis** - Detect positive, negative, and neutral sentiments
- **📊 Timeline Analysis** - View emotional changes throughout the video
- **🔒 Secure Processing** - Local AI processing with secure cloud storage
- **📱 Responsive Design** - Modern glassmorphism UI that works on all devices
- **🔑 API Access** - RESTful API for developers with authentication
- **📈 Usage Analytics** - Track your API usage and quotas
- **⚡ Fast Processing** - Optimized for quick video analysis

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Local ML model server running on port 8000

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sentiment-ai.git
   cd sentiment-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   DATABASE_URL=your-database-url
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Start the ML model server**
   ```bash
   # In a separate terminal
   python -m uvicorn main:app --host 127.0.0.1 --port 8000
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application in action!

## 🏗️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[React Icons](https://react-icons.github.io/react-icons/)** - Icon library

### Backend
- **[NextAuth.js](https://next-auth.js.org)** - Authentication solution
- **[Prisma](https://prisma.io)** - Database ORM
- **[SQLite](https://sqlite.org)** - Local database (development)

### AI/ML
- **FastAPI** - Python API server for ML models
- **Custom ML Models** - Emotion and sentiment detection

### Infrastructure
- **[Cloudinary](https://cloudinary.com)** - Video storage and processing
- **[Vercel](https://vercel.com)** - Deployment platform (recommended)

## 📖 API Documentation

### Authentication
All API requests require authentication using your secret key:

```bash
Authorization: Bearer YOUR_SECRET_KEY
```

### Endpoints

#### Upload Video
```bash
POST /api/upload-url
Content-Type: application/json

{
  "fileType": ".mp4"
}
```

#### Get Analysis
```bash
POST /api/sentiment-inference
Content-Type: application/json

{
  "videoUrl": "https://your-video-url.com/video.mp4"
}
```

### Response Format
```json
{
  "analysis": {
    "utterances": [
      {
        "start_time": 0.5,
        "end_time": 3.2,
        "text": "Hello world",
        "emotions": [
          {
            "label": "joy",
            "confidence": 0.85
          }
        ],
        "sentiments": [
          {
            "label": "positive",
            "confidence": 0.92
          }
        ]
      }
    ]
  }
}
```

## 🎨 UI Features

- **Modern Glassmorphism Design** - Beautiful frosted glass effects
- **Gradient Animations** - Smooth color transitions and hover effects
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Dark Mode Ready** - Prepared for dark theme implementation
- **Accessibility** - Built with WCAG guidelines in mind

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js app router
├── components/
│   ├── client/            # Client-side components
│   └── server/            # Server-side components
├── lib/                   # Utility functions
├── server/                # Database and auth configuration
├── styles/                # Global styles
└── schemas/               # Type definitions
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push

### Docker
```bash
docker build -t sentiment-ai .
docker run -p 3000:3000 sentiment-ai
```

### Manual Deployment
```bash
npm run build
npm run start
```

## 📊 Usage Limits

- **Free Tier**: 100 video analyses per month
- **Pro Tier**: 1000 video analyses per month
- **Enterprise**: Unlimited analyses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: sarthakaitha1507@gmail.com


## 🙏 Acknowledgments

- Built with the [T3 Stack](https://create.t3.gg/)
- Emotion detection models powered by state-of-the-art AI
- Icons by [React Icons](https://react-icons.github.io/react-icons/)
- UI inspiration from modern design systems

---

**Made with ❤️ by Sarthak**
