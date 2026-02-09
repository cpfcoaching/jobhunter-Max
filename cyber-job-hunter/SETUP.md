# 🚀 Setup & Installation Guide

This guide walks you through setting up JobHunter Max with the secure backend for API key management.

## Prerequisites

- **Node.js** 18+ (download from [nodejs.org](https://nodejs.org))
- **npm** 9+ (comes with Node.js)
- **API Keys** (optional):
  - OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
  - DeepSeek API key from [deepseek.com](https://deepseek.com)
- **OR** Ollama installed from [ollama.com](https://ollama.com) for local AI

## Quick Start (5 minutes)

### Step 1: Clone and Install

```bash
# Navigate to your project
cd cyber-job-hunter

# Install frontend dependencies
npm install

# Install backend dependencies
npm run server:install
```

### Step 2: Configure Backend

```bash
# Enter the server directory
cd server

# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
# (or use your preferred editor: code .env, vim .env, etc.)
```

**What to configure in `.env`:**
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your-secret-key-min-32-characters

# Optional: Add API keys here (or set them in the app)
OPENAI_API_KEY=
DEEPSEEK_API_KEY=
```

### Step 3: Configure Frontend

```bash
# Go back to root directory
cd ..

# Copy environment template
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**What to configure in `.env.local`:**
```env
VITE_API_URL=http://localhost:3001
```

### Step 4: Run the Application

**Terminal 1 - Backend Server:**
```bash
npm run server
```

You should see:
```
🔒 Secure API server running on http://localhost:3001
```

**Terminal 2 - Frontend App:**
```bash
npm run dev
```

You should see:
```
  VITE v7.3.1  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 5: Set Up Your AI Provider

Open http://localhost:5173 and go to **Settings**:

**Option A: Local AI with Ollama**
1. Install Ollama from [ollama.com](https://ollama.com)
2. Run: `ollama pull llama3.2`
3. In Settings, select "Ollama (Local)"
4. The app will auto-detect your models

**Option B: OpenAI**
1. Get API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. In Settings, select "OpenAI"
3. Paste your API key and click "Save"
4. The backend securely stores it (encrypted)

**Option C: DeepSeek**
1. Get API key from DeepSeek
2. In Settings, select "DeepSeek"
3. Paste your API key and click "Save"
4. The backend securely stores it (encrypted)

## Detailed Setup Guide

### Backend Setup Details

#### Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `FRONTEND_URL` | Frontend URL (CORS) | `http://localhost:5173` |
| `SESSION_SECRET` | Encryption key (NEVER share!) | `your-random-string-here` |
| `OPENAI_API_KEY` | OpenAI credentials | `sk-...` |
| `DEEPSEEK_API_KEY` | DeepSeek credentials | `sk-...` |

#### Generate a Strong SESSION_SECRET

```bash
# On macOS/Linux:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# On Windows (PowerShell):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it into `.env` as `SESSION_SECRET`.

### Frontend Setup Details

#### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001` |

#### Building for Production

```bash
# Build the frontend
npm run build

# Output will be in the 'dist' folder
# Upload to your hosting service
```

### Project Structure

```
cyber-job-hunter/
├── src/                          # Frontend React app
│   ├── components/              # Reusable components
│   ├── pages/                   # Page components
│   │   └── Settings.tsx        # ⭐ API key configuration
│   ├── store/                   # Zustand store (non-sensitive data only)
│   ├── types/                   # TypeScript types
│   ├── utils/
│   │   ├── ai.ts              # AI utilities
│   │   └── backend-api.ts     # ⭐ Backend communication
│   └── App.tsx
│
├── server/                        # Backend Node.js server
│   ├── index.js                # ⭐ Main server file
│   ├── crypto.js               # ⭐ Encryption/decryption
│   ├── package.json
│   ├── .env.example            # Environment template
│   └── .gitignore              # Don't commit .env!
│
├── .env.example                  # Frontend env template
├── .gitignore                    # Git ignore rules
├── README.md                     # Main documentation
├── SECURITY.md                   # Security policy
└── SETUP.md                      # This file
```

## API Key Management

### How It Works

1. **You enter API key** → Settings page (password field)
2. **Backend encrypts it** → AES-256-GCM encryption
3. **Stored securely** → Backend server only (not in browser)
4. **Used by backend** → Calls OpenAI/DeepSeek APIs
5. **Frontend never sees key** → Only receives AI responses

### Setting an API Key

```
Settings → Select Provider → Paste API Key → Click "Save"
↓
Backend receives encrypted transmission (HTTPS)
↓
Backend encrypts with AES-256-GCM
↓
Backend stores in memory/database
↓
Success message shown to user
```

### Using AI with Stored Key

```
Click "Generate" → Frontend sends request to backend
↓
Backend retrieves encrypted key
↓
Backend decrypts key
↓
Backend calls OpenAI/DeepSeek API
↓
Backend sends response back to frontend
↓
User sees AI-generated content
```

### Deleting an API Key

```
Settings → Click "Delete" → Confirm
↓
Backend removes encrypted key from storage
↓
API key is no longer accessible
```

## Troubleshooting

### "Backend not responding"

```bash
# Check if backend is running
curl http://localhost:3001/health

# If not running:
npm run server

# Check for port conflicts
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows
```

### "Cannot connect to Ollama"

```bash
# Start Ollama
ollama serve

# In another terminal, download a model
ollama pull llama3.2

# Ollama runs on http://localhost:11434
```

### "API key not saved"

1. Check browser console for errors (F12 → Console)
2. Check backend logs in terminal
3. Ensure backend is running on correct port
4. Verify `FRONTEND_URL` in `.env` matches your frontend URL

### "CORS error"

```bash
# Check .env FRONTEND_URL matches your actual frontend URL:
# ❌ WRONG: FRONTEND_URL=http://localhost:5173 (but running on 5174)
# ✅ RIGHT: FRONTEND_URL=http://localhost:5174
```

### "SESSION_SECRET not set"

```bash
# Generate a new one:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env:
SESSION_SECRET=<generated-string>
```

## Production Deployment

### Backend Deployment (Example: Railway, Heroku, or your server)

```bash
# 1. Set environment variables on your host
#    PORT, NODE_ENV=production, FRONTEND_URL, SESSION_SECRET
#    OPENAI_API_KEY, DEEPSEEK_API_KEY

# 2. Install dependencies
npm install

# 3. Start server (with production process manager)
# Using PM2:
npm install -g pm2
pm2 start server/index.js --name "jobhunter-api"

# Using systemd:
# Create /etc/systemd/system/jobhunter.service with:
# [Service]
# ExecStart=/usr/bin/node /path/to/server/index.js
# Environment="NODE_ENV=production"
# Environment="PORT=3000"
```

### Frontend Deployment (Example: Vercel, Netlify, or your host)

```bash
# 1. Set environment variable
VITE_API_URL=https://your-api.com

# 2. Build
npm run build

# 3. Deploy dist/ folder to your host
```

### Security Checklist Before Deployment

- [ ] Use HTTPS/TLS certificates
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `SESSION_SECRET`
- [ ] Configure `FRONTEND_URL` with HTTPS
- [ ] Never commit `.env` files
- [ ] Review CORS settings
- [ ] Set up monitoring and logging
- [ ] Enable rate limiting
- [ ] Update all dependencies

## Development

### Running in Development

```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run dev

# Access app at http://localhost:5173
```

### Available Commands

```bash
# Frontend
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Check code quality

# Backend
npm run server    # Start server (from root with server/ dir)
npm run server:install  # Install server dependencies

# Or from server/ directory:
cd server
npm run dev       # Start with auto-reload
npm start         # Start normally
```

### Debugging

**Frontend Debug (Browser DevTools):**
- Open: http://localhost:5173
- Press: F12
- Tab: Console, Network, Application

**Backend Debug:**
```javascript
// Add logs in server/index.js
console.log('🔍 Debug:', variable);
```

**Check API Connectivity:**
```bash
# Test health endpoint
curl http://localhost:3001/health

# Should return: {"status":"Server is running"}
```

## Next Steps

1. ✅ Complete setup (Steps 1-5 above)
2. 📖 Read [README.md](README.md) for feature overview
3. 🔒 Review [SECURITY.md](SECURITY.md) for security details
4. 🧪 Test with sample data
5. 🚀 Deploy to production when ready

## Getting Help

- 📚 Check [README.md](README.md) for feature documentation
- 🔒 Read [SECURITY.md](SECURITY.md) for security questions
- 💬 Check browser console (F12 → Console) for errors
- 📋 Review backend logs in terminal

## File Checklist

After setup, you should have these files:

- ✅ `.env` (backend config) - **DO NOT COMMIT**
- ✅ `.env.local` (frontend config) - **DO NOT COMMIT**
- ✅ `server/.env` (server config) - **DO NOT COMMIT**
- ✅ `SECURITY.md` (this security guide)
- ✅ `SETUP.md` (this setup guide)
- ✅ Updated `README.md` with security info

## What's Secured

✅ **API Keys** - Encrypted with AES-256-GCM on backend  
✅ **Sessions** - Validated server-side  
✅ **Transport** - HTTPS in production  
✅ **Data** - Never exposed to frontend  
✅ **Credentials** - Not stored in browser  

---

**Ready to start?** Run the Quick Start (5 minutes) section above and you'll be up and running!

