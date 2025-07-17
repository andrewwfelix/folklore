import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { folkloreSupabase } from '../lib/supabase/folklore-client';

async function cleanFolkloreDatabase() {
  console.log('🧹 Cleaning Folklore Database');
  console.log('==============================\n');

  try {
    // First, let's check what we're about to delete
    console.log('📊 Current database state:');
    
    const { data: monsterCount, error: monsterError } = await folkloreSupabase
      .from('folklore_monsters')
      .select('id', { count: 'exact' });

    if (monsterError) {
      console.error('❌ Error counting monsters:', monsterError);
      return;
    }

    const { data: citationCount, error: citationError } = await folkloreSupabase
      .from('folklore_citations')
      .select('id', { count: 'exact' });

    if (citationError) {
      console.error('❌ Error counting citations:', citationError);
      return;
    }

    const { data: artCount, error: artError } = await folkloreSupabase
      .from('folklore_art_prompts')
      .select('id', { count: 'exact' });

    if (artError) {
      console.error('❌ Error counting art prompts:', artError);
      return;
    }

    console.log(`   📋 Monsters: ${monsterCount?.length || 0}`);
    console.log(`   📚 Citations: ${citationCount?.length || 0}`);
    console.log(`   🎨 Art Prompts: ${artCount?.length || 0}`);
    console.log('');

    // Show a few recent monsters for confirmation
    const { data: recentMonsters, error: recentError } = await folkloreSupabase
      .from('folklore_monsters')
      .select('id, name, region, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('❌ Error fetching recent monsters:', recentError);
      return;
    }

    if (recentMonsters && recentMonsters.length > 0) {
      console.log('📋 Recent monsters that will be deleted:');
      recentMonsters.forEach((monster, index) => {
        console.log(`   ${index + 1}. ${monster.name} (${monster.region}) - ${monster.created_at}`);
      });
      console.log('');
    }

    console.log('⚠️  WARNING: This will permanently delete ALL folklore data!');
    console.log('   This includes monsters, citations, and art prompts.');
    console.log('');
    console.log('🔄 Proceeding with deletion...\n');

    // Delete related tables first
    console.log('🗑️  Deleting citations...');
    const { error: deleteCitationsError } = await folkloreSupabase
      .from('folklore_citations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteCitationsError) {
      console.error('❌ Error deleting citations:', deleteCitationsError);
    } else {
      console.log('✅ Citations deleted');
    }

    console.log('🗑️  Deleting art prompts...');
    const { error: deleteArtError } = await folkloreSupabase
      .from('folklore_art_prompts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteArtError) {
      console.error('❌ Error deleting art prompts:', deleteArtError);
    } else {
      console.log('✅ Art prompts deleted');
    }

    console.log('🗑️  Deleting monsters...');
    const { error: deleteMonstersError } = await folkloreSupabase
      .from('folklore_monsters')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteMonstersError) {
      console.error('❌ Error deleting monsters:', deleteMonstersError);
      return;
    }

    console.log('✅ Monsters deleted');

    // Verify the deletion
    const { data: verifyMonsters, error: verifyError } = await folkloreSupabase
      .from('folklore_monsters')
      .select('id', { count: 'exact' });

    if (verifyError) {
      console.error('❌ Error verifying deletion:', verifyError);
      return;
    }

    console.log(`📊 Verification: ${verifyMonsters?.length || 0} monsters remaining`);
    console.log('🎉 Database cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
  }
}

// Run the cleanup
if (require.main === module) {
  cleanFolkloreDatabase().catch(console.error);
}

export { cleanFolkloreDatabase }; 