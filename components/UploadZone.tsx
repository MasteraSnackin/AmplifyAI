
import React, { useRef, useState } from 'react';
import { Upload, AlertCircle, Hash, Youtube, Link as LinkIcon, Globe, Target, Megaphone, Sparkles, FileText, PlayCircle } from 'lucide-react';
import { MarketingStrategy, SupportedLanguage } from '../types';

interface UploadZoneProps {
  onFileSelect: (file: File, questionCount: number, language: SupportedLanguage, strategy: MarketingStrategy, transcript?: string) => void;
  onUrlSelect: (url: string, questionCount: number, language: SupportedLanguage, strategy: MarketingStrategy, transcript?: string) => void;
  onDemoSelect: () => void;
  isProcessing: boolean;
}

const LANGUAGES: SupportedLanguage[] = [
  'English', 'Spanish', 'French', 'German', 'Portuguese', 'Japanese', 'Chinese', 'Italian', 'Russian', 'Arabic', 'Hindi', 'Korean'
];

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, onUrlSelect, onDemoSelect, isProcessing }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [language, setLanguage] = useState<SupportedLanguage>('English');
  
  // Strategy
  const [targetAudience, setTargetAudience] = useState('General Public');
  const [campaignGoal, setCampaignGoal] = useState('Maximize Engagement');
  const [brandTone, setBrandTone] = useState('Professional');
  const [isKXSBActive, setIsKXSBActive] = useState(false);
  
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [transcript, setTranscript] = useState('');

  const applyKXSBPreset = () => {
    setTargetAudience("Tech Savvy Investors & Gen Z");
    setCampaignGoal("Showcase Innovation & AI Leadership");
    setBrandTone("Bold, Futuristic, and Authentic");
    setQuestionCount(5);
    setIsKXSBActive(true);
  };

  const getStrategy = (): MarketingStrategy => ({
    targetAudience,
    campaignGoal,
    brandTone
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndPassFile = (file: File) => {
    setError(null);
    if (file.size > 500 * 1024 * 1024) {
      setError("File is too large for this demo (Max 500MB).");
      return;
    }
    if (!file.type.startsWith('video/')) {
      setError("Please upload a valid video file.");
      return;
    }
    onFileSelect(file, questionCount, language, getStrategy(), transcript);
  };

  const validateAndPassUrl = () => {
    setError(null);
    const trimmedUrl = youtubeUrl.trim();
    const match = trimmedUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    
    if (!match) {
      setError("Please enter a valid YouTube URL (Videos, Shorts, or Live).");
      return;
    }
    onUrlSelect(trimmedUrl, questionCount, language, getStrategy(), transcript);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (uploadMode === 'file' && e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestionCount(Number(e.target.value));
    if (isKXSBActive && Number(e.target.value) !== 5) {
      setIsKXSBActive(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      
      {/* Campaign Strategy Control */}
      <div className={`mb-6 bg-white p-6 rounded-xl shadow-sm border transition-all duration-300 flex flex-col gap-4 relative overflow-hidden ${isKXSBActive ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200'}`}>
         {/* Decorative background element */}
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>

         <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className={`p-2 rounded-lg text-white shadow-md ${isKXSBActive ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'bg-gradient-to-br from-slate-700 to-slate-900'}`}>
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800">Campaign Strategy</label>
                  <p className="text-xs text-slate-500">Define your advertising goals</p>
                </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                 <Target className="w-3 h-3" /> Target Audience
               </label>
               <input 
                  type="text" 
                  value={targetAudience}
                  onChange={(e) => { setTargetAudience(e.target.value); setIsKXSBActive(false); }}
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="e.g. Gen Z"
               />
            </div>
            <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-500">Campaign Goal</label>
               <input 
                  type="text" 
                  value={campaignGoal}
                  onChange={(e) => { setCampaignGoal(e.target.value); setIsKXSBActive(false); }}
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="e.g. Awareness"
                />
            </div>
            <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-500">Brand Tone</label>
               <input 
                  type="text" 
                  value={brandTone}
                  onChange={(e) => { setBrandTone(e.target.value); setIsKXSBActive(false); }}
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="e.g. Witty"
                />
            </div>
            <div className="space-y-1">
               <div className="flex justify-between items-center">
                 <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                   <Hash className="w-3 h-3" /> Questions
                 </label>
                 <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{questionCount}</span>
               </div>
               <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="1"
                  value={questionCount} 
                  onChange={handleSliderChange}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2.5"
                  disabled={isProcessing}
                  title="Number of quiz questions to generate"
                />
            </div>
         </div>
      </div>

      {/* Language Setting */}
      <div className="mb-6">
          <div className="flex flex-col justify-center gap-1 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm w-full md:w-1/2 mx-auto">
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Globe className="w-3 h-3" /> Output Language
            </label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-sm text-slate-700 font-medium focus:outline-none cursor-pointer w-full hover:bg-slate-50 rounded"
              disabled={isProcessing}
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-2 p-1 bg-slate-200 rounded-lg mb-4 w-fit mx-auto">
        <button
          onClick={() => setUploadMode('file')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            uploadMode === 'file' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" /> Upload File
        </button>
        <button
          onClick={() => setUploadMode('url')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            uploadMode === 'url' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Youtube className="w-4 h-4" /> YouTube Link
        </button>
      </div>

      <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
        {uploadMode === 'file' ? (
          <div className="flex flex-col">
            <div 
              className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out
                ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}
                ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="mb-4 p-4 bg-indigo-100 rounded-full">
                  <Upload className="w-10 h-10 text-indigo-600" />
                </div>
                <p className="mb-2 text-xl font-semibold text-slate-700">
                  Drop your event video here
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  MP4, WebM, or MOV (Max 500MB, up to 10 min)
                </p>
                <button 
                  onClick={() => inputRef.current?.click()}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                  Select File
                </button>
              </div>
              <input 
                ref={inputRef}
                type="file" 
                className="hidden" 
                accept="video/*"
                onChange={handleChange}
              />
            </div>
            
            {/* Transcript for File Upload */}
            <div className="p-4 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-2">
                  <FileText className="w-3 h-3" /> Transcript / Context (Optional)
                </label>
                <textarea 
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste video transcript here to improve accuracy, especially for complex topics..."
                  className="w-full h-20 p-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  disabled={isProcessing}
                />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full min-h-72 border-2 border-transparent bg-slate-50 rounded-xl px-8 py-8">
             <div className="mb-4 p-4 bg-red-100 rounded-full">
                <Youtube className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Analyze YouTube Video</h3>
              <p className="text-slate-500 text-sm mb-6 text-center max-w-sm">
                Paste a link below. For real-time analysis, please provide the transcript as well.
              </p>
              
              <div className="flex w-full max-w-lg gap-2 mb-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="https://youtu.be/..."
                    value={youtubeUrl}
                    onChange={(e) => {
                       setYoutubeUrl(e.target.value);
                       setError(null);
                    }}
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="w-full max-w-lg mb-4">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">
                  <FileText className="w-3 h-3" /> Transcript / Context (Recommended for Accuracy)
                </label>
                <textarea 
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste the video transcript here to generate real, accurate quizzes and strategy based on actual content..."
                  className="w-full h-24 p-3 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                  disabled={isProcessing}
                />
              </div>

              <button
                  onClick={validateAndPassUrl}
                  disabled={isProcessing || !youtubeUrl}
                  className="w-full max-w-lg px-6 py-2.5 bg-red-600 text-white font-medium text-sm rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Analyze Video
              </button>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <button 
          onClick={onDemoSelect}
          className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm hover:shadow-md"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          No video? Try Live Demo
        </button>
      </div>

      {error && (
        <div className="mt-4 flex items-center p-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50" role="alert">
          <AlertCircle className="flex-shrink-0 inline w-4 h-4 mr-3" />
          <span className="font-medium">Error:</span> {error}
        </div>
      )}
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Target, title: "Targeted Ads", desc: "Strategy-aligned content" },
          { icon: Sparkles, title: "Viral Scoring", desc: "AI predicts engagement" },
          { icon: Upload, title: "Multi-Platform", desc: "Ready for social media" }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <item.icon className="w-6 h-6 text-slate-400 mb-2" />
            <h3 className="font-medium text-slate-900">{item.title}</h3>
            <p className="text-xs text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
