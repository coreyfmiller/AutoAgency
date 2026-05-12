"use client"

import { ParticleField } from "@/components/particle-field"
import { AutogenLogo } from "@/components/autogen-logo"
import { UrlInput } from "@/components/url-input"
import { PipelineVisualization } from "@/components/pipeline-visualization"
import { ActionBar } from "@/components/action-bar"
import { AuditReview } from "@/components/audit-review"
import { Workspace } from "@/components/workspace"
import { useProjectStore } from "@/lib/store"
import { Settings, Bell, User, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function Dashboard() {
  const { currentStep, error, reset } = useProjectStore()

  const isInWorkspace = currentStep === "workspace"

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated particle background */}
      <ParticleField />

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm">
          <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
            <AutogenLogo />

            <nav className="hidden md:flex items-center gap-8">
              {["Dashboard", "Projects", "Analytics", "Settings"].map((item, i) => (
                <motion.a
                  key={item}
                  href="#"
                  className={`text-sm font-medium transition-colors ${
                    i === 0
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </motion.button>
              <div className="w-px h-6 bg-border mx-2" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground hidden lg:block">
                  Admin
                </span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className={`${isInWorkspace ? "max-w-[1800px]" : "max-w-[1600px]"} mx-auto px-6 py-8 space-y-8`}>
          {/* URL Input Section - hide in workspace */}
          {!isInWorkspace && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground tracking-tight text-balance font-mono">
                  <span className="text-primary">&gt;</span> URL in. Modern site out.
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto text-balance font-mono text-sm">
                  Scrape. Analyze. Generate. Deploy. Fully automated pipeline.
                </p>
              </div>
              <UrlInput />
            </motion.section>
          )}

          {/* Error Display */}
          {currentStep === "error" && error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-2xl p-6 border border-red-500/30"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Something went wrong</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}

          {/* Pipeline Visualization - always visible */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <PipelineVisualization />
          </motion.section>

          {/* Action Bar - under pipeline in workspace */}
          <ActionBar />

          {/* Audit Review (appears after audit completes) */}
          {!isInWorkspace && <AuditReview />}

          {/* Workspace (appears after generation) */}
          <Workspace />
        </main>

        {/* Footer - hide in workspace */}
        {!isInWorkspace && (
          <footer className="border-t border-border/50 backdrop-blur-sm mt-12">
            <div className="max-w-[1600px] mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-mono">RefreshFactory.ai</span> v2.0
              </p>
              <div className="flex items-center gap-6">
                <span className="text-xs text-muted-foreground flex items-center gap-2">
                  <motion.span
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
                  All systems operational
                </span>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  )
}
