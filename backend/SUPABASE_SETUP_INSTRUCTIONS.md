# Supabase Setup Instructions for PDF RAG System

## Prerequisites
- Supabase project created at: https://amwpjpgiupicbrfgeskl.supabase.co
- Admin access to Supabase Dashboard

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/amwpjpgiupicbrfgeskl
2. Navigate to **Storage** section in the left sidebar
3. Click **"New bucket"** button
4. Configure the bucket:
   - **Name**: `pdfs`
   - **Public**: OFF (we'll use signed URLs for security)
   - **File size limit**: 50 MB (52428800 bytes)
   - **Allowed MIME types**: `application/pdf`
5. Click **"Create bucket"**

## Step 2: Run SQL Schema Script

1. Navigate to **SQL Editor** in your Supabase Dashboard
2. Click **"New query"**
3. Copy and paste the entire contents of `setup_supabase.sql`
4. Click **"Run"** to execute the script

This will create:
- `pdf_documents` table for document metadata
- `pdf_chunks` table for text chunks with embeddings
- Vector indexes for fast similarity search
- `match_pdf_chunks()` function for semantic search
- `get_document_stats()` function for document statistics

## Step 3: Verify Setup

Run these queries in SQL Editor to verify:

```sql
-- Check if pgvector extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pdf_documents', 'pdf_chunks');

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('match_pdf_chunks', 'get_document_stats');
```

## Step 4: Test the POC Pipeline

Once setup is complete, test the pipeline with a sample PDF:

```bash
cd /app/backend

# If you have a PDF file:
python3 poc_pdf_rag_pipeline.py your_document.pdf

# The script will:
# 1. Extract text from the PDF
# 2. Chunk the text with overlap
# 3. Generate OpenAI embeddings
# 4. Upload PDF to Supabase Storage
# 5. Store chunks and embeddings in database
# 6. Perform a test similarity search
```

## Expected Output

The POC script should output:
- ✓ Text extraction statistics (pages, characters)
- ✓ Chunking summary (number of chunks per page)
- ✓ Embedding generation progress (batches, tokens used)
- ✓ Upload confirmation (storage path, document ID)
- ✓ Similarity search results with scores

## Troubleshooting

### Storage bucket creation fails
- Ensure you're using the service role key (not anon key) for admin operations
- Check that RLS (Row Level Security) policies allow bucket creation
- Manually create the bucket via UI if API creation fails

### SQL script fails
- Ensure pgvector extension can be enabled (requires Supabase Pro tier or enabled by default)
- Check for existing tables with the same names
- Run commands individually if batch execution fails

### PDF upload fails with 403
- Verify the bucket exists and is named exactly "pdfs"
- Check that your API keys have the correct permissions
- Ensure RLS policies don't block uploads

### Embedding generation fails
- Verify `OPENAI_API_KEY` is set correctly in `.env`
- Check OpenAI account has available credits
- Ensure network connectivity to OpenAI API

### Similarity search returns no results
- Verify chunks were inserted (check `pdf_chunks` table)
- Lower the similarity threshold (try 0.3 or 0.5)
- Check that embeddings are 1536 dimensions
- Ensure the vector index was created successfully

## Environment Variables Required

Make sure these are set in `/app/backend/.env`:

```
SUPABASE_URL=https://amwpjpgiupicbrfgeskl.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
OPENAI_API_KEY=sk-emergent-701A84a3b005930B86
```

## Next Steps

After successful POC:
1. Integrate the pipeline into FastAPI endpoints
2. Add frontend PDF upload UI with react-pdf viewer
3. Create tldraw custom shape for PDF rendering
4. Implement full RAG chat interface
5. Add authentication and multi-tenancy support
