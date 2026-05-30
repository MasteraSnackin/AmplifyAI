# AmplifyAI - The Autonomous Video Marketing Strategist

![AmplifyAI Banner](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-indigo) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![License](https://img.shields.io/badge/License-MIT-green)

**AmplifyAI** is an AI-powered marketing agent designed to solve the content bottleneck for brands and events. By leveraging **Google's Gemini Multimodal AI**, it acts as a "Senior Marketing Strategist in a Box."

Instead of manually watching hours of event footage, webinars, or podcasts, you simply upload the video, define your **Target Audience** and **Campaign Goal**, and AmplifyAI automatically generates high-engagement, viral social campaigns tailored to your strategy.

## 🏆 Hackathon Submission

This project directly addresses the challenge to "deliver a step-change in visibility and prominence through innovative advertising."

**Category Alignment:**
1.  **Develop tools for video search, analysis, or repurposing using multimodal AI**: AmplifyAI repurposes long-form video into quizzes, posts, and scripts automatically.
2.  **Analyze and optimize video content for maximum engagement**: The "Viral Score" and "Strategy Engine" optimize content before it's even posted.
3.  **Create personalized ad variations at scale**: It generates A/B tested social posts and platform-specific video scripts (TikTok vs LinkedIn).

---

## 🚀 Key Features

### 🧠 Strategic Context Engine
Before analysis, you tell the AI who you are targeting (e.g., "Gen Z Investors") and what you want to achieve (e.g., "Showcase Innovation"). The AI adapts its tone, clip selection, and writing style to meet these goals.

### 🎬 Multimodal Ad Scripting
Automatically writes production-ready video scripts for your creative team:
- **Short (15s)**: Fast-paced hooks for TikTok/Reels.
- **Medium (30s)**: Insight-driven scripts for LinkedIn.
- **Long (60s)**: Storytelling scripts for YouTube Ads.

### 🧪 A/B Testing & Side-by-Side Editor
Never run out of ideas. The tool generates **two variations** (Primary vs. Alternate) for every social media post (Twitter, LinkedIn, Instagram).
- **Side-by-Side Comparison**: The Social Editor now features a split view, allowing you to compare Variant A against Variant B and edit them simultaneously to craft the perfect hook.

### 📈 Viral Potential Scoring
The AI analyzes visual energy, audio sentiment, and speaker delivery to assign a **Viral Score (1-100)** to specific video moments.
- **Strategic Reasoning**: It explains *why* a clip will resonate (e.g., "High emotional hook," "Controversial take").

### 🌍 Global Campaigns
AmplifyAI supports **Cross-Language Repurposing**. Upload a video in English and generate assets in 12+ languages including Spanish, French, Italian, Russian, Arabic, Hindi, and Korean.
- **Localization**: It adapts idioms and cultural references to the target language, not just direct translation.

### 🎮 Interactive "Playable" Quizzes
Turns passive video consumption into active engagement.
- **Jump to Evidence**: Users can answer a trivia question and instantly seek the video player to the exact timestamp where the speaker reveals the answer.
- **Sentiment Timeline**: Color-coded timeline markers show where the "Exciting" vs "Neutral" moments are.

---

## 🏗️ Architecture & Diagrams

---

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/amplify-ai.git
   cd amplify-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up API Key**
   Create a `.env` file in the root directory and add your Google Gemini API key:
   ```env
   VITE_API_KEY=your_google_ai_studio_api_key
   ```
   *(Note: The app also checks `process.env.API_KEY` if you are using a different build setup).*

4. **Run the development server**
   ```bash
   npm start
   ```

## 📖 Usage Guide

1. **Upload or Link**: Drag & drop an event video file (MP4/WebM) or paste a YouTube URL.
2. **Define Strategy**:
   - **Target Audience**: Who are you talking to?
   - **Goal**: Awareness, Conversion, or Education?
   - **Tone**: Witty, Professional, Urgent?
3. **Transcript (Optional)**: Paste the video transcript/captions to help the AI extract specific facts and quotes with higher precision.
4. **Analyze**: Click "Analyze". The AI will process the video frame-by-frame.
5. **Review & Edit**:
   - Use the **Timeline** to jump to viral moments.
   - Use the **Side-by-Side Editor** to refine your A/B social posts.
   - Export your favorites to Canva or download the full report.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
