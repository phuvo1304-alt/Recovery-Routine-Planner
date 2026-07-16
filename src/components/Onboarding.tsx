import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, User, Battery, Smile, Brain } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  defaultName?: string;
}

export default function Onboarding({ onComplete, defaultName = '' }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(defaultName);
  const [energy, setEnergy] = useState<'low' | 'fluctuating' | 'okay' | ''>('');
  const [drain, setDrain] = useState<'work' | 'overthinking' | 'sleep' | 'change' | ''>('');
  const [error, setError] = useState('');

  // Update name if defaultName changes asynchronously from auth
  useEffect(() => {
    if (defaultName && !name) {
      setName(defaultName);
    }
  }, [defaultName]);

  const handleNextStep1 = () => {
    if (!name.trim()) {
      setError("Please write down your name or a nickname so we know what to call you.");
      return;
    }
    setError('');
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!energy || !drain) {
      setError("Please answer both questions so we can tailor your daily steps gently.");
      return;
    }
    setError('');
    setStep(3);
  };

  const handleFinish = () => {
    const profile: UserProfile = {
      name: name.trim(),
      energyLevel: energy,
      mainDrain: drain,
      onboardingComplete: true
    };
    onComplete(profile);
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 md:p-6 select-none">
      <div className="w-full max-w-md bg-white border border-sage-200/60 rounded-[2rem] p-6 md:p-8 shadow-organic relative overflow-hidden">
        
        {/* Decorative subtle top colored bar to make it feel hand-crafted */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sage-300 via-lavender-300 to-coral-300" />

        {/* Step indicator bubbles */}
        <div className="flex justify-center gap-1.5 mb-8 mt-2">
          <div className={`h-2 rounded-full transition-all duration-300 ${step >= 1 ? 'w-8 bg-sage-400' : 'w-2 bg-sage-200/80'}`} />
          <div className={`h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'w-8 bg-sage-400' : 'w-2 bg-sage-200/80'}`} />
          <div className={`h-2 rounded-full transition-all duration-300 ${step >= 3 ? 'w-8 bg-sage-400' : 'w-2 bg-sage-200/80'}`} />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex flex-col"
            >
              <div className="w-12 h-12 rounded-2xl bg-sage-50 border border-sage-100 flex items-center justify-center text-sage-500 mb-5">
                <Sparkles size={22} />
              </div>
              
              <h2 className="text-3xl font-serif font-semibold text-ink tracking-tight leading-snug">
                Hello, traveler.
              </h2>
              <p className="text-ink-light text-sm mt-2.5 leading-relaxed font-medium">
                Welcome to your safe harbor. We're here to help you rest, slow down, and recover. To get started, what should we call you?
              </p>

              <div className="mt-6 relative">
                <label className="text-[10px] font-bold text-ink-light uppercase tracking-widest block mb-2">My Name / Nickname</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light/60">
                    <User size={18} />
                  </span>
                  <input
                    id="onboarding-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your name..."
                    className="w-full bg-cream/40 border border-sage-200 hover:border-sage-300 focus:border-sage-400 focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-ink placeholder-ink-light/50 text-sm outline-none transition-all"
                  />
                </div>
                {error && (
                  <p className="text-coral-500 text-xs mt-2.5 font-medium">
                    {error}
                  </p>
                )}
              </div>

              <button
                id="onboarding-step1-next"
                onClick={handleNextStep1}
                className="w-full bg-sage-500 hover:bg-sage-600 active:scale-98 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-sage-500/10 hover:shadow-organic transition-all flex items-center justify-center gap-2 mt-8 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex flex-col"
            >
              <h2 className="text-2xl font-serif font-semibold text-ink tracking-tight">
                Let's customize your space, {name}.
              </h2>
              <p className="text-ink-light text-xs mt-1.5 leading-relaxed font-medium">
                These short questions help us understand your baseline pace so we can give you realistic, tiny daily steps.
              </p>

              {/* Question 1: Energy Level */}
              <div className="mt-5">
                <span className="text-[10px] font-bold text-ink-light uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <Battery size={14} className="text-sage-500" />
                  <span>How has your energy been lately?</span>
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'low' as const, label: 'Low', desc: 'Drained, heavy' },
                    { value: 'fluctuating' as const, label: 'Fluctuating', desc: 'Up and down' },
                    { value: 'okay' as const, label: 'Okay', desc: 'Steady battery' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => {
                        setEnergy(item.value);
                        if (error) setError('');
                      }}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                        energy === item.value 
                          ? 'border-sage-400 bg-sage-50/70 text-sage-800 shadow-sm' 
                          : 'border-sage-100 hover:border-sage-200 text-ink bg-white'
                      }`}
                    >
                      <span className="text-sm font-bold">{item.label}</span>
                      <span className="text-[10px] text-ink-light/70 mt-0.5 leading-tight">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Main Drain */}
              <div className="mt-6">
                <span className="text-[10px] font-bold text-ink-light uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <Brain size={14} className="text-lavender-500" />
                  <span>What is draining you the most?</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'work' as const, label: 'Work / Study', sub: 'Burnout & demands' },
                    { value: 'overthinking' as const, label: 'Overthinking', sub: 'Mind racing, anxiety' },
                    { value: 'sleep' as const, label: 'Lack of Sleep', sub: 'Restlessness, insomnia' },
                    { value: 'change' as const, label: 'Life Changes', sub: 'Uncertainty, transition' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => {
                        setDrain(item.value);
                        if (error) setError('');
                      }}
                      className={`p-3 rounded-2xl border text-left flex flex-col cursor-pointer transition-all duration-200 ${
                        drain === item.value 
                          ? 'border-lavender-400 bg-lavender-50/70 text-lavender-800 shadow-sm' 
                          : 'border-sage-100 hover:border-sage-200 text-ink bg-white'
                      }`}
                    >
                      <span className="text-xs font-bold">{item.label}</span>
                      <span className="text-[10px] text-ink-light/70 mt-1 leading-tight">{item.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-coral-500 text-xs mt-4 font-medium">
                  {error}
                </p>
              )}

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-cream hover:bg-sage-100/50 text-ink-light font-bold py-3.5 rounded-2xl transition-all cursor-pointer text-sm border border-sage-100"
                >
                  Back
                </button>
                <button
                  id="onboarding-step2-next"
                  onClick={handleNextStep2}
                  className="w-2/3 bg-sage-500 hover:bg-sage-600 active:scale-98 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-sage-500/10 hover:shadow-organic transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <span>Almost Done</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex flex-col items-center text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-sage-50 border border-sage-100 flex items-center justify-center text-sage-600 mb-6 relative">
                <Smile size={32} />
                <motion.div 
                  className="absolute -top-1 -right-1 bg-coral-400 text-white p-1 rounded-full text-[10px]"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Sparkles size={12} />
                </motion.div>
              </div>

              <h2 className="text-3xl font-serif font-semibold text-ink tracking-tight">
                Welcome, {name}.
              </h2>
              
              <div className="my-5 bg-sage-50/50 border border-sage-200/50 rounded-2xl p-4 text-left max-w-sm">
                <p className="text-sage-800 text-sm leading-relaxed italic font-medium">
                  "We're so glad you're here. Let's take things one small step at a time. No giant leaps, no forced productivity. Just gentle healing."
                </p>
              </div>

              <p className="text-ink-light text-xs leading-relaxed max-w-xs px-2 mb-6 font-medium">
                Your routine space is now custom tailored for a gentle baseline. Tap below to step into your sanctuary.
              </p>

              <button
                id="onboarding-finish"
                onClick={handleFinish}
                className="w-full bg-sage-500 hover:bg-sage-600 active:scale-98 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-sage-500/10 hover:shadow-organic transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter My Sanctuary</span>
                <Sparkles size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
