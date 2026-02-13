

# Cineshelf — Movie Tracking App

## Overview
A sleek, dark-mode movie tracking app with glassmorphism design where users search for movies via TMDb, add them to a personal shelf, and track their watch status, ratings, and notes.

---

## Phase 1: Layout & Design Shell
- **Dark glassmorphism theme** — Dark background with frosted-glass card effects, subtle borders, and backdrop-blur throughout
- **Sidebar navigation** — Collapsible sidebar with links: Search, My Shelf, Settings
- **Responsive layout** — Sidebar collapses to bottom nav or hamburger on mobile

## Phase 2: Supabase Backend Setup
- **Lovable Cloud** with Supabase for auth and data
- **Google Sign-in** authentication (OAuth)
- **`user_movies` table** — Columns: `id`, `user_id`, `movie_id`, `title`, `poster_path`, `status` (plan_to_watch / watching / watched / dropped), `rating` (1-5, nullable), `notes` (text), `created_at`, `updated_at`
- **Row-Level Security** — Users can only access their own shelf data
- **TMDb API key** stored as a server-side secret, accessed via an edge function

## Phase 3: Movie Search & Discovery
- **Edge function** to proxy TMDb API calls (search + movie details) so the API key stays secure
- **Search page** with real-time search input and debounced queries
- **Movie results grid** — Responsive poster cards with title, year, and rating overlay
- **Hover animations** — Subtle scale-up effect on movie cards

## Phase 4: Movie Detail Panel
- **Slide-over panel** (or modal) when clicking a movie card
- Shows: poster, title, year, synopsis, genres, cast (from TMDb)
- **"Add to Shelf"** button for movies not yet saved
- For shelf movies: status toggle, conditional 5-star rating (shown when status = "Watched"), and personal notes textarea with autosave

## Phase 5: My Shelf
- **Personal library page** showing all saved movies in a grid
- **Filter by status** — Tabs or dropdown: All, Plan to Watch, Watching, Watched, Dropped
- **Sort by rating** — Sort saved movies by personal rating (high to low / low to high)
- Status badges on each card for quick visual scanning

## Phase 6: Settings & Polish
- **Settings page** — Account info, sign-out button
- **Smooth page transitions** and loading skeletons
- **Mobile-responsive** — Grid adapts from 4+ columns on desktop down to 2 on mobile
- **Toast notifications** for actions (added to shelf, status updated, etc.)

