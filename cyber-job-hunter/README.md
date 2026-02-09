# 🎯 JobHunter Max

> **The Ultimate Job Search Companion** - Combining manual tracking precision with AI-powered intelligence

JobHunter Max is a modern, full-featured job search management application that brings together the best of both worlds: **manual control** for detailed tracking and **AI automation** for intelligent insights. Track companies, manage contacts, log communications, and leverage AI to optimize your resume and match jobs—all in one beautiful interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)
![Vite](https://img.shields.io/badge/Vite-7.3.1-646cff.svg)

---

## 🔒 Security First

This application implements **secure API key management** with a dedicated backend server. All sensitive credentials (API keys, authentication tokens) are:
- ✅ **Never stored** in browser local storage
- ✅ **Encrypted** in transit using HTTPS
- ✅ **Encrypted** at rest on the backend server using AES-256-GCM
- ✅ **Only accessible** through secure backend endpoints
- ✅ **Never exposed** to the frontend JavaScript environment

See [Security & Setup](#security--setup) section below for configuration details.

## ✨ Features

### 📊 Manual Job Search Tracking

**Company Management**
- Track unlimited companies with detailed information
- Industry, location, website, and custom notes
- Rating system (0-4 stars) for prioritization
- Research status tracking (Pending, In Progress, Completed)
- LinkedIn connection status

**Application Tracking**
- Complete application pipeline management
- Status tracking: Not Applied → Applied → Phone Screen → Interview → Offer → Accepted/Rejected
- Applied date, job URL, and salary range tracking
- Application-specific notes and details

**Contact Management**
- Store multiple contacts per company
- Full contact details: firstName, lastName, phone, email, LinkedIn profile
- Contact status tracking (Identified, Contacted, Meeting Set, Referred, No Response)
- Communication channel tracking (LinkedIn, Email, Text, Phone, Other)

**Communication Logging**
- Log all communications with contacts
- Track direction (Sent/Received), channel, subject, and content
- Automatic follow-up reminders
- Auto-update last contact date and next follow-up date
- Communication history per contact

**Appointment Scheduling**
- Schedule interviews, informational meetings, and follow-ups
- Link appointments to companies and contacts
- Calendar view with all upcoming appointments
- Appointment types: Informational, Interview, Follow-up, Other

**Interview Preparation**
- TIARA framework (Trends, Insights, Advice, Resources, Assignments)
- Investor relations and headlines review checklist
- Common interview questions preparation
- Company research organization

### 🤖 AI-Powered Features

**Resume Management**
- Upload and store multiple resume versions
- Track creation and update dates
- Quick resume selection for analysis

**AI Resume Review**
- Comprehensive resume analysis with scoring (0-100)
- Detailed feedback on:
  - Overall quality and summary
  - Formatting and structure
  - Content effectiveness
  - Keyword optimization
- Strengths, weaknesses, and actionable suggestions
- Powered by local AI (Ollama) or cloud providers

**AI Job Matching**
- Match your resume against job descriptions
- Compatibility scoring and analysis
- Skills match breakdown (matched vs. missing)
- Experience level analysis
- Tailoring tips for specific positions
- Recommendations for improving match score

**AI Email Writer**
- Generate professional emails with AI
- Pre-built templates:
  - Introduction emails
  - Follow-up messages
  - Thank you notes
  - Job applications
  - Custom communications
- Customizable prompts and instructions
- Copy to clipboard or send directly
- Context-aware generation (contact, company, role)

**Multiple AI Provider Support**
- **Ollama** (Local, Privacy-First) - Run AI models on your machine
- **OpenAI** - GPT-powered analysis
- **DeepSeek** - Alternative cloud AI provider
- Easy provider switching in settings

### ⚙️ Settings & Integrations

**AI Configuration**
- Select AI provider (Ollama/OpenAI/DeepSeek)
- Model selection and status monitoring
- API key management for cloud providers
- Real-time model status checking

**Email Integration** (Coming Soon)
- Gmail, Outlook, Yahoo support
- Send applications directly from the app
- Automated follow-up emails

**LinkedIn Integration** (Coming Soon)
- Import LinkedIn connections
- Send InMail messages
- Profile synchronization

**Data Management**
- Export all data as JSON
- Import previous data
- Clear all data option

---

## 🚀 Technology Stack

### Frontend Framework
- **React 19.2.0** - Modern UI library with latest features
- **TypeScript 5.9.3** - Type-safe development
- **Vite 7.3.1** - Lightning-fast build tool and dev server

### Routing & Navigation
- **React Router DOM 7.13.0** - Client-side routing

### State Management
- **Zustand 5.0.11** - Lightweight state management
- **Persist Middleware** - Automatic localStorage persistence

### Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.24** - Vendor prefix automation
- **clsx 2.1.1** - Conditional className utility
- **tailwind-merge 3.4.0** - Merge Tailwind classes intelligently

### UI Components & Icons
- **Lucide React 0.563.0** - Beautiful, consistent icons

### AI Integration
- **Ollama** - Local AI runtime for privacy-first AI
- **OpenAI API** - Cloud-based GPT models
- **DeepSeek API** - Alternative AI provider

---

## 📦 Installation

### Prerequisites
- **Node.js** 18.x or higher
- **npm** or **yarn**
- **(Optional)** Ollama for local AI features

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jobhunter-max.git
   cd jobhunter-max
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

---

## 🧠 AI Setup (Optional)

### Using Ollama (Recommended for Privacy)

1. **Install Ollama**
   Visit [ollama.com](https://ollama.com) and download for your platform

2. **Pull a model**
   ```bash
   ollama pull llama3.2
   ```
   
   Other recommended models:
   ```bash
   ollama pull llama3.1
   ollama pull mistral
   ```

3. **Run the model**
   ```bash
   ollama run llama3.2
   ```

4. **Configure in JobHunter Max**
   - Navigate to Settings
   - Select "Ollama (Local)" as provider
   - Choose your downloaded model
   - Start using AI features!

### Using OpenAI

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Navigate to Settings in JobHunter Max
3. Select "OpenAI" as provider
4. Enter your API key
5. Save settings

### Using DeepSeek

1. Get your API key from DeepSeek
2. Navigate to Settings
3. Select "DeepSeek" as provider
4. Enter your API key
5. Save settings

---

## 📖 Usage Guide

### Adding a Company

1. Click **"Companies"** in the sidebar
2. Click **"Add Company"** button
3. Fill in company details (name, industry, location, etc.)
4. Set your rating and research status
5. Click **"Add Company"**

### Tracking an Application

1. Open a company's detail page
2. Click **"Add Application"**
3. Enter position, status, applied date, job URL, salary
4. Add any notes
5. Track progress through the pipeline

### Logging Communications

1. Navigate to a contact
2. Click **"Log Communication"**
3. Select channel (Email, LinkedIn, Phone, etc.)
4. Enter subject and content
5. Set follow-up reminder if needed
6. Communication auto-updates last contact date

### Using AI Resume Review

1. Navigate to **"AI Assistant"**
2. Click **"Add Resume"** and paste your resume content
3. Select the resume
4. Click **"Review Resume"**
5. Wait for AI analysis
6. Review detailed feedback and suggestions

### Matching Resume with Job

1. Go to **"AI Assistant"**
2. Select a resume
3. Paste job description in the text area
4. Click **"Match with Job"**
5. Review compatibility score and recommendations

### Writing AI-Powered Emails

1. Open a contact or company
2. Click **"Write Email"** (AI-powered)
3. Select email purpose (Introduction, Follow-up, etc.)
4. Add custom instructions if needed
5. Click **"Generate Email with AI"**
6. Edit generated content
7. Copy or send directly

---

## 🎨 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)
*Track companies, appointments, and follow-ups at a glance*

### AI Assistant
![AI Assistant](./screenshots/ai-assistant.png)
*Resume review and job matching powered by AI*

### Settings
![Settings](./screenshots/settings.png)
*Configure AI providers and integrations*

### Company Detail
![Company Detail](./screenshots/company-detail.png)
*Comprehensive company tracking with contacts and applications*

---

## 🙏 Credits & Acknowledgments

### Inspired By

**[JobSync](https://github.com/Gsync/jobsync)** by Gsync
- AI-powered resume review functionality
- Job matching algorithms and scoring system
- AI integration patterns and architecture
- Inspiration for dual-panel approach

### Built With

**Core Technologies:**
- [React](https://react.dev/) - Facebook/Meta - UI library
- [TypeScript](https://www.typescriptlang.org/) - Microsoft - Type-safe JavaScript
- [Vite](https://vitejs.dev/) - Evan You and team - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Tailwind Labs - CSS framework

**State & Routing:**
- [Zustand](https://github.com/pmndrs/zustand) - Poimandres - State management
- [React Router](https://reactrouter.com/) - Remix Team - Routing

**UI & Icons:**
- [Lucide Icons](https://lucide.dev/) - Lucide Team - Icon library
- [clsx](https://github.com/lukeed/clsx) - Luke Edwards - Utility
- [tailwind-merge](https://github.com/dcastil/tailwind-merge) - dcastil - Tailwind utilities

**AI Providers:**
- [Ollama](https://ollama.com/) - Local AI runtime
- [OpenAI](https://openai.com/) - GPT models
- [DeepSeek](https://www.deepseek.com/) - AI models

**Development Tools:**
- [ESLint](https://eslint.org/) - Code linting
- [PostCSS](https://postcss.org/) - CSS processing
- [Autoprefixer](https://github.com/postcss/autoprefixer) - CSS vendor prefixes

---

## 📄 License

MIT License

Copyright (c) 2026 JobHunter Max

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---
## 🔒 Security & Setup

### Architecture Overview

JobHunter Max uses a **client-server architecture** for secure credential management:

```
Frontend (React)          Backend (Node.js/Express)     External APIs
┌─────────────────┐      ┌──────────────────────┐      ┌──────────────┐
│  Settings Page  │─────▶│  API Key Endpoint    │─────▶│ OpenAI API   │
│                 │      │  (Encrypted Storage) │      │ DeepSeek API │
│  (No Keys Here) │◀─────│  (AES-256-GCM)       │◀─────│              │
└─────────────────┘      └──────────────────────┘      └──────────────┘
```

### Backend Setup

#### 1. Install Backend Dependencies

```bash
cd server
npm install
```

#### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual API keys
# IMPORTANT: Never commit .env to version control
```

**Required environment variables:**
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=generate-a-random-string-here

# API Keys (get from their respective platforms)
OPENAI_API_KEY=sk-...
DEEPSEEK_API_KEY=...
```

#### 3. Start the Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001`

### Frontend Setup

#### 1. Configure Frontend Environment

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local to point to your backend
VITE_API_URL=http://localhost:3001
```

#### 2. Start the Frontend

```bash
npm run dev
```

The application will run on `http://localhost:5173`

### API Key Management

**When you want to use OpenAI or DeepSeek:**

1. Navigate to **Settings** in the app
2. Select your AI provider (OpenAI or DeepSeek)
3. Paste your API key in the input field
4. Click **Save** - the key is sent to the backend and encrypted
5. The frontend never stores the actual API key

**Key Security Features:**

- 🔐 **AES-256-GCM Encryption**: Keys are encrypted using military-grade encryption
- 🔑 **Secure Storage**: Keys stored only on backend server, never in browser
- 🛡️ **HTTPS Required**: Always use HTTPS in production
- 🔄 **No Key Exposure**: Frontend only checks if a key is configured, never requests the actual key
- 🗑️ **Easy Deletion**: Delete stored keys anytime from Settings

### Ollama (Local AI)

For completely private AI processing without external APIs:

1. Install Ollama from [ollama.com](https://ollama.com)
2. In Settings, select **Ollama (Local)** as your AI provider
3. Download and run your preferred model (e.g., `ollama pull llama3.2`)
4. The app will automatically detect running models

**No API key needed** - everything runs locally on your machine!

### Production Deployment

When deploying to production:

#### Backend
```bash
# Use environment variables instead of .env file
NODE_ENV=production
PORT=3000
SESSION_SECRET=long-random-string-generated-securely
FRONTEND_URL=https://yourdomain.com

# Use HTTPS for all connections
# Obtain SSL certificate (e.g., Let's Encrypt)
```

#### Frontend
```bash
# Use HTTPS URL for backend
VITE_API_URL=https://api.yourdomain.com
```

#### Security Checklist
- ✅ Use HTTPS/TLS for all connections
- ✅ Set strong `SESSION_SECRET` (minimum 32 characters)
- ✅ Keep `NODE_ENV=production`
- ✅ Never commit `.env` files
- ✅ Use environment variables for all secrets
- ✅ Enable CORS with specific origins only
- ✅ Implement rate limiting on backend
- ✅ Keep dependencies updated: `npm audit fix`
- ✅ Use a process manager (PM2, systemd, Docker)
- ✅ Enable backend monitoring and logging

---
## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Reporting Issues

Found a bug or have a feature request? Please open an issue on GitHub with:
- Clear description of the problem/feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

---

## 🗺️ Roadmap

- [ ] Email integration (Gmail, Outlook, Yahoo)
- [ ] LinkedIn integration and InMail
- [ ] Calendar sync (Google Calendar, Outlook)
- [ ] Mobile app (React Native)
- [ ] Browser extension for quick job saving
- [ ] Job board integrations (LinkedIn, Indeed, etc.)
- [ ] Analytics and insights dashboard
- [ ] Team collaboration features
- [ ] Interview scheduling automation
- [ ] Salary negotiation assistant

---

## 💡 Why JobHunter Max?

**Privacy-First AI**: Use Ollama for local AI processing—your data never leaves your machine.

**Comprehensive Tracking**: From first contact to final offer, track every detail of your job search.

**AI-Enhanced**: Let AI handle resume optimization and job matching while you focus on networking.

**Modern Stack**: Built with the latest technologies for a fast, reliable experience.

**Open Source**: Free forever, customizable, and community-driven.

---

## 📞 Support

Need help? Have questions?

- 📧 Email: support@jobhuntermax.com
- 💬 Discord: [Join our community](#)
- 🐦 Twitter: [@jobhuntermax](#)
- 📚 Documentation: [docs.jobhuntermax.com](#)

---

<div align="center">

**Made with ❤️ by developers, for job seekers**

⭐ Star this repo if JobHunter Max helps you land your dream job!

</div>
