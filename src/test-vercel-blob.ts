import { put } from '@vercel/blob';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testVercelBlob() {
  console.log('🔍 Testing Vercel Blob Storage...');
  
  try {
    // Create a simple test file content
    const testContent = 'Hello from Folklore! This is a test file.';
    const testBuffer = Buffer.from(testContent, 'utf-8');
    
    console.log('📤 Attempting to upload test file...');
    
    // Try to upload a test file
    const token = process.env['BLOB_READ_WRITE_TOKEN'];
    if (!token) {
      throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set');
    }
    
    const blob = await put('test-file.txt', testBuffer, {
      access: 'public',
      token,
    });
    
    console.log('✅ Vercel Blob Storage connection successful!');
    console.log(`📁 File uploaded to: ${blob.url}`);
    console.log(`🔗 Blob URL: ${blob.url}`);
    console.log(`📏 Size: ${testBuffer.length} bytes`);
    
    return true;
  } catch (error) {
    console.error('❌ Vercel Blob Storage connection failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Vercel Blob Storage Test\n');
  
  const result = await testVercelBlob();
  
  console.log('\n📊 Test Results:');
  console.log(`Vercel Blob Storage: ${result ? '✅' : '❌'}`);
  
  if (result) {
    console.log('\n🎉 Vercel Blob Storage test passed!');
  } else {
    console.log('\n⚠️  Vercel Blob Storage test failed. Please check your configuration.');
  }
}

main().catch(console.error); 