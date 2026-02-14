# Velamini Frontend

Velamini is a Next.js AI assistant app for a "digital twin" experience of Ishimwe Tresor Bertrand.
It combines:

- conversational chat UI
- local knowledge retrieval (RAG-style context injection)
- optional web search augmentation
- DeepSeek chat completions with tool-calling
- Google auth (NextAuth v5)
- PostgreSQL persistence via Prisma
- WhatsApp integration through Twilio webhook + outbound messages

## Tech Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript + React 19
- Styling: Tailwind CSS v4 + DaisyUI + custom global CSS
- Auth: NextAuth v5 (Google provider)
- Database: PostgreSQL via Prisma + `@prisma/adapter-pg`
- AI: DeepSeek Chat Completions API
- Web Search Tool: Tavily API
- Messaging: Twilio WhatsApp API
- Animation/UI: Framer Motion + Lucide icons

## Product Areas

### 1. Public Chat Experience

- Route: `/`
- Main component: `src/components/ChatPanel.tsx`
- Features:
- persistent local chat history in `localStorage` (`velamini_chat_history`)
- message list with timestamps and avatars
- hero title when no messages
- feedback modal (stores user ratings/comments)
- "Improve response" widget per assistant message (saves training examples)

### 2. Dashboard Area (Authenticated)

- Route: `/Dashboard`
- Page file: `src/app/Dashboard/page.tsx`
- Layout:
- left sidebar (`src/components/Sidebar.tsx`)
- main content area (currently simple welcome block placeholder)

### 3. Training Wizard (Authenticated)

- Route: `/training`
- Page: `src/app/training/page.tsx`
- Multi-step profile/training flow:
- identity
- personality
- knowledge/files
- boundaries
- workflow
- review + consent

### 4. Sign-in Portal

- Route: `/auth/signin`
- Google sign-in UX with animated visual panel

## AI Pipeline

### Chat API (`POST /api/chat`)

File: `src/app/api/chat/route.ts`

Flow:

1. validate incoming message
2. retrieve top context chunks from local KB (`retrieveContext`)
3. optionally pre-trigger web search for certain keywords
4. call DeepSeek with system prompt + context + optional tool definition (`search_web`)
5. if tool call is requested, execute Tavily search and run a second DeepSeek call
6. persist user/assistant messages to DB if `DATABASE_URL` is set
7. return `{ text }`

Also includes fallback parsing for occasional DeepSeek DSML tool-call leakage.

### WhatsApp Webhook (`POST /api/whatsapp/webhook`)

File: `src/app/api/whatsapp/webhook/route.ts`

Flow:

1. read Twilio form payload (`From`, `Body`, `NumMedia`)
2. reject invalid input, handle media-only messages gracefully
3. create/find chat by `userId = phone number`
4. load recent history from DB
5. run same DeepSeek + tool-call pattern
6. save assistant message
7. send reply through Twilio API

### System Prompt

- File: `src/lib/ai-config.ts`
- Encodes strong identity/tone/behavior rules for "Virtual Tresor."

## RAG / Knowledge Retrieval

- Knowledge base: `src/lib/Knowledge/velamini-kb.ts`
- Retriever: `src/lib/rag/retriever.ts`
- Current method:
- text chunking with overlap
- keyword frequency scoring against normalized query
- top-k chunk injection into prompt as `SOURCE N`

## Database Models (Prisma)

File: `prisma/schema.prisma`

Main models:

- `Chat`
- `Message`
- `Feedback`
- `TrainingExample`
- NextAuth models: `User`, `Account`, `Session`, `VerificationToken`

Notes:

- web and WhatsApp can both write to `Chat` + `Message`
- WhatsApp maps `Chat.userId` to sender phone number

## API Endpoints

- `POST /api/chat` -> AI response
- `POST /api/feedback` -> save user feedback
- `POST /api/training` -> save training examples from edited/rated responses
- `POST /api/whatsapp/webhook` -> Twilio incoming WhatsApp handler
- `GET|POST /api/auth/[...nextauth]` -> NextAuth handlers

## Authentication and Access Control

Files:

- `src/auth.ts`
- `src/auth.config.ts`
- `src/middleware.ts`

Behavior:

- Google OAuth provider via NextAuth
- custom sign-in page: `/auth/signin`
- middleware protects app routes globally except static/api
- callback logic intends to protect `/dashboard` and `/training`

Important routing note:

- current app folder is `/Dashboard` (uppercase `D`)
- auth callback checks `/dashboard` (lowercase)
- normalize this to one casing if you want strict consistency

## Environment Variables

Required for full functionality:

- `DATABASE_URL` - PostgreSQL connection string
- `DEEPSEEK_API_KEY` - DeepSeek API key
- `AUTH_SECRET` - NextAuth secret
- `GOOGLE_CLIENT_ID` - Google OAuth client id
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

Optional features:

- `TAVILY_API_KEY` - enables web search tool
- `TWILIO_ACCOUNT_SID` - WhatsApp send support
- `TWILIO_AUTH_TOKEN` - WhatsApp send support
- `TWILIO_PHONE_NUMBER` - WhatsApp sender number (example: `whatsapp:+14155238886`)

## Local Development

1. Install dependencies

```bash
npm install
```

2. Configure `.env.local`

```env
DATABASE_URL=...
DEEPSEEK_API_KEY=...
AUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
TAVILY_API_KEY=... # optional
TWILIO_ACCOUNT_SID=... # optional
TWILIO_AUTH_TOKEN=... # optional
TWILIO_PHONE_NUMBER=... # optional
```

3. Push Prisma schema

```bash
npx prisma db push
```

4. Run dev server

```bash
npm run dev
```

5. Open app

- `http://localhost:3000/`

## Build and Production

Build:

```bash
npm run build
```

Start:

```bash
npm run start
```

Lint:

```bash
npm run lint
```

## Deployment (Vercel)

1. push repo to GitHub
2. import into Vercel
3. set all required environment variables in Vercel project settings
4. deploy
5. run schema sync against production DB:

```bash
npx prisma db push
```

## Project Structure (High Level)

```txt
src/
  app/
    api/
      auth/[...nextauth]/route.ts
      chat/route.ts
      feedback/route.ts
      training/route.ts
      whatsapp/webhook/route.ts
    auth/signin/page.tsx
    Dashboard/page.tsx
    training/page.tsx
    page.tsx
    layout.tsx
  components/
    chat-ui/
    training-ui/
    Sidebar.tsx
    ChatPanel.tsx
  lib/
    ai-config.ts
    prisma.ts
    search.ts
    whatsapp.ts
    rag/retriever.ts
    Knowledge/velamini-kb.ts
prisma/
  schema.prisma
```

## Current Status

- Chat, feedback, and training data APIs are wired.
- Auth is implemented with Google provider.
- Sidebar/dashboard shell exists and is actively being styled.
- Dashboard content is currently a placeholder block and can be expanded.
