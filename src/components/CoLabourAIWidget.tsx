import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, X, Send, Bot, User,
  Volume2, VolumeX, ArrowRight
} from 'lucide-react';
import { useCoLabourAI } from '@/hooks/useCoLabourAI';

export function CoLabourAIWidget() {
  const {
    isOpen, setIsOpen, input, setInput, isTyping, ttsEnabled,
    messages, messagesEndRef, handleSend, toggleTts, navigate,
    QUICK_PROMPTS,
  } = useCoLabourAI();

  return (
    <>
      {/* Floating Launcher Trigger */}
      <div className="fixed bottom-4 left-4 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 rounded-full border border-neon-cyan/40 bg-gradient-to-r from-base-900 via-base-800 to-base-900 px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.35)] backdrop-blur-xl hover:border-neon-cyan hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all"
        >
          <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-neon-cyan/20 text-neon-cyan">
            <Sparkles size={13} className="animate-spin text-neon-cyan" />
            <span className="absolute inset-0 animate-ping rounded-full bg-neon-cyan/20" />
          </div>
          <span>Ask CoLabour AI</span>
          <span className="rounded-full bg-neon-cyan/20 px-1.5 py-0.5 text-[9px] font-mono text-neon-cyan uppercase">Smart</span>
        </motion.button>
      </div>

      {/* Interactive Chat Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-start sm:justify-start p-2 sm:p-6 bg-base-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.2 }}
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
                  <button
                    type="button"
                    onClick={toggleTts}
                    title={ttsEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
                    className={`rounded-lg p-1.5 transition-colors ${
                      ttsEnabled ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'ai' && (
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 mt-0.5">
                        <Bot size={14} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-r from-neon-emerald/30 to-neon-cyan/30 text-white border border-neon-emerald/30'
                          : 'bg-white/5 text-gray-200 border border-white/10'
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.text}</p>

                      {/* Optional Action Card */}
                      {m.action && (
                        <div className="mt-3 pt-2.5 border-t border-white/10">
                          {m.action.worker && (
                            <div className="mb-2 rounded-xl border border-white/10 bg-base-900/80 p-2.5 text-left">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-white text-xs">{m.action.worker.users?.name}</span>
                                <span className="text-neon-emerald font-bold">₹{m.action.worker.hourly_rate}/hr</span>
                              </div>
                              <p className="text-[10px] text-gray-400">{m.action.worker.category} • ⭐ {m.action.worker.rating} ({m.action.worker.total_ratings} reviews)</p>
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
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-neon-cyan/20 border border-neon-cyan/40 py-2 text-xs font-bold text-neon-cyan hover:bg-neon-cyan/30 transition-all"
                          >
                            <span>{m.action.label}</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      )}

                      <span className="mt-1 block text-right text-[9px] text-gray-500">{m.timestamp}</span>
                    </div>

                    {m.sender === 'user' && (
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/30 mt-0.5">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon-cyan/20 text-neon-cyan">
                      <Bot size={14} />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="border-t border-white/10 bg-base-950/40 p-2 overflow-x-auto flex gap-1.5 scrollbar-none">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="flex-shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-gray-300 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 hover:text-white transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="border-t border-white/10 bg-base-950 p-3">
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
                    className="flex-1 rounded-xl border border-white/10 bg-base-900 px-3.5 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-neon-cyan/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon-cyan text-base-950 font-bold transition-all hover:bg-neon-cyan/90 disabled:opacity-40"
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
