import { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Plus, Trash2 } from "lucide-react";
import { useMovieDetails, TMDB_IMAGE_BASE } from "@/hooks/useTMDb";
import { useUserMovie } from "@/hooks/useUserMovie";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type WatchStatus = Database["public"]["Enums"]["watch_status"];

const STATUS_OPTIONS: { value: WatchStatus; label: string }[] = [
  { value: "plan_to_watch", label: "Plan to Watch" },
  { value: "watching", label: "Watching" },
  { value: "watched", label: "Watched" },
  { value: "dropped", label: "Dropped" },
];

interface MovieDetailPanelProps {
  movieId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovieDetailPanel({ movieId, open, onOpenChange }: MovieDetailPanelProps) {
  const { data: details, isLoading } = useMovieDetails(open ? movieId : null);
  const { userMovie, addToShelf, updateStatus, updateRating, updateNotes, removeFromShelf } =
    useUserMovie(open ? movieId : null);

  const [localNotes, setLocalNotes] = useState("");
  const debouncedNotes = useDebounce(localNotes, 800);

  // Sync notes from DB
  useEffect(() => {
    if (userMovie) setLocalNotes(userMovie.notes ?? "");
  }, [userMovie?.notes]);

  // Autosave notes
  useEffect(() => {
    if (userMovie && debouncedNotes !== (userMovie.notes ?? "")) {
      updateNotes.mutate(debouncedNotes);
    }
  }, [debouncedNotes]);

  const handleAdd = useCallback(() => {
    if (!details) return;
    addToShelf.mutate(
      { title: details.title, poster_path: details.poster_path },
      { onSuccess: () => toast.success(`"${details.title}" added to shelf`) }
    );
  }, [details, addToShelf]);

  const handleRemove = useCallback(() => {
    if (!details) return;
    removeFromShelf.mutate(undefined, {
      onSuccess: () => toast.success(`"${details.title}" removed from shelf`),
    });
  }, [details, removeFromShelf]);

  const year = details?.release_date?.split("-")[0];
  const posterUrl = details?.poster_path ? `${TMDB_IMAGE_BASE}/w500${details.poster_path}` : null;
  const cast = details?.credits?.cast?.slice(0, 8) ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto glass-card border-border/40 p-0">
        {isLoading || !details ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-72 w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            {/* Poster */}
            {posterUrl && (
              <div className="relative w-full aspect-[2/3] max-h-[360px] overflow-hidden">
                <img src={posterUrl} alt={details.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
            )}

            <div className="p-6 space-y-5 -mt-12 relative z-10">
              {/* Hidden sheet description for accessibility */}
              <SheetHeader className="space-y-1">
                <SheetTitle className="text-2xl font-display font-bold leading-tight">
                  {details.title}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Details for {details.title}
                </SheetDescription>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {year && <span>{year}</span>}
                  {details.runtime && <span>· {details.runtime} min</span>}
                  {details.vote_average > 0 && (
                    <span className="flex items-center gap-1">
                      · <Star className="h-3 w-3 fill-accent text-accent" />
                      {details.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>
              </SheetHeader>

              {/* Genres */}
              {details.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {details.genres.map((g) => (
                    <Badge key={g.id} variant="secondary" className="text-xs">
                      {g.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              {details.overview && (
                <p className="text-sm text-muted-foreground leading-relaxed">{details.overview}</p>
              )}

              {/* Cast */}
              {cast.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Cast
                  </h4>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {cast.map((c) => (
                      <div key={c.id} className="flex flex-col items-center gap-1 min-w-[60px]">
                        {c.profile_path ? (
                          <img
                            src={`${TMDB_IMAGE_BASE}/w185${c.profile_path}`}
                            alt={c.name}
                            className="h-14 w-14 rounded-full object-cover border border-border/40"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            ?
                          </div>
                        )}
                        <span className="text-[10px] text-center leading-tight line-clamp-2">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shelf controls */}
              {!userMovie ? (
                <Button
                  onClick={handleAdd}
                  disabled={addToShelf.isPending}
                  className="w-full glow-primary"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Shelf
                </Button>
              ) : (
                <div className="space-y-4 glass-card rounded-xl p-4">
                  {/* Status toggle */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {STATUS_OPTIONS.map((s) => (
                        <Button
                          key={s.value}
                          size="sm"
                          variant={userMovie.status === s.value ? "default" : "outline"}
                          onClick={() => {
                            updateStatus.mutate(s.value, {
                              onSuccess: () => toast.success(`Status set to "${s.label}"`),
                            });
                          }}
                          disabled={updateStatus.isPending}
                          className="text-xs"
                        >
                          {s.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Rating (only for watched) */}
                  {userMovie.status === "watched" && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Your Rating
                      </h4>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => {
                              const newRating = userMovie.rating === star ? null : star;
                              updateRating.mutate(newRating);
                            }}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                (userMovie.rating ?? 0) >= star
                                  ? "fill-accent text-accent"
                                  : "text-muted-foreground/40"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Notes
                    </h4>
                    <Textarea
                      placeholder="Add personal notes..."
                      value={localNotes}
                      onChange={(e) => setLocalNotes(e.target.value)}
                      className="glass-input min-h-[80px] text-sm resize-none"
                    />
                  </div>

                  {/* Remove */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={removeFromShelf.isPending}
                    className="text-destructive hover:text-destructive w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove from Shelf
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
