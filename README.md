# AI Agent Frontend

Vite + React + Tailwind CSS frontend for the Multi-Agent Research API.

## Setup

```bash
# 1. Dependencies install karo
npm install

# 2. .env file banao
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:8000

# 3. Dev server start karo
npm run dev
```

Opens at → **http://localhost:3000**

## Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Email/password + Google OAuth |
| `/signup` | Public | Account creation |
| `/auth/callback` | Public | Google OAuth redirect handler |
| `/chat` | 🔒 Protected | Main chat interface |

## Google OAuth Setup

Backend already handles the OAuth flow. Frontend just redirects to:
`GET /auth/google/login` → Google → `/auth/callback?code=xxx`

Make sure your Google Cloud Console **Authorized redirect URIs** includes:
`http://localhost:3000/auth/callback`

OR your backend can redirect to frontend with token:
`http://localhost:3000/auth/callback?token=<jwt>`

## File Structure

```
src/
├── api/
│   ├── axiosInstance.js   ← Axios with JWT interceptors
│   └── auth.js            ← Auth API functions
├── context/
│   └── AuthContext.jsx    ← Global auth state
├── components/
│   └── ProtectedRoute.jsx ← Route guard
├── pages/
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── GoogleCallback.jsx
│   └── Chat.jsx           ← Placeholder (aage banate hain)
├── App.jsx                ← Routes
└── main.jsx
```

## Adding to Chat later

`Chat.jsx` mein sirf apna component add karo — auth already handled hai.
`useAuth()` hook se `user` aur `logout` mil jaate hain.
