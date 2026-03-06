import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Library, Star, Eye, EyeOff, Clock, Filter, StickyNote, Folders, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MovieDetailPanel, BrowseTarget } from "@/components/MovieDetailPanel";
import { TMDB_IMAGE_BASE } from "@/hooks/useTMDb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUpdateMovieGroup } from "@/hooks/useUpdateMovieGroup";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GroupTagsPopover } from "@/components/GroupTagsPopover";

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

  const [isManageMode, setIsManageMode] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [localEmptyGroups, setLocalEmptyGroups] = useState<string[]>([]);
  const updateGroup = useUpdateMovieGroup();

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

  const availableCustomGroups = useMemo(() => {
    const groups = new Set<string>([...localEmptyGroups]);
    movies?.forEach(m => {
      if (m.custom_group) m.custom_group.forEach(g => groups.add(g));
    });
    return Array.from(groups).sort();
  }, [movies]);

  // Filter client-side
  const filtered = movies?.filter((m) => {
    if (watchFilter === "watched" && m.status !== "watched") return false;
    if (watchFilter === "unwatched" && m.status === "watched") return false;
    if (genreFilter !== null && !(m.genre_ids as number[] | null)?.includes(genreFilter)) return false;
    return true;
  });

  const groupedMovies = useMemo(() => {
    if (!filtered) return null;
    const groups: Record<string, typeof filtered> = {};

    // Ensure all known groups (including empty ones) exist
    localEmptyGroups.forEach(g => {
      groups[g] = [];
    });

    filtered.forEach(m => {
      const gs = m.custom_group || [];
      if (gs.length === 0) {
        if (!groups["Ungrouped"]) groups["Ungrouped"] = [];
        groups["Ungrouped"].push(m);
      } else {
        gs.forEach(g => {
          if (!groups[g]) groups[g] = [];
          groups[g].push(m);
        });
      }
    });

    return Object.entries(groups).sort((a, b) => {
      if (a[0] === "Ungrouped") return 1;
      if (b[0] === "Ungrouped") return -1;
      return a[0].localeCompare(b[0]);
    });
  }, [filtered]);

  const lastModified = movies?.[0]?.updated_at;

  const handleBrowse = (target: BrowseTarget) => {
    // Could navigate to discover page; for now just close panel
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return; // No reordering within groups yet

    const movieId = parseInt(draggableId, 10);
    const movie = filtered?.find(m => m.movie_id === movieId);
    if (!movie) return;

    let newGroups = movie.custom_group ? [...movie.custom_group] : [];

    // Remove from source if it wasn't ungrouped
    if (source.droppableId !== "Ungrouped") {
      newGroups = newGroups.filter(g => g !== source.droppableId);
    }

    // Add to destination if it isn't ungrouped
    if (destination.droppableId !== "Ungrouped") {
      newGroups.push(destination.droppableId);
      // Remove from local empty groups if it was there since it's no longer empty
      setLocalEmptyGroups(prev => prev.filter(g => g !== destination.droppableId));
    }

    updateGroup.mutate({ movieId, group: newGroups.length > 0 ? newGroups : null });
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

      {/* Filters & Manage Toggle */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2 items-center justify-between">
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

          <Button
            size="sm"
            variant={isManageMode ? "default" : "outline"}
            onClick={() => {
              setIsManageMode(!isManageMode);
              if (!isManageMode && availableCustomGroups.length > 0 && !activeGroup) {
                setActiveGroup(availableCustomGroups[0]);
              }
            }}
            className="text-xs gap-1.5 shrink-0"
          >
            <Folders className="h-4 w-4" />
            {isManageMode ? "Done Managing" : "Manage Groups"}
          </Button>
        </div>

        {/* Manage Mode Toolbar */}
        {isManageMode && (
          <div className="flex flex-wrap items-center gap-2 p-3 glass-card rounded-xl bg-primary/5 border-primary/20">
            <span className="text-sm font-medium mr-2">Target Group:</span>
            {availableCustomGroups.map((g) => (
              <Button
                key={g}
                size="sm"
                variant={activeGroup === g ? "default" : "secondary"}
                onClick={() => setActiveGroup(g)}
                className="text-xs h-7"
              >
                {g}
              </Button>
            ))}
            <div className="flex items-center gap-1 ml-auto">
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-7 text-xs px-3">
                    <Plus className="h-3 w-3 mr-1" />
                    New Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                    <DialogDescription>
                      Create a new custom group for your movies. It will appear on your shelf to drag movies into.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Input
                        id="name"
                        placeholder="e.g. Marvel, Favorites..."
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="col-span-4"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newGroupName.trim()) {
                            setActiveGroup(newGroupName.trim());
                            setLocalEmptyGroups(prev => Array.from(new Set([...prev, newGroupName.trim()])));
                            setNewGroupName("");
                            setIsCreateModalOpen(false);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={!newGroupName.trim()}
                      onClick={() => {
                        setActiveGroup(newGroupName.trim());
                        setLocalEmptyGroups(prev => Array.from(new Set([...prev, newGroupName.trim()])));
                        setNewGroupName("");
                        setIsCreateModalOpen(false);
                      }}
                    >
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
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
      ) : groupedMovies && groupedMovies.length > 0 ? (
        <div className="space-y-8">
          {isManageMode ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filtered?.map((movie, i) => {
                const posterUrl = movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null;
                const isWatched = movie.status === "watched";
                const isSelected = movie.custom_group?.includes(activeGroup) ?? false;

                return (
                  <motion.button
                    key={movie.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    onClick={() => {
                      if (!activeGroup) return; // Prevent action if no group is selected to add to
                      let newGroups = movie.custom_group ? [...movie.custom_group] : [];
                      if (isSelected) {
                        newGroups = newGroups.filter(g => g !== activeGroup);
                      } else {
                        newGroups.push(activeGroup);
                      }
                      updateGroup.mutate({ movieId: movie.movie_id, group: newGroups.length > 0 ? newGroups : null });
                    }}
                    className={`group relative flex flex-col rounded-xl overflow-hidden glass-card-hover text-left focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[0.98]" : "opacity-70 hover:opacity-100"
                      }`}
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted/30">
                      {posterUrl ? (
                        <img src={posterUrl} alt={movie.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No poster</div>
                      )}
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
                      {movie.rating && (
                        <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-md bg-background/80 backdrop-blur-sm px-2 py-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-3 w-3 ${s <= movie.rating! ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                    <div className="p-3 space-y-1">
                      <h3 className="font-display font-semibold text-sm leading-tight line-clamp-2">{movie.title}</h3>
                      <div className="flex items-center justify-between gap-1">
                        {movie.notes && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <StickyNote className="h-3 w-3" />
                            <span className="truncate">Notes</span>
                          </div>
                        )}
                        {!isManageMode && (
                          <GroupTagsPopover
                            movieId={movie.movie_id}
                            currentGroups={movie.custom_group || []}
                            allGroups={availableCustomGroups}
                          />
                        )}
                      </div>
                      {movie.custom_group && (
                        <div className="flex flex-wrap gap-1 justify-end">
                          {movie.custom_group.map(g => (
                            <span key={g} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 text-[10px] truncate max-w-[80px]">
                              {g}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              {groupedMovies.map(([groupName, groupMovies]) => (
                <div key={groupName} className="space-y-3">
                  {groupName !== "Ungrouped" && (
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-display font-bold px-1">{groupName}</h3>
                      <Badge variant="secondary" className="text-xs bg-muted/50">{groupMovies.length}</Badge>
                    </div>
                  )}
                  <Droppable droppableId={groupName} direction="horizontal">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 min-h-[250px] p-2 -m-2 rounded-xl transition-colors"
                      >
                        {groupMovies.map((movie, i) => {
                          const posterUrl = movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null;
                          const isWatched = movie.status === "watched";

                          return (
                            <Draggable key={`${groupName}-${movie.movie_id}`} draggableId={movie.movie_id.toString()} index={i}>
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  style={{
                                    ...dragProvided.draggableProps.style,
                                    transform: dragSnapshot.isDragging ? dragProvided.draggableProps.style?.transform : "translate(0, 0)",
                                  }}
                                  onClick={() => {
                                    if (!dragSnapshot.isDragging) {
                                      setSelectedMovieId(movie.movie_id);
                                      setPanelOpen(true);
                                    }
                                  }}
                                  className={`group relative flex flex-col rounded-xl overflow-hidden glass-card text-left focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow ${dragSnapshot.isDragging ? "shadow-2xl ring-2 ring-primary scale-105 z-50 cursor-grabbing" : "cursor-grab glass-card-hover"
                                    }`}
                                >
                                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted/30">
                                    {posterUrl ? (
                                      <img src={posterUrl} alt={movie.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No poster</div>
                                    )}
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
                                    {movie.rating && (
                                      <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-md bg-background/80 backdrop-blur-sm px-2 py-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                          <Star key={s} className={`h-3 w-3 ${s <= movie.rating! ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                                        ))}
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                  </div>
                                  <div className="p-3 space-y-1">
                                    <h3 className="font-display font-semibold text-sm leading-tight line-clamp-2">{movie.title}</h3>
                                    <div className="flex items-center justify-between gap-1">
                                      {movie.notes && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <StickyNote className="h-3 w-3" />
                                          <span className="truncate">Notes</span>
                                        </div>
                                      )}
                                      <GroupTagsPopover
                                        movieId={movie.movie_id}
                                        currentGroups={movie.custom_group || []}
                                        allGroups={availableCustomGroups}
                                      />
                                    </div>
                                    {movie.custom_group && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {movie.custom_group.map(g => (
                                          <span key={g} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 text-[10px] truncate max-w-[80px]">
                                            {g}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </DragDropContext>
          )}
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
