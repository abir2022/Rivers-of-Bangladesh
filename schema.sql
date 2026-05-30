-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Rivers Table
CREATE TABLE IF NOT EXISTS rivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    bangla_name VARCHAR(255) NOT NULL,
    length_km REAL NOT NULL,
    average_depth_m REAL NOT NULL,
    discharge_m3s REAL NOT NULL,
    origin VARCHAR(1000) NOT NULL,
    outflow VARCHAR(1000) NOT NULL,
    history TEXT NOT NULL,
    description TEXT NOT NULL,
    indigenous_culture TEXT NOT NULL,
    kml_path VARCHAR(1000),
    image_path VARCHAR(1000),
    gallery_images JSONB,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    zoom_level REAL NOT NULL DEFAULT 8.0
);

-- 3. Create Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT NOT NULL,
    image_path VARCHAR(1000),
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Blog Comments Table
CREATE TABLE IF NOT EXISTS blog_comments (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Forum Categories Table
CREATE TABLE IF NOT EXISTS forum_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL
);

-- 6. Create Forum Topics Table
CREATE TABLE IF NOT EXISTS forum_topics (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES forum_categories(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Forum Replies Table
CREATE TABLE IF NOT EXISTS forum_replies (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES forum_topics(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create River Comments Table
CREATE TABLE IF NOT EXISTS river_comments (
    id SERIAL PRIMARY KEY,
    river_id INTEGER REFERENCES rivers(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --- SEED SEED DATA ---

-- Enable pgcrypto for proper bcrypt password hashing (pre-installed on Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Seed Users (using pgcrypto's crypt+gen_salt for REAL bcrypt hashes)
-- Admin password: admin123 | User password: user123
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@riverflow.org', crypt('admin123', gen_salt('bf', 10)), 'admin'),
('explorer_kamal', 'kamal@riverflow.org', crypt('user123', gen_salt('bf', 10)), 'user')
ON CONFLICT DO NOTHING;

-- Seed Rivers
INSERT INTO rivers (name, bangla_name, length_km, average_depth_m, discharge_m3s, origin, outflow, history, description, indigenous_culture, kml_path, image_path, gallery_images, lat, lng, zoom_level) VALUES 
(
  'Nilphamari District Waterways',
  'নীলফামারী জেলা নদীপথ',
  45.2,
  4.5,
  150,
  'Himalayan foothills',
  'Tista River / Jamuneswari River',
  'The water systems of Nilphamari District represent an intricate web of sub-tributaries from the massive Tista basin. Historically vital for agricultural irrigation and trade, rivers like the Deonai, Charalkata, and Jamuneswari have carved the fertile landscape of northern Bangladesh.',
  'An immersive visualization of the various rivers and waterways crossing the Nilphamari District in northern Bangladesh, showing tributaries that support local agriculture.',
  'Local legends speak of river spirits shielding villages during monsoon tides. Koch and Rajbanshi fishermen hold deep reverence for these waters, organizing annual harvest prayers.',
  '/uploads/maps/Nilphamari District.kml',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBICLsik4pi_6qdqf6EO8Gi8ZOV-XfQUZMzlqQ6ZTFg45RNnlf9umtqdnQabMAxpoMYriBakEgLK3YiN7MGt8P_TG66RYsoU2xMxJBvAJD05QVi7cIpe2dCNeTw_a0yhLEkE3LERrheUY6H0B2tm8ATDkG8pA8Qfn9RzAy6-E0LK241aaA_305Hi8weh9mxujz8XnXB66-T4bs07vpr9lMct5Eypjmbvja7CO7Jd3Rz5Zyt_kg9X5rgtABWlP1EZoGqwbIaJcfffIHP',
  '["https://lh3.googleusercontent.com/aida-public/AB6AXuBICLsik4pi_6qdqf6EO8Gi8ZOV-XfQUZMzlqQ6ZTFg45RNnlf9umtqdnQabMAxpoMYriBakEgLK3YiN7MGt8P_TG66RYsoU2xMxJBvAJD05QVi7cIpe2dCNeTw_a0yhLEkE3LERrheUY6H0B2tm8ATDkG8pA8Qfn9RzAy6-E0LK241aaA_305Hi8weh9mxujz8XnXB66-T4bs07vpr9lMct5Eypjmbvja7CO7Jd3Rz5Zyt_kg9X5rgtABWlP1EZoGqwbIaJcfffIHP"]',
  25.9381,
  88.9405,
  10.5
),
(
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
  '',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBtV8rDxQM2tCVsHh0G49BJv72vgdxCizgsyWX5NIbnXysRbkVzfkYgMxVhLHD5orf1byIsr6mtfgUrM9lQP1mcnh6dvCByNgO_AAW54k2_tuek8C-yRA-w5_A7DrrlX7n_DGZURk_Y1lBCTJpnGT4ZEgVrwuM-Xx_lh7MKnzhF-vE2tauuW3zMU6lHPZC1yacldBTrlGc3VmjhheIg7r-1juNITiS3w3ucM2u0b1H8vKK3UkFOOpyPS9AZRfDeBaxG7CKUxel4ztNF',
  '["https://lh3.googleusercontent.com/aida-public/AB6AXuBtV8rDxQM2tCVsHh0G49BJv72vgdxCizgsyWX5NIbnXysRbkVzfkYgMxVhLHD5orf1byIsr6mtfgUrM9lQP1mcnh6dvCByNgO_AAW54k2_tuek8C-yRA-w5_A7DrrlX7n_DGZURk_Y1lBCTJpnGT4ZEgVrwuM-Xx_lh7MKnzhF-vE2tauuW3zMU6lHPZC1yacldBTrlGc3VmjhheIg7r-1juNITiS3w3ucM2u0b1H8vKK3UkFOOpyPS9AZRfDeBaxG7CKUxel4ztNF"]',
  23.5937,
  89.8732,
  8.5
),
(
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
  '["https://lh3.googleusercontent.com/aida-public/AB6AXuCd59BpQucApWcMP3yTs0IoXn0xVLL6kFpimLziF1ZyTFyang2Ke9iLHVWocsaj4aDgtJXeRa_KSf9KX_A441Wx_pbALdti8lkvwvDipBF3h4d_DXy7CUh61c16bLEZUbISunVQ0i0BcqLtOiSa2zEqSCctUWTqdHHN2PY-OCVtOclYygD1A-M9SVPESe1hdFxUdxEmwMrBUOEG_IzNED4-m_LLZnYdVtY3VrVFmDGVy5m5dYwrG8WGRYMczrLCZmv6776Zga2eMrtm"]',
  24.4754,
  89.7028,
  8.5
),
(
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
  '["https://lh3.googleusercontent.com/aida-public/AB6AXuAembW9Jbj8ry5NCkOyBSV_OPP76wrruN_hRgBayufI1GfhwGzXN8NJBTjKiRJO87HO8Qm1iSwYWIy5Dq4RqbC4yXwMmMzB6jikzMm_h31P-j9dTz9GqoMtVIGceLzwVd6frOBWjI7yXCCAU0RbKHdn12l0RqW_jJbuml7wPlAPUhnagv4vgj5SeocutFZEe632JDbYlEpx3RVlbqhixkVwwDEB10rcLNCmQ2F4VzneJI0ZHMYjLTDqM5TkUbKF76Zk4i7hsMo8xxCI"]',
  23.6848,
  90.3924,
  12.0
)
ON CONFLICT DO NOTHING;

-- Seed Blogs
INSERT INTO blogs (id, title, content, summary, image_path, author_id) VALUES 
(
  1,
  'The Dynamic Chars of the Jamuna River',
  'The Jamuna River is famous for its braided nature. One of the most fascinating features is the "chars" (sandy islands) that emerge and submerge dynamically. These chars are inhabited by millions of people who have developed an incredibly resilient lifestyle. When a char disappears under water during monsoon, families dismantle their wooden houses, pack up their animals, and move to a newly emerged char elsewhere. This article explores the geomorphology of char creation and the indigenous coping mechanism of char residents.',
  'A deep dive into the resilient communities inhabiting the shifting sandbars of the braided Jamuna River.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCd59BpQucApWcMP3yTs0IoXn0xVLL6kFpimLziF1ZyTFyang2Ke9iLHVWocsaj4aDgtJXeRa_KSf9KX_A441Wx_pbALdti8lkvwvDipBF3h4d_DXy7CUh61c16bLEZUbISunVQ0i0BcqLtOiSa2zEqSCctUWTqdHHN2PY-OCVtOclYygD1A-M9SVPESe1hdFxUdxEmwMrBUOEG_IzNED4-m_LLZnYdVtY3VrVFmDGVy5m5dYwrG8WGRYMczrLCZmv6776Zga2eMrtm',
  1
),
(
  2,
  'Saving Buriganga: Dhaka''s Ecological Crusade',
  'For centuries, the Buriganga River has served as Dhaka''s primary trade artery. However, rapid industrialization, particularly from chemical tanneries and domestic sewage, has heavily impacted its waters. In recent years, local activists, youth networks, and government organizations have launched aggressive conservation crusades. Through biological dredging, waste-water treatment plants, and local legal frameworks, Dhaka is beginning to reclaim its riverbank heritage. Here is the scientific progress of the restoration.',
  'An investigative report on the scientific and community restoration efforts to clean the historic Buriganga River.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAembW9Jbj8ry5NCkOyBSV_OPP76wrruN_hRgBayufI1GfhwGzXN8NJBTjKiRJO87HO8Qm1iSwYWIy5Dq4RqbC4yXwMmMzB6jikzMm_h31P-j9dTz9GqoMtVIGceLzwVd6frOBWjI7yXCCAU0RbKHdn12l0RqW_jJbuml7wPlAPUhnagv4vgj5SeocutFZEe632JDbYlEpx3RVlbqhixkVwwDEB10rcLNCmQ2F4VzneJI0ZHMYjLTDqM5TkUbKF76Zk4i7hsMo8xxCI',
  2
)
ON CONFLICT DO NOTHING;

-- Seed Forum Categories
INSERT INTO forum_categories (id, name, description) VALUES 
(1, 'River Hydrology & Geomorphology', 'Technical discussions on river course shifts, flow rates, sedimentation, and 3D terrain modeling.'),
(2, 'History, Folklore & Culture', 'Exchanging oral narratives, river deities, Bhatiyali boat songs, and indigenous historical heritage.'),
(3, 'Delta Conservation & Advocacy', 'Coordinating local river cleanups, eco-restoration drives, and legal policies on water protection.')
ON CONFLICT DO NOTHING;

-- Seed Forum Topics and Replies
INSERT INTO forum_topics (id, category_id, title, author_id) VALUES 
(1, 1, 'Tista River Course Shifts: What the KML data shows', 2)
ON CONFLICT DO NOTHING;

INSERT INTO forum_replies (id, topic_id, author_id, content) VALUES 
(1, 1, 2, 'Looking closely at the Nilphamari district KML file, you can clearly see that the active channel of the Tista river has pushed eastward by approximately 450 meters over the last two decades. The old alluvial channels are now dry farmland during winter. Does anyone have discharge telemetry for Deonai or Charalkata rivers to cross-reference this?'),
(2, 1, 1, 'Fascinating observation! The dry season flow of Deonai has dropped to less than 45 m3/s, which matches your thesis. I will upload a secondary GeoJSON layer showing dry season contours next week so we can overlays it on the 3D terrain explorer!')
ON CONFLICT DO NOTHING;

-- Seed River Comments
INSERT INTO river_comments (river_id, user_id, comment) VALUES 
(1, 1, 'Fascinating dry-season telemetry on the Deonai channels. The volumetric contours drape perfectly over the northern terrain!'),
(1, 2, 'Agreed! The Charalkata sub-channels seem to have shifted considerably this season. This KML capture is incredibly timely.')
ON CONFLICT DO NOTHING;
