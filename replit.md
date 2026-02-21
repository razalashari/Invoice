# Ever Green Produce - Invoice System

## Overview
A React + TypeScript invoice management system for Ever Green Produce L.L.C, a produce distribution company. The app manages customers, products, invoices, and reports using browser local storage.

## Project Architecture
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (via CDN)
- **Icons**: Lucide React
- **Storage**: Browser localStorage (no backend/database)
- **Entry Point**: `index.tsx` (single-file React application)

## Structure
- `index.html` - HTML entry point
- `index.tsx` - Full React application (components, types, logic)
- `vite.config.ts` - Vite configuration (port 5000, host 0.0.0.0)
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies

## Development
- Run: `npm run dev` (starts on port 5000)
- Build: `npm run build` (outputs to `dist/`)
- Deployment: Static site (dist directory)
