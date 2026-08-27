import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, X, Send, Bot, User,
  Volume2, VolumeX, ArrowRight, Star, Check
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
          className="flex items-center gap-2 rounded-2xl border-2 border-black bg-[#F59E0B] px-4 py-2.5 text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-lg border border-black bg-white shadow-[1px_1px_0px_#000000]">
            <Sparkles size={12} className="text-black" />
          </div>
          <span>Ask CoLabour AI</span>
          <span className="rounded-md border border-black bg-white px-1.5 py-0.2 text-[9px] font-mono font-bold text-black uppercase">
            0% FEE
          </span>
        </motion.button>
      </div>

      {/* Interactive Chat Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-start sm:justify-start p-2 sm:p-6 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative flex h-[85vh] max-h-[620px] w-full max-w-md flex-col overflow-hidden rounded-3xl border-2 sm:border-[2.5px] border-black bg-[#FAF7F2] shadow-[8px_8px_0px_#000000]"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b-2 border-black bg-white px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-[#F59E0B] shadow-[2px_2px_0px_#000000]">
                    <Bot size={20} className="text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black uppercase text-neutral-900 flex items-center gap-1.5">
                      CoLabour AI Assistant
                      <span className="rounded-full bg-[#15803D] h-2 w-2 animate-pulse" />
                    </h3>
                    <p className="text-[10px] font-bold text-neutral-500">Live GPS Radar & Smart Fair Pricing</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleTts}
                    title={ttsEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
                    className={`rounded-xl border border-black p-1.5 transition-all cursor-pointer shadow-[1px_1px_0px_#000000] ${
                      ttsEnabled ? 'bg-[#BBF7D0] text-[#15803D]' : 'bg-white text-neutral-500 hover:bg-neutral-100'
                    }`}
                  >
                    {ttsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl border border-black bg-white p-1.5 text-neutral-700 hover:bg-neutral-100 shadow-[1px_1px_0px_#000000] cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'ai' && (
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl border border-black bg-[#F59E0B] text-black mt-0.5 shadow-[1px_1px_0px_#000000]">
                        <Bot size={14} className="stroke-[2.5]" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl border-2 border-black p-3 text-xs font-semibold leading-relaxed shadow-[2px_2px_0px_#000000] ${
                        m.sender === 'user'
                          ? 'bg-[#FEF3C7] text-neutral-900'
                          : 'bg-white text-neutral-900'
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.text}</p>

                      {/* Optional Action Card */}
                      {m.action && (
                        <div className="mt-2.5 pt-2.5 border-t border-dashed border-neutral-300">
                          {m.action.worker && (
                            <div className="mb-2 rounded-xl border border-black bg-[#FAF7F2] p-2 text-left">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-black text-neutral-900 text-xs">{m.action.worker.users?.name}</span>
                                <span className="text-[#15803D] font-mono font-black text-xs">₹{m.action.worker.hourly_rate}/hr</span>
                              </div>
                              <p className="text-[10px] font-bold text-neutral-500 flex items-center gap-1">
                                <span>{m.action.worker.category}</span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 text-neutral-800">
                                  <Star size={10} className="fill-[#F59E0B] text-[#F59E0B]" />
                                  {m.action.worker.rating}
                                </span>
                              </p>
                            </div>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => {
                              if (m.action?.url) {
                                setIsOpen(false);
                                navigate(m.action.url);
                              }
                            }}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-black bg-[#F59E0B] hover:bg-[#E68A00] py-1.5 text-xs font-black uppercase text-black shadow-[1px_1px_0px_#000000] cursor-pointer"
                          >
                            <span>{m.action.label}</span>
                            <ArrowRight size={13} className="stroke-[2.5]" />
                          </motion.button>
                        </div>
                      )}

                      <span className="mt-1 block text-right text-[9px] font-mono font-bold text-neutral-400">{m.timestamp}</span>
                    </div>

                    {m.sender === 'user' && (
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl border border-black bg-white text-neutral-800 mt-0.5 shadow-[1px_1px_0px_#000000]">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-black bg-[#F59E0B] text-black shadow-[1px_1px_0px_#000000]">
                      <Bot size={14} className="stroke-[2.5]" />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl border-2 border-black bg-white px-3 py-2 shadow-[2px_2px_0px_#000000]">
                      <span className="h-2 w-2 rounded-full bg-neutral-900 animate-bounce" />
                      <span className="h-2 w-2 rounded-full bg-neutral-900 animate-bounce [animation-delay:0.2s]" />
                      <span className="h-2 w-2 rounded-full bg-neutral-900 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="border-t border-neutral-300 bg-neutral-50 p-2 overflow-x-auto flex gap-1.5">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="flex-shrink-0 rounded-xl border border-black bg-white px-2.5 py-1 text-[10px] font-bold text-neutral-800 hover:bg-[#FEF3C7] shadow-[1px_1px_0px_#000000] active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="border-t-2 border-black bg-white p-3">
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
                    className="flex-1 rounded-xl border-2 border-black bg-[#FAF7F2] px-3.5 py-2 text-xs font-bold text-neutral-900 placeholder-neutral-400 outline-none shadow-[2px_2px_0px_#000000] focus:bg-white transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-[#F59E0B] text-black font-black shadow-[2px_2px_0px_#000000] hover:bg-[#E68A00] disabled:opacity-40 cursor-pointer"
                  >
                    <Send size={14} className="stroke-[2.5]" />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

