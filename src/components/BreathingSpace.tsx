import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Volume2, VolumeX, Heart } from 'lucide-react';

interface BreathingSpaceProps {
  onClose: () => void;
  onComplete: () => void;
}

type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

export default function BreathingSpace({ onClose, onComplete }: BreathingSpaceProps) {
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [cycleCount, setCycleCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Gentle synthesizer for breathing instructions
  const playTone = (frequency: number, duration: number, type: 'sine' | 'triangle' = 'sine') => {
    if (!soundEnabled) return;
    try {
      const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioContext) setAudioContext(ctx);
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context error", e);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (phase === 'idle') return;
    
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, phase, onComplete]);

  // Breathing cycles (4s Inhale, 4s Hold, 6s Exhale)
  useEffect(() => {
    if (phase === 'idle') return;

    let timeoutId: NodeJS.Timeout;

    const runCycle = () => {
      if (timeLeft <= 0) return;

      // PHASE 1: Inhale (4 seconds)
      setPhase('inhale');
      playTone(349.23, 1.5, 'triangle'); // F4 Note - warm and clear
      
      timeoutId = setTimeout(() => {
        if (timeLeft <= 0) return;
        
        // PHASE 2: Hold (4 seconds)
        setPhase('hold');
        playTone(392.00, 0.5); // G4 Note - stabilizing
        
        timeoutId = setTimeout(() => {
          if (timeLeft <= 0) return;
          
          // PHASE 3: Exhale (6 seconds)
          setPhase('exhale');
          playTone(293.66, 2.5); // D4 Note - deep and grounding
          
          timeoutId = setTimeout(() => {
            setCycleCount(prev => prev + 1);
            runCycle();
          }, 6000);
        }, 4000);
      }, 4000);
    };

    runCycle();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [cycleCount, phase === 'idle']);

  const getInstructions = () => {
    switch (phase) {
      case 'idle':
        return "Find a comfortable position. When you are ready, tap below to begin.";
      case 'inhale':
        return "Breathe in deeply through your nose... Feel your center expand.";
      case 'hold':
        return "Hold gently. Relax your shoulders. Rest in this stillness.";
      case 'exhale':
        return "Breathe out slowly through your mouth... Release all tension.";
    }
  };

  const startBreathing = () => {
    setPhase('inhale');
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    } catch (_) {}
  };

  return (
    <div id="breathing-space-overlay" className="fixed inset-0 bg-cream/98 backdrop-blur-md z-50 flex flex-col items-center justify-between p-6 md:p-8 select-none">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mt-2">
        <div className="flex items-center gap-2 text-sage-600 font-serif font-bold text-base">
          <Sparkles size={16} className="text-sage-500 animate-pulse" />
          <span>Mindful Breathing Space</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            id="toggle-sound-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full hover:bg-sage-100 text-sage-600 transition-colors cursor-pointer"
            title={soundEnabled ? "Mute guide tones" : "Enable guide tones"}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button 
            id="close-breathing-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-sage-100 text-sage-600 transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Main Core Bubble Visuals */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
        
        {/* Breathing Circle Container */}
        <div className="relative w-72 h-72 flex items-center justify-center mb-8">
          
          {/* Outer glow ring */}
          <AnimatePresence>
            {phase !== 'idle' && (
              <motion.div 
                className="absolute inset-0 rounded-full bg-sage-200/40"
                animate={{
                  scale: phase === 'inhale' ? 1.22 : phase === 'hold' ? 1.28 : phase === 'exhale' ? 0.95 : 1.0,
                  opacity: phase === 'hold' ? 0.7 : 0.35
                }}
                transition={{
                  duration: phase === 'inhale' ? 4 : phase === 'hold' ? 4 : phase === 'exhale' ? 6 : 1,
                  ease: "easeInOut"
                }}
              />
            )}
          </AnimatePresence>

          {/* Secondary ripple ring */}
          <AnimatePresence>
            {phase !== 'idle' && (
              <motion.div 
                className="absolute inset-4 rounded-full bg-lavender-200/40"
                animate={{
                  scale: phase === 'inhale' ? 1.12 : phase === 'hold' ? 1.18 : phase === 'exhale' ? 0.98 : 1.0,
                }}
                transition={{
                  duration: phase === 'inhale' ? 4 : phase === 'hold' ? 4 : phase === 'exhale' ? 6 : 1,
                  ease: "easeInOut"
                }}
              />
            )}
          </AnimatePresence>

          {/* Main Breathing Core Bubble */}
          <motion.div 
            id="breathing-core-bubble"
            className="w-48 h-48 rounded-full bg-gradient-to-tr from-sage-400 to-sage-500 shadow-organic flex flex-col items-center justify-center text-white z-10 p-5 text-center"
            animate={{
              scale: phase === 'inhale' ? 1.15 : phase === 'hold' ? 1.22 : phase === 'exhale' ? 0.85 : 1.0,
            }}
            transition={{
              duration: phase === 'inhale' ? 4 : phase === 'hold' ? 4 : phase === 'exhale' ? 6 : 1.5,
              ease: "easeInOut"
            }}
          >
            <Heart size={28} className={`mb-2 text-white/95 ${phase === 'inhale' ? 'scale-110' : phase === 'hold' ? 'animate-pulse' : ''}`} />
            <span className="font-serif font-bold text-xl capitalize tracking-wide">
              {phase === 'idle' ? 'Ready' : phase}
            </span>
            {phase !== 'idle' && (
              <span className="text-xs text-white/90 mt-1 font-bold">
                {phase === 'inhale' ? '4s In' : phase === 'hold' ? '4s Hold' : '6s Out'}
              </span>
            )}
          </motion.div>
        </div>

        {/* Written Step Instructions */}
        <div className="text-center h-20 px-6 max-w-sm flex items-center justify-center">
          <motion.p 
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-ink text-lg md:text-xl font-serif font-semibold leading-relaxed"
          >
            {getInstructions()}
          </motion.p>
        </div>
      </div>

      {/* Footer controls & timer countdown */}
      <div className="w-full max-w-md flex flex-col items-center gap-4 mb-6">
        {phase === 'idle' ? (
          <button 
            id="start-breathing-btn"
            onClick={startBreathing}
            className="w-full bg-sage-500 hover:bg-sage-600 active:scale-98 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-sage-500/10 hover:shadow-organic transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles size={18} />
            <span>Begin 1-Minute Quiet Breathing</span>
          </button>
        ) : (
          <div className="w-full bg-white border border-sage-200/60 rounded-2xl p-4 flex justify-between items-center shadow-organic">
            <div className="flex flex-col">
              <span className="text-[10px] text-ink-light font-bold uppercase tracking-widest">Time Remaining</span>
              <span id="countdown-timer" className="text-2xl font-bold text-ink">{timeLeft}s</span>
            </div>
            
            <div className="h-8 w-[1px] bg-sage-200" />
            
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-ink-light font-bold uppercase tracking-widest">Completed Cycles</span>
              <span className="text-2xl font-bold text-ink">{cycleCount}</span>
            </div>
          </div>
        )}
        
        <p className="text-xs text-ink-light font-semibold text-center px-4 leading-relaxed">
          Pacing: 4s inhale, 4s gentle hold, 6s exhale. Let this rhythm wash away active overwhelm.
        </p>
      </div>
    </div>
  );
}
