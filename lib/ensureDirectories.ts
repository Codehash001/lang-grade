import fs from 'fs';
import path from 'path';
import { rimraf } from 'rimraf';

export const runtime = 'nodejs';

// List of required directories
const REQUIRED_DIRECTORIES = [
  'docs',
  'docs/parsed',
  'docs/uploaded',
  'tmp'
];

export async function ensureDirectoriesExist() {
  REQUIRED_DIRECTORIES.forEach(async dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      await fs.mkdirSync(fullPath, { recursive: true });
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

// Function to clear required directories
export async function clearRequiredDirectories() {
  for (const dir of REQUIRED_DIRECTORIES) {
    try {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        // Using rimraf to safely remove directory contents
        await rimraf(path.join(fullPath, '*'), { glob: true });
        console.log(`Cleared directory: ${fullPath}`);
      }
    } catch (error) {
      console.warn(`Warning: Could not clear directory ${dir}:`, error);
      // Continue with other directories even if one fails
      continue;
    }
  }
}

// Function to clear specific directories
export async function clearSpecificDirectories(directories: string[]) {
  for (const dir of directories) {
    try {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        // Using rimraf to safely remove directory contents
        await rimraf(path.join(fullPath, '*'), { glob: true });
        console.log(`Cleared directory: ${fullPath}`);
      }
    } catch (error) {
      console.warn(`Warning: Could not clear directory ${dir}:`, error);
      // Continue with other directories even if one fails
      continue;
    }
  }
}
