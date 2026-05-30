import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const BlogPage = () => {
  const { user, token } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [likes, setLikes] = useState({});

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axiosInstance.get('/api/blogs');
        setBlogs(response.data);
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const handleOpenBlog = async (blog) => {
    setSelectedBlog(blog);
    setModalLoading(true);
    try {
      const response = await axiosInstance.get(`/api/blogs/${blog.id}`);
      setSelectedBlog(response.data);
      setComments(response.data.comments || []);
    } catch (err) {
      console.error('Error fetching blog details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const response = await axiosInstance.post(`/api/blogs/${selectedBlog.id}/comment`, { comment: newComment });
      setComments(prev => [...prev, response.data]);
      setNewComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
      alert('Failed to post comment. Ensure you are signed in.');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleLike = (blogId) => {
    if (!user) {
      alert('You must be logged in to react to articles!');
      return;
    }
    setLikes(prev => ({
      ...prev,
      [blogId]: (prev[blogId] || 0) + 1
    }));
  };

  const handleShare = (blogTitle) => {
    if (!user) {
      alert('You must be logged in to share articles!');
      return;
    }
    alert(`Dataset reference for "${blogTitle}" copied to clipboard! Shared to community logs.`);
  };

  return (
    <div className="pt-16 min-h-screen bg-background px-margin-mobile md:px-margin-desktop pb-xl">
      
      {/* Blog header section */}
      <section className="text-center py-xl max-w-2xl mx-auto space-y-xs reveal-on-scroll">
        <h1 className="font-display-lg text-display-lg font-bold text-on-surface">Community Chronicles</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Field notes, scientific breakthroughs, and chronicles from the riverbanks of Bangladesh.
        </p>
      </section>

      {/* Grid of Blog Story Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="glass-panel p-lg rounded-xl text-center text-on-surface-variant max-w-md mx-auto py-xl border border-dashed border-white/10">
          No chronicles recorded yet. Admin updates pending.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter max-w-6xl mx-auto">
          {blogs.map((blog, idx) => (
            <div 
              key={blog.id} 
              className="glass-panel rounded-xl overflow-hidden group flex flex-col hover:border-primary/30 cursor-pointer"
              onClick={() => handleOpenBlog(blog)}
            >
              {/* Card Thumbnail */}
              <div className="h-48 overflow-hidden relative border-b border-white/5 bg-[#060e20]">
                <img 
                  src={blog.image_path || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmiCVWdug8uIukVkIDLIwkFbaae6Q10cbLulbV9De957tc4grokIMvIkukdWpwunXAVt1WSuZoNXqpig9XZzXX2r_ekVhsSHTd98mIFGvOIOpvf3N0R3rI1nooLspej2eFFxhV7rUYSVU339kK599osf3gUXucbHmyDOUS5gZzvr2G2Ys9eug6qVeQU03hr5p_sjsoa33uflo-8Z3_76RXDk-IcnDKhrsPbDxqu6F6kE7WrWWZbSCCziuXZBh3h1kqRQlWRhyByX14'} 
                  alt={blog.title} 
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute top-xs left-xs z-10">
                  <span className="font-data-mono text-data-mono text-[9px] uppercase tracking-wider bg-[#060e20]/80 backdrop-blur px-sm py-xs rounded border border-white/10 text-tertiary">
                    {idx === 0 ? 'Expert Post' : idx === 1 ? 'New Telemetry' : 'Folklore'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-md flex flex-col flex-1 space-y-sm">
                <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-data-mono">
                  <span>BY {blog.author_name.toUpperCase()}</span>
                  <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-headline-md text-md leading-snug font-bold text-on-surface group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
                <p className="text-xs text-on-surface-variant line-clamp-3">
                  {blog.summary}
                </p>
                
                {/* View Details action */}
                <div className="pt-sm mt-auto border-t border-white/5 flex items-center justify-between">
                  <span className="text-primary text-[11px] font-bold uppercase tracking-wider flex items-center gap-xs">
                    Read Full Note
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                  <div className="flex gap-sm text-[11px] text-on-surface-variant font-data-mono">
                    <span className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px] text-secondary">thumb_up</span>
                      {likes[blog.id] || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Blog Modal (View Modal) */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 bg-[#060e20]/80 backdrop-blur-md flex justify-center items-center p-sm overflow-y-auto">
          <div className="bg-surface-container border border-white/10 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl glass-panel no-tilt">
            
            {/* Modal Header banner */}
            <div className="h-56 relative w-full overflow-hidden border-b border-white/10 bg-[#060e20]">
              <img 
                src={selectedBlog.image_path || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmiCVWdug8uIukVkIDLIwkFbaae6Q10cbLulbV9De957tc4grokIMvIkukdWpwunXAVt1WSuZoNXqpig9XZzXX2r_ekVhsSHTd98mIFGvOIOpvf3N0R3rI1nooLspej2eFFxhV7rUYSVU339kK599osf3gUXucbHmyDOUS5gZzvr2G2Ys9eug6qVeQU03hr5p_sjsoa33uflo-8Z3_76RXDk-IcnDKhrsPbDxqu6F6kE7WrWWZbSCCziuXZBh3h1kqRQlWRhyByX14'} 
                alt={selectedBlog.title} 
                className="w-full h-full object-cover brightness-[0.5]"
              />
              <button 
                onClick={() => setSelectedBlog(null)}
                className="absolute top-md right-md bg-[#060e20]/80 hover:bg-white/10 p-sm rounded-full cursor-pointer text-on-surface border border-white/10 transition-all active:scale-90"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              <div className="absolute bottom-md left-md">
                <span className="font-data-mono text-data-mono text-[9px] bg-primary/20 backdrop-blur-md border border-primary/30 text-primary px-sm py-xs rounded-full uppercase">
                  Chronicle Detailed View
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-md space-y-md">
              <div className="flex justify-between items-center text-xs text-on-surface-variant font-data-mono border-b border-white/5 pb-sm">
                <span>AUTHOR: {selectedBlog.author_name?.toUpperCase()}</span>
                <span>FILED ON: {new Date(selectedBlog.created_at).toLocaleDateString()}</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface leading-tight">
                {selectedBlog.title}
              </h2>
              <div className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-line border-b border-white/5 pb-md">
                {selectedBlog.content}
              </div>

              {/* Social Interactions (Likes & Shares - Auth check inside callback) */}
              <div className="flex gap-md py-xs border-b border-white/5">
                <button 
                  onClick={() => handleLike(selectedBlog.id)}
                  className="flex items-center gap-xs text-xs font-label-sm px-md py-sm bg-white/5 hover:bg-secondary-container/20 hover:text-secondary border border-white/5 rounded-lg cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                  Like Observation ({likes[selectedBlog.id] || 0})
                </button>
                <button 
                  onClick={() => handleShare(selectedBlog.title)}
                  className="flex items-center gap-xs text-xs font-label-sm px-md py-sm bg-white/5 hover:bg-primary-container/20 hover:text-primary border border-white/5 rounded-lg cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">share</span>
                  Share Dataset Reference
                </button>
              </div>

              {/* Observation Dialogue Comments Section */}
              <div className="space-y-sm">
                <h4 className="font-headline-md text-sm font-bold text-primary flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">forum</span>
                  Scientific Dialogue Logs ({comments.length})
                </h4>

                {/* Loading state inside modal */}
                {modalLoading ? (
                  <div className="py-sm text-center text-xs animate-pulse text-on-surface-variant">Syncing logs...</div>
                ) : (
                  <div className="space-y-xs max-h-48 overflow-y-auto pr-xs">
                    {comments.map((comm) => (
                      <div key={comm.id} className="bg-white/5 p-sm rounded-lg border border-white/5">
                        <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-data-mono mb-xs">
                          <span className="font-bold text-on-surface">{comm.username}</span>
                          <span>{new Date(comm.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant">{comm.comment}</p>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <div className="text-center text-xs text-on-surface-variant italic py-sm">No comments filed yet.</div>
                    )}
                  </div>
                )}

                {/* Comment input form - locked by auth */}
                {token ? (
                  <form onSubmit={handlePostComment} className="flex gap-sm border-t border-white/5 pt-sm">
                    <input 
                      type="text"
                      required
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add observation log details..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-sm py-xs text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    />
                    <button 
                      type="submit"
                      disabled={commentLoading}
                      className="btn-3d px-md rounded-lg font-label-sm text-xs text-on-primary font-bold cursor-pointer transition-all flex items-center"
                    >
                      {commentLoading ? '...' : 'Post'}
                    </button>
                  </form>
                ) : (
                  <div className="bg-primary/5 border border-primary/20 p-sm rounded-lg text-center mt-sm">
                    <p className="text-xs text-primary">
                      Only registered explorers can comment, like or share. 
                      <Link to="/login" className="font-bold underline ml-xs text-secondary hover:text-secondary-dim">
                        Sign in to participate
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default BlogPage;
