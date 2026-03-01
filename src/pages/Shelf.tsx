import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Library, Star, Eye, EyeOff, Clock, Filter, StickyNote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MovieDetailPanel, BrowseTarget } from "@/components/MovieDetailPanel";
import { TMDB_IMAGE_BASE } from "@/hooks/useTMDb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
};

type WatchFilter = "all" | "watched" | "unwatched";

const Shelf = () => {
  const { user } = useAuth();
  const [watchFilter, setWatchFilter] = useState<WatchFilter>("all");
  const [genreFilter, setGenreFilter] = useState<number | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const { data: movies, isLoading } = useQuery({
    queryKey: ["user-movies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_movies")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Derive available genres from shelf movies
  const availableGenres = new Map<number, string>();
  movies?.forEach((m) => {
    (m.genre_ids as number[] | null)?.forEach((gid) => {
      if (GENRE_MAP[gid]) availableGenres.set(gid, GENRE_MAP[gid]);
    });
  });

  // Filter client-side
  const filtered = movies?.filter((m) => {
    if (watchFilter === "watched" && m.status !== "watched") return false;
    if (watchFilter === "unwatched" && m.status === "watched") return false;
    if (genreFilter !== null && !(m.genre_ids as number[] | null)?.includes(genreFilter)) return false;
    return true;
  });

  const lastModified = movies?.[0]?.updated_at;

  const handleBrowse = (target: BrowseTarget) => {
    // Could navigate to discover page; for now just close panel
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">My Shelf</h1>
          <p className="mt-1 text-muted-foreground">Your personal movie collection.</p>
        </div>
        {lastModified && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 pt-2">
            <Clock className="h-3 w-3" />
            Updated {formatDistanceToNow(new Date(lastModified), { addSuffix: true })}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {(["all", "watched", "unwatched"] as WatchFilter[]).map((v) => (
          <Button
            key={v}
            size="sm"
            variant={watchFilter === v ? "default" : "outline"}
            onClick={() => setWatchFilter(v)}
            className="text-xs gap-1.5"
          >
            {v === "watched" && <Eye className="h-3 w-3" />}
            {v === "unwatched" && <EyeOff className="h-3 w-3" />}
            {v === "all" ? "All" : v === "watched" ? "Watched" : "Unwatched"}
          </Button>
        ))}

        {/* Genre filter popover */}
        {availableGenres.size > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant={genreFilter !== null ? "default" : "outline"}
                className="text-xs gap-1.5"
              >
                <Filter className="h-3 w-3" />
                {genreFilter !== null ? availableGenres.get(genreFilter) : "Genre"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant={genreFilter === null ? "default" : "outline"}
                  onClick={() => setGenreFilter(null)}
                  className="text-xs h-7"
                >
                  All
                </Button>
                {[...availableGenres.entries()].map(([gid, name]) => (
                  <Button
                    key={gid}
                    size="sm"
                    variant={genreFilter === gid ? "default" : "outline"}
                    onClick={() => setGenreFilter(genreFilter === gid ? null : gid)}
                    className="text-xs h-7"
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((movie, i) => {
            const posterUrl = movie.poster_path
              ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}`
              : null;
            const isWatched = movie.status === "watched";

            return (
              <motion.button
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => {
                  setSelectedMovieId(movie.movie_id);
                  setPanelOpen(true);
                }}
                className="group relative flex flex-col rounded-xl overflow-hidden glass-card-hover text-left focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted/30">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                      No poster
                    </div>
                  )}

                  {/* Watched indicator */}
                  <div className="absolute top-2 left-2">
                    {isWatched ? (
                      <div className="flex items-center justify-center rounded-md bg-primary/90 backdrop-blur-sm p-1.5 text-primary-foreground">
                        <Eye className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 rounded-md bg-background/80 backdrop-blur-sm px-2 py-1 text-xs font-medium text-muted-foreground">
                        <EyeOff className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  {movie.rating && (
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-md bg-background/80 backdrop-blur-sm px-2 py-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${s <= movie.rating! ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                <div className="p-3 space-y-1">
                  <h3 className="font-display font-semibold text-sm leading-tight line-clamp-2">
                    {movie.title}
                  </h3>
                  {movie.notes && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <StickyNote className="h-3 w-3" />
                      <span className="truncate">Has notes</span>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-xl p-12 text-center space-y-3">
          <Library className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-muted-foreground">
            {watchFilter === "all" && !genreFilter
              ? "Your shelf is empty. Search for movies to get started!"
              : "No movies match your current filters."}
          </p>
        </div>
      )}

      <MovieDetailPanel
        movieId={selectedMovieId}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        onBrowse={handleBrowse}
      />
    </div>
  );
};

export default Shelf;
