"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, Edit, Plus } from "lucide-react"
import { CATEGORIES, type Budget } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface BudgetFormProps {
  budgets: Budget[]
  onBudgetUpdated: (budget: Omit<Budget, "_id">) => void
  onBudgetDeleted: (id: string) => void
}

export function BudgetForm({ budgets, onBudgetUpdated, onBudgetDeleted }: BudgetFormProps) {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const { toast } = useToast()

  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentBudgets = budgets.filter((b) => b.month === currentMonth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCategory || !amount) {
      toast({
        title: "Error",
        description: "Please select a category and enter an amount",
        variant: "destructive",
      })
      return
    }

    if (Number.parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Budget amount must be greater than 0",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const budget = {
        category: selectedCategory,
        amount: Number.parseFloat(amount),
        month: currentMonth,
      }

      onBudgetUpdated(budget)

      toast({
        title: "Success",
        description: "Budget saved successfully",
      })

      setSelectedCategory("")
      setAmount("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save budget",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBudget) return

    setLoading(true)

    try {
      const updatedBudget = {
        category: editingBudget.category,
        amount: editingBudget.amount,
        month: editingBudget.month,
      }

      onBudgetUpdated(updatedBudget)

      toast({
        title: "Success",
        description: "Budget updated successfully",
      })

      setEditingBudget(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, category: string) => {
    if (!confirm(`Are you sure you want to delete the ${category} budget?`)) return

    try {
      onBudgetDeleted(id)

      toast({
        title: "Success",
        description: "Budget deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive",
      })
    }
  }

  const getCurrentBudget = (category: string) => {
    return currentBudgets.find((b) => b.category === category)?.amount || 0
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Add New Budget Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category} {getCurrentBudget(category) > 0 && `(${formatCurrency(getCurrentBudget(category))})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Monthly Budget Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-background/50"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Set Budget"}
        </Button>
      </form>

      {/* Current Budgets List */}
      {currentBudgets.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Current Month Budgets</h4>
          <div className="space-y-2">
            {currentBudgets.map((budget) => (
              <Card key={budget._id} className="border-0 bg-muted/30 hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-primary/20"></div>
                      <div>
                        <span className="font-medium">{budget.category}</span>
                        <p className="text-sm text-muted-foreground">Monthly limit</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{formatCurrency(budget.amount)}</span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(budget)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-background/95 backdrop-blur-sm">
                          <DialogHeader>
                            <DialogTitle>Edit Budget - {budget.category}</DialogTitle>
                          </DialogHeader>
                          {editingBudget && (
                            <form onSubmit={handleUpdate} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-amount">Monthly Budget Amount</Label>
                                <Input
                                  id="edit-amount"
                                  type="number"
                                  step="0.01"
                                  value={editingBudget.amount}
                                  onChange={(e) =>
                                    setEditingBudget({
                                      ...editingBudget,
                                      amount: Number.parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="bg-background/50"
                                  required
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button type="submit" disabled={loading}>
                                  {loading ? "Updating..." : "Update Budget"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setEditingBudget(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(budget._id!, budget.category)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
