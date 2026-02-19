# Agent Guide - Shelfview Cinema

Welcome to the **Shelfview Cinema** project. This document provides essential context and instructions for AI agents working on this codebase.

## 🚀 Project Overview
Shelfview Cinema is a modern web application built for movie browsing and management. It uses a premium, dynamic design powered by React and Tailwind CSS.

## 🛠 Tech Stack
- **Framework**: [React](https://react.dev/) (with Vite)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (based on Radix UI)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend/Auth**: [Supabase](https://supabase.com/)

## 📂 Project Structure
- `src/components/`: Reusable UI components (shadcn and custom).
- `src/pages/`: Main application pages/views.
- `src/hooks/`: Custom React hooks.
- `src/lib/`: Utility functions and third-party library initializations (e.g., Supabase client).
- `src/integrations/`: Supabase and other external integration logic.
- `supabase/`: Local Supabase configuration and migrations.
- `public/`: Static assets.

## 💻 Development Commands
- `npm run dev`: Starts the local development server.
- `npm run build`: Builds the production bundle.
- `npm run lint`: Runs ESLint for code quality checks.
- `npm test`: Runs the test suite using Vitest.

## 📝 Coding Conventions
1. **Functional Components**: Use functional components with hooks.
2. **TypeScript**: Ensure strict typing for all components and functions.
3. **Styling**: Use Tailwind CSS for all styling. Avoid custom CSS unless absolutely necessary.
4. **Icons**: Use `Lucide React` for icons to maintain consistency.
5. **UI**: Prefer `shadcn/ui` components. If a new component is needed, check if it exists in shadcn first.
6. **Responsiveness**: Always build with a mobile-first approach using Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, etc.).

## 🤖 Agent Instructions
- Always prioritize **Visual Excellence**. Ensure the UI feels premium, with smooth transitions and coordinated color palettes.
- Follow **SEO Best Practices** (semantic HTML, proper heading hierarchy).
- Maintain **Accessibility** (ARIA labels, keyboard navigation).
- When adding new features, refer to existing patterns in `src/pages` and `src/components`.
