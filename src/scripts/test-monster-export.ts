#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { exportMonster, exportAllMonsters, exportMonstersByRegion } from '../lib/utils/monster-export';

async function testMonsterExport() {
  console.log('📤 Testing Monster Export');
  console.log('==========================\n');

  try {
    // Test 1: Export a single monster (you'll need to provide a valid monster ID)
    console.log('🧪 Test 1: Export single monster to Homebrewery format');
    console.log('Note: This requires a valid monster ID from your database');
    
    // Uncomment and replace with a real monster ID from your database
    /*
    const singleExportResult = await exportMonster('your-monster-id-here', {
      format: 'homebrewery',
      includeLore: true,
      includeCitations: true,
      includeArtPrompt: false
    });

    if (singleExportResult.success) {
      console.log('✅ Single monster export successful!');
      console.log(`📄 File: ${singleExportResult.filePath}`);
      console.log(`📊 Monster count: ${singleExportResult.monsterCount}`);
    } else {
      console.log('❌ Single monster export failed:', singleExportResult.error);
    }
    */
    console.log('⏭️  Skipping single monster test (no monster ID provided)\n');

    // Test 2: Export all monsters to Homebrewery format
    console.log('🧪 Test 2: Export all monsters to Homebrewery format');
    const allExportResult = await exportAllMonsters({
      format: 'homebrewery',
      includeLore: true,
      includeCitations: false,
      includeArtPrompt: false
    });

    if (allExportResult.success) {
      console.log('✅ All monsters export successful!');
      console.log(`📄 File: ${allExportResult.filePath}`);
      console.log(`📊 Monster count: ${allExportResult.monsterCount}`);
    } else {
      console.log('❌ All monsters export failed:', allExportResult.error);
    }
    console.log('');

    // Test 3: Export monsters by region
    console.log('🧪 Test 3: Export monsters by region (Test Mountains)');
    const regionExportResult = await exportMonstersByRegion('Test Mountains', {
      format: 'homebrewery',
      includeLore: true,
      includeCitations: false,
      includeArtPrompt: false
    });

    if (regionExportResult.success) {
      console.log('✅ Region export successful!');
      console.log(`📄 File: ${regionExportResult.filePath}`);
      console.log(`📊 Monster count: ${regionExportResult.monsterCount}`);
    } else {
      console.log('❌ Region export failed:', regionExportResult.error);
    }
    console.log('');

    // Test 4: Export to different formats
    console.log('🧪 Test 4: Export to different formats');
    
    // JSON format
    const jsonExportResult = await exportAllMonsters({
      format: 'json'
    });

    if (jsonExportResult.success) {
      console.log('✅ JSON export successful!');
      console.log(`📄 File: ${jsonExportResult.filePath}`);
    } else {
      console.log('❌ JSON export failed:', jsonExportResult.error);
    }

    // Markdown format
    const markdownExportResult = await exportAllMonsters({
      format: 'markdown'
    });

    if (markdownExportResult.success) {
      console.log('✅ Markdown export successful!');
      console.log(`📄 File: ${markdownExportResult.filePath}`);
    } else {
      console.log('❌ Markdown export failed:', markdownExportResult.error);
    }
    console.log('');

    console.log('🎉 Monster export tests completed!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Check the generated files in your project directory');
    console.log('   2. For Homebrewery files:');
    console.log('      - Copy the content from the .md file');
    console.log('      - Go to https://homebrewery.naturalcrit.com/');
    console.log('      - Paste the content into the editor');
    console.log('      - Click "Save" to create your homebrew document');
    console.log('      - Use "Print/Generate PDF" to create a PDF version');
    console.log('   3. For JSON files: Use them for data analysis or import into other tools');
    console.log('   4. For Markdown files: Use them in any markdown editor or converter');

    return {
      success: true,
      results: {
        allMonsters: allExportResult,
        regionExport: regionExportResult,
        jsonExport: jsonExportResult,
        markdownExport: markdownExportResult
      }
    };

  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testMonsterExport().catch(console.error);
}

export { testMonsterExport }; 