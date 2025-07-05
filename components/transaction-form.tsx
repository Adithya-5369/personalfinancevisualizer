"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CATEGORIES, type Transaction } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Plus, IndianRupee } from "lucide-react"

interface TransactionFormProps {
  onTransactionAdded: (transaction: Omit<Transaction, "_id">) => void
}

export function TransactionForm({ onTransactionAdded }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    type: "expense" as "income" | "expense",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || !formData.description || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (Number.parseFloat(formData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const transaction = {
        amount: Number.parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        category: formData.category,
        type: formData.type,
      }

      onTransactionAdded(transaction)

      toast({
        title: "Success",
        description: `${formData.type === "income" ? "Income" : "Expense"} added successfully`,
      })

      setFormData({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        category: "",
        type: "expense",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="type" className="text-sm font-medium">
          Type
        </Label>
        <Select
          value={formData.type}
          onValueChange={(value: "income" | "expense") => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger className="bg-background/50 border-0 shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense" className="text-red-600">
              💸 Expense
            </SelectItem>
            <SelectItem value="income" className="text-green-600">
              💰 Income
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount" className="text-sm font-medium">
          Amount
        </Label>
        <div className="relative">
          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="pl-10 bg-background/50 border-0 shadow-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="What was this transaction for?"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-background/50 border-0 shadow-sm resize-none"
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-medium">
          Category
        </Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger className="bg-background/50 border-0 shadow-sm">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date" className="text-sm font-medium">
          Date
        </Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="bg-background/50 border-0 shadow-sm"
          required
        />
      </div>

      <Button type="submit" className="w-full h-11 shadow-sm" disabled={loading}>
        <Plus className="h-4 w-4 mr-2" />
        {loading ? "Adding..." : `Add ${formData.type === "income" ? "Income" : "Expense"}`}
      </Button>
    </form>
  )
}
