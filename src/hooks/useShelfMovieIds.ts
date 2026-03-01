import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useShelfMovieIds() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-movies-ids"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_movies")
        .select("movie_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return new Set(data.map((d) => d.movie_id));
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });
}
