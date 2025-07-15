# Environment Variable Directive

## Best Practices
- **Always use a `.env.local` file** for local development. Do not commit secrets to version control.
- **Load environment variables at the top of every entry-point script** using `dotenv`:

```ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
```
- **Access variables using `process.env['VAR_NAME']`** (bracket notation is safest for TypeScript).
- **Validate required variables** at startup (see `src/config/index.ts`).
- **Document all required variables** in `env.example`.

## Critical: Entry-Point Scripts Must Load Environment Variables

**Every script that runs directly (not imported) must load `.env.local` at the top:**

### ✅ Correct Pattern for Entry-Point Scripts
```ts
#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Then import your modules
import { config, validateConfig } from '../config';
```

### ❌ Common Mistake
```ts
#!/usr/bin/env ts-node

// Missing dotenv loading - will fail if env vars aren't set in shell
import { config, validateConfig } from '../config';
```

### ✅ Correct Pattern for Imported Modules
```ts
// For modules that are imported by other scripts, 
// don't load dotenv - let the entry point handle it
import { config } from './config';
```

## Example: Loading Environment Variables in a Script
```ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env['OPENAI_API_KEY'];
if (!apiKey) throw new Error('OPENAI_API_KEY is required');
```

## Environment Variable Naming Consistency

**Always use the same environment variable names across your entire project:**

### ✅ Correct: Consistent Naming
- **Connectivity test uses:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Config module uses:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **All scripts use:** Same variable names

### ❌ Common Mistake: Inconsistent Naming
- **Connectivity test uses:** `NEXT_PUBLIC_SUPABASE_URL`
- **Config module expects:** `SUPABASE_URL`
- **Result:** Configuration validation fails even though connectivity works

### Best Practice: Fallback Pattern
```ts
// Use fallbacks to support multiple naming conventions
const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] || process.env['SUPABASE_URL'] || '';
const supabaseKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || process.env['SUPABASE_SERVICE_KEY'] || '';
```

## Example: Using in a Config Module
See `src/config/index.ts` for a robust pattern that:
- Loads and validates all required variables
- Provides type-safe access
- Supports feature flags and defaults

## Tips
- Use `npm run debug:env` to check which variables are set
- Use `env.example` as a template for `.env.local`
- Never commit `.env.local` to git 