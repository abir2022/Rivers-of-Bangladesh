import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const RiverDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [river, setRiver] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchRiverData = async () => {
      try {
        const [riverRes, commentsRes] = await Promise.all([
          axios.get(`/api/rivers/${id}`),
          axios.get(`/api/rivers/${id}/comments`)
        ]);
        setRiver(riverRes.data);
        setComments(commentsRes.data);
      } catch (err) {
        console.error('Error fetching river detail data:', err);
        setError('Failed to fetch river profile. Ensure you are signed in.');
      } finally {
        setLoading(false);
      }
    };

    fetchRiverData();
  }, [id]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const response = await axios.post(`/api/rivers/${id}/comments`, { comment: newComment });
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
      alert('Failed to post observation. Please try again.');
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-primary flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error || !river) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center pt-16 gap-md">
        <span className="material-symbols-outlined text-[64px] text-red-400">error</span>
        <h3 className="font-headline-md text-headline-md font-bold">{error || 'River profile not found'}</h3>
        <Link to="/explorer" className="btn-3d-primary px-lg py-sm rounded-lg font-label-sm">
          Return to Explorer
        </Link>
      </div>
    );
  }

  const galleryList = river.gallery_images ? JSON.parse(river.gallery_images) : [];

  return (
    <div className="pt-16 min-h-screen bg-background">
      
      {/* Top Banner Hero section */}
      <section className="relative h-[480px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        <img 
          src={river.image_path || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtV8rDxQM2tCVsHh0G49BJv72vgdxCizgsyWX5NIbnXysRbkVzfkYgMxVhLHD5orf1byIsr6mtfgUrM9lQP1mcnh6dvCByNgO_AAW54k2_tuek8C-yRA-w5_A7DrrlX7n_DGZURk_Y1lBCTJpnGT4ZEgVrwuM-Xx_lh7MKnzhF-vE2tauuW3zMU6lHPZC1yacldBTrlGc3VmjhheIg7r-1juNITiS3w3ucM2u0b1H8vKK3UkFOOpyPS9AZRfDeBaxG7CKUxel4ztNF'} 
          alt={river.name} 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-margin-mobile md:p-margin-desktop z-20 pb-xl max-w-6xl mx-auto">
          <div className="flex items-center gap-xs mb-sm">
            <span className="font-label-sm text-label-sm text-secondary bg-on-secondary/20 backdrop-blur-md px-sm py-xs rounded-full border border-secondary/30">
              BANGLADESH DELTA
            </span>
            <Link to="/explorer" className="text-xs text-primary hover:underline flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              Back to Map Explorer
            </Link>
          </div>
          <h1 className="font-display-lg text-display-lg md:text-[52px] font-bold text-on-surface drop-shadow-2xl">
            {river.name}
          </h1>
          <h2 className="text-headline-md text-primary font-bold font-headline-md mt-xs">
            {river.bangla_name}
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-md">
            {river.description}
          </p>
        </div>
      </section>

      {/* Bento Specifications Grid */}
      <section className="p-margin-mobile md:p-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-md max-w-6xl mx-auto">
        
        {/* Length Card */}
        <div className="glass-panel p-md rounded-xl flex flex-col justify-between min-h-[160px] hover:border-primary/40 transition-all group">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Hydrometer Length</p>
            <h3 className="font-display-lg text-display-lg text-primary data-glow mt-xs font-bold">
              {river.length_km}<span className="text-headline-md font-semibold">km</span>
            </h3>
          </div>
          <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden mt-sm border border-white/5">
            <div className="h-full bg-primary" style={{ width: `${Math.min(100, (river.length_km / 400) * 100)}%` }} />
          </div>
        </div>

        {/* Discharge Rate Card */}
        <div className="glass-panel p-md rounded-xl flex flex-col justify-between min-h-[160px] hover:border-secondary/40 transition-all group">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Average Discharge</p>
            <h3 className="font-display-lg text-display-lg text-secondary data-glow mt-xs font-bold">
              {river.discharge_m3s.toLocaleString()}<span className="text-headline-md font-semibold">m³/s</span>
            </h3>
          </div>
          <div className="flex gap-xs items-end h-8">
            <div className="w-1 bg-secondary/30 h-[40%] animate-pulse" />
            <div className="w-1 bg-secondary/50 h-[70%] animate-pulse" />
            <div className="w-1 bg-secondary/20 h-[50%] animate-pulse" />
            <div className="w-1 bg-secondary h-full animate-pulse" />
            <div className="w-1 bg-secondary/80 h-[75%] animate-pulse" />
          </div>
        </div>

        {/* Technical specs info */}
        <div className="glass-panel p-md rounded-xl flex flex-col justify-between min-h-[160px] hover:border-tertiary/40 transition-all group">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Technical Specifications</p>
            <div className="mt-sm space-y-xs">
              <div className="flex justify-between text-xs border-b border-white/5 pb-xs">
                <span className="text-on-surface-variant">Average Depth:</span>
                <span className="font-bold text-tertiary">{river.average_depth_m} meters</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">River System:</span>
                <span className="font-bold text-tertiary">Brahmaputra-Meghna</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-xs text-tertiary text-xs">
            <span className="material-symbols-outlined text-[18px]">public</span>
            <span className="font-data-mono text-data-mono">Origin: {river.origin}</span>
          </div>
        </div>
      </section>

      {/* History & Folk Heritage and Image Panels */}
      <section className="p-margin-mobile md:p-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-xl items-center max-w-6xl mx-auto">
        <div className="space-y-md">
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Geographical History</h2>
          <p className="text-on-surface-variant leading-relaxed">
            {river.history}
          </p>
          <div className="border-t border-white/10 pt-md mt-md">
            <h3 className="font-headline-md text-md font-bold text-primary mb-xs">Delta Folk Customs & Indigenous Culture</h3>
            <p className="text-on-surface-variant text-sm italic leading-relaxed">
              {river.indigenous_culture}
            </p>
          </div>
        </div>

        <div className="relative aspect-square w-full">
          <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
          <div className="surface-float rounded-xl overflow-hidden h-full relative border border-white/10">
            {galleryList.length > 0 ? (
              <img 
                src={galleryList[activeImageIndex]} 
                alt="River Scene" 
                className="w-full h-full object-cover transition-all duration-750"
              />
            ) : (
              <div className="w-full h-full bg-[#060e20] flex items-center justify-center">
                <span className="material-symbols-outlined text-[64px] text-primary/30">water</span>
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 p-md bg-gradient-to-t from-background to-transparent">
              <p className="font-label-sm text-label-sm italic text-primary-fixed-dim">
                "The delta is a living body, and the rivers are its veins." — Bengali Proverb
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Exploration Photo Gallery */}
      {galleryList.length > 1 && (
        <section className="p-margin-mobile md:p-margin-desktop max-w-6xl mx-auto border-t border-white/5 pt-lg my-lg">
          <h2 className="font-headline-lg text-headline-lg font-bold mb-md text-on-surface">Field Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            {galleryList.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`aspect-video glass-panel overflow-hidden rounded-lg group border cursor-pointer ${
                  activeImageIndex === idx ? 'border-primary' : 'border-white/5'
                }`}
              >
                <img 
                  src={imgUrl} 
                  alt={`Gallery thumbnail ${idx}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Community River Comment Log dialogues (requires login) */}
      <section className="p-margin-mobile md:p-margin-desktop max-w-6xl mx-auto mb-xl border-t border-white/15 pt-lg">
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-lg">River Observation Logs</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          
          {/* Post Observation form */}
          <div className="lg:col-span-1">
            <div className="surface-float p-md rounded-xl border border-white/10">
              <h4 className="font-headline-md text-md font-bold text-primary mb-md">Record Field Observation</h4>
              <form onSubmit={handlePostComment} className="space-y-md">
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-xs">Field Officer Account</label>
                  <input 
                    type="text" 
                    disabled 
                    value={user?.username || 'Guest'} 
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-sm font-label-sm text-label-sm text-on-surface-variant"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-xs">Field Log Notes</label>
                  <textarea 
                    rows="4"
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Enter hydrological observations, course shift alerts or folklore notes..."
                    className="w-full bg-white/5 border border-white/15 rounded-lg p-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-on-surface transition-all text-xs"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={commentLoading}
                  className="w-full btn-3d py-sm rounded-lg font-label-sm text-on-primary font-bold cursor-pointer transition-all hover:brightness-110 flex items-center justify-center gap-xs text-xs"
                >
                  {commentLoading ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">edit_note</span>
                      Post Observation to Log
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Observations log stream */}
          <div className="lg:col-span-2 space-y-md">
            {comments.length === 0 ? (
              <div className="glass-panel p-md rounded-xl text-center text-xs text-on-surface-variant py-lg border border-dashed border-white/10">
                No observations filed for this waterway yet. Be the first to record!
              </div>
            ) : (
              <div className="space-y-sm max-h-[500px] overflow-y-auto pr-xs">
                {comments.map((comm) => (
                  <div key={comm.id} className="glass-panel p-md rounded-xl border-l-4 border-l-primary/60 relative">
                    <div className="flex items-center gap-sm mb-xs">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {comm.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-label-sm text-xs font-bold text-on-surface flex items-center gap-xs">
                          {comm.username} 
                          {comm.username === 'admin' && (
                            <span className="bg-tertiary text-on-tertiary text-[9px] px-xs rounded font-normal scale-90">
                              ADMIN
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-on-surface-variant font-data-mono">
                          {new Date(comm.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed pl-sm border-l border-white/5 ml-4">
                      {comm.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default RiverDetailPage;
