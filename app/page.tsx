"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { MonthlyExpensesChart } from "@/components/monthly-expenses-chart"
import { CategoryPieChart } from "@/components/category-pie-chart"
import { BudgetComparison } from "@/components/budget-comparison"
import { BudgetForm } from "@/components/budget-form"
import { DashboardSummary } from "@/components/dashboard-summary"
import { SpendingInsights } from "@/components/spending-insights"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserSetup } from "@/components/user-setup"
import { useUserName } from "@/lib/user-storage"
import type { Transaction, Budget } from "@/types"
import { Wallet, TrendingUp, Target, Lightbulb, Plus, LogOut } from "lucide-react"

export default function HomePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const { userName, isLoading: userLoading, updateUserName, removeUserName } = useUserName()

  // Load data from MongoDB when user name is available
  useEffect(() => {
    if (userName) {
      loadData()
    } else if (!userLoading) {
      setLoading(false)
    }
  }, [userName, userLoading])

  const loadData = async () => {
    if (!userName) return

    try {
      setLoading(true)

      // Fetch transactions and budgets for this user
      const [transactionsRes, budgetsRes] = await Promise.all([
        fetch(`/api/transactions?userName=${encodeURIComponent(userName)}`),
        fetch(`/api/budgets?userName=${encodeURIComponent(userName)}`),
      ])

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData)
      }

      if (budgetsRes.ok) {
        const budgetsData = await budgetsRes.json()
        setBudgets(budgetsData)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionAdded = async (newTransaction: Omit<Transaction, "_id">) => {
    if (!userName) return

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newTransaction,
          userName,
        }),
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error("Error adding transaction:", error)
    }
  }

  const handleTransactionUpdated = async (updatedTransaction: Transaction) => {
    if (!userName) return

    try {
      const response = await fetch(`/api/transactions/${updatedTransaction._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...updatedTransaction,
          userName,
        }),
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error("Error updating transaction:", error)
    }
  }

  const handleTransactionDeleted = async (id: string) => {
    if (!userName) return

    try {
      const response = await fetch(`/api/transactions/${id}?userName=${encodeURIComponent(userName)}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
    }
  }

  const handleBudgetUpdated = async (newBudget: Omit<Budget, "_id">) => {
    if (!userName) return

    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newBudget,
          userName,
        }),
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error("Error updating budget:", error)
    }
  }

  const handleBudgetDeleted = async (id: string) => {
    if (!userName) return

    try {
      const response = await fetch(`/api/budgets/${id}?userName=${encodeURIComponent(userName)}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error("Error deleting budget:", error)
    }
  }

  const handleUserSet = (name: string) => {
    updateUserName(name)
  }

  const handleLogout = () => {
    if (confirm("Are you sure you want to switch users? This will clear your current session.")) {
      removeUserName()
      setTransactions([])
      setBudgets([])
    }
  }

  // Show user setup if no user name is set
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!userName) {
    return <UserSetup onUserSet={handleUserSet} />
  }

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold">Loading your financial data...</h2>
          <p className="text-muted-foreground">Welcome back, {userName}!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-3 sm:p-6 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Personal Finance Visualizer
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Welcome back, <span className="font-medium text-foreground">{userName}</span>! Track your financial
                journey
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-0 bg-muted/50 hover:bg-muted text-xs sm:text-sm"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Switch User
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Dashboard Summary */}
        <DashboardSummary transactions={transactions} budgets={budgets} />

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-10 sm:h-12 p-1 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm"
            >
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger
              value="budgets"
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm"
            >
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Budgets</span>
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm"
            >
              <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Monthly Expenses Trend
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Your spending over the last 6 months including current month
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <MonthlyExpensesChart transactions={transactions} />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Category Breakdown
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Current month spending by category</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <CategoryPieChart transactions={transactions} />
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Budget Performance
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  How your spending compares to your budgets this month
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <BudgetComparison transactions={transactions} budgets={budgets} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm lg:col-span-1">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Add Transaction
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Record a new income or expense</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionForm onTransactionAdded={handleTransactionAdded} />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm lg:col-span-2">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-sm sm:text-lg">Transaction History</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Your recent financial activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionList
                    transactions={transactions}
                    onTransactionUpdated={handleTransactionUpdated}
                    onTransactionDeleted={handleTransactionDeleted}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Manage Budgets
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Set and edit spending limits for each category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BudgetForm
                    budgets={budgets}
                    onBudgetUpdated={handleBudgetUpdated}
                    onBudgetDeleted={handleBudgetDeleted}
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-sm sm:text-lg">Budget Overview</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Current month budget performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <BudgetComparison transactions={transactions} budgets={budgets} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4 sm:space-y-6">
            <SpendingInsights transactions={transactions} budgets={budgets} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
