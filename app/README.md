# PipelinePro OS - Multi-Industry Prospect Pipeline with AI

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.7-green)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue)](https://www.postgresql.org/)

A comprehensive prospect management platform designed for business funding brokerages, featuring AI-powered communication, automated pre-qualification, and intelligent document processing.

## 🚀 Features

### Core Functionality
- **Multi-Industry Support**: Manage prospects across 8+ industry categories with tailored configurations
- **Advanced Prospect Search**: Powered by Apify integration with industry-specific search strategies
- **AI-Powered Communication**: Automated outreach and real-time conversations using OpenRouter
- **Intelligent Qualification**: AI-driven pre-qualification with dynamic questioning
- **Document Management**: Automated document requests and submission tracking
- **Analytics Dashboard**: Comprehensive metrics and performance tracking
- **Bulk Operations**: Mass prospect processing and outreach campaigns

### 🤖 AI Features (NEW)
- **Automated Outreach Generation**: AI creates personalized messages for each prospect
- **Two-Way Communication**: Handle incoming emails/messages with AI responses
- **Smart Pre-Qualification**: Dynamic qualification questions based on industry and responses
- **Intelligent Document Requests**: Context-aware document request generation
- **Real-Time AI Chat**: Live conversations with prospects through the portal
- **Lender Submission Preparation**: AI-powered application summaries and recommendations

### Industry Categories Supported
- **Healthcare**: Medical offices, dental practices, veterinary clinics
- **Restaurant & Food Service**: Fast food, casual dining, coffee shops, catering
- **Beauty & Wellness**: Hair salons, spas, massage therapy, beauty supply
- **Automotive Services**: Auto repair, tire shops, car washes, body shops
- **Fitness & Recreation**: Gyms, yoga studios, martial arts, personal training
- **Pet Services**: Veterinary services, grooming, boarding, pet stores
- **Specialty Retail**: Boutique clothing, jewelry, electronics repair, bookstores
- **Business Services**: Accounting, legal, marketing, consulting, real estate

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14.2.28 with App Router
- **Language**: TypeScript 5.2.2
- **UI Library**: React 18.2.0
- **Styling**: Tailwind CSS 3.3.3
- **Component Library**: Radix UI primitives
- **State Management**: Zustand, Jotai
- **Data Fetching**: TanStack React Query, SWR

### Backend
- **Database**: PostgreSQL with Prisma ORM 6.7.0
- **Authentication**: NextAuth.js 4.24.11
- **AI Integration**: OpenRouter API (via OpenAI SDK)
- **Web Scraping**: Apify Client
- **Email Service**: SendGrid/AWS SES/SMTP support

### AI Stack
- **AI Provider**: OpenRouter
- **Models**: 
  - Fast: Meta Llama 3.1 8B (free tier)
  - Balanced: Meta Llama 3.1 70B
  - Quality: Claude 3.5 Sonnet
- **SDK**: OpenAI SDK 5.10.2

## 📋 Prerequisites

- **Node.js** 18.0 or higher
- **PostgreSQL** database server
- **OpenRouter API Key** (for AI features)
- **Apify account** (optional, for live data scraping)
- **Email service account** (SendGrid/SES for email automation)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/tibby007/pipelinepro-os.git
cd pipelinepro-os/app
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Environment Configuration

Create a `.env` file in the `app` directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/pipelinepro_db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# Apify Configuration
APIFY_API_TOKEN="your-apify-api-token"

# Encryption
ENCRYPTION_KEY="your-32-character-encryption-key"

# AI Configuration (Required for AI features)
OPENROUTER_API_KEY="sk-or-v1-your-openrouter-key"

# Email Service (Choose one)
EMAIL_PROVIDER="sendgrid"
SENDGRID_API_KEY="your-sendgrid-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# Webhook Configuration
WEBHOOK_SECRET="your-webhook-secret"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📖 Usage Guide

### AI-Powered Outreach

1. Navigate to the **Outreach** tab
2. Select a prospect and click **"AI Outreach"**
3. Choose between:
   - **Generate Message**: AI creates a personalized outreach
   - **Start Conversation**: Real-time AI chat interface
4. Review, customize, and send

### Automated Pre-Qualification

1. Go to **Qualification** tab
2. Select a prospect
3. Click **"Start AI Qualification"**
4. AI dynamically generates questions based on:
   - Industry type
   - Previous responses
   - Business profile
5. System automatically scores and provides recommendations

### Intelligent Document Requests

1. After qualification, go to **Documents**
2. Click **"Request Documents"**
3. AI generates a customized request based on:
   - Qualification score
   - Industry requirements
   - Missing documents
4. Send via email with tracking

### Two-Way Communication

The system automatically handles incoming messages:
- Email replies trigger AI responses
- Conversations are tracked in the portal
- AI maintains context across interactions
- Human override always available

## 🏗️ Project Structure

```
app/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── ai/                   # AI communication endpoints
│   │   ├── webhooks/             # Email/message webhooks
│   │   └── ...                   # Other API routes
├── components/                   # React components
│   ├── ai-conversation.tsx       # AI chat interface
│   ├── ai-outreach-modal.tsx     # Outreach generation
│   ├── ai-qualification-flow.tsx # Qualification wizard
│   └── ai-document-request.tsx   # Document requests
├── lib/                          # Utilities
│   ├── openrouter.ts            # AI service configuration
│   ├── ai/                      # AI communication services
│   └── email-service.ts         # Email integration
└── hooks/                       # Custom React hooks
    └── use-ai-communication.ts  # AI features hook
```

## 🧪 Testing

### Test Account
- **Email**: `john@doe.com`
- **Password**: `johndoe123`

### AI Feature Testing

1. **Test AI Generation**:
```bash
curl -X POST http://localhost:3000/api/ai/communication \
  -H "Content-Type: application/json" \
  -d '{"action": "generateInitialOutreach", "prospectId": "test-id"}'
```

2. **Test Webhook** (use ngrok for local testing):
```bash
ngrok http 3000
# Configure webhook URL in your email service
```

## 🚀 Deployment

### Production Environment Variables

Add these additional variables for production:

```env
# Production URLs
NEXTAUTH_URL="https://your-domain.com"
WEBHOOK_URL="https://your-domain.com/api/webhooks"

# Email Service Webhooks
SENDGRID_WEBHOOK_URL="https://your-domain.com/api/webhooks/email"
INCOMING_EMAIL_WEBHOOK="https://your-domain.com/api/webhooks/incoming-message"
```

### Email Service Setup

1. **SendGrid**:
   - Create API key with full access
   - Configure Event Webhook URL
   - Set up Inbound Parse for incoming emails

2. **Domain Verification**:
   - Add SPF records
   - Configure DKIM
   - Set up domain authentication

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### AI Not Working
- Verify `OPENROUTER_API_KEY` is set correctly
- Check OpenRouter account has credits
- Review console for API errors

### Emails Not Sending
- Confirm email service credentials
- Verify sender domain is authenticated
- Check email service logs

### Database Issues
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Run `npx prisma migrate reset` if needed

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/tibby007/pipelinepro-os/issues)
- **Documentation**: See [AI_SETUP_GUIDE.md](AI_SETUP_GUIDE.md) for detailed AI setup

---

**PipelinePro OS** - Empowering funding brokers with AI-driven prospect management