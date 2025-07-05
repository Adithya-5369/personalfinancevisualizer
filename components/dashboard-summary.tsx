"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Transaction, Budget } from "@/types"
import { TrendingUp, TrendingDown, DollarSign, Target, Wallet, CreditCard } from "lucide-react"

interface DashboardSummaryProps {
  transactions: Transaction[]
  budgets: Budget[]
}

export function DashboardSummary({ transactions, budgets }: DashboardSummaryProps) {
  const summary = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth))

    const totalIncome = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalBudget = budgets.filter((b) => b.month === currentMonth).reduce((sum, b) => sum + b.amount, 0)

    // Category breakdown
    const categoryExpenses: { [key: string]: number } = {}
    currentMonthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount
      })

    const topCategory = Object.entries(categoryExpenses).sort(([, a], [, b]) => b - a)[0]

    // Recent transactions (last 5)
    const recentTransactions = transactions.slice(0, 5)

    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      totalBudget,
      budgetRemaining: totalBudget - totalExpenses,
      topCategory: topCategory ? { category: topCategory[0], amount: topCategory[1] } : null,
      recentTransactions,
    }
  }, [transactions, budgets])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Monthly Income</CardTitle>
          <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg">
            <TrendingUp className="h-4 w-4 text-green-700 dark:text-green-200" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {formatCurrency(summary.totalIncome)}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">Monthly Expenses</CardTitle>
          <div className="p-2 bg-red-200 dark:bg-red-800 rounded-lg">
            <TrendingDown className="h-4 w-4 text-red-700 dark:text-red-200" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
            {formatCurrency(summary.totalExpenses)}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Net Income</CardTitle>
          <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
            <DollarSign className="h-4 w-4 text-blue-700 dark:text-blue-200" />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${summary.netIncome >= 0 ? "text-blue-700 dark:text-blue-300" : "text-red-600"}`}
          >
            {formatCurrency(summary.netIncome)}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {summary.netIncome >= 0 ? "Positive cash flow" : "Negative cash flow"}
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Budget Status</CardTitle>
          <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
            <Target className="h-4 w-4 text-purple-700 dark:text-purple-200" />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${summary.budgetRemaining >= 0 ? "text-purple-700 dark:text-purple-300" : "text-red-600"}`}
          >
            {summary.totalBudget > 0 ? formatCurrency(summary.budgetRemaining) : "No Budget"}
          </div>
          {summary.totalBudget > 0 && (
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              {summary.budgetRemaining >= 0 ? "Under budget" : "Over budget"}
            </p>
          )}
        </CardContent>
      </Card>

      {summary.topCategory && (
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Top Spending Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {summary.topCategory.category}
              </Badge>
              <span className="text-xl font-bold">{formatCurrency(summary.topCategory.amount)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summary.recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent transactions</p>
            ) : (
              summary.recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        transaction.type === "income" ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <div>
                      <Badge variant="outline" className="text-xs mr-2">
                        {transaction.category}
                      </Badge>
                      <span className="text-sm truncate max-w-32">{transaction.description}</span>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
