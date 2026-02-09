# Deployment Guide - Child Care Compass

## Quick Deploy Options

### Option 1: GitHub Pages (Recommended)

1. Go to your GitHub repository: https://github.com/CollectiveAi1/NestFlow-
2. Click on **Settings** → **Pages**
3. Under "Source", select **Deploy from a branch**
4. Select branch: **gh-pages** and folder: **/ (root)**
5. Click **Save**
6. Wait 2-3 minutes for deployment
7. Your site will be live at: **https://collectiveai1.github.io/NestFlow-/**

To update the deployment:
```bash
npm run deploy
```

### Option 2: Vercel (Easiest)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Import Project"
4. Select the **NestFlow-** repository
5. Click **Deploy**
6. Your site will be live at a Vercel URL (e.g., `nestflow.vercel.app`)

### Option 3: Netlify

1. Go to https://app.netlify.com
2. Drag and drop the `dist` folder to deploy
3. Or connect your GitHub repository for automatic deployments

### Option 4: Local Deployment

Run the built version locally:
```bash
npm run build
cd dist
python3 -m http.server 8080
```

Then open: http://localhost:8080/

## Build Commands

**Development:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
```

**Deploy to GitHub Pages:**
```bash
npm run deploy
```

## Important Notes

- The frontend is a static React app that can run anywhere
- Backend requires PostgreSQL database setup
- For full functionality, deploy both frontend and backend separately
- Frontend can work in "demo mode" (UI only) without the backend
