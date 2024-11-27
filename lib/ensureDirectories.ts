import fs from 'fs';
import path from 'path';

// List of required directories
const REQUIRED_DIRECTORIES = [
  'docs',
  'docs/parsed',
  'docs/uploaded',
  'tmp'
];

export function ensureDirectoriesExist() {
  REQUIRED_DIRECTORIES.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${fullPath}`);
    }
  });
}

export function ensureDirectoryExists(dirPath: string) {
  const fullPath = path.join(process.cwd(), dirPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  }
  return fullPath;
}
