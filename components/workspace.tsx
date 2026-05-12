"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Send,
  Loader2,
  Image as ImageIcon,
  X,
  CheckCircle2,
} from "lucide-react"
import { useProjectStore } from "@/lib/store"

export function Workspace() {
  const {
    currentStep,
    demoUrl,
    auditResult,
    chatId,
    sendEdit,
    isEditing,
    editHistory,
  } = useProjectStore()

  const [editMessage, setEditMessage] = useState("")
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [showMediaPanel, setShowMediaPanel] = useState(false)

  if (currentStep !== "workspace") return null

  const handleSendEdit = async () => {
    if (!editMessage.trim() && selectedImages.length === 0) return

    let message = editMessage.trim()

    // If images are selected, append them to the message
    if (selectedImages.length > 0) {
      const imageList = selectedImages.map((url, i) => `${i + 1}. ${url}`).join("\n")
      message = message
        ? `${message}\n\nUse these images:\n${imageList}`
        : `Add these images to the site in appropriate sections:\n${imageList}`
    }

    setEditMessage("")
    setSelectedImages([])
    await sendEdit(message)
  }

  const toggleImageSelection = (url: string) => {
    setSelectedImages((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Preview + Sidebar Layout */}
      <div className="flex gap-4">
        {/* Main Preview */}
        <div className="flex-1 glass-panel rounded-2xl overflow-hidden">
          {demoUrl ? (
            <div className="relative">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-secondary/30">
                <span className="text-sm font-medium text-foreground">
                  Live Preview — {auditResult?.analysis.businessName}
                </span>
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  Open in new tab <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <iframe
                src={demoUrl}
                className="w-full h-[700px] border-0"
                title="Generated site preview"
              />
            </div>
          ) : (
            <div className="h-[700px] flex items-center justify-center text-muted-foreground">
              Preview loading...
            </div>
          )}
        </div>

        {/* Media Panel (collapsible) */}
        {showMediaPanel && auditResult && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-72 glass-panel rounded-2xl p-4 overflow-y-auto max-h-[760px]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-primary" />
                Media ({auditResult.scraped.images.length})
              </h3>
              <button
                onClick={() => setShowMediaPanel(false)}
                className="p-1 rounded hover:bg-secondary"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {selectedImages.length > 0 && (
              <div className="mb-3 px-2 py-1.5 rounded-lg bg-primary/10 text-xs text-primary font-medium">
                {selectedImages.length} selected — send an edit to place them
              </div>
            )}

            <div className="grid grid-cols-3 gap-1.5">
              {auditResult.scraped.images.map((img, i) => {
                const isSelected = selectedImages.includes(img)
                const classification = auditResult.analysis.allImages?.find(
                  (ai) => ai.url === img
                )
                return (
                  <button
                    key={i}
                    onClick={() => toggleImageSelection(img)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Asset ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = ""
                      }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    {classification && classification.type !== "other" && (
                      <span className="absolute bottom-0 left-0 right-0 text-[8px] px-1 py-0.5 bg-black/70 text-white text-center capitalize truncate">
                        {classification.type}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Edit Panel */}
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          {/* Media toggle */}
          <button
            onClick={() => setShowMediaPanel(!showMediaPanel)}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
              showMediaPanel
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Media
          </button>
        </div>

        {/* Edit history */}
        {editHistory.length > 0 && (
          <div className="mb-3 space-y-2 max-h-32 overflow-y-auto">
            {editHistory.map((edit, i) => (
              <div key={i} className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg bg-secondary/50">
                {edit.message.slice(0, 100)}{edit.message.length > 100 ? "..." : ""}
              </div>
            ))}
          </div>
        )}

        {/* Edit input */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendEdit()
                }
              }}
              placeholder={
                selectedImages.length > 0
                  ? `Tell v0 where to place ${selectedImages.length} selected image(s)...`
                  : "Send edits to v0... (e.g., 'Make the hero section darker', 'Add a pricing table')"
              }
              disabled={isEditing}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary/50 transition-colors disabled:opacity-60"
            />
            {selectedImages.length > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary font-medium">
                +{selectedImages.length} images
              </span>
            )}
          </div>
          <button
            onClick={handleSendEdit}
            disabled={isEditing || (!editMessage.trim() && selectedImages.length === 0)}
            className="px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 disabled:opacity-60 hover:bg-primary/90 transition-colors"
          >
            {isEditing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
