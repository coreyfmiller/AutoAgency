"use client"

import { useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export function UrlInput() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = () => {
    if (!url) return
    setIsLoading(true)
    // Simulate audit process
    setTimeout(() => setIsLoading(false), 3000)
  }

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="url"
              placeholder="Enter website URL to audit and rebuild..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-12 pl-10 text-base"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !url}
            className="h-12 px-6 text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Audit & Rebuild Website"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
