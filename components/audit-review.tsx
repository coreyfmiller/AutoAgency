"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Image as ImageIcon,
  Globe,
  Sparkles,
  Loader2,
  Eye,
  Building2,
  Star,
  FileText,
} from "lucide-react"
import { useProjectStore } from "@/lib/store"

export function AuditReview() {
  const {
    currentStep,
    auditResult,
    customInstructions,
    setCustomInstructions,
    useScrapedImages,
    setUseScrapedImages,
    customLogoUrl,
    setCustomLogoUrl,
    customHeroUrl,
    setCustomHeroUrl,
    startGeneration,
    generatedCode,
    demoUrl,
  } = useProjectStore()

  const [showPrompt, setShowPrompt] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingHero, setIsUploadingHero] = useState(false)
  const [dismissedLogo, setDismissedLogo] = useState(false)
  const [dismissedHero, setDismissedHero] = useState(false)

  if (!auditResult || currentStep === "idle" || currentStep === "auditing") {
    return null
  }

  const { scraped, analysis } = auditResult

  const handleGenerate = async () => {
    await startGeneration()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Business Identity */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {analysis.businessName}
          </h2>
          <span className="text-sm text-muted-foreground px-3 py-1 rounded-full bg-secondary capitalize">
            {analysis.businessType}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Info */}
          <div className="space-y-3">
            {analysis.tagline && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Tagline</p>
                <p className="text-sm text-foreground font-medium">{analysis.tagline}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Headline</p>
              <p className="text-sm text-foreground font-medium">{analysis.headline}</p>
            </div>
            {analysis.subheadline && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Subheadline</p>
                <p className="text-sm text-foreground">{analysis.subheadline}</p>
              </div>
            )}
            {analysis.services.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Services</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {analysis.services.map((service, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-md bg-secondary text-foreground">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {analysis.phoneNumber && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p>
                <p className="text-sm text-foreground">{analysis.phoneNumber}</p>
              </div>
            )}
          </div>

          {/* Key Images */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Identified Assets</p>
            <div className="grid grid-cols-2 gap-3">
              {analysis.logoUrl && !dismissedLogo && (
                <div className="space-y-1">
                  <div className="relative rounded-lg overflow-hidden border border-primary/30 bg-secondary/50 p-2 h-20 flex items-center justify-center">
                    <img
                      src={analysis.logoUrl}
                      alt="Logo"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                    />
                    <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-medium">
                      LOGO
                    </span>
                    <button
                      onClick={() => setDismissedLogo(true)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <span className="text-xs font-bold">×</span>
                    </button>
                  </div>
                </div>
              )}
              {analysis.heroImageUrl && !dismissedHero && (
                <div className="space-y-1">
                  <div className="relative rounded-lg overflow-hidden border border-accent/30 h-20">
                    <img
                      src={analysis.heroImageUrl}
                      alt="Hero"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                    />
                    <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-accent text-white font-medium">
                      HERO
                    </span>
                    <button
                      onClick={() => setDismissedHero(true)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <span className="text-xs font-bold">×</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Upload custom logo & hero */}
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 cursor-pointer hover:bg-secondary/80 transition-colors text-sm text-muted-foreground">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setIsUploadingLogo(true)
                    try {
                      const formData = new FormData()
                      formData.append("file", file)
                      const res = await fetch("/api/upload", { method: "POST", body: formData })
                      if (res.ok) {
                        const data = await res.json()
                        setCustomLogoUrl(data.url)
                      }
                    } catch {}
                    setIsUploadingLogo(false)
                  }}
                />
                {isUploadingLogo ? "Uploading..." : customLogoUrl ? "✓ Custom logo uploaded" : "📁 Upload logo"}
              </label>
              {customLogoUrl && (
                <div className="flex items-center gap-2 pl-2">
                  <img src={customLogoUrl} alt="Custom logo" className="h-8 object-contain" />
                  <button onClick={() => setCustomLogoUrl(null)} className="text-xs text-red-500">Remove</button>
                </div>
              )}

              <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 cursor-pointer hover:bg-secondary/80 transition-colors text-sm text-muted-foreground">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setIsUploadingHero(true)
                    try {
                      const formData = new FormData()
                      formData.append("file", file)
                      const res = await fetch("/api/upload", { method: "POST", body: formData })
                      if (res.ok) {
                        const data = await res.json()
                        setCustomHeroUrl(data.url)
                      }
                    } catch {}
                    setIsUploadingHero(false)
                  }}
                />
                {isUploadingHero ? "Uploading..." : customHeroUrl ? "✓ Custom hero uploaded" : "📁 Upload hero image"}
              </label>
              {customHeroUrl && (
                <div className="flex items-center gap-2 pl-2">
                  <img src={customHeroUrl} alt="Custom hero" className="h-12 w-24 object-cover rounded" />
                  <button onClick={() => setCustomHeroUrl(null)} className="text-xs text-red-500">Remove</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* All Scraped Images */}
      {scraped.images.length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            All Media ({scraped.images.length} images)
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {scraped.images.map((img, i) => {
              const classification = analysis.allImages.find((ai) => ai.url === img)
              return (
                <div key={i} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border border-border/50 bg-secondary/30">
                    <img
                      src={img}
                      alt={`Asset ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "" }}
                    />
                  </div>
                  {classification && classification.type !== "other" && (
                    <span className="absolute bottom-0.5 left-0.5 text-[9px] px-1 py-0.5 rounded bg-black/70 text-white capitalize">
                      {classification.type}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* v0 Prompt & Generation */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            v0 Generation Prompt
          </h3>
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            {showPrompt ? "Hide" : "Preview"}
          </button>
        </div>

        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4"
          >
            <pre className="text-xs text-muted-foreground bg-secondary/50 rounded-xl p-4 overflow-auto max-h-48 whitespace-pre-wrap font-mono">
              {analysis.v0Prompt}
            </pre>
          </motion.div>
        )}

        {/* Image Toggle */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
          <button
            onClick={() => setUseScrapedImages(!useScrapedImages)}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              useScrapedImages ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                useScrapedImages ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
          <div>
            <p className="text-sm font-medium text-foreground">
              {useScrapedImages ? "Use scraped images" : "Let v0 generate all images"}
            </p>
            <p className="text-xs text-muted-foreground">
              {useScrapedImages
                ? "Logo and hero image from the original site"
                : "v0 will use its own placeholder/stock images for everything"}
            </p>
          </div>
        </div>

        {/* Custom Instructions */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Custom Instructions (optional)
          </label>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g., Use a dark theme, Make it look more premium, Add an animated hero section"
            className="w-full h-20 px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm resize-none outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Generate Button */}
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
              Generating your site...
            </div>
          )}
        </div>
      </div>

      {/* Demo Preview */}
      {demoUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Live Preview
          </h3>
          <div className="rounded-xl overflow-hidden border border-border/50">
            <iframe
              src={demoUrl}
              className="w-full h-[600px]"
              title="Generated site preview"
            />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Globe className="w-4 h-4" />
              Open in new tab
            </a>
          </div>
        </motion.div>
      )}

      {/* Generated Code */}
      {generatedCode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Generated Code</h3>
          <pre className="text-xs text-muted-foreground bg-secondary/50 rounded-xl p-4 overflow-auto max-h-64 whitespace-pre-wrap font-mono">
            {generatedCode.slice(0, 3000)}{generatedCode.length > 3000 ? "\n\n... (truncated)" : ""}
          </pre>
        </motion.div>
      )}
    </motion.div>
  )
}
