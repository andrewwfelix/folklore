#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runHomebreweryMigration() {
  console.log('🏗️  Running Homebrewery Migration');
  console.log('==================================\n');

  try {
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey);
    
    // Read the migration SQL file
    const migrationPath = join(process.cwd(), 'database', 'add-homebrewery-markup-column.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL:');
    console.log(migrationSQL);
    console.log('');

    // Execute the migration
    console.log('🚀 Executing migration...');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`📝 Executing: ${statement.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.log(`❌ Error executing statement: ${error.message}`);
          console.log(`   Statement: ${statement}`);
          throw error;
        } else {
          console.log('✅ Statement executed successfully');
        }
      }
    }

    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    
    // Check if the column exists
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'folklore_monsters')
      .eq('column_name', 'monster_markup_homebrew');

    if (columnError) {
      console.log('❌ Error checking column:', columnError.message);
    } else if (columns && columns.length > 0) {
      console.log('✅ Column monster_markup_homebrew exists');
    } else {
      console.log('❌ Column monster_markup_homebrew not found');
    }

    // Check if the index exists
    const { data: indexes, error: indexError } = await supabase
      .from('pg_indexes')
      .select('indexname')
      .eq('tablename', 'folklore_monsters')
      .like('indexname', '%markup_homebrew%');

    if (indexError) {
      console.log('❌ Error checking index:', indexError.message);
    } else if (indexes && indexes.length > 0) {
      console.log('✅ Index for monster_markup_homebrew exists');
      indexes.forEach(index => console.log(`   - ${index.indexname}`));
    } else {
      console.log('❌ Index for monster_markup_homebrew not found');
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Run populateAllHomebreweryMarkup() to populate existing monsters');
    console.log('   2. New monsters will automatically have markup generated');
    console.log('   3. Use getHomebreweryMarkup() for fast exports');

    return {
      success: true,
      statementsExecuted: statements.length
    };

  } catch (error) {
    console.error('❌ Migration failed:', (error as Error).message);
    throw error;
  }
}

// Run the migration
if (require.main === module) {
  runHomebreweryMigration().catch(console.error);
}

export { runHomebreweryMigration }; 