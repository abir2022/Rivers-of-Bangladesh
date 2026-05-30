import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import supabase, { MAPS_DIR, IMAGES_DIR } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'bangladesh_rivers_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static serving for local uploads (using /tmp fallback directory)
app.use('/uploads', express.static('/tmp/uploads'));

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
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  try {
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ username, email, password: hashedPassword, role: 'user' }])
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') { // PostgreSQL unique violation code
        return res.status(400).json({ error: 'Username or email already exists.' });
      }
      return res.status(500).json({ error: insertError.message });
    }

    const tokenUser = { id: newUser.id, username: newUser.username, email: newUser.email, role: 'user' };
    const token = jwt.sign(tokenUser, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: tokenUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const { data: user, error: selectError } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
      .maybeSingle();

    if (selectError) return res.status(500).json({ error: 'Database select error.' });
    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials.' });

    const tokenUser = { id: user.id, username: user.username, email: user.email, role: user.role };
    const token = jwt.sign(tokenUser, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: tokenUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// 2. RIVERS ROUTES
app.get('/api/rivers', authenticateToken, async (req, res) => {
  try {
    const { data: rows, error } = await supabase.from('rivers').select('*').order('id', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rivers/:id', authenticateToken, async (req, res) => {
  try {
    const { data: row, error } = await supabase.from('rivers').select('*').eq('id', req.params.id).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!row) return res.status(404).json({ error: 'River not found.' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN ONLY - Create River
app.post('/api/rivers', requireAdmin, upload.fields([
  { name: 'kmlFile', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
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

  const gallery_images = image_path ? [image_path] : [];

  try {
    const { data: newRiver, error } = await supabase
      .from('rivers')
      .insert([{
        name,
        bangla_name,
        length_km: parseFloat(length_km) || 0,
        average_depth_m: parseFloat(average_depth_m) || 0,
        discharge_m3s: parseFloat(discharge_m3s) || 0,
        origin,
        outflow,
        history,
        description,
        indigenous_culture,
        kml_path,
        image_path,
        gallery_images,
        lat: parseFloat(lat) || 23.6850,
        lng: parseFloat(lng) || 90.3563,
        zoom_level: parseFloat(zoom_level) || 8.0
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ id: newRiver.id, message: 'River added successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN ONLY - Delete River
app.delete('/api/rivers/:id', requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('rivers').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'River deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET comments for a river
app.get('/api/rivers/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('river_comments')
      .select('*, users (username)')
      .eq('river_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    
    // Format to flat structures to match client expectations
    const formatted = (rows || []).map(row => ({
      id: row.id,
      river_id: row.river_id,
      user_id: row.user_id,
      comment: row.comment,
      created_at: row.created_at,
      username: row.users?.username
    }));
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a comment for a river
app.post('/api/rivers/:id/comments', authenticateToken, async (req, res) => {
  const { comment } = req.body;
  if (!comment) return res.status(400).json({ error: 'Comment content cannot be empty.' });

  try {
    const { data: newComment, error } = await supabase
      .from('river_comments')
      .insert([{
        river_id: parseInt(req.params.id),
        user_id: req.user.id,
        comment
      }])
      .select('*, users (username)')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    
    res.status(201).json({
      id: newComment.id,
      river_id: newComment.river_id,
      user_id: newComment.user_id,
      comment: newComment.comment,
      username: newComment.users?.username,
      created_at: newComment.created_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. BLOGS ROUTES
app.get('/api/blogs', async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('blogs')
      .select('*, users (username)')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    const formatted = (rows || []).map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      summary: row.summary,
      image_path: row.image_path,
      author_id: row.author_id,
      created_at: row.created_at,
      author_name: row.users?.username
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/blogs/:id', async (req, res) => {
  try {
    const { data: blog, error: blogError } = await supabase
      .from('blogs')
      .select('*, users (username)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (blogError) return res.status(500).json({ error: blogError.message });
    if (!blog) return res.status(404).json({ error: 'Blog post not found.' });

    const { data: comments, error: commentError } = await supabase
      .from('blog_comments')
      .select('*, users (username)')
      .eq('blog_id', req.params.id)
      .order('created_at', { ascending: true });

    if (commentError) return res.status(500).json({ error: commentError.message });

    res.json({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      summary: blog.summary,
      image_path: blog.image_path,
      author_id: blog.author_id,
      created_at: blog.created_at,
      author_name: blog.users?.username,
      comments: (comments || []).map(c => ({
        id: c.id,
        blog_id: c.blog_id,
        user_id: c.user_id,
        comment: c.comment,
        created_at: c.created_at,
        username: c.users?.username
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment to blog
app.post('/api/blogs/:id/comment', authenticateToken, async (req, res) => {
  const { comment } = req.body;
  if (!comment) return res.status(400).json({ error: 'Comment content cannot be empty.' });

  try {
    const { data: newComm, error } = await supabase
      .from('blog_comments')
      .insert([{
        blog_id: parseInt(req.params.id),
        user_id: req.user.id,
        comment
      }])
      .select('*, users (username)')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    
    res.status(201).json({
      id: newComm.id,
      blog_id: newComm.blog_id,
      user_id: newComm.user_id,
      comment: newComm.comment,
      username: newComm.users?.username,
      created_at: newComm.created_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN ONLY - Add Blog
app.post('/api/blogs', requireAdmin, upload.single('image'), async (req, res) => {
  const { title, content, summary } = req.body;
  let image_path = '';
  if (req.file) {
    image_path = `/uploads/images/${req.file.filename}`;
  }

  try {
    const { data: newBlog, error } = await supabase
      .from('blogs')
      .insert([{
        title,
        content,
        summary,
        image_path,
        author_id: req.user.id
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ id: newBlog.id, message: 'Blog post created successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN ONLY - Delete Blog
app.delete('/api/blogs/:id', requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('blogs').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Blog deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. FORUM ROUTES
app.get('/api/forum/categories', authenticateToken, async (req, res) => {
  try {
    const { data: rows, error } = await supabase.from('forum_categories').select('*').order('id', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/forum/categories/:id/topics', authenticateToken, async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('forum_topics')
      .select('*, users (username), forum_replies (id)')
      .eq('category_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    const formatted = (rows || []).map(row => ({
      id: row.id,
      category_id: row.category_id,
      title: row.title,
      author_id: row.author_id,
      created_at: row.created_at,
      author_name: row.users?.username,
      reply_count: row.forum_replies?.length || 0
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/forum/topics/:id', authenticateToken, async (req, res) => {
  try {
    const { data: topic, error: topicError } = await supabase
      .from('forum_topics')
      .select('*, users (username)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (topicError) return res.status(500).json({ error: topicError.message });
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });

    const { data: replies, error: repliesError } = await supabase
      .from('forum_replies')
      .select('*, users (username, role)')
      .eq('topic_id', req.params.id)
      .order('created_at', { ascending: true });

    if (repliesError) return res.status(500).json({ error: repliesError.message });

    res.json({
      topic: {
        id: topic.id,
        category_id: topic.category_id,
        title: topic.title,
        author_id: topic.author_id,
        created_at: topic.created_at,
        author_name: topic.users?.username
      },
      replies: (replies || []).map(r => ({
        id: r.id,
        topic_id: r.topic_id,
        author_id: r.author_id,
        content: r.content,
        created_at: r.created_at,
        author_name: r.users?.username,
        author_role: r.users?.role
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Forum Topic
app.post('/api/forum/categories/:id/topics', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  try {
    // 1. Create Topic
    const { data: newTopic, error: topicError } = await supabase
      .from('forum_topics')
      .insert([{
        category_id: parseInt(req.params.id),
        title,
        author_id: req.user.id
      }])
      .select()
      .single();
    
    if (topicError) return res.status(500).json({ error: topicError.message });

    // 2. Add first reply containing topic content
    const { error: replyError } = await supabase
      .from('forum_replies')
      .insert([{
        topic_id: newTopic.id,
        author_id: req.user.id,
        content
      }]);
    
    if (replyError) return res.status(500).json({ error: replyError.message });

    res.status(201).json({ topicId: newTopic.id, message: 'Topic created successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reply to Topic
app.post('/api/forum/topics/:id/replies', authenticateToken, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Reply content cannot be empty.' });

  try {
    const { data: newReply, error } = await supabase
      .from('forum_replies')
      .insert([{
        topic_id: parseInt(req.params.id),
        author_id: req.user.id,
        content
      }])
      .select('*, users (username, role)')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    
    res.status(201).json({
      id: newReply.id,
      topic_id: newReply.topic_id,
      author_id: newReply.author_id,
      content: newReply.content,
      author_name: newReply.users?.username,
      author_role: newReply.users?.role,
      created_at: newReply.created_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. ADMIN ANALYTICS ROUTES
app.get('/api/admin/analytics', requireAdmin, async (req, res) => {
  try {
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: riversCount } = await supabase.from('rivers').select('*', { count: 'exact', head: true });
    const { count: blogsCount } = await supabase.from('blogs').select('*', { count: 'exact', head: true });
    const { count: topicsCount } = await supabase.from('forum_topics').select('*', { count: 'exact', head: true });
    
    res.json({
      usersCount: usersCount || 0,
      riversCount: riversCount || 0,
      blogsCount: blogsCount || 0,
      topicsCount: topicsCount || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN ONLY - Get user list
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('users')
      .select('id, username, email, role, created_at')
      .order('id', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN ONLY - Toggle user role
app.put('/api/admin/users/:id/role', requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (role !== 'admin' && role !== 'user') return res.status(400).json({ error: 'Invalid role.' });

  try {
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'User role updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong on the server!' });
});

// Start Server (only in local dev, not in Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✓ Server running at http://localhost:${PORT}`);
  });
}

export default app;
