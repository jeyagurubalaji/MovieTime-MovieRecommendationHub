# 🎬 MovieTime — AI Movie Recommendation Hub

MovieTime is a full-stack AI-powered movie discovery platform for exploring movies and TV series, getting personalized recommendations, and interacting with an AI movie assistant.

## 🚀 Features

* 🎥 Movie & TV Series Discovery
* 🤖 AI-Powered Recommendations
* 💬 AI Movie Assistant
* 🎭 Mood-Based Recommendations
* 🔍 Search & Movie Details
* ❤️ Favorites & Watchlist
* ⭐ Ratings & Reviews
* 🔐 JWT Authentication
* 🌐 Multi-Language Support
* 📱 Responsive UI

## 🛠️ Tech Stack

**Frontend:** React, Vite, Axios, React Router

**Backend:** Java, Spring Boot, Spring Security, JWT, MongoDB

**AI Service:** Python, FastAPI, Groq AI, TMDB API

## 🏗️ Architecture

```text
MovieTime
│
├── Frontend    → React + Vite
│
├── Backend     → Spring Boot + MongoDB
│
└── AI-Service   → FastAPI + Groq + TMDB
```

## ⚙️ Run Locally

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

### Backend

```bash
cd Backend
mvn spring-boot:run
```

### AI Service

```bash
cd AI-Service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## 🔑 Environment Variables

```env
MONGODB_URI=my_mongodb_url
JWT_SECRET=my_jwt_secret
TMDB_API_KEY=my_tmdb_api_key
GROQ_API_KEY=my_groq_api_key
```

## 📌 Project Architecture

```text
React Frontend
      │
      ├── Spring Boot Backend ── MongoDB
      │
      └── FastAPI AI Service ── Groq + TMDB
```

**MovieTime** combines full-stack development with AI-powered movie recommendations to provide a modern movie discovery experience.
