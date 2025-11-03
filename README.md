# 🌐 MarketPulse – AI-Powered Competitor Analyzer

> **Understand the market. Track competitors. Stay ahead.**

**MarketPulse** is an **AI-driven competitor analysis platform** that helps users instantly discover, compare, and analyze competitors in any market using **LangChain**, **LangGraph**, and **Retrieval-Augmented Generation (RAG)** pipelines.

It transforms scattered public data into **actionable business insights** — perfect for founders, analysts, and investors who want data-driven clarity about their competitive landscape.

---

## 🚀 Features

### 🔍 **Company & Product Search**
Enter any company or product name — *MarketPulse* automatically finds and categorizes competitors in the same space.

### 📊 **Competitor Comparison Dashboard**
AI-generated side-by-side comparison of:
- Pricing models  
- Target markets  
- Core features  
- Tech stacks  
- Market positioning

### 🧠 **AI Insights & Recommendations**
Get contextual answers like:
> “How does Notion differentiate from ClickUp?”  
> “What’s Canva’s competitive edge?”  
> “Which AI startups are trending in the productivity space?”

### 🧰 **Technology Stack Detection**
Visualize the tech behind top players — frontend, backend, and AI tools detected from public sources.

### 📈 **Market Trends & Sentiment**
AI-powered analysis of:
- Growth potential  
- News sentiment  
- User feedback (aggregated)  
- Funding or traction indicators

### 💬 **Conversational AI Assistant**
Chat directly with an integrated AI agent to query:
> “Show me companies similar to Miro in design tools.”  
> “Compare Canva and Figma based on pricing and collaboration.”  

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js (React) + TailwindCSS + shadcn/ui |
| **Backend** | Node.js / Express or NestJS |
| **AI Orchestration** | LangChain + LangGraph |
| **Vector Database** | ChromaDB / Pinecone |
| **LLM Models** | Gemma (local) or OpenAI GPT (for production) |
| **Charts** | Recharts / Chart.js |
| **Deployment** | Vercel (Frontend), Railway / Render (Backend) |

---

## 🧠 AI Architecture

MarketPulse uses a **Retrieval-Augmented Generation (RAG)** workflow:
1. **Data Retrieval** – Fetches data from web searches, ProductHunt, and public APIs.  
2. **Embedding & Storage** – Stores structured and unstructured data in a vector DB.  
3. **Query Understanding** – LangGraph routes user questions to appropriate tools.  
4. **AI Reasoning** – LLM summarizes, compares, and generates insights.  

---