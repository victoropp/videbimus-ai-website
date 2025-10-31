#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, 'public', 'images');
const backupDir = path.join(__dirname, 'public', 'images-backup');

// Optimization settings
const JPEG_QUALITY = 80; // 80% quality for JPEG
const PNG_QUALITY = 85; // 85% quality for PNG
const WEBP_QUALITY = 80; // WebP quality

// Size thresholds for different optimization levels
const SIZE_THRESHOLDS = {
  HERO: 200 * 1024, // Images > 200KB (likely hero images) - more aggressive
  FEATURE: 100 * 1024, // Images > 100KB (feature images) - standard
  THUMBNAIL: 50 * 1024 // Smaller images - lighter compression
};

const stats = {
  totalFiles: 0,
  optimizedFiles: 0,
  skippedFiles: 0,
  errors: 0,
  originalSize: 0,
  optimizedSize: 0,
  webpSize: 0,
  byDirectory: {}
};

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

async function getAllImages(dir) {
  const images = [];

  async function scan(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
          images.push(fullPath);
        }
      }
    }
  }

  await scan(dir);
  return images;
}

async function optimizeImage(imagePath) {
  const relativePath = path.relative(imagesDir, imagePath);
  const dirName = relativePath.split(path.sep)[0];

  if (!stats.byDirectory[dirName]) {
    stats.byDirectory[dirName] = {
      files: 0,
      originalSize: 0,
      optimizedSize: 0,
      webpSize: 0
    };
  }

  try {
    const originalSize = await getFileSize(imagePath);
    stats.totalFiles++;
    stats.originalSize += originalSize;
    stats.byDirectory[dirName].files++;
    stats.byDirectory[dirName].originalSize += originalSize;

    // Determine quality based on original file size
    let jpegQuality = JPEG_QUALITY;
    let webpQuality = WEBP_QUALITY;

    if (originalSize > SIZE_THRESHOLDS.HERO) {
      // Hero images - more aggressive compression
      jpegQuality = 75;
      webpQuality = 75;
    } else if (originalSize > SIZE_THRESHOLDS.FEATURE) {
      // Feature images - standard compression
      jpegQuality = 80;
      webpQuality = 80;
    } else {
      // Smaller images - preserve more quality
      jpegQuality = 85;
      webpQuality = 85;
    }

    const ext = path.extname(imagePath).toLowerCase();
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // Create backup
    const backupPath = imagePath.replace(imagesDir, backupDir);
    await ensureDir(path.dirname(backupPath));
    await fs.copyFile(imagePath, backupPath);

    // Optimize original format
    if (ext === '.jpg' || ext === '.jpeg') {
      await image
        .jpeg({ quality: jpegQuality, progressive: true, mozjpeg: true })
        .toFile(imagePath + '.tmp');
    } else if (ext === '.png') {
      await image
        .png({ quality: PNG_QUALITY, compressionLevel: 9 })
        .toFile(imagePath + '.tmp');
    }

    // Replace original with optimized
    await fs.rename(imagePath + '.tmp', imagePath);
    const optimizedSize = await getFileSize(imagePath);
    stats.optimizedSize += optimizedSize;
    stats.byDirectory[dirName].optimizedSize += optimizedSize;

    // Create WebP version
    const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    await sharp(imagePath)
      .webp({ quality: webpQuality })
      .toFile(webpPath);

    const webpSize = await getFileSize(webpPath);
    stats.webpSize += webpSize;
    stats.byDirectory[dirName].webpSize += webpSize;

    stats.optimizedFiles++;

    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    const webpSavings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);

    console.log(`✓ ${relativePath}`);
    console.log(`  Original: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`  Optimized: ${(optimizedSize / 1024).toFixed(2)} KB (${savings}% reduction)`);
    console.log(`  WebP: ${(webpSize / 1024).toFixed(2)} KB (${webpSavings}% reduction)`);

  } catch (err) {
    console.error(`✗ Error processing ${relativePath}:`, err.message);
    stats.errors++;
  }
}

async function generateReport() {
  const totalSavings = ((stats.originalSize - stats.optimizedSize) / stats.originalSize * 100).toFixed(1);
  const webpSavings = ((stats.originalSize - stats.webpSize) / stats.originalSize * 100).toFixed(1);

  let report = '\n\n';
  report += '═══════════════════════════════════════════════════════════\n';
  report += '                IMAGE OPTIMIZATION REPORT                  \n';
  report += '═══════════════════════════════════════════════════════════\n\n';

  report += '📊 OVERALL SUMMARY\n';
  report += '─────────────────────────────────────────────────────────\n';
  report += `Total Images Processed: ${stats.totalFiles}\n`;
  report += `Successfully Optimized: ${stats.optimizedFiles}\n`;
  report += `Errors: ${stats.errors}\n\n`;

  report += `Original Total Size:  ${(stats.originalSize / 1024 / 1024).toFixed(2)} MB\n`;
  report += `Optimized Total Size: ${(stats.optimizedSize / 1024 / 1024).toFixed(2)} MB (${totalSavings}% reduction)\n`;
  report += `WebP Total Size:      ${(stats.webpSize / 1024 / 1024).toFixed(2)} MB (${webpSavings}% reduction)\n\n`;

  report += `💾 Total Bandwidth Savings:\n`;
  report += `  - JPEG/PNG: ${((stats.originalSize - stats.optimizedSize) / 1024 / 1024).toFixed(2)} MB\n`;
  report += `  - WebP:     ${((stats.originalSize - stats.webpSize) / 1024 / 1024).toFixed(2)} MB\n\n`;

  report += '📁 BY DIRECTORY\n';
  report += '─────────────────────────────────────────────────────────\n';

  for (const [dir, data] of Object.entries(stats.byDirectory)) {
    const dirSavings = ((data.originalSize - data.optimizedSize) / data.originalSize * 100).toFixed(1);
    const dirWebpSavings = ((data.originalSize - data.webpSize) / data.originalSize * 100).toFixed(1);

    report += `\n${dir}/\n`;
    report += `  Files: ${data.files}\n`;
    report += `  Original:  ${(data.originalSize / 1024).toFixed(2)} KB\n`;
    report += `  Optimized: ${(data.optimizedSize / 1024).toFixed(2)} KB (${dirSavings}% reduction)\n`;
    report += `  WebP:      ${(data.webpSize / 1024).toFixed(2)} KB (${dirWebpSavings}% reduction)\n`;
  }

  report += '\n\n📋 OPTIMIZATION STRATEGY USED\n';
  report += '─────────────────────────────────────────────────────────\n';
  report += 'Hero Images (>200KB):    75% quality (aggressive)\n';
  report += 'Feature Images (>100KB): 80% quality (standard)\n';
  report += 'Smaller Images (<100KB): 85% quality (preserve quality)\n\n';

  report += '🎯 NEXT.JS CONFIGURATION RECOMMENDATIONS\n';
  report += '─────────────────────────────────────────────────────────\n';
  report += '1. Update next.config.mjs to prioritize WebP:\n\n';
  report += '   images: {\n';
  report += '     formats: [\'image/webp\', \'image/jpeg\'],\n';
  report += '     deviceSizes: [640, 750, 828, 1080, 1200, 1920],\n';
  report += '     imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],\n';
  report += '   }\n\n';

  report += '2. Update Image components to use optimized images:\n\n';
  report += '   <Image\n';
  report += '     src="/images/hero.jpg"\n';
  report += '     alt="Hero"\n';
  report += '     width={1920}\n';
  report += '     height={1080}\n';
  report += '     priority // for above-fold images\n';
  report += '   />\n\n';

  report += '3. Browser support:\n';
  report += '   - Modern browsers will automatically use WebP\n';
  report += '   - Fallback to optimized JPEG/PNG for older browsers\n\n';

  report += '📦 BACKUP LOCATION\n';
  report += '─────────────────────────────────────────────────────────\n';
  report += `Original images backed up to: ${backupDir}\n`;
  report += 'You can restore from backup if needed.\n\n';

  report += '═══════════════════════════════════════════════════════════\n';

  console.log(report);

  // Save report to file
  const reportPath = path.join(__dirname, 'optimization-report.txt');
  await fs.writeFile(reportPath, report);
  console.log(`\n📄 Full report saved to: ${reportPath}\n`);
}

async function main() {
  console.log('🚀 Starting image optimization...\n');
  console.log(`📂 Images directory: ${imagesDir}`);
  console.log(`💾 Backup directory: ${backupDir}\n`);

  // Ensure backup directory exists
  await ensureDir(backupDir);

  // Get all images
  console.log('🔍 Scanning for images...\n');
  const images = await getAllImages(imagesDir);
  console.log(`Found ${images.length} images to optimize\n`);

  // Optimize each image
  for (const imagePath of images) {
    await optimizeImage(imagePath);
  }

  // Generate report
  await generateReport();

  console.log('✅ Optimization complete!\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
