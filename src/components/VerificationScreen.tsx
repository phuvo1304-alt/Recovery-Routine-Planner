import React from 'react';
import { motion } from 'motion/react';
import { Mail, LogIn, ArrowRight } from 'lucide-react';

interface VerificationScreenProps {
  email: string;
  onBackToLogin: () => void;
}

export default function VerificationScreen({ email, onBackToLogin }: VerificationScreenProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 md:p-6 select-none">
      <div className="w-full max-w-md bg-white border border-sage-200/60 rounded-[2rem] p-6 md:p-8 shadow-organic relative overflow-hidden">
        
        {/* Top colored accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sage-300 via-lavender-300 to-coral-300" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center"
        >
          {/* Email Icon wrapper with bounce animation */}
          <div className="w-16 h-16 rounded-3xl bg-sage-50 border border-sage-100 flex items-center justify-center text-sage-500 mx-auto mb-6 shadow-sm">
            <Mail size={28} className="text-sage-500 animate-pulse" />
          </div>

          <h2 className="text-2xl font-serif font-semibold text-ink tracking-tight leading-snug mb-4">
            Verify Your Email
          </h2>

          <div className="bg-cream/40 border border-sage-100 rounded-2xl p-5 mb-8 text-left">
            <p className="text-ink-light text-xs leading-relaxed font-medium">
              We have sent you a verification email to <span className="text-sage-700 font-bold underline decoration-sage-300/60">{email}</span>. Please verify it and log in.
            </p>
          </div>

          <div className="space-y-4">
            <button
              id="verification-login-btn"
              onClick={onBackToLogin}
              className="w-full bg-sage-500 hover:bg-sage-600 active:scale-98 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-sage-500/10 hover:shadow-organic transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
            >
              <span>Back to Login</span>
              <LogIn size={16} />
            </button>
            
            <p className="text-[11px] text-ink-light/60">
              Once you have clicked the link in your email, click the button above to log in.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
