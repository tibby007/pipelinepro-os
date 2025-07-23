# PipelinePro OS - Netlify Deployment Guide

## 🚀 Deploying to Netlify

### Prerequisites
1. **GitHub Repository**: Your code should be pushed to GitHub
2. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
3. **Database**: Set up a PostgreSQL database (Supabase, Railway, or similar)
4. **API Keys**: Have your OpenRouter and Apify keys ready

### Step 1: Database Setup

Since Netlify doesn't provide databases, you'll need a hosted PostgreSQL instance:

#### Option A: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your database URL from Settings > Database
4. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

#### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string

#### Option C: Neon
1. Go to [neon.tech](https://neon.tech)
2. Create a database
3. Get the connection string

### Step 2: Netlify Site Setup

1. **Connect Repository**:
   - Log into Netlify
   - Click "New Site from Git"
   - Connect your GitHub account
   - Select your `pipelinepro-os` repository

2. **Build Settings**:
   - **Base directory**: `app`
   - **Build command**: `npm run build`
   - **Publish directory**: `app/.next`

3. **Install Netlify Next.js Plugin**:
   The `netlify.toml` file is already configured for this.

### Step 3: Environment Variables

In Netlify Dashboard > Site Settings > Environment Variables, add:

```env
# Database
DATABASE_URL=your-postgresql-connection-string

# NextAuth
NEXTAUTH_URL=https://your-netlify-subdomain.netlify.app
NEXTAUTH_SECRET=your-secure-random-string-32-chars-min

# AI Features
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key

# Apify (Optional)
APIFY_API_TOKEN=your-apify-token

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Email Service (if using)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-key
EMAIL_FROM=noreply@yourdomain.com

# Node Environment
NODE_ENV=production
```

### Step 4: Database Migration

After your first successful deployment:

1. **Install Netlify CLI** (if not already installed):
```bash
npm install -g netlify-cli
```

2. **Login and Link**:
```bash
netlify login
netlify link
```

3. **Run Database Migration**:
```bash
netlify env:get DATABASE_URL
DATABASE_URL="your-db-url" npx prisma migrate deploy
```

Or run the migration locally with your production database URL.

### Step 5: Custom Domain (Optional)

1. In Netlify Dashboard > Domain Settings
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXTAUTH_URL` to your custom domain

### Step 6: Webhook Configuration

For AI features to work with incoming emails:

1. **Get your site URL**: `https://your-site.netlify.app`
2. **Configure Email Service Webhooks**:
   - SendGrid: `https://your-site.netlify.app/api/webhooks/email`
   - Incoming: `https://your-site.netlify.app/api/webhooks/incoming-message`

### Step 7: Test the Deployment

1. Visit your Netlify URL
2. Try logging in with: `john@doe.com` / `johndoe123`
3. Test AI features:
   - Generate outreach messages
   - Try the qualification flow
   - Test document requests

## 🔧 Troubleshooting

### Build Errors

**Prisma Generate Error**:
```bash
# If build fails on Prisma
# Add to netlify.toml:
[build.environment]
  PRISMA_CLI_BINARY_TARGETS = "native,rhel-openssl-1.0.x"
```

**Type Errors**:
- Check TypeScript configuration
- Ensure all imports are correct

### Runtime Errors

**Database Connection**:
- Verify `DATABASE_URL` is correct
- Ensure database is accessible from Netlify
- Check if migrations are applied

**API Routes Not Working**:
- Verify `netlify.toml` is configured correctly
- Check function logs in Netlify dashboard

**AI Features Not Working**:
- Verify `OPENROUTER_API_KEY` is set
- Check OpenRouter account has credits
- Review function logs for errors

### Performance Optimization

1. **Enable Build Cache**:
   - In Netlify dashboard, enable dependency caching

2. **Optimize Bundle**:
   - Large dependencies might cause function size limits
   - Consider code splitting for AI features

3. **Database Optimization**:
   - Use connection pooling
   - Consider adding database indexes

## 🔄 Continuous Deployment

Once set up, every push to your main branch will automatically deploy:

1. Push changes to GitHub
2. Netlify automatically builds and deploys
3. Check the deploy logs for any issues

## 📊 Monitoring

1. **Function Logs**: Check Netlify Functions logs for errors
2. **Analytics**: Enable Netlify Analytics for usage stats
3. **Performance**: Monitor Core Web Vitals in Netlify dashboard

## 🛡️ Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **Database Access**: Use connection pooling and SSL
3. **API Keys**: Rotate keys regularly
4. **Webhook Security**: Implement webhook signature verification

## 💰 Cost Considerations

- **Netlify**: Free tier includes 100GB bandwidth, 300 build minutes
- **Database**: Supabase free tier includes 500MB database
- **OpenRouter**: Pay-per-use AI API calls
- **Email Service**: SendGrid free tier includes 100 emails/day

## 🚀 Going Live Checklist

- [ ] Database created and URL configured
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Custom domain configured (if using)
- [ ] Email service webhooks configured
- [ ] Test account works
- [ ] AI features tested
- [ ] Email notifications working
- [ ] Webhook endpoints responding

Your PipelinePro OS should now be live and ready for business!