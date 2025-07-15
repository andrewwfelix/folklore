import { put } from '@vercel/blob';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export interface BlobUploadResult {
  url: string;
  size: number;
  uploadedAt: Date;
  filename: string;
}

export interface FileUploadOptions {
  contentType?: string;
  access?: 'public' | 'private';
  addRandomSuffix?: boolean;
}

/**
 * Upload a file to Vercel Blob Storage
 */
export async function uploadToBlob(
  filename: string,
  content: Buffer | string,
  options: FileUploadOptions = {}
): Promise<BlobUploadResult> {
  const token = process.env['BLOB_READ_WRITE_TOKEN'];
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set');
  }

  // Convert string content to buffer if needed
  const buffer = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;

  // Add random suffix if requested
  const finalFilename = options.addRandomSuffix 
    ? `${filename}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    : filename;

  const blob = await put(finalFilename, buffer, {
    access: 'public',
    token,
    ...(options.contentType && { contentType: options.contentType }),
  });

  return {
    url: blob.url,
    size: buffer.length,
    uploadedAt: new Date(),
    filename: finalFilename,
  };
}

/**
 * Upload a PDF file to blob storage
 */
export async function uploadPDF(
  monsterName: string,
  pdfContent: Buffer | string,
  options: FileUploadOptions = {}
): Promise<BlobUploadResult> {
  const sanitizedName = monsterName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const filename = `pdfs/monster-${sanitizedName}.pdf`;
  
  return uploadToBlob(filename, pdfContent, {
    contentType: 'application/pdf',
    access: 'public',
    ...options,
  });
}

/**
 * Upload an image file to blob storage
 */
export async function uploadImage(
  monsterName: string,
  imageContent: Buffer,
  options: FileUploadOptions = {}
): Promise<BlobUploadResult> {
  const sanitizedName = monsterName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const filename = `images/monster-${sanitizedName}.jpg`;
  
  return uploadToBlob(filename, imageContent, {
    contentType: 'image/jpeg',
    access: 'public',
    ...options,
  });
}

/**
 * Generate a PDF filename for a monster
 */
export function generatePDFFilename(monsterName: string): string {
  const sanitizedName = monsterName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `pdfs/monster-${sanitizedName}.pdf`;
}

/**
 * Generate an image filename for a monster
 */
export function generateImageFilename(monsterName: string): string {
  const sanitizedName = monsterName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `images/monster-${sanitizedName}.jpg`;
}

/**
 * Test blob storage connectivity
 */
export async function testBlobStorage(): Promise<boolean> {
  try {
    const testContent = 'Hello from Folklore! This is a test file.';
    const testBuffer = Buffer.from(testContent, 'utf-8');
    
    const result = await uploadToBlob('test-file.txt', testBuffer, {
      contentType: 'text/plain',
      access: 'public',
      addRandomSuffix: true,
    });
    
    console.log('✅ Blob storage test successful:', result.url);
    return true;
  } catch (error) {
    console.error('❌ Blob storage test failed:', error);
    return false;
  }
} 