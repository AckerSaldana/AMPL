# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a PathExplorer web application built for Accenture as part of TC3004B.103 project. It's a React-based employee skills and certification management system with the following key components:

- **Frontend**: React + Vite application with Material-UI components
- **Backend**: Express server with Firebase Functions
- **Database**: Supabase for data storage
- **Hosting**: Firebase Hosting with separate environments (prod-ampl, dev-ampl)

## Key Commands

### Development
```bash
# Install dependencies
npm install
cd functions && npm install

# Run development server (frontend)
npm run dev

# Run backend server locally
cd functions && npm start

# Build for production
npm run build

# Lint the codebase
npm run lint

# Preview production build
npm run preview
```

### Testing
No test commands are currently configured. The functions package.json shows `"test": "echo \"Error: no test specified\" && exit 1"`.

## Architecture Overview

### Frontend Structure
- **Entry Point**: `src/main.jsx` → `src/App.jsx`
- **Routing**: React Router with protected routes based on user roles (empleado, TFS, manager)
- **Authentication**: Custom `useAuth` hook and `ProtectedRoute` component
- **State Management**: React hooks and context
- **Styling**: Material-UI with Emotion/styled-components
- **Data Fetching**: Custom hooks in `src/hooks/` directory

### Backend Structure
- **API Server**: Express server at `functions/server.js`
- **Firebase Functions**: Deployed as 'api' function
- **Routes**: API routes in `functions/routes/`
- **Services**: Business logic in `functions/services/`
- **CV Parser**: PDF parsing functionality for resume analysis

### Key Configuration
- **Vite Config**: Proxies `/api` requests to `http://localhost:3001` in development
- **Firebase Config**: Rewrites `/api/**` to Firebase Functions in production
- **Supabase**: Client configured in `src/supabase/supabaseClient.js`

### Important Services
- **OpenAI Integration**: Used for AI-powered features (configured via environment variables)
- **PDF Processing**: CV parsing capabilities using pdf-parse
- **Caching**: Node-cache implementation for performance optimization

## Environment Variables
The application uses environment variables prefixed with `VITE_` for frontend and standard names for backend. In production (Firebase Functions), these are accessed through Firebase config variables.

## User Roles
The application supports three main roles:
- `empleado`: Regular employee access
- `TFS`: Technical Function Specialist access
- `manager`: Manager with administrative privileges

## Key Features
- Employee profile management
- Skills tracking and management
- Certification tracking and submission
- Project assignment and management
- Analytics and reporting dashboards
- Virtual assistant integration
- Career path visualization