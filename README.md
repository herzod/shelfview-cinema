# ShelfView Cinema

A personal movie watchlist manager built to discover, track, and manage your movie watching experience.

## Features

- Search and discover movies via TMDB
- Browse trending movies and filter by genre
- View movie details including cast, directors, and crew
- Create and manage your personal movie shelf
- Track watch status: Plan to Watch, Watching, Watched, Dropped
- Rate movies and add personal notes

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui
- **Animation:** Framer Motion
- **Data Fetching:** TanStack Query
- **Backend:** Supabase (Auth + Database)

## Prerequisites

- Node.js 18+ 
- npm

## Getting Started

```bash
# Clone the repository
git clone <(http://localhost:8080/shelfview-cinema/)>

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

Create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
VITE_TMDB_API_KEY=your_tmdb_api_key
```

- **Supabase:** Create a project at [supabase.com](https://supabase.com) and create a `user_movies` table with the schema defined in `src/integrations/supabase/types.ts`
- **TMDB:** Get an API key at [themoviedb.org](https://www.themoviedb.org/settings/api)
