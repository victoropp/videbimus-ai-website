#!/usr/bin/env node

/**
 * State-of-the-art icon generation script
 * Generates all required PWA icons from a base SVG
 */

const fs = require('fs');
const path = require('path');

// Modern icon sizes for comprehensive PWA support
const ICON_SIZES = [
  // Standard PWA sizes
  72, 96, 128, 144, 152, 192, 384, 512,
  // Apple Touch Icon sizes
  57, 60, 76, 114, 120, 180,
  // Microsoft Tile sizes
  70, 150, 310,
  // Favicon sizes
  16, 32, 48
];

const BASE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="1"/>
      <stop offset="50%" stop-color="#3b82f6" stop-opacity="1"/>
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="1"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.25"/>
    </filter>
  </defs>
  
  <!-- Background circle with gradient -->
  <circle cx="256" cy="256" r="240" fill="url(#gradient)" filter="url(#shadow)"/>
  
  <!-- AI Brain/Neural Network Icon -->
  <g transform="translate(156, 156)">
    <!-- Neural nodes -->
    <circle cx="50" cy="50" r="12" fill="white" opacity="0.9"/>
    <circle cx="150" cy="50" r="12" fill="white" opacity="0.9"/>
    <circle cx="100" cy="100" r="12" fill="white" opacity="0.9"/>
    <circle cx="50" cy="150" r="12" fill="white" opacity="0.9"/>
    <circle cx="150" cy="150" r="12" fill="white" opacity="0.9"/>
    
    <!-- Neural connections -->
    <path d="M50 50 L150 50 M50 50 L100 100 M150 50 L100 100 M100 100 L50 150 M100 100 L150 150 M50 150 L150 150" 
          stroke="white" stroke-width="3" opacity="0.7" stroke-linecap="round"/>
    
    <!-- Central processing unit -->
    <rect x="85" y="85" width="30" height="30" rx="4" fill="white" opacity="0.95"/>
    <rect x="90" y="90" width="20" height="20" rx="2" fill="url(#gradient)"/>
  </g>
  
  <!-- Brand text curve (for larger sizes) -->
  <defs>
    <path id="textcircle" d="M 256,256 m -200,0 a 200,200 0 1,1 400,0 a 200,200 0 1,1 -400,0"/>
  </defs>
  <text font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="600" fill="white" opacity="0.8">
    <textPath href="#textcircle" startOffset="50%" text-anchor="middle">
      VIDIBEMUS AI
    </textPath>
  </text>
</svg>
`.trim();

// Generate placeholder PNG data (base64 encoded 1x1 transparent pixel)
function generatePlaceholderPNG(size) {
  // In a real implementation, you'd use a proper image library like sharp or jimp
  // For now, we'll create a simple placeholder
  const canvas = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
      ${BASE_SVG.replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">', '')}
    </svg>
  `.trim();
  
  return canvas;
}

// Generate all icon files
function generateIcons() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  
  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  // Generate SVG icons for each size
  ICON_SIZES.forEach(size => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
        ${BASE_SVG.replace(/<svg[^>]*>/, '').replace('</svg>', '')}
      </svg>
    `.trim();
    
    fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svg);
    
    // Create a simple PNG placeholder (in production, convert SVG to PNG)
    const pngPlaceholder = `<!-- PNG placeholder for ${size}x${size} icon -->`;
    fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.png`), pngPlaceholder);
    
    console.log(`Generated icon-${size}x${size}.svg and placeholder PNG`);
  });
  
  // Generate Apple Touch Icons
  const appleSizes = [57, 60, 72, 76, 114, 120, 144, 152, 180];
  appleSizes.forEach(size => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
        ${BASE_SVG.replace(/<svg[^>]*>/, '').replace('</svg>', '')}
      </svg>
    `.trim();
    
    fs.writeFileSync(path.join(iconsDir, `apple-touch-icon-${size}x${size}.svg`), svg);
    console.log(`Generated apple-touch-icon-${size}x${size}.svg`);
  });
  
  // Generate favicon.ico placeholder
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), '<!-- ICO placeholder -->');
  
  console.log('\n✅ All icons generated successfully!');
  console.log('📝 Note: PNG files are currently placeholders. In production, use sharp or similar to convert SVG to PNG.');
}

if (require.main === module) {
  generateIcons();
}

module.exports = { generateIcons };