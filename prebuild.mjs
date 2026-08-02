import fs from 'fs';
import path from 'path';
import os from 'os';

const TARGET_DIRS = ['app', 'components', 'lib', 'public'];

function chmodRecursive(dir, dirMode, fileMode) {
  if (!fs.existsSync(dir)) return;
  
  const stats = fs.statSync(dir);
  if (stats.isDirectory()) {
    try {
      fs.chmodSync(dir, dirMode);
    } catch (err) {
      console.warn(`Failed to chmod directory ${dir}: ${err.message}`);
    }
    
    fs.readdirSync(dir).forEach((file) => {
      chmodRecursive(path.join(dir, file), dirMode, fileMode);
    });
  } else if (stats.isFile()) {
    try {
      fs.chmodSync(dir, fileMode);
    } catch (err) {
      console.warn(`Failed to chmod file ${dir}: ${err.message}`);
    }
  }
}

if (os.platform() !== 'win32') {
  console.log('Unix-like platform detected. Normalizing directory permissions (755) and file permissions (644)...');
  TARGET_DIRS.forEach((dirName) => {
    const dirPath = path.join(process.cwd(), dirName);
    if (fs.existsSync(dirPath)) {
      console.log(`Setting permissions for: ${dirName}`);
      chmodRecursive(dirPath, 0o755, 0o644);
    }
  });
  console.log('Permissions normalized successfully!');
} else {
  console.log('Windows platform detected. Skipping chmod permission normalization.');
}

// Crucial fix: Remove public/_next before building to avoid Next.js public-next-folder-conflict error
const publicNextDir = path.join(process.cwd(), 'public', '_next');
if (fs.existsSync(publicNextDir)) {
  console.log('Removing public/_next to avoid Next.js build conflicts...');
  try {
    fs.rmSync(publicNextDir, { recursive: true, force: true });
    console.log('Successfully removed public/_next.');
  } catch (err) {
    console.warn(`Failed to remove public/_next: ${err.message}`);
  }
}

