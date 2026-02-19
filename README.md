# Velamini - AI-Powered Virtual Assistants Platform

Velamini is a Next.js platform that enables:
- **Individuals** to create AI-powered "virtual selves" (digital twins) trained with their personal knowledge and personality
- **Organizations** to deploy AI-powered WhatsApp customer support without any technical setup

## 🌟 Key Features

### For Personal Accounts
- **Virtual Self Creation**: Train an AI with your personality, knowledge, and experiences
- **Shareable Virtual Assistants**: Share your virtual self via unique links
- **AI-Powered Chat**: Natural conversations powered by DeepSeek AI
- **Knowledge Retrieval**: RAG-style context injection from your knowledge base
- **Web Search Integration**: Real-time information through Tavily API
- **Multi-Channel Support**: Web interface and chat sharing

### For Organization Accounts
- **WhatsApp Number Provisioning**: Get dedicated WhatsApp business numbers (via Twilio - no Twilio account needed!)
- **AI Customer Support**: 24/7 automated responses trained on your business knowledge
- **Number Management**: Search, provision, configure, and release numbers through our dashboard
- **Analytics Dashboard**: Track conversations, message usage, and customer interactions
- **Business Hours**: Configure automatic responses outside business hours
- **Usage Monitoring**: Track message limits and usage statistics
- **No Technical Setup**: We handle all Twilio infrastructure for you

## 📋 Documentation

- **[Complete Documentation](docs/README.md)** - Full platform overview and architecture
- **[User Guide](docs/USER_GUIDE.md)** - Step-by-step guide for personal and organization accounts
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[WhatsApp Organizations Feature](WHATSAPP_ORGANIZATIONS.md)** - Organization account implementation details

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18.0.0
PostgreSQL database
Twilio account (for WhatsApp features)
DeepSeek API key
Google OAuth credentials (optional)
```

### Installation

1. **Clone and Install**
   ```bash
   git clone https://github.com/yourusername/velamini.git
   cd velamini/velamini-front
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/velamini"

   # Authentication
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Twilio WhatsApp
   TWILIO_ACCOUNT_SID="your-twilio-account-sid"
   TWILIO_AUTH_TOKEN="your-twilio-auth-token"
   TWILIO_PHONE_NUMBER="whatsapp:+14155238886"

   # AI
   DEEPSEEK_API_KEY="your-deepseek-api-key"

   # App
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Set Up Database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   ```
   http://localhost:3000
   ```

## 🏗️ Tech Stack

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

- **Route**: `/`
- **Component**: `src/components/ChatPanel.tsx`
- **Features**:
  - Persistent chat history in localStorage
  - Real-time AI responses
  - Feedback modal for user ratings
  - Message editing and improvement suggestions

### 2. Dashboard (Authenticated)

- **Route**: `/Dashboard`
- **Component**: `src/app/Dashboard/page.tsx`
- **Features**:
  - Overview statistics (training completion, Q&A pairs, knowledge items)
  - Navigation to Training, Chat, Profile, and Settings
  - Dark themed sidebar with workspace navigation
  - Real-time training progress tracking

### 3. Virtual Self Training Wizard (Authenticated)

- **Route**: `/Dashboard` → Training section
- **Component**: `src/components/dashboard/training.tsx`
- **7-Step Process**:
  1. **Identity**: Name, birth info, location, languages, bio, relationship status, hobbies, favorite food
  2. **Education**: Schools, degrees, certifications
  3. **Experience**: Work history, roles, responsibilities
  4. **Skills**: Technical and soft skills, proficiencies
  5. **Projects**: Portfolio projects, descriptions, links
  6. **Awards**: Achievements, recognitions, honors
  7. **Social**: Social media links, recent updates
- **Features**:
  - Progress indicator showing completed steps
  - Auto-save functionality
  - Step-by-step navigation
  -Virtual Self Training System

### How It Works

#### **Phase 1: Data Collection**
Users fill out a comprehensive 7-step wizard capturing:
- Personal identity information
- Educational background
- Professional experience
- Technical and soft skills
- Portfolio projects
- Awards and achievements
- Social media presence and updates

All data is stored in the `KnowledgeBase` table with auto-save functionality.

#### **Phase 2: Model Training**
When the user clicks "Train Your Model Now":

1. **Data Formatting**: The `formatKnowledgeBasePrompt()` function converts raw database fields into structured sections:
   ```
   # Identity
   Name: John Doe
   Birth: January 1, 1990
   Location: New York, USA
   ...

   # Education
   Harvard University - Bachelor in Computer Science
   ...

   # Experience
   Google (2020-Present) - Senior Software Engineer
   ...
   ```

2. **Storage**: The formatted prompt is saved as `trainedPrompt` in the database

3. **Activation**: 
   - `isModelTrained` flag set to `true`
   - `lastTrainedAt` timestamp recorded

#### **Phase 3: AI Integration**
WhenPersonal Chat API (`POST /api/chat`)

File: `src/app/api/chat/route.ts`

Flow:

1. Check if user is authenticated
2. If authenticated, fetch their `trainedPrompt` from KnowledgeBase
3. Retrieve top context chunks from local KB (`retrieveContext`)
4. Optionally pre-trigger web search for certain keywords
5. Append user's trained knowledge to system prompt
6. Call DeepSeek with enhanced system prompt + context + optional tool definition (`search_web`)
7. If tool call is requested, execute Tavily search and run a second DeepSeek call
8. Persist user/assistant messages to DB with user context
9. Return `{ text }`

### Shared Chat API (`POST /api/chat/shared`)

File: `src/app/api/chat/shared/route.ts`

Flow:

1. Validate `virtualSelfId` parameter
2. Fetch virtual self's `trainedPrompt` from KnowledgeBase
3. Verify `isPubliclyShared` and `isModelTrained` flags
4. Append virtual self's knowledge to system prompt
5. Call DeepSeek API with personalized prompt
6. Save chat to database with `virtualSelfId` and `isSharedChat = true`
7. Return AI response

### Chat API (`POs

**Base System Prompt**
- File: `src/lib/ai-config.ts`
- Export: `VIRTUAL_SELF_SYSTEM_PROMPT`
- Dynamic and adaptable to any user's virtual self
- Enforces natural, first-person responses
- Prohibits robotic phrases like "Based on..." or "According to..."
- Maintains personality consistency

**User-Specific Enhancement**
When authenticated user chats or when someone accesses a shared virtual self:
```
VIRTUAL_SELF_SYSTEM_PROMPT + "\n\nUSER'S PERSONAL KNOWLEDGE BASE:\n" + trainedPrompt
```

This creates a unique AI personality for each user.
3. DeepSeek API receives the combined prompt
4. AI responds as the person, using their knowledge

### Training API

**Endpoint**: `POST /api/training/train`

**Process**:
- Validates user authentication
- Retrieves user's KnowledgeBase
- Formats data into structured sections
- Updates database with trained prompt
- Returns success confirmation

## Sharing System

### How Sharing Works

1. **Enable Sharing** (Settings page):
   - User creates a unique slug (e.g., "john-doe", "tech-expert")
   - Slug validation: lowercase letters, numbers, hyphens only
   - Check for uniqueness in database

2. **Share Link Generation**:
   - Format: `https://yoursite.com/chat/your-slug`
   - Stored in `KnowledgeBase.shareSlug`
   - `isPubliclyShared` flag enabled

3. **Public Access**:
   - Anyone with the link can visit `/chat/[slug]`
   - Page loads the  virtual self's information
   - View count increments automatically
   - Chat interface branded with owner's name and avatar

4. **Privacy Controls**:
   - Owner can disable sharing anytime
   - Disabling preserves slug but blocks public access
   - Re-enabling uses the same slug

### Sharing API

**Enable Sharing**: `POST /api/share/enable`
```json
{
  "shareSlug": "your-custom-slug"
}
```

**Disable Sharing**: `POST /api/share/disable`

**Response**: Returns shareable URL and configurationr Model Now" button upon completion

### 4. Virtual Self Chat (Private)

- **Route**: `/Dashboard` → Chat section
- **Component**: `src/components/dashboard/dashboardchat.tsx`
- **Features**:
  - Chat with your own trained virtual self
  - Separate chat history from public chat
  - Powered by your personal knowledge base
  - Real-time AI responses using your trained prompt

### 5. Shared Virtual Self Chat (Public)

- **Route**: `/chat/[slug]`
- **Component**: `src/app/chat/[slug]/page.tsx` + `src/components/SharedChatClient.tsx`
- **Features**:
  - Public access to someone's virtual self via unique slug
  - View count tracking
  - Branded chat interface with owner's name and image
  - Separate chat history per virtual self

### 6. Settings & Sharing Management

- **Route**: `/Dashboard` → Settings section
- **Component**: `src/components/dashboard/settings.tsx`
- **Features**:
  - Enable/disable public sharing
  - Create custom share slug (e.g., "john-doe", "your-name")
  - Copy shareable link with one click
  - View access statistics (view count)
  - Account information display

### 7. Sign-in Portal

- **Route**: `/auth/signin`
- **Features**:
  - Google OAuth sign-in
  - Callback URL preservation for post-login redirects
  - Suspense boundary for proper SSR handling

## AI Pipeline

### Chat API (`POST /api/chat`)

File: `src/app/api/chat/route.ts`

Flow:
### Main Models:

#### **Chat**
```prisma
{
  id: String             # Unique chat ID
  userId: String?        # Chat initiator (can be WhatsApp number or null)
  virtualSelfId: String? # ID of user whose virtual self is being chatted with
  isSharedChat: Boolean  # True if this is a public shared virtual self chat
  messages: Message[]    # Related messages
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Chat Endpoints
- `POST /api/chat` → AI response with user's trained knowledge (authenticated)
- `POST /api/chat/shared` → AI response for shared virtual self (public)

### Training Endpoints
- `GET /api/training` → Fetch user's knowledge base
- `Key Features

✅ **Virtual Self Creation**
- 7-step comprehensive training wizard
- Capture identity, education, experience, skills, projects, awards, and social information
- Auto-save functionality for each field
- Progress tracking with visual indicators

✅ **AI-Powered Conversations**
- Chat with your own trained virtual self privately
- AI responds using your personal knowledge and style
- Context-aware responses based on training data
- Web search integration for real-time information

✅ **Public Sharing**
- Generate unique shareable links (yoursite.com/chat/your-slug)
- Custom slug creation with validation
- Enable/disable sharing anytime
- Track view counts and access statistics
- Branded chat interface for each virtual self

✅ **Multi-User Support**
- Each user can create their own virtual self
- Separate knowledge bases per user
- Private and public chat modes
- User authentication with Google OAuth

✅ **Database Persistence**
- All chats saved with ownership tracking
- Training data securely stored
- Share configuration management
- Access analytics and metrics

✅ **Responsive Design**
- Dark themed dashboard with navigation sidebar
- Mobile-friendly chat interface
- Real-time message updates
- Smooth animations and transitions

## POST /api/training` → Save/update knowledge base fields
- `POST /api/training/train` → Train model with current knowledge

### Sharing Endpoints
- `POST /api/share/enable` → Enable public sharing with custom slug
- `POST /api/share/disable` → Disable public sharing

### Feedback & Data
- `POST /api/feedback` → Save user feedback (ratings, comments)

### WhatsApp Integration
- `POST /api/whatsapp/webhook` → Twilio incoming WhatsApp handler

### Authentication
- `GET|POST /api/auth/[...nextauth]` → NextAuth handlers (Google OAuth)

  # Identity Fields
  fullName: String?
  birthDate: String?
  birthPlace: String?
  currentLocation: String?
  languages: String?
  bio: String?
  relationshipStatus: String?
  hobbies: String?
  favoriteFood: String?

  # Structured Content
  education: String?     # Text or JSON
  experience: String?    # Text or JSON
  skills: String?        # Text or JSON
  projects: String?      # Text or JSON
  awards: String?        # Text or JSON
  socialLinks: String?   # Text or JSON
  socialUpdates: String? # Text or JSON

  # Training Status
  isModelTrained: Boolean      # Whether model has been trained
  trainedPrompt: String?       # Formatted prompt for AI
  lastTrainedAt: DateTime?     # Last training timestamp

  # Sharing Configuration
  shareSlug: String?           # Unique URL slug (e.g., "john-doe")
  isPubliclyShared: Boolean    # Public access toggle
  shareViews: Int              # Access count tracker

  createdAt: DateTime
  updatedAt: DateTime
}
```

#### **Message**
```prisma
{
  id: String
  chatId: String         # Foreign key to Chat
  role: String           # "user" or "assistant"
  content: String        # Message text
  createdAt: DateTime
}
```

#### **Feedback**
```prisma
{
  id: String
  rating: Int            # User rating
  comment: String?       # Optional feedback text
  createdAt: DateTime
}
```

#### **User** (NextAuth)
```prisma
{
  id: String
  name: String?
  email: String?
  emailVerified: DateTime?
  image: String?
  accounts: Account[]
  sessions: Session[]
  knowledgeBase: KnowledgeBase?    # One-to-one relation
  virtualSelfChats: Chat[]         # Chats where this user's virtual self is used
}
```

### Relations:

- `User` ↔ `KnowledgeBase`: One-to-one
- `User` ↔ `Chat`: One-to-many (via `virtualSelfChats`)
- `Chat` ↔ `Message`: One-to-many
- `Chat` ↔ `User`: Many-to-one (via `virtualSelfId`)

### Notes:

- Web and WhatsApp both write to `Chat` + `Message`
- WhatsApp maps `Chat.userId` to sender phone number
- Shared chats use `virtualSelfId` to track whose AI is being used
- `shareSlug` must be unique across all users

File: `src/app/api/whatsapp/webhook/route.ts`

Flow:

1. read Twilio form payload (`Fro      # NextAuth handlers
      chat/
        route.ts                        # Personal/public chat API
        shared/route.ts                 # Shared virtual self chat API
      feedback/route.ts                 # User feedback collection
      training/
        route.ts                        # Knowledge base CRUD
        train/route.ts                  # Model training endpoint
      share/
        enable/route.ts                 # Enable public sharing
        disable/route.ts                # Disable public sharing
      whatsapp/webhook/route.ts         # WhatsApp integration
    auth/signin/page.tsx                # Sign-in page
    chat/[slug]/page.tsx                # Public shared chat page
    Dashboard/page.tsx                  # Main dashboard
    logout/page.tsx                     # Logout handler
    page.tsx                            # Home/public chat
    layout.tsx                          # Root layout
  components/
    chat-ui/                            # Chat interface components
      ChatInput.tsx
      ChatNavbar.tsx
      FeedbackModal.tsx
      HeroSection.tsx
      MessageList.tsx
    dashboard/                          # Dashboard components
      dashboard.tsx                     # Overview/stats
      dashboardchat.tsx                 # Private virtual self chat
      DashboardWrapper.tsx              # Layout wrapper
      profile.tsx                       # User profile
      settings.tsx                      # Settings & sharing
      Sidebar.tsx                       # Navigation sidebar
      training.tsx                      # 7-step training wizard
      types.ts                          # TypeScript definitions
    ChatPanel.tsx                       # Main public chat component
    SharedChatClient.tsx                # Public shared chat client
  lib/
    ai-config.ts                        # System prompts
    prisma.ts                           # Prisma client
    search.ts                           # Tavily web search
    whatsapp.ts                         # Twilio integration
    utils.ts                            # Utility functions
    rag/
      retriever.ts                      # Knowledge retrieval
    Knowledge/
  types/
    next-auth.d.ts                      # NextAuth type extensions
  auth.ts                               # NextAuth configuration
  auth.config.ts                        # Auth middleware config
  middleware.ts                         # Route protection
prisma/
  schema.prisma                         # Database schema
```

## Current Status & Roadmap

### ✅ Completed Features
- Virtual self training system (7-step wizard)
- AI model training with user knowledge
- Private virtual self chat in dashboard
- Public sharing with custom slugs
- Shared virtual self public chat pages
- User authentication (Google OAuth)
- Database persistence for all features
- Settings page with sharing controls
- View count tracking
- Dashboard navigation and stats

### 🚧 In Progress
- Enhanced analytics and insights
- Export/import training data
- Multiple AI model support
- Advanced customization options

### 📋 Planned Features
- Voice interaction support
- File/document upload for training
- Conversation history export
- API access for developers
- Team collaboration features
- White-label deployment options
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
prisma/
  schema.prisma
```

## Current Status

- Chat, feedback, and training data APIs are wired.
- Auth is implemented with Google provider.
- Sidebar/dashboard shell exists and is actively being styled.
- Dashboard content is currently a placeholder block and can be expanded.
