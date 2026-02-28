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

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

async function fetchTMDb(params: Record<string, string>): Promise<TMDbSearchResponse> {
  const url = new URL(`${TMDB_BASE}/${params.path || "search/movie"}`);
  url.searchParams.set("api_key", TMDB_API_KEY);

  Object.entries(params).forEach(([k, v]) => {
    if (k !== "path") url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch from TMDb");
  return res.json();
}

export function useMovieSearch(query: string) {
  return useQuery({
    queryKey: ["tmdb-search", query],
    queryFn: () => fetchTMDb({ path: "search/movie", query }),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTrendingMovies() {
  return useQuery({
    queryKey: ["tmdb-trending"],
    queryFn: () => fetchTMDb({ path: "trending/movie/week" }),
    staleTime: 1000 * 60 * 30,
  });
}


export interface TMDbMovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  runtime: number | null;
  genres: { id: number; name: string }[];
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string; profile_path: string | null }[];
  };
}

export function useMovieDetails(movieId: number | null) {
  return useQuery<TMDbMovieDetails>({
    queryKey: ["tmdb-details", movieId],
    queryFn: async () => {
      const url = new URL(`${TMDB_BASE}/movie/${movieId}`);
      url.searchParams.set("api_key", TMDB_API_KEY);
      url.searchParams.set("append_to_response", "credits");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch movie details");
      return res.json();
    },
    enabled: movieId !== null,
    staleTime: 1000 * 60 * 60,
  });
}

export function useSimilarMovies(movieId: number | null) {
  return useQuery<{ results: TMDbMovie[] }>({
    queryKey: ["tmdb-similar", movieId],
    queryFn: () => fetchTMDb({ path: `movie/${movieId}/similar` }),
    enabled: movieId !== null,
    staleTime: 1000 * 60 * 60,
  });
}

export function useDiscoverByGenre(genreId: number | null, genreName?: string) {
  return useQuery<TMDbSearchResponse>({
    queryKey: ["tmdb-discover-genre", genreId],
    queryFn: () => fetchTMDb({
      path: "discover/movie",
      genre_id: String(genreId!),
      sort_by: "popularity.desc"
    }),
    enabled: genreId !== null,
    staleTime: 1000 * 60 * 30,
  });
}

export function usePersonMovies(personId: number | null, role: "cast" | "crew" = "cast") {
  return useQuery<TMDbSearchResponse>({
    queryKey: ["tmdb-person-movies", personId, role],
    queryFn: () => {
      const withParam = role === "crew" ? "with_crew" : "with_cast";
      return fetchTMDb({
        path: "discover/movie",
        [withParam]: String(personId!),
        sort_by: "popularity.desc"
      });
    },
    enabled: personId !== null,
    staleTime: 1000 * 60 * 30,
  });
}


export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
