"use client"

// Simple user name storage
export function getUserName(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("finance_user_name")
}

export function setUserName(name: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("finance_user_name", name.trim())
}

export function clearUserName(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("finance_user_name")
}

// Hook to use user name in React components
import { useState, useEffect } from "react"

export function useUserName() {
  const [userName, setUserNameState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const name = getUserName()
    setUserNameState(name)
    setIsLoading(false)
  }, [])

  const updateUserName = (name: string) => {
    setUserName(name)
    setUserNameState(name)
  }

  const removeUserName = () => {
    clearUserName()
    setUserNameState(null)
  }

  return {
    userName,
    isLoading,
    updateUserName,
    removeUserName,
  }
}
