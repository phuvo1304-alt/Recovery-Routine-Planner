import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home as HomeIcon, 
  BookOpen, 
  MessageCircle, 
  BarChart2, 
  Settings as SettingsIcon, 
  Heart, 
  Sparkles, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Award,
  Zap,
  RefreshCw,
  Sun,
  Smile,
  LogOut
} from 'lucide-react';

import { 
  UserProfile, 
  CheckIn, 
  RecoveryStep, 
  Routine, 
  JournalEntry, 
  ChatMessage 
} from './types';

import { 
  JOURNAL_PROMPTS, 
  DEFAULT_ROUTINES, 
  SEED_CHECK_INS, 
  SEED_JOURNAL_ENTRIES 
} from './seedData';

// Subcomponents
import Onboarding from './components/Onboarding';
import DailyCheckIn from './components/DailyCheckIn';
import BreathingSpace from './components/BreathingSpace';
import NoorChat from './components/NoorChat';
import AuthScreen from './components/AuthScreen';
import VerificationScreen from './components/VerificationScreen';

// Firebase import
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './firebase';

// Key for storage
const STORAGE_PREFIX = 'recovery_routine_';

export default function App() {
  // --- AUTH STATES ---
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  // --- CORE APP STATES ---
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    energyLevel: '',
    mainDrain: '',
    onboardingComplete: false
  });

  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'journal' | 'chat' | 'progress' | 'settings'>('home');
  
  // --- UI INTERACTIVE STATES ---
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showRoutineBuilder, setShowRoutineBuilder] = useState(false);
  const [activeRecoverySteps, setActiveRecoverySteps] = useState<RecoveryStep[]>([]);
  const [isBreathingSpaceOpen, setIsBreathingSpaceOpen] = useState(false);
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  
  // Custom states for double-confirmation data delete modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteTypedConfirm, setDeleteTypedConfirm] = useState('');
  
  // Custom To-Do task text
  const [customTaskText, setCustomTaskText] = useState('');

  // Confetti particles for micro-congratulation effect
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; tx: number; ty: number; color: string; size: number; shape: string; emoji?: string }[]>([]);
  
  // Toast notifications
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // Custom Routine Creator Form States
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineDesc, setNewRoutineDesc] = useState('');
  const [newRoutineSteps, setNewRoutineSteps] = useState<string[]>(['', '', '']);

  // Journal tab form states
  const [currentJournalPrompt, setCurrentJournalPrompt] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [expandedJournalId, setExpandedJournalId] = useState<string | null>(null);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Firebase authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Firebase user's displayName to profile name if set
  useEffect(() => {
    if (authUser && authUser.displayName && profile.name !== authUser.displayName) {
      setProfile(prev => {
        const updated = {
          ...prev,
          name: authUser.displayName || prev.name
        };
        // Use user-scoped profile key
        localStorage.setItem(`${STORAGE_PREFIX}${authUser.uid}_profile`, JSON.stringify(updated));
        return updated;
      });
    }
  }, [authUser, profile.name]);

  // Local storage auto-loader and seed injector
  useEffect(() => {
    if (!authUser) {
      // Clear core memory states if logged out so no state leaks
      setProfile({
        name: '',
        energyLevel: '',
        mainDrain: '',
        onboardingComplete: false
      });
      setCheckIns([]);
      setJournalEntries([]);
      setRoutines([]);
      setActiveRecoverySteps([]);
      return;
    }

    const uid = authUser.uid;

    // 1. Profile load
    const storedProfile = localStorage.getItem(`${STORAGE_PREFIX}${uid}_profile`);
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
      } catch (e) {
        console.error("Failed to parse profile", e);
        setProfile({
          name: authUser.displayName || '',
          energyLevel: '',
          mainDrain: '',
          onboardingComplete: false
        });
      }
    } else {
      setProfile({
        name: authUser.displayName || '',
        energyLevel: '',
        mainDrain: '',
        onboardingComplete: false
      });
    }

    // 2. Checkins load (completely blank state for new account!)
    const storedCheckIns = localStorage.getItem(`${STORAGE_PREFIX}${uid}_checkins`);
    if (storedCheckIns) {
      try {
        setCheckIns(JSON.parse(storedCheckIns));
      } catch (e) {
        setCheckIns([]);
      }
    } else {
      setCheckIns([]);
    }

    // 3. Journal entries load (completely blank state for new account!)
    const storedJournals = localStorage.getItem(`${STORAGE_PREFIX}${uid}_journals`);
    if (storedJournals) {
      try {
        setJournalEntries(JSON.parse(storedJournals));
      } catch (e) {
        setJournalEntries([]);
      }
    } else {
      setJournalEntries([]);
    }

    // 4. Routines load or default templates
    const storedRoutines = localStorage.getItem(`${STORAGE_PREFIX}${uid}_routines`);
    if (storedRoutines) {
      try {
        setRoutines(JSON.parse(storedRoutines));
      } catch (e) {
        setRoutines(DEFAULT_ROUTINES);
      }
    } else {
      setRoutines(DEFAULT_ROUTINES);
      localStorage.setItem(`${STORAGE_PREFIX}${uid}_routines`, JSON.stringify(DEFAULT_ROUTINES));
    }

    // 5. Active Recovery steps (today's checked tasks)
    const storedRecoverySteps = localStorage.getItem(`${STORAGE_PREFIX}${uid}_recovery_steps`);
    if (storedRecoverySteps) {
      try {
        setActiveRecoverySteps(JSON.parse(storedRecoverySteps));
      } catch (_) {
        setActiveRecoverySteps([]);
      }
    } else {
      setActiveRecoverySteps([]);
    }

    // Pick a random journal prompt
    rotateJournalPrompt();

    // Setup initial welcome chat message from Noor
    const initialWelcomeMsg: ChatMessage = {
      id: 'welcome-noor',
      sender: 'noor',
      text: "Hello! I am Noor, your gentle companion. How are you holding up today? I'm here to listen, or we can try a brief breathing space if you are feeling overwhelmed.",
      timestamp: Date.now()
    };
    setChatMessages([initialWelcomeMsg]);
  }, [authUser]);

  // Sync state to local storage helper
  const saveToLocalStorage = (key: string, data: any) => {
    if (authUser) {
      localStorage.setItem(`${STORAGE_PREFIX}${authUser.uid}_${key}`, JSON.stringify(data));
    } else {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
    }
  };

  // Toast trigger
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast({ message: '', visible: false });
    }, 4500);
  };

  // Check if check-in was completed today
  const hasCheckedInToday = (): boolean => {
    if (checkIns.length === 0) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return checkIns.some(c => c.date === todayStr);
  };

  // --- ACTIONS & MUTATORS ---

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveToLocalStorage('profile', newProfile);
    showToast(`Welcome, ${newProfile.name}. We're so glad you are here.`);
  };

  // Submit today's check-in
  const handleCheckInSubmit = (data: Omit<CheckIn, 'id' | 'date' | 'timestamp'>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Create new check-in
    const newCheckIn: CheckIn = {
      id: `checkin-${Date.now()}`,
      date: todayStr,
      timestamp: Date.now(),
      ...data
    };

    // Update list, replacing today's entry if already exists
    const filteredCheckIns = checkIns.filter(c => c.date !== todayStr);
    const updatedCheckIns = [newCheckIn, ...filteredCheckIns];
    setCheckIns(updatedCheckIns);
    saveToLocalStorage('checkins', updatedCheckIns);

    // Generate tailored recovery steps based on parameters
    const generated = generateDailySteps(newCheckIn);
    setActiveRecoverySteps(generated);
    saveToLocalStorage('recovery_steps', generated);

    setShowCheckInModal(false);
    showToast("Thank you for checking in with yourself today. Here is your tailored recovery plan.");
  };

  // Generate customized daily micro steps based on check-in levels
  const generateDailySteps = (checkIn: CheckIn): RecoveryStep[] => {
    const steps: RecoveryStep[] = [];
    
    if (checkIn.sleepQuality <= 2) {
      steps.push({
        id: 'step-sleep-low',
        text: 'Close all screens 30 minutes before sleep and rest your eyes in the dim light.',
        completed: false,
        category: 'sleep'
      });
    }
    
    if (checkIn.energy <= 2) {
      steps.push({
        id: 'step-energy-low',
        text: 'Sit quietly for 2 minutes with no expectations, letting your posture collapse comfortably.',
        completed: false,
        category: 'energy'
      });
    } else if (checkIn.energy === 3) {
      steps.push({
        id: 'step-energy-medium',
        text: 'Step away from your desk and complete a 2-minute soft shoulder roll or stretch.',
        completed: false,
        category: 'energy'
      });
    }
    
    if (checkIn.stressLevel <= 2) { // 1 is Overwhelming, 2 is high pressure in our slider scale
      steps.push({
        id: 'step-stress-high',
        text: 'Take 3 deep, slow breaths right now, holding the inhale and sighing out the exhale.',
        completed: false,
        category: 'stress'
      });
    } else if (checkIn.stressLevel === 3) {
      steps.push({
        id: 'step-stress-medium',
        text: 'Drink a slow, full glass of cool water, focusing entirely on the physical sensation.',
        completed: false,
        category: 'stress'
      });
    }

    // Fill up to guarantee 3 items
    const fallbacks: RecoveryStep[] = [
      { id: 'step-fb-water', text: 'Drink a slow glass of water to hydrate your tired brain cells.', completed: false, category: 'general' },
      { id: 'step-fb-horizon', text: 'Look out a window at the furthest visible point on the horizon for 1 minute.', completed: false, category: 'general' },
      { id: 'step-fb-appreciate', text: 'Offer yourself a silent, kind word: "I am doing the best I can right now."', completed: false, category: 'general' }
    ];

    let fallbackIndex = 0;
    while (steps.length < 3 && fallbackIndex < fallbacks.length) {
      const fb = fallbacks[fallbackIndex];
      if (!steps.some(s => s.id === fb.id || s.category === fb.category)) {
        steps.push(fb);
      }
      fallbackIndex++;
    }

    return steps.slice(0, 3);
  };

  // Trigger particle confetti celebration
  const triggerConfetti = () => {
    const emojis = ['✨', '💖', '🌟', '🌱', '🌸', '🥳', '🙌', '🎉', '💧', '☀️'];
    const colors = [
      '#A2B59F', // sage-400
      '#E2A499', // coral-300
      '#B4A7D6', // lavender-300
      '#E9C46A', // warm gold
      '#F4A261', // soft orange
      '#81B29A', // muted green
      '#E07A5F'  // terracota
    ];
    
    const newParticles = Array.from({ length: 40 }).map((_, i) => {
      const isEmoji = Math.random() < 0.25; // 25% chance of being an emoji
      const selectedEmoji = isEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : undefined;
      
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 120 + 40;
      
      return {
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 40,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance - 80,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: isEmoji ? Math.random() * 10 + 16 : Math.random() * 8 + 6,
        shape: ['circle', 'square', 'star', 'rotate-square'][Math.floor(Math.random() * 4)],
        emoji: selectedEmoji
      };
    });

    setConfetti(prev => [...prev, ...newParticles]);

    // Clean up particles
    setTimeout(() => {
      setConfetti(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1500);
  };

  // Toggle step complete
  const toggleRecoveryStep = (stepId: string) => {
    const updated = activeRecoverySteps.map(step => {
      if (step.id === stepId) {
        const nextState = !step.completed;
        if (nextState) {
          // Toast message pool
          const toasts = [
            "A small step is still progress. Proud of you.",
            "Taking care of yourself is a brave choice.",
            "Every tiny step counts. You are doing wonderfully.",
            "Gently pacing yourself is the path to healing."
          ];
          const randomToast = toasts[Math.floor(Math.random() * toasts.length)];
          showToast(randomToast);
          triggerConfetti();
        }
        return { ...step, completed: nextState };
      }
      return step;
    });
    setActiveRecoverySteps(updated);
    saveToLocalStorage('recovery_steps', updated);
  };

  // Add custom to-do task
  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTaskText.trim()) return;

    const newTask: RecoveryStep = {
      id: `custom-task-${Date.now()}`,
      text: customTaskText.trim(),
      completed: false,
      category: 'general'
    };

    const updated = [...activeRecoverySteps, newTask];
    setActiveRecoverySteps(updated);
    saveToLocalStorage('recovery_steps', updated);
    setCustomTaskText('');
    showToast("Added custom task to today's plan.");
  };

  // Delete active step (custom or generated)
  const handleDeleteActiveStep = (stepId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering check-off when deleting
    const updated = activeRecoverySteps.filter(step => step.id !== stepId);
    setActiveRecoverySteps(updated);
    saveToLocalStorage('recovery_steps', updated);
    showToast("Task removed from today's plan.");
  };

  // --- ROUTINE BUILDER METHODS ---

  const activateRoutine = (routineId: string) => {
    const updated = routines.map(r => ({
      ...r,
      isActive: r.id === routineId
    }));
    setRoutines(updated);
    saveToLocalStorage('routines', updated);
    
    const active = updated.find(r => r.id === routineId);
    if (active) {
      const mappedSteps: RecoveryStep[] = active.steps.map((st, index) => ({
        id: `routine-${routineId}-${index}`,
        text: st,
        completed: false,
        category: 'general'
      }));
      setActiveRecoverySteps(mappedSteps);
      saveToLocalStorage('recovery_steps', mappedSteps);
      showToast(`Activated: ${active.name}. The steps have been prepped.`);
    }
  };

  const handleCreateCustomRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineName.trim()) {
      showToast("Please provide a name for your custom routine.");
      return;
    }

    const steps = newRoutineSteps.map(s => s.trim()).filter(s => s !== '');
    if (steps.length === 0) {
      showToast("Please enter at least one actionable recovery step.");
      return;
    }

    const newRoutine: Routine = {
      id: `custom-routine-${Date.now()}`,
      name: newRoutineName.trim(),
      description: newRoutineDesc.trim() || 'My customized recovery micro-routine',
      steps,
      isCustom: true,
      isActive: false
    };

    const updated = [...routines, newRoutine];
    setRoutines(updated);
    saveToLocalStorage('routines', updated);

    // Reset fields
    setNewRoutineName('');
    setNewRoutineDesc('');
    setNewRoutineSteps(['', '', '']);
    setShowRoutineBuilder(false);
    showToast("Your custom recovery routine has been created! You can now activate it.");
  };

  const handleUpdateStepInput = (index: number, val: string) => {
    const copy = [...newRoutineSteps];
    copy[index] = val;
    setNewRoutineSteps(copy);
  };

  const handleAddStepField = () => {
    if (newRoutineSteps.length < 6) {
      setNewRoutineSteps([...newRoutineSteps, '']);
    } else {
      showToast("Keeping routines under 6 steps is gentler on your battery.");
    }
  };

  const handleDeleteRoutine = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid activating when clicking delete
    const updated = routines.filter(r => r.id !== id);
    setRoutines(updated);
    saveToLocalStorage('routines', updated);
    showToast("Routine gently removed.");
  };

  // --- REFLECTION JOURNAL METHODS ---

  const rotateJournalPrompt = () => {
    const randomPrompt = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
    setCurrentJournalPrompt(randomPrompt);
  };

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalContent.trim()) {
      showToast("Please write down what is on your mind before saving.");
      return;
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = new Date();
    const dateStr = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

    const entry: JournalEntry = {
      id: `journal-${Date.now()}`,
      prompt: currentJournalPrompt,
      content: journalContent.trim(),
      date: dateStr,
      timestamp: Date.now()
    };

    const updated = [entry, ...journalEntries];
    setJournalEntries(updated);
    saveToLocalStorage('journals', updated);

    setJournalContent('');
    rotateJournalPrompt();
    showToast("Your thoughts have been gently put to rest and saved securely.");
  };

  const handleDeleteJournal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = journalEntries.filter(entry => entry.id !== id);
    setJournalEntries(updated);
    saveToLocalStorage('journals', updated);
    showToast("Journal entry removed.");
  };

  // --- EMPATHETIC CHATBOT ("Noor") METHODS ---

  const handleSendChatMessage = async (text: string) => {
    // 1. Add user message
    const userMsg: ChatMessage = {
      id: `chat-msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now()
    };
    
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);

    // Check for extreme crisis keywords immediately for safety
    const lowerText = text.toLowerCase();
    const isCrisis = ["suicide", "kill myself", "end my life", "want to die", "self-harm", "hurt myself"].some(
      keyword => lowerText.includes(keyword)
    );

    if (isCrisis) {
      setIsCrisisOpen(true);
      // Log a system message noting safety protocol activation
      setChatMessages(prev => [...prev, {
        id: `sys-msg-${Date.now()}`,
        sender: 'system',
        text: "Crisis protocol triggered. Please reach out to real support lines below.",
        timestamp: Date.now()
      }]);
      return;
    }

    setIsChatTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: updatedMessages,
          userName: profile.name || "friend"
        })
      });

      if (!response.ok) {
        throw new Error('Chat API error');
      }

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: `chat-msg-noor-${Date.now()}`,
        sender: 'noor',
        text: data.text || "I'm here, listening gently.",
        timestamp: Date.now(),
        suggestions: data.suggestions || []
      };

      setChatMessages(prev => [...prev, botMsg]);

      if (data.isCrisis) {
        setIsCrisisOpen(true);
      }
    } catch (err) {
      console.error("Error communicating with chat API:", err);
      // Fallback
      const botMsg: ChatMessage = {
        id: `chat-msg-noor-fallback-${Date.now()}`,
        sender: 'noor',
        text: "I am right here holding space with you. I had a tiny glitch in my thoughts, but please take a deep breath. You are doing enough.",
        timestamp: Date.now(),
        suggestions: ["Try 1-Min Breathing Space", "Let's sit in quiet"]
      };
      setChatMessages(prev => [...prev, botMsg]);
    } finally {
      setIsChatTyping(false);
    }
  };

  // --- BREATHING SPACE COMPLETE ---
  const handleBreathingComplete = () => {
    setIsBreathingSpaceOpen(false);
    
    // Add check-in score helper or give a pleasant reward note
    showToast("Well done. Taking a moment to pause is a profound gift of self-compassion.");
    
    // Add check-in event implicitly to log history if they want
    const todayStr = new Date().toISOString().split('T')[0];
    if (checkIns.length === 0 || !checkIns.some(c => c.date === todayStr)) {
      // Create a small placeholder okay check-in so they don't look uncompleted
      const implicitCheckIn: CheckIn = {
        id: `checkin-breath-${Date.now()}`,
        date: todayStr,
        timestamp: Date.now(),
        mood: '😌 Calm',
        energy: 3,
        sleepQuality: 3,
        stressLevel: 4, // peaceful is 5, manageable is 4
        note: 'Completed a 1-minute deep breathing session.'
      };
      
      const updated = [implicitCheckIn, ...checkIns];
      setCheckIns(updated);
      saveToLocalStorage('checkins', updated);
    }
  };

  // --- SYSTEM UTILS ---

  const handleClearAllData = () => {
    if (authUser) {
      const uid = authUser.uid;
      localStorage.removeItem(`${STORAGE_PREFIX}${uid}_profile`);
      localStorage.removeItem(`${STORAGE_PREFIX}${uid}_checkins`);
      localStorage.removeItem(`${STORAGE_PREFIX}${uid}_journals`);
      localStorage.removeItem(`${STORAGE_PREFIX}${uid}_routines`);
      localStorage.removeItem(`${STORAGE_PREFIX}${uid}_recovery_steps`);
    } else {
      localStorage.clear();
    }
    // Reset profile
    setProfile({
      name: '',
      energyLevel: '',
      mainDrain: '',
      onboardingComplete: false
    });
    // Reset state
    setCheckIns([]);
    setJournalEntries([]);
    setRoutines(DEFAULT_ROUTINES);
    setActiveRecoverySteps([]);
    setChatMessages([{
      id: 'welcome-noor',
      sender: 'noor',
      text: "Hello! I am Noor, your gentle companion. How are you holding up today? I'm here to listen.",
      timestamp: Date.now()
    }]);
    setActiveTab('home');
    setShowDeleteConfirm(false);
    setDeleteStep(1);
    setDeleteTypedConfirm('');
    showToast("Sanctuary data cleared with care. Welcome to a fresh start.");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast("Signed out gently. Return when you need space.");
    } catch (e) {
      console.error("Logout failed:", e);
      showToast("Could not sign out. Please try again.");
    }
  };

  const getGreeting = (name: string) => {
    const hour = new Date().getHours();
    if (hour < 5) return `Rest gently, ${name}`;
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    if (hour < 22) return `Good evening, ${name}`;
    return `Sleep well tonight, ${name}`;
  };

  // Render loading screen if auth status is being loaded
  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Heart size={32} className="text-coral-400 animate-pulse fill-coral-400/10" />
          <p className="text-xs text-ink-light font-semibold">Creating space for you...</p>
        </div>
      </div>
    );
  }

  const handleAuthSuccess = async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload();
        setAuthUser({ ...auth.currentUser });
      } catch (e) {
        console.error("Failed to reload user on auth success:", e);
        setAuthUser(auth.currentUser);
      }
    }
    showToast("Signed in successfully.");
  };

  const isEmailUnverified = authUser && !authUser.emailVerified;

  if (unverifiedEmail || isEmailUnverified) {
    const displayEmail = unverifiedEmail || (authUser ? authUser.email : '');
    return (
      <VerificationScreen
        email={displayEmail || ''}
        onBackToLogin={async () => {
          setUnverifiedEmail(null);
          if (auth.currentUser) {
            await signOut(auth);
          }
        }}
      />
    );
  }

  // Render authentication screen if user is not logged in
  if (!authUser) {
    return (
      <AuthScreen 
        onAuthSuccess={handleAuthSuccess} 
        onRegistrationSuccess={(email) => setUnverifiedEmail(email)} 
      />
    );
  }

  // Render onboarding screen if logged in but profile is not completed
  if (!profile.onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} defaultName={authUser?.displayName || ''} />;
  }

  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col items-center">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm bg-gray-900 text-white rounded-2xl px-5 py-3.5 shadow-xl text-xs font-semibold leading-relaxed flex items-center gap-2.5 border border-white/10"
          >
            <Sparkles size={16} className="text-sage-300 shrink-0" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Core Container */}
      <div className="w-full max-w-md md:max-w-lg bg-cream flex flex-col min-h-screen relative pb-28">
        
        {/* TOP STATUS BAR ACCENT */}
        <header className="px-5 pt-6 pb-2 flex justify-between items-center bg-transparent z-10 select-none">
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-coral-400 fill-coral-400/20" />
            <h1 className="text-base font-serif font-bold text-ink tracking-tight">Recovery Routine Planner</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              id="settings-gear-btn"
              onClick={() => setActiveTab(activeTab === 'settings' ? 'home' : 'settings')}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                activeTab === 'settings' 
                  ? 'border-sage-300 bg-sage-50 text-sage-700' 
                  : 'border-sage-200/60 hover:border-sage-300 text-ink-light bg-white shadow-sm'
              }`}
              title="Settings"
            >
              <SettingsIcon size={18} />
            </button>
            
            <button 
              id="logout-btn"
              onClick={handleLogout}
              className="p-2 rounded-full border border-coral-200/60 hover:border-coral-300 text-coral-500 bg-white hover:bg-coral-50/50 shadow-sm transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Dynamic content render */}
        <main className="flex-1 px-5 py-2">
          
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Empathy Welcome Card */}
              <div className="bg-white border border-sage-200/60 rounded-[2rem] p-6 relative overflow-hidden shadow-organic">
                {/* Visual color bar banner to represent pottery/culture */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sage-300 via-lavender-300 to-coral-300" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold text-sage-600 uppercase tracking-widest bg-sage-50 border border-sage-100 px-2.5 py-1 rounded-full">
                    Slowing Down
                  </span>
                  <h2 id="home-greeting-title" className="text-2xl font-serif font-semibold text-ink tracking-tight mt-3.5">
                    {getGreeting(profile.name)}
                  </h2>
                  <p className="text-ink-light text-xs mt-1.5 leading-relaxed font-semibold">
                    You don't need to finish everything. Today is about finding a tiny space to restore your peace.
                  </p>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2.5 mt-5">
                    <button
                      id="check-in-btn"
                      onClick={() => setShowCheckInModal(true)}
                      className="flex-1 bg-sage-500 hover:bg-sage-600 active:scale-98 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-sage-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Smile size={15} />
                      <span>{hasCheckedInToday() ? "Check-In Again" : "Check in with yourself"}</span>
                    </button>
                    <button
                      id="launch-breathing-btn"
                      onClick={() => setIsBreathingSpaceOpen(true)}
                      className="bg-white hover:bg-gray-50 text-sage-700 border border-sage-100 active:scale-98 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles size={15} className="text-sage-500" />
                      <span>Breathing Space</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION: TODAY'S RECOVERY PLAN (3 DYNAMIC MICRO-STEPS) */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[10px] font-bold text-ink-light uppercase tracking-widest">
                    Today's Recovery Plan
                  </h3>
                  {activeRecoverySteps.length > 0 && (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-2.5 py-0.5 rounded-full animate-pulse">
                      Plan Active
                    </span>
                  )}
                </div>

                {activeRecoverySteps.length === 0 ? (
                  <div className="bg-white border border-dashed border-sage-200 rounded-[2rem] p-6 text-center shadow-organic space-y-4">
                    <p className="text-ink-light/80 text-xs leading-relaxed max-w-xs mx-auto font-semibold">
                      "Each day has its own battery." Complete your conversational check-in to generate tailored steps, select a Routine Template below, or add your own custom tasks.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-1">
                      <button
                        onClick={() => setShowCheckInModal(true)}
                        className="bg-sage-50 hover:bg-sage-100 active:scale-98 text-sage-700 font-bold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1 border border-sage-200/60"
                      >
                        <span>Begin check-in</span>
                      </button>
                    </div>

                    {/* Inline custom task addition when empty */}
                    <div className="border-t border-sage-100 pt-4 max-w-xs mx-auto">
                      <p className="text-[10px] font-bold text-ink-light uppercase tracking-widest text-center mb-2">
                        Or draft a task right now
                      </p>
                      <form onSubmit={handleAddCustomTask} className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="What would you like to do today?"
                          value={customTaskText}
                          onChange={(e) => setCustomTaskText(e.target.value)}
                          className="flex-1 bg-cream/40 border border-sage-200 focus:border-sage-400 focus:bg-white text-xs rounded-xl px-3.5 py-2.5 text-ink outline-none transition-all font-semibold placeholder-ink-light/50"
                        />
                        <button
                          type="submit"
                          className="bg-sage-500 hover:bg-sage-600 text-white p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-md shadow-sage-500/10"
                          title="Add task"
                        >
                          <Plus size={16} />
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-sage-200/60 rounded-[2rem] p-5 space-y-3.5 shadow-organic">
                    <div className="space-y-3">
                      {activeRecoverySteps.map((step) => (
                        <div 
                          key={step.id} 
                          onClick={() => toggleRecoveryStep(step.id)}
                          className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer group relative ${
                            step.completed 
                              ? 'border-sage-100 bg-sage-50/40 opacity-70' 
                              : 'border-sage-100 hover:border-sage-300 bg-white shadow-sm'
                          }`}
                        >
                          <div className={`mt-0.5 rounded-full p-0.5 transition-all ${
                            step.completed ? 'text-sage-500 bg-sage-100' : 'text-gray-300'
                          }`}>
                            <CheckCircle size={18} className={step.completed ? 'fill-sage-500 text-white' : ''} />
                          </div>
                          <div className="flex-1 pr-6 text-left">
                            <p className={`text-xs font-semibold leading-relaxed ${
                              step.completed ? 'line-through text-gray-400 font-normal' : 'text-gray-700'
                            }`}>
                              {step.text}
                            </p>
                            <span className="text-[9px] text-sage-600 font-bold uppercase mt-1 inline-block bg-sage-50 px-1.5 py-0.2 rounded border border-sage-100/50">
                              {step.category} pacing
                            </span>
                          </div>

                          {/* Delete button for task */}
                          <button
                            onClick={(e) => handleDeleteActiveStep(step.id, e)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-ink-light/20 hover:text-coral-500 hover:bg-coral-50/50 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Remove task"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-[10px] text-ink-light/70 text-center font-bold pt-1">
                      Check off steps when you complete them. No pressure to finish all of them.
                    </p>

                    {/* Add Custom Task Form at bottom of active list */}
                    <form onSubmit={handleAddCustomTask} className="flex gap-2 pt-3 border-t border-sage-100 mt-2">
                      <input 
                        type="text"
                        placeholder="Add another custom task..."
                        value={customTaskText}
                        onChange={(e) => setCustomTaskText(e.target.value)}
                        className="flex-1 bg-cream/40 border border-sage-200 focus:border-sage-400 focus:bg-white text-xs rounded-xl px-3.5 py-2.5 text-ink outline-none transition-all font-semibold placeholder-ink-light/50"
                      />
                      <button
                        type="submit"
                        className="bg-sage-500 hover:bg-sage-600 text-white p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-md shadow-sage-500/10"
                        title="Add task"
                      >
                        <Plus size={16} />
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* SECTION: ROUTINE BUILDER */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[10px] font-bold text-ink-light uppercase tracking-widest">
                    Routine Pacing Templates
                  </h3>
                  <button 
                    id="open-routine-builder-btn"
                    onClick={() => setShowRoutineBuilder(!showRoutineBuilder)}
                    className="text-[10px] font-bold text-sage-600 bg-sage-50 hover:bg-sage-100 border border-sage-200/50 px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus size={11} />
                    <span>Create Custom</span>
                  </button>
                </div>

                {/* Custom Creator Form Panel */}
                <AnimatePresence>
                  {showRoutineBuilder && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-4"
                    >
                      <form onSubmit={handleCreateCustomRoutine} className="bg-white border border-sage-200/60 rounded-[2rem] p-5 space-y-4 shadow-organic">
                        <div className="flex justify-between items-center border-b border-sage-100 pb-2.5">
                          <h4 className="font-serif font-semibold text-ink text-sm">New Custom Routine</h4>
                          <button 
                            type="button"
                            onClick={() => setShowRoutineBuilder(false)}
                            className="text-ink-light hover:text-ink text-xs cursor-pointer font-bold"
                          >
                            Close
                          </button>
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-ink-light uppercase tracking-widest block mb-1.5">Routine Name</label>
                          <input 
                            id="custom-routine-name-input"
                            type="text" 
                            placeholder="e.g., Sunday Dusk Settle" 
                            value={newRoutineName}
                            onChange={(e) => setNewRoutineName(e.target.value)}
                            className="w-full bg-cream/40 border border-sage-200 focus:border-sage-400 focus:bg-white text-xs rounded-xl px-3 py-2 text-ink outline-none transition-all font-semibold"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-ink-light uppercase tracking-widest block mb-1.5">Brief Description</label>
                          <input 
                            type="text" 
                            placeholder="e.g., Steps to disengage from active worry" 
                            value={newRoutineDesc}
                            onChange={(e) => setNewRoutineDesc(e.target.value)}
                            className="w-full bg-cream/40 border border-sage-200 focus:border-sage-400 focus:bg-white text-xs rounded-xl px-3 py-2 text-ink outline-none transition-all font-semibold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-ink-light uppercase tracking-widest block">Action Steps (Up to 6)</label>
                          {newRoutineSteps.map((stepText, idx) => (
                            <input 
                              key={idx}
                              id={`custom-step-input-${idx}`}
                              type="text" 
                              placeholder={`Step ${idx + 1}`} 
                              value={stepText}
                              onChange={(e) => handleUpdateStepInput(idx, e.target.value)}
                              className="w-full bg-cream/40 border border-sage-200 focus:border-sage-400 focus:bg-white text-xs rounded-xl px-3 py-2 text-ink outline-none transition-all font-semibold mb-1"
                            />
                          ))}

                          {newRoutineSteps.length < 6 && (
                            <button
                              type="button"
                              onClick={handleAddStepField}
                              className="text-[10px] text-sage-600 font-bold hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                            >
                              <Plus size={10} />
                              <span>Add another micro-step</span>
                            </button>
                          )}
                        </div>

                        <button 
                          id="submit-custom-routine-btn"
                          type="submit"
                          className="w-full bg-sage-500 hover:bg-sage-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          Save Custom Routine
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Routines Grid */}
                <div className="grid grid-cols-1 gap-3.5">
                  {routines.map((routine) => (
                    <div 
                      key={routine.id}
                      onClick={() => activateRoutine(routine.id)}
                      className={`p-5 rounded-[2rem] border transition-all cursor-pointer text-left relative overflow-hidden shadow-organic hover:shadow-organic-hover ${
                        routine.isActive 
                          ? 'border-sage-400 bg-sage-50/40' 
                          : 'border-sage-200/50 bg-white hover:border-sage-300'
                      }`}
                    >
                      {routine.isActive && (
                        <div className="absolute top-0 right-0 bg-sage-400 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                          Active Plan
                        </div>
                      )}

                      <h4 className="text-sm font-serif font-bold text-ink flex items-center gap-1.5">
                        <span>{routine.name}</span>
                        {routine.isCustom && (
                          <span className="text-[8px] font-bold text-lavender-700 bg-lavender-50 border border-lavender-200/50 px-1.5 py-0.2 rounded">
                            Custom
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-ink-light leading-relaxed mt-1 max-w-[85%] font-medium">
                        {routine.description}
                      </p>

                      {/* Display Steps preview */}
                      <div className="mt-3.5 space-y-1.5 border-t border-sage-100 pt-3">
                        {routine.steps.map((st, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] text-ink-light font-semibold">
                            <span className="w-4 h-4 rounded-full bg-sage-100 flex items-center justify-center font-bold text-sage-700 text-[8px]">
                              {i + 1}
                            </span>
                            <span className="truncate leading-tight">{st}</span>
                          </div>
                        ))}
                      </div>

                      {/* Delete button for custom routines */}
                      {routine.isCustom && (
                        <button
                          id={`delete-routine-${routine.id}`}
                          onClick={(e) => handleDeleteRoutine(routine.id, e)}
                          className="absolute bottom-4 right-4 p-1.5 rounded-full hover:bg-coral-50 text-ink-light/40 hover:text-coral-500 transition-colors cursor-pointer"
                          title="Delete Custom Routine"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: JOURNAL (REFLECTION JOURNAL) */}
          {activeTab === 'journal' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center py-2 select-none">
                <span className="text-[10px] font-bold text-lavender-600 bg-lavender-50 border border-lavender-200/50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  Reflection Haven
                </span>
                <p className="text-ink-light text-xs mt-2 max-w-sm mx-auto font-semibold">
                  A quiet, safe workspace to offload thoughts from your mind. Your journal entries are kept strictly secure on your device.
                </p>
              </div>

              {/* Minimalist writing prompt card */}
              <form onSubmit={handleSaveJournal} className="bg-white border border-lavender-200/60 rounded-[2rem] p-5 shadow-organic space-y-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="space-y-1 text-left">
                    <span className="text-[9px] font-bold text-lavender-500 uppercase tracking-widest">Active Prompt</span>
                    <h4 id="active-journal-prompt" className="text-base font-serif font-semibold text-ink leading-snug">
                      {currentJournalPrompt}
                    </h4>
                  </div>
                  <button 
                    id="rotate-prompt-btn"
                    type="button"
                    onClick={rotateJournalPrompt}
                    className="p-1.5 rounded-full hover:bg-lavender-50 text-lavender-500 transition-colors shrink-0 cursor-pointer"
                    title="Change prompt"
                  >
                    <RefreshCw size={14} className="animate-spin-slow" />
                  </button>
                </div>

                <textarea
                  id="journal-content-textarea"
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="Breathe in... Write freely and gently with no expectations..."
                  rows={4}
                  className="w-full bg-cream/30 border border-lavender-200 focus:border-lavender-400 focus:bg-white rounded-2xl p-4 text-xs text-ink placeholder-ink-light/50 outline-none transition-all resize-none leading-relaxed font-medium"
                />

                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-ink-light font-semibold">
                    {journalContent.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                  <button
                    id="save-journal-btn"
                    type="submit"
                    className="bg-lavender-400 hover:bg-lavender-500 active:scale-98 text-white font-bold py-2.5 px-5 rounded-2xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 hover:shadow-organic border border-transparent"
                  >
                    <Heart size={12} className="fill-white/10" />
                    <span>Save Gently</span>
                  </button>
                </div>
              </form>

              {/* Past entries catalog */}
              <div>
                <h3 className="text-[10px] font-bold text-ink-light uppercase tracking-widest mb-3">
                  Past Reflections
                </h3>

                {journalEntries.length === 0 ? (
                  <div className="bg-white border border-dashed border-sage-200 rounded-[2rem] p-6 text-center shadow-organic">
                    <p className="text-ink-light/80 text-xs font-semibold">
                      No saved journal notes yet. Feel free to draft your very first entry above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {journalEntries.map((entry) => {
                      const isExpanded = expandedJournalId === entry.id;
                      return (
                        <div 
                          key={entry.id}
                          id={`journal-card-${entry.id}`}
                          onClick={() => setExpandedJournalId(isExpanded ? null : entry.id)}
                          className="bg-white border border-sage-100 rounded-2xl p-4.5 transition-all hover:border-lavender-200/50 cursor-pointer shadow-organic text-left relative"
                        >
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <Calendar size={11} className="text-lavender-400" />
                                <span className="text-[10px] font-bold text-ink-light">{entry.date}</span>
                              </div>
                              <h4 className="text-sm font-serif font-bold text-ink leading-tight mt-1">
                                {entry.prompt}
                              </h4>
                            </div>
                            
                            <span className="text-ink-light shrink-0">
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </span>
                          </div>

                          <p className={`text-[11px] text-ink-light leading-relaxed font-semibold ${isExpanded ? 'whitespace-pre-line' : 'line-clamp-2'}`}>
                            {entry.content}
                          </p>

                          {isExpanded && (
                            <div className="mt-3.5 pt-3 border-t border-sage-100 flex justify-end">
                              <button
                                id={`delete-journal-btn-${entry.id}`}
                                onClick={(e) => handleDeleteJournal(entry.id, e)}
                                className="text-[9px] text-coral-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 size={10} />
                                <span>Delete with care</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: CHAT (NOOR) */}
          {activeTab === 'chat' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <NoorChat 
                userName={profile.name}
                chatMessages={chatMessages}
                onSendMessage={handleSendChatMessage}
                onOpenBreathingSpace={() => setIsBreathingSpaceOpen(true)}
                onOpenCrisisResources={() => setIsCrisisOpen(true)}
                isTyping={isChatTyping}
              />
            </motion.div>
          )}

          {/* TAB 4: PROGRESS */}
          {activeTab === 'progress' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center py-2 select-none">
                <span className="text-[10px] font-bold text-coral-500 bg-coral-50 border border-coral-200/50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  My Gentle Pacing
                </span>
                <p className="text-ink-light text-xs mt-2 max-w-sm mx-auto font-semibold">
                  A comforting look at your commitment to restorative care. We believe in gentle tracking, completely free of shame or guilt.
                </p>
              </div>

              {/* Progress Summary Card */}
              <div className="bg-white border border-coral-200/60 rounded-[2rem] p-5 shadow-organic text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-coral-400">
                  <Award size={80} />
                </div>
                
                <span className="text-[9px] font-bold text-coral-500 uppercase tracking-widest">Weekly Consistency</span>
                <h3 className="text-lg font-serif font-bold text-ink leading-tight mt-1.5">
                  You showed up for yourself this week.
                </h3>
                
                {/* Horizontal simple progress representation */}
                <div className="mt-4 flex gap-1.5 h-3">
                  {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                    // check if we have any seed checks or logs matching count
                    const hasCheck = checkIns.length >= dayNum;
                    return (
                      <div 
                        key={dayNum}
                        className={`flex-1 rounded-full ${
                          hasCheck ? 'bg-gradient-to-r from-coral-400 to-coral-300' : 'bg-cream'
                        }`}
                        title={hasCheck ? 'Check-in logged' : 'Rest day'}
                      />
                    );
                  })}
                </div>

                <div className="flex justify-between items-center mt-3 text-[10px] text-ink-light font-bold">
                  <span>{checkIns.length} active logs logged</span>
                  <span>Keep going at your pace</span>
                </div>

                <div className="mt-4 border-t border-coral-100 pt-3.5">
                  <p className="text-[11px] text-coral-600 font-semibold leading-relaxed italic">
                    "Every day you log is a reminder that you prioritized your healing. If you miss a day, it just means you were busy breathing. That counts, too."
                  </p>
                </div>
              </div>

              {/* Parameter Metrics: Energy and Sleep averages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Sleep Metrics Card */}
                <div className="bg-white border border-sage-200/50 rounded-[2rem] p-5 shadow-organic text-left">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-lavender-500 uppercase tracking-widest">Sleep Quality Average</span>
                    <TrendingUp size={14} className="text-lavender-400" />
                  </div>
                  
                  {/* Calculate average */}
                  {(() => {
                    const avg = checkIns.length > 0 
                      ? (checkIns.reduce((sum, item) => sum + item.sleepQuality, 0) / checkIns.length).toFixed(1)
                      : "0.0";
                    const pct = (parseFloat(avg) / 5) * 100;
                    
                    return (
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span id="sleep-avg-value" className="text-3xl font-serif font-bold text-ink">{avg}</span>
                          <span className="text-xs text-ink-light">/ 5</span>
                        </div>
                        <div className="w-full bg-cream rounded-full h-1.5 mt-3">
                          <div 
                            className="bg-lavender-400 h-1.5 rounded-full" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-ink-light mt-2.5 leading-snug font-semibold">
                          {parseFloat(avg) >= 3.5 
                            ? "Your restful sleep patterns look stable and peaceful." 
                            : "Consider keeping screens away 30 mins before rest to help."}
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* Energy Metrics Card */}
                <div className="bg-white border border-sage-200/50 rounded-[2rem] p-5 shadow-organic text-left">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-sage-500 uppercase tracking-widest">Energy Levels</span>
                    <Zap size={14} className="text-sage-400" />
                  </div>
                  
                  {/* Calculate average */}
                  {(() => {
                    const avg = checkIns.length > 0 
                      ? (checkIns.reduce((sum, item) => sum + item.energy, 0) / checkIns.length).toFixed(1)
                      : "0.0";
                    const pct = (parseFloat(avg) / 5) * 100;
                    
                    return (
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span id="energy-avg-value" className="text-3xl font-serif font-bold text-ink">{avg}</span>
                          <span className="text-xs text-ink-light">/ 5</span>
                        </div>
                        <div className="w-full bg-cream rounded-full h-1.5 mt-3">
                          <div 
                            className="bg-sage-400 h-1.5 rounded-full" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-ink-light mt-2.5 leading-snug font-semibold">
                          {parseFloat(avg) >= 3.5 
                            ? "Your energy levels indicate quiet, stable replenishment." 
                            : "A low battery requires deep offline rest actions today."}
                        </p>
                      </div>
                    );
                  })()}
                </div>

              </div>

              {/* Stress Level Breakdown */}
              <div className="bg-white border border-sage-200/50 rounded-[2rem] p-5 shadow-organic text-left">
                <span className="text-[10px] font-bold text-coral-400 uppercase tracking-widest block mb-4">
                  Past Stress Level Trend
                </span>
                
                {checkIns.length === 0 ? (
                  <p className="text-xs text-ink-light font-semibold">No logs for stress levels yet.</p>
                ) : (
                  <div className="space-y-3 font-semibold">
                    {checkIns.slice(0, 4).reverse().map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-ink-light w-16 truncate">{item.date}</span>
                        <div className="flex-1 bg-cream rounded-full h-3 overflow-hidden border border-sage-100">
                          <div 
                            className="bg-coral-300 h-3 rounded-full" 
                            style={{ width: `${(item.stressLevel / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-ink-light w-16 text-right">
                          {item.stressLevel === 5 ? "Peaceful" : item.stressLevel >= 4 ? "Manageable" : item.stressLevel === 3 ? "Moderate" : "Overwhelm"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-left select-none"
            >
              <div className="text-center py-2">
                <span className="text-[10px] font-bold text-ink-light bg-sage-50 border border-sage-200/50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  App Settings & Control
                </span>
                <p className="text-ink-light text-xs mt-2 font-semibold">
                  Maintain full privacy and control over your data.
                </p>
              </div>

              {/* User profile recap */}
              <div className="bg-white border border-sage-200/50 rounded-[2rem] p-5 shadow-organic space-y-3">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wide border-b border-sage-100 pb-2.5 font-serif font-semibold">
                  My Sanctuary Profile
                </h4>
                
                <div className="flex justify-between text-xs py-1 font-semibold">
                  <span className="text-ink-light font-medium">Name:</span>
                  <span className="font-bold text-ink">{profile.name}</span>
                </div>

                <div className="flex justify-between text-xs py-1 font-semibold">
                  <span className="text-ink-light font-medium">Energy Baseline:</span>
                  <span className="font-bold text-ink capitalize">{profile.energyLevel}</span>
                </div>

                <div className="flex justify-between text-xs py-1 font-semibold">
                  <span className="text-ink-light font-medium">Primary Fatigue Driver:</span>
                  <span className="font-bold text-ink capitalize">{profile.mainDrain}</span>
                </div>
              </div>

              {/* Info text box */}
              <div className="bg-sage-50/50 border border-sage-200/60 rounded-[2rem] p-5 text-xs text-sage-800 leading-relaxed shadow-organic font-medium">
                <h4 className="font-bold text-sage-900 mb-1 flex items-center gap-1">
                  <Award size={14} />
                  <span>Fully Offline & Private</span>
                </h4>
                <p>
                  Recovery Routine Planner is designed as an empathetic offline utility. Your check-in indicators, daily notes, and reflection journal entries are processed locally on your client browser and are never uploaded to any remote system.
                </p>
              </div>

              {/* Logout Option */}
              <div className="bg-white border border-sage-200/50 rounded-[2rem] p-5 shadow-organic space-y-3">
                <h4 className="text-xs font-bold text-sage-600 uppercase tracking-wide font-serif">
                  Account
                </h4>
                <div className="flex justify-between items-center text-xs py-1 font-semibold">
                  <span className="text-ink-light font-medium">Logged in as:</span>
                  <span className="font-bold text-ink truncate max-w-[180px]">{authUser?.email}</span>
                </div>
                
                <button
                  id="settings-logout-btn"
                  onClick={handleLogout}
                  className="w-full bg-sage-50 hover:bg-sage-100 text-sage-700 font-bold text-xs py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-sage-200/40"
                >
                  <LogOut size={14} />
                  <span>Sign Out of Sanctuary</span>
                </button>
              </div>

              {/* Clear storage */}
              <div className="bg-white border border-coral-200/60 rounded-[2rem] p-5 shadow-organic space-y-3">
                <h4 className="text-xs font-bold text-coral-500 uppercase tracking-wide font-serif">
                  Danger Zone
                </h4>
                <p className="text-ink-light text-[11px] leading-relaxed font-semibold">
                  Resetting application data will completely delete your local storage state, clear your profile, and erase your journal reflections permanently.
                </p>
                
                <button
                  id="reset-data-btn"
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setDeleteStep(1);
                    setDeleteTypedConfirm('');
                  }}
                  className="w-full bg-coral-50 hover:bg-coral-100 text-coral-600 font-bold text-xs py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-coral-200"
                >
                  <Trash2 size={14} />
                  <span>Reset All Application Data</span>
                </button>
              </div>
            </motion.div>
          )}

        </main>

        {/* STICKY BOTTOM NAVIGATION BAR */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-sage-200/60 z-40 select-none">
          <div className="w-full max-w-md md:max-w-lg mx-auto flex justify-around py-3 px-2">
            {[
              { id: 'home' as const, label: 'Home', icon: HomeIcon },
              { id: 'journal' as const, label: 'Journal', icon: BookOpen },
              { id: 'chat' as const, label: 'Chat', icon: MessageCircle },
              { id: 'progress' as const, label: 'Progress', icon: BarChart2 }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    isActive 
                      ? 'text-sage-500 scale-105' 
                      : 'text-ink-light/50 hover:text-ink'
                  }`}
                >
                  <IconComp size={19} className={isActive ? 'stroke-[2.5px] text-sage-500' : 'stroke-[1.8px] text-ink-light/50'} />
                  <span className={`text-[9px] font-bold tracking-widest uppercase ${isActive ? 'text-sage-600' : 'text-ink-light/40'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* --- DYNAMIC OVERLAY 1: CONVERSATIONAL CHECK-IN MODAL --- */}
        <AnimatePresence>
          {showCheckInModal && (
            <DailyCheckIn 
              onClose={() => setShowCheckInModal(false)}
              onSubmit={handleCheckInSubmit}
            />
          )}
        </AnimatePresence>

        {/* --- DYNAMIC OVERLAY 2: MINDFUL BREATHING SPACE --- */}
        <AnimatePresence>
          {isBreathingSpaceOpen && (
            <BreathingSpace 
              onClose={() => setIsBreathingSpaceOpen(false)}
              onComplete={handleBreathingComplete}
            />
          )}
        </AnimatePresence>

        {/* --- DYNAMIC OVERLAY 3: CRISIS SUPPORT OVERLAY --- */}
        <AnimatePresence>
          {isCrisisOpen && (
            <div id="crisis-support-overlay" className="fixed inset-0 bg-coral-50/98 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center select-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                className="w-full max-w-md bg-white border border-coral-200 rounded-[2rem] p-6 md:p-8 shadow-organic space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-coral-50 border border-coral-100 flex items-center justify-center text-coral-500 mx-auto">
                  <AlertCircle size={32} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-serif font-bold text-ink tracking-tight leading-snug">
                    Please pause for a moment.
                  </h2>
                  <p className="text-ink-light text-xs leading-relaxed font-semibold">
                    Your life and your pain matter deeply. You do not have to carry this immense heaviness entirely by yourself. Please reach out to someone who can hold space for you right now.
                  </p>
                </div>

                {/* International Placeholder Resources List */}
                <div className="bg-coral-50/60 rounded-2xl p-4.5 text-left border border-coral-200/50 space-y-3 shadow-sm">
                  <span className="text-[9px] font-bold text-coral-600 uppercase tracking-widest block">
                    Confidential Crisis Resources
                  </span>
                  
                  <div className="space-y-2.5 font-medium">
                    <div>
                      <span className="text-[9px] font-bold text-ink-light block uppercase tracking-wider">Vietnam Support Lines</span>
                      <p className="text-xs font-bold text-ink">Dayla: <a href="tel:1900234538" className="underline hover:text-coral-600">1900 234 538</a></p>
                      <p className="text-xs font-bold text-ink">Sát cánh: <a href="tel:1900636223" className="underline hover:text-coral-600">1900 636 223</a></p>
                    </div>

                    <div className="h-[1px] bg-coral-100" />

                    <div>
                      <span className="text-[9px] font-bold text-ink-light block uppercase tracking-wider">United States</span>
                      <p className="text-xs font-bold text-ink">988 Lifeline: <span className="underline">Call or Text 988</span></p>
                    </div>

                    <div className="h-[1px] bg-coral-100" />

                    <div>
                      <span className="text-[9px] font-bold text-ink-light block uppercase tracking-wider">United Kingdom</span>
                      <p className="text-xs font-bold text-ink">Samaritans: <a href="tel:116123" className="underline hover:text-coral-600">116 123</a></p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    id="close-crisis-btn"
                    onClick={() => setIsCrisisOpen(false)}
                    className="w-full bg-coral-500 hover:bg-coral-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-coral-500/20 transition-all cursor-pointer text-xs uppercase tracking-wider"
                  >
                    Close with care
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- DYNAMIC OVERLAY 4: RESET APPLICATION DATA MODAL WITH DOUBLE CONFIRMATION --- */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div id="delete-confirmation-overlay" className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-md bg-white border border-coral-200 rounded-[2rem] p-6 shadow-organic relative overflow-hidden text-center space-y-5"
              >
                {/* Colored Warning accent bar at top */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-coral-400 to-coral-300" />

                <div className="w-14 h-14 rounded-2xl bg-coral-50 border border-coral-100 flex items-center justify-center text-coral-500 mx-auto">
                  <Trash2 size={24} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-serif font-bold text-ink tracking-tight">
                    Reset Application Data
                  </h3>
                  <p className="text-[10px] text-coral-500 font-bold uppercase tracking-widest">
                    Step {deleteStep} of 2 • Confirmation Required
                  </p>
                </div>

                {deleteStep === 1 ? (
                  <div className="space-y-4">
                    <p className="text-ink-light text-xs leading-relaxed font-semibold text-left bg-cream/40 border border-sage-100 rounded-2xl p-4">
                      Are you sure you want to reset your sanctuary? This will permanently delete your check-ins, custom routines, journal reflections, and restart onboarding. This action is irreversible.
                    </p>
                    <div className="flex gap-3">
                      <button
                        id="delete-step1-cancel"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 bg-sage-50 hover:bg-sage-100 text-sage-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer border border-sage-200/40"
                      >
                        Cancel
                      </button>
                      <button
                        id="delete-step1-confirm"
                        onClick={() => setDeleteStep(2)}
                        className="flex-1 bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-coral-500/10 transition-all cursor-pointer"
                      >
                        Yes, Continue
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-ink-light text-xs leading-relaxed font-semibold text-left bg-coral-50/30 border border-coral-100 rounded-2xl p-4">
                      This is the final warning. To confirm that you want to delete all application data, please type <strong className="text-coral-600 font-bold tracking-wider select-text">DELETE</strong> in the box below.
                    </p>
                    
                    <input
                      id="delete-confirm-input"
                      type="text"
                      value={deleteTypedConfirm}
                      onChange={(e) => setDeleteTypedConfirm(e.target.value)}
                      placeholder="Type DELETE here..."
                      className="w-full bg-cream/40 border border-coral-200 hover:border-coral-300 focus:border-coral-400 focus:bg-white rounded-2xl py-3 px-4 text-ink placeholder-ink-light/40 text-xs outline-none transition-all font-semibold uppercase tracking-wider text-center"
                    />

                    <div className="flex gap-3">
                      <button
                        id="delete-step2-back"
                        onClick={() => setDeleteStep(1)}
                        className="flex-1 bg-sage-50 hover:bg-sage-100 text-sage-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer border border-sage-200/40"
                      >
                        Back
                      </button>
                      <button
                        id="delete-step2-final"
                        disabled={deleteTypedConfirm.trim().toUpperCase() !== 'DELETE'}
                        onClick={handleClearAllData}
                        className="flex-1 bg-coral-500 hover:bg-coral-600 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-coral-500/10 transition-all cursor-pointer"
                      >
                        Erase Everything
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Confetti Celebration Particle Overlay */}
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <AnimatePresence>
            {confetti.map(p => (
              <motion.div
                key={p.id}
                initial={{ x: '50vw', y: '50vh', opacity: 1, scale: 0.1, rotate: 0 }}
                animate={{ 
                  x: `calc(50vw + ${p.tx}px)`, 
                  y: `calc(50vh + ${p.ty}px)`, 
                  opacity: [1, 1, 0], // Hold opacity, then fade
                  scale: [0.1, 1.2, 0.5],
                  rotate: Math.random() * 720 - 360 
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 1.4, 
                  ease: [0.1, 0.8, 0.3, 1]
                }}
                className="absolute select-none pointer-events-none flex items-center justify-center font-bold"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.emoji ? 'transparent' : p.color,
                  borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'star' ? '25%' : '0px',
                  fontSize: p.emoji ? `${p.size}px` : undefined,
                }}
              >
                {p.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
