import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { config } from '../config';

console.log('🔍 Verifying Environment Variable Parsing\n');

console.log('📋 Raw Environment Variables:');
console.log(`   • GENERATE_PDF: "${process.env['GENERATE_PDF']}"`);
console.log(`   • GENERATE_ART: "${process.env['GENERATE_ART']}"`);
console.log(`   • USE_REFINEMENTS: "${process.env['USE_REFINEMENTS']}"`);
console.log(`   • MOCK_LLM: "${process.env['MOCK_LLM']}"`);
console.log(`   • DEBUG: "${process.env['DEBUG']}"`);
console.log(`   • NODE_ENV: "${process.env['NODE_ENV']}"`);

console.log('\n⚙️ Parsed Config Values:');
console.log(`   • config.generation.generatePDF: ${config.generation.generatePDF}`);
console.log(`   • config.generation.generateArt: ${config.generation.generateArt}`);
console.log(`   • config.development.mockLLM: ${config.development.mockLLM}`);
console.log(`   • config.development.debug: ${config.development.debug}`);

console.log('\n🎯 Expected Behavior:');
console.log(`   • PDF Generation: ${config.generation.generatePDF ? '✅ Enabled' : '❌ Disabled'}`);
console.log(`   • Art Generation: ${config.generation.generateArt ? '✅ Enabled' : '❌ Disabled'}`);
console.log(`   • Mock LLM: ${config.development.mockLLM ? '✅ Enabled' : '❌ Disabled'}`);
console.log(`   • Use Refinements: ${process.env['USE_REFINEMENTS'] !== 'false' ? '✅ Enabled' : '❌ Disabled'}`);

console.log('\n📊 Generation Pipeline:');
if (process.env['USE_REFINEMENTS'] !== 'false') {
  console.log('   • Will use: Refinement Pipeline (3 iterations)');
} else {
  console.log('   • Will use: Simple Generation (1 iteration)');
}

console.log('\n✅ Verification Complete!'); 