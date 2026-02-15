import { useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MovieCard } from "@/components/MovieCard";
import { MovieGridSkeleton } from "@/components/MovieGridSkeleton";
import { MovieDetailPanel } from "@/components/MovieDetailPanel";
import { useDebounce } from "@/hooks/useDebounce";
import { useMovieSearch, useTrendingMovies, TMDbMovie } from "@/hooks/useTMDb";

const Index = () => {
  const [query, setQuery] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const debouncedQuery = useDebounce(query.trim(), 400);

  const isSearching = debouncedQuery.length >= 2;
  const searchResults = useMovieSearch(debouncedQuery);
  const trendingResults = useTrendingMovies();

  const activeQuery = isSearching ? searchResults : trendingResults;
  const movies = activeQuery.data?.results ?? [];

  const handleMovieClick = (movie: TMDbMovie) => {
    setSelectedMovieId(movie.id);
    setPanelOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">
          Discover Movies
        </h1>
        <p className="mt-1 text-muted-foreground">
          Search for any movie to add it to your shelf.
        </p>
      </div>

      {/* Search input */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 glass-input h-12 text-base"
        />
      </div>

      {/* Section header */}
      {!isSearching && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Trending this week</span>
        </div>
      )}

      {isSearching && debouncedQuery && (
        <p className="text-sm text-muted-foreground">
          {activeQuery.isLoading
            ? "Searching..."
            : `${activeQuery.data?.total_results ?? 0} results for "${debouncedQuery}"`}
        </p>
      )}

      {/* Results grid */}
      {activeQuery.isLoading ? (
        <MovieGridSkeleton />
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie, i) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={handleMovieClick}
              index={i}
            />
          ))}
        </div>
      ) : isSearching ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-muted-foreground">
            No movies found for "{debouncedQuery}"
          </p>
        </div>
      ) : null}

      <MovieDetailPanel
        movieId={selectedMovieId}
        open={panelOpen}
        onOpenChange={setPanelOpen}
      />
    </div>
  );
};

export default Index;
