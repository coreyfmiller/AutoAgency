"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Sparkles, Loader2 } from "lucide-react"
import { useProjectStore } from "@/lib/store"

export function UrlInput() {
  const [url, setUrl] = useState("")
  const [showFlare, setShowFlare] = useState(false)
  const { currentStep, startAudit, setTargetUrl } = useProjectStore()

  const isScanning = currentStep === "auditing"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url || isScanning) return

    // Auto-prepend https:// if no protocol is provided
    let normalizedUrl = url.trim()
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    setShowFlare(true)
    setTimeout(() => setShowFlare(false), 500)

    setTargetUrl(normalizedUrl)
    await startAudit()
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Glow background */}
      <motion.div
        className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ filter: "blur(20px)" }}
      />

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative glass-panel-strong rounded-full overflow-hidden">
          {/* Scan line animation */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                  animate={{
                    x: ["-100%", "400%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fractal pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <svg width="100%" height="100%" className="absolute inset-0">
              <pattern
                id="fractal"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="10" cy="10" r="1" fill="currentColor" />
                <circle cx="10" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#fractal)" />
            </svg>
          </div>

          <div className="relative flex items-center px-6 py-4">
            <Search className="w-5 h-5 text-muted-foreground mr-4" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="rescuedecks.ca"
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
            />
            <motion.button
              type="submit"
              disabled={isScanning || !url}
              className="relative ml-4 px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm flex items-center gap-2 disabled:opacity-70"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Light flare effect */}
              <AnimatePresence>
                {showFlare && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-white"
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </AnimatePresence>

              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Audit & Rebuild</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  )
}
