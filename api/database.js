import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

// dotenv for local dev only — Vercel provides env vars natively
try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch (e) {
  // dotenv not critical in production
}

const supabaseUrl = process.env.SUPABASE_URL || 'https://kmuxynyflukfvkjapjme.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseKey) {
  console.warn('⚠ SUPABASE_KEY is not set. Database operations will fail. Set it in Vercel Environment Variables.');
}

// Use /tmp inside Vercel environment for writable uploads
const UPLOADS_DIR = path.join('/tmp', 'uploads');
const MAPS_DIR = path.join(UPLOADS_DIR, 'maps');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');

// Ensure writable upload directories exist in /tmp
try {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(MAPS_DIR)) fs.mkdirSync(MAPS_DIR, { recursive: true });
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
} catch (e) {
  // Directory creation may fail in some environments — not critical
  console.warn('Upload directory creation skipped:', e.message);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
export { MAPS_DIR, IMAGES_DIR };
