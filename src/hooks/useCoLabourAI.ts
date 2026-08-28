import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWorkersList } from '@/lib/dataService';
import type { WorkerWithUser } from '@/lib/supabase';

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

  if (q.includes('wiring') || q.includes('switchboard') || q.includes('electric') || q.includes('mcb')) {
    return {
      text: `⚡ **Electrical Job Estimate:**\n• **Typical Cost:** ₹350 - ₹650 depending on points\n• **Est. Time:** 45 - 90 mins\n• **Zero Platform Fee:** ₹0 deducted from worker\n\nWould you like to book Rajesh Kumar (Top Rated Electrician, ₹450/hr)?`,
      action: {
        type: 'worker_card',
        label: 'Book Rajesh Kumar (Electrician)',
        url: '/book/wp-1',
      },
    };
  }

  if (q.includes('plumber') || q.includes('pipe') || q.includes('leak') || q.includes('tap') || q.includes('geyser')) {
    try {
      const workers = await fetchWorkersList('Plumber');
      const topPlumber = workers[0];
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
      },
    };
  }

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

  return {
    text: `✨ I can help you find certified electricians, plumbers, carpenters, and cleaners with instant GPS proximity matching.\n\nTell me what you need fixed (e.g. "Fix ceiling fan", "Kitchen pipe leaking") or explore our directory of verified professionals.`,
    action: {
      type: 'navigate',
      label: 'Explore All Workers Directory',
      url: '/workers',
    },
  };
}

const QUICK_PROMPTS = [
  '⚡ Estimate Wiring Cost',
  '📍 Find Plumber Near Me',
  '💸 Zero-Fee UPI & UTR Guide',
  '🧾 How POS Slips Work',
];

export function useCoLabourAI() {
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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  const speakText = useCallback((text: string) => {
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
  }, [ttsEnabled]);

  const handleSend = useCallback(async (customQuery?: string) => {
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
  }, [input, speakText]);

  const toggleTts = useCallback(() => {
    setTtsEnabled((prev) => {
      if (prev && window.speechSynthesis) window.speechSynthesis.cancel();
      return !prev;
    });
  }, []);

  return {
    isOpen,
    setIsOpen,
    input,
    setInput,
    isTyping,
    ttsEnabled,
    messages,
    messagesEndRef,
    handleSend,
    toggleTts,
    navigate,
    QUICK_PROMPTS,
  };
}
