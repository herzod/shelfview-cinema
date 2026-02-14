
-- Create enum for movie watch status
CREATE TYPE public.watch_status AS ENUM ('plan_to_watch', 'watching', 'watched', 'dropped');

-- Create user_movies table
CREATE TABLE public.user_movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  movie_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  status public.watch_status NOT NULL DEFAULT 'plan_to_watch',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Enable RLS
ALTER TABLE public.user_movies ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only access their own data
CREATE POLICY "Users can view their own movies"
  ON public.user_movies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own movies"
  ON public.user_movies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own movies"
  ON public.user_movies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own movies"
  ON public.user_movies FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_movies_updated_at
  BEFORE UPDATE ON public.user_movies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
