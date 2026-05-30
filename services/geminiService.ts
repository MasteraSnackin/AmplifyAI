
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, MarketingStrategy, QuizQuestion, SupportedLanguage } from "../types";

// Helper to safely get API Key
const getApiKey = () => {
  // @ts-ignore
  const key = (typeof process !== 'undefined' && process.env && process.env.API_KEY) || 
              // @ts-ignore
              (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) ||
              "";
  if (!key) throw new Error("API Key is missing. Please check your .env configuration.");
  return key;
};

const processVideoFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:video/mp4;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Mock data generator for YouTube demo purposes (when no transcript is provided)
const generateMockAnalysis = (questionCount: number, language: SupportedLanguage, strategy: MarketingStrategy): AnalysisResult => {
  const isEnglish = language === 'English';
  
  const questionTemplates = [
    `How does the speaker address the specific concerns of ${strategy.targetAudience} here?`,
    `What key statistic regarding ${strategy.campaignGoal} was revealed in this segment?`,
    `Why is this particular moment considered a "viral hook" for our ${strategy.brandTone} messaging?`,
    `Which competitive advantage did the speaker highlight during this section?`,
    `What is the primary call to action suggested for ${strategy.targetAudience}?`,
    `How does this insight challenge the conventional wisdom about the industry?`,
    `What metaphor was used to explain the complexity of this topic?`,
    `Why would this specific 30-second clip drive high engagement on LinkedIn?`
  ];

  const optionTemplates = [
    ["It reduces cost by 50%", "It increases speed by 10x", "It simplifies the workflow", "It automates compliance"],
    ["Global adoption rates", "Retention metrics", "Conversion efficiency", "User satisfaction scores"],
    ["Emotional resonance", "Data-backed evidence", "Controversial take", "Humorous delivery"],
    ["First-mover advantage", "Technological moat", "Brand loyalty", "Cost leadership"]
  ];

  const quizzes: QuizQuestion[] = Array.from({ length: questionCount }, (_, i) => {
    const qTemplate = questionTemplates[i % questionTemplates.length];
    const oTemplate = optionTemplates[i % optionTemplates.length];
    
    // Distribute timestamps more evenly for the demo
    const segmentSize = 500 / questionCount; 
    const timestamp = Math.floor(i * segmentSize + (Math.random() * (segmentSize * 0.5)));

    return {
      id: i + 1,
      question: isEnglish ? qTemplate : `Pregunta simulada ${i + 1} (${language})`,
      options: isEnglish ? oTemplate : ["Opción A", "Opción B", "Opción C", "Opción D"],
      correctAnswerIndex: Math.floor(Math.random() * 4),
      explanation: isEnglish 
        ? `This insight is critical for ${strategy.campaignGoal} because it directly addresses the pain points of ${strategy.targetAudience}.` 
        : "Explanation in target language.",
      timestamp: Math.max(10, timestamp),
      sentiment: ['exciting', 'positive', 'neutral', 'positive'][i % 4] as any,
      speaker: i % 2 === 0 ? "Keynote Speaker" : "Host",
      viralScore: Math.floor(Math.random() * (98 - 75) + 75), 
      reasoning: `High relevance to ${strategy.targetAudience} due to ${i % 2 === 0 ? 'strong emotional hook' : 'actionable data insight'}.`
    };
  });

  return {
    language,
    strategyUsed: strategy,
    summary: isEnglish 
      ? `Analysis for ${strategy.targetAudience} targeting ${strategy.campaignGoal}: The AI has identified ${questionCount} high-impact moments that align with ${strategy.brandTone} messaging. The content shows strong potential for viral engagement on professional networks.`
      : `(Simulated ${language} Translation) Analysis for ${strategy.targetAudience}...`,
    quizzes: quizzes,
    socialPosts: [
      {
        platform: "twitter",
        content: isEnglish 
          ? `🔥 Hot take for ${strategy.targetAudience}: The future of ${strategy.campaignGoal} is here. Are you ready? #Future #Tech`
          : `Post simulado para Twitter en ${language}.`,
        alternateOption: isEnglish
          ? `Questioning the status quo? Here's why this new approach is the answer you've been waiting for. 👇`
          : `Variación del post simulado en ${language}.`,
        hashtags: ["#TechTrends", "#AI", "#Innovation", `#${strategy.brandTone.split(' ')[0]}`]
      },
      {
        platform: "linkedin",
        content: isEnglish 
          ? `Strategically speaking, the shift towards this new paradigm offers a 10x opportunity for ${strategy.targetAudience}. Here is why...`
          : `Análisis profesional simulado para LinkedIn en ${language}.`,
        alternateOption: isEnglish
          ? `How are you adapting to these changes? We analyzed the latest data and the results are surprising.`
          : `Variación LinkedIn en ${language}.`,
        hashtags: ["#GenerativeAI", "#Growth", "#Strategy", "#Leadership"]
      },
      {
        platform: "instagram",
        content: isEnglish 
          ? `POV: You just realized the future is here 🤯✨ Tag a friend who needs to see this! `
          : `Contenido divertido para Instagram en ${language}! 🤯✨`,
        alternateOption: isEnglish
          ? `Behind the scenes at the event of the year! 🎥 Check out this insight.`
          : `Variación Instagram en ${language}.`,
        hashtags: ["#TechLife", "#FutureIsNow", "#Coding", "#Vibes"]
      }
    ],
    adScripts: [
      {
        format: "Short (15s)",
        targetPlatform: "TikTok / Reels",
        hook: `Stop scrolling! You won't believe what we just learned about ${strategy.campaignGoal}.`,
        body: "Experts revealed that 90% of strategies are outdated. Here is the new playbook.",
        callToAction: "Link in bio for the full report!",
        visualCues: "Fast cuts, text overlays, upbeat music."
      },
      {
        format: "Medium (30s)",
        targetPlatform: "LinkedIn Video",
        hook: "Are you making this critical mistake in your strategy?",
        body: `We analyzed hours of footage to bring you this key insight for ${strategy.targetAudience}: The market is shifting, and adaptation is key.`,
        callToAction: "Comment 'Strategy' and I'll send you the details.",
        visualCues: "Professional setting, key statistics on screen, calm pacing."
      },
      {
        format: "Long (60s)",
        targetPlatform: "YouTube Ad",
        hook: "Imagine if you could double your output without doubling your team.",
        body: `That is the promise of the new wave. We deep dived into the keynote to find specific tools for ${strategy.targetAudience}. It is no longer science fiction.`,
        callToAction: "Click below to watch the full breakdown.",
        visualCues: "B-roll of the event, screen recordings of tools, testimonial clips."
      }
    ]
  };
};

export const analyzeVideoAndGenerateContent = async (
  input: File | string, 
  questionCount: number = 3, 
  language: SupportedLanguage = 'English',
  strategy: MarketingStrategy = { targetAudience: 'General Audience', campaignGoal: 'Engagement', brandTone: 'Professional' },
  transcript?: string
): Promise<AnalysisResult> => {
  
  // Handle YouTube URL with Real Transcript Analysis
  if (typeof input === 'string' && transcript && transcript.trim().length > 20) {
    const apiKey = getApiKey();

    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.5-flash"; 

    const responseSchema = getSchema(questionCount, strategy, language);

    const prompt = `
    ACT AS A SENIOR MARKETING STRATEGIST.
    
    CAMPAIGN PARAMETERS:
    - Target Audience: ${strategy.targetAudience}
    - Campaign Goal: ${strategy.campaignGoal}
    - Brand Tone: ${strategy.brandTone}
    - Output Language: ${language}

    SOURCE MATERIAL:
    The following is a transcript from a YouTube video event.
    TRANSCRIPT:
    "${transcript.substring(0, 30000)}..." (Truncated if too long)

    TASK:
    Analyze this transcript to find the most impactful moments.
    
    1. Summarize content highlighting value for the Target Audience.
    2. Create ${questionCount} quiz questions based on real facts from the text. 
       - Estimate timestamps (in seconds) based on the flow of the text if not explicit.
       - Calculate a "Viral Score" (1-100).
    3. Generate social media captions (A/B variations).
    4. Generate 3 Video Ad Scripts based on the content.
    `;

    try {
        const response = await ai.models.generateContent({
          model: model,
          contents: { parts: [{ text: prompt }] },
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          }
        });
    
        const text = response.text;
        if (!text) throw new Error("No response from AI");
    
        const result = JSON.parse(text) as AnalysisResult;
        result.language = language;
        result.strategyUsed = strategy;
        
        result.quizzes = result.quizzes.map(q => ({
            ...q,
            timestamp: Math.min(q.timestamp || 0, 600) 
        }));

        return result;
      } catch (error) {
        console.error("Gemini Transcript Analysis Error:", error);
        throw error;
      }
  }

  // Handle YouTube URL without Transcript (Mock Fallback)
  if (typeof input === 'string') {
    await new Promise(resolve => setTimeout(resolve, 2500));
    console.warn("Using mock analysis for YouTube URL (No transcript provided).");
    return generateMockAnalysis(questionCount, language, strategy);
  }

  // Handle Real File Upload (Video Bytes)
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  // Check file size warning
  if (input.size > 500 * 1024 * 1024) {
    console.warn("File size > 500MB.");
  }

  const base64Video = await processVideoFile(input);
  const responseSchema = getSchema(questionCount, strategy, language);
  const model = "gemini-2.5-flash"; 

  let prompt = `
    ACT AS A SENIOR MARKETING STRATEGIST & VIDEO EDITOR.
    
    CAMPAIGN PARAMETERS:
    - Target Audience: ${strategy.targetAudience}
    - Campaign Goal: ${strategy.campaignGoal}
    - Brand Tone: ${strategy.brandTone}
    - Output Language: ${language}

    TASK:
    Analyze this video to find the most "viral" or impactful moments that will resonate with the specific Target Audience.
    
    1. Summarize content highlighting value propositions for the Target Audience.
    2. Create ${questionCount} quiz questions based on high-impact moments. 
       - Calculate a "Viral Score" (1-100) based on emotional impact.
       - Provide "Reasoning" for the strategy.
    3. Generate social media captions (Twitter, LinkedIn, Instagram).
       - Create TWO variations for each: Primary and Alternate (A/B test).
    4. Generate 3 Video Ad Scripts (15s, 30s, 60s).
  `;

  // Append transcript to prompt if available to improve context
  if (transcript && transcript.trim().length > 10) {
    prompt += `\n\nADDITIONAL CONTEXT (TRANSCRIPT):\n"${transcript.substring(0, 15000)}..."`;
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: input.type, data: base64Video } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI. The model may have blocked the content or timed out.");

    const result = JSON.parse(text) as AnalysisResult;
    result.language = language;
    result.strategyUsed = strategy;
    
    return result;
  } catch (error: any) {
    console.error("Gemini Analysis Error Full:", error);
    // Provide cleaner error messages if possible
    if (error.message && error.message.includes("413")) {
      throw new Error("File is too large for the API to process directly. Please try a file under 20MB for this demo.");
    }
    throw error;
  }
};

function getSchema(questionCount: number, strategy: MarketingStrategy, language: string) {
    return {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: `A strategic summary of how this video aligns with the goal: ${strategy.campaignGoal}. Language: ${language}.` },
          quizzes: {
            type: Type.ARRAY,
            description: `Generate exactly ${questionCount} quiz questions derived from viral moments.`,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "4 possible answers",
                },
                correctAnswerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                timestamp: { type: Type.INTEGER },
                sentiment: { type: Type.STRING, enum: ["positive", "negative", "neutral", "exciting"] },
                speaker: { type: Type.STRING },
                viralScore: { type: Type.INTEGER, description: "Score from 1-100 indicating likelihood of high engagement for the target audience." },
                reasoning: { type: Type.STRING, description: `Why this specific moment appeals to ${strategy.targetAudience} and helps achieve ${strategy.campaignGoal}.` }
              },
              required: ["id", "question", "options", "correctAnswerIndex", "explanation", "timestamp", "sentiment", "speaker", "viralScore", "reasoning"],
            },
          },
          socialPosts: {
            type: Type.ARRAY,
            description: `Draft posts for Twitter, LinkedIn, and Instagram. Tone: ${strategy.brandTone}. Target: ${strategy.targetAudience}. Language: ${language}.`,
            items: {
              type: Type.OBJECT,
              properties: {
                platform: { type: Type.STRING, enum: ["twitter", "linkedin", "instagram"] },
                content: { type: Type.STRING, description: "Primary option." },
                alternateOption: { type: Type.STRING, description: "A variation using a different angle/hook (A/B test)." },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["platform", "content", "alternateOption", "hashtags"],
            },
          },
          adScripts: {
            type: Type.ARRAY,
            description: "Generate 3 video ad scripts: Short (15s), Medium (30s), Long (60s).",
            items: {
              type: Type.OBJECT,
              properties: {
                format: { type: Type.STRING, enum: ["Short (15s)", "Medium (30s)", "Long (60s)"] },
                targetPlatform: { type: Type.STRING },
                hook: { type: Type.STRING, description: "The first 3 seconds to grab attention." },
                body: { type: Type.STRING, description: "The main message derived from the analysis." },
                callToAction: { type: Type.STRING },
                visualCues: { type: Type.STRING, description: "Instructions for the video editor." }
              },
              required: ["format", "targetPlatform", "hook", "body", "callToAction", "visualCues"]
            }
          }
        },
        required: ["summary", "quizzes", "socialPosts", "adScripts"],
      };
}
