import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Debugging Environment Variables\n');

// Check for Blob token
const blobToken = process.env['BLOB_READ_WRITE_TOKEN'];
console.log(`BLOB_READ_WRITE_TOKEN: ${blobToken ? '✅ Set' : '❌ Not set'}`);

// Check for other relevant variables
const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const vercelUrl = process.env['VERCEL_URL'];

console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Not set'}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Not set'}`);
console.log(`VERCEL_URL: ${vercelUrl ? '✅ Set' : '❌ Not set'}`);

// List all environment variables that start with BLOB
console.log('\n🔍 All BLOB-related environment variables:');
Object.keys(process.env).forEach(key => {
  if (key.toUpperCase().includes('BLOB')) {
    console.log(`  ${key}: ${process.env[key] ? 'Set' : 'Not set'}`);
  }
});

console.log('\n📝 Note: If BLOB_READ_WRITE_TOKEN is not set, you may need to:');
console.log('1. Add it to your .env.local file');
console.log('2. Run "vercel env pull" to sync from Vercel');
console.log('3. Check your Vercel project settings for the token'); 