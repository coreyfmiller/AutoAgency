"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Send, Terminal, Loader2 } from "lucide-react"

interface Message {
  id: number
  type: "user" | "system" | "agent"
  content: string
  timestamp: Date
}

export function KiroConsole() {
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "system",
      content: "Kiro Agent initialized. Ready to process commands.",
      timestamp: new Date(),
    },
    {
      id: 2,
      type: "agent",
      content: "Analyzing techstartup.io... Found 23 optimization opportunities.",
      timestamp: new Date(),
    },
    {
      id: 3,
      type: "agent",
      content: "Generating component structure for creativestudio.co layout.",
      timestamp: new Date(),
    },
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    const newMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInput("")
    setIsProcessing(true)

    // Simulate agent response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          type: "agent",
          content: `Processing: "${input}"... Task queued successfully.`,
          timestamp: new Date(),
        },
      ])
      setIsProcessing(false)
    }, 1500)
  }

  return (
    <div className="glass-panel rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          Kiro Agent Console
        </h2>
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-[oklch(0.7_0.2_150)]"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.6, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Console output */}
      <div className="flex-1 bg-secondary/30 rounded-xl p-4 font-mono text-sm overflow-hidden relative">
        {/* Retro scan line effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
          }}
        />

        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-2"
              >
                {message.type === "system" && (
                  <Terminal className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                )}
                {message.type === "agent" && (
                  <Bot className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                )}
                {message.type === "user" && (
                  <span className="text-accent font-bold shrink-0">{">"}</span>
                )}
                <span
                  className={`${
                    message.type === "system"
                      ? "text-muted-foreground"
                      : message.type === "agent"
                        ? "text-foreground"
                        : "text-accent"
                  }`}
                >
                  {message.content}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-primary"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Processing...
              </motion.span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="relative flex items-center">
          <span className="absolute left-3 text-primary font-mono font-bold">
            {">"}
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter command..."
            className="w-full pl-8 pr-12 py-3 bg-secondary/50 rounded-xl font-mono text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="absolute right-2 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
