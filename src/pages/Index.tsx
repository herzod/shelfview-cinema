import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Index = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">
          Discover Movies
        </h1>
        <p className="mt-1 text-muted-foreground">
          Search for any movie to add it to your shelf.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search movies..."
          className="pl-10 glass-input h-12 text-base"
        />
      </div>

      <div className="glass-card rounded-xl p-12 text-center">
        <p className="text-muted-foreground">
          Start typing to search for movies
        </p>
      </div>
    </div>
  );
};

export default Index;
