#!/usr/bin/env ts-node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { uploadPDF, uploadImage, testBlobStorage, generatePDFFilename, generateImageFilename } from '../lib/utils/blob-storage';

async function testBlobStorageUtility() {
  console.log('🗂️  Testing Blob Storage Utility');
  console.log('================================\n');

  try {
    // Test basic connectivity
    console.log('🔍 Testing basic blob storage connectivity...');
    const connectivityTest = await testBlobStorage();
    if (!connectivityTest) {
      throw new Error('Blob storage connectivity test failed');
    }
    console.log('✅ Basic connectivity test passed\n');

    // Test PDF upload
    console.log('📄 Testing PDF upload...');
    const pdfContent = Buffer.from('This is a test PDF content for Kitsune-no-Mori');
    const pdfResult = await uploadPDF('Kitsune-no-Mori', pdfContent);
    console.log(`✅ PDF uploaded: ${pdfResult.url}`);
    console.log(`   Size: ${pdfResult.size} bytes`);
    console.log(`   Filename: ${pdfResult.filename}\n`);

    // Test image upload
    console.log('🖼️  Testing image upload...');
    const imageContent = Buffer.from('This is a test image content for Kitsune-no-Mori');
    const imageResult = await uploadImage('Kitsune-no-Mori', imageContent);
    console.log(`✅ Image uploaded: ${imageResult.url}`);
    console.log(`   Size: ${imageResult.size} bytes`);
    console.log(`   Filename: ${imageResult.filename}\n`);

    // Test filename generation
    console.log('📝 Testing filename generation...');
    const pdfFilename = generatePDFFilename('Kitsune-no-Mori');
    const imageFilename = generateImageFilename('Kitsune-no-Mori');
    console.log(`PDF filename: ${pdfFilename}`);
    console.log(`Image filename: ${imageFilename}\n`);

    console.log('🎉 All blob storage utility tests passed!');
    return {
      pdfResult,
      imageResult,
      pdfFilename,
      imageFilename
    };

  } catch (error) {
    console.error('❌ Blob storage utility test failed:', (error as Error).message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testBlobStorageUtility().catch(console.error);
}

export { testBlobStorageUtility }; 