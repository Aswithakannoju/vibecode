import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: "Neon Drive (AI Gen)",
    artist: "CyberMinds",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "cyan"
  },
  {
    id: 2,
    title: "Digital Horizon (AI Gen)",
    artist: "Neural Network",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "magenta"
  },
  {
    id: 3,
    title: "Synthwave Protocol (AI Gen)",
    artist: "Algorhythm",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "green"
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleTrackEnd = () => {
    nextTrack();
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md bg-black p-6 raw-border transition-all duration-500 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#ff00ff]"></div>
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
      />
      
      <div className="flex items-center justify-between mb-8 border-b-2 border-[#00ffff] pb-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 flex items-center justify-center bg-black border-2 border-[#ff00ff] shadow-[2px_2px_0_#00ffff]">
            <Music className="w-8 h-8 text-[#ff00ff] relative z-10" />
          </div>
          <div>
            <h3 className="font-bold text-2xl text-[#00ffff] truncate max-w-[200px] uppercase">
              {currentTrack.title}
            </h3>
            <p className="text-[#ff00ff] text-lg uppercase tracking-widest">{currentTrack.artist}</p>
          </div>
        </div>
        <button 
          onClick={toggleMute}
          className="text-[#00ffff] hover:text-[#ff00ff] transition-colors"
        >
          {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-4 w-full bg-black border-2 border-[#00ffff] relative">
          <div 
            className="h-full bg-[#ff00ff] transition-all duration-100"
            style={{ 
              width: `${progress}%`
            }}
          />
        </div>
        <div className="flex justify-between text-lg text-[#00ffff] mt-2 font-mono">
          <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
          <span className="animate-pulse">STREAMING...</span>
          <span>{formatTime(audioRef.current?.duration || 0)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-8">
        <button 
          onClick={prevTrack}
          className="p-2 text-[#00ffff] hover:text-[#ff00ff] transition-colors"
        >
          <SkipBack size={32} />
        </button>
        
        <button 
          onClick={togglePlay}
          className="w-16 h-16 flex items-center justify-center bg-black border-2 border-[#00ffff] shadow-[4px_4px_0_#ff00ff] text-[#00ffff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#ff00ff] transition-all"
        >
          {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>
        
        <button 
          onClick={nextTrack}
          className="p-2 text-[#00ffff] hover:text-[#ff00ff] transition-colors"
        >
          <SkipForward size={32} />
        </button>
      </div>
    </div>
  );
}
