# ⚡ Quick Reference Guide

## Getting Started (5 minutes)

```bash
# 1. Install everything
npm install
npm run server:install

# 2. Configure backend
cd server
cp .env.example .env
# Edit .env - add SESSION_SECRET and any API keys
cd ..

# 3. Configure frontend
cp .env.example .env.local
# Should contain: VITE_API_URL=http://localhost:3001

# 4. Start backend (Terminal 1)
npm run server

# 5. Start frontend (Terminal 2)
npm run dev

# 6. Open browser
# http://localhost:5173
```

---

## Common Tasks

### Generate SESSION_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Start Backend
```bash
npm run server
# or from server directory:
cd server && npm run dev
```

### Start Frontend
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Install Backend Dependencies
```bash
npm run server:install
```

### Check Backend Health
```bash
curl http://localhost:3001/health
```

---

## File Locations

| What | Where |
|------|-------|
| Backend config | `server/.env` |
| Frontend config | `.env.local` |
| Backend code | `server/index.js` |
| Encryption code | `server/crypto.js` |
| API integration | `src/utils/backend-api.ts` |
| Settings UI | `src/pages/Settings.tsx` |

---

## Documentation

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Project overview & features |
| [SECURITY.md](SECURITY.md) | Security architecture & best practices |
| [SETUP.md](SETUP.md) | Detailed installation guide |
| [CHANGES.md](CHANGES.md) | Summary of changes made |

---

## Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=<generated-random-string>
OPENAI_API_KEY=<optional>
DEEPSEEK_API_KEY=<optional>
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3001
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Server health check |
| `/api/keys/set` | POST | Store encrypted API key |
| `/api/keys/check/:provider` | GET | Check if key exists |
| `/api/keys/delete/:provider` | POST | Delete API key |
| `/api/ai/generate` | POST | Generate AI response |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check port 3001 not in use: `lsof -i :3001` |
| CORS error | Verify `FRONTEND_URL` in server `.env` |
| API key won't save | Check backend logs, verify HTTPS setup |
| Can't connect Ollama | Start Ollama: `ollama serve` |
| Frontend can't find backend | Check `VITE_API_URL` in `.env.local` |

---

## Security Checklist

### Development
- [ ] Generated SESSION_SECRET
- [ ] Created `.env` file (not committed)
- [ ] Created `.env.local` file (not committed)
- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Can set API keys in Settings

### Production
- [ ] Using HTTPS/TLS
- [ ] `NODE_ENV=production`
- [ ] Strong SESSION_SECRET
- [ ] CORS configured correctly
- [ ] Environment variables set on server
- [ ] Dependencies updated
- [ ] Monitoring enabled

---

## Keyboard Shortcuts

| Shortcut | What |
|----------|------|
| `F12` | Open browser developer tools |
| `Ctrl+Shift+J` | Open console (Chrome) |
| `Cmd+Option+J` | Open console (Mac) |
| `Cmd+K` | Open command palette (VS Code) |

---

## Useful Commands

```bash
# Check if port is in use
lsof -i :3001           # macOS/Linux
netstat -ano | find :3001  # Windows

# Kill process on port
kill -9 <PID>           # macOS/Linux
taskkill /PID <PID>     # Windows

# View logs
npm run server          # See backend logs
npm run dev             # See frontend logs

# Generate new SESSION_SECRET
openssl rand -base64 32  # Alternative method
```

---

## Links

| Resource | URL |
|----------|-----|
| OpenAI API | https://platform.openai.com/api-keys |
| DeepSeek | https://deepseek.com |
| Ollama | https://ollama.com |
| Node.js | https://nodejs.org |
| Express.js | https://expressjs.com |

---

## Security Best Practices

✅ **DO:**
- Use HTTPS in production
- Rotate API keys regularly
- Monitor API usage
- Keep dependencies updated
- Use environment variables
- Review logs regularly

❌ **DON'T:**
- Commit .env files
- Hardcode secrets
- Log sensitive data
- Skip HTTPS
- Reuse API keys across apps
- Share SESSION_SECRET

---

## Version Info

- **Node.js**: 18+
- **npm**: 9+
- **React**: 19.2.0
- **Express**: 4.18.2
- **Encryption**: AES-256-GCM

---

## Getting Help

1. Check [SETUP.md](SETUP.md) for installation issues
2. Review [SECURITY.md](SECURITY.md) for security questions
3. Check browser console: F12 → Console
4. Check backend logs in terminal
5. Review [README.md](README.md) for features

---

## Next Steps After Setup

1. ✅ Complete 5-minute setup above
2. 📖 Read [README.md](README.md)
3. 🔒 Review [SECURITY.md](SECURITY.md)
4. ➕ Add your first company
5. 🤖 Configure AI provider in Settings
6. 🚀 Start tracking your job search!

---

**Your secure job search companion is ready! 🚀**
