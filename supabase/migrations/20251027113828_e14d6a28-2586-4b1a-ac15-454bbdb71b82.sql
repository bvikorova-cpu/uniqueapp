-- Create storage bucket for coloring page images
INSERT INTO storage.buckets (id, name, public)
VALUES ('coloring-images', 'coloring-images', true)
ON CONFLICT (id) DO NOTHING;