import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Loader2, LogIn, Sparkles, ShieldAlert } from 'lucide-react';

interface InAppVerificationProps {
  status: 'verifying' | 'success' | 'error';
  errorMessage?: string;
  onContinue: () => void;
}

export default function InAppVerification({ status, errorMessage, onContinue }: InAppVerificationProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 md:p-6 select-none">
      <div className="w-full max-w-md bg-white border border-sage-200/60 rounded-[2rem] p-6 md:p-8 shadow-organic relative overflow-hidden">
        
        {/* Top brand-aligned color accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sage-300 via-lavender-300 to-coral-300" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center"
        >
          {status === 'verifying' && (
            <div className="py-6">
              {/* Spinner with soft pulsing accent rings */}
              <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-sage-100/40 animate-ping opacity-75" />
                <div className="w-16 h-16 rounded-3xl bg-sage-50 border border-sage-100 flex items-center justify-center text-sage-500 shadow-sm relative z-10">
                  <Loader2 size={32} className="animate-spin text-sage-500" />
                </div>
              </div>

              <h2 className="text-2xl font-serif font-semibold text-ink tracking-tight mb-3">
                Verifying Your Email
              </h2>
              <p className="text-sm text-ink-light/80 max-w-xs mx-auto leading-relaxed">
                Securing your connection and activating your recovery account. Just a moment...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-2">
              {/* Success Badge */}
              <div className="w-16 h-16 rounded-3xl bg-sage-50 border border-sage-100 flex items-center justify-center text-sage-500 mx-auto mb-6 shadow-sm relative">
                <CheckCircle2 size={32} className="text-sage-500" />
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="absolute -top-1.5 -right-1.5 text-coral-400 bg-white rounded-full p-1 border border-sage-100 shadow-sm"
                >
                  <Sparkles size={14} />
                </motion.div>
              </div>

              <h2 className="text-2xl font-serif font-semibold text-ink tracking-tight mb-3">
                Email Verified!
              </h2>
              
              <div className="bg-sage-50/50 border border-sage-100/80 rounded-2xl p-5 mb-6 text-left">
                <p className="text-ink-light text-xs leading-relaxed font-medium">
                  Your email address has been verified successfully. Your account is now fully active, and you are ready to begin your recovery journey.
                </p>
              </div>

              <button
                id="in-app-verify-success-btn"
                onClick={onContinue}
                className="w-full bg-sage-500 hover:bg-sage-600 active:scale-98 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-sage-500/10 hover:shadow-organic transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider font-sans"
              >
                <span>Enter Application</span>
                <LogIn size={16} />
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="py-2">
              {/* Error Badge */}
              <div className="w-16 h-16 rounded-3xl bg-coral-50 border border-coral-100 flex items-center justify-center text-coral-500 mx-auto mb-6 shadow-sm">
                <ShieldAlert size={32} className="text-coral-500" />
              </div>

              <h2 className="text-2xl font-serif font-semibold text-ink tracking-tight mb-3">
                Verification Failed
              </h2>

              <div className="bg-coral-50/30 border border-coral-100/60 rounded-2xl p-5 mb-6 text-left">
                <p className="text-ink-light text-xs leading-relaxed font-medium">
                  {errorMessage || "The verification link is invalid, expired, or has already been used."}
                </p>
              </div>

              <button
                id="in-app-verify-error-btn"
                onClick={onContinue}
                className="w-full bg-sage-500 hover:bg-sage-600 active:scale-98 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-sage-500/10 hover:shadow-organic transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider font-sans"
              >
                <span>Back to Login</span>
                <LogIn size={16} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
