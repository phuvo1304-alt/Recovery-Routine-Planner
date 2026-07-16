import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Mail, Lock, ArrowRight, LogIn, UserPlus, Eye, EyeOff, User, Chrome, AlertTriangle, Copy, Check } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthScreenProps {
  onAuthSuccess: () => void;
  onRegistrationSuccess: (email: string) => void;
}

export default function AuthScreen({ onAuthSuccess, onRegistrationSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isSignUp && !username.trim()) {
      setErrorMessage('Please enter a username.');
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password should be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(userCredential.user, { displayName: username.trim() });
        
        // Send email verification and sign out immediately so they do not log in automatically
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        
        onRegistrationSuccess(email.trim());
      } else {
        // Sign In Flow
        await signInWithEmailAndPassword(auth, email.trim(), password);
        onAuthSuccess();
      }
    } catch (error: any) {
      const errStr = String(error?.code || error?.message || error || '').toLowerCase();
      // Only console.error if it's an unexpected internal error (not standard user input validation failure)
      const isExpectedUserError = 
        errStr.includes('email-already-in-use') ||
        errStr.includes('email_already_in_use') ||
        errStr.includes('invalid-credential') ||
        errStr.includes('invalid_credential') ||
        errStr.includes('user-not-found') ||
        errStr.includes('wrong-password') ||
        errStr.includes('invalid-email') ||
        errStr.includes('weak-password');
      
      if (!isExpectedUserError) {
        console.error("Firebase auth unexpected error:", error);
      } else {
        console.warn("Firebase auth validation warning:", error?.message || error);
      }
      
      if (isSignUp) {
        if (errStr.includes('email-already-in-use') || errStr.includes('email_already_in_use')) {
          setErrorMessage('User already exists. Please sign in');
        } else {
          setErrorMessage(error?.message || 'An error occurred during registration.');
        }
      } else {
        if (
          errStr.includes('invalid-credential') || 
          errStr.includes('user-not-found') || 
          errStr.includes('wrong-password') ||
          errStr.includes('invalid-email') ||
          errStr.includes('invalid_credential')
        ) {
          setErrorMessage('Email or password is incorrect');
        } else {
          setErrorMessage(error?.message || 'An error occurred during sign-in.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setUnauthorizedDomain(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
      onAuthSuccess();
    } catch (error: any) {
      const errStr = String(error?.code || error?.message || error || '').toLowerCase();
      if (errStr.includes('auth/popup-closed-by-user')) {
        setErrorMessage('Sign-in cancelled. Please try again.');
      } else if (errStr.includes('unauthorized-domain') || errStr.includes('unauthorized_domain') || errStr.includes('auth/unauthorized-domain')) {
        setUnauthorizedDomain(window.location.hostname || 'localhost');
        setErrorMessage('This domain is not authorized in Firebase Console for Google Sign-In.');
      } else {
        console.error("Firebase Google sign-in unexpected error:", error);
        setErrorMessage(error?.message || 'Failed to sign in with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 md:p-6 select-none">
      <div className="w-full max-w-md bg-white border border-sage-200/60 rounded-[2rem] p-6 md:p-8 shadow-organic relative overflow-hidden">
        
        {/* Top colored accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sage-300 via-lavender-300 to-coral-300" />

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-sage-50 border border-sage-100 flex items-center justify-center text-sage-500 mx-auto mb-4">
            <Heart size={24} className="text-coral-400 fill-coral-400/10" />
          </div>
          <h2 className="text-2xl font-serif font-semibold text-ink tracking-tight leading-snug">
            {isSignUp ? 'Create Your Sanctuary' : 'Welcome to Your Sanctuary'}
          </h2>
          <p className="text-ink-light text-xs mt-2 leading-relaxed max-w-xs mx-auto">
            {isSignUp 
              ? 'Begin your gentle journey to recovery, self-care, and quiet reflection.' 
              : 'Sign in to access your daily recovery plan, journal, and chat.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={isSignUp ? 'signup' : 'signin'}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            onSubmit={handleAuth}
            className="space-y-4"
          >
            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-ink-light uppercase tracking-widest block">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light/50">
                  <User size={16} />
                </span>
                <input
                  id="auth-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter your username..."
                  required={isSignUp}
                  className="w-full bg-cream/40 border border-sage-200 hover:border-sage-300 focus:border-sage-400 focus:bg-white rounded-2xl py-3 pl-11 pr-4 text-ink placeholder-ink-light/40 text-xs outline-none transition-all font-semibold"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-ink-light uppercase tracking-widest block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light/50">
                  <Mail size={16} />
                </span>
                <input
                  id="auth-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter your email..."
                  required
                  className="w-full bg-cream/40 border border-sage-200 hover:border-sage-300 focus:border-sage-400 focus:bg-white rounded-2xl py-3 pl-11 pr-4 text-ink placeholder-ink-light/40 text-xs outline-none transition-all font-semibold"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-ink-light uppercase tracking-widest block">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light/50">
                  <Lock size={16} />
                </span>
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter your password..."
                  required
                  className="w-full bg-cream/40 border border-sage-200 hover:border-sage-300 focus:border-sage-400 focus:bg-white rounded-2xl py-3 pl-11 pr-12 text-ink placeholder-ink-light/40 text-xs outline-none transition-all font-semibold"
                />
                <button
                  id="toggle-password-visibility-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-light/50 hover:text-ink transition-colors cursor-pointer p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-coral-500 text-xs font-semibold mt-2 text-center"
                >
                  {errorMessage}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-sage-500 hover:bg-sage-600 disabled:bg-sage-300 active:scale-98 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-sage-500/10 hover:shadow-organic transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer text-xs uppercase tracking-wider"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                  {isSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-x-0 h-px bg-sage-100" />
              <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-ink-light/40">
                Or
              </span>
            </div>

            {/* Google Sign-In Button */}
            <button
              id="auth-google-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-sage-50 disabled:bg-sage-50 border border-sage-200 hover:border-sage-300 active:scale-98 text-ink-light font-bold py-3.5 px-6 rounded-2xl shadow-sm hover:shadow-organic transition-all flex items-center justify-center gap-2.5 cursor-pointer text-xs uppercase tracking-wider"
            >
              <Chrome size={16} className="text-sage-500" />
              <span>Continue with Google</span>
            </button>
          </motion.form>
        </AnimatePresence>

        {/* Unauthorized Domain Warning */}
        <AnimatePresence>
          {unauthorizedDomain && (
            <motion.div
              id="auth-domain-warning"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="p-4 bg-coral-50 border border-coral-100 rounded-2xl text-left space-y-3 overflow-hidden"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-coral-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-coral-800">Domain Needs Authorization</h4>
                  <p className="text-[11px] text-coral-700 leading-relaxed font-semibold">
                    Firebase requires you to add this domain to your Authorized Domains list to enable Google Sign-In:
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/90 border border-coral-100/60 rounded-xl p-2.5 justify-between">
                <code className="text-[10px] font-mono text-ink font-bold select-all break-all">
                  {unauthorizedDomain}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(unauthorizedDomain);
                    setCopiedDomain(true);
                    setTimeout(() => setCopiedDomain(false), 2000);
                  }}
                  className="bg-coral-100 hover:bg-coral-200 active:scale-95 text-coral-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1"
                >
                  {copiedDomain ? <Check size={11} /> : <Copy size={11} />}
                  <span>{copiedDomain ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-[10px] text-coral-600/90 leading-relaxed">
                <strong>How to fix:</strong> Go to your <strong>Firebase Console</strong> &gt; <strong>Authentication</strong> &gt; <strong>Settings</strong> &gt; <strong>Authorized domains</strong>, click <strong>Add domain</strong>, and paste the domain above.
              </p>

              <div className="text-center pt-1 border-t border-coral-100/40">
                <button
                  type="button"
                  onClick={() => setUnauthorizedDomain(null)}
                  className="text-[10px] font-bold text-coral-500 hover:text-coral-600 transition-colors cursor-pointer"
                >
                  Dismiss Warning
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle between Sign In / Sign Up */}
        <div className="mt-6 pt-4 border-t border-sage-100 text-center">
          <button
            id="auth-toggle-btn"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setShowPassword(false);
              setErrorMessage('');
            }}
            className="text-xs font-bold text-sage-600 hover:text-sage-700 transition-all hover:underline cursor-pointer"
          >
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account yet? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}
