# ShortList AI

AI-powered Candidate Profile Shortlisting System built with the MERN stack and OpenRouter API.

## About

ShortList AI is a recruitment tool that filters and ranks candidates based on required skill sets. It combines algorithmic matching with AI-powered analysis to intelligently suggest best-fit candidates and improve matching accuracy.

## Features

- **Candidate Management** — Add, edit, search, and delete candidate profiles
- **Tag-based Skill Input** — Enter skills as tags (press Enter to add)
- **Multi-factor Scoring** — Transparent formula-based ranking
- **AI Deep Dive** — Analyzes profiles, identifies strengths/weaknesses, generates 5 tailored interview questions
- **Score Breakdown** — Visual bars for each scoring component
- **Match Graph** — Bar chart visualization of scores
- **Save Candidates** — Bookmark top candidates

## Scoring Formula

```
Final Score = (0.5 × Skill) + (0.2 × Experience) + (0.1 × Preferred) + (0.2 × AI)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Chart.js, Lucide Icons |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| AI | OpenRouter API |
| Styling | Vanilla CSS |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/candidates` | Get all candidates |
| `POST` | `/api/candidates` | Add candidate |
| `PUT` | `/api/candidates/:id` | Update candidate |
| `DELETE` | `/api/candidates/:id` | Delete candidate |
| `POST` | `/api/match` | Run skill matching |
| `POST` | `/api/ai/shortlist` | AI-powered analysis |

## Environment Variables

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
OPENROUTER_API_KEY=your_openrouter_api_key
```

## Deployment

- **Backend** — Deployed on Render
- **Frontend** — Deployed on Render

## Live link of the Project
[ShortList AI](https://shortlist-ai-gw7i.onrender.com)

## License

This project is for educational purposes.
