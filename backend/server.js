import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db, { MAPS_DIR, IMAGES_DIR } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'bangladesh_rivers_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static serving for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Access denied. Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
    next();
  });
};

// --- FILE UPLOADS SETUP ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'kmlFile') {
      cb(null, MAPS_DIR);
    } else {
      cb(null, IMAGES_DIR);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /kml|kmz|png|jpg|jpeg|webp/i;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Supported formats: .kml, .kmz, .png, .jpg, .jpeg, .webp'));
  }
});

// --- API ENDPOINTS ---

// 1. AUTH ROUTES
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  db.run(
    "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'user')",
    [username, email, hashedPassword],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username or email already exists.' });
        }
        return res.status(500).json({ error: 'Database error occurred.' });
      }
      
      const user = { id: this.lastID, username, email, role: 'user' };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ token, user });
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  const { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  db.get(
    "SELECT * FROM users WHERE email = ? OR username = ?",
    [emailOrUsername, emailOrUsername],
    (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error.' });
      if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials.' });

      const tokenUser = { id: user.id, username: user.username, email: user.email, role: user.role };
      const token = jwt.sign(tokenUser, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: tokenUser });
    }
  );
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// 2. RIVERS ROUTES (AUTH-LOCKED per user requirements)
app.get('/api/rivers', authenticateToken, (req, res) => {
  db.all("SELECT * FROM rivers", (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json(rows);
  });
});

app.get('/api/rivers/:id', authenticateToken, (req, res) => {
  db.get("SELECT * FROM rivers WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (!row) return res.status(404).json({ error: 'River not found.' });
    res.json(row);
  });
});

// ADMIN ONLY - Create River
app.post('/api/rivers', requireAdmin, upload.fields([
  { name: 'kmlFile', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), (req, res) => {
  const { name, bangla_name, length_km, average_depth_m, discharge_m3s, origin, outflow, history, description, indigenous_culture, lat, lng, zoom_level } = req.body;
  
  let kml_path = '';
  let image_path = '';

  if (req.files) {
    if (req.files.kmlFile) {
      kml_path = `/uploads/maps/${req.files.kmlFile[0].filename}`;
    }
    if (req.files.image) {
      image_path = `/uploads/images/${req.files.image[0].filename}`;
    }
  }

  const gallery_images = JSON.stringify(image_path ? [image_path] : []);

  db.run(`INSERT INTO rivers (name, bangla_name, length_km, average_depth_m, discharge_m3s, origin, outflow, history, description, indigenous_culture, kml_path, image_path, gallery_images, lat, lng, zoom_level) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, bangla_name, parseFloat(length_km) || 0, parseFloat(average_depth_m) || 0, parseFloat(discharge_m3s) || 0, origin, outflow, history, description, indigenous_culture, kml_path, image_path, gallery_images, parseFloat(lat) || 23.6850, parseFloat(lng) || 90.3563, parseFloat(zoom_level) || 8.0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: 'River added successfully.' });
    }
  );
});

// ADMIN ONLY - Delete River
app.delete('/api/rivers/:id', requireAdmin, (req, res) => {
  db.run("DELETE FROM rivers WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json({ message: 'River deleted successfully.' });
  });
});

// GET comments for a river (Auth locked)
app.get('/api/rivers/:id/comments', authenticateToken, (req, res) => {
  db.all(`SELECT river_comments.*, users.username FROM river_comments 
          JOIN users ON river_comments.user_id = users.id 
          WHERE river_comments.river_id = ? 
          ORDER BY river_comments.created_at DESC`, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error fetching river comments.' });
    res.json(rows);
  });
});

// POST a comment for a river (Auth locked)
app.post('/api/rivers/:id/comments', authenticateToken, (req, res) => {
  const { comment } = req.body;
  if (!comment) return res.status(400).json({ error: 'Comment content cannot be empty.' });

  db.run("INSERT INTO river_comments (river_id, user_id, comment) VALUES (?, ?, ?)",
    [req.params.id, req.user.id, comment],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error adding river comment.' });
      
      db.get("SELECT username FROM users WHERE id = ?", [req.user.id], (err, u) => {
        res.status(201).json({
          id: this.lastID,
          river_id: parseInt(req.params.id),
          user_id: req.user.id,
          comment,
          username: u.username,
          created_at: new Date().toISOString()
        });
      });
    }
  );
});


// 3. BLOGS ROUTES (PUBLIC VIEWING, AUTH-LOCKED COMMENTING/REACTION)
app.get('/api/blogs', (req, res) => {
  db.all(`SELECT blogs.*, users.username as author_name FROM blogs 
          JOIN users ON blogs.author_id = users.id 
          ORDER BY blogs.created_at DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json(rows);
  });
});

app.get('/api/blogs/:id', (req, res) => {
  db.get(`SELECT blogs.*, users.username as author_name FROM blogs 
          JOIN users ON blogs.author_id = users.id 
          WHERE blogs.id = ?`, [req.params.id], (err, blog) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (!blog) return res.status(404).json({ error: 'Blog post not found.' });

    // Load comments
    db.all(`SELECT blog_comments.*, users.username FROM blog_comments 
            JOIN users ON blog_comments.user_id = users.id 
            WHERE blog_comments.blog_id = ? 
            ORDER BY blog_comments.created_at ASC`, [req.params.id], (err, comments) => {
      if (err) return res.status(500).json({ error: 'Database error fetching comments.' });
      res.json({ ...blog, comments });
    });
  });
});

// Add comment (Auth locked)
app.post('/api/blogs/:id/comment', authenticateToken, (req, res) => {
  const { comment } = req.body;
  if (!comment) return res.status(400).json({ error: 'Comment content cannot be empty.' });

  db.run("INSERT INTO blog_comments (blog_id, user_id, comment) VALUES (?, ?, ?)",
    [req.params.id, req.user.id, comment],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error.' });
      
      // Fetch user username to return detailed comment
      db.get("SELECT username FROM users WHERE id = ?", [req.user.id], (err, u) => {
        res.status(201).json({
          id: this.lastID,
          blog_id: parseInt(req.params.id),
          user_id: req.user.id,
          comment,
          username: u.username,
          created_at: new Date().toISOString()
        });
      });
    }
  );
});

// ADMIN ONLY - Add Blog
app.post('/api/blogs', requireAdmin, upload.single('image'), (req, res) => {
  const { title, content, summary } = req.body;
  let image_path = '';
  if (req.file) {
    image_path = `/uploads/images/${req.file.filename}`;
  }

  db.run("INSERT INTO blogs (title, content, summary, image_path, author_id) VALUES (?, ?, ?, ?, ?)",
    [title, content, summary, image_path, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: 'Blog post created successfully.' });
    }
  );
});

// ADMIN ONLY - Delete Blog
app.delete('/api/blogs/:id', requireAdmin, (req, res) => {
  db.run("DELETE FROM blogs WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json({ message: 'Blog deleted successfully.' });
  });
});


// 4. FORUM ROUTES (AUTH-LOCKED)
app.get('/api/forum/categories', authenticateToken, (req, res) => {
  db.all("SELECT * FROM forum_categories", (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json(rows);
  });
});

app.get('/api/forum/categories/:id/topics', authenticateToken, (req, res) => {
  db.all(`SELECT forum_topics.*, users.username as author_name, 
          (SELECT COUNT(*) FROM forum_replies WHERE forum_replies.topic_id = forum_topics.id) as reply_count 
          FROM forum_topics 
          JOIN users ON forum_topics.author_id = users.id 
          WHERE forum_topics.category_id = ? 
          ORDER BY forum_topics.created_at DESC`, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json(rows);
  });
});

app.get('/api/forum/topics/:id', authenticateToken, (req, res) => {
  db.get(`SELECT forum_topics.*, users.username as author_name FROM forum_topics 
          JOIN users ON forum_topics.author_id = users.id 
          WHERE forum_topics.id = ?`, [req.params.id], (err, topic) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });

    db.all(`SELECT forum_replies.*, users.username as author_name, users.role as author_role FROM forum_replies 
            JOIN users ON forum_replies.author_id = users.id 
            WHERE forum_replies.topic_id = ? 
            ORDER BY forum_replies.created_at ASC`, [req.params.id], (err, replies) => {
      if (err) return res.status(500).json({ error: 'Database error.' });
      res.json({ topic, replies });
    });
  });
});

// Create Topic
app.post('/api/forum/categories/:id/topics', authenticateToken, (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  db.serialize(() => {
    db.run("INSERT INTO forum_topics (category_id, title, author_id) VALUES (?, ?, ?)",
      [req.params.id, title, req.user.id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Database error.' });
        const topicId = this.lastID;

        db.run("INSERT INTO forum_replies (topic_id, author_id, content) VALUES (?, ?, ?)",
          [topicId, req.user.id, content],
          (err) => {
            if (err) return res.status(500).json({ error: 'Database error posting content.' });
            res.status(201).json({ topicId, message: 'Topic created successfully.' });
          }
        );
      }
    );
  });
});

// Reply to Topic
app.post('/api/forum/topics/:id/replies', authenticateToken, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Reply content cannot be empty.' });

  db.run("INSERT INTO forum_replies (topic_id, author_id, content) VALUES (?, ?, ?)",
    [req.params.id, req.user.id, content],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error.' });
      
      db.get("SELECT username, role FROM users WHERE id = ?", [req.user.id], (err, u) => {
        res.status(201).json({
          id: this.lastID,
          topic_id: parseInt(req.params.id),
          author_id: req.user.id,
          content,
          author_name: u.username,
          author_role: u.role,
          created_at: new Date().toISOString()
        });
      });
    }
  );
});

// 5. ADMIN ANALYTICS ROUTES
app.get('/api/admin/analytics', requireAdmin, (req, res) => {
  const stats = {};
  
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    stats.usersCount = row.count;
    
    db.get("SELECT COUNT(*) as count FROM rivers", (err, row) => {
      stats.riversCount = row.count;
      
      db.get("SELECT COUNT(*) as count FROM blogs", (err, row) => {
        stats.blogsCount = row.count;
        
        db.get("SELECT COUNT(*) as count FROM forum_topics", (err, row) => {
          stats.topicsCount = row.count;
          
          res.json(stats);
        });
      });
    });
  });
});

// ADMIN ONLY - Get user list
app.get('/api/admin/users', requireAdmin, (req, res) => {
  db.all("SELECT id, username, email, role, created_at FROM users", (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json(rows);
  });
});

// ADMIN ONLY - Toggle user role
app.put('/api/admin/users/:id/role', requireAdmin, (req, res) => {
  const { role } = req.body;
  if (role !== 'admin' && role !== 'user') return res.status(400).json({ error: 'Invalid role.' });

  db.run("UPDATE users SET role = ? WHERE id = ?", [role, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json({ message: 'User role updated successfully.' });
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong on the server!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✓ Server running at http://localhost:${PORT}`);
});
