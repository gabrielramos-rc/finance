# Finance - Setup Guide

Complete guide to set up all external services and configurations.

## Prerequisites

- [x] Node.js 22+ installed (`node --version`)
- [x] pnpm 9+ installed (`pnpm --version`)
- [x] Git configured
- [x] GitHub account
- [x] Google account (for OAuth)

---

## 1. Supabase Setup

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Configure:
   - **Organization:** Select or create one
   - **Name:** `finance`
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** `South America (São Paulo)` - closest to Brasília
   - **Pricing Plan:** Free tier is sufficient

4. Wait for project to be created (~2 minutes)

### 1.2 Get API Keys

1. Go to **Settings** → **API**
2. Copy these values to `.env.local`:

```env
# Project URL (under "Project URL")
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co

# Anon/Public Key (under "Project API keys")
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (under "Project API keys" - keep secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.3 Get Database Connection String

1. Go to **Settings** → **Database**
2. Scroll to **"Connection string"**
3. Select **"URI"** tab
4. Copy both connections:

```env
# Transaction mode (for app - use connection pooler)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Session mode (for migrations - direct connection)
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

> ⚠️ Replace `[password]` with your database password

### 1.4 Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (already enabled by default)
3. Configure **Google OAuth**:

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. Configure:
   - **Application type:** Web application
   - **Name:** Finance
   - **Authorized JavaScript origins:**
     - `http://localhost:3000`
     - `https://finance.rcconsultech.com`
   - **Authorized redirect URIs:**
     - `https://xxxxxxxxxxxx.supabase.co/auth/v1/callback`
     (Get this from Supabase Auth settings)

6. Copy **Client ID** and **Client Secret**
7. Go back to Supabase → **Authentication** → **Providers** → **Google**
8. Enable and paste Client ID and Client Secret
9. Save

### 1.5 Configure Auth Settings

1. Go to **Authentication** → **URL Configuration**
2. Set:
   - **Site URL:** `https://finance.rcconsultech.com`
   - **Redirect URLs:**
     - `http://localhost:3000/**`
     - `https://finance.rcconsultech.com/**`

### 1.6 Enable Row Level Security (RLS)

After running Prisma migrations, enable RLS on all tables:

```sql
-- Run in Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CreditCard" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Budget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SubscriptionShare" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Installment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Import" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Alert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CategorizeRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserSettings" ENABLE ROW LEVEL SECURITY;

-- Create policies (example for Transaction)
CREATE POLICY "Users can view own transactions" ON "Transaction"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own transactions" ON "Transaction"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own transactions" ON "Transaction"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own transactions" ON "Transaction"
  FOR DELETE USING (auth.uid()::text = "userId");

-- Categories are public (shared across users)
CREATE POLICY "Categories are viewable by all" ON "Category"
  FOR SELECT USING (true);
```

---

## 2. Vercel Setup

### 2.1 Install Vercel CLI

```bash
pnpm add -g vercel
```

### 2.2 Login to Vercel

```bash
vercel login
```

### 2.3 Link Project

```bash
# From project root
vercel link

# Answer prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? finance
# - Directory? ./
```

### 2.4 Configure Environment Variables

```bash
# Add each environment variable
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_CHAT_ID
vercel env add RESEND_API_KEY

# Or add all at once via dashboard
```

**Via Dashboard:**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select **finance** project
3. Go to **Settings** → **Environment Variables**
4. Add all variables from `.env.local`

### 2.5 Configure Domain

1. Go to project **Settings** → **Domains**
2. Add `finance.rcconsultech.com`
3. Configure DNS at your registrar:

```
Type: CNAME
Name: finance
Value: cname.vercel-dns.com
```

Or if using apex domain:
```
Type: A
Name: @
Value: 76.76.21.21
```

### 2.6 Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 3. Telegram Bot Setup

### 3.1 Create Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Follow prompts:
   - **Name:** Finance Alerts
   - **Username:** `finance_rcconsultech_bot` (must be unique)
4. Copy the **token** (looks like `123456789:ABC-DEF...`)

```env
TELEGRAM_BOT_TOKEN=123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
```

### 3.2 Get Your Chat ID

1. Send any message to your new bot
2. Open in browser:
   ```
   https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   ```
3. Find `"chat":{"id":123456789}` in the response
4. Copy the chat ID

```env
TELEGRAM_CHAT_ID=123456789
```

### 3.3 Configure Bot (Optional)

Send these commands to @BotFather:

```
/setdescription
Finance - Personal finance alerts and notifications

/setabouttext
Receive budget alerts, import reminders, and weekly summaries for your personal finances.

/setuserpic
[Upload an icon]
```

### 3.4 Test Bot

```bash
# Test sending a message
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\": \"$TELEGRAM_CHAT_ID\", \"text\": \"✅ Finance bot configured successfully!\"}"
```

---

## 4. Resend (Email) Setup

### 4.1 Create Account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email

### 4.2 Get API Key

1. Go to **API Keys** in dashboard
2. Click **"Create API Key"**
3. Name: `finance-production`
4. Permission: `Full access`
5. Copy the key

```env
RESEND_API_KEY=re_123456789...
```

### 4.3 Configure Domain (Optional but Recommended)

To send from `finance@rcconsultech.com`:

1. Go to **Domains** → **Add Domain**
2. Enter `rcconsultech.com`
3. Add DNS records as instructed:

```
Type: TXT
Name: resend._domainkey
Value: [provided by Resend]

Type: MX (optional, for receiving)
Name: [subdomain or @]
Value: [provided by Resend]
```

4. Wait for verification (~5-10 minutes)

### 4.4 Test Email

```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_123456789...' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "Finance <onboarding@resend.dev>",
    "to": ["elramos12@gmail.com"],
    "subject": "Finance Setup Test",
    "html": "<p>Email configuration successful!</p>"
  }'
```

---

## 5. Local Development Setup

### 5.1 Clone Repository

```bash
git clone git@github.com:rcconsultech/finance.git
cd finance
```

### 5.2 Install Dependencies

```bash
pnpm install
```

### 5.3 Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with all values from steps above.

### 5.4 Setup Database

```bash
# Generate Prisma client
pnpm prisma generate

# Push schema to database
pnpm prisma db push

# Seed initial data (categories)
pnpm prisma db seed

# Verify with Prisma Studio
pnpm prisma studio
```

### 5.5 Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 6. Complete Environment Variables

Here's the complete `.env.local` file:

```env
# =============================================================================
# SUPABASE
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# =============================================================================
# DATABASE
# =============================================================================
DATABASE_URL=postgresql://postgres.[ref]:[pass]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[pass]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres

# =============================================================================
# AUTH
# =============================================================================
NEXTAUTH_SECRET=your-32-char-secret-here
NEXTAUTH_URL=http://localhost:3000

# =============================================================================
# TELEGRAM
# =============================================================================
TELEGRAM_BOT_TOKEN=123456789:ABC-DEF...
TELEGRAM_CHAT_ID=123456789

# =============================================================================
# EMAIL
# =============================================================================
RESEND_API_KEY=re_...
EMAIL_FROM=Finance <finance@rcconsultech.com>

# =============================================================================
# APP
# =============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 7. Verification Checklist

Run through this checklist to verify everything is configured:

### Supabase
- [ ] Project created in São Paulo region
- [ ] API keys copied to `.env.local`
- [ ] Database connection string works
- [ ] Google OAuth configured
- [ ] Redirect URLs set correctly

### Vercel
- [ ] CLI installed and logged in
- [ ] Project linked
- [ ] Environment variables added
- [ ] Domain configured (DNS propagated)
- [ ] Test deployment successful

### Telegram
- [ ] Bot created with BotFather
- [ ] Token saved to `.env.local`
- [ ] Chat ID obtained
- [ ] Test message sent successfully

### Resend
- [ ] Account created
- [ ] API key generated
- [ ] Domain verified (optional)
- [ ] Test email sent successfully

### Local Development
- [ ] Dependencies installed
- [ ] `.env.local` configured
- [ ] Prisma client generated
- [ ] Database schema pushed
- [ ] Seed data inserted
- [ ] Dev server runs without errors
- [ ] Can access http://localhost:3000

---

## 8. Troubleshooting

### Database Connection Fails

```
Error: Can't reach database server
```

**Solution:**
1. Check DATABASE_URL has correct password
2. Verify Supabase project is active (not paused)
3. Check if IP is allowed (Supabase → Settings → Database → Network)

### Google OAuth Redirect Error

```
Error: redirect_uri_mismatch
```

**Solution:**
1. Verify redirect URI in Google Console matches Supabase callback URL
2. Check Supabase Auth URL Configuration has correct Site URL

### Telegram Bot Not Responding

**Solution:**
1. Verify bot token is correct
2. Make sure you've messaged the bot at least once
3. Check chat ID is from the correct chat
4. Try getting updates again: `https://api.telegram.org/bot<TOKEN>/getUpdates`

### Vercel Build Fails

```
Error: Prisma Client not generated
```

**Solution:**
Add to `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Email Not Sending

**Solution:**
1. If using custom domain, verify DNS records are correct
2. Check API key has full access permission
3. Use `onboarding@resend.dev` as sender for testing

---

## 9. Quick Commands Reference

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run linter

# Database
pnpm prisma generate        # Generate client
pnpm prisma db push         # Push schema changes
pnpm prisma db seed         # Run seed script
pnpm prisma studio          # Open database UI
pnpm prisma migrate dev     # Create migration

# Vercel
vercel                      # Deploy to preview
vercel --prod               # Deploy to production
vercel env pull             # Pull env vars to .env.local
vercel logs                 # View deployment logs

# Testing
pnpm test                   # Run tests
pnpm test:e2e               # Run E2E tests
```

---

## 10. Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Rotate keys** if accidentally exposed
3. **Use environment-specific keys** (dev vs prod)
4. **Enable 2FA** on all services (GitHub, Vercel, Supabase)
5. **Review Supabase RLS policies** before going live

---

*Setup guide last updated: December 2025*
