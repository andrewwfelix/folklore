import { createClient } from '@supabase/supabase-js';
import { put } from '@vercel/blob';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

describe('Integration: Database & Storage Connectivity', () => {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] || process.env['SUPABASE_URL'];
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || process.env['SUPABASE_ANON_KEY'];
  const blobToken = process.env['BLOB_READ_WRITE_TOKEN'];

  it('should have all required environment variables', () => {
    expect(supabaseUrl).toBeTruthy();
    expect(supabaseAnonKey).toBeTruthy();
    expect(blobToken).toBeTruthy();
  });

  it('should connect to Supabase database', async () => {
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    // Try a simple query (table may not exist, but connection should not throw)
    const { error } = await supabase.from('agents').select('count').limit(1);
    // Connection works if we get a response (even if table doesn't exist)
    expect(error).toBeDefined(); // We expect an error since table doesn't exist yet
    expect(error?.message).toContain('does not exist'); // But connection itself works
  });

  it('should connect to Supabase Storage', async () => {
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    const { data: buckets, error } = await supabase.storage.listBuckets();
    expect(error).toBeFalsy();
    expect(Array.isArray(buckets)).toBe(true);
  });

  it('should connect to Vercel Blob Storage', async () => {
    const testContent = 'Hello from Folklore! This is a test file.';
    const testBuffer = Buffer.from(testContent, 'utf-8');
    if (!blobToken) throw new Error('BLOB_READ_WRITE_TOKEN not set');
    const blob = await put('test-file-jest.txt', testBuffer, {
      access: 'public',
      token: blobToken,
      addRandomSuffix: true,
    });
    expect(blob.url).toMatch(/^https:\/\//);
  });
}); 