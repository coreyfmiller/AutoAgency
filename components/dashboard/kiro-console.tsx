"use client"

import { useState } from "react"
import { Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export function KiroConsole() {
  const [command, setCommand] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSend = () => {
    if (!command.trim()) return
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      setCommand("")
    }, 1500)
  }

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-accent" />
          Kiro Agent Console
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="Input your design commands... (e.g., 'Make the hero section more vibrant' or 'Add rounded corners to all buttons')"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="min-h-[100px] resize-none text-sm"
        />
        <Button
          onClick={handleSend}
          disabled={!command.trim() || isSending}
          className="w-full"
        >
          {isSending ? (
            "Sending..."
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Refinement Request
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
