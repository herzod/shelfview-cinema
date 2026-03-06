import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useUpdateMovieGroup() {
    const { user } = useAuth();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ movieId, group }: { movieId: number; group: string[] | null }) => {
            const { error } = await supabase
                .from("user_movies")
                .update({ custom_group: group })
                .eq("movie_id", movieId)
                .eq("user_id", user!.id);

            if (error) throw error;
            return { movieId, group };
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["user-movies"] });
        },
        onError: () => {
            toast.error("Failed to update movie group");
        },
    });
}
