import React, { useEffect, useState } from "react";
import { Sparkles, BarChart2, Zap, Settings, Eye, Shield, Heart } from "lucide-react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3500;
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(Math.round((currentStep / steps) * 100), 100);
      setProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 500);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="h-screen w-screen bg-[#050B14] flex flex-col items-center justify-between relative overflow-hidden font-sans text-white z-50 py-10">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00E5FF] opacity-[0.08] blur-[150px] rounded-full pointer-events-none"></div>

      {/* Top Header */}
      <div className="flex flex-col items-center space-y-3 z-10 text-center px-4 w-full mt-4">
        <h2 className="text-xl md:text-3xl tracking-[0.25em] font-light text-gray-300 uppercase flex items-center gap-3">
          The <span className="text-[#00E5FF] font-medium">Future</span> of Data <span className="text-[#00E5FF] font-medium">Is Here</span>
        </h2>
        <p className="text-[10px] md:text-xs text-[#00E5FF] tracking-[0.3em] font-mono uppercase">
          Cleaner Data <span className="text-gray-500 mx-1">•</span> Smarter Decisions <span className="text-gray-500 mx-1">•</span> Greater Impact
        </p>
      </div>

      {/* Center Logo Area */}
      <div className="flex flex-col items-center justify-center z-10 w-full flex-1">
        <div className="relative w-64 h-64 md:w-[400px] md:h-[400px] flex items-center justify-center mb-8">
           {/* Circular rings */}
           <div className="absolute inset-0 rounded-full border border-[#00E5FF]/20 border-t-[#00E5FF]/80 animate-spin" style={{ animationDuration: '3s'}}></div>
           <div className="absolute inset-8 md:inset-12 rounded-full border border-[#00E5FF]/10 border-b-[#00E5FF]/60 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse'}}></div>
           <div className="absolute inset-16 md:inset-24 rounded-full border border-[#32CD32]/20 border-l-[#32CD32]/80 animate-spin" style={{ animationDuration: '5s'}}></div>
           
           <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-[#00E5FF]/20 to-transparent blur-xl"></div>
           
           <h1 className="text-8xl md:text-[150px] font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-300 to-gray-600 drop-shadow-[0_0_25px_rgba(0,229,255,0.4)] z-10">
             DF
           </h1>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-widest mb-4 flex items-center gap-3 md:gap-5 uppercase">
          Data <span className="text-[#00E5FF]">Forge <span className="text-[#32CD32]">AI</span></span>
        </h1>
        <p className="text-xs md:text-sm tracking-[0.4em] text-gray-400 mb-12 uppercase flex items-center gap-3">
          Clean <span className="text-[#32CD32]">•</span> Analyze <span className="text-[#32CD32]">•</span> Optimize
        </p>

        {/* Icons row */}
        <div className="flex items-center justify-center gap-6 md:gap-12 mb-16 flex-wrap px-4">
           <IconItem icon={<Sparkles />} label="Clean" />
           <IconItem icon={<BarChart2 />} label="Analyze" />
           <IconItem icon={<Zap />} label="Optimize" />
           <IconItem icon={<Settings />} label="Automate" />
           <IconItem icon={<Eye />} label="Insight" />
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md md:max-w-xl px-6 flex flex-col space-y-4">
           <div className="text-center">
             <p className="text-[10px] md:text-xs tracking-[0.3em] text-[#32CD32] font-semibold uppercase">
               Initializing AI Engine
             </p>
           </div>
           
           <div className="flex items-center gap-4">
             <div className="flex-1 h-3 md:h-4 rounded-full bg-[#0A1628] border border-[#00E5FF]/30 p-[2px] relative overflow-hidden shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] via-[#00E5FF] to-[#32CD32] transition-all duration-75 relative shadow-[0_0_10px_rgba(50,205,50,0.5)]"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
             </div>
             <span className="font-bold text-2xl md:text-3xl text-[#32CD32] drop-shadow-[0_0_10px_rgba(50,205,50,0.8)] w-16 text-right">
               {progress}%
             </span>
           </div>
           
           <div className="text-right text-[#00E5FF] font-mono text-[10px] md:text-xs opacity-80 uppercase tracking-widest pr-20">
             Loading...
           </div>
        </div>
      </div>

      {/* Footer Credits */}
      <div className="flex flex-col items-center space-y-2 z-10 text-center px-4 w-full mt-auto relative pt-8 pb-4">
        <p className="text-[9px] md:text-[11px] text-gray-400 uppercase tracking-[0.2em] font-medium mb-2">
          © DESIGN, DEVELOPMENT & PUBLISH RIGHTS
        </p>
        <div className="flex flex-col items-center gap-1 text-sm md:text-base text-[#00E5FF] font-semibold tracking-wide">
          <span>Eng. Mohammed Tarek</span>
          <span className="text-gray-500 font-medium text-xs">&</span>
          <span>Eng. Ahmed Nasser</span>
        </div>
        <p className="text-[8px] md:text-[9px] text-gray-500 tracking-[0.25em] uppercase pt-4 flex items-center gap-2">
          BUILT WITH PASSION <span className="text-gray-600">•</span> ENGINEERED FOR EXCELLENCE <Heart className="w-3 h-3 text-gray-500" />
        </p>
      </div>
    </div>
  );
}

function IconItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-[#00E5FF] group">
      <div className="p-3 md:p-4 rounded-full border border-[#00E5FF]/30 bg-[#0A1628] shadow-[0_0_15px_rgba(0,229,255,0.15)] group-hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] group-hover:scale-110 transition-all duration-300">
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5 md:w-6 md:h-6 opacity-90" })}
      </div>
      <span className="text-[9px] md:text-[10px] font-medium tracking-[0.2em] text-gray-300 uppercase group-hover:text-white transition-colors">{label}</span>
    </div>
  );
}
