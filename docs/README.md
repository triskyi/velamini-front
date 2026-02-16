# Velamini Platform - Complete Documentation

## 📚 Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [API Documentation](#api-documentation)
5. [Features](#features)
6. [Deployment](#deployment)
7. [Contributing](#contributing)

---

## 🎯 Introduction

**Velamini** is a revolutionary platform that enables:
- **Individuals** to create their virtual selves (digital twins) with AI
- **Organizations** to deploy AI-powered WhatsApp customer support

### Key Features

- 🤖 **AI-Powered Virtual Assistants** using DeepSeek/GPT models
- 📱 **WhatsApp Integration** via Twilio
- 🎓 **Knowledge Base Training** for personalized AI responses
- 📊 **Analytics & Insights** for organizations
- 🔒 **Secure Authentication** via NextAuth
- 🎨 **Beautiful UI** with Tailwind CSS and dark mode

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18.0.0
PostgreSQL database
Twilio account (for WhatsApp)
DeepSeek API key
Google OAuth credentials (optional)
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/velamini.git
   cd velamini/velamini-front
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure `.env` file**
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/velamini"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Twilio WhatsApp
   TWILIO_ACCOUNT_SID="your-twilio-account-sid"
   TWILIO_AUTH_TOKEN="your-twilio-auth-token"
   TWILIO_PHONE_NUMBER="whatsapp:+14155238886"

   # AI Configuration
   DEEPSEEK_API_KEY="your-deepseek-api-key"

   # App Configuration
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

5. **Set up database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   ```
   Open http://localhost:3000
   ```

---

## 🏗️ Architecture

### Tech Stack

#### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **NextAuth** - Authentication

#### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - ORM for database
- **PostgreSQL** - Database

#### External Services
- **Twilio** - WhatsApp messaging
- **DeepSeek API** - AI responses
- **Google OAuth** - Social login

### Directory Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── organizations/ # Organization management
│   │   ├── whatsapp/     # WhatsApp webhook
│   │   ├── training/     # AI training
│   │   └── user/         # User management
│   ├── Dashboard/        # Dashboard pages
│   │   └── organizations/# Organization dashboard
│   ├── onboarding/       # Onboarding flow
│   └── auth/             # Authentication pages
├── components/           # React components
│   ├── dashboard/       # Dashboard components
│   └── chat-ui/         # Chat interface
├── lib/                 # Utilities and configs
│   ├── twilio.config.ts# Twilio configuration
│   ├── twilio-provisioning.ts # Number provisioning
│   ├── prisma.ts       # Database client
│   └── ai-config.ts    # AI system prompts
└── types/              # TypeScript type definitions

prisma/
└── schema.prisma       # Database schema

docs/
├── api/                # Auto-generated API docs
└── guides/             # User guides
```

### Database Schema

See [prisma/schema.prisma](../prisma/schema.prisma) for complete schema.

**Key Models:**
- `User` - User accounts (personal or organization)
- `Organization` - Organization profiles with WhatsApp config
- `KnowledgeBase` - AI training data
- `Chat` - Conversation histories
- `Message` - Individual messages

---

## 📖 API Documentation

### Authentication

All API routes require authentication except:
- `POST /api/auth/signin`
- `POST /api/whatsapp/webhook` (Twilio webhook)

**Authentication Method:** NextAuth session-based

### User Management

#### Complete Onboarding
```typescript
POST /api/user/onboarding
Body: {
  accountType: "personal" | "organization"
  organizationName?: string  // Required if accountType is "organization"
  industry?: string
}
Response: {
  ok: boolean
  user: { accountType: string, onboardingComplete: boolean }
}
```

#### Get Onboarding Status
```typescript
GET /api/user/onboarding
Response: {
  ok: boolean
  user: { accountType: string, onboardingComplete: boolean }
}
```

### Organization Management

#### List Organizations
```typescript
GET /api/organizations
Response: {
  ok: boolean
  organizations: Organization[]
}
```

#### Create Organization
```typescript
POST /api/organizations
Body: {
  name: string
  description?: string
  industry?: string
  website?: string
  contactEmail?: string
}
Response: {
  ok: boolean
  organization: Organization
}
```

#### Get Organization Details
```typescript
GET /api/organizations/[id]
Response: {
  ok: boolean
  organization: Organization & {
    knowledgeBase?: KnowledgeBase
    _count: { chats: number }
  }
}
```

#### Update Organization
```typescript
PATCH /api/organizations/[id]
Body: Partial<Organization>
Response: {
  ok: boolean
  organization: Organization
}
```

#### Delete Organization
```typescript
DELETE /api/organizations/[id]
Response: {
  ok: boolean
  message: string
}
```

### WhatsApp Number Management

#### Search Available Numbers
```typescript
GET /api/organizations/search-numbers?country=US&areaCode=415
Response: {
  ok: boolean
  numbers: Array<{
    phoneNumber: string
    friendlyName: string
    capabilities: { voice: boolean, SMS: boolean, MMS: boolean }
  }>
  total: number
}
```

#### Provision Number
```typescript
POST /api/organizations/[id]/provision-number
Body: {
  phoneNumber: string  // E.164 format (e.g., "+14155551234")
}
Response: {
  ok: boolean
  organization: Organization
  message: string
}
```

#### Release Number
```typescript
DELETE /api/organizations/[id]/provision-number
Response: {
  ok: boolean
  organization: Organization
  message: string
}
```

#### Get Number Details
```typescript
GET /api/organizations/[id]/number
Response: {
  ok: boolean
  number: {
    phoneNumber: string
    displayName?: string
    sid: string
    twilioDetails: object
  }
}
```

#### Update Number Configuration
```typescript
PATCH /api/organizations/[id]/number
Body: {
  displayName?: string
  friendlyName?: string
}
Response: {
  ok: boolean
  organization: Organization
  message: string
}
```

### Analytics

#### Get Organization Statistics
```typescript
GET /api/organizations/[id]/stats
Response: {
  ok: boolean
  stats: {
    totalConversations: number
    totalMessages: number
    monthlyMessageCount: number
    monthlyMessageLimit: number
    usagePercentage: number
    recentConversations: Array<{
      id: string
      userId: string
      lastMessage: string
      lastMessageAt: Date
    }>
  }
}
```

### AI Training

#### Save Knowledge Base
```typescript
POST /api/training
Body: {
  fullName?: string
  bio?: string
  education?: string
  experience?: string
  skills?: string
  projects?: string
  // ... other fields
}
Response: {
  ok: boolean
  knowledgeBase: KnowledgeBase
}
```

#### Get Knowledge Base
```typescript
GET /api/training
Response: {
  ok: boolean
  knowledgeBase: KnowledgeBase | null
}
```

#### Train AI Model
```typescript
POST /api/training/train
Response: {
  ok: boolean
  message: string
  trainedAt: string
}
```

### WhatsApp Webhook

#### Receive Messages
```typescript
POST /api/whatsapp/webhook
Content-Type: application/x-www-form-urlencoded
Body: {
  From: string      // Sender (whatsapp:+1234567890)
  To: string        // Receiver (your WhatsApp number)
  Body: string      // Message text
  NumMedia?: string // Number of media files
}
Response: TwiML XML
```

---

## 🎨 Features

### Personal Account Features

1. **Virtual Self Creation**
   - Train AI with personal information
   - Customize personality and knowledge
   - Share virtual self via unique link

2. **Knowledge Base**
   - Identity (name, bio, location)
   - Education history
   - Work experience
   - Skills and projects
   - Social links

3. **AI Chat**
   - Chat with own virtual self
   - Chat with others' virtual selves
   - Conversation history

### Organization Account Features

1. **WhatsApp Number Management**
   - Search available numbers by country
   - Provision dedicated WhatsApp numbers
   - Configure display name
   - Release numbers when not needed

2. **AI-Powered Customer Support**
   - 24/7 automated responses
   - Custom business knowledge training
   - Welcome messages for new customers
   - Business hours configuration

3. **Analytics Dashboard**
   - Total conversations tracking
   - Message usage monitoring
   - Recent conversation view
   - Usage limits and alerts

4. **Settings & Configuration**
   - Organization profile
   - Business information
   - Auto-reply settings
   - Business hours scheduling
   - Welcome message customization

---

## 🔧 Configuration

### Twilio Configuration

See [src/lib/twilio.config.ts](../src/lib/twilio.config.ts) for complete configuration options.

**Key Settings:**
```typescript
TWILIO_CONFIG = {
  accountSid: string
  authToken: string
  phoneNumber: string
  webhookUrl: string
  supportedCountries: Country[]
  pricing: {
    numberMonthly: 1.00
    messageCost: 0.005
  }
}
```

### AI Configuration

See [src/lib/ai-config.ts](../src/lib/ai-config.ts) for AI prompts and settings.

**System Prompt Features:**
- First-person personality
- Knowledge base integration
- Web search capabilities
- Natural conversation flow

---

## 🚀 Deployment

### Production Environment Variables

```env
# Database (Use connection pooling)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."  # Direct connection

# Authentication
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-secret-key"

# Twilio
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="whatsapp:+..."

# AI
DEEPSEEK_API_KEY="..."

# App
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to vercel.com
   - Import repository
   - Configure environment variables
   - Deploy

3. **Configure Twilio Webhook**
   ```
   Update webhook URL to:
   https://yourdomain.com/api/whatsapp/webhook
   ```

### Database Migration

```bash
# Run migrations in production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

---

## 🧪 Testing

### Manual Testing

1. **Personal Account Flow**
   - Sign up → Choose Personal → Train AI → Chat

2. **Organization Flow**
   - Sign up → Choose Organization → Create Org → Provision Number → Train AI → Test WhatsApp

### Automated Tests

```bash
# Run tests (to be implemented)
npm test

# Run with coverage
npm run test:coverage
```

---

## 🔒 Security

### Best Practices

1. **Environment Variables**
   - Never commit `.env` to Git
   - Use different keys for dev/prod
   - Rotate secrets regularly

2. **API Security**
   - All routes require authentication
   - Webhook signature validation
   - Rate limiting on sensitive endpoints

3. **Database Security**
   - Use connection pooling
   - Enable SSL in production
   - Regular backups

4. **Twilio Security**
   - Validate webhook signatures
   - Store credentials securely
   - Monitor for unusual activity

---

## 📝 Contributing

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Write JSDoc comments for functions
- Use Prettier for formatting

### Commit Messages

```
feat: Add organization number management
fix: Resolve webhook routing issue
docs: Update API documentation
refactor: Improve Twilio configuration
```

### Pull Request Process

1. Create feature branch
2. Make changes with tests
3. Update documentation
4. Submit PR with description
5. Address review comments
6. Merge after approval

---

## 📞 Support

### Documentation
- [User Guide](./USER_GUIDE.md)
- [API Reference](./api/README.md)
- [Deployment Guide](./DEPLOYMENT.md)

### Community
- GitHub Issues
- Discord Server
- Email: support@velamini.com

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details

---

## 🙏 Acknowledgments

- Next.js team
- Twilio for WhatsApp API
- DeepSeek for AI models
- Prisma team
- All contributors

---

**Built with ❤️ by the Velamini Team**
