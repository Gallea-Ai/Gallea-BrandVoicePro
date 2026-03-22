# GalleaBrandVoicePro — Internal Server Deployment Guide
## For IT / DevOps Team

---

## What This Is

GalleaBrandVoicePro is a Node.js web application (Express backend + React frontend) that runs as a single process. It uses SQLite for data storage (no external database required) and calls the Anthropic Claude API for AI content generation.

---

## System Requirements

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- **OS**: Linux, macOS, or Windows Server
- **RAM**: 512MB minimum, 1GB recommended
- **Disk**: 500MB for the app + database growth
- **Network**: Outbound HTTPS access to `api.anthropic.com` (for AI content generation)
- **Port**: One open port (default 5000, configurable via PORT env var)

---

## Quick Start (5 minutes)

```bash
# 1. Unzip the project
unzip GalleaBrandVoicePro-Complete.zip
cd gallea-brand-voice-pro

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env and add your Anthropic API key (see below)

# 4. Build for production
npm run build

# 5. Start the server
NODE_ENV=production node dist/index.cjs
```

The app will be available at `http://localhost:5000`

---

## Environment Variables

Create a `.env` file in the project root (or set these as system environment variables):

### Required
```
NODE_ENV=production
ANTHROPIC_API_KEY=sk-ant-xxxxx          # Get from https://console.anthropic.com
PORT=5000                                # Change if 5000 is taken
SESSION_SECRET=any-long-random-string    # Used for session encryption
```

### Optional (OAuth — Social Login)
```
GOOGLE_CLIENT_ID=                        # Google Cloud Console OAuth credentials
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=                         # Facebook Developer App credentials
FACEBOOK_APP_SECRET=
APPLE_CLIENT_ID=                         # Apple Developer credentials
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=
```

### Getting an Anthropic API Key
1. Go to https://console.anthropic.com
2. Create an account (or sign in)
3. Navigate to API Keys → Create Key
4. Copy the key (starts with `sk-ant-`)
5. Add to your .env file as ANTHROPIC_API_KEY

---

## Running as a System Service

### Linux (systemd)

Create `/etc/systemd/system/gallea-brandvoice.service`:

```ini
[Unit]
Description=GalleaBrandVoicePro
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/gallea-brand-voice-pro
ExecStart=/usr/bin/node dist/index.cjs
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5000
EnvironmentFile=/opt/gallea-brand-voice-pro/.env

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable gallea-brandvoice
sudo systemctl start gallea-brandvoice
sudo systemctl status gallea-brandvoice
```

### Windows Server

Use PM2 or run as a Windows Service:

```bash
npm install -g pm2
pm2 start dist/index.cjs --name gallea-brandvoice --env production
pm2 save
pm2 startup   # Follow instructions to auto-start on boot
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "dist/index.cjs"]
```

```bash
docker build -t gallea-brandvoice .
docker run -d -p 5000:5000 --env-file .env --name gallea gallea-brandvoice
```

---

## Reverse Proxy (Nginx)

To serve behind a domain with SSL:

```nginx
server {
    listen 443 ssl;
    server_name brandvoice.yourdomain.com;

    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;  # LLM calls can take 30+ seconds
    }
}
```

---

## Database

The app uses **SQLite** — a single file (`data.db`) created automatically in the working directory on first run. No external database server needed.

### Backup
```bash
# Simple file copy (stop the server first for consistency, or use .backup)
sqlite3 data.db ".backup /backups/gallea-$(date +%Y%m%d).db"
```

### Migration to PostgreSQL (future)
If you need to scale to multiple server instances, the codebase uses Drizzle ORM which supports PostgreSQL. The migration would involve:
1. Changing the drizzle driver from `better-sqlite3` to `pg`
2. Updating the connection string
3. Running the same schema against Postgres

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│  Browser (React SPA)                     │
│  - Auth screens                          │
│  - Brand assessment (7 modules)          │
│  - Content generator                     │
│  - Analytics dashboard                   │
│  - Brand voice map                       │
└──────────────┬──────────────────────────┘
               │ HTTP/JSON
┌──────────────▼──────────────────────────┐
│  Express.js Server (port 5000)           │
│  - REST API (/api/*)                     │
│  - Static file serving                   │
│  - Session management                    │
│  - OAuth handlers                        │
└──────────────┬───────────┬──────────────┘
               │           │
┌──────────────▼──┐  ┌─────▼──────────────┐
│  SQLite (data.db)│  │  Anthropic Claude   │
│  - Users         │  │  API (external)     │
│  - Companies     │  │  - Content gen      │
│  - Brand profiles│  │  - Brand analysis   │
│  - Content       │  │  - Scoring engine   │
│  - Voice rules   │  │                     │
└─────────────────┘  └─────────────────────┘
```

---

## Security Notes

- Passwords are stored in plaintext in this version. **For production, add bcrypt hashing** (`npm install bcrypt`) before exposing to the internet.
- The Anthropic API key should be treated as a secret — never commit it to version control.
- If exposing to the internet, use HTTPS (via nginx/reverse proxy + Let's Encrypt).
- The SQLite database file contains all user data — secure it with appropriate file permissions.

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| `ANTHROPIC_API_KEY not set` | Add the key to .env or set as environment variable |
| Port 5000 already in use | Change PORT in .env or stop the conflicting process |
| `npm run build` fails | Ensure Node.js 18+ is installed: `node --version` |
| Content generation times out | Check outbound HTTPS to api.anthropic.com is allowed |
| Database locked errors | Ensure only one server instance is running |
| OAuth not working | OAuth requires HTTPS and valid callback URLs registered with each provider |

---

## Support

This application was built by the Brand Factory team. For questions about the codebase, the key files are:

- `server/routes.ts` — All API endpoints
- `server/storage.ts` — Database operations
- `shared/schema.ts` — Data model
- `client/src/App.tsx` — Main application shell
- `client/src/pages/` — All page components
