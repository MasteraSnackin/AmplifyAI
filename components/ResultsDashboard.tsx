
import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Copy, Instagram, Linkedin, Twitter, Share2, BarChart3, Play, Clock, RotateCcw, Download, FileText, Pencil, AlertTriangle, X, Plus, Camera, FileDown, Mic2, Smile, Frown, Meh, Zap, Volume2, StopCircle, Target, TrendingUp, Sparkles, Brain, Clapperboard, Repeat, ArrowLeftCircle, Subtitles } from 'lucide-react';
import { AnalysisResult, QuizQuestion, AppState, SupportedLanguage, AdScript } from '../types';

interface ResultsDashboardProps {
  data: AnalysisResult;
  videoSource: File | string | null;
  onNavigate: (state: AppState) => void;
}

const LANGUAGE_CODES: Record<SupportedLanguage | string, string> = {
  'English': 'en-US',
  'Spanish': 'es-ES',
  'French': 'fr-FR',
  'German': 'de-DE',
  'Portuguese': 'pt-BR',
  'Japanese': 'ja-JP',
  'Chinese': 'zh-CN',
  'Italian': 'it-IT',
  'Russian': 'ru-RU',
  'Arabic': 'ar-SA',
  'Hindi': 'hi-IN',
  'Korean': 'ko-KR'
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ data, videoSource, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'social' | 'ads'>('quiz');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('twitter');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // State for editable content
  const [editablePosts, setEditablePosts] = useState(data.socialPosts);
  const [hashtagInput, setHashtagInput] = useState('');
  const [copiedState, setCopiedState] = useState(false);
  const [copiedScript, setCopiedScript] = useState<number | null>(null);

  // Narrator Studio Config State
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [narratorRate, setNarratorRate] = useState<number>(0.95); // 0.95 sounds very deliberate, warm and human-like
  const [narratorPitch, setNarratorPitch] = useState<number>(1.0);
  const [activeSpeechType, setActiveSpeechType] = useState<'none' | 'test' | 'quiz' | 'ad'>('none');
  const [speechActiveId, setSpeechActiveId] = useState<number | null>(null);
  
  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showCaptions, setShowCaptions] = useState(true);

  // YouTube State
  const isYoutube = typeof videoSource === 'string';
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (videoSource) {
      if (typeof videoSource === 'string') {
        const match = videoSource.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        const id = match ? match[1] : null;
        
        setYoutubeId(id);
        if (id) setYoutubeEmbedUrl(`https://www.youtube.com/embed/${id}?autoplay=0&enablejsapi=1`);
        setDuration(600); 
      } else {
        const url = URL.createObjectURL(videoSource);
        setVideoUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    }
  }, [videoSource]);

  // Synchronize Voices with browser's speechSynthesis engine
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);

      // Extract current ISO prefix from language map
      const currentLangCode = LANGUAGE_CODES[data.language || 'English'] || 'en-US';
      const langPrefix = currentLangCode.substring(0, 2).toLowerCase();
      
      const subList = allVoices.filter(v => {
        const vLang = v.lang.toLowerCase().replace('_', '-');
        return vLang.startsWith(langPrefix) || vLang.split('-')[0] === langPrefix;
      });

      // Filter and sort premium/natural voices to stay on top
      const sorted = [...subList].sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        const isPremiumA = nameA.includes('natural') || nameA.includes('neural') || nameA.includes('google') || nameA.includes('siri') || nameA.includes('premium') || nameA.includes('guy') || nameA.includes('jenny');
        const isPremiumB = nameB.includes('natural') || nameB.includes('neural') || nameB.includes('google') || nameB.includes('siri') || nameB.includes('premium') || nameB.includes('guy') || nameB.includes('jenny');
        if (isPremiumA && !isPremiumB) return -1;
        if (!isPremiumA && isPremiumB) return 1;
        return 0;
      });

      if (sorted.length > 0) {
        setSelectedVoiceName(sorted[0].name);
      } else if (allVoices.length > 0) {
        setSelectedVoiceName(allVoices[0].name);
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [data.language]);

  // Handle narration triggers safely
  const startNarratorSpeak = (text: string, type: 'test' | 'quiz' | 'ad', id: number | null) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    if (activeSpeechType === type && speechActiveId === id) {
      setActiveSpeechType('none');
      setSpeechActiveId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voiceObj = voices.find(v => v.name === selectedVoiceName);
    
    if (voiceObj) {
      utterance.voice = voiceObj;
    } else {
      utterance.lang = LANGUAGE_CODES[data.language || 'English'] || 'en-US';
    }

    // Use our customized human speed pacing and pitch controls
    utterance.rate = narratorRate;
    utterance.pitch = narratorPitch;

    utterance.onend = () => {
      setActiveSpeechType('none');
      setSpeechActiveId(null);
    };
    utterance.onerror = () => {
      setActiveSpeechType('none');
      setSpeechActiveId(null);
    };

    setActiveSpeechType(type);
    setSpeechActiveId(id);
    window.speechSynthesis.speak(utterance);
  };

  const stopNarratorSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setActiveSpeechType('none');
    setSpeechActiveId(null);
  };

  const onTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (time: number) => {
    if (isYoutube && youtubeId) {
      setYoutubeEmbedUrl(`https://www.youtube.com/embed/${youtubeId}?start=${time}&autoplay=1`);
      setCurrentTime(time);
    } else if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const handleCaptureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `frame-${Math.floor(video.currentTime)}.png`;
        link.href = imageUrl;
        link.click();
      }
    }
  };
  
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.min(Math.max(0, x / rect.width), 1);
    const time = percent * duration;
    
    handleSeek(Math.floor(time));
  };

  const handlePostEdit = (newContent: string, isAlternate: boolean) => {
    setEditablePosts(prev => prev.map(p => {
      if (p.platform === selectedPlatform) {
         if (!isAlternate) return { ...p, content: newContent };
         return { ...p, alternateOption: newContent };
      }
      return p;
    }));
  };

  const handleAddHashtag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const tag = hashtagInput.trim();
      if (tag && !tag.includes(' ')) {
        const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
        setEditablePosts(prev => prev.map(p => 
          p.platform === selectedPlatform && !p.hashtags.includes(formattedTag)
            ? { ...p, hashtags: [...p.hashtags, formattedTag] } 
            : p
        ));
        setHashtagInput('');
      }
    }
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setEditablePosts(prev => prev.map(p => 
      p.platform === selectedPlatform 
        ? { ...p, hashtags: p.hashtags.filter(t => t !== tagToRemove) } 
        : p
    ));
  };

  const handleSharePost = async (content: string) => {
    const post = editablePosts.find(p => p.platform === selectedPlatform);
    if (post) {
      const fullContent = `${content}\n\n${post.hashtags.join(' ')}`;
      try {
        await navigator.clipboard.writeText(fullContent);
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  const copyScript = async (script: AdScript, idx: number) => {
    const text = `
FORMAT: ${script.format}
PLATFORM: ${script.targetPlatform}

HOOK (0-3s):
${script.hook}

BODY:
${script.body}

VISUAL CUES:
${script.visualCues}

CTA:
${script.callToAction}
    `;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedScript(idx);
      setTimeout(() => setCopiedScript(null), 2000);
    } catch (err) { console.error(err); }
  };

  const downloadReport = () => {
    const report = `
AMPLIFY AI STRATEGY REPORT
Target Audience: ${data.strategyUsed?.targetAudience || 'General'}
Campaign Goal: ${data.strategyUsed?.campaignGoal || 'Engagement'}
==================================================

EXECUTIVE SUMMARY
${data.summary}

VIRAL MOMENTS & QUIZZES
=======================
${data.quizzes.map((q, i) => `
Q${i + 1}: ${q.question}
[${formatTime(q.timestamp)}] Viral Score: ${q.viralScore || 'N/A'}/100
Reasoning: ${q.reasoning || 'N/A'}
Sentiment: ${q.sentiment || 'N/A'}
Speaker: ${q.speaker || 'N/A'}
A) ${q.options[0]}
B) ${q.options[1]}
C) ${q.options[2]}
D) ${q.options[3]}
Correct: ${q.options[q.correctAnswerIndex]}
Reason: ${q.explanation}
`).join('')}

SOCIAL MEDIA CAMPAIGN DRAFTS
============================
${editablePosts.map(p => `
[${p.platform.toUpperCase()}]
Variant A: ${p.content}
Variant B: ${p.alternateOption || 'N/A'}
Tags: ${p.hashtags.join(', ')}
`).join('\n')}

VIDEO AD SCRIPTS
================
${data.adScripts?.map(s => `
[${s.format} - ${s.targetPlatform}]
HOOK: ${s.hook}
BODY: ${s.body}
VISUAL: ${s.visualCues}
CTA: ${s.callToAction}
`).join('\n') || 'No scripts generated.'}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'amplify-ai-report.txt';
    a.click();
  };

  const downloadCanvaCSV = () => {
    let csv = 'Question,Option 1,Option 2,Option 3,Option 4,Correct Answer,Explanation,Viral Score\n';
    
    data.quizzes.forEach(q => {
      const row = [
        q.question,
        q.options[0],
        q.options[1],
        q.options[2],
        q.options[3],
        q.options[q.correctAnswerIndex],
        q.explanation,
        q.viralScore || 0
      ].map(field => `"${String(field).replace(/"/g, '""')}"`);
      
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "amplify_ai_canva_bulk.csv";
    link.click();
  };

  // Helper to find active overlay
  const getCurrentOverlay = () => {
    if (!showCaptions || !data.quizzes) return null;
    // Find a quiz that matches current time (within 10 seconds)
    const activeQuiz = data.quizzes.find(q => 
       Math.abs(currentTime - q.timestamp) < 5
    );
    return activeQuiz?.question || activeQuiz?.reasoning || null;
  };

  const currentOverlayText = getCurrentOverlay();

  const PlatformIcon = ({ platform, className }: { platform: string, className?: string }) => {
    switch (platform) {
      case 'twitter': return <Twitter className={className} />;
      case 'instagram': return <Instagram className={className} />;
      case 'linkedin': return <Linkedin className={className} />;
      default: return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'bg-sky-500';
      case 'instagram': return 'bg-pink-600';
      case 'linkedin': return 'bg-blue-700';
      default: return 'bg-slate-500';
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch(sentiment) {
      case 'positive': return 'border-emerald-500 bg-emerald-500';
      case 'negative': return 'border-red-500 bg-red-500';
      case 'exciting': return 'border-amber-500 bg-amber-500';
      case 'neutral': 
      default: return 'border-indigo-600 bg-indigo-600';
    }
  };
  
  const getCharCountColor = (count: number, limit: number) => {
    if (count > limit) return 'text-red-600 font-bold';
    if (count > limit * 0.9) return 'text-amber-600 font-medium';
    return 'text-slate-400';
  };

  const currentPost = editablePosts.find(p => p.platform === selectedPlatform);
  
  return (
    <div className="max-w-6xl mx-auto mt-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analysis Results</h1>
          <p className="text-slate-500 text-sm">Review generated quizzes and social content</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
             onClick={() => {
                localStorage.removeItem('amplifyAiResult'); // Ensure key matches App.tsx
                window.location.reload();
             }}
             className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium text-sm transition-colors shadow-sm"
          >
            <ArrowLeftCircle className="w-4 h-4" />
            New Analysis
          </button>
          <button 
            onClick={downloadCanvaCSV}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            Export for Canva
          </button>
          <button 
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Video & Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-black rounded-xl overflow-hidden shadow-lg border border-slate-900 relative group">
            <div className="aspect-video relative bg-black">
              {isYoutube && youtubeEmbedUrl ? (
                <iframe 
                  src={youtubeEmbedUrl} 
                  title="YouTube video player" 
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : videoUrl ? (
                <video 
                  key={videoUrl}
                  ref={videoRef}
                  src={videoUrl} 
                  controls 
                  playsInline
                  crossOrigin="anonymous"
                  className="w-full h-full object-contain"
                  onTimeUpdate={onTimeUpdate}
                  onLoadedMetadata={onLoadedMetadata}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  Video Preview Unavailable
                </div>
              )}
              
              {/* Smart Subtitle Overlay */}
              {currentOverlayText && (
                  <div className="absolute bottom-16 left-0 right-0 px-8 text-center pointer-events-none z-20">
                    <div className="inline-block bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-xl border border-white/10">
                       <span className="text-yellow-400 font-bold mr-2">VIRAL HOOK:</span> 
                       {currentOverlayText}
                    </div>
                  </div>
              )}
            </div>
            
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setShowCaptions(!showCaptions)}
                  className={`p-2 rounded-lg backdrop-blur-sm text-white ${showCaptions ? 'bg-indigo-600/80' : 'bg-black/50 hover:bg-black/70'}`}
                  title="Toggle Smart Captions"
                >
                  <Subtitles className="w-5 h-5" />
                </button>
                {!isYoutube && (
                  <button 
                    onClick={handleCaptureFrame}
                    className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm"
                    title="Capture Frame"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                )}
            </div>
            <canvas ref={canvasRef} className="hidden" />

            <div className="bg-slate-900 px-4 pb-4 pt-2">
              <div 
                className="relative h-1.5 bg-slate-700 rounded-full cursor-pointer group"
                onClick={handleTimelineClick}
              >
                {!isYoutube && (
                  <div 
                    className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full pointer-events-none"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                )}
                
                {data.quizzes.map((q, i) => (
                  <div 
                    key={q.id}
                    className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 border-2 rounded-full hover:scale-150 transition-transform cursor-pointer z-10 ${getSentimentColor(q.sentiment)}`}
                    style={{ left: `${duration > 0 ? (q.timestamp / duration) * 100 : 0}%` }}
                    title={`Q${i+1}: ${q.sentiment || 'Quiz'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSeek(q.timestamp);
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
                 <div className="flex gap-3">
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Positive</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Exciting</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-600"></div> Neutral</span>
                 </div>
                 <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             
             {/* Strategy Context Badge */}
             {data.strategyUsed && (
               <div className="mb-4 bg-gradient-to-r from-slate-50 to-indigo-50 border border-indigo-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Strategic Context</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-600">Target: <b>{data.strategyUsed.targetAudience}</b></span>
                    <span className="text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-600">Goal: <b>{data.strategyUsed.campaignGoal}</b></span>
                  </div>
               </div>
             )}

             <div className="flex items-center gap-2 mb-3">
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Analysis Complete
              </span>
              <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Gemini 3.5</span>
              {data.language && (
                 <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 text-xs font-bold px-2 py-1 rounded-full">
                    {data.language}
                 </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">AI Summary</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{data.summary}</p>
            
            {isYoutube && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800 leading-snug">
                  <strong>Demo Mode:</strong> You are viewing a simulated analysis for this YouTube video. For deep pixel-level analysis, please upload the raw video file.
                </p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100">
              <button 
                onClick={() => onNavigate(AppState.ANALYTICS)}
                className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-medium transition-colors text-sm border border-slate-200"
              >
                <BarChart3 className="w-4 h-4" />
                View Campaign Analytics
              </button>
            </div>
          </div>

          {/* Narrator Voice Customizer */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Mic2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Narrator Voice Customizer</h3>
                <p className="text-[10px] text-slate-400 font-medium">Configure human-sounding brand narrator profiles</p>
              </div>
            </div>

            {voices.length === 0 ? (
              <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100/50 text-[11px] text-slate-500 leading-snug">
                Your browser speech engine is active. Standard voice will be used for playbacks.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Voice Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex justify-between">
                    <span>Active Voice Avatar</span>
                    {selectedVoiceName && voices.find(v => v.name === selectedVoiceName)?.name.toLowerCase().includes('google') && (
                      <span className="text-[9px] bg-green-50 text-green-600 px-1.5 py-0.2 rounded border border-green-100 font-bold tracking-tight">Premium Neural</span>
                    )}
                  </label>
                  <select
                    value={selectedVoiceName}
                    onChange={(e) => {
                      setSelectedVoiceName(e.target.value);
                      stopNarratorSpeak();
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 font-medium outline-none focus:border-indigo-500"
                  >
                    {/* Prioritize filtered voices first */}
                    {(() => {
                      const currentLangCode = LANGUAGE_CODES[data.language || 'English'] || 'en-US';
                      const langPrefix = currentLangCode.substring(0, 2).toLowerCase();
                      const filtered = voices.filter(v => {
                        const vLang = v.lang.toLowerCase().replace('_', '-');
                        return vLang.startsWith(langPrefix) || vLang.split('-')[0] === langPrefix;
                      });
                      
                      const others = voices.filter(v => !filtered.includes(v));
                      
                      return (
                        <>
                          <optgroup label={`${data.language || 'English'} Matching Human Voices`}>
                            {filtered.length > 0 ? (
                              filtered.map(v => (
                                <option key={v.name} value={v.name}>
                                  {v.name} ({v.lang}) {v.name.toLowerCase().match(/natural|neural|google|siri|premium|guy|jenny/i) ? '★' : ''}
                                </option>
                              ))
                            ) : (
                              <option disabled>No local matching voices found (using fallback)</option>
                            )}
                          </optgroup>
                          {others.length > 0 && (
                            <optgroup label="Other System Voices">
                              {others.map(v => (
                                <option key={v.name} value={v.name}>
                                  {v.name} ({v.lang})
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </>
                      );
                    })()}
                  </select>
                </div>

                {/* Speed Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span className="uppercase">Speech Speed</span>
                    <span className="text-indigo-600 font-mono text-xs">{narratorRate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.25"
                    step="0.05"
                    value={narratorRate}
                    onChange={(e) => {
                      setNarratorRate(parseFloat(e.target.value));
                      stopNarratorSpeak();
                    }}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                  />
                  <div className="flex justify-between text-[8px] text-slate-400 font-semibold px-0.5">
                    <span>Deliberate & Human</span>
                    <span>Standard</span>
                    <span>Fast-paced</span>
                  </div>
                </div>

                {/* Pitch Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span className="uppercase">Voice Pitch</span>
                    <span className="text-indigo-600 font-mono text-xs">{narratorPitch}</span>
                  </div>
                  <input
                    type="range"
                    min="0.85"
                    max="1.15"
                    step="0.05"
                    value={narratorPitch}
                    onChange={(e) => {
                      setNarratorPitch(parseFloat(e.target.value));
                      stopNarratorSpeak();
                    }}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                  />
                </div>

                {/* Test Speaking Preview */}
                <div className="pt-1">
                  <button
                    onClick={() => {
                      const sampleText = data.language === 'Spanish' 
                        ? 'Hola. Soy tu avatar de voz artificial. Tu campaña publicitaria se encuentra completamente lista para su lanzamiento.' 
                        : data.language === 'French'
                        ? 'Bonjour. Je suis le narrateur de votre marque. Votre campagne est prête.'
                        : 'Hello! I am your brand narration avatar. Let us listen to your ad scripts or review your quizzes.';
                      startNarratorSpeak(sampleText, 'test', 9999);
                    }}
                    className={`w-full flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg border font-semibold text-xs transition-all shadow-sm ${
                      activeSpeechType === 'test'
                        ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-100/50'
                    }`}
                  >
                    {activeSpeechType === 'test' ? (
                      <>
                        <StopCircle className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                        Stop Narration Test
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        Test Speech Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Content Tabs */}
        <div className="lg:col-span-7">
          <div className="flex gap-6 mb-6 border-b border-slate-200 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('quiz')}
              className={`pb-3 px-1 text-sm font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'quiz' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Interactive Quizzes
              {activeTab === 'quiz' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
            </button>
            <button 
              onClick={() => setActiveTab('social')}
              className={`pb-3 px-1 text-sm font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'social' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Social Variations (A/B)
              {activeTab === 'social' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
            </button>
            <button 
              onClick={() => setActiveTab('ads')}
              className={`pb-3 px-1 text-sm font-semibold transition-colors relative whitespace-nowrap flex items-center gap-1 ${activeTab === 'ads' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Clapperboard className="w-3.5 h-3.5" />
              Ad Scripts
              {activeTab === 'ads' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
            </button>
          </div>

          <div className="h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {activeTab === 'quiz' && (
              <div className="space-y-4">
                {data.quizzes.map((quiz, idx) => (
                  <PlayableQuizCard 
                    key={idx} 
                    quiz={quiz} 
                    index={idx} 
                    onSeek={handleSeek} 
                    maxDuration={duration}
                    isSpeaking={activeSpeechType === 'quiz' && speechActiveId === idx}
                    onToggleSpeak={(e) => {
                      e.stopPropagation();
                      const optLabel = data.language === 'Spanish' ? 'Opción' : data.language === 'French' ? 'Option' : 'Option';
                      const textToSpeak = `${quiz.question}. ${quiz.options.map((opt, i) => `${optLabel} ${i+1}: ${opt}`).join('. ')}`;
                      startNarratorSpeak(textToSpeak, 'quiz', idx);
                    }}
                  />
                ))}
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {editablePosts.map((post) => (
                    <button
                      key={post.platform}
                      onClick={() => setSelectedPlatform(post.platform)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        selectedPlatform === post.platform 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                          : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-600'
                      }`}
                    >
                      <PlatformIcon platform={post.platform} className="w-5 h-5 mb-2" />
                      <span className="text-xs font-semibold capitalize">{post.platform}</span>
                    </button>
                  ))}
                </div>

                {currentPost && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${getPlatformColor(currentPost.platform)}`}></div>
                         <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Editor</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Pencil className="w-3 h-3" /> Comparison Mode
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                        <div className="space-y-1">
                          <div className="h-4 w-24 bg-slate-200 rounded" />
                          <div className="h-3 w-16 bg-slate-100 rounded" />
                        </div>
                      </div>
                      
                      {/* Side-by-Side Editor */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                              Variant A (Primary)
                              {selectedPlatform === 'twitter' && (
                                <span className={`text-[10px] ${getCharCountColor(currentPost.content.length, 280)}`}>
                                  {currentPost.content.length}/280
                                </span>
                              )}
                            </span>
                            <button 
                                onClick={() => handleSharePost(currentPost.content)}
                                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                                <Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                          <textarea
                            value={currentPost.content}
                            onChange={(e) => handlePostEdit(e.target.value, false)}
                            className="w-full h-40 p-3 rounded-lg border border-slate-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800 text-sm leading-relaxed resize-none outline-none bg-slate-50 focus:bg-white"
                            placeholder="Primary content..."
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                              Variant B (Alternate)
                              {selectedPlatform === 'twitter' && (
                                <span className={`text-[10px] ${getCharCountColor((currentPost.alternateOption || '').length, 280)}`}>
                                  {(currentPost.alternateOption || '').length}/280
                                </span>
                              )}
                            </span>
                            <button 
                                onClick={() => handleSharePost(currentPost.alternateOption || '')}
                                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                                <Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                          <textarea
                            value={currentPost.alternateOption || ''}
                            onChange={(e) => handlePostEdit(e.target.value, true)}
                            className="w-full h-40 p-3 rounded-lg border border-slate-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800 text-sm leading-relaxed resize-none outline-none bg-slate-50 focus:bg-white"
                            placeholder="Alternate hook..."
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6 mt-4 items-center">
                        {currentPost.hashtags.map(tag => (
                          <span key={tag} className="flex items-center gap-1 text-indigo-600 text-xs font-medium bg-indigo-50 px-2 py-1 rounded group border border-indigo-100">
                            {tag}
                            <button 
                              onClick={() => handleRemoveHashtag(tag)}
                              className="w-3 h-3 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-300"
                            >
                              <X className="w-2 h-2" />
                            </button>
                          </span>
                        ))}
                         <div className="flex items-center gap-1 px-2 py-1 rounded border border-slate-200 bg-white focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
                            <Plus className="w-3 h-3 text-slate-400" />
                            <input 
                              type="text" 
                              value={hashtagInput}
                              onChange={(e) => setHashtagInput(e.target.value)}
                              onKeyDown={handleAddHashtag}
                              placeholder="Add tag..."
                              className="text-xs w-16 outline-none bg-transparent placeholder-slate-400 text-slate-700"
                            />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'ads' && (
              <div className="space-y-6">
                {(!data.adScripts || data.adScripts.length === 0) ? (
                  <div className="text-center p-8 text-slate-500">
                    <Clapperboard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No ad scripts generated. Try running analysis again with the latest AI model.</p>
                  </div>
                ) : (
                  data.adScripts.map((script, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/10 rounded-lg">
                            <Clapperboard className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm">{script.targetPlatform}</h3>
                            <p className="text-xs text-slate-300">{script.format}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const narratorHeader = data.language === 'Spanish' 
                                ? `Anuncio para ${script.targetPlatform}. Duración estimada: ${script.format}.` 
                                : `Narrating video script for ${script.targetPlatform}. Format scale: ${script.format}.`;
                              
                              const mainContent = `
                                Hook: ${script.hook}. 
                                Body: ${script.body}. 
                                Call to action: ${script.callToAction}.
                              `;
                              startNarratorSpeak(`${narratorHeader} ${mainContent}`, 'ad', idx);
                            }}
                            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                              activeSpeechType === 'ad' && speechActiveId === idx 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                            title={activeSpeechType === 'ad' && speechActiveId === idx ? "Stop narration playback" : "Listen to brand voice narration"}
                          >
                            {activeSpeechType === 'ad' && speechActiveId === idx ? (
                              <StopCircle className="w-4 h-4 text-white animate-pulse" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>

                          <button 
                            onClick={() => copyScript(script, idx)}
                            className={`p-2 rounded-lg transition-colors ${copiedScript === idx ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                          >
                            {copiedScript === idx ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-5 space-y-4">
                        {activeSpeechType === 'ad' && speechActiveId === idx && (
                          <div className="flex items-center justify-between px-3 py-2 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs text-indigo-700 animate-in fade-in duration-300">
                            <span className="font-bold flex items-center gap-1.5">
                              <Mic2 className="w-4 h-4 text-indigo-600 animate-pulse" />
                              Bio-Avatar Narrator Speaking ({narratorRate}x)...
                            </span>
                            <div className="flex gap-0.5 items-center h-4">
                              <div className="w-0.5 bg-indigo-500 h-2.5 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                              <div className="w-0.5 bg-indigo-500 h-4 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                              <div className="w-0.5 bg-indigo-500 h-2 rounded-full animate-bounce [animation-delay:0.5s]"></div>
                              <div className="w-0.5 bg-indigo-500 h-3.5 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hook (0-3s)</label>
                          <p className="text-sm font-semibold text-slate-900 bg-yellow-50 p-2 rounded border border-yellow-100">{script.hook}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Script Body</label>
                          <p className="text-sm text-slate-700 leading-relaxed p-2 bg-slate-50 rounded border border-slate-100">{script.body}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visual Cues</label>
                            <p className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded border border-slate-100 h-full">{script.visualCues}</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Call To Action</label>
                            <p className="text-sm font-medium text-indigo-700 p-2 bg-indigo-50 rounded border border-indigo-100 h-full flex items-center">{script.callToAction}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

const PlayableQuizCard: React.FC<{ 
  quiz: QuizQuestion; 
  index: number; 
  onSeek: (time: number) => void; 
  maxDuration: number; 
  isSpeaking: boolean;
  onToggleSpeak: (e: React.MouseEvent) => void;
}> = ({ quiz, index, onSeek, maxDuration, isSpeaking, onToggleSpeak }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    
    // Auto seek if correct
    if (idx === quiz.correctAnswerIndex) {
      setTimeout(() => safeSeek(), 800);
    }
  };
  
  function safeSeek() {
    let target = quiz.timestamp;
    if (maxDuration > 0 && target > maxDuration) {
      target = maxDuration;
    }
    onSeek(target);
  }

  function handleRetry(e: React.MouseEvent) {
    e.stopPropagation();
    setSelected(null);
    setShowResult(false);
  }
  
  const getSentimentIcon = () => {
     switch(quiz.sentiment) {
       case 'positive': return <Smile className="w-3 h-3 text-emerald-500" />;
       case 'negative': return <Frown className="w-3 h-3 text-red-500" />;
       case 'exciting': return <Zap className="w-3 h-3 text-amber-500" />;
       default: return <Meh className="w-3 h-3 text-slate-400" />;
     }
  };

  const getViralColor = (score: number) => {
     if (score >= 90) return "text-purple-700 bg-purple-50 border-purple-200";
     if (score >= 70) return "text-emerald-700 bg-emerald-50 border-emerald-200";
     return "text-slate-600 bg-slate-50 border-slate-200";
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide border border-indigo-100">
            Question {index + 1}
            </span>
            {quiz.sentiment && (
               <div className="flex items-center gap-1 text-[10px] bg-slate-50 px-2 py-1 rounded-full border border-slate-100" title={`Sentiment: ${quiz.sentiment}`}>
                 {getSentimentIcon()}
               </div>
            )}
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={onToggleSpeak}
             className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full transition-colors border ${isSpeaking ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : 'text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border-slate-100'}`}
             title={isSpeaking ? "Stop Reading" : "Read Aloud"}
           >
             {isSpeaking ? <StopCircle className="w-3 h-3 text-white animate-pulse" /> : <Volume2 className="w-3 h-3" />}
             {isSpeaking ? 'Stop' : 'Read'}
           </button>

          <button 
            onClick={(e) => { e.stopPropagation(); safeSeek(); }}
            className="flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-2 py-1 rounded-full transition-colors border border-slate-100"
          >
            <Clock className="w-3 h-3" />
            {formatTime(quiz.timestamp)}
          </button>
        </div>
      </div>
      
      {/* Viral Score & Speaker */}
      <div className="flex items-center justify-between mb-3">
         {quiz.viralScore && (
            <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-bold ${getViralColor(quiz.viralScore)}`} title="Viral Engagement Potential">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Viral Score: {quiz.viralScore}</span>
            </div>
         )}
         {quiz.speaker && (
           <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
             <Mic2 className="w-3 h-3" />
             {quiz.speaker}
           </div>
         )}
      </div>

      {/* AI Reasoning - The "Why" this matters */}
      {quiz.reasoning && (
        <div className="mb-4 p-2.5 bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-lg text-xs text-slate-600 italic flex justify-between items-center shadow-sm">
           <div className="flex gap-2 items-start">
             <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
             <span className="leading-snug">"{quiz.reasoning}"</span>
           </div>
           {isSpeaking && (
              <div className="flex gap-0.5 items-center h-3 flex-shrink-0 ml-2">
                <div className="w-0.5 bg-indigo-500 h-1.5 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                <div className="w-0.5 bg-indigo-500 h-3 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                <div className="w-0.5 bg-indigo-500 h-0.5 rounded-full animate-bounce [animation-delay:0.5s]"></div>
              </div>
           )}
        </div>
      )}

      <h3 className="font-semibold text-slate-900 mb-4 text-base">{quiz.question}</h3>
      
      <div className="space-y-2">
        {quiz.options.map((opt, i) => {
          let stateStyles = 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100';
          if (showResult) {
            if (i === quiz.correctAnswerIndex) {
              stateStyles = 'border-emerald-200 bg-emerald-50 text-emerald-800 font-medium';
            } else if (i === selected) {
              stateStyles = 'border-red-200 bg-red-50 text-red-800';
            } else {
              stateStyles = 'border-slate-100 bg-slate-50 text-slate-400 opacity-50';
            }
          }

          return (
            <button 
              key={i} 
              onClick={() => handleSelect(i)}
              disabled={showResult}
              className={`w-full text-left p-3 rounded-lg border text-sm transition-all duration-200 flex justify-between items-center ${stateStyles}`}
            >
              <span>{opt}</span>
              {showResult && i === quiz.correctAnswerIndex && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </button>
          );
        })}
      </div>

      <div className={`grid transition-all duration-500 ease-in-out ${showResult ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
        <div className="overflow-hidden">
          <div className="bg-slate-50 rounded-lg p-3 text-sm border border-slate-100">
             <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Insight
                </span>
                <button onClick={handleRetry} className="text-slate-400 hover:text-slate-600" title="Reset Question">
                  <RotateCcw className="w-3 h-3" />
                </button>
             </div>
             <p className="text-slate-600 mb-2 leading-relaxed">{quiz.explanation}</p>
             <button 
               onClick={safeSeek}
               className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium mt-2"
             >
               <Play className="w-3 h-3 fill-current" /> Jump to evidence ({formatTime(Math.min(quiz.timestamp, maxDuration > 0 ? maxDuration : quiz.timestamp))})
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatTime = (seconds: number) => {
  if (!seconds && seconds !== 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
