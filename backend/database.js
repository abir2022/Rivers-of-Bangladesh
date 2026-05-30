import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'rivers.db');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const MAPS_DIR = path.join(UPLOADS_DIR, 'maps');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');

// Ensure upload directories exist
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(MAPS_DIR)) fs.mkdirSync(MAPS_DIR);
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR);

// Copy Nilphamari files to uploads/maps/ if they exist in "River Files"
const sourceDir = path.join(__dirname, '..', 'River Files');
const kmlSource = path.join(sourceDir, 'Nilphamari District.kml');
const kmzSource = path.join(sourceDir, 'Nilphamari District.kmz');

if (fs.existsSync(kmlSource)) {
  fs.copyFileSync(kmlSource, path.join(MAPS_DIR, 'Nilphamari District.kml'));
  console.log('✓ Copied Nilphamari District.kml to backend uploads');
}
if (fs.existsSync(kmzSource)) {
  fs.copyFileSync(kmzSource, path.join(MAPS_DIR, 'Nilphamari District.kmz'));
  console.log('✓ Copied Nilphamari District.kmz to backend uploads');
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('✓ Connected to SQLite database.');
  }
});

// Use serialization to ensure tables are created step-by-step
db.serialize(() => {
  // 1. Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 2. Rivers table
  db.run(`CREATE TABLE IF NOT EXISTS rivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    bangla_name TEXT NOT NULL,
    length_km REAL NOT NULL,
    average_depth_m REAL NOT NULL,
    discharge_m3s REAL NOT NULL,
    origin TEXT NOT NULL,
    outflow TEXT NOT NULL,
    history TEXT NOT NULL,
    description TEXT NOT NULL,
    indigenous_culture TEXT NOT NULL,
    kml_path TEXT,
    image_path TEXT,
    gallery_images TEXT, -- JSON array of image paths
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    zoom_level REAL NOT NULL DEFAULT 8.0
  )`);

  // 3. Blogs table
  db.run(`CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT NOT NULL,
    image_path TEXT,
    author_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(author_id) REFERENCES users(id)
  )`);

  // 4. Blog Comments table
  db.run(`CREATE TABLE IF NOT EXISTS blog_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blog_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // 5. Forum Categories table
  db.run(`CREATE TABLE IF NOT EXISTS forum_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL
  )`);

  // 6. Forum Topics table
  db.run(`CREATE TABLE IF NOT EXISTS forum_topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES forum_categories(id) ON DELETE CASCADE,
    FOREIGN KEY(author_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // 7. Forum Replies table
  db.run(`CREATE TABLE IF NOT EXISTS forum_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(topic_id) REFERENCES forum_topics(id) ON DELETE CASCADE,
    FOREIGN KEY(author_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // 8. River Comments table
  db.run(`CREATE TABLE IF NOT EXISTS river_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    river_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(river_id) REFERENCES rivers(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);


  // --- SEED MOCK DATA ---
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      const salt = bcrypt.genSaltSync(10);
      const adminPass = bcrypt.hashSync('admin123', salt);
      const userPass = bcrypt.hashSync('user123', salt);

      db.run("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", 
        ['admin', 'admin@riverflow.org', adminPass, 'admin']
      );
      db.run("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", 
        ['explorer_kamal', 'kamal@riverflow.org', userPass, 'user']
      );
      console.log('✓ Seeded admin & user accounts.');
    }
  });

  db.get("SELECT COUNT(*) as count FROM rivers", (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      // Seed Nilphamari Waterways (using the uploaded KML)
      db.run(`INSERT INTO rivers (name, bangla_name, length_km, average_depth_m, discharge_m3s, origin, outflow, history, description, indigenous_culture, kml_path, image_path, gallery_images, lat, lng, zoom_level) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        'Nilphamari District Waterways',
        'নীলফামারী জেলা নদীপথ',
        45.2,
        4.5,
        150,
        'Himalayan foothills',
        'Tista River / Jamuneswari River',
        'The water systems of Nilphamari District represent an intricate web of sub-tributaries from the massive Tista basin. Historically vital for agricultural irrigation and trade, rivers like the Deonai, Charalkata, and Jamuneswari have carved the agrarian landscape of northern Bangladesh.',
        'An immersive visualization of the various rivers and waterways crossing the Nilphamari District in northern Bangladesh, showing tributaries that support local agriculture and communities.',
        'Local legends speak of the river deities providing safety during the monsoon floods. The indigenous Koch and Rajbanshi communities have a deep, spiritual bond with these waters, celebrating the annual river harvest festivals.',
        '/uploads/maps/Nilphamari District.kml',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBICLsik4pi_6qdqf6EO8Gi8ZOV-XfQUZMzlqQ6ZTFg45RNnlf9umtqdnQabMAxpoMYriBakEgLK3YiN7MGt8P_TG66RYsoU2xMxJBvAJD05QVi7cIpe2dCNeTw_a0yhLEkE3LERrheUY6H0B2tm8ATDkG8pA8Qfn9RzAy6-E0LK241aaA_305Hi8weh9mxujz8XnXB66-T4bs07vpr9lMct5Eypjmbvja7CO7Jd3Rz5Zyt_kg9X5rgtABWlP1EZoGqwbIaJcfffIHP',
        JSON.stringify([
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBICLsik4pi_6qdqf6EO8Gi8ZOV-XfQUZMzlqQ6ZTFg45RNnlf9umtqdnQabMAxpoMYriBakEgLK3YiN7MGt8P_TG66RYsoU2xMxJBvAJD05QVi7cIpe2dCNeTw_a0yhLEkE3LERrheUY6H0B2tm8ATDkG8pA8Qfn9RzAy6-E0LK241aaA_305Hi8weh9mxujz8XnXB66-T4bs07vpr9lMct5Eypjmbvja7CO7Jd3Rz5Zyt_kg9X5rgtABWlP1EZoGqwbIaJcfffIHP',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBBEtIzHTpg8mbUiS61YRRBfmqoJ1XcRje7MjqDgKmHSmU5IoKo8iJCOi0V9-HP3pXJSLIywZjmGNaDul7L3JCOCFYAuuLoWaH5XzgqvhAg66TXH9plB0AP5iZxLHB_qyyZKiZK08GTf06KtLU_CY7756HkWJdERAqtjPGB3YMWimPAiien72FVCRzR-BdzOxCPsR_bGPnM0j_Sfj2AgR2xC67hIvQ-mjNL2-AijytUBkjf4J6k78oFZS12wo71WnsqA_GBZEVLuXpk'
        ]),
        25.9381, // Lat for Nilphamari
        88.9405, // Lng for Nilphamari
        10.5
      ]);

      // Seed Padma
      db.run(`INSERT INTO rivers (name, bangla_name, length_km, average_depth_m, discharge_m3s, origin, outflow, history, description, indigenous_culture, kml_path, image_path, gallery_images, lat, lng, zoom_level) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        'Padma River',
        'পদ্মা নদী',
        366,
        20,
        35000,
        'Gangotri Glacier (as Ganges)',
        'Bay of Bengal (via Meghna Estuary)',
        'The Padma is one of the mightiest rivers in Asia, serving as the main distributary of the Ganges. It entered Bengal through the northern Rajshahi division and has historically shifted its course multiple times, shaping the entire delta. The construction of the Padma Multipurpose Bridge in 2022 remains a monument to human engineering over its volatile current.',
        'The primary water artery of southwestern Bangladesh, carrying massive volumes of alluvial sediments and driving the regional economy.',
        'The Padma is deeply romanticized in Bengali literature and music. Famous singer-poets have composed Bhatiyali (boatmen songs) expressing deep reverence and fear of Kirtinasha (the destroyer of achievements) Padma.',
        '', // Empty KML, will render dummy vector path or custom uploaded file
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBtV8rDxQM2tCVsHh0G49BJv72vgdxCizgsyWX5NIbnXysRbkVzfkYgMxVhLHD5orf1byIsr6mtfgUrM9lQP1mcnh6dvCByNgO_AAW54k2_tuek8C-yRA-w5_A7DrrlX7n_DGZURk_Y1lBCTJpnGT4ZEgVrwuM-Xx_lh7MKnzhF-vE2tauuW3zMU6lHPZC1yacldBTrlGc3VmjhheIg7r-1juNITiS3w3ucM2u0b1H8vKK3UkFOOpyPS9AZRfDeBaxG7CKUxel4ztNF',
        JSON.stringify([
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBtV8rDxQM2tCVsHh0G49BJv72vgdxCizgsyWX5NIbnXysRbkVzfkYgMxVhLHD5orf1byIsr6mtfgUrM9lQP1mcnh6dvCByNgO_AAW54k2_tuek8C-yRA-w5_A7DrrlX7n_DGZURk_Y1lBCTJpnGT4ZEgVrwuM-Xx_lh7MKnzhF-vE2tauuW3zMU6lHPZC1yacldBTrlGc3VmjhheIg7r-1juNITiS3w3ucM2u0b1H8vKK3UkFOOpyPS9AZRfDeBaxG7CKUxel4ztNF',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuA-7Bs2l7aI77fm0s24gN0_rd4jB-MyqHkWmy18Bbaoh6j6N7Mf5_6kyEKjIOx4KHXLeUQSxRGvKfp6aTHjDS24ZUdqBF6WiVRrp2_nYPEiiS7UUW7iME1Mv_veDBmMQLCYE2P3xCdz-zvXai46akXHunEoHAMq-S902E864fzQb_YMzklUcUXny4NWaIAMfjAYa0XAzVBBILDtpeidjm4G1wZSJVy-8nryHUIIDgKnnpyxRGEnBaeh_9eCAqEDl4g-hkIqG0nD_TBp'
        ]),
        23.5937,
        89.8732,
        8.5
      ]);

      // Seed Jamuna
      db.run(`INSERT INTO rivers (name, bangla_name, length_km, average_depth_m, discharge_m3s, origin, outflow, history, description, indigenous_culture, kml_path, image_path, gallery_images, lat, lng, zoom_level) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        'Jamuna River',
        'যমুনা নদী',
        205,
        18,
        22000,
        'Chemayungdung Glacier (as Brahmaputra)',
        'Padma River',
        'Formed in 1787 after a massive earthquake and catastrophic flood that diverted the main flow of the Brahmaputra River southward, the Jamuna is a relatively young but incredibly powerful braided river channel. It is famous for its dynamic sandy islands (Chars), inhabited by resilient delta communities.',
        'The main braided channel of the Brahmaputra system inside Bangladesh, wide and constantly shifting its sandy islands.',
        'Char life has fostered a unique culture of nomadic adaptation, where families relocate as islands dissolve and re-emerge. Folk songs celebrate the mystical patience required to coexist with Jamuna.',
        '',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCd59BpQucApWcMP3yTs0IoXn0xVLL6kFpimLziF1ZyTFyang2Ke9iLHVWocsaj4aDgtJXeRa_KSf9KX_A441Wx_pbALdti8lkvwvDipBF3h4d_DXy7CUh61c16bLEZUbISunVQ0i0BcqLtOiSa2zEqSCctUWTqdHHN2PY-OCVtOclYygD1A-M9SVPESe1hdFxUdxEmwMrBUOEG_IzNED4-m_LLZnYdVtY3VrVFmDGVy5m5dYwrG8WGRYMczrLCZmv6776Zga2eMrtm',
        JSON.stringify([
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCd59BpQucApWcMP3yTs0IoXn0xVLL6kFpimLziF1ZyTFyang2Ke9iLHVWocsaj4aDgtJXeRa_KSf9KX_A441Wx_pbALdti8lkvwvDipBF3h4d_DXy7CUh61c16bLEZUbISunVQ0i0BcqLtOiSa2zEqSCctUWTqdHHN2PY-OCVtOclYygD1A-M9SVPESe1hdFxUdxEmwMrBUOEG_IzNED4-m_LLZnYdVtY3VrVFmDGVy5m5dYwrG8WGRYMczrLCZmv6776Zga2eMrtm'
        ]),
        24.4754,
        89.7028,
        8.5
      ]);

      // Seed Buriganga
      db.run(`INSERT INTO rivers (name, bangla_name, length_km, average_depth_m, discharge_m3s, origin, outflow, history, description, indigenous_culture, kml_path, image_path, gallery_images, lat, lng, zoom_level) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        'Buriganga River',
        'বুড়িগঙ্গা নদী',
        18,
        12,
        400,
        'Dhaleshwari River',
        'Dhaleshwari River',
        'The Buriganga ("Old Ganges") is the lifeblood of old Dhaka. When the Mughals established Dhaka as their capital in 1608, they chose its northern banks. Historically a sparkling trade route, the Buriganga is today a poignant reminder of industrial environmental stress, motivating heavy restoration campaigns.',
        'Dhaka''s historic waterfront river, economically crucial but ecologically fragile, running along Sadarghat.',
        'Sadarghat on the Buriganga is one of the busiest river ports on earth, a chaotic and vibrant theatre of double-decker launches and wooden rowboats that defines Dhaka''s urban pulse.',
        '',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAembW9Jbj8ry5NCkOyBSV_OPP76wrruN_hRgBayufI1GfhwGzXN8NJBTjKiRJO87HO8Qm1iSwYWIy5Dq4RqbC4yXwMmMzB6jikzMm_h31P-j9dTz9GqoMtVIGceLzwVd6frOBWjI7yXCCAU0RbKHdn12l0RqW_jJbuml7wPlAPUhnagv4vgj5SeocutFZEe632JDbYlEpx3RVlbqhixkVwwDEB10rcLNCmQ2F4VzneJI0ZHMYjLTDqM5TkUbKF76Zk4i7hsMo8xxCI',
        JSON.stringify([
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAembW9Jbj8ry5NCkOyBSV_OPP76wrruN_hRgBayufI1GfhwGzXN8NJBTjKiRJO87HO8Qm1iSwYWIy5Dq4RqbC4yXwMmMzB6jikzMm_h31P-j9dTz9GqoMtVIGceLzwVd6frOBWjI7yXCCAU0RbKHdn12l0RqW_jJbuml7wPlAPUhnagv4vgj5SeocutFZEe632JDbYlEpx3RVlbqhixkVwwDEB10rcLNCmQ2F4VzneJI0ZHMYjLTDqM5TkUbKF76Zk4i7hsMo8xxCI'
        ]),
        23.6848,
        90.3924,
        12.0
      ]);

      console.log('✓ Seeded Bangladesh rivers database.');
    }
  });

  db.get("SELECT COUNT(*) as count FROM blogs", (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      db.run(`INSERT INTO blogs (title, content, summary, image_path, author_id) VALUES (?, ?, ?, ?, ?)`, [
        'The Dynamic Chars of the Jamuna River',
        'The Jamuna River is famous for its braided nature. One of the most fascinating features is the "chars" (sandy islands) that emerge and submerge dynamically. These chars are inhabited by millions of people who have developed an incredibly resilient lifestyle. When a char disappears under water during monsoon, families dismantle their wooden houses, pack up their animals, and move to a newly emerged char elsewhere. This article explores the geomorphology of char creation and the indigenous coping mechanism of char residents.',
        'A deep dive into the resilient communities inhabiting the shifting sandbars of the braided Jamuna River.',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCd59BpQucApWcMP3yTs0IoXn0xVLL6kFpimLziF1ZyTFyang2Ke9iLHVWocsaj4aDgtJXeRa_KSf9KX_A441Wx_pbALdti8lkvwvDipBF3h4d_DXy7CUh61c16bLEZUbISunVQ0i0BcqLtOiSa2zEqSCctUWTqdHHN2PY-OCVtOclYygD1A-M9SVPESe1hdFxUdxEmwMrBUOEG_IzNED4-m_LLZnYdVtY3VrVFmDGVy5m5dYwrG8WGRYMczrLCZmv6776Zga2eMrtm',
        1
      ]);

      db.run(`INSERT INTO blogs (title, content, summary, image_path, author_id) VALUES (?, ?, ?, ?, ?)`, [
        'Saving Buriganga: Dhaka''s Ecological Crusade',
        'For centuries, the Buriganga River has served as Dhaka''s primary trade artery. However, rapid industrialization, particularly from chemical tanneries and domestic sewage, has heavily impacted its waters. In recent years, local activists, youth networks, and government organizations have launched aggressive conservation crusades. Through biological dredging, waste-water treatment plants, and local legal frameworks, Dhaka is beginning to reclaim its riverbank heritage. Here is the scientific progress of the restoration.',
        'An investigative report on the scientific and community restoration efforts to clean the historic Buriganga River.',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAembW9Jbj8ry5NCkOyBSV_OPP76wrruN_hRgBayufI1GfhwGzXN8NJBTjKiRJO87HO8Qm1iSwYWIy5Dq4RqbC4yXwMmMzB6jikzMm_h31P-j9dTz9GqoMtVIGceLzwVd6frOBWjI7yXCCAU0RbKHdn12l0RqW_jJbuml7wPlAPUhnagv4vgj5SeocutFZEe632JDbYlEpx3RVlbqhixkVwwDEB10rcLNCmQ2F4VzneJI0ZHMYjLTDqM5TkUbKF76Zk4i7hsMo8xxCI',
        2
      ]);

      console.log('✓ Seeded blog posts.');
    }
  });

  db.get("SELECT COUNT(*) as count FROM forum_categories", (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      db.run("INSERT INTO forum_categories (name, description) VALUES (?, ?)", 
        ['River Hydrology & Geomorphology', 'Technical discussions on river course shifts, flow rates, sedimentation, and 3D terrain modeling.']
      );
      db.run("INSERT INTO forum_categories (name, description) VALUES (?, ?)", 
        ['History, Folklore & Culture', 'Exchanging oral narratives, river deities, Bhatiyali boat songs, and indigenous historical heritage.']
      );
      db.run("INSERT INTO forum_categories (name, description) VALUES (?, ?)", 
        ['Delta Conservation & Advocacy', 'Coordinating local river cleanups, eco-restoration drives, and legal policies on water protection.']
      );
      console.log('✓ Seeded forum categories.');

      // Add default topic and replies
      db.run(`INSERT INTO forum_topics (category_id, title, author_id) VALUES (?, ?, ?)`, [1, 'Tista River Course Shifts: What the KML data shows', 2], function(err) {
        if (err) return console.error(err);
        const topicId = this.lastID;
        db.run(`INSERT INTO forum_replies (topic_id, author_id, content) VALUES (?, ?, ?)`, [
          topicId,
          2,
          'Looking closely at the Nilphamari district KML file, you can clearly see that the active channel of the Tista river has pushed eastward by approximately 450 meters over the last two decades. The old alluvial channels are now dry farmland during winter. Does anyone have discharge telemetry for Deonai or Charalkata rivers to cross-reference this?'
        ]);
        db.run(`INSERT INTO forum_replies (topic_id, author_id, content) VALUES (?, ?, ?)`, [
          topicId,
          1,
          'Fascinating observation! The dry season flow of Deonai has dropped to less than 45 m3/s, which matches your thesis. I will upload a secondary GeoJSON layer showing dry season contours next week so we can overlays it on the 3D terrain explorer!'
        ]);
        console.log('✓ Seeded forum topic and replies.');
      });

      // Add default river comments for Nilphamari (River ID: 1)
      db.run("INSERT INTO river_comments (river_id, user_id, comment) VALUES (1, 1, 'Fascinating dry-season telemetry on the Deonai channels. The volumetric contours drape perfectly over the northern terrain!')");
      db.run("INSERT INTO river_comments (river_id, user_id, comment) VALUES (1, 2, 'Agreed! The Charalkata sub-channels seem to have shifted considerably this season. This KML capture is incredibly timely.')");
      console.log('✓ Seeded river comments.');
    }
  });
});

export default db;
export { DB_PATH, MAPS_DIR, IMAGES_DIR };
