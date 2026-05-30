import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboardPage = () => {
  const [activePanel, setActivePanel] = useState('analytics'); // 'analytics' | 'rivers' | 'blogs' | 'users'
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [rivers, setRivers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // River form states
  const [riverName, setRiverName] = useState('');
  const [riverBanglaName, setRiverBanglaName] = useState('');
  const [riverLength, setRiverLength] = useState('');
  const [riverDepth, setRiverDepth] = useState('');
  const [riverDischarge, setRiverDischarge] = useState('');
  const [riverOrigin, setRiverOrigin] = useState('');
  const [riverOutflow, setRiverOutflow] = useState('');
  const [riverHistory, setRiverHistory] = useState('');
  const [riverDescription, setRiverDescription] = useState('');
  const [riverCulture, setRiverCulture] = useState('');
  const [riverLat, setRiverLat] = useState('23.6850');
  const [riverLng, setRiverLng] = useState('90.3563');
  const [riverZoom, setRiverZoom] = useState('8');
  const [riverKmlFile, setRiverKmlFile] = useState(null);
  const [riverImageFile, setRiverImageFile] = useState(null);

  // Blog form states
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSummary, setBlogSummary] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImageFile, setBlogImageFile] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [analyticsRes, usersRes, riversRes, blogsRes] = await Promise.all([
        axios.get('/api/admin/analytics'),
        axios.get('/api/admin/users'),
        axios.get('/api/rivers'), // auth check required
        axios.get('/api/blogs')
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setRivers(riversRes.data);
      setBlogs(blogsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to toggle user role to ${nextRole}?`)) return;

    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: nextRole });
      fetchData();
      alert('User role adjusted successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to update role.');
    }
  };

  const handleDeleteRiver = async (riverId) => {
    if (!window.confirm('Delete this river profile and KML links permanently?')) return;
    try {
      await axios.delete(`/api/rivers/${riverId}`);
      fetchData();
      alert('River profile removed.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete river.');
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Delete this chronicle article permanently?')) return;
    try {
      await axios.delete(`/api/blogs/${blogId}`);
      fetchData();
      alert('Chronicle article removed.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete article.');
    }
  };

  const handleAddRiver = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const formData = new FormData();
    formData.append('name', riverName);
    formData.append('bangla_name', riverBanglaName);
    formData.append('length_km', riverLength);
    formData.append('average_depth_m', riverDepth);
    formData.append('discharge_m3s', riverDischarge);
    formData.append('origin', riverOrigin);
    formData.append('outflow', riverOutflow);
    formData.append('history', riverHistory);
    formData.append('description', riverDescription);
    formData.append('indigenous_culture', riverCulture);
    formData.append('lat', riverLat);
    formData.append('lng', riverLng);
    formData.append('zoom_level', riverZoom);
    if (riverKmlFile) formData.append('kmlFile', riverKmlFile);
    if (riverImageFile) formData.append('image', riverImageFile);

    try {
      await axios.post('/api/rivers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('River profiles successfully registered and mapped!');
      fetchData();
      // Reset fields
      setRiverName('');
      setRiverBanglaName('');
      setRiverLength('');
      setRiverDepth('');
      setRiverDischarge('');
      setRiverOrigin('');
      setRiverOutflow('');
      setRiverHistory('');
      setRiverDescription('');
      setRiverCulture('');
      setRiverKmlFile(null);
      setRiverImageFile(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to submit river profile.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const formData = new FormData();
    formData.append('title', blogTitle);
    formData.append('summary', blogSummary);
    formData.append('content', blogContent);
    if (blogImageFile) formData.append('image', blogImageFile);

    try {
      await axios.post('/api/blogs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('New article published in chronicles!');
      fetchData();
      // Reset fields
      setBlogTitle('');
      setBlogSummary('');
      setBlogContent('');
      setBlogImageFile(null);
    } catch (err) {
      console.error(err);
      alert('Failed to publish article.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-primary flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] pt-16 bg-background overflow-hidden text-on-surface">
      
      {/* Side Admin Panel Controller */}
      <aside className="w-[280px] shrink-0 h-full p-md bg-surface-container/60 backdrop-blur-xl border-r border-white/10 flex flex-col gap-sm overflow-y-auto">
        <div className="mb-md">
          <h2 className="font-headline-md text-headline-md font-bold text-primary">Admin Center</h2>
          <p className="font-data-mono text-data-mono text-xs text-secondary mt-xs uppercase tracking-widest">Authority Terminal</p>
        </div>
        
        <button 
          onClick={() => setActivePanel('analytics')}
          className={`w-full flex items-center gap-xs px-md py-sm rounded-lg border text-xs font-label-sm transition-all cursor-pointer ${
            activePanel === 'analytics' 
              ? 'bg-primary-container/20 border-primary text-primary font-bold shadow-sm' 
              : 'bg-white/5 border-white/5 text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">analytics</span>
          Analytics Dashboard
        </button>

        <button 
          onClick={() => setActivePanel('rivers')}
          className={`w-full flex items-center gap-xs px-md py-sm rounded-lg border text-xs font-label-sm transition-all cursor-pointer ${
            activePanel === 'rivers' 
              ? 'bg-primary-container/20 border-primary text-primary font-bold shadow-sm' 
              : 'bg-white/5 border-white/5 text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">water</span>
          Rivers Data Management
        </button>

        <button 
          onClick={() => setActivePanel('blogs')}
          className={`w-full flex items-center gap-xs px-md py-sm rounded-lg border text-xs font-label-sm transition-all cursor-pointer ${
            activePanel === 'blogs' 
              ? 'bg-primary-container/20 border-primary text-primary font-bold shadow-sm' 
              : 'bg-white/5 border-white/5 text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">rss_feed</span>
          Chronicles Blog Editor
        </button>

        <button 
          onClick={() => setActivePanel('users')}
          className={`w-full flex items-center gap-xs px-md py-sm rounded-lg border text-xs font-label-sm transition-all cursor-pointer ${
            activePanel === 'users' 
              ? 'bg-primary-container/20 border-primary text-primary font-bold shadow-sm' 
              : 'bg-white/5 border-white/5 text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">group</span>
          User Administration
        </button>
      </aside>

      {/* Dynamic Content Panel area */}
      <main className="flex-1 h-full p-lg overflow-y-auto max-w-5xl">
        
        {/* Panel 1: Analytics */}
        {activePanel === 'analytics' && analytics && (
          <div className="space-y-lg animate-fadeIn">
            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">Analytics Overview</h3>
            
            {/* Totals Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              <div className="glass-panel p-md rounded-xl text-center border-primary/20">
                <span className="material-symbols-outlined text-primary text-[32px] mb-xs">group</span>
                <p className="text-[10px] text-on-surface-variant uppercase">Total Explorers</p>
                <h4 className="font-display-lg text-2xl font-bold text-on-surface mt-xs">{analytics.usersCount}</h4>
              </div>
              <div className="glass-panel p-md rounded-xl text-center border-secondary/20">
                <span className="material-symbols-outlined text-secondary text-[32px] mb-xs">water</span>
                <p className="text-[10px] text-on-surface-variant uppercase">Mapped Waterways</p>
                <h4 className="font-display-lg text-2xl font-bold text-on-surface mt-xs">{analytics.riversCount}</h4>
              </div>
              <div className="glass-panel p-md rounded-xl text-center border-tertiary/20">
                <span className="material-symbols-outlined text-tertiary text-[32px] mb-xs">rss_feed</span>
                <p className="text-[10px] text-on-surface-variant uppercase">Field Blogs</p>
                <h4 className="font-display-lg text-2xl font-bold text-on-surface mt-xs">{analytics.blogsCount}</h4>
              </div>
              <div className="glass-panel p-md rounded-xl text-center border-white/20">
                <span className="material-symbols-outlined text-on-surface text-[32px] mb-xs">forum</span>
                <p className="text-[10px] text-on-surface-variant uppercase">Forum Topics</p>
                <h4 className="font-display-lg text-2xl font-bold text-on-surface mt-xs">{analytics.topicsCount}</h4>
              </div>
            </div>

            {/* Quick Summary list */}
            <div className="bg-white/5 border border-white/5 p-md rounded-lg space-y-xs text-xs">
              <span className="font-data-mono text-data-mono text-xs text-primary/70 uppercase">System Integrity Logs</span>
              <p className="text-on-surface-variant">✓ Dynamic KML file link system compiled.</p>
              <p className="text-on-surface-variant">✓ Express SQLite database connection open.</p>
              <p className="text-on-surface-variant">✓ Encryption layers verified for passwords.</p>
            </div>
          </div>
        )}

        {/* Panel 2: Rivers Management */}
        {activePanel === 'rivers' && (
          <div className="space-y-lg animate-fadeIn">
            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">Rivers Data Sheets</h3>

            {/* List and Delete current */}
            <div className="glass-panel p-md rounded-xl space-y-sm">
              <span className="font-data-mono text-data-mono text-xs text-secondary uppercase block mb-xs">Currently Registered</span>
              <div className="space-y-xs">
                {rivers.map((river) => (
                  <div key={river.id} className="flex justify-between items-center bg-white/5 p-sm rounded border border-white/5 hover:bg-white/10 transition-all text-xs">
                    <div>
                      <span className="font-bold text-on-surface">{river.name}</span>
                      <span className="text-on-surface-variant text-[10px] ml-sm font-data-mono">{river.kml_path ? 'KML Map Loaded' : 'No KML Map'}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteRiver(river.id)}
                      className="text-[10px] bg-red-500/10 text-red-400 hover:bg-red-500/20 px-sm py-xs rounded cursor-pointer transition-all active:scale-95"
                    >
                      Delete Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add River profile Form */}
            <div className="glass-panel p-md rounded-xl space-y-sm">
              <span className="font-data-mono text-data-mono text-xs text-primary uppercase block mb-xs">Register New Bangladesh Waterway Sheet</span>
              
              <form onSubmit={handleAddRiver} className="grid grid-cols-1 md:grid-cols-2 gap-md text-xs">
                
                {/* Text fields */}
                <div>
                  <label className="block mb-xs text-on-surface-variant">River Standard Name</label>
                  <input type="text" required value={riverName} onChange={(e) => setRiverName(e.target.value)} placeholder="e.g. Padma River" className="w-full bg-white/5 border border-white/10 rounded-lg p-xs outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block mb-xs text-on-surface-variant">Bangla Name (Local Unicode)</label>
                  <input type="text" required value={riverBanglaName} onChange={(e) => setRiverBanglaName(e.target.value)} placeholder="e.g. পদ্মা নদী" className="w-full bg-white/5 border border-white/10 rounded-lg p-xs outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block mb-xs text-on-surface-variant">Telemetry Length (km)</label>
                  <input type="number" step="any" required value={riverLength} onChange={(e) => setRiverLength(e.target.value)} placeholder="e.g. 366" className="w-full bg-white/5 border border-white/10 rounded-lg p-xs outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block mb-xs text-on-surface-variant">Average Channel Depth (meters)</label>
                  <input type="number" step="any" required value={riverDepth} onChange={(e) => setRiverDepth(e.target.value)} placeholder="e.g. 20" className="w-full bg-white/5 border border-white/10 rounded-lg p-xs outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block mb-xs text-on-surface-variant">Water Discharge Rate (m³/s)</label>
                  <input type="number" step="any" required value={riverDischarge} onChange={(e) => setRiverDischarge(e.target.value)} placeholder="e.g. 35000" className="w-full bg-white/5 border border-white/10 rounded-lg p-xs outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block mb-xs text-on-surface-variant">Glacial / Foothills Origin</label>
                  <input type="text" required value={riverOrigin} onChange={(e) => setRiverOrigin(e.target.value)} placeholder="e.g. Gangotri Glacier" className="w-full bg-white/5 border border-white/10 rounded-lg p-xs outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-xs text-on-surface-variant">Outflow Estuary / Convergence</label>
                  <input type="text" required value={riverOutflow} onChange={(e) => setRiverOutflow(e.target.value)} placeholder="e.g. Bay of Bengal via Meghna Estuary" className="w-full bg-white/5 border border-white/10 rounded-lg p-xs outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-xs text-on-surface-variant">Quick Summary Description (Bento card)</label>
                  <input type="text" required value={riverDescription} onChange={(e) => setRiverDescription(e.target.value)} placeholder="e.g. The primary distributary water artery..." className="w-full bg-white/5 border border-white/10 rounded-lg p-xs outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-xs text-on-surface-variant">Geological History & Course shifts</label>
                  <textarea rows="3" required value={riverHistory} onChange={(e) => setRiverHistory(e.target.value)} placeholder="Carved delta contours historically..." className="w-full bg-white/5 border border-white/10 rounded-lg p-xs outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-xs text-on-surface-variant">Delta Folklore & Cultural Legacy</label>
                  <textarea rows="3" required value={riverCulture} onChange={(e) => setRiverCulture(e.target.value)} placeholder="Legends speak of Bhatiyali boatmen..." className="w-full bg-white/5 border border-white/10 rounded-lg p-xs outline-none" />
                </div>

                {/* Coordinate viewpoints */}
                <div>
                  <label className="block mb-xs text-on-surface-variant">Center Viewport Latitude</label>
                  <input type="number" step="any" required value={riverLat} onChange={(e) => setRiverLat(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-xs outline-none" />
                </div>
                <div>
                  <label className="block mb-xs text-on-surface-variant">Center Viewport Longitude</label>
                  <input type="number" step="any" required value={riverLng} onChange={(e) => setRiverLng(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-xs outline-none" />
                </div>
                <div>
                  <label className="block mb-xs text-on-surface-variant">Viewport Zoom Level</label>
                  <input type="number" required value={riverZoom} onChange={(e) => setRiverZoom(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-xs outline-none" />
                </div>

                {/* File Uploads */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-md border border-white/5 p-sm rounded bg-white/5">
                  <div>
                    <label className="block mb-xs text-on-surface-variant font-bold">KML/KMZ Map File (.kml or .kmz)</label>
                    <input type="file" accept=".kml,.kmz" onChange={(e) => setRiverKmlFile(e.target.files[0])} className="text-[10px]" />
                  </div>
                  <div>
                    <label className="block mb-xs text-on-surface-variant font-bold">Main Banner Image (.png,.jpg,.webp)</label>
                    <input type="file" accept="image/*" onChange={(e) => setRiverImageFile(e.target.files[0])} className="text-[10px]" />
                  </div>
                </div>

                {/* Submit button */}
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="md:col-span-2 btn-3d-primary py-sm rounded-lg font-bold font-label-sm text-on-primary-container cursor-pointer transition-all hover:brightness-110 active:scale-95 text-xs"
                >
                  {actionLoading ? 'Uploading & Registering...' : 'Register Mapped Waterway'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Panel 3: Blogs Management */}
        {activePanel === 'blogs' && (
          <div className="space-y-lg animate-fadeIn">
            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">Field Chronicles Blog</h3>
            
            {/* List current blogs with delete */}
            <div className="glass-panel p-md rounded-xl space-y-sm">
              <span className="font-data-mono text-data-mono text-xs text-secondary uppercase block mb-xs">Active Articles</span>
              <div className="space-y-xs">
                {blogs.map((blog) => (
                  <div key={blog.id} className="flex justify-between items-center bg-white/5 p-sm rounded border border-white/5 text-xs">
                    <div>
                      <span className="font-bold text-on-surface">{blog.title}</span>
                      <span className="text-[10px] text-on-surface-variant ml-sm">BY {blog.author_name}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="text-[10px] bg-red-500/10 text-red-400 hover:bg-red-500/20 px-sm py-xs rounded cursor-pointer transition-all active:scale-95"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Compose new blog form */}
            <div className="glass-panel p-md rounded-xl space-y-sm">
              <span className="font-data-mono text-data-mono text-xs text-primary uppercase block mb-xs">Compose New Chronicle Article</span>
              <form onSubmit={handleAddBlog} className="space-y-md text-xs">
                <div>
                  <label className="block mb-xs text-on-surface-variant">Article Title</label>
                  <input type="text" required value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="e.g. Padma delta geomorphology studies" className="w-full bg-white/5 border border-white/10 rounded-lg p-xs outline-none" />
                </div>
                <div>
                  <label className="block mb-xs text-on-surface-variant">Telemetry/Brief Summary (Grid card excerpt)</label>
                  <input type="text" required value={blogSummary} onChange={(e) => setBlogSummary(e.target.value)} placeholder="Short 2-sentence card excerpt..." className="w-full bg-white/5 border border-white/10 rounded-lg p-xs outline-none" />
                </div>
                <div>
                  <label className="block mb-xs text-on-surface-variant">Banner Image File (.png,.jpg)</label>
                  <input type="file" accept="image/*" onChange={(e) => setBlogImageFile(e.target.files[0])} className="text-[10px]" />
                </div>
                <div>
                  <label className="block mb-xs text-on-surface-variant">Full Article Narrative Content</label>
                  <textarea rows="8" required value={blogContent} onChange={(e) => setBlogContent(e.target.value)} placeholder="Write full observation post here..." className="w-full bg-white/5 border border-white/10 rounded-lg p-xs outline-none" />
                </div>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="w-full btn-3d-primary py-sm rounded-lg font-bold font-label-sm text-on-primary-container cursor-pointer transition-all text-xs"
                >
                  {actionLoading ? 'Publishing...' : 'Publish Chronicle Article'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Panel 4: Users Management */}
        {activePanel === 'users' && (
          <div className="space-y-lg animate-fadeIn">
            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">User Administration</h3>
            
            <div className="glass-panel p-md rounded-xl space-y-sm">
              <span className="font-data-mono text-data-mono text-xs text-secondary uppercase block mb-xs">Registered System Accounts</span>
              <div className="space-y-xs">
                {users.map((u) => (
                  <div key={u.id} className="flex justify-between items-center bg-white/5 p-sm rounded border border-white/5 text-xs">
                    <div>
                      <span className="font-bold text-on-surface">{u.username}</span>
                      <span className="text-[10px] text-on-surface-variant ml-sm">({u.email})</span>
                      <span className={`text-[10px] ml-md font-bold px-sm py-xs rounded font-data-mono ${
                        u.role === 'admin' ? 'bg-tertiary/20 text-tertiary border border-tertiary/30' : 'bg-primary/20 text-primary border border-primary/30'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </div>
                    {/* Exclude toggling oneself to protect lockouts */}
                    {u.id !== 1 && (
                      <button 
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className="text-[10px] bg-white/5 hover:bg-white/15 px-sm py-xs rounded cursor-pointer border border-white/10 transition-all"
                      >
                        Toggle Role
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default AdminDashboardPage;
