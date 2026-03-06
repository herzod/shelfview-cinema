import { motion } from "framer-motion";
import { Star, BookmarkCheck } from "lucide-react";
import { TMDbMovie, TMDB_IMAGE_BASE } from "@/hooks/useTMDb";

interface MovieCardProps {
  movie: TMDbMovie;
  onClick: (movie: TMDbMovie) => void;
  index?: number;
  isOnShelf?: boolean;
  customGroup?: string[] | null;
  isSelectable?: boolean;
  isSelected?: boolean;
}

export function MovieCard({ movie, onClick, index = 0, isOnShelf, customGroup, isSelectable, isSelected }: MovieCardProps) {
  const year = movie.release_date?.split("-")[0];
  const rating = movie.vote_average?.toFixed(1);
  const posterUrl = movie.poster_path
    ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}`
    : null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => onClick(movie)}
      className={`group relative flex flex-col rounded-xl overflow-hidden glass-card-hover text-left focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${isSelectable && isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[0.98]" : ""
        } ${isSelectable && !isSelected ? "opacity-70 hover:opacity-100" : ""}`}
    >
      {/* Poster */}
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

        {/* Rating badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-background/80 backdrop-blur-sm px-2 py-1 text-xs font-medium">
            <Star className="h-3 w-3 fill-accent text-accent" />
            {rating}
          </div>
        )}

        {/* On shelf indicator */}
        {isOnShelf && (
          <div className="absolute top-2 left-2 flex items-center rounded-md bg-primary/90 backdrop-blur-sm p-1.5 text-primary-foreground">
            <BookmarkCheck className="h-3 w-3" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <h3 className="font-display font-semibold text-sm leading-tight line-clamp-2">
          {movie.title}
        </h3>
        <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-1">
          {year && <span>{year}</span>}
          <div className="flex flex-wrap gap-1 justify-end">
            {customGroup?.map((group) => (
              <span key={group} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 truncate max-w-[80px]">
                {group}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
