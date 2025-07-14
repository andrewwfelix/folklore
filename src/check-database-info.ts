import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function checkDatabaseInfo() {
  console.log('🔍 Checking Supabase Database Information\n');
  
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] || process.env['SUPABASE_URL'];
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || process.env['SUPABASE_ANON_KEY'];
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('📊 Database Information:');
    console.log(`- Supabase URL: ${supabaseUrl}`);
    console.log(`- Project ID: ${supabaseUrl?.split('//')[1]?.split('.')[0] || 'unknown'}`);
    
    // Check current database
    const { error: dbError } = await supabase.rpc('version');
    if (!dbError) {
      console.log(`- Database: PostgreSQL`);
    }
    
    // List all tables in public schema
    console.log('\n📋 Tables in public schema:');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('❌ Could not list tables:', tablesError.message);
    } else if (tables && tables.length > 0) {
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    } else {
      console.log('  - No tables found (this is normal for a new project)');
    }
    
    // Check storage buckets
    console.log('\n🗂️ Storage Buckets:');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Could not list buckets:', bucketsError.message);
    } else if (buckets && buckets.length > 0) {
      buckets.forEach(bucket => {
        console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    } else {
      console.log('  - No buckets found (this is normal for a new project)');
    }
    
    // Check storage configuration
    console.log('\n⚙️ Storage Configuration:');
    console.log(`- Storage URL: ${supabaseUrl}/storage/v1`);
    console.log(`- Storage API: Available`);
    
    console.log('\n✅ Database and storage information retrieved successfully!');
    
  } catch (error) {
    console.error('❌ Error checking database info:', error);
  }
}

checkDatabaseInfo().catch(console.error); 