import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, ChevronUp, ChevronDown, Sparkles, Play } from 'lucide-react';
import { VideoItem } from '../types';

const SAMPLE_VIDEOS: VideoItem[] = [
  {
    id: 'v1',
    title: '🧠 O Paradoxo da Dopamina Rápida e Foco Humano',
    author: '@neuro_insights',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-focused-on-her-laptop-42999-large.mp4',
    tags: ['#neurociencia', '#foco', '#dopamina'],
    likes: 14200
  },
  {
    id: 'v2',
    title: '⚡ 5 Gatilhos de Recompensa Imediata nas Redes',
    author: '@psico_lab',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-scrolling-through-social-media-42790-large.mp4',
    tags: ['#psicologia', '#shorts', '#viral'],
    likes: 28900
  },
  {
    id: 'v3',
    title: '📱 Como Algoritmos Moldam o Tempo de Atenção',
    author: '@tech_mind',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-a-tablet-in-a-coffee-shop-42801-large.mp4',
    tags: ['#tecnologia', '#atencao', '#algoritmo'],
    likes: 53100
  }
];

interface VideoFeedProps {
  onInteract?: () => void;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ onInteract }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [videoError, setVideoError] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentVideo = SAMPLE_VIDEOS[currentIndex];

  // Canvas loop generator fallback when video fails or offline
  useEffect(() => {
    if (!videoError || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      angle += 0.03;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Glowing dynamic wave pattern representing video stimulus
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      const radius = 60 + Math.sin(angle * 2) * 20;
      const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, radius * 2);
      gradient.addColorStop(0, '#a855f7');
      gradient.addColorStop(0.5, '#ec4899');
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Rotating particle rings
      for (let i = 0; i < 8; i++) {
        const pAngle = angle + (i * Math.PI) / 4;
        const px = Math.cos(pAngle) * (radius + 20);
        const py = Math.sin(pAngle) * (radius + 20);
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [videoError, currentIndex]);

  const handleNext = () => {
    setVideoError(false);
    setCurrentIndex((prev) => (prev + 1) % SAMPLE_VIDEOS.length);
    if (onInteract) onInteract();
  };

  const handlePrev = () => {
    setVideoError(false);
    setCurrentIndex((prev) => (prev - 1 + SAMPLE_VIDEOS.length) % SAMPLE_VIDEOS.length);
    if (onInteract) onInteract();
  };

  const toggleLike = (id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 800);
    if (onInteract) onInteract();
  };

  return (
    <div className="relative w-full h-[620px] max-h-[78vh] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-purple-900/40 select-none flex flex-col justify-between group">
      {/* HTML5 Video element or Canvas Fallback */}
      {!videoError ? (
        <video
          ref={videoRef}
          src={currentVideo.videoUrl}
          autoPlay
          loop
          muted={muted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          onError={() => setVideoError(true)}
        />
      ) : (
        <canvas
          ref={canvasRef}
          width={360}
          height={640}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Double-tap heart animation overlay */}
      {heartAnim && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-ping">
          <Heart className="w-24 h-24 text-rose-500 fill-current drop-shadow-[0_0_30px_rgba(244,63,94,0.8)]" />
        </div>
      )}

      {/* Dark gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

      {/* Top Bar: Feed Indicator */}
      <div className="relative z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1 bg-purple-950/80 backdrop-blur-md rounded-full border border-purple-700/60 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
          <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Feed Reels (Grupo A)</span>
        </div>
        <button
          onClick={() => setMuted(!muted)}
          className="p-2.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-all border border-white/10 shadow-lg active:scale-90"
        >
          {muted ? <VolumeX className="w-4 h-4 text-purple-300" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Swipe Navigation Hints */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4">
        <button
          onClick={handlePrev}
          className="p-3 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-purple-900/60 active:scale-95 transition-all border border-white/20 shadow-lg"
          title="Vídeo Anterior"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        <button
          onClick={() => toggleLike(currentVideo.id)}
          className="flex flex-col items-center gap-1 group/btn"
        >
          <div className={`p-3 rounded-full backdrop-blur-md transition-all border ${
            liked[currentVideo.id]
              ? 'bg-rose-600/90 text-white border-rose-500 scale-110 shadow-[0_0_15px_rgba(225,29,72,0.6)]'
              : 'bg-black/60 text-white border-white/20 group-hover/btn:bg-purple-900/60'
          }`}>
            <Heart className={`w-5 h-5 ${liked[currentVideo.id] ? 'fill-current' : ''}`} />
          </div>
          <span className="text-[10px] font-mono text-white font-semibold drop-shadow">
            {(currentVideo.likes + (liked[currentVideo.id] ? 1 : 0)).toLocaleString()}
          </span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="p-3 bg-black/60 backdrop-blur-md rounded-full text-white border border-white/20">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono text-white font-semibold drop-shadow">482</span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="p-3 bg-black/60 backdrop-blur-md rounded-full text-white border border-white/20">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono text-white font-semibold drop-shadow">Compartilhar</span>
        </button>

        <button
          onClick={handleNext}
          className="p-3 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-purple-900/60 active:scale-95 transition-all border border-white/20 shadow-lg mt-2"
          title="Próximo Vídeo"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Info Overlay */}
      <div className="relative z-10 p-5 space-y-2 pr-20">
        <span className="text-xs font-bold text-purple-300 tracking-wide">{currentVideo.author}</span>
        <h3 className="text-base font-semibold text-white leading-tight drop-shadow-md">
          {currentVideo.title}
        </h3>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {currentVideo.tags.map((tag) => (
            <span key={tag} className="text-[10px] bg-purple-950/80 backdrop-blur-sm text-purple-300 px-2 py-0.5 rounded-md border border-purple-800/60 font-mono">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
