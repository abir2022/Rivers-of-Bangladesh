import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const ForumPage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [topics, setTopics] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicDetailLoading, setTopicDetailLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  
  const [showCreateTopic, setShowCreateTopic] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/forum/categories');
        setCategories(response.data);
        if (response.data.length > 0) {
          setActiveCategory(response.data[0]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch topics when active category shifts
  useEffect(() => {
    if (!activeCategory) return;
    const fetchTopics = async () => {
      setTopicsLoading(true);
      try {
        const response = await axios.get(`/api/forum/categories/${activeCategory.id}/topics`);
        setTopics(response.data);
      } catch (err) {
        console.error('Error fetching topics:', err);
      } finally {
        setTopicsLoading(false);
      }
    };
    fetchTopics();
    setShowCreateTopic(false);
  }, [activeCategory]);

  const handleOpenTopic = async (topic) => {
    setActiveTopic(topic);
    setTopicDetailLoading(true);
    try {
      const response = await axios.get(`/api/forum/topics/${topic.id}`);
      setActiveTopic(response.data.topic);
      setReplies(response.data.replies || []);
    } catch (err) {
      console.error('Error fetching topic replies:', err);
    } finally {
      setTopicDetailLoading(false);
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    setPostLoading(true);
    try {
      const response = await axios.post(`/api/forum/topics/${activeTopic.id}/replies`, { content: newReply });
      setReplies(prev => [...prev, response.data]);
      setNewReply('');
      
      // Update local topics reply count
      setTopics(prev => prev.map(t => t.id === activeTopic.id ? { ...t, reply_count: t.reply_count + 1 } : t));
    } catch (err) {
      console.error('Error posting reply:', err);
      alert('Failed to post reply.');
    } finally {
      setPostLoading(false);
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return;

    setPostLoading(true);
    try {
      await axios.post(`/api/forum/categories/${activeCategory.id}/topics`, {
        title: newTopicTitle,
        content: newTopicContent
      });
      // Refetch topics list
      const response = await axios.get(`/api/forum/categories/${activeCategory.id}/topics`);
      setTopics(response.data);
      
      setNewTopicTitle('');
      setNewTopicContent('');
      setShowCreateTopic(false);
    } catch (err) {
      console.error('Error creating topic:', err);
      alert('Failed to launch topic.');
    } finally {
      setPostLoading(false);
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
    <div className="pt-16 min-h-screen bg-background max-w-6xl mx-auto px-margin-mobile md:px-margin-desktop pb-xl">
      
      {/* Forum Title */}
      <section className="text-center py-xl space-y-xs reveal-on-scroll">
        <h1 className="font-display-lg text-display-lg font-bold text-on-surface">Scientific Forums</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Debate delta dynamics, share KML layers, and discuss geographical folklore with global hydrologists.
        </p>
      </section>

      {/* Main Forum Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        
        {/* Categories panel (Left column - Col span: 4) */}
        <aside className="lg:col-span-4 space-y-md">
          <div className="glass-panel p-md rounded-xl space-y-sm border border-white/5">
            <span className="font-data-mono text-data-mono text-xs text-primary/70 uppercase block mb-xs">Forum Boards</span>
            <div className="space-y-xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat);
                    setActiveTopic(null);
                  }}
                  className={`w-full text-left p-sm rounded-lg border transition-all cursor-pointer ${
                    activeCategory?.id === cat.id
                      ? 'bg-primary-container/20 border-primary text-primary font-semibold shadow-sm'
                      : 'bg-white/5 border-white/5 text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
                  }`}
                >
                  <h4 className="font-label-sm text-sm">{cat.name}</h4>
                  <p className="text-[10px] opacity-75 mt-xs line-clamp-2">{cat.description}</p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Topic List and thread panels (Right column - Col span: 8) */}
        <main className="lg:col-span-8 space-y-md">
          {activeCategory && (
            <div className="glass-panel p-md rounded-xl space-y-md min-h-[400px] border border-white/5">
              
              {/* Header inside right panel */}
              <div className="flex justify-between items-center border-b border-white/10 pb-sm">
                <div>
                  <h2 className="font-headline-md text-lg font-bold text-on-surface">{activeCategory.name}</h2>
                  <p className="text-xs text-on-surface-variant mt-xs">{activeCategory.description}</p>
                </div>
                {!showCreateTopic && !activeTopic && (
                  <button 
                    onClick={() => setShowCreateTopic(true)}
                    className="btn-3d px-md py-sm rounded-lg font-label-sm text-xs font-bold text-on-primary cursor-pointer transition-all hover:brightness-110 active:scale-95 flex items-center gap-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    New Topic
                  </button>
                )}
              </div>

              {/* Loader inside panel */}
              {topicsLoading ? (
                <div className="py-xl text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div>
                </div>
              ) : showCreateTopic ? (
                
                /* Create Topic Forum form */
                <form onSubmit={handleCreateTopic} className="space-y-md animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <span className="font-data-mono text-data-mono text-xs text-secondary uppercase">Initiate Thread</span>
                    <button 
                      type="button" 
                      onClick={() => setShowCreateTopic(false)}
                      className="text-xs text-on-surface-variant hover:text-red-400"
                    >
                      Cancel
                    </button>
                  </div>
                  <div>
                    <label className="font-label-sm text-xs text-on-surface-variant block mb-xs">Thread Subject</label>
                    <input 
                      type="text"
                      required
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      placeholder="e.g. Padma Bridge Hydrometrics course shift anomalies"
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-sm focus:ring-1 focus:ring-primary outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-label-sm text-xs text-on-surface-variant block mb-xs">Initial Discussion Content</label>
                    <textarea 
                      rows="6"
                      required
                      value={newTopicContent}
                      onChange={(e) => setNewTopicContent(e.target.value)}
                      placeholder="Discuss scientific observations, coordinates, or geographical folkloric references..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-sm focus:ring-1 focus:ring-primary outline-none text-xs"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={postLoading}
                    className="btn-3d w-full py-sm rounded-lg font-label-sm text-on-primary font-bold cursor-pointer"
                  >
                    {postLoading ? 'Launching...' : 'Launch Discussion Thread'}
                  </button>
                </form>

              ) : activeTopic ? (

                /* Active topic detail and reply view */
                <div className="space-y-md animate-fadeIn">
                  
                  {/* Topic detail header bar */}
                  <div className="flex justify-between items-center pb-sm border-b border-white/5">
                    <button 
                      onClick={() => setActiveTopic(null)}
                      className="text-xs text-primary hover:underline flex items-center gap-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                      Back to Topic Index
                    </button>
                    <span className="font-data-mono text-data-mono text-[9px] uppercase tracking-wider text-secondary">
                      Active Thread Dialogue
                    </span>
                  </div>

                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                    {activeTopic.title}
                  </h3>

                  {topicDetailLoading ? (
                    <div className="py-xl text-center text-xs animate-pulse text-on-surface-variant">Acquiring replies...</div>
                  ) : (
                    <div className="space-y-sm">
                      
                      {/* Replies stream container */}
                      <div className="space-y-sm max-h-[350px] overflow-y-auto pr-xs mb-md">
                        {replies.map((reply, idx) => (
                          <div 
                            key={reply.id} 
                            className={`p-md rounded-lg border ${
                              idx === 0 
                                ? 'bg-primary-container/5 border-primary/20' 
                                : 'bg-white/5 border-white/5'
                            }`}
                          >
                            <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-data-mono mb-xs">
                              <span className="font-bold text-on-surface flex items-center gap-xs">
                                {reply.author_name}
                                {reply.author_role === 'admin' && (
                                  <span className="bg-tertiary text-on-tertiary text-[9px] px-xs rounded font-normal scale-90">
                                    ADMIN
                                  </span>
                                )}
                              </span>
                              <span>{new Date(reply.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Reply field entry form */}
                      <form onSubmit={handlePostReply} className="flex gap-sm border-t border-white/10 pt-md">
                        <input 
                          type="text"
                          required
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          placeholder="Post reply or argument..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-sm py-xs text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        />
                        <button 
                          type="submit"
                          disabled={postLoading}
                          className="btn-3d px-xl rounded-lg font-label-sm text-xs text-on-primary font-bold cursor-pointer transition-all flex items-center"
                        >
                          {postLoading ? '...' : 'Post Reply'}
                        </button>
                      </form>

                    </div>
                  )}

                </div>

              ) : (

                /* List of Topics */
                <div className="space-y-sm">
                  {topics.length === 0 ? (
                    <div className="py-xl text-center text-xs text-on-surface-variant italic">
                      No topics initiated in this board yet. Be the first to start!
                    </div>
                  ) : (
                    <div className="space-y-xs">
                      {topics.map((topic) => (
                        <div 
                          key={topic.id}
                          onClick={() => handleOpenTopic(topic)}
                          className="w-full text-left p-sm rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer flex justify-between items-center group transition-all"
                        >
                          <div>
                            <h4 className="font-label-sm text-sm text-on-surface group-hover:text-primary font-semibold transition-colors">
                              {topic.title}
                            </h4>
                            <p className="text-[10px] text-on-surface-variant font-data-mono mt-xs">
                              BY {topic.author_name.toUpperCase()} • {new Date(topic.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-xs bg-white/5 border border-white/10 px-sm py-xs rounded font-data-mono text-[10px] text-on-surface-variant">
                            <span className="material-symbols-outlined text-[12px] text-primary">chat</span>
                            {topic.reply_count || 0}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              )}

            </div>
          )}
        </main>

      </div>

    </div>
  );
};

export default ForumPage;
