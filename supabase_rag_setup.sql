-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table to store your documents
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id BIGSERIAL PRIMARY KEY,
    content TEXT, -- The actual paragraph text from the book
    metadata JSONB, -- Optional metadata (e.g., page number, section)
    embedding VECTOR(768) -- Google's text-embedding-004 outputs 768 dimensions
);

-- Create a function to similarity search for documents
-- This uses the <=> operator, which is for Cosine Distance
-- Because vectors are usually normalized, cosine distance is equivalent to inner product distance
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    knowledge_documents.id,
    knowledge_documents.content,
    knowledge_documents.metadata,
    1 - (knowledge_documents.embedding <=> query_embedding) AS similarity
  FROM knowledge_documents
  WHERE 1 - (knowledge_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_documents.embedding <=> query_embedding
  LIMIT match_count;
$$;
