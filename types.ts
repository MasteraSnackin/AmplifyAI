
export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[]; // Simple array of strings for display
  correctAnswerIndex: number;
  explanation: string;
  timestamp: number; // Time in seconds where the answer is found/discussed
  sentiment?: 'positive' | 'negative' | 'neutral' | 'exciting';
  speaker?: string;
  viralScore?: number; // 1-100 score of how engaging this moment is
  reasoning?: string; // AI explanation of why this fits the target audience
}

export interface SocialPost {
  platform: 'twitter' | 'linkedin' | 'instagram';
  content: string;
  alternateOption?: string; // For A/B testing
  hashtags: string[];
}

export interface AdScript {
  format: 'Short (15s)' | 'Medium (30s)' | 'Long (60s)';
  targetPlatform: string;
  hook: string;
  body: string;
  callToAction: string;
  visualCues: string;
}

export type SupportedLanguage = 
  | 'English' 
  | 'Spanish' 
  | 'French' 
  | 'German' 
  | 'Portuguese' 
  | 'Japanese' 
  | 'Chinese'
  | 'Italian'
  | 'Russian'
  | 'Arabic'
  | 'Hindi'
  | 'Korean';

export interface MarketingStrategy {
  targetAudience: string;
  campaignGoal: string;
  brandTone: string;
}

export interface AnalysisResult {
  summary: string;
  quizzes: QuizQuestion[];
  socialPosts: SocialPost[];
  adScripts: AdScript[];
  language?: SupportedLanguage;
  strategyUsed?: MarketingStrategy;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  REVIEW = 'REVIEW',
  ANALYTICS = 'ANALYTICS'
}
