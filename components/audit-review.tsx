"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Palette,
  Type,
  Image as ImageIcon,
  Globe,
  Sparkles,
  Loader2,
  Edit3,
  Eye,
  Rocket,
} from "lucide-react"
import { useProjectStore } from "@/lib/store"

export function AuditReview() {
  const {
    currentStep,
    auditResult,
    customInstructions,
    setCustomInstructions,
    startGeneration,
    generatedCode,
    startDeployment,
  } = useProjectStore()

  const [showPrompt, setShowPrompt] = useState(false)
  const [projectName, setProjectName] = useState("")

  if (!auditResult || (currentStep !== "reviewing" && currentStep !== "generating" && currentStep !== "deploying" && currentStep !== "complete")) {
    return null
  }

  const { scraped, analysis, prompt } = auditResult

  const handleGenerate = async () => {
    await startGeneration()
  }

  const handleDeploy = async () => {
    const name = projectName || analysis.brandName.toLowerCase().replace(/\s+/g, "-") + "-rebuild"
    await startDeployment(name)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Audit Results Header */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Audit Results: {analysis.brandName}
          </h2>
          <span className="text-sm text-muted-foreground px-3 py-1 rounded-full bg-secondary">
            {analysis.visualStyle}
          </span>
        </div>

        {/* Screenshot Preview */}
        {scraped.screenshot && (
          <div className="mb-6 rounded-xl overflow-hidden border border-border/50">
            <img
              src={scraped.screenshot}
              alt="Website screenshot"
              className="w-full h-48 object-cover object-top"
            />
          </div>
        )}

        {/* Brand DNA Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Colors */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Palette className="w-4 h-4" />
              Color Palette
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(analysis.colorPalette).map(([name, hex]) => (
                <div key={name} className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg border border-border/50 shadow-sm"
                    style={{ backgroundColor: hex }}
                  />
                  <div>
                    <p className="text-xs font-medium text-foreground capitalize">{name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Type className="w-4 h-4" />
              Typography
            </div>
            <div className="space-y-2">
              <div className="pl-3 border-l-2 border-primary/30">
                <p className="text-sm font-semibold text-foreground">{analysis.typography.primary}</p>
                <p className="text-xs text-muted-foreground">Primary</p>
              </div>
              <div className="pl-3 border-l-2 border-accent/30">
                <p className="text-sm font-medium text-foreground">{analysis.typography.secondary}</p>
                <p className="text-xs text-muted-foreground">Secondary</p>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ImageIcon className="w-4 h-4" />
              Key Images ({scraped.images.length})
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {scraped.images.slice(0, 4).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Asset ${i + 1}`}
                  className="w-14 h-14 rounded-lg object-cover border border-border/50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Structure */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Globe className="w-4 h-4" />
              Structure
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Nav: {scraped.navLinks.slice(0, 5).join(", ")}
              </p>
              <p className="text-xs text-muted-foreground">
                Sections: {analysis.suggestedSections.join(", ")}
              </p>
              <p className="text-xs text-muted-foreground">
                Audience: {analysis.targetAudience}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Preview & Custom Instructions */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            Generation Prompt
          </h3>
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            {showPrompt ? "Hide" : "Preview"} Prompt
          </button>
        </div>

        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4"
          >
            <pre className="text-xs text-muted-foreground bg-secondary/50 rounded-xl p-4 overflow-auto max-h-64 whitespace-pre-wrap font-mono">
              {prompt.fullPrompt}
            </pre>
          </motion.div>
        )}

        {/* Custom Instructions */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Custom Instructions (optional)
          </label>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g., Make it look more like Apple's website, Use a dark theme with neon accents, Add a pricing section"
            className="w-full h-24 px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm resize-none outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-6">
          {currentStep === "reviewing" && (
            <motion.button
              onClick={handleGenerate}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-4 h-4" />
              Generate with v0
            </motion.button>
          )}

          {currentStep === "generating" && (
            <div className="px-6 py-3 rounded-xl bg-secondary text-foreground font-medium text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating code...
            </div>
          )}

          {(currentStep === "deploying" || generatedCode) && currentStep !== "complete" && (
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={`${analysis.brandName.toLowerCase().replace(/\s+/g, "-")}-rebuild`}
                className="px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary/50"
              />
              <motion.button
                onClick={handleDeploy}
                disabled={currentStep === "deploying"}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium text-sm flex items-center gap-2 disabled:opacity-70"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {currentStep === "deploying" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Deploy to Vercel
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Generated Code Preview */}
      {generatedCode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Generated Code</h3>
          <pre className="text-xs text-muted-foreground bg-secondary/50 rounded-xl p-4 overflow-auto max-h-96 whitespace-pre-wrap font-mono">
            {generatedCode}
          </pre>
        </motion.div>
      )}
    </motion.div>
  )
}
