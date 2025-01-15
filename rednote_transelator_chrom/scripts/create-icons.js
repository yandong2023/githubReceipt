import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建一个简单的 SVG 图标
function createSvgIcon(size) {
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#fe2c55"/>
      <text x="${size/2}" y="${size*0.65}" 
            font-size="${size*0.6}" 
            text-anchor="middle" 
            fill="white" 
            font-family="Arial, sans-serif">T</text>
    </svg>
  `;
}

// 确保目录存在
const assetsDir = path.join(__dirname, '../src/assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 创建不同尺寸的图标
[16, 48, 128].forEach(size => {
  const svgContent = createSvgIcon(size);
  fs.writeFileSync(
    path.join(assetsDir, `icon${size}.svg`),
    svgContent
  );
  console.log(`Created icon${size}.svg`);
}); 