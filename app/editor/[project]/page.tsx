"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Send,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface FileInfo {
  path: string;
  sha: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  files?: string[];
}

export default function EditorPage() {
  const params = useParams()
  const project = params.project as string

  const [repoFullName, setRepoFullName] = useState("")
  const [vercelUrl, setVercelUrl] = useState("")
  const [files, setFiles] = useState<FileInfo[]>([])
  const [images, setImages] = useState<string[]>([])
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [showMediaPanel, setShowMediaPanel] = useState(false)

  const [instruction, setInstruction] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [iframeKey, setIframeKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Load project data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("refreshfactory-project")
    if (stored) {
      try {
        const data = JSON.parse(stored)
        const state = data.state
        if (state?.githubUrl) {
          const match = state.githubUrl.match(/github\.com\/([^/]+\/[^/]+)/)
          if (match) setRepoFullName(match[1])
        }
        if (state?.deploymentUrl) {
          setVercelUrl(state.deploymentUrl)
        }
        if (state?.auditResult?.scraped?.images) {
          setImages(state.auditResult.scraped.images)
        }
      } catch {}
    }
  }, [])

  // Load file list from repo
  const loadFiles = useCallback(async () => {
    if (!repoFullName) return
    setIsLoading(true)
    try {
      const res = await fetch("/api/editor/read-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoFullName }),
      })
      if (res.ok) {
        const data = await res.json()
        setFiles(data.files)
      }
    } catch {}
    setIsLoading(false)
  }, [repoFullName])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  // Also load images from the repo's public/images folder
  useEffect(() => {
    if (!repoFullName) return
    fetch(`https://api.github.com/repos/${repoFullName}/contents/public/images`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data)) {
          const repoImages = data.map((f: { name: string }) => f.name)
          setImages((prev) => [...new Set([...repoImages, ...prev])])
        }
      })
      .catch(() => {})
  }, [repoFullName])

  const handleSendEdit = async () => {
    if (!instruction.trim() && selectedImages.length === 0) return
    if (!repoFullName) return

    setIsEditing(true)
    setError(null)

    let message = instruction.trim()
    if (selectedImages.length > 0) {
      const imageNames = selectedImages
      message = message
        ? `${message}\n\nUse these images: ${imageNames.join(", ")}`
        : `Add these images to the site: ${imageNames.join(", ")}`
    }

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: message, timestamp: Date.now() }])
    setInstruction("")
    setSelectedImages([])

    try {
      const res = await fetch("/api/editor/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoFullName,
          instruction: message,
          images: selectedImages,
          fileList: files,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Edit failed")
      }

      // Add assistant response
      const filesUpdated = data.updatedFiles?.join(", ") || "unknown files"
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `Done — updated ${filesUpdated}. Vercel will rebuild in ~30s. Hit refresh to see changes.`,
        timestamp: Date.now(),
        files: data.updatedFiles,
      }])

      // Refresh file list
      await loadFiles()

      // Auto-refresh iframe after 35 seconds
      setTimeout(() => {
        setIframeKey((k) => k + 1)
      }, 35000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Edit failed"
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `Error: ${errorMsg}`,
        timestamp: Date.now(),
      }])
      setError(errorMsg)
    } finally {
      setIsEditing(false)
    }
  }

  const refreshPreview = () => {
    setIframeKey((k) => k + 1)
  }

  const toggleImage = (img: string) => {
    setSelectedImages((prev) =>
      prev.includes(img) ? prev.filter((i) => i !== img) : [...prev, img]
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-[1800px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="w-px h-6 bg-border" />
            <h1 className="text-lg font-semibold text-foreground font-mono">
              Editor: <span className="text-primary">{project}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {vercelUrl && (
              <a
                href={vercelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {vercelUrl.replace("https://", "")}
              </a>
            )}
            <button
              onClick={refreshPreview}
              className="px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* Left Panel - Editor */}
        <div className="w-[400px] border-r border-border/50 flex flex-col">
          {/* Edit Input */}
          <div className="p-4 border-b border-border/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMediaPanel(!showMediaPanel)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    showMediaPanel ? "bg-primary/10 text-primary" : "bg-secondary text-foreground"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Media
                </button>
                {selectedImages.length > 0 && (
                  <span className="text-xs text-primary font-medium">
                    {selectedImages.length} selected
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <textarea
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendEdit()
                    }
                  }}
                  placeholder="e.g., Add gallery images, remove Pergolas from services, change hero background..."
                  disabled={isEditing}
                  className="flex-1 px-3 py-2 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary/50 resize-none h-20 disabled:opacity-60"
                />
              </div>

              <button
                onClick={handleSendEdit}
                disabled={isEditing || (!instruction.trim() && selectedImages.length === 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isEditing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Editing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Apply Edit
                  </>
                )}
              </button>
            </div>

            {/* Status Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs text-red-600">{error}</span>
              </motion.div>
            )}
          </div>

          {/* Media Panel */}
          {showMediaPanel && (
            <div className="p-4 border-b border-border/50 max-h-56 overflow-y-auto">
              {/* Upload button */}
              <label className="flex items-center justify-center gap-1.5 mb-2 px-3 py-2 rounded-lg border border-dashed border-border cursor-pointer hover:bg-secondary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const fileList = e.target.files
                    if (!fileList || !repoFullName) return
                    for (let i = 0; i < fileList.length; i++) {
                      const file = fileList[i]
                      const formData = new FormData()
                      formData.append("file", file)
                      formData.append("repoFullName", repoFullName)
                      try {
                        const res = await fetch("/api/editor/upload-image", { method: "POST", body: formData })
                        if (res.ok) {
                          const data = await res.json()
                          setImages((prev) => [...prev, data.filename])
                        }
                      } catch {}
                    }
                    e.target.value = ""
                  }}
                />
                <span className="text-xs text-muted-foreground">+ Upload images</span>
              </label>

              <div className="grid grid-cols-4 gap-1.5">
                {images.map((img, i) => {
                  const isUrl = img.startsWith("http")
                  const displayName = isUrl ? `image-${i + 1}` : img
                  const isSelected = selectedImages.includes(displayName)
                  return (
                    <button
                      key={i}
                      onClick={() => toggleImage(displayName)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-border"
                      }`}
                    >
                      {isUrl ? (
                        <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                          <span className="text-[8px] text-muted-foreground truncate px-1">{img}</span>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Chat Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Send an instruction to start editing.</p>
                <p className="text-xs text-muted-foreground mt-1">e.g., "Add the deck photos to the gallery" or "Remove the testimonials section"</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/70 text-foreground border border-border/50"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
            {isEditing && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl bg-secondary/70 border border-border/50">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* File List */}
          <div className="p-4 border-t border-border/50 max-h-32 overflow-y-auto">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Project Files ({files.length})
            </h3>
            <div className="space-y-0.5">
              {files.map((f) => (
                <div key={f.path} className="text-xs text-muted-foreground font-mono truncate">
                  {f.path}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="flex-1 bg-secondary/20">
          {vercelUrl ? (
            <iframe
              key={iframeKey}
              src={vercelUrl}
              className="w-full h-full border-0"
              title="Live site preview"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <p className="text-sm">No deployment URL found.</p>
                <p className="text-xs">Deploy your project from the main page first.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
