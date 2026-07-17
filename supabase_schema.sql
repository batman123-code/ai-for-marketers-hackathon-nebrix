-- supabase_schema.sql
-- Run this in your Supabase SQL Editor

CREATE TABLE public.graph_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.graph_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES public.graph_nodes(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES public.graph_nodes(id) ON DELETE CASCADE,
    relation_type VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS for graph_nodes
ALTER TABLE public.graph_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own nodes"
    ON public.graph_nodes FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own nodes"
    ON public.graph_nodes FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own nodes"
    ON public.graph_nodes FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own nodes"
    ON public.graph_nodes FOR DELETE
    USING (auth.uid() = owner_id);

-- RLS for graph_edges
ALTER TABLE public.graph_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own edges"
    ON public.graph_edges FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own edges"
    ON public.graph_edges FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own edges"
    ON public.graph_edges FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own edges"
    ON public.graph_edges FOR DELETE
    USING (auth.uid() = owner_id);
