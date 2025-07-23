# PipelinePro OS - AI Features Setup Guide

## Overview
This guide helps you set up the AI-powered features in PipelinePro OS, including automated customer communication, pre-qualification, and document requests.

## Required Environment Variables

Add these to your `.env` file:

```bash
# OpenRouter AI Configuration
OPENROUTER_API_KEY="your-openrouter-api-key"

# Email Service Configuration (choose one)
EMAIL_PROVIDER="sendgrid" # or "ses", "smtp"
SENDGRID_API_KEY="your-sendgrid-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# Webhook URLs (for production)
WEBHOOK_SECRET="your-webhook-secret"
```

## AI Features

### 1. AI-Powered Outreach
- Generate personalized initial outreach messages
- Support for Email, SMS, and LinkedIn messages
- Real-time AI conversations with prospects

### 2. Automated Pre-Qualification
- Dynamic qualification questions based on industry
- AI analysis of responses
- Automatic scoring and qualification status

### 3. Intelligent Document Requests
- Generate customized document request messages
- Track document status
- Automated follow-ups

### 4. Two-Way Communication
- Handle incoming emails/messages via webhooks
- AI-powered automatic responses
- Conversation history tracking

## Database Migration

Run the migration to add AI fields:

```bash
npx prisma migrate dev
```

## Email Service Setup

### SendGrid
1. Create a SendGrid account
2. Generate an API key
3. Set up webhook URL: `https://yourdomain.com/api/webhooks/email`
4. Configure inbound parse webhook for incoming emails

### Webhook Configuration
Point your email service webhooks to:
- Email events: `/api/webhooks/email`
- Incoming messages: `/api/webhooks/incoming-message`

## Usage

### In the Outreach Page
1. Click on a prospect
2. Select "AI Outreach"
3. Choose between generating a message or starting a conversation
4. Review and send

### In the Qualification Page
1. Select a prospect
2. Click "Start AI Qualification"
3. The AI will guide through the qualification process
4. Review the qualification score and recommendations

### In the Documents Page
1. After qualification, click "Request Documents"
2. Select required documents
3. Generate or customize the request message
4. Send to prospect

## API Endpoints

- `POST /api/ai/communication` - AI communication actions
- `POST /api/webhooks/email` - Email service webhooks
- `POST /api/webhooks/incoming-message` - Incoming message handler

## Testing

1. Test AI generation:
```bash
curl -X POST /api/ai/communication \
  -H "Content-Type: application/json" \
  -d '{"action": "generateInitialOutreach", "prospectId": "xxx"}'
```

2. Test webhook locally:
Use ngrok or similar to expose local webhooks for testing

## Security Notes

- Never commit API keys to version control
- Use webhook signatures to verify incoming requests
- Implement rate limiting for AI endpoints
- Monitor AI usage and costs

## Troubleshooting

### AI not generating responses
- Check OPENROUTER_API_KEY is set correctly
- Verify you have credits in your OpenRouter account
- Check console for error messages

### Emails not sending
- Verify email service credentials
- Check sender domain is verified
- Review email service logs

### Webhooks not working
- Ensure webhook URLs are publicly accessible
- Verify webhook signatures
- Check webhook logs in your email service dashboard