import { Library } from "lucide-react";

const Shelf = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">
          My Shelf
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your personal movie collection.
        </p>
      </div>

      <div className="glass-card rounded-xl p-12 text-center space-y-3">
        <Library className="h-12 w-12 text-muted-foreground/40 mx-auto" />
        <p className="text-muted-foreground">
          Your shelf is empty. Search for movies to get started!
        </p>
      </div>
    </div>
  );
};

export default Shelf;
