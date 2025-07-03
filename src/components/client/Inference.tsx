"use client";

import { useState } from "react";
import UploadVideo from "./UploadVideo";

const EMOTION_EMOJI: Record<string, string> = {
  anger: "😡",
  disgust: "🤢",
  fear: "😨",
  joy: "😄",
  neutral: "😐",
  sadness: "😢",
  surprise: "😲",
};

const SENTIMENT_EMOJI: Record<string, string> = {
  negative: "😡",
  neutral: "😐",
  positive: "😄",
};

interface InferenceProps {
  quota: {
    secretKey: string;
  };
}

export type Analysis = {
  analysis: {
    utterances: Array<{
      start_time: number;
      end_time: number;
      text: string;
      emotions: Array<{ label: string; confidence: number }>;
      sentiments: Array<{ label: string; confidence: number }>;
    }>;
  };
};

export function Inference({ quota }: InferenceProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  // Debug logging
  console.log('Inference component - current analysis state:', analysis);

  const getAverageScores = () => {
    if (!analysis?.analysis?.utterances?.length) return null;

    // Aggregate all the scores
    const emotionScores: Record<string, number[]> = {};
    const sentimentScores: Record<string, number[]> = {};

    analysis.analysis.utterances.forEach((utterance) => {
      utterance.emotions.forEach((emotion) => {
        emotionScores[emotion.label] ??= [];
        emotionScores[emotion.label]!.push(emotion.confidence);
      });
      utterance.sentiments.forEach((sentiment) => {
        sentimentScores[sentiment.label] ??= [];
        sentimentScores[sentiment.label]!.push(sentiment.confidence);
      });
    });

    // Calculate the average
    const avgEmotions = Object.entries(emotionScores).map(
      ([label, scores]) => ({
        label,
        confidence: scores.reduce((a, b) => a + b, 0) / scores.length,
      }),
    );

    const avgSentiments = Object.entries(sentimentScores).map(
      ([label, scores]) => ({
        label,
        confidence: scores.reduce((a, b) => a + b, 0) / scores.length,
      }),
    );

    // Sort by confidence, get the top score
    const topEmotion = avgEmotions.sort(
      (a, b) => b.confidence - a.confidence,
    )[0];
    const topSentiment = avgSentiments.sort(
      (a, b) => b.confidence - a.confidence,
    )[0];

    return { topEmotion, topSentiment };
  };
  const averages = getAverageScores();
  // Debug the rendering conditions
  console.log('Rendering Inference component:');
  console.log('- analysis exists:', !!analysis);
  console.log('- analysis.analysis exists:', !!analysis?.analysis);
  console.log('- utterances exists:', !!analysis?.analysis?.utterances);
  console.log('- utterances length:', analysis?.analysis?.utterances?.length);
  console.log('- averages:', averages);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upload Section */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        <div className="relative backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl blur opacity-60"></div>
              <div className="relative p-3 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Upload Video
              </h3>
              <p className="text-slate-500 mt-1">Start by uploading your video file</p>
            </div>
          </div>
          <UploadVideo onAnalysis={setAnalysis} apiKey={quota.secretKey} />
        </div>
      </div>

      {/* Overall Analysis Section */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        <div className="relative backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-60"></div>
              <div className="relative p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Overall Analysis
              </h3>
              <p className="text-slate-500 mt-1">Summary of emotional patterns detected</p>
            </div>
          </div>
        
        {/* Debug info */}
        {analysis && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
            <div className="flex items-center gap-3 text-blue-800">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Analysis Complete</p>
                <p className="text-sm text-blue-600">Found {analysis?.analysis?.utterances?.length || 0} speech segments</p>
              </div>
            </div>
          </div>
        )}

        {averages ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Primary Emotion Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-center">
                  <p className="text-sm font-semibold text-orange-600 mb-4 uppercase tracking-wide">Primary Emotion</p>
                  <div className="text-8xl mb-4 animate-pulse">
                    {averages?.topEmotion?.label ? EMOTION_EMOJI[averages.topEmotion.label] : '😐'}
                  </div>
                  <p className="text-2xl font-bold text-slate-900 capitalize mb-3">
                    {averages.topEmotion?.label}
                  </p>
                  <div className="flex items-center justify-center gap-3 text-sm text-slate-600">
                    <div className="bg-white/80 rounded-full px-4 py-2 shadow-sm">
                      <span className="font-mono">{averages.topEmotion?.confidence.toFixed(3)}</span>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full px-4 py-2 shadow-lg font-bold">
                      {averages.topEmotion?.confidence ? (averages.topEmotion.confidence * 100).toFixed(0) : '0'}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Primary Sentiment Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-center">
                  <p className="text-sm font-semibold text-blue-600 mb-4 uppercase tracking-wide">Primary Sentiment</p>
                  <div className="text-8xl mb-4 animate-pulse">
                    {averages?.topSentiment?.label ? SENTIMENT_EMOJI[averages.topSentiment.label] : '😐'}
                  </div>
                  <p className="text-2xl font-bold text-slate-900 capitalize mb-3">
                    {averages.topSentiment?.label}
                  </p>
                  <div className="flex items-center justify-center gap-3 text-sm text-slate-600">
                    <div className="bg-white/80 rounded-full px-4 py-2 shadow-sm">
                      <span className="font-mono">{averages.topSentiment?.confidence.toFixed(3)}</span>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full px-4 py-2 shadow-lg font-bold">
                      {averages.topSentiment?.confidence ? (averages.topSentiment.confidence * 100).toFixed(0) : '0'}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : analysis ? (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-200/50">
            <div className="text-sm font-medium text-yellow-800 mb-3">Raw Analysis Data (Debug):</div>
            <div className="text-xs text-yellow-700 space-y-3 max-h-64 overflow-y-auto">
              <p className="font-semibold">Utterances: {analysis?.analysis?.utterances?.length || 0}</p>
              {analysis?.analysis?.utterances?.slice(0, 3).map((utterance, i) => (
                <div key={i} className="bg-yellow-100 p-3 rounded-lg">
                  <p className="font-semibold text-yellow-800">{utterance.start_time}s-{utterance.end_time}s:</p>
                  <p className="text-yellow-700 mb-2">{utterance.text}</p>
                  <p className="text-xs text-yellow-600">
                    <strong>Emotions:</strong> {utterance.emotions?.map(e => `${e.label}:${e.confidence.toFixed(2)}`).join(', ')}
                  </p>
                  <p className="text-xs text-yellow-600">
                    <strong>Sentiments:</strong> {utterance.sentiments?.map(s => `${s.label}:${s.confidence.toFixed(2)}`).join(', ')}
                  </p>
                </div>
              ))}
              {(analysis?.analysis?.utterances?.length || 0) > 3 && (
                <p className="text-yellow-600 font-medium">... and {(analysis?.analysis?.utterances?.length || 0) - 3} more utterances</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 14a1 1 0 001 1h12a1 1 0 001-1L17 4M10 11v6M14 11v6" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-slate-700 mb-2">No Analysis Yet</h4>
            <p className="text-slate-500 text-sm max-w-md">
              Upload a video above to see comprehensive sentiment analysis and emotional insights
            </p>
          </div>
        )}
      </div>
    </div>

      {/* Detailed Analysis Section */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        <div className="relative backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-60"></div>
              <div className="relative p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Timeline Analysis
              </h3>
              <p className="text-slate-500 mt-1">Detailed breakdown of emotional changes over time</p>
            </div>
          </div>
        
        {analysis?.analysis?.utterances ? (
          <div className="space-y-6">
            {analysis.analysis.utterances.map((utterance, index) => (
              <div
                key={`${utterance.start_time}-${utterance.end_time}`}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-slate-50/80 to-white/80 rounded-2xl p-6 border border-slate-200/60 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-xs font-bold">
                          {Number(utterance.start_time).toFixed(1)}s - {Number(utterance.end_time).toFixed(1)}s
                        </span>
                        <span className="text-xs text-slate-500">
                          {((utterance.end_time - utterance.start_time) * 1000).toFixed(0)}ms duration
                        </span>
                      </div>
                      <blockquote className="text-slate-700 leading-relaxed bg-white/60 rounded-xl p-4 border-l-4 border-indigo-400">
                        &ldquo;{utterance.text}&rdquo;
                      </blockquote>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Emotions */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="text-2xl">🎭</span> 
                        <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                          Emotions
                        </span>
                      </h4>
                      <div className="space-y-3">
                        {utterance.emotions?.map((emotion, _i) => (
                          <div key={emotion.label} className="flex items-center gap-4">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-2xl">{EMOTION_EMOJI[emotion.label]}</span>
                              <span className="text-sm text-slate-700 capitalize font-medium">
                                {emotion.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${emotion.confidence * 100}%` }}
                                  className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500"
                                />
                              </div>
                              <span className="text-sm font-bold text-slate-700 w-10 text-right">
                                {(emotion.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sentiments */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="text-2xl">💭</span> 
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          Sentiments
                        </span>
                      </h4>
                      <div className="space-y-3">
                        {utterance.sentiments?.map((sentiment, _i) => (
                          <div key={sentiment.label} className="flex items-center gap-4">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-2xl">{SENTIMENT_EMOJI[sentiment.label]}</span>
                              <span className="text-sm text-slate-700 capitalize font-medium">
                                {sentiment.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${sentiment.confidence * 100}%` }}
                                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
                                />
                              </div>
                              <span className="text-sm font-bold text-slate-700 w-10 text-right">
                                {(sentiment.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-slate-700 mb-2">No Timeline Data</h4>
            <p className="text-slate-500 text-sm max-w-md">
              Upload a video to see detailed timeline analysis with emotional patterns throughout the content
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}