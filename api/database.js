import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://kmuxynyflukfvkjapjme.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

// Use /tmp inside Vercel environment for writable uploads
const UPLOADS_DIR = path.join('/tmp', 'uploads');
const MAPS_DIR = path.join(UPLOADS_DIR, 'maps');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');

// Ensure writable upload directories exist in /tmp
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(MAPS_DIR)) fs.mkdirSync(MAPS_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

export const supabase = createClient(supabaseUrl, supabaseKey || '');
export default supabase;
export { MAPS_DIR, IMAGES_DIR };
