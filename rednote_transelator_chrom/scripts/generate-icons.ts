import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [16, 48, 128];
const inputSvg = path.join(__dirname, '../src/assets/icon.svg');
const outputDir = path.join(__dirname, '../src/assets');

async function generateIcons() {
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const size of sizes) {
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon${size}.png`));
    
    console.log(`Generated icon${size}.png`);
  }
}

generateIcons().catch(console.error); 