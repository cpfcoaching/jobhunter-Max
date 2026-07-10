# 🔒 Security Policy & Implementation

## Overview

JobHunter Max is built with security as a first-class concern. This document outlines our security architecture, implementation details, and best practices.

---

## Security Architecture

### Threat Model

We protect against:
- **XSS Attacks**: API keys never exposed to frontend JavaScript
- **MITM Attacks**: HTTPS-only communication in production
- **Credential Exposure**: No credentials in browser storage
- **Data Breach**: Encryption at rest using AES-256-GCM
- **Unauthorized Access**: Backend validation and authentication

### Threat Mitigation

```
Attack Vector          | Mitigation Strategy
─────────────────────────────────────────────────────
Local Storage XSS      | Keys stored on backend, not in browser
Network Interception   | HTTPS/TLS in production
Malicious Scripts      | No sensitive data in frontend bundles
Database Breach        | AES-256-GCM encryption at rest
Unauthorized API Use   | Backend-only key access
```

---

## Implementation Details

### 1. Encryption (AES-256-GCM)

**Location**: `server/crypto.js`

API keys are encrypted using:
- **Algorithm**: AES-256-GCM (Advanced Encryption Standard, 256-bit)
- **Key Derivation**: SCRYPT (NIST-recommended)
- **Authentication Tag**: Prevents tampering

```javascript
// Encryption process
const encrypted = encryptData(apiKey);
// Returns: { iv, encryptedData, authTag }
```

**Security Properties**:
- ✅ 256-bit key strength (unbreakable with current technology)
- ✅ Authenticated encryption (detects tampering)
- ✅ Random IV per encryption (prevents pattern analysis)
- ✅ Server-side implementation (key never exposed to frontend)

### 2. Backend Architecture

**Server**: Node.js/Express running on `http://localhost:3001`

**Endpoints**:
```
POST   /api/keys/set           - Store encrypted API key
GET    /api/keys/check/:provider - Check if key is configured
POST   /api/keys/delete/:provider - Delete API key
POST   /api/ai/generate        - Generate AI response using stored key
```

**Security Headers**:
- ✅ CORS configured with specific origin
- ✅ JSON body size limits
- ✅ No sensitive data in logs
- ✅ Error messages don't leak information

### 3. Frontend Security

**Never implemented**:
- ❌ API key input directly used for API calls
- ❌ API keys stored in localStorage
- ❌ API keys in component state persisted to storage
- ❌ API key values sent to analytics/logging

**Implemented**:
- ✅ Secure backend communication
- ✅ Password input fields for key entry
- ✅ Session-based validation
- ✅ Status checks without exposing keys

### 4. Data Flow

#### Storing an API Key

```
User enters API key in Settings
         ↓
Frontend sends to /api/keys/set via HTTPS
         ↓
Backend validates API key format
         ↓
Backend encrypts with AES-256-GCM
         ↓
Backend stores in memory (production: database)
         ↓
Frontend receives success confirmation
         ↓
User never sees the key again
```

#### Using an API Key for AI Generation

```
User requests AI generation
         ↓
Frontend sends request to /api/ai/generate
         ↓
Backend retrieves encrypted key
         ↓
Backend decrypts key
         ↓
Backend calls OpenAI/DeepSeek API
         ↓
Backend returns response (no key exposure)
         ↓
Frontend displays AI response
```

---

## Best Practices

### For Users

1. **Use Strong API Keys**
   - Generate new API keys from provider settings
   - Don't reuse keys across applications
   - Rotate keys regularly

2. **Local Machine Security**
   - Use HTTPS for all production deployments
   - Keep your computer/server updated with patches
   - Don't share `SESSION_SECRET` with others

3. **Monitor Usage**
   - Check your API provider's usage dashboard
   - Set up billing alerts
   - Delete unused API keys

### For Developers

1. **Environment Variables**
   ```bash
   # ✅ GOOD: Use environment variables
   const apiKey = process.env.OPENAI_API_KEY;
   
   # ❌ AVOID: Hardcoding keys
   const apiKey = "sk-...";
   ```

2. **Never Log Secrets**
   ```javascript
   # ❌ AVOID
   console.log('API Key:', apiKey);
   
   # ✅ GOOD
   console.log('API Key stored successfully');
   ```

3. **Validate Input**
   ```javascript
   if (!apiKey || apiKey.length < 10) {
       return res.status(400).json({ error: 'Invalid key' });
   }
   ```

4. **Use HTTPS in Production**
   ```javascript
   // Use process.env.NODE_ENV to enforce HTTPS
   if (process.env.NODE_ENV === 'production' && !req.secure) {
       return res.status(400).json({ error: 'HTTPS required' });
   }
   ```

---

## Deployment Security Checklist

### Pre-Deployment

- [ ] Update all dependencies: `npm audit fix`
- [ ] Run security audit: `npm audit`
- [ ] Set strong `SESSION_SECRET` (min 32 chars)
- [ ] Set strong `ADMIN_TOKEN` for Admin Portal and `/api/admin/*` endpoints
- [ ] Verify bug screenshots require admin authorization before viewing
- [ ] Configure CORS with specific origins
- [ ] Enable HTTPS/TLS certificates
- [ ] Set `NODE_ENV=production`
- [ ] Review environment variables
- [ ] Test encryption/decryption with real keys
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerting

### Deployment

- [ ] Use environment variables (not .env files)
- [ ] Enable HTTPS only
- [ ] Use process manager (PM2, systemd, etc.)
- [ ] Configure firewall rules
- [ ] Enable log monitoring
- [ ] Set up regular backups
- [ ] Implement intrusion detection

### Post-Deployment

- [ ] Monitor API usage patterns
- [ ] Check logs for suspicious activity
- [ ] Set up security alerts
- [ ] Schedule regular security audits
- [ ] Keep dependencies updated
- [ ] Review and rotate SESSION_SECRET periodically
- [ ] Review and rotate `ADMIN_TOKEN` periodically and after staff changes

---

## Vulnerability Reporting

### Found a Security Issue?

**Please do NOT open a public GitHub issue.**

Instead, email us privately:
- Subject: `[SECURITY] Vulnerability Report`
- Include: Description, steps to reproduce, impact assessment
- We will respond within 48 hours

## Security Updates

Subscribe to notifications for security updates:
- GitHub Release notifications
- npm package updates: `npm audit`
- Run periodic security audits

---

## Technologies & Standards

**Encryption**:
- AES-256-GCM (NIST FIPS 197)
- SCRYPT key derivation (RFC 7914)
- Secure random IV generation

**Transport Security**:
- HTTPS/TLS 1.3+
- CORS with origin validation
- Secure headers

**Authentication**:
- Server-side session validation
- No exposed tokens in frontend
- Time-limited operations

---

## Compliance

### Privacy Standards
- ✅ No data collection beyond functionality needs
- ✅ No third-party tracking
- ✅ User data never shared with third parties
- ✅ GDPR-friendly design (local storage option)

### Security Standards
- ✅ Industry-standard encryption
- ✅ OWASP Top 10 protections
- ✅ Regular security audits
- ✅ Principle of least privilege

---

## Frequently Asked Questions

**Q: Where are my API keys stored?**
A: In the backend server's memory (development) or encrypted database (production). Never in browser storage.

**Q: Can you see my API keys?**
A: No. They're encrypted with AES-256-GCM. Even we can't decrypt them without the SESSION_SECRET.

**Q: What if I forget my SESSION_SECRET?**
A: Old encrypted keys will be inaccessible. Store it securely (password manager, encrypted backup).

**Q: Is it safe to use on public WiFi?**
A: Yes, only if using HTTPS. The backend can be self-hosted for maximum control.

**Q: Can I use this offline?**
A: Yes! Use Ollama as your AI provider to run models completely offline without needing external APIs.

**Q: How often should I rotate my API keys?**
A: Best practice is every 90 days, or whenever you suspect compromise.

---

## Support

For security-related questions or concerns:
- 📧 Email: security@jobhuntermax.com
- 🔒 PGP Key: [Available upon request]
- 📚 Full documentation: See [README.md](README.md) for setup

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Status**: Active & Maintained
