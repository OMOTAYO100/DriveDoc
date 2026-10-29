/**
 * Generate the PWA / notification icon set from a single vector source.
 *
 * Run with: npm run icons
 *
 * The icons are committed, so this only needs re-running when the mark changes.
 * Note the files in src/assets named *.png are actually JPEGs, which is why the
 * mark is authored here as SVG rather than resized from them.
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../public/icons');

const BLUE = '#2563eb';
const BLUE_DEEP = '#1d4ed8';

/**
 * The mark: a document with a folded corner and a check, on a rounded square.
 * `padded` leaves the safe margin a maskable icon needs; the plain variant
 * fills more of the canvas for small sizes where detail is scarce.
 */
const markSvg = ({ size, padded = false, bg = true }) => {
  const inset = padded ? size * 0.14 : size * 0.06;
  const r = size * (padded ? 0.0 : 0.22);
  const w = size - inset * 2;

  // Document geometry, in a 0..100 box mapped into the inset area.
  const px = (n) => inset + (n / 100) * w;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BLUE}"/>
      <stop offset="1" stop-color="${BLUE_DEEP}"/>
    </linearGradient>
  </defs>
  ${bg ? `<rect width="${size}" height="${size}" rx="${r}" fill="url(#g)"/>` : ''}
  <path d="M ${px(22)} ${px(14)}
           L ${px(60)} ${px(14)}
           L ${px(78)} ${px(32)}
           L ${px(78)} ${px(86)}
           L ${px(22)} ${px(86)} Z"
        fill="#ffffff"/>
  <path d="M ${px(60)} ${px(14)} L ${px(78)} ${px(32)} L ${px(60)} ${px(32)} Z"
        fill="#c7d8fb"/>
  <path d="M ${px(33)} ${px(58)} L ${px(45)} ${px(70)} L ${px(68)} ${px(45)}"
        fill="none" stroke="${BLUE}" stroke-width="${w * 0.085}"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
};

// Monochrome badge. Android renders the badge as a silhouette, so detail and
// colour are wasted here — a solid, high-contrast glyph is what reads.
const badgeSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <path d="M26 10 H60 L80 30 V90 H26 Z" fill="#ffffff"/>
  <path d="M34 54 L46 66 L70 40" fill="none" stroke="#000000" stroke-width="9"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const targets = [
  { name: 'icon-192x192.png', size: 192, svg: (s) => markSvg({ size: s }) },
  { name: 'icon-512x512.png', size: 512, svg: (s) => markSvg({ size: s }) },
  { name: 'icon-maskable-512x512.png', size: 512, svg: (s) => markSvg({ size: s, padded: true }) },
  { name: 'apple-touch-icon.png', size: 180, svg: (s) => markSvg({ size: s }) },
  { name: 'badge-72x72.png', size: 72, svg: () => badgeSvg(72) },
  { name: 'favicon-32x32.png', size: 32, svg: (s) => markSvg({ size: s }) },
];

await mkdir(OUT_DIR, { recursive: true });

for (const { name, size, svg } of targets) {
  const buf = Buffer.from(svg(size));
  await sharp(buf, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(resolve(OUT_DIR, name));
  console.log(`✓ icons/${name} (${size}×${size})`);
}

// A vector favicon for browsers that take one, alongside the PNG fallback.
await writeFile(resolve(OUT_DIR, 'icon.svg'), markSvg({ size: 512 }), 'utf8');
console.log('✓ icons/icon.svg');
