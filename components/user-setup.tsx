"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Wallet } from "lucide-react"

interface UserSetupProps {
  onUserSet: (name: string) => void
}

export function UserSetup({ onUserSet }: UserSetupProps) {
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    setIsSubmitting(true)

    // Small delay for better UX
    setTimeout(() => {
      onUserSet(name.trim())
      setIsSubmitting(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-3 bg-primary/10 rounded-2xl w-fit">
            <Wallet className="h-12 w-12 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome to Personal Finance Visualizer</CardTitle>
            <CardDescription className="mt-2">
              Let's get started by setting up your personal finance space
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                What should we call you?
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-background/50 border-0 shadow-sm h-12"
                  required
                  maxLength={50}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This will be used to personalize your experience and organize your data
              </p>
            </div>

            <Button type="submit" className="w-full h-12 shadow-sm" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Setting up...
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="text-center space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">What you'll get:</h4>
              <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                  <span>Track your income and expenses</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                  <span>Set and monitor budgets</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                  <span>Visualize your financial data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                  <span>Get smart spending insights</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
