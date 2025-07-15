import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function inspectCurrentSchema() {
  console.log('🔍 Inspecting Current Database Schema\n');
  
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
    
    // Check if we can connect
    const { error: testError } = await supabase.from('_test_connection').select('*').limit(1);
    if (testError && testError.code === '42P01') {
      console.log('✅ Database connection successful');
    }
    
    // Try to list tables using a different approach
    console.log('\n📋 Checking for existing tables:');
    
    const tablesToCheck = [
      'users', 'agents', 'workflows', 'executions',
      'monsters', 'citations', 'art_prompts', 'reviews', 
      'generation_history', 'regions', 'tags', 'monster_tags'
    ];
    
    for (const tableName of tablesToCheck) {
      try {
        const { error } = await supabase.from(tableName).select('count').limit(1);
        if (error && error.code === '42P01') {
          console.log(`  ❌ ${tableName} - Table does not exist`);
        } else if (error) {
          console.log(`  ⚠️  ${tableName} - Error: ${error.message}`);
        } else {
          console.log(`  ✅ ${tableName} - Table exists`);
        }
      } catch (err) {
        console.log(`  ❌ ${tableName} - Connection error`);
      }
    }
    
    // Check for extensions
    console.log('\n🔧 Checking for required extensions:');
    try {
      const { error } = await supabase.rpc('get_extensions');
      if (error) {
        console.log('  ⚠️  Could not check extensions (this is normal)');
      } else {
        console.log('  ✅ Extensions check available');
      }
    } catch (err) {
      console.log('  ⚠️  Extension check not available');
    }
    
    // Check for sample data
    console.log('\n📊 Checking for sample data:');
    try {
      const { error: regionsError } = await supabase.from('regions').select('count').limit(1);
      if (!regionsError) {
        console.log('  ✅ Regions table exists');
      } else {
        console.log('  ❌ Regions table does not exist');
      }
    } catch (err) {
      console.log('  ❌ Could not check regions table');
    }
    
    try {
      const { error: tagsError } = await supabase.from('tags').select('count').limit(1);
      if (!tagsError) {
        console.log('  ✅ Tags table exists');
      } else {
        console.log('  ❌ Tags table does not exist');
      }
    } catch (err) {
      console.log('  ❌ Could not check tags table');
    }
    
    console.log('\n📋 Migration Assessment:');
    console.log('Based on the table checks above, here are your options:');
    console.log('');
    console.log('🟢 If no tables exist:');
    console.log('  - Apply monster-schema.sql (clean start)');
    console.log('');
    console.log('🟡 If only original tables exist (users, agents, workflows, executions):');
    console.log('  - Option 1: Replace with monster-schema.sql');
    console.log('  - Option 2: Merge schemas (keep both)');
    console.log('');
    console.log('🔴 If monster tables already exist:');
    console.log('  - Check for conflicts and plan migration');
    console.log('  - Consider backup before changes');
    
  } catch (error) {
    console.error('❌ Error inspecting schema:', error);
  }
}

inspectCurrentSchema().catch(console.error); 