import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const canvasRef = useRef(null);

  // Bubbling Water Particles Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < 45; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedY: Math.random() * 0.4 + 0.1,
          opacity: Math.random() * 0.4
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.speedY;
        if (p.y < 0) p.y = canvas.height;
        ctx.fillStyle = `rgba(152, 203, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', init);
    init();
    animate();

    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Intersection Observer for Scroll Reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative overflow-x-hidden min-h-screen">
      {/* Dynamic Water Particle Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-20" />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-margin-mobile md:px-margin-desktop pt-16">
        <div className="absolute inset-0 z-0 bg-[#060e20]">
          <div className="absolute inset-0 opacity-30 mix-blend-overlay">
            <img 
              className="w-full h-full object-cover grayscale brightness-[0.25]" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtV8rDxQM2tCVsHh0G49BJv72vgdxCizgsyWX5NIbnXysRbkVzfkYgMxVhLHD5orf1byIsr6mtfgUrM9lQP1mcnh6dvCByNgO_AAW54k2_tuek8C-yRA-w5_A7DrrlX7n_DGZURk_Y1lBCTJpnGT4ZEgVrwuM-Xx_lh7MKnzhF-vE2tauuW3zMU6lHPZC1yacldBTrlGc3VmjhheIg7r-1juNITiS3w3ucM2u0b1H8vKK3UkFOOpyPS9AZRfDeBaxG7CKUxel4ztNF" 
              alt="Cinematic river background"
            />
          </div>
          <div className="hero-gradient absolute inset-0" />
          
          {/* Neon SVG flowing river lines */}
          <svg className="absolute inset-0 w-full h-full opacity-35" fill="none" viewBox="0 0 1440 800" xmlns="http://www.w3.org/2000/svg">
            <path className="river-path" d="M-100 600C100 550 300 700 500 600C700 500 900 650 1100 550C1300 450 1500 600 1600 550" stroke="#4ae183" strokeLinecap="round" strokeWidth="5" />
            <path className="river-path" d="M-100 400C150 450 400 300 600 400C850 500 1100 350 1300 400C1500 450 1700 300 1800 350" stroke="#98cbff" strokeLinecap="round" strokeWidth="2.5" style={{ animationDuration: '20s', animationDelay: '-5s', opacity: 0.6 }} />
          </svg>
        </div>

        <div className="relative z-10 text-center max-w-4xl space-y-md px-xs">
          <div className="inline-block px-sm py-xs glass-panel rounded-full border-primary/20 mb-md animate-pulse">
            <span className="font-data-mono text-data-mono text-primary text-[11px] uppercase tracking-widest">
              Bangladesh Hydrology Engine v1.2
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg md:text-[56px] leading-tight text-on-surface drop-shadow-2xl font-bold">
            Explore the Arteries of <br /><span className="text-primary">Bangladesh</span> in 3D
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            A premium glassmorphic interface for navigating the world's most complex river deltas. Analyze flow rates, explore seasonal sediment contours, and import local KML maps in interactive 3D terrain.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-md pt-md">
            <Link 
              to="/explorer" 
              className="btn-3d-primary px-xl py-md rounded-lg font-headline-md text-headline-md font-bold flex items-center gap-xs cursor-pointer w-full sm:w-auto justify-center"
            >
              Launch Explorer
              <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
            </Link>
            <Link 
              to="/blog" 
              className="glass-panel px-xl py-md rounded-lg font-headline-md text-headline-md text-on-surface hover:bg-white/10 transition-all border border-white/20 w-full sm:w-auto text-center"
            >
              Read Chronicles
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-xl px-margin-mobile md:px-margin-desktop bg-surface-container-lowest relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter max-w-6xl mx-auto">
          {/* Volumetric terrain card */}
          <div className="md:col-span-8 glass-panel p-lg rounded-xl min-h-[380px] flex flex-col justify-end group overflow-hidden relative reveal-on-scroll">
            <img 
              className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-1000" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd59BpQucApWcMP3yTs0IoXn0xVLL6kFpimLziF1ZyTFyang2Ke9iLHVWocsaj4aDgtJXeRa_KSf9KX_A441Wx_pbALdti8lkvwvDipBF3h4d_DXy7CUh61c16bLEZUbISunVQ0i0BcqLtOiSa2zEqSCctUWTqdHHN2PY-OCVtOclYygD1A-M9SVPESe1hdFxUdxEmwMrBUOEG_IzNED4-m_LLZnYdVtY3VrVFmDGVy5m5dYwrG8WGRYMczrLCZmv6776Zga2eMrtm" 
              alt="Digital terrain data overlay"
            />
            <div className="relative z-10">
              <span className="material-symbols-outlined text-secondary text-[48px] mb-xs">terrain</span>
              <h3 className="font-headline-lg text-headline-lg mb-base font-bold text-on-surface">Volumetric Terrain Mapping</h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                Interactive global rendering overlaid with highly detailed local topologies. Inspect riverbeds, channel depths, and banks with physical 3D elevation offsets.
              </p>
            </div>
          </div>

          {/* Live telemetry mock chart card */}
          <div className="md:col-span-4 glass-panel p-lg rounded-xl flex flex-col justify-between border-secondary/20 reveal-on-scroll" style={{ transitionDelay: '0.1s' }}>
            <div className="space-y-sm">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary">analytics</span>
                <span className="font-data-mono text-data-mono text-secondary uppercase text-xs">Dynamic telemetry</span>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold">Delta Flow Trends</h3>
            </div>
            <div className="h-28 flex items-end gap-xs my-md">
              <div className="flex-1 bg-secondary/20 rounded-t-sm h-[40%] animate-pulse" />
              <div className="flex-1 bg-secondary/40 rounded-t-sm h-[70%] animate-pulse" />
              <div className="flex-1 bg-secondary/20 rounded-t-sm h-[50%] animate-pulse" />
              <div className="flex-1 bg-secondary/60 rounded-t-sm h-[90%] animate-pulse" />
              <div className="flex-1 bg-secondary/30 rounded-t-sm h-[60%] animate-pulse" />
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Integrated real-time discharge telemetry representing water level fluctuations across regional monitoring stations.
            </p>
          </div>

          {/* KML integration card */}
          <div className="md:col-span-4 glass-panel p-lg rounded-xl border-primary/20 hover:bg-surface-container-high transition-colors reveal-on-scroll" style={{ transitionDelay: '0.2s' }}>
            <span className="material-symbols-outlined text-primary text-[32px] mb-base">terminal</span>
            <h4 className="font-headline-md text-headline-md mb-base font-semibold">Local KML/KMZ Uploads</h4>
            <p className="font-body-md text-body-md text-on-surface-variant mb-md">
              Import custom datasets seamlessly. Directly upload your laptop's map outputs and render lines layered on high-resolution terrain.
            </p>
            <div className="bg-surface-container-lowest p-sm rounded-lg font-data-mono text-data-mono text-xs text-primary/70 border border-white/5">
              &lt;kml&gt;<br />&nbsp;&nbsp;&lt;Placemark&gt;<br />&nbsp;&nbsp;&nbsp;&nbsp;&lt;name&gt;Tista River Basin&lt;/name&gt;
            </div>
          </div>

          {/* Community storytelling card */}
          <div className="md:col-span-8 glass-panel p-lg rounded-xl flex items-center gap-lg reveal-on-scroll" style={{ transitionDelay: '0.3s' }}>
            <div className="w-1/3 hidden md:block rounded-lg overflow-hidden shadow-lg border border-white/5">
              <img 
                className="w-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmiCVWdug8uIukVkIDLIwkFbaae6Q10cbLulbV9De957tc4grokIMvIkukdWpwunXAVt1WSuZoNXqpig9XZzXX2r_ekVhsSHTd98mIFGvOIOpvf3N0R3rI1nooLspej2eFFxhV7rUYSVU339kK599osf3gUXucbHmyDOUS5gZzvr2G2Ys9eug6qVeQU03hr5p_sjsoa33uflo-8Z3_76RXDk-IcnDKhrsPbDxqu6F6kE7WrWWZbSCCziuXZBh3h1kqRQlWRhyByX14" 
                alt="Environmental researchers"
              />
            </div>
            <div className="flex-1">
              <span className="material-symbols-outlined text-tertiary text-[32px] mb-base">groups</span>
              <h4 className="font-headline-lg text-headline-lg mb-base font-bold text-on-surface">Community Forums</h4>
              <p className="font-body-md text-body-md text-on-surface-variant mb-md">
                Connect with hydrologists and enthusiasts. Expose geographical anomalies, document river legends, and share logs on active threads.
              </p>
              <Link to="/forum" className="text-tertiary font-bold flex items-center gap-xs hover:gap-sm transition-all text-label-sm uppercase tracking-wider">
                Browse Discussions <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Data Interoperability */}
      <section className="py-xl px-margin-mobile md:px-margin-desktop bg-background relative overflow-hidden z-10 border-t border-white/5">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-xl items-center">
          <div className="flex-1 space-y-md reveal-on-scroll">
            <h2 className="font-headline-lg text-[36px] leading-tight font-bold text-on-surface">
              Interactive River Data Sheets
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Every river is cataloged with extensive specifications. Discover indigenous folklore, details of origin and outflow, discharge statistics, and comprehensive photo galleries.
            </p>
            <ul className="space-y-sm">
              <li className="flex items-center gap-base">
                <span className="material-symbols-outlined text-secondary">check_circle</span>
                <span className="font-label-sm text-label-sm text-on-surface">Scientific Telemetry</span>
              </li>
              <li className="flex items-center gap-base">
                <span className="material-symbols-outlined text-secondary">check_circle</span>
                <span className="font-label-sm text-label-sm text-on-surface">Historical Chronology</span>
              </li>
              <li className="flex items-center gap-base">
                <span className="material-symbols-outlined text-secondary">check_circle</span>
                <span className="font-label-sm text-label-sm text-on-surface">Cultural Legacy Archive</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full reveal-on-scroll" style={{ transitionDelay: '0.2s' }}>
            <div className="glass-panel p-sm rounded-xl relative hover:scale-[1.02] transition-all">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/20 blur-3xl rounded-full" />
              <div className="bg-surface-container-lowest rounded-lg p-md font-data-mono text-data-mono text-xs leading-relaxed overflow-x-auto border border-white/5">
                <div className="flex gap-xs border-b border-white/5 pb-sm mb-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
                <span className="text-secondary">{'{'}</span><br />
                &nbsp;&nbsp;<span className="text-primary">"river"</span>: <span className="text-tertiary">"Nilphamari district waterways"</span>,<br />
                &nbsp;&nbsp;<span className="text-primary">"KML_Mapping"</span>: <span className="text-secondary">true</span>,<br />
                &nbsp;&nbsp;<span className="text-primary">"history"</span>: <span className="text-tertiary">"Part of the massive Tista basin..."</span><br />
                <span className="text-secondary">{'}'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-xl px-margin-mobile md:px-margin-desktop relative z-10">
        <div className="glass-panel p-xl rounded-xl text-center space-y-md border-primary/30 relative overflow-hidden max-w-5xl mx-auto reveal-on-scroll">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="font-headline-lg text-[40px] leading-none mb-sm font-bold text-on-surface">
            Ready to Map the Flow?
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto mb-lg">
            Register your explorer profile to interact with 3D map sheets, participate in scientific debates, and write observation logs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-md">
            <Link to="/login" className="btn-3d-primary px-xl py-md rounded-lg font-headline-md text-headline-md font-bold cursor-pointer text-center">
              Register Explorer Account
            </Link>
            <Link to="/blog" className="glass-panel px-xl py-md rounded-lg font-headline-md text-headline-md text-on-surface hover:bg-white/10 transition-all text-center">
              Read Blog Posts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
