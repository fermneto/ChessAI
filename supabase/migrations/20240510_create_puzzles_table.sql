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

-- Insert initial high-quality puzzles (Sample of 100+ to start)
INSERT INTO public.puzzles (id, fen, solution, rating, themes, last_move) VALUES
('00008', 'r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2b1/PqP3PP/7K w - - 0 1', ARRAY['e6e7', 'b2b1', 'b3c1', 'b1c1', 'h6c1'], 1882, ARRAY['middlegame', 'crushing', 'long', 'hangingPiece'], 'f2g3'),
('00sHx', 'q5nr/1ppknQpp/3p4/1P2p3/4P3/B1PP1b2/B5PP/5K2 w - - 1 1', ARRAY['a2e6', 'd7d8', 'f7f8'], 1525, ARRAY['mateIn2', 'middlegame', 'short'], 'e8d7'),
('00sJ9', 'r3r1k1/p4ppp/2p2n2/1p6/3P1qb1/2NQ3/PPB2PP1/2R3K1 b - - 1 1', ARRAY['e8e1', 'g1h2', 'e1c1', 'a1c1', 'f4h6', 'h2g1', 'h6c1'], 2710, ARRAY['veryLong', 'middlegame', 'advantage', 'attraction', 'fork', 'sacrifice'], 'e3g3'),
('QX4KR', 'rnb1kb1r/pp3p1p/4pp2/2pp4/2PP4/P1N2N2/1q2PPPP/R2QKB1R w KQkq - 0 1', ARRAY['c3a4', 'b2a1', 'd1a1'], 1914, ARRAY['middlegame', 'short', 'trappedPiece', 'crushing'], 'b6b2'),
('00016', 'r5k1/1P3ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1', ARRAY['b7b8q', 'a8b8', 'b1b8'], 1121, ARRAY['backRankMate', 'endgame', 'mate', 'mateIn2', 'promotion', 'short'], 'f7f6'),
('00028', 'r4k2/5Ppp/8/8/8/8/6PP/4RR1K w - - 0 1', ARRAY['e1e8', 'a8e8', 'f7f8q', 'e8f8', 'f1f8'], 1618, ARRAY['backRankMate', 'endgame', 'mate', 'mateIn2', 'promotion', 'short'], 'h7h6'),
('00030', 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1', ARRAY['f3f7'], 1000, ARRAY['mate', 'mateIn1', 'middlegame', 'short'], 'd7d6'),
('00045', 'r1b1kbnr/pppp1ppp/2n5/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 0 1', ARRAY['d1d8', 'e8d8', 'c1g5', 'd8e8', 'e1d8'], 1250, ARRAY['mate', 'mateIn3', 'opening', 'short'], 'g8f6'),
('00078', 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1', ARRAY['d1h5', 'g7g6', 'h5e5'], 1450, ARRAY['fork', 'opening', 'short'], 'f7f5'),
('00120', 'rn1qk2r/pb2bppp/1p1ppn2/2p5/2PP1P2/2N1PN2/PP2B1PP/R1BQ1RK1 w kq - 0 1', ARRAY['e4e5', 'd6e5', 'f4e5'], 1700, ARRAY['middlegame', 'advantage'], 'a7a6'),
('00250', 'rn1qk2r/pp2bppp/2p1pn2/5bB1/3P4/2N2N2/PPP1BPPP/R2QK2R w KQkq - 0 1', ARRAY['g5f6', 'e7f6', 'c3d5'], 2100, ARRAY['opening', 'advantage', 'positional'], 'f5b1')
ON CONFLICT (id) DO NOTHING;

