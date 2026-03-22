# GalleaBrandVoicePro — Production Deployment Guide

## Step 1: Create a GitHub Account (2 minutes)

1. Go to https://github.com/signup
2. Sign up with your email (jsulpizi@thebrandfactory.com)
3. Choose a username (e.g. "gallea-ai" or "thebrandfactory")
4. Verify your email

## Step 2: Create a New Repository (1 minute)

1. Go to https://github.com/new
2. Repository name: `gallea-brand-voice-pro`
3. Set to **Private**
4. Click "Create repository"
5. Copy the repository URL (e.g. `https://github.com/YOUR-USERNAME/gallea-brand-voice-pro.git`)

## Step 3: Push the Code (2 minutes)

I've prepared the code. You just need to run these commands in a terminal:

```bash
cd gallea-brand-voice-pro
git remote add origin https://github.com/YOUR-USERNAME/gallea-brand-voice-pro.git
git push -u origin master
```

(Replace YOUR-USERNAME with your actual GitHub username)

## Step 4: Deploy on Railway (5 minutes)

1. Go to https://railway.app
2. Click "Login" → "Login with GitHub" (uses the account you just created)
3. Click "New Project" → "Deploy from GitHub Repo"
4. Select `gallea-brand-voice-pro`
5. Railway auto-detects it's a Node.js app and starts deploying

### Set Environment Variables

In Railway dashboard → your project → Variables tab, add:

```
NODE_ENV=production
ANTHROPIC_API_KEY=your-anthropic-api-key
SESSION_SECRET=any-random-string-here

# Optional: OAuth (add when ready)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
```

### Get Your Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign up / sign in
3. Go to API Keys → Create Key
4. Copy the key and paste it as ANTHROPIC_API_KEY in Railway

### Set the Start Command

In Railway → Settings → Deploy:
- Build command: `npm run build`
- Start command: `NODE_ENV=production node dist/index.cjs`

### Get Your Domain

Railway gives you a free `.railway.app` subdomain. In Settings → Networking → "Generate Domain".

Your app will be live at something like: `gallea-brand-voice-pro.railway.app`

You can also add a custom domain (e.g. `app.gallea.ai`) in the same settings panel.

## Costs

- **Railway**: ~$5-20/month depending on usage (generous free tier to start)
- **Anthropic API**: Pay-per-use (~$0.003 per 1K input tokens, ~$0.015 per 1K output tokens)
  - Typical content generation: ~$0.05-0.10 per piece (two LLM calls: generate + score)
  - Brand voice profile generation: ~$0.20 per assessment (one large LLM call)

## Production Considerations

For a real SaaS product, you'll eventually want:

1. **PostgreSQL instead of SQLite** — Railway offers managed Postgres ($5/month). SQLite works fine for early stage but doesn't scale to multiple server instances.
2. **Custom domain + SSL** — Railway handles SSL automatically when you add a custom domain.
3. **Stripe integration** — For the $49.99/$299.99 subscription billing.
4. **Email service** — For password resets, team invites (SendGrid, Resend, etc.)
5. **Error monitoring** — Sentry or similar for production error tracking.
