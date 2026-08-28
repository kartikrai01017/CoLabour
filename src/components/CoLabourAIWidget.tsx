import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, X, Send, Bot, User,
  Volume2, VolumeX, ArrowRight
} from 'lucide-react';
import { fetchWorkersList } from '@/lib/dataService';
import { type WorkerWithUser } from '@/lib/supabase';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  action?: {
    type: 'worker_card' | 'navigate';
    label: string;
    url: string;
    worker?: WorkerWithUser;
  };
}

const QUICK_PROMPTS = [
  '⚡ Estimate Wiring Cost',
  '📍 Find Plumber Near Me',
  '💸 Zero-Fee UPI & UTR Guide',
  '🧾 How POS Slips Work',
];

export function CoLabourAIWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      sender: 'ai',
      text: '👋 Namaste! I am CoLabour AI, your intelligent gig assistant. I can estimate repair costs, find the nearest verified professional, or explain our direct 0% commission UPI checkout.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const speakText = (text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ''));
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  };

  const handleSend = async (customQuery?: string) => {
    const query = customQuery ?? input.trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInput('');
    setIsTyping(true);

    setTimeout(async () => {
      const response = await generateAIResponse(query);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: response.action,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      speakText(response.text);
    }, 600);
  };

  return (
    <>
      {/* Floating Launcher Trigger */}
      <div className="fixed bottom-4 left-4 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
<<<<<<< HEAD
          className="flex items-center gap-2.5 rounded-2xl border-2 border-black bg-cyan-300 px-4 py-2.5 text-xs font-black text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
        >
          <div className="relative flex h-5 w-5 items-center justify-center rounded-lg bg-black text-cyan-300">
            <Sparkles size={12} className="animate-spin" />
          </div>
          <span>Ask CoLabour AI</span>
          <span className="rounded-md bg-white px-1.5 py-0.5 text-[9px] font-black border border-black uppercase">Smart</span>
=======
          className="flex items-center gap-2.5 rounded-full border border-neon-cyan/40 bg-gradient-to-r from-base-900 via-base-800 to-base-900 px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.35)] backdrop-blur-xl hover:border-neon-cyan hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all"
        >
          <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-neon-cyan/20 text-neon-cyan">
            <Sparkles size={13} className="animate-spin text-neon-cyan" />
            <span className="absolute inset-0 animate-ping rounded-full bg-neon-cyan/20" />
          </div>
          <span>Ask CoLabour AI</span>
          <span className="rounded-full bg-neon-cyan/20 px-1.5 py-0.5 text-[9px] font-mono text-neon-cyan uppercase">Smart</span>
>>>>>>> origin/main
        </motion.button>
      </div>

      {/* Interactive Chat Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
<<<<<<< HEAD
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-start sm:justify-start p-2 sm:p-6 bg-black/60 backdrop-blur-sm">
=======
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-start sm:justify-start p-2 sm:p-6 bg-base-950/70 backdrop-blur-sm">
>>>>>>> origin/main
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.2 }}
<<<<<<< HEAD
              className="relative flex h-[85vh] max-h-[640px] w-full max-w-md flex-col overflow-hidden rounded-2xl border-2 border-black bg-white shadow-[8px_8px_0px_0px_#000]"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b-2 border-black bg-amber-200 px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-black flex items-center gap-1.5">
                      CoLabour AI Assistant
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                    </h3>
                    <p className="text-[10px] font-bold text-gray-700">0% Commission • Live Geolocation & Smart Pricing</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
=======
              className="relative flex h-[85vh] max-h-[640px] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-neon-cyan/30 bg-gradient-to-b from-base-900 via-base-950 to-base-900 shadow-[0_0_60px_rgba(6,182,212,0.3)] backdrop-blur-2xl"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      CoLabour AI Assistant
                      <span className="inline-block h-2 w-2 rounded-full bg-neon-emerald animate-pulse" />
                    </h3>
                    <p className="text-[10px] text-gray-400">0% Commission • Live Geolocation & Smart Pricing</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
>>>>>>> origin/main
                  <button
                    type="button"
                    onClick={() => {
                      setTtsEnabled(!ttsEnabled);
                      if (ttsEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
                    }}
                    title={ttsEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
<<<<<<< HEAD
                    className={`rounded-lg border-2 border-black p-1.5 transition-all shadow-[1px_1px_0px_0px_#000] cursor-pointer ${
                      ttsEnabled ? 'bg-cyan-300 text-black' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {ttsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
=======
                    className={`rounded-lg p-1.5 transition-colors ${
                      ttsEnabled ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
>>>>>>> origin/main
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
<<<<<<< HEAD
                    className="rounded-lg border-2 border-black bg-white p-1.5 text-black hover:bg-red-200 transition-colors shadow-[1px_1px_0px_0px_#000] cursor-pointer"
                  >
                    <X size={15} />
=======
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <X size={18} />
>>>>>>> origin/main
                  </button>
                </div>
              </div>

              {/* Messages Container */}
<<<<<<< HEAD
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin bg-[#FAF8F5]">
=======
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
>>>>>>> origin/main
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'ai' && (
<<<<<<< HEAD
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-300 text-black border-2 border-black shadow-[1px_1px_0px_0px_#000] mt-0.5">
=======
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 mt-0.5">
>>>>>>> origin/main
                        <Bot size={14} />
                      </div>
                    )}

                    <div
<<<<<<< HEAD
                      className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed border-2 border-black shadow-[3px_3px_0px_0px_#000] ${
                        m.sender === 'user'
                          ? 'bg-emerald-300 text-black font-bold'
                          : 'bg-white text-black font-medium'
=======
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-r from-neon-emerald/30 to-neon-cyan/30 text-white border border-neon-emerald/30'
                          : 'bg-white/5 text-gray-200 border border-white/10'
>>>>>>> origin/main
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.text}</p>

                      {/* Optional Action Card */}
                      {m.action && (
<<<<<<< HEAD
                        <div className="mt-3 pt-2.5 border-t-2 border-black/10">
                          {m.action.worker && (
                            <div className="mb-2 rounded-lg border-2 border-black bg-yellow-50 p-2.5 text-left shadow-[2px_2px_0px_0px_#000]">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-black text-black text-xs">{m.action.worker.users?.name}</span>
                                <span className="text-emerald-900 font-black">₹{m.action.worker.hourly_rate}/hr</span>
                              </div>
                              <p className="text-[10px] font-bold text-gray-700">{m.action.worker.category} • ⭐ {m.action.worker.rating} ({m.action.worker.total_ratings} reviews)</p>
=======
                        <div className="mt-3 pt-2.5 border-t border-white/10">
                          {m.action.worker && (
                            <div className="mb-2 rounded-xl border border-white/10 bg-base-900/80 p-2.5 text-left">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-white text-xs">{m.action.worker.users?.name}</span>
                                <span className="text-neon-emerald font-bold">₹{m.action.worker.hourly_rate}/hr</span>
                              </div>
                              <p className="text-[10px] text-gray-400">{m.action.worker.category} • ⭐ {m.action.worker.rating} ({m.action.worker.total_ratings} reviews)</p>
>>>>>>> origin/main
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (m.action?.url) {
                                setIsOpen(false);
                                navigate(m.action.url);
                              }
                            }}
<<<<<<< HEAD
                            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-cyan-300 border-2 border-black py-2 text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
=======
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-neon-cyan/20 border border-neon-cyan/40 py-2 text-xs font-bold text-neon-cyan hover:bg-neon-cyan/30 transition-all"
>>>>>>> origin/main
                          >
                            <span>{m.action.label}</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      )}

<<<<<<< HEAD
                      <span className="mt-1 block text-right text-[9px] font-mono font-bold text-gray-500">{m.timestamp}</span>
                    </div>

                    {m.sender === 'user' && (
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-400 text-black border-2 border-black shadow-[1px_1px_0px_0px_#000] mt-0.5">
=======
                      <span className="mt-1 block text-right text-[9px] text-gray-500">{m.timestamp}</span>
                    </div>

                    {m.sender === 'user' && (
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/30 mt-0.5">
>>>>>>> origin/main
                        <User size={14} />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
<<<<<<< HEAD
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-300 text-black border-2 border-black">
                      <Bot size={14} />
                    </div>
                    <div className="flex items-center gap-1 rounded-xl border-2 border-black bg-white px-3 py-2 shadow-[2px_2px_0px_0px_#000]">
                      <span className="h-2 w-2 rounded-full bg-black animate-bounce" />
                      <span className="h-2 w-2 rounded-full bg-black animate-bounce [animation-delay:0.2s]" />
                      <span className="h-2 w-2 rounded-full bg-black animate-bounce [animation-delay:0.4s]" />
=======
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon-cyan/20 text-neon-cyan">
                      <Bot size={14} />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-bounce [animation-delay:0.4s]" />
>>>>>>> origin/main
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
<<<<<<< HEAD
              <div className="border-t-2 border-black bg-white p-2.5 overflow-x-auto flex gap-1.5 scrollbar-none">
=======
              <div className="border-t border-white/10 bg-base-950/40 p-2 overflow-x-auto flex gap-1.5 scrollbar-none">
>>>>>>> origin/main
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
<<<<<<< HEAD
                    className="flex-shrink-0 rounded-lg border-2 border-black bg-yellow-100 px-2.5 py-1 text-[11px] font-black text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
=======
                    className="flex-shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-gray-300 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 hover:text-white transition-all"
>>>>>>> origin/main
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
<<<<<<< HEAD
              <div className="border-t-2 border-black bg-white p-3">
=======
              <div className="border-t border-white/10 bg-base-950 p-3">
>>>>>>> origin/main
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about pricing, workers, or UPI payments..."
<<<<<<< HEAD
                    className="flex-1 rounded-xl border-2 border-black bg-[#FAF8F5] px-3.5 py-2 text-xs font-bold text-black placeholder-gray-500 outline-none shadow-[2px_2px_0px_0px_#000]"
=======
                    className="flex-1 rounded-xl border border-white/10 bg-base-900 px-3.5 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-neon-cyan/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
>>>>>>> origin/main
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
<<<<<<< HEAD
                    className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-emerald-400 text-black font-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-40 cursor-pointer"
=======
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon-cyan text-base-950 font-bold transition-all hover:bg-neon-cyan/90 disabled:opacity-40"
>>>>>>> origin/main
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// AI response generator with local heuristic intelligence
async function generateAIResponse(query: string): Promise<{
  text: string;
  action?: {
    type: 'worker_card' | 'navigate';
    label: string;
    url: string;
    worker?: WorkerWithUser;
  };
}> {
  const q = query.toLowerCase();

  // 1. Cost & Job Estimations
  if (q.includes('wiring') || q.includes('switchboard') || q.includes('electric') || q.includes('mcb')) {
<<<<<<< HEAD
    try {
      const workers = await fetchWorkersList('Electrician');
      const topWorker = workers[0];
      if (topWorker) {
        return {
          text: `⚡ **Electrical Job Estimate:**\n• **Typical Cost:** ₹${topWorker.hourly_rate}/hr\n• **Est. Time:** 45 - 90 mins\n• **Zero Platform Fee:** ₹0 deducted from worker\n\nTop match: **${topWorker.users?.name ?? 'Verified Electrician'}** (⭐ ${topWorker.rating ?? 5.0}, ₹${topWorker.hourly_rate}/hr).`,
          action: {
            type: 'worker_card',
            label: `Book ${topWorker.users?.name ?? 'Electrician'}`,
            url: `/book/${topWorker.id}`,
            worker: topWorker,
          },
        };
      }
    } catch {
      // fallback to directory
    }
    return {
      text: `⚡ **Electrical Job Estimate:**\n• **Typical Cost:** ₹350 - ₹650 depending on points\n• **Est. Time:** 45 - 90 mins\n• **Zero Platform Fee:** 0% commission`,
      action: {
        type: 'navigate',
        label: 'Browse Verified Electricians',
        url: '/workers',
=======
    return {
      text: `⚡ **Electrical Job Estimate:**\n• **Typical Cost:** ₹350 - ₹650 depending on points\n• **Est. Time:** 45 - 90 mins\n• **Zero Platform Fee:** ₹0 deducted from worker\n\nWould you like to book Rajesh Kumar (Top Rated Electrician, ₹450/hr)?`,
      action: {
        type: 'worker_card',
        label: 'Book Rajesh Kumar (Electrician)',
        url: '/book/wp-1',
>>>>>>> origin/main
      },
    };
  }

  if (q.includes('plumber') || q.includes('pipe') || q.includes('leak') || q.includes('tap') || q.includes('geyser')) {
    try {
      const workers = await fetchWorkersList('Plumber');
      const topPlumber = workers[0];
<<<<<<< HEAD
      if (topPlumber) {
        return {
          text: `📍 **Plumbing Service Match:**\n• **Estimated Rate:** ₹${topPlumber.hourly_rate}/hr\n• **Typical Resolution:** 30 - 60 mins\n\nTop verified match: **${topPlumber.users?.name ?? 'Verified Plumber'}** (⭐ ${topPlumber.rating ?? 5.0}, ₹${topPlumber.hourly_rate}/hr). Verified for pipe & leak repairs.`,
          action: {
            type: 'worker_card',
            label: `Book ${topPlumber.users?.name ?? 'Plumber'}`,
            url: `/book/${topPlumber.id}`,
            worker: topPlumber,
          },
        };
      }
    } catch {
      // fallback
    }
    return {
      text: `📍 **Plumbing Service Match:**\n• **Estimated Cost:** ₹300 - ₹500\n• **Zero Commission:** 100% direct UPI settlement.`,
      action: {
        type: 'navigate',
        label: 'Browse Verified Plumbers',
        url: '/workers',
      },
    };
  }

  if (q.includes('clean') || q.includes('maid') || q.includes('sofa') || q.includes('deep clean')) {
    try {
      const workers = await fetchWorkersList('Cleaner');
      const topCleaner = workers[0];
      if (topCleaner) {
        return {
          text: `🧹 **Deep Cleaning & Sanitization:**\n• **Hourly Rate:** ₹${topCleaner.hourly_rate}/hr\n• **Eco-friendly Products:** 100% safe\n\nTop match: **${topCleaner.users?.name ?? 'Verified Cleaner'}** (⭐ ${topCleaner.rating ?? 5.0}, ₹${topCleaner.hourly_rate}/hr).`,
          action: {
            type: 'worker_card',
            label: `Book ${topCleaner.users?.name ?? 'Cleaner'}`,
            url: `/book/${topCleaner.id}`,
            worker: topCleaner,
          },
        };
      }
    } catch {
      // fallback
    }
    return {
      text: `🧹 **Deep Cleaning & Sanitization:**\n• **1 BHK / Standard:** ₹700 - ₹1,200\n• **Kitchen & Bath Deep Clean:** ₹400 - ₹800\n• **Eco-friendly Products:** 100% safe`,
      action: {
        type: 'navigate',
        label: 'Browse Verified Cleaners',
        url: '/workers',
=======
      return {
        text: `📍 **Plumbing Service Match:**\n• **Estimated Cost:** ₹300 - ₹500\n• **Typical Resolution:** 30 - 60 mins\n\nTop match: **${topPlumber?.users?.name ?? 'Amit Patel'}** (⭐ ${topPlumber?.rating ?? 4.9}, ₹${topPlumber?.hourly_rate ?? 400}/hr). Verified for high-pressure leak repairs.`,
        action: {
          type: 'worker_card',
          label: `Book ${topPlumber?.users?.name ?? 'Amit Patel'}`,
          url: `/book/${topPlumber?.id ?? 'wp-3'}`,
          worker: topPlumber,
        },
      };
    } catch {
      return {
        text: `📍 **Plumbing Service Match:**\nTop verified match is **Amit Patel** (⭐ 4.9, ₹400/hr). Specializes in concealed pipe repairs, tap fixes, and geysers.`,
        action: {
          type: 'worker_card',
          label: 'Book Amit Patel (Plumber)',
          url: '/book/wp-3',
        },
      };
    }
  }

  if (q.includes('clean') || q.includes('maid') || q.includes('sofa') || q.includes('deep clean')) {
    return {
      text: `🧹 **Deep Cleaning & Sanitization:**\n• **1 BHK / Standard:** ₹700 - ₹1,200\n• **Kitchen & Bath Deep Clean:** ₹400 - ₹800\n• **Eco-friendly Products:** 100% pet safe\n\nTop match: **Priya Sharma** (⭐ 4.8, ₹350/hr).`,
      action: {
        type: 'worker_card',
        label: 'Book Priya Sharma (Cleaner)',
        url: '/book/wp-2',
>>>>>>> origin/main
      },
    };
  }

  // 2. Zero-fee & Payment Guide
  if (q.includes('payment') || q.includes('upi') || q.includes('utr') || q.includes('fee') || q.includes('zero')) {
    return {
      text: `💸 **How CoLabour Direct UPI Works:**\n1. **Direct Peer-to-Peer:** 100% of your money goes straight to the worker's bank account via UPI. CoLabour charges **0% commission**.\n2. **Locked State:** QR code unlocks as soon as the worker accepts your booking.\n3. **UTR Verification:** Enter your bank's 12-digit transaction ID (UTR) to instantly notify the worker.\n4. **Official POS Slip:** Receive a digitally signed POS thermal slip receipt.`,
      action: {
        type: 'navigate',
        label: 'Browse Verified Workers',
        url: '/workers',
      },
    };
  }

  // 3. POS Slip info
  if (q.includes('slip') || q.includes('pos') || q.includes('receipt') || q.includes('invoice')) {
    return {
      text: `🧾 **CoLabour 3D Thermal Slip Engine:**\nEvery completed and verified booking generates an official POS hardware receipt featuring:\n• Zero-fee breakdown\n• 12-digit Bank UTR record\n• Authenticated QR stamp\n• PDF download & direct thermal printer output.`,
      action: {
        type: 'navigate',
        label: 'Open Customer Dashboard',
        url: '/customer/dashboard',
      },
    };
  }

  // 4. General Directory / Default
  return {
    text: `✨ I can help you find certified electricians, plumbers, carpenters, and cleaners with instant GPS proximity matching.\n\nTell me what you need fixed (e.g. "Fix ceiling fan", "Kitchen pipe leaking") or explore our directory of verified professionals.`,
    action: {
      type: 'navigate',
      label: 'Explore All Workers Directory',
      url: '/workers',
    },
  };
}
