import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function inspectFolkloreSchema() {
  console.log('🔍 Inspecting Folklore Database Schema\n');
  
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
    
    // Check for folklore tables
    console.log('\n📋 Checking for Folklore tables:');
    
    const folkloreTablesToCheck = [
      'folklore_monsters',
      'folklore_citations', 
      'folklore_art_prompts',
      'folklore_reviews',
      'folklore_generation_history',
      'folklore_regions',
      'folklore_tags',
      'folklore_monster_tags'
    ];
    
    for (const tableName of folkloreTablesToCheck) {
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
    
    // Check for legacy tables
    console.log('\n📋 Checking for legacy tables:');
    
    const legacyTablesToCheck = [
      'monsters', // This might exist from before
      'users',
      'agents', 
      'workflows',
      'executions'
    ];
    
    for (const tableName of legacyTablesToCheck) {
      try {
        const { error } = await supabase.from(tableName).select('count').limit(1);
        if (error && error.code === '42P01') {
          console.log(`  ❌ ${tableName} - Table does not exist`);
        } else if (error) {
          console.log(`  ⚠️  ${tableName} - Error: ${error.message}`);
        } else {
          console.log(`  ✅ ${tableName} - Table exists (legacy)`);
        }
      } catch (err) {
        console.log(`  ❌ ${tableName} - Connection error`);
      }
    }
    
    // Check for sample data
    console.log('\n📊 Checking for sample data:');
    try {
      const { error: regionsError } = await supabase.from('folklore_regions').select('count').limit(1);
      if (!regionsError) {
        console.log('  ✅ Folklore regions table exists');
      } else {
        console.log('  ❌ Folklore regions table does not exist');
      }
    } catch (err) {
      console.log('  ❌ Could not check folklore regions table');
    }
    
    try {
      const { error: tagsError } = await supabase.from('folklore_tags').select('count').limit(1);
      if (!tagsError) {
        console.log('  ✅ Folklore tags table exists');
      } else {
        console.log('  ❌ Folklore tags table does not exist');
      }
    } catch (err) {
      console.log('  ❌ Could not check folklore tags table');
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
    
    console.log('\n📋 Migration Status:');
    console.log('Based on the table checks above:');
    console.log('');
    console.log('🟢 If folklore_ tables exist:');
    console.log('  - Folklore schema is applied');
    console.log('  - Ready for monster generation development');
    console.log('');
    console.log('🟡 If only legacy tables exist:');
    console.log('  - Need to apply folklore-schema.sql');
    console.log('  - Consider migrating existing data');
    console.log('');
    console.log('🔴 If no tables exist:');
    console.log('  - Apply folklore-schema.sql for clean start');
    console.log('');
    console.log('🟠 If both folklore_ and legacy tables exist:');
    console.log('  - Both schemas are present');
    console.log('  - Consider cleanup or migration strategy');
    
  } catch (error) {
    console.error('❌ Error inspecting schema:', error);
  }
}

inspectFolkloreSchema().catch(console.error); 