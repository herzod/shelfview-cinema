import { useState } from "react";
import { Search, TrendingUp, ArrowLeft, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MovieCard } from "@/components/MovieCard";
import { MovieGridSkeleton } from "@/components/MovieGridSkeleton";
import { MovieDetailPanel, BrowseTarget } from "@/components/MovieDetailPanel";
import { useDebounce } from "@/hooks/useDebounce";
import { useMovieSearch, useTrendingMovies, useDiscoverByGenre, usePersonMovies, TMDbMovie } from "@/hooks/useTMDb";
import { useShelfMovieIds } from "@/hooks/useShelfMovieIds";

const TMDB_GENRES: { id: number; name: string }[] = [
  { id: 28, name: "Action" }, { id: 12, name: "Adventure" }, { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" }, { id: 80, name: "Crime" }, { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" }, { id: 10751, name: "Family" }, { id: 14, name: "Fantasy" },
  { id: 36, name: "History" }, { id: 27, name: "Horror" }, { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" }, { id: 10749, name: "Romance" }, { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" }, { id: 10752, name: "War" }, { id: 37, name: "Western" },
];

const Index = () => {
  const [query, setQuery] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [browseTarget, setBrowseTarget] = useState<BrowseTarget | null>(null);
  const [genreFilterId, setGenreFilterId] = useState<number | null>(null);
  const [showGenres, setShowGenres] = useState(false);
  const debouncedQuery = useDebounce(query.trim(), 400);

  const isSearching = debouncedQuery.length >= 2;
  const isBrowsing = browseTarget !== null;
  const isGenreFiltering = genreFilterId !== null && !isBrowsing && !isSearching;

  const searchResults = useMovieSearch(debouncedQuery);
  const trendingResults = useTrendingMovies();
  const genreResults = useDiscoverByGenre(
    browseTarget?.type === "genre" ? browseTarget.id : isGenreFiltering ? genreFilterId : null
  );
  const castResults = usePersonMovies(
    browseTarget?.type === "cast" || browseTarget?.type === "director" ? browseTarget.id : null,
    browseTarget?.type === "director" ? "crew" : "cast"
  );
  const { data: shelfIds } = useShelfMovieIds();

  // Determine which results to show
  let activeQuery = isSearching ? searchResults : isGenreFiltering ? genreResults : trendingResults;
  if (isBrowsing && !isSearching) {
    activeQuery = browseTarget.type === "genre" ? genreResults : castResults;
  }
  const movies = activeQuery.data?.results ?? [];

  const handleMovieClick = (movie: TMDbMovie) => {
    setSelectedMovieId(movie.id);
    setPanelOpen(true);
  };

  const handleBrowse = (target: BrowseTarget) => {
    setBrowseTarget(target);
    setGenreFilterId(null);
    setQuery("");
  };

  const clearBrowse = () => {
    setBrowseTarget(null);
  };

  const selectedGenreName = TMDB_GENRES.find((g) => g.id === genreFilterId)?.name;

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

      {/* Search input + genre toggle */}
      <div className="flex gap-2 items-start max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 glass-input h-12 text-base"
          />
        </div>
        <Button
          variant={showGenres || genreFilterId ? "default" : "outline"}
          size="icon"
          className="h-12 w-12 shrink-0"
          onClick={() => setShowGenres(!showGenres)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Genre filter pills */}
      {showGenres && (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={genreFilterId === null ? "default" : "outline"}
            onClick={() => {
              setGenreFilterId(null);
              setBrowseTarget(null);
            }}
            className="text-xs"
          >
            All Genres
          </Button>
          {TMDB_GENRES.map((g) => (
            <Button
              key={g.id}
              size="sm"
              variant={genreFilterId === g.id ? "default" : "outline"}
              onClick={() => {
                setGenreFilterId(genreFilterId === g.id ? null : g.id);
                setBrowseTarget(null);
              }}
              className="text-xs"
            >
              {g.name}
            </Button>
          ))}
        </div>
      )}

      {/* Browse mode header */}
      {isBrowsing && !isSearching && (
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={clearBrowse} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <span className="text-sm text-muted-foreground">
            {browseTarget.type === "genre" ? "Genre" : browseTarget.type === "director" ? "Director" : "Movies with"}: <span className="text-foreground font-medium">{browseTarget.name}</span>
          </span>
        </div>
      )}

      {/* Section header */}
      {!isSearching && !isBrowsing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>{isGenreFiltering ? `${selectedGenreName} movies` : "Trending this week"}</span>
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
              isOnShelf={shelfIds?.has(movie.id)}
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
        onBrowse={handleBrowse}
      />
    </div>
  );
};

export default Index;
