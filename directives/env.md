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

## Example: Loading Environment Variables in a Script
```ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env['OPENAI_API_KEY'];
if (!apiKey) throw new Error('OPENAI_API_KEY is required');
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