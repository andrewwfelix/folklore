# Database Connection Directive

## Best Practices
- **Use the Supabase client in `src/lib/supabase/client.ts`** for all database access.
- **Store Supabase credentials in environment variables** (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`).
- **Never commit credentials to version control.**
- **Validate credentials at startup** (see `src/config/index.ts`).
- **Use the service key for server-side operations.**

## Example: Connecting to Supabase
```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['SUPABASE_URL'];
const supabaseServiceKey = process.env['SUPABASE_SERVICE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

## Example: Using the Shared Client
```ts
import { supabase } from '@/lib/supabase/client';

const { data, error } = await supabase.from('folklore_monsters').select('*');
```

## Tips
- Use the `folklore_`-prefixed tables for all new features
- Use the `pgvector` extension for vector search
- See `src/check-database-info.ts` for a schema inspection example
- Use the config module for all environment variable access 