import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Heart, Battery, Moon, Sparkles } from 'lucide-react';
import { CheckIn } from '../types';

interface DailyCheckInProps {
  onClose: () => void;
  onSubmit: (checkIn: Omit<CheckIn, 'id' | 'date' | 'timestamp'>) => void;
}

type MoodOption = '😫 Struggling' | '😔 Low' | '😐 Okay' | '🙂 Good' | '😌 Calm';

export default function DailyCheckIn({ onClose, onSubmit }: DailyCheckInProps) {
  const [mood, setMood] = useState<MoodOption | null>(null);
  const [energy, setEnergy] = useState<number>(3);
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  const moodOptions: MoodOption[] = ['😫 Struggling', '😔 Low', '😐 Okay', '🙂 Good', '😌 Calm'];

  const getEnergyLabel = (val: number) => {
    switch (val) {
      case 1: return "Exhausted";
      case 2: return "Heavy & low";
      case 3: return "Fluctuating";
      case 4: return "Stable battery";
      case 5: return "Full of life";
      default: return "Fluctuating";
    }
  };

  const getSleepLabel = (val: number) => {
    switch (val) {
      case 1: return "Barely slept";
      case 2: return "Restless & tossed";
      case 3: return "Okay, wakeful";
      case 4: return "Quiet rest";
      case 5: return "Deeply rested";
      default: return "Okay";
    }
  };

  const getStressLabel = (val: number) => {
    switch (val) {
      case 1: return "Overwhelming";
      case 2: return "High pressure";
      case 3: return "Moderate tension";
      case 4: return "Manageable";
      case 5: return "Peaceful & light";
      default: return "Moderate";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood) {
      setError("Please choose an emoji that reflects your mood baseline today.");
      return;
    }
    setError('');
    onSubmit({
      mood,
      energy,
      sleepQuality,
      stressLevel,
      note: note.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-ink-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg bg-white rounded-[2rem] border border-sage-200/80 shadow-organic overflow-hidden my-8"
      >
        {/* Header banner */}
        <div className="bg-sage-50/50 px-6 py-5 flex justify-between items-center border-b border-sage-100">
          <div className="flex items-center gap-2.5">
            <Heart className="text-sage-500 fill-sage-500/10 animate-pulse shrink-0" size={20} />
            <div>
              <h3 className="font-serif font-semibold text-ink text-xl leading-tight">Gently check in with yourself</h3>
              <p className="text-ink-light text-xs mt-0.5 font-semibold">How are you feeling in this exact moment?</p>
            </div>
          </div>
          <button 
            id="close-checkin-modal"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-sage-100 text-ink-light hover:text-ink transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Mood Section */}
          <div>
            <label className="text-[10px] font-bold text-ink-light uppercase tracking-widest block mb-3">
              1. My Current Mood State
            </label>
            <div className="grid grid-cols-5 gap-1.5 md:gap-2">
              {moodOptions.map((option) => {
                const parts = option.split(' ');
                const emoji = parts[0];
                const text = parts.slice(1).join(' ');
                const isSelected = mood === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setMood(option);
                      if (error) setError('');
                    }}
                    className={`py-3 px-1 rounded-2xl border text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-sage-400 bg-sage-50 text-sage-800 shadow-sm font-bold' 
                        : 'border-sage-100 hover:border-sage-200 hover:bg-sage-50/20 text-ink-light bg-white'
                    }`}
                  >
                    <span className="text-2xl mb-1">{emoji}</span>
                    <span className="text-[10px] md:text-xs leading-none font-semibold">{text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Energy Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-bold text-ink-light uppercase tracking-widest flex items-center gap-1.5">
                <Battery size={14} className="text-sage-500" />
                <span>2. My Current Energy Level</span>
              </label>
              <span className="text-xs font-bold bg-sage-50 border border-sage-200/50 text-sage-700 px-2.5 py-0.5 rounded-full">
                {getEnergyLabel(energy)}
              </span>
            </div>
            <input
              id="energy-slider"
              type="range"
              min="1"
              max="5"
              step="1"
              value={energy}
              onChange={(e) => setEnergy(parseInt(e.target.value))}
              className="w-full h-2 bg-cream rounded-lg appearance-none cursor-pointer accent-sage-400"
            />
            <div className="flex justify-between text-[10px] text-ink-light/70 mt-1 px-1 font-semibold">
              <span>Exhausted (1)</span>
              <span>Full of life (5)</span>
            </div>
          </div>

          {/* Sleep Quality Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-bold text-ink-light uppercase tracking-widest flex items-center gap-1.5">
                <Moon size={14} className="text-lavender-500" />
                <span>3. Last Night's Sleep Quality</span>
              </label>
              <span className="text-xs font-bold bg-lavender-50 border border-lavender-200/50 text-lavender-700 px-2.5 py-0.5 rounded-full">
                {getSleepLabel(sleepQuality)}
              </span>
            </div>
            <input
              id="sleep-slider"
              type="range"
              min="1"
              max="5"
              step="1"
              value={sleepQuality}
              onChange={(e) => setSleepQuality(parseInt(e.target.value))}
              className="w-full h-2 bg-cream rounded-lg appearance-none cursor-pointer accent-lavender-400"
            />
            <div className="flex justify-between text-[10px] text-ink-light/70 mt-1 px-1 font-semibold">
              <span>Barely slept (1)</span>
              <span>Deeply rested (5)</span>
            </div>
          </div>

          {/* Daily Stress Level Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-bold text-ink-light uppercase tracking-widest flex items-center gap-1.5">
                <Heart size={14} className="text-coral-400" />
                <span>4. Today's Active Stress</span>
              </label>
              <span className="text-xs font-bold bg-coral-50 border border-coral-200/50 text-coral-600 px-2.5 py-0.5 rounded-full">
                {getStressLabel(stressLevel)}
              </span>
            </div>
            <input
              id="stress-slider"
              type="range"
              min="1"
              max="5"
              step="1"
              value={stressLevel}
              onChange={(e) => setStressLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-cream rounded-lg appearance-none cursor-pointer accent-coral-400"
            />
            <div className="flex justify-between text-[10px] text-ink-light/70 mt-1 px-1 font-semibold">
              <span>Overwhelming (1)</span>
              <span>Peaceful (5)</span>
            </div>
          </div>

          {/* Mind note */}
          <div>
            <label className="text-[10px] font-bold text-ink-light uppercase tracking-widest block mb-1.5">
              5. What's resting on your mind today? (Optional)
            </label>
            <textarea
              id="checkin-note-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Feel free to scribble down any worries, hopes, or simple thoughts..."
              rows={3}
              className="w-full bg-cream/40 border border-sage-200 focus:border-sage-400 focus:bg-white rounded-2xl p-3.5 text-sm text-ink placeholder-ink-light/50 outline-none transition-all resize-none font-medium"
            />
          </div>

          {error && (
            <p className="text-coral-500 text-xs text-center font-bold">
              {error}
            </p>
          )}

          {/* Controls */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 bg-cream hover:bg-sage-100/50 text-ink-light font-bold py-3.5 rounded-2xl transition-all cursor-pointer text-sm text-center border border-sage-100"
            >
              Cancel
            </button>
            <button
              id="submit-checkin-btn"
              type="submit"
              className="w-2/3 bg-sage-500 hover:bg-sage-600 active:scale-98 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-sage-500/10 hover:shadow-organic transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm"
            >
              <Sparkles size={16} />
              <span>Submit Check-In</span>
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
