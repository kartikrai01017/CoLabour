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
          className="flex items-center gap-2.5 rounded-nb-md border-[2px] border-nb-ink bg-nb-accent-blue px-4 py-2.5 text-xs font-black text-nb-ink shadow-nb-md hover:shadow-nb-lg transition-all"
        >
          <div className="relative flex h-5 w-5 items-center justify-center rounded-nb-sm bg-nb-surface text-nb-ink border border-nb-ink">
            <Sparkles size={13} className="animate-spin" />
          </div>
          <span>Ask CoLabour AI</span>
          <span className="rounded-nb-sm bg-nb-surface px-1.5 py-0.5 text-[9px] font-mono font-bold text-nb-ink uppercase border border-nb-ink">Smart</span>
        </motion.button>
      </div>

      {/* Interactive Chat Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-start sm:justify-start p-2 sm:p-6 bg-nb-ink/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative flex h-[85vh] max-h-[640px] w-full max-w-md flex-col overflow-hidden rounded-nb-2xl border-[4px] border-nb-ink bg-nb-surface shadow-nb-xl"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b-[2px] border-nb-ink/20 bg-nb-surface-muted px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-nb-md bg-nb-accent-blue text-nb-ink border-[2px] border-nb-ink shadow-nb-sm">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-nb-ink flex items-center gap-1.5">
                      CoLabour AI Assistant
                      <span className="inline-block h-2 w-2 rounded-full bg-nb-accent-green animate-pulse border border-nb-ink" />
                    </h3>
                    <p className="text-[10px] font-medium text-nb-text-muted">0% Commission • Live Geolocation & Smart Pricing</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleTts}
                    title={ttsEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
                    className={`rounded-nb-sm p-1.5 transition-colors border border-transparent ${
                      ttsEnabled ? 'bg-nb-accent-blue/20 text-nb-ink border-nb-ink/20' : 'text-nb-text-muted hover:text-nb-ink'
                    }`}
                  >
                    {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-nb-sm p-1.5 text-nb-text-muted hover:bg-nb-surface-muted hover:text-nb-ink transition-colors border border-transparent hover:border-nb-ink/20"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'ai' && (
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-nb-sm bg-nb-accent-blue text-nb-ink border-[2px] border-nb-ink mt-0.5 shadow-nb-sm">
                        <Bot size={14} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-nb-lg px-3.5 py-2.5 text-xs leading-relaxed font-medium ${
                        m.sender === 'user'
                          ? 'bg-nb-accent-yellow text-nb-ink border-[2px] border-nb-ink shadow-nb-sm'
                          : 'bg-nb-surface-muted text-nb-ink border-[2px] border-nb-ink/20'
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.text}</p>

                      {/* Optional Action Card */}
                      {m.action && (
                        <div className="mt-3 pt-2.5 border-t border-nb-ink/10">
                          {m.action.worker && (
                            <div className="mb-2 rounded-nb-md border-[1.5px] border-nb-ink/20 bg-nb-surface p-2.5 text-left shadow-nb-sm">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-black text-nb-ink text-xs">{m.action.worker.users?.name}</span>
                                <span className="text-nb-accent-orange font-black">₹{m.action.worker.hourly_rate}/hr</span>
                              </div>
                              <p className="text-[10px] font-medium text-nb-text-muted">{m.action.worker.category} • ⭐ {m.action.worker.rating} ({m.action.worker.total_ratings} reviews)</p>
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
                            className="w-full flex items-center justify-center gap-1.5 rounded-nb-md bg-nb-accent-blue border-[2px] border-nb-ink py-2 text-xs font-black text-nb-ink hover:bg-nb-accent-blue/80 transition-all shadow-nb-sm hover:shadow-nb-md active:shadow-nb-pressed active:translate-x-[3px] active:translate-y-[3px]"
                          >
                            <span>{m.action.label}</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      )}

                      <span className="mt-1 block text-right text-[9px] text-nb-text-muted">{m.timestamp}</span>
                    </div>

                    {m.sender === 'user' && (
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-nb-sm bg-nb-accent-green text-nb-ink border-[2px] border-nb-ink mt-0.5 shadow-nb-sm">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-nb-text-muted">
                    <div className="flex h-7 w-7 items-center justify-center rounded-nb-sm bg-nb-accent-blue text-nb-ink border-[2px] border-nb-ink">
                      <Bot size={14} />
                    </div>
                    <div className="flex items-center gap-1 rounded-nb-lg border-[1.5px] border-nb-ink/20 bg-nb-surface-muted px-3 py-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-nb-accent-orange animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-nb-accent-orange animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-nb-accent-orange animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="border-t-[2px] border-nb-ink/20 bg-nb-surface-muted p-2 overflow-x-auto flex gap-1.5">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="flex-shrink-0 rounded-nb-sm border-[1.5px] border-nb-ink/20 bg-nb-surface px-2.5 py-1 text-[10px] font-bold text-nb-ink hover:border-nb-ink hover:bg-nb-accent-blue/20 hover:shadow-nb-sm transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="border-t-[2px] border-nb-ink/20 bg-nb-surface p-3">
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
                    className="flex-1 rounded-nb-md border-[2px] border-nb-ink bg-nb-surface px-3.5 py-2 text-xs font-medium text-nb-ink placeholder-nb-text-muted outline-none focus:shadow-nb-md transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="flex h-8 w-8 items-center justify-center rounded-nb-md bg-nb-accent-orange text-nb-ink border-[2px] border-nb-ink font-black transition-all shadow-nb-sm hover:shadow-nb-md disabled:opacity-40"
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