# Database Setup for Folklore Monster Generation Platform

This directory contains the database schema and setup instructions for the AI-powered monster generation platform.

## Files

- `schema.sql` - Original agent orchestration schema (legacy)
- `monster-schema.sql` - **NEW** Monster generation schema (use this)
- `README.md` - This file

## Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

### 2. Apply the Schema
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `monster-schema.sql`
4. Execute the script

### 3. Verify Setup
The script will create:
- ✅ All required tables
- ✅ Indexes for performance
- ✅ Row Level Security policies
- ✅ Sample data (regions and tags)
- ✅ Vector search functions (for semantic search)

## Database Schema Overview

### Core Tables

#### `monsters` - Main monster data
- **id**: Unique identifier
- **name**: Monster name
- **region**: Geographic/cultural region
- **tags**: Array of tags (e.g., ['undead', 'forest'])
- **lore**: Rich description (150-250 words)
- **statblock**: JSONB containing D&D 5e stat block
- **status**: 'draft', 'generating', 'complete', 'error'
- **image_url**: Generated art URL
- **pdf_url**: Generated PDF URL
- **embedding**: Vector for semantic search

#### `citations` - Source references
- Links to Wikipedia, Mythopedia, etc.
- Tracks relevance and source type
- Connected to monsters via `monster_id`

#### `art_prompts` - AI art generation
- Stores prompts for image generation
- Tracks art style and description
- Connected to monsters via `monster_id`

#### `reviews` - Quality assurance
- AI and human review feedback
- Rating system (1-5 stars)
- Tracks reviewer type and status

#### `generation_history` - Agent execution tracking
- Records each agent's execution
- Tracks input/output data
- Measures performance and errors

### Supporting Tables

#### `regions` - Geographic/cultural areas
- Pre-populated with 10 regions
- Includes cultural context descriptions

#### `tags` - Categorization system
- Pre-populated with creature types, environments, power levels
- Organized by category

#### `monster_tags` - Many-to-many relationship
- Links monsters to tags
- Enables flexible categorization

## Key Features

### 🔍 Vector Search
- Uses pgvector extension
- Enables semantic search of monsters
- 1536-dimensional embeddings

### 🛡️ Row Level Security
- All tables have RLS enabled
- Policies allow public read, authenticated write
- Secure by default

### 📊 Performance Indexes
- Optimized for common queries
- GIN indexes for array fields
- Vector indexes for similarity search

### 🔄 Automatic Timestamps
- `created_at` and `updated_at` fields
- Automatic triggers for updates

## Sample Data

The schema includes functions to populate:
- **10 regions**: Japan, Greece, Norse, Celtic, Slavic, Chinese, Indian, Egyptian, Aztec, Malaysia
- **21 tags**: Organized by creature type, environment, and power level

## Environment Variables

Add these to your `.env.local`:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# For vector search (optional)
OPENAI_API_KEY=your_openai_api_key
```

## Testing the Setup

Run the connectivity test:

```bash
npm run test:connectivity
```

Or check database info:

```bash
npm run check:db
```

## Next Steps

After setting up the database:

1. **Update Supabase Client**: Use the new database types
2. **Create Monster Agents**: Implement the AI generation agents
3. **Build API Routes**: Create endpoints for monster CRUD operations
4. **Add Frontend**: Build the user interface

## Troubleshooting

### Common Issues

1. **pgvector extension not available**
   - Contact Supabase support to enable pgvector
   - Or use a different vector search solution

2. **RLS policies too restrictive**
   - Modify policies in the SQL editor
   - Test with `SELECT * FROM monsters LIMIT 1;`

3. **Vector search not working**
   - Ensure embeddings are being calculated
   - Check vector dimensions match (1536)

### Getting Help

- Check Supabase logs in the dashboard
- Review the SQL execution history
- Test individual queries in the SQL editor 