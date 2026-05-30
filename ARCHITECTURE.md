# System Architecture - AmplifyAI

This document provides a deep technical overview of **AmplifyAI**, an AI-powered autonomous marketing strategist application. It uses the C4 model for high-level architecture and standard UML/Mermaid diagrams for behavioral flows.

---

## 1. C1 - System Context Diagram
*The big picture view of how AmplifyAI fits into the marketing ecosystem.*

```mermaid
C4Context
    title System Context Diagram for AmplifyAI

    Person(marketer, "Marketing Manager", "Uploads event videos, defines strategy, and reviews AI outputs.")
    
    System(amplifyAI, "AmplifyAI App", "React/Vite Application. Analyzes video, generates viral scores, ad scripts, and social content.")

    System_Ext(gemini, "Google Gemini API", "Multimodal LLM (Gemini 3.5). Processes video frames and audio to generate insights.")
    System_Ext(youtube, "YouTube", "External video source (via Iframe/Embed).")
    System_Ext(social_media, "Social Platforms", "LinkedIn, Twitter, Instagram where generated content is published.")

    Rel(marketer, amplifyAI, "Uploads video, Sets Strategy, Reviews Content")
    Rel(amplifyAI, gemini, "Sends Base64 Video/Prompt", "HTTPS/JSON")
    Rel(amplifyAI, youtube, "Embeds Player", "HTTPS")
    Rel(marketer, social_media, "Publishes generated content")
```

---

## 2. C2 - Container Diagram
*High-level technology choices and execution environment.*

```mermaid
C4Container
    title Container Diagram - AmplifyAI

    Person(user, "User", "Marketing professional")

    Container_Boundary(c1, "Single Page Application (Browser)") {
        Container(web_app, "React Application", "React 19, Tailwind, Vite", "Provides the UI for upload, playback, and editing.")
        Container(service, "Gemini Service Layer", "TypeScript / @google/genai", "Handles API key management, prompt engineering, and response validation.")
        Container(store, "Persistence Layer", "Local Storage API", "Saves analysis results locally to prevent data loss on refresh.")
        Container(media_engine, "Media Engine", "HTML5 Video / Canvas API", "Handles video playback, frame capture, and seek operations.")
    }

    System_Ext(gemini_api, "Google GenAI SDK", "Inference Engine. Receives multimodal inputs.")

    Rel(user, web_app, "Interacts with UI")
    Rel(web_app, service, "Dispatches Analysis Job")
    Rel(service, gemini_api, "POST /generateContent", "JSON Schema")
    Rel(web_app, store, "Persists State")
    Rel(web_app, media_engine, "Controls Playback")
```

---

## 3. C3 - Component Diagram
*Detailed breakdown of the React Application structure.*

```mermaid
C4Component
    title Component Diagram - Core Application Logic

    Container_Boundary(app, "AmplifyAI Source") {
        Component(app_root, "App.tsx", "Root Controller", "Manages global state (Upload -> Processing -> Review) and routing.")
        
        Component(upload_zone, "UploadZone.tsx", "Input Handler", "Handles file DnD, YouTube URL parsing, and Marketing Strategy form inputs.")
        
        Component(processing, "ProcessingState.tsx", "Feedback UI", "Displays loading animations and progress bars.")
        
        Component(dashboard, "ResultsDashboard.tsx", "Main View", "Integrates Video Player, Timeline, Social Editor, and Quiz Cards.")
        
        Component(analytics, "Analytics.tsx", "Data Viz", "Renders charts using Recharts for campaign performance simulation.")
        
        Component(gemini_svc, "geminiService.ts", "Service", "Constructs the 'Senior Marketing Strategist' prompt, encodes files, and calls API.")
    }

    Rel(app_root, upload_zone, "Renders")
    Rel(app_root, processing, "Renders")
    Rel(app_root, dashboard, "Renders")
    Rel(upload_zone, gemini_svc, "Triggers analyzeVideoAndGenerateContent()")
    Rel(dashboard, gemini_svc, "Calls for re-analysis (future)")
```

---

## 4. Sequence Diagram: Analysis Workflow
*The step-by-step process of turning a raw video into a marketing campaign.*

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant UploadUI as UploadZone
    participant Service as GeminiService
    participant Google as Gemini API
    participant App as AppState

    User->>UploadUI: Drag & Drop Video / Paste URL
    User->>UploadUI: Define Strategy (Target Audience, Goal, Tone)
    User->>UploadUI: Click "Analyze"

    UploadUI->>Service: analyzeVideoAndGenerateContent(file, strategy)
    
    activate Service
    Service->>Service: Convert File to Base64 (if file)
    Service->>Service: Construct Prompt ("Act as Marketing Strategist...")
    Service->>Service: Inject Strategy Variables & Transcript
    
    Service->>Google: POST generateContent(model='gemini-3.5-flash')
    activate Google
    Google-->>Service: Return JSON (Quizzes, Viral Scores, Ad Scripts)
    deactivate Google

    Service->>Service: Validate JSON Schema
    Service-->>App: Return AnalysisResult Object
    deactivate Service

    App->>App: Set State to REVIEW
    App->>User: Display Results Dashboard
```

---

## 5. Sequence Diagram: Interactive Playback
*How the "Jump to Evidence" feature works.*

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant Card as QuizCard
    participant Player as VideoPlayer
    participant Canvas as CanvasOverlay

    User->>Card: Clicks "Jump to Evidence (2:45)"
    
    Card->>Player: onSeek(165 seconds)
    
    alt is YouTube
        Player->>Player: Update Iframe URL (?start=165)
    else is File
        Player->>Player: video.currentTime = 165
        Player->>Player: video.play()
    end

    Player-->>Canvas: TimeUpdate Event
    
    loop Every Second
        Canvas->>Canvas: Check for "Viral Moment"
        opt if Viral Moment found
            Canvas->>User: Display "Smart Subtitle / Hook" Overlay
        end
    end
```

---

## 6. Data Model (Conceptual ERD)
*The structure of the data generated by the AI.*

```mermaid
erDiagram
    ANALYSIS_RESULT ||--|{ QUIZ_QUESTION : contains
    ANALYSIS_RESULT ||--|{ SOCIAL_POST : generates
    ANALYSIS_RESULT ||--|{ AD_SCRIPT : generates
    ANALYSIS_RESULT ||--|| MARKETING_STRATEGY : based_on

    MARKETING_STRATEGY {
        string targetAudience
        string campaignGoal
        string brandTone
    }

    QUIZ_QUESTION {
        int id
        string question
        string[] options
        int timestamp "Seconds"
        int viralScore "1-100"
        string sentiment "Positive/Negative"
        string reasoning "Why it works"
    }

    SOCIAL_POST {
        string platform "Twitter/LinkedIn"
        string content "Variant A"
        string alternateOption "Variant B"
        string[] hashtags
    }

    AD_SCRIPT {
        string format "15s/30s/60s"
        string hook
        string body
        string visualCues
        string callToAction
    }
```

---

## 7. Data Flow Diagram (DFD)
*How data transforms through the pipeline.*

```mermaid
flowchart TD
    RawVideo[Raw Video File] --> InputProcessor
    UserStrategy[User Strategy Input] --> InputProcessor
    Transcript[Transcript Text] --> InputProcessor

    subgraph "AmplifyAI Processing Core"
        InputProcessor[Input Handler]
        PromptEngine[Prompt Engineering Module]
        GeminiClient[Gemini API Client]
        SchemaValidator[JSON Schema Validator]
    end

    InputProcessor -- Base64 Data + Context --> PromptEngine
    PromptEngine -- Structured Prompt --> GeminiClient
    GeminiClient -- API Request --> GeminiModel((Gemini 3.5))
    GeminiModel -- JSON Response --> GeminiClient
    GeminiClient -- Raw JSON --> SchemaValidator
    
    subgraph "Output Assets"
        SchemaValidator --> QuizEngine[Interactive Quizzes]
        SchemaValidator --> ScriptEngine[Ad Scripts]
        SchemaValidator --> SocialEngine[Social Posts]
        SchemaValidator --> AnalyticsEngine[Viral Scoring]
    end

    QuizEngine --> Dashboard
    ScriptEngine --> Dashboard
    SocialEngine --> Dashboard
    AnalyticsEngine --> Dashboard
```
