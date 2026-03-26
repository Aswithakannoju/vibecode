import React, { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { Terminal } from 'lucide-react';

export default function App() {
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-[#050505] text-[#00ffff] flex flex-col items-center justify-center p-4 relative crt-flicker">
      <div className="scanlines"></div>
      <div className="bg-noise"></div>

      <header className="mb-8 text-center z-10 w-full max-w-4xl border-b-4 border-[#ff00ff] pb-6">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Terminal className="w-12 h-12 text-[#ff00ff]" />
          <h1 className="text-5xl md:text-7xl font-black glitch-text tracking-widest" data-text="SYS.SNAKE_PROTOCOL">
            SYS.SNAKE_PROTOCOL
          </h1>
        </div>
        <p className="text-[#00ffff] text-2xl tracking-[0.3em] mt-4 font-bold">
          [ STATUS: ONLINE // AWAITING INPUT ]
        </p>
      </header>

      <main className="flex flex-col lg:flex-row items-start gap-12 z-10 w-full max-w-6xl justify-center">
        {/* Game Section */}
        <div className="flex flex-col items-center raw-border p-6 bg-black">
          <div className="mb-4 flex justify-between w-full px-2 border-b-2 border-[#00ffff] pb-2">
            <span className="text-[#ff00ff] text-3xl font-bold">DATA_FRAGMENTS</span>
            <span className="text-4xl text-[#00ffff] font-bold">{score.toString().padStart(4, '0')}</span>
          </div>
          <SnakeGame onScoreChange={setScore} />
        </div>

        {/* Music Player Section */}
        <div className="flex flex-col items-center w-full max-w-md gap-8">
          <MusicPlayer />
          
          <div className="w-full raw-border-magenta p-6 bg-black">
            <h2 className="text-3xl text-[#ff00ff] mb-4 glitch-text" data-text="DIRECTIVE">DIRECTIVE</h2>
            <div className="text-[#00ffff] text-xl leading-relaxed font-mono space-y-2">
              <p>{'>'} INITIALIZE NEURAL LINK.</p>
              <p>{'>'} INTERCEPT MAGENTA DATA PACKETS.</p>
              <p>{'>'} AVOID SYSTEM BOUNDARIES.</p>
              <p>{'>'} DO NOT CROSS OWN DATA STREAM.</p>
              <p className="text-[#ff00ff] animate-pulse mt-4">{'>'} END OF LINE.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
