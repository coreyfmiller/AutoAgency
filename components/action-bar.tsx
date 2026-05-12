"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Loader2,
  Github,
  Rocket,
  ExternalLink,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
} from "lucide-react"
import { useProjectStore } from "@/lib/store"

export function ActionBar() {
  const {
    currentStep,
    auditResult,
    pushToGitHub,
    deployToVercel,
    isPushingToGit,
    isDeploying,
    githubUrl,
    deploymentUrl,
    error,
    reset,
  } = useProjectStore()

  const [projectName, setProjectName] = useState("")

  if (currentStep !== "workspace") return null

  const defaultProjectName = auditResult?.analysis.businessName
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-") || "my-project"

  const handlePushToGit = async () => {
    const name = projectName || defaultProjectName
    await pushToGitHub(name)
  }

  const handleDeploy = async () => {
    const name = projectName || defaultProjectName
    await deployToVercel(name)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-4 space-y-3"
    >
      {/* Status Messages */}
      {isPushingToGit && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          <span className="text-sm text-blue-600 font-medium">
            Creating repo & uploading images... This may take a minute.
          </span>
        </div>
      )}

      {isDeploying && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          <span className="text-sm text-blue-600 font-medium">
            Deploying to Vercel...
          </span>
        </div>
      )}

      {githubUrl && !deploymentUrl && !isPushingToGit && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600 font-medium">
            Pushed to GitHub!
          </span>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-green-600 underline flex items-center gap-1 ml-auto"
          >
            View repo <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {deploymentUrl && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600 font-medium">
            Deployed to Vercel!
          </span>
          <div className="flex items-center gap-3 ml-auto">
            <a
              href={githubUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-600 underline flex items-center gap-1"
            >
              Repo <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={deploymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-600 underline flex items-center gap-1"
            >
              Live site <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-sm text-red-600 font-medium">{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Project name input */}
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder={defaultProjectName}
          className="px-3 py-2 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary/50 w-48"
        />

        {/* Push to GitHub */}
        <button
          onClick={handlePushToGit}
          disabled={isPushingToGit || !!githubUrl}
          className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
            githubUrl
              ? "bg-muted/50 text-muted-foreground border border-border/50 opacity-60"
              : "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20"
          } disabled:cursor-not-allowed`}
        >
          {isPushingToGit ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : githubUrl ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Github className="w-4 h-4" />
          )}
          {isPushingToGit ? "Pushing..." : githubUrl ? "Pushed to GitHub" : "Push to GitHub"}
        </button>

        {/* Deploy to Vercel */}
        <button
          onClick={handleDeploy}
          disabled={isDeploying || !githubUrl || !!deploymentUrl}
          className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
            deploymentUrl
              ? "bg-muted/50 text-muted-foreground border border-border/50 opacity-60"
              : githubUrl && !deploymentUrl
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-secondary text-muted-foreground"
          } disabled:cursor-not-allowed`}
        >
          {isDeploying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : deploymentUrl ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Rocket className="w-4 h-4" />
          )}
          {isDeploying ? "Deploying..." : deploymentUrl ? "Deployed to Vercel" : "Deploy to Vercel"}
        </button>

        <div className="flex-1" />

        {/* Start over */}
        <button
          onClick={reset}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          New project
        </button>
      </div>
    </motion.div>
  )
}
