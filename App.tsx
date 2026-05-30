
import React, { useState, useEffect } from 'react';
import { BrainCircuit, Video, Sparkles } from 'lucide-react';
import { UploadZone } from './components/UploadZone';
import { ProcessingState } from './components/ProcessingState';
import { ResultsDashboard } from './components/ResultsDashboard';
import { Analytics } from './components/Analytics';
import { analyzeVideoAndGenerateContent } from './services/geminiService';
import { AnalysisResult, AppState, MarketingStrategy, SupportedLanguage } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [videoSource, setVideoSource] = useState<File | string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load persistence
  useEffect(() => {
    const savedData = localStorage.getItem('amplifyAiResult');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setAnalysisResult(parsed);
        setAppState(AppState.REVIEW);
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    }
  }, []);

  // Save persistence
  useEffect(() => {
    if (analysisResult) {
      localStorage.setItem('amplifyAiResult', JSON.stringify(analysisResult));
    }
  }, [analysisResult]);

  const handleAnalysis = async (input: File | string, questionCount: number, language: SupportedLanguage, strategy: MarketingStrategy, transcript?: string) => {
    try {
      setVideoSource(input); // Store source for playback
      setAppState(AppState.PROCESSING);
      setError(null);
      
      // Call Gemini Service with Strategy and optional Transcript
      const result = await analyzeVideoAndGenerateContent(input, questionCount, language, strategy, transcript);
      
      setAnalysisResult(result);
      setAppState(AppState.REVIEW);
    } catch (err: any) {
      console.error(err);
      
      let message = "An unexpected error occurred. Please try again.";
      const errString = err.toString();
      
      if (errString.includes("API Key") || errString.includes("API_KEY")) {
        message = "Invalid or missing API Key. Please check your .env or environment configuration.";
      } else if (errString.includes("400")) {
         message = "The video format is not supported or the file is corrupted. Please use standard MP4, WebM, or MOV.";
      } else if (errString.includes("413") || errString.includes("File is too large")) {
         message = "The file is too large for this demo. Please use a file under 20MB or try a YouTube link with transcript.";
      } else if (errString.includes("403")) {
         message = "Access denied. Your API key might not have the required permissions.";
      } else if (errString.includes("503") || errString.includes("Overloaded")) {
         message = "The AI service is currently experiencing high traffic. Please try again in a moment.";
      } else if (errString.includes("fetch") || errString.includes("network")) {
         message = "Network error. Please check your internet connection.";
      } else if (errString.includes("Candidate was blocked")) {
         message = "The content was flagged by safety filters. Please try a different video.";
      } else if (err.message) {
         message = `Error: ${err.message}`;
      }

      setError(message);
      setAppState(AppState.UPLOAD);
    }
  };

  const handleDemoLoad = async () => {
     setAppState(AppState.PROCESSING);
     // Simulate processing delay
     await new Promise(resolve => setTimeout(resolve, 1500));

     const demoStrategy: MarketingStrategy = {
        targetAudience: "Tech Savvy Investors & Gen Z",
        campaignGoal: "Showcase Innovation & AI Leadership",
        brandTone: "Bold, Futuristic, and Authentic"
     };

     const demoResult: AnalysisResult = {
        language: 'English',
        strategyUsed: demoStrategy,
        summary: "The analyzed footage highlights KXSB's pivotal role in the AI revolution. The content is highly suitable for 'Tech Savvy Investors' as it focuses on scalability, future-proofing, and market leadership. The AI detected 5 viral moments with high emotional resonance and clear calls to action, ideal for a multi-platform campaign targeting Gen Z engagement and Investor confidence.",
        quizzes: [
          {
             id: 1,
             question: "What statistic did the speaker cite regarding AI adoption rates in 2024?",
             options: ["Doubled since 2023", "Increased by 10%", "Stayed Flat", "Tripled globally"],
             correctAnswerIndex: 0,
             explanation: "The speaker revealed that enterprise AI adoption has doubled year-over-year, signaling a massive market shift.",
             timestamp: 45,
             sentiment: "exciting",
             speaker: "Keynote Speaker",
             viralScore: 94,
             reasoning: "High-impact data point that validates the investment thesis immediately."
          },
          {
             id: 2,
             question: "Which major barrier to entry did the new KXSB platform solve?",
             options: ["High Cost", "Latency issues", "Data Privacy", "User Interface"],
             correctAnswerIndex: 2,
             explanation: "They emphasized that the new 'Private Cloud' architecture solves the data privacy bottleneck for enterprise clients.",
             timestamp: 120,
             sentiment: "positive",
             speaker: "CTO",
             viralScore: 88,
             reasoning: "Addresses a specific pain point for the target audience (Security/Privacy)."
          },
          {
             id: 3,
             question: "What metaphor was used to describe the current state of the industry?",
             options: ["A Gold Rush", "The Industrial Revolution", "A Tsunami", "A Marathon"],
             correctAnswerIndex: 1,
             explanation: "The speaker compared this moment to the Industrial Revolution, implying foundational societal change.",
             timestamp: 210,
             sentiment: "exciting",
             speaker: "Keynote Speaker",
             viralScore: 91,
             reasoning: "Strong emotional hook that frames the narrative as historical and urgent."
          }
        ],
        socialPosts: [
           {
              platform: "twitter",
              content: "🚀 AI adoption has DOUBLED in just 12 months. The shift isn't coming; it's here. Are you positioned for the new industrial revolution? #KXSB #FutureOfTech",
              alternateOption: "Data Privacy was the bottleneck. We just broke the bottle. 🍾 Introducing the new Private Cloud architecture. Secure. Scalable. Ready. 🔒 #AI #Enterprise",
              hashtags: ["#KXSB", "#Innovation", "#AI", "#TechTrends"]
           },
           {
              platform: "linkedin",
              content: "In today's keynote, we addressed the elephant in the room: Data Privacy. For too long, enterprise adoption has been stalled by security concerns. Today, KXSB solves that. Here is how we are redefining the standard...",
              alternateOption: "The numbers don't lie. 📈 Enterprise adoption has doubled YoY. We are witnessing a foundational shift comparable to the Industrial Revolution. Is your infrastructure ready?",
              hashtags: ["#Leadership", "#CloudSecurity", "#EnterpriseTech", "#Growth"]
           },
           {
              platform: "instagram",
              content: "The future is looking BOLD. ⚡️ Catch the highlights from today's game-changing announcement. The rules have changed. #KXSB",
              alternateOption: "✨ 'It's like the Industrial Revolution all over again.' The energy in the room today was unmatched! Swipe to see why. 👉",
              hashtags: ["#TechLife", "#Future", "#Keynote", "#Inspo"]
           }
        ],
        adScripts: [
           {
              format: "Short (15s)",
              targetPlatform: "TikTok / Reels",
              hook: "Stop scrolling! 🛑 You think you know AI?",
              body: "Adoption just DOUBLED. We are in a new Industrial Revolution. Don't get left behind.",
              callToAction: "Link in bio to see the future. 🚀",
              visualCues: "Fast cuts, glitch effect on text, high energy music."
           },
           {
              format: "Medium (30s)",
              targetPlatform: "LinkedIn Video",
              hook: "What is holding your enterprise back? It's Privacy, right?",
              body: "We heard you. Introducing the KXSB Private Cloud. The scalability of AI, with the security of a vault. The bottleneck is gone.",
              callToAction: "Learn more at kxsb.com/enterprise",
              visualCues: "Clean graphics, animated lock icon unlocking, confident speaker."
           },
           {
              format: "Long (60s)",
              targetPlatform: "YouTube Ad",
              hook: "History doesn't repeat itself, but it rhymes.",
              body: "We are standing at the edge of a new Industrial Revolution. But this time, it's digital. Today at KXSB, we unveiled the tools that will build tomorrow. Will you be a spectator or a builder?",
              callToAction: "Watch the full Keynote now.",
              visualCues: "Cinematic B-roll of the event, slow motion crowd shots, swelling orchestral music."
           }
        ]
     };
     
     setAnalysisResult(demoResult);
     setVideoSource(null); // No video for demo mode
     setAppState(AppState.REVIEW);
  };

  const handleClearData = () => {
    setAnalysisResult(null);
    setVideoSource(null);
    localStorage.removeItem('amplifyAiResult');
    setAppState(AppState.UPLOAD);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.UPLOAD:
        return (
          <div className="flex flex-col items-center">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wide mb-4">
                <Sparkles className="w-3 h-3" />
                AI Marketing Agent
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
                Your Autonomous <br /><span className="text-indigo-600">Video Marketing Strategist</span>
              </h1>
              <p className="text-lg text-slate-600">
                Upload raw event footage. Get back <b>Viral Quizzes</b>, <b>Ad Scripts</b>, and <b>Social Campaigns</b>—optimized for your specific target audience by Gemini AI.
              </p>
            </div>
            <UploadZone 
              onFileSelect={handleAnalysis} 
              onUrlSelect={handleAnalysis}
              onDemoSelect={handleDemoLoad}
              isProcessing={false} 
            />
            {error && <p className="mt-6 text-red-600 font-medium bg-red-50 px-4 py-2 rounded-lg border border-red-200">{error}</p>}
          </div>
        );
      case AppState.PROCESSING:
        return <ProcessingState />;
      case AppState.REVIEW:
        return analysisResult ? (
          <ResultsDashboard 
            data={analysisResult} 
            videoSource={videoSource}
            onNavigate={(state) => setAppState(state)} 
          />
        ) : null;
      case AppState.ANALYTICS:
        return <Analytics 
          onBack={() => setAppState(AppState.REVIEW)} 
          strategy={analysisResult?.strategyUsed}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={handleClearData}
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">AmplifyAI</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center text-sm text-slate-500 gap-1">
               <Video className="w-4 h-4" />
               <span>Powered by Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI-Driven Engagement Platform</span>
          </div>
          <p>© 2024 AmplifyAI. Built with Gemini & React.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
