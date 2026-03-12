/**
 * Upload portfolio images to Vercel Blob
 *
 * Prerequisites:
 * 1. Create a Blob store in Vercel Dashboard (Project Settings > Storage > Create Database > Blob)
 * 2. Copy BLOB_READ_WRITE_TOKEN to .env.local
 *
 * Run with: npx tsx scripts/upload-to-blob.ts
 */

import { put } from '@vercel/blob';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load env vars from .env.local
dotenv.config({ path: '.env.local' });

const PORTFOLIO_DIR = path.join(process.cwd(), 'public', 'port_recent_work');

interface UploadResult {
  localPath: string;
  blobUrl: string;
}

async function getAllFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllFiles(fullPath, baseDir));
    } else if (/\.(png|jpg|jpeg|webp|avif|gif|pdf)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function uploadFile(filePath: string): Promise<UploadResult> {
  const relativePath = path.relative(PORTFOLIO_DIR, filePath);
  const blobPath = `portfolio/${relativePath.replace(/\\/g, '/')}`;

  const fileBuffer = fs.readFileSync(filePath);
  const blob = await put(blobPath, fileBuffer, {
    access: 'public',
    addRandomSuffix: false, // Keep clean URLs
  });

  return {
    localPath: `/port_recent_work/${relativePath.replace(/\\/g, '/')}`,
    blobUrl: blob.url,
  };
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN not found in environment');
    console.log('\nTo set up Vercel Blob:');
    console.log('1. Go to your Vercel project dashboard');
    console.log('2. Navigate to Storage > Create Database > Blob');
    console.log('3. Copy the BLOB_READ_WRITE_TOKEN to your .env.local file');
    process.exit(1);
  }

  console.log('🔍 Finding files in', PORTFOLIO_DIR);
  const files = await getAllFiles(PORTFOLIO_DIR);
  console.log(`📁 Found ${files.length} files to upload\n`);

  const results: UploadResult[] = [];

  for (const file of files) {
    const relativePath = path.relative(PORTFOLIO_DIR, file);
    process.stdout.write(`⬆️  Uploading ${relativePath}...`);

    try {
      const result = await uploadFile(file);
      results.push(result);
      console.log(' ✅');
    } catch (error) {
      console.log(' ❌');
      console.error(`   Error: ${error}`);
    }
  }

  console.log('\n✨ Upload complete!\n');
  console.log('📋 URL Mapping (copy this to update experience-data.ts):\n');
  console.log('const blobUrls: Record<string, string> = {');
  for (const result of results) {
    console.log(`  '${result.localPath}': '${result.blobUrl}',`);
  }
  console.log('};');

  // Also save to a JSON file for reference
  const outputPath = path.join(process.cwd(), 'scripts', 'blob-urls.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 URL mapping saved to ${outputPath}`);
}

main().catch(console.error);
