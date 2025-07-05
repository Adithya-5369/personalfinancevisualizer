"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Edit, TrendingUp, TrendingDown, Search } from "lucide-react"
import { type Transaction, CATEGORIES } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface TransactionListProps {
  transactions: Transaction[]
  onTransactionUpdated: (transaction: Transaction) => void
  onTransactionDeleted: (id: string) => void
}

export function TransactionList({ transactions, onTransactionUpdated, onTransactionDeleted }: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction({
      ...transaction,
      date: transaction.date.split("T")[0], // Format date for input
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTransaction) return

    setLoading(true)

    try {
      const updatedTransaction = {
        ...editingTransaction,
        updatedAt: new Date().toISOString(),
      }

      onTransactionUpdated(updatedTransaction)

      toast({
        title: "Success",
        description: "Transaction updated successfully",
      })

      setEditingTransaction(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return

    try {
      onTransactionDeleted(id)

      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-background/50 border-0 shadow-sm"
        />
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-full flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No transactions found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search terms" : "Add your first transaction to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {filteredTransactions.map((transaction) => (
            <Card
              key={transaction._id}
              className="border-0 bg-card/30 hover:bg-card/50 transition-all duration-200 shadow-sm"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.type === "income"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{transaction.description}</span>
                        <Badge variant={transaction.type === "income" ? "default" : "secondary"} className="text-xs">
                          {transaction.category}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{formatDate(transaction.date)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold text-lg ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-background/95 backdrop-blur-sm">
                          <DialogHeader>
                            <DialogTitle>Edit Transaction</DialogTitle>
                          </DialogHeader>
                          {editingTransaction && (
                            <form onSubmit={handleUpdate} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-type">Type</Label>
                                <Select
                                  value={editingTransaction.type}
                                  onValueChange={(value: "income" | "expense") =>
                                    setEditingTransaction({ ...editingTransaction, type: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="expense">Expense</SelectItem>
                                    <SelectItem value="income">Income</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-amount">Amount</Label>
                                <Input
                                  id="edit-amount"
                                  type="number"
                                  step="0.01"
                                  value={editingTransaction.amount}
                                  onChange={(e) =>
                                    setEditingTransaction({
                                      ...editingTransaction,
                                      amount: Number.parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                  id="edit-description"
                                  value={editingTransaction.description}
                                  onChange={(e) =>
                                    setEditingTransaction({
                                      ...editingTransaction,
                                      description: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-category">Category</Label>
                                <Select
                                  value={editingTransaction.category}
                                  onValueChange={(value) =>
                                    setEditingTransaction({ ...editingTransaction, category: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
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
                                <Label htmlFor="edit-date">Date</Label>
                                <Input
                                  id="edit-date"
                                  type="date"
                                  value={editingTransaction.date}
                                  onChange={(e) =>
                                    setEditingTransaction({ ...editingTransaction, date: e.target.value })
                                  }
                                  required
                                />
                              </div>

                              <div className="flex gap-2">
                                <Button type="submit" disabled={loading}>
                                  {loading ? "Updating..." : "Update"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setEditingTransaction(null)}>
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
                        onClick={() => handleDelete(transaction._id!)}
                        disabled={loading}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
