# Agent Notes — Menu Codexa

## Stack
- Frontend: React 18 + TypeScript + Vite 5
- Backend: Node.js + Express + TypeScript + Mongoose
- Database: MongoDB Atlas
- Design system: `codexa-ui`
- Auth: Firebase Google Sign-In

## Useful Commands

```bash
# Install dependencies
npm install

# Run both dev servers
npm run dev

# API only
npm run dev -w apps/api

# Web only
npm run dev -w apps/web

# Type checks
npm run lint -w apps/api
npm run lint -w apps/web

# Build web
npm run build -w apps/web
```

## Local Dev Notes
- API runs on `http://localhost:3333`
- Web runs on `http://127.0.0.1:5173`
- Credentials are in `apps/api/.env` and `apps/web/.env` (gitignored)
- Backend validates the Firebase `idToken` via Identity Toolkit API and issues a local JWT
