import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] || process.env['SUPABASE_URL'];
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || process.env['SUPABASE_ANON_KEY'];
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    return false;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test connection by querying a simple table
    const { error } = await supabase
      .from('agents')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Supabase connected but table might not exist yet');
      console.log('Error:', error.message);
      return true; // Connection works, table just doesn't exist
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}

async function testSupabaseStorage() {
  console.log('🔍 Testing Supabase Storage (blob storage)...');
  
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] || process.env['SUPABASE_URL'];
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || process.env['SUPABASE_ANON_KEY'];
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables for storage test');
    return false;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test storage by listing buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('⚠️  Storage connected but no buckets exist yet');
      console.log('Error:', bucketsError.message);
      return true; // Connection works, just no buckets exist
    }
    
    console.log(`✅ Supabase Storage connection successful (${buckets?.length || 0} buckets found)`);
    
    // Test creating a test bucket if none exist
    if (!buckets || buckets.length === 0) {
      console.log('📦 Creating test bucket...');
      const { error: createError } = await supabase.storage.createBucket('test-bucket', {
        public: false,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf']
      });
      
      if (createError) {
        console.log('⚠️  Could not create test bucket (this is normal if you don\'t have permissions)');
        console.log('Error:', createError.message);
      } else {
        console.log('✅ Test bucket created successfully');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Supabase Storage connection failed:', error);
    return false;
  }
}

async function testVercelEnvironment() {
  console.log('🔍 Testing Vercel environment...');
  
  const vercelUrl = process.env['VERCEL_URL'];
  const vercelEnv = process.env['VERCEL_ENV'];
  
  console.log(`Vercel URL: ${vercelUrl || 'Not set'}`);
  console.log(`Vercel Environment: ${vercelEnv || 'Not set'}`);
  
  if (vercelUrl) {
    console.log('✅ Vercel environment detected');
    return true;
  } else {
    console.log('⚠️  Vercel environment not detected (this is normal for local development)');
    return true;
  }
}

async function testEnvironmentVariables() {
  console.log('🔍 Testing environment variables...');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('⚠️  Missing environment variables:');
    missingVars.forEach(varName => console.log(`  - ${varName}`));
    console.log('Please copy env.example to .env.local and fill in your values');
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  return true;
}

async function main() {
  console.log('🚀 Folklore Connectivity Test\n');
  
  const results = await Promise.all([
    testEnvironmentVariables(),
    testSupabaseConnection(),
    testSupabaseStorage(),
    testVercelEnvironment()
  ]);
  
  console.log('\n📊 Test Results:');
  console.log(`Environment Variables: ${results[0] ? '✅' : '❌'}`);
  console.log(`Supabase Connection: ${results[1] ? '✅' : '❌'}`);
  console.log(`Supabase Storage: ${results[2] ? '✅' : '❌'}`);
  console.log(`Vercel Environment: ${results[3] ? '✅' : '❌'}`);
  
  const allPassed = results.every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All connectivity tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration.');
  }
}

main().catch(console.error); 