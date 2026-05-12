"use client"

import { motion } from "framer-motion"
import { ExternalLink, Github, Globe, RotateCcw } from "lucide-react"
import { useProjectStore } from "@/lib/store"

export function DeploymentSuccess() {
  const { currentStep, deploymentUrl, githubUrl, auditResult, reset } = useProjectStore()

  if (currentStep !== "complete") return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-panel rounded-2xl p-8 text-center space-y-6"
    >
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center"
      >
        <motion.svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.path
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          />
        </motion.svg>
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {auditResult?.analysis.brandName} Rebuilt & Deployed!
        </h2>
        <p className="text-muted-foreground">
          Your modern rebuild is live and ready to share.
        </p>
      </div>

      {/* Links */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {deploymentUrl && (
          <a
            href={deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Globe className="w-4 h-4" />
            View Live Site
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-foreground font-medium text-sm hover:bg-secondary/80 transition-colors"
          >
            <Github className="w-4 h-4" />
            View Repository
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Start Over */}
      <button
        onClick={reset}
        className="flex items-center gap-2 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Start a new project
      </button>
    </motion.div>
  )
}
