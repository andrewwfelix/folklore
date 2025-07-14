import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

describe('Integration: Database & Storage Info', () => {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] || process.env['SUPABASE_URL'];
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || process.env['SUPABASE_ANON_KEY'];

  it('should list storage buckets', async () => {
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    const { data: buckets, error } = await supabase.storage.listBuckets();
    expect(error).toBeFalsy();
    expect(Array.isArray(buckets)).toBe(true);
    // Optionally log bucket names
    if (buckets) {
      buckets.forEach(bucket => {
        // eslint-disable-next-line no-console
        console.log(`Bucket: ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    }
  });

  // Listing tables via Supabase client is not supported directly, so we skip that part
}); 