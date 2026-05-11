-- Create puzzles table for external tactical puzzles
CREATE TABLE IF NOT EXISTS public.puzzles (
    id TEXT PRIMARY KEY,
    fen TEXT NOT NULL,
    solution TEXT[] NOT NULL,
    rating INTEGER,
    themes TEXT[],
    last_move TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for random selection
CREATE INDEX IF NOT EXISTS idx_puzzles_rating ON public.puzzles(rating);

-- Enable RLS
ALTER TABLE public.puzzles ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to puzzles" ON public.puzzles
    FOR SELECT USING (true);


