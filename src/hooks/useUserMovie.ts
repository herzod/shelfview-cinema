import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type WatchStatus = Database["public"]["Enums"]["watch_status"];
type UserMovie = Database["public"]["Tables"]["user_movies"]["Row"];

export function useUserMovie(movieId: number | null) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["user-movie", movieId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_movies")
        .select("*")
        .eq("movie_id", movieId!)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as UserMovie | null;
    },
    enabled: !!movieId && !!user,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["user-movie", movieId] });
    qc.invalidateQueries({ queryKey: ["user-movies"] });
  };

  const addToShelf = useMutation({
    mutationFn: async (params: { title: string; poster_path: string | null }) => {
      const { error } = await supabase.from("user_movies").insert({
        user_id: user!.id,
        movie_id: movieId!,
        title: params.title,
        poster_path: params.poster_path,
        status: "plan_to_watch" as WatchStatus,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: async (status: WatchStatus) => {
      const updates: Record<string, unknown> = { status };
      if (status !== "watched") updates.rating = null;
      const { error } = await supabase
        .from("user_movies")
        .update(updates)
        .eq("movie_id", movieId!)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateRating = useMutation({
    mutationFn: async (rating: number | null) => {
      const { error } = await supabase
        .from("user_movies")
        .update({ rating })
        .eq("movie_id", movieId!)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateNotes = useMutation({
    mutationFn: async (notes: string) => {
      const { error } = await supabase
        .from("user_movies")
        .update({ notes })
        .eq("movie_id", movieId!)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const removeFromShelf = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("user_movies")
        .delete()
        .eq("movie_id", movieId!)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    userMovie: query.data ?? null,
    isLoading: query.isLoading,
    addToShelf,
    updateStatus,
    updateRating,
    updateNotes,
    removeFromShelf,
  };
}
