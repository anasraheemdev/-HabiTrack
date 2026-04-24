-- Drop the old function
DROP FUNCTION IF EXISTS match_documents;

-- Clear any partial data inserted before
TRUNCATE TABLE knowledge_documents;

-- Recreate the table or alter the column for 384 dimensions
ALTER TABLE knowledge_documents 
ALTER COLUMN embedding TYPE VECTOR(384);

-- Recreate the function with 384 dimensions
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(384),
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
