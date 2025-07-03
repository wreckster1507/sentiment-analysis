"use server";

import CodeExamples from "~/components/client/code-examples";
import CopyButton from "~/components/client/copy-button";
import { Inference } from "~/components/client/Inference";
import { SignOutButton } from "~/components/client/signout";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export default async function HomePage() {
  const session = await auth();

  const quota = await db.apiQuota.findUniqueOrThrow({
    where: {
      userId: session?.user.id,
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Glassmorphism Navigation */}
      <nav className="z-50 backdrop-blur-xl bg-white/30 border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-75 animate-pulse"></div>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  SentimentAI
                </h1>
                <p className="text-sm text-slate-500 -mt-1">Emotion Intelligence Platform</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Hero Section with Floating Elements */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-16">
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-full text-violet-700 text-sm font-medium mb-6 animate-bounce-slow">
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
            AI-Powered Emotion Detection
          </div>
          <h2 className="text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-900 via-violet-900 to-indigo-900 bg-clip-text text-transparent">
              Unlock Video
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Emotions
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Transform your videos into emotional insights with our cutting-edge AI. 
            Real-time sentiment analysis that understands human emotions at scale.
          </p>
        </div>

        {/* Main Content with Glassmorphism Cards */}
        <div className="grid xl:grid-cols-3 gap-8">
          {/* Analysis Section - Takes 2 columns */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <Inference quota={{ secretKey: quota.secretKey }} />
          </div>

          {/* Sidebar - API & Stats */}
          <div className="xl:col-span-1 order-1 xl:order-2 space-y-8">
            {/* API Access Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl blur opacity-20"></div>
              <div className="relative backdrop-blur-xl bg-white/40 rounded-3xl border border-white/20 p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.243-6.243C11.978 9.927 12 9.963 12 10a6 6 0 019-5.373z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">API Access</h3>
                    <p className="text-slate-500">Your developer credentials</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Secret Key
                    </label>
                    <p className="text-sm text-slate-500 mb-4">
                      Use this key to authorize API requests. Keep it secure.
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="relative">
                          <code className="block w-full px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 break-all shadow-inner">
                            {quota.secretKey}
                          </code>
                        </div>
                      </div>
                      <CopyButton text={quota.secretKey} />
                    </div>
                  </div>

                  {/* Usage Stats with Animation */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Monthly Usage
                    </label>
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
                      <span className="font-medium">{quota.requestsUsed} of {quota.maxRequests} requests</span>
                      <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-xs font-bold">
                        {Math.round((quota.requestsUsed / quota.maxRequests) * 100)}%
                      </span>
                    </div>
                    <div className="relative w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        style={{
                          width: Math.min((quota.requestsUsed / quota.maxRequests) * 100, 100) + "%",
                        }}
                        className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg animate-shimmer"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Examples Card */}
            <CodeExamples />
          </div>
        </div>
      </div>
    </div>
  );
}