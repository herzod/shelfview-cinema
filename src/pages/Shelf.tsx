import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Library } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MovieDetailPanel } from "@/components/MovieDetailPanel";
import { TMDB_IMAGE_BASE } from "@/hooks/useTMDb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import type { Database } from "@/integrations/supabase/types";

type WatchStatus = Database["public"]["Enums"]["watch_status"];

const STATUS_LABELS: Record<WatchStatus, string> = {
  plan_to_watch: "Plan to Watch",
  watching: "Watching",
  watched: "Watched",
  dropped: "Dropped",
};

const STATUS_FILTERS: { value: WatchStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "plan_to_watch", label: "Plan to Watch" },
  { value: "watching", label: "Watching" },
  { value: "watched", label: "Watched" },
  { value: "dropped", label: "Dropped" },
];

const Shelf = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<WatchStatus | "all">("all");
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const { data: movies, isLoading } = useQuery({
    queryKey: ["user-movies", filter],
    queryFn: async () => {
      let query = supabase
        .from("user_movies")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">
          My Shelf
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your personal movie collection.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <Button
            key={s.value}
            size="sm"
            variant={filter === s.value ? "default" : "outline"}
            onClick={() => setFilter(s.value)}
            className="text-xs"
          >
            {s.label}
          </Button>
        ))}
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
      ) : movies && movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie, i) => {
            const posterUrl = movie.poster_path
              ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}`
              : null;

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

                  {/* Status badge */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm">
                      {STATUS_LABELS[movie.status]}
                    </Badge>
                  </div>

                  {/* Rating */}
                  {movie.rating && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-background/80 backdrop-blur-sm px-2 py-1 text-xs font-medium">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      {movie.rating}/5
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                <div className="p-3 space-y-1">
                  <h3 className="font-display font-semibold text-sm leading-tight line-clamp-2">
                    {movie.title}
                  </h3>
                </div>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-xl p-12 text-center space-y-3">
          <Library className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-muted-foreground">
            {filter === "all"
              ? "Your shelf is empty. Search for movies to get started!"
              : `No movies with status "${STATUS_LABELS[filter]}".`}
          </p>
        </div>
      )}

      <MovieDetailPanel
        movieId={selectedMovieId}
        open={panelOpen}
        onOpenChange={setPanelOpen}
      />
    </div>
  );
};

export default Shelf;
