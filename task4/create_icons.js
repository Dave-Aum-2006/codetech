import fs from 'fs';
import path from 'path';

const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAABcRAAAXEQHKJ2M/AAAACXBIWXMAABcRAAAXEQHKJ2M/AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAA4SURBVHjaYmSp/M9AETAyMDRgGAWjYBSMglEwCkbBKBgFo2AUjIJRMApGwSgYBaNgFIyCUYACAAEA/wD+2qF0AAAAAElFTkSuQmCC';

const iconsDir = path.join('extension', 'icons');
if (!fs.existsSync(iconsDir)){
    fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [16, 48, 128];
sizes.forEach(size => {
  const filePath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, Buffer.from(base64Png, 'base64'));
  console.log(`Created icon: ${filePath}`);
});
