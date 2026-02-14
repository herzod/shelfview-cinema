import { useQuery } from "@tanstack/react-query";


export interface TMDbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
}

interface TMDbSearchResponse {
  page: number;
  results: TMDbMovie[];
  total_pages: number;
  total_results: number;
}

async function fetchTMDb(params: Record<string, string>): Promise<TMDbSearchResponse> {
  const url = new URL(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tmdb-proxy`
  );
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch from TMDb");
  return res.json();
}

export function useMovieSearch(query: string) {
  return useQuery({
    queryKey: ["tmdb-search", query],
    queryFn: () => fetchTMDb({ action: "search", query }),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTrendingMovies() {
  return useQuery({
    queryKey: ["tmdb-trending"],
    queryFn: () => fetchTMDb({ action: "trending" }),
    staleTime: 1000 * 60 * 30,
  });
}

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
