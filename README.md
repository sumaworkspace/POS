# POS - Retail Clothing Point of Sale System

A modern, full-stack TypeScript Point of Sale application for retail clothing shops. Built with React, Vite, Express, and Prisma.

## 🎯 Features

- 🔐 Salesperson authentication with JWT
- 📦 Product catalog with categories (Women, Men, Summer Wear, Winter Wear)
- 🛒 Shopping cart with real-time updates
- 👥 Customer lookup and management
- 💰 Automatic discount application (5% for existing customers, membership discount for new)
- 🧾 Indian GST tax calculation
- 💳 Multiple payment methods (Cash, Card, UPI, Net Banking)
- 📧 Email order confirmations
- 🤖 AI integration with Claude 4.5 (Anthropic) for promotional content

## 🏗️ Architecture

This is a monorepo with three packages:

```
POS/
├── packages/
│   ├── frontend/     # React + Vite + TypeScript (port 5173)
│   ├── server/       # Express + TypeScript + Prisma (port 4000)
│   └── shared/       # Shared TypeScript types
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Git** for version control

### Installation

1. **Clone the repository**
   ```powershell
   git clone https://github.com/sumaworkspace/POS.git
   cd POS
   ```

2. **Install dependencies**
   ```powershell
   # Using cmd.exe to bypass PowerShell execution policy
   cmd /c "npm install"
   ```

3. **Set up environment variables**
   ```powershell
   copy .env.example .env
   # Edit .env and add your configuration (optional: Anthropic API key)
   ```

4. **Start development servers**
   ```powershell
   cmd /c "npm run dev"
   ```

   This starts:
   - Backend server: http://localhost:4000
   - Frontend app: http://localhost:5173

5. **Open the application**
   
   Navigate to http://localhost:5173 in your browser

## 📝 Development

### Running Servers Separately

**Backend only:**
```powershell
cd packages/server
cmd /c "npm run dev"
```

**Frontend only:**
```powershell
cd packages/frontend
cmd /c "npm run dev"
```

### Building for Production

```powershell
# Build all packages
cmd /c "npm run build"

# Or build individually
cd packages/server
cmd /c "npm run build"

cd packages/frontend
cmd /c "npm run build"
```

### Project Structure

```
packages/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── App.tsx       # Main app component
│   │   │   └── Login.tsx     # Login page
│   │   └── main.tsx          # Entry point
│   ├── index.html
│   ├── vite.config.ts        # Vite configuration with API proxy
│   └── package.json
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   └── ai.ts         # AI generation endpoint
│   │   └── index.ts          # Express server
│   ├── seed.ts               # Database seed script
│   └── package.json
└── shared/
    ├── src/
    │   └── index.ts          # Shared TypeScript types
    └── package.json
```

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```

### AI Generation (Claude 4.5)
```
POST /api/ai/generate
Body: { "prompt": "Your prompt here", "max_tokens": 512 }
```

### Coming Soon
- `POST /api/auth/login` - Authentication
- `GET /api/categories` - List categories
- `GET /api/products` - List products
- `GET /api/customers` - Search customers
- `POST /api/orders` - Create order

## 🎨 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite 5** - Build tool and dev server
- **TypeScript 5** - Type safety
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express 4** - Web framework
- **TypeScript 5** - Type safety
- **Prisma 5** - ORM (SQLite for dev)
- **JWT** - Authentication
- **node-fetch** - Anthropic API calls

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=4000
JWT_SECRET=your_secret_key_min_32_chars

# Database
DATABASE_URL=file:./dev.db

# Anthropic AI (Optional)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_API_URL=https://api.anthropic.com/v1/responses
ANTHROPIC_MODEL=claude-4.5
```

## 🐛 Troubleshooting

### PowerShell Execution Policy Error

If you see `running scripts is disabled on this system`, use:
```powershell
cmd /c "npm install"
cmd /c "npm run dev"
```

### Port Already in Use

Change ports in:
- Backend: `.env` file (`PORT=4000`)
- Frontend: `packages/frontend/vite.config.ts` (default 5173)

### TypeScript Errors

Make sure dependencies are installed:
```powershell
cmd /c "npm install"
cd packages/server
cmd /c "npm install --save-dev @types/cors @types/jsonwebtoken @types/node"
cd ../frontend
cmd /c "npm install --save-dev @types/react @types/react-dom"
```

## 📚 Documentation

Comprehensive documentation available in `.github/memory-bank/`:
- **projectbrief.md** - Requirements and goals
- **productContext.md** - Business logic and user flows
- **systemPatterns.md** - Architecture and design patterns
- **techContext.md** - Technical details and setup
- **activeContext.md** - Current work and decisions
- **progress.md** - Status and roadmap

## 🗺️ Roadmap

### ✅ Completed
- [x] Monorepo setup with workspaces
- [x] Frontend scaffold (React + Vite)
- [x] Backend scaffold (Express + TypeScript)
- [x] Shared types package
- [x] AI integration route
- [x] Login page UI
- [x] Dev environment setup

### 🚧 In Progress
- [ ] Prisma schema and migrations
- [ ] Backend API routes
- [ ] Frontend pages (Home, Catalog, Cart, Checkout)
- [ ] Authentication flow
- [ ] Customer management

### 📋 Planned
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Order history
- [ ] Sales reports
- [ ] Testing (Jest + React Testing Library)
- [ ] CI/CD pipeline
- [ ] Production deployment

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is for demonstration purposes.

## 🆘 Support

For issues or questions, please create an issue in the GitHub repository.

---

**Current Status:** Development in progress (~20% complete)

**Live URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- Health: http://localhost:4000/api/health
