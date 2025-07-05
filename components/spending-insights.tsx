"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import type { Transaction, Budget } from "@/types"
import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle, Lightbulb, Target, DollarSign } from "lucide-react"

interface SpendingInsightsProps {
  transactions: Transaction[]
  budgets: Budget[]
}

export function SpendingInsights({ transactions, budgets }: SpendingInsightsProps) {
  const insights = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)

    const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth))
    const previousMonthTransactions = transactions.filter((t) => t.date.startsWith(previousMonth))

    // Current month expenses by category
    const currentExpenses: { [key: string]: number } = {}
    currentMonthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        currentExpenses[t.category] = (currentExpenses[t.category] || 0) + t.amount
      })

    // Previous month expenses by category
    const previousExpenses: { [key: string]: number } = {}
    previousMonthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        previousExpenses[t.category] = (previousExpenses[t.category] || 0) + t.amount
      })

    // Budget analysis
    const currentBudgets = budgets.filter((b) => b.month === currentMonth)
    const budgetInsights: Array<{
      category: string
      budget: number
      spent: number
      status: "over" | "warning" | "good"
      message: string
      percentage: number
    }> = []

    currentBudgets.forEach((budget) => {
      const spent = currentExpenses[budget.category] || 0
      const percentage = (spent / budget.amount) * 100

      let status: "over" | "warning" | "good" = "good"
      let message = `You're doing well with ${budget.category}!`

      if (percentage > 100) {
        status = "over"
        message = `You're overspending on ${budget.category} by $${(spent - budget.amount).toFixed(2)}`
      } else if (percentage > 80) {
        status = "warning"
        message = `You're close to your ${budget.category} budget limit (${percentage.toFixed(0)}% used)`
      } else if (percentage > 0) {
        message = `You have $${(budget.amount - spent).toFixed(2)} left in your ${budget.category} budget`
      }

      budgetInsights.push({
        category: budget.category,
        budget: budget.amount,
        spent,
        status,
        message,
        percentage: Math.min(percentage, 100),
      })
    })

    // Spending trends
    const trendInsights: Array<{
      category: string
      change: number
      trend: "up" | "down" | "stable"
      message: string
    }> = []

    Object.keys({ ...currentExpenses, ...previousExpenses }).forEach((category) => {
      const current = currentExpenses[category] || 0
      const previous = previousExpenses[category] || 0

      if (previous > 0) {
        const change = ((current - previous) / previous) * 100
        let trend: "up" | "down" | "stable" = "stable"
        let message = `Your ${category} spending is stable`

        if (Math.abs(change) > 10) {
          if (change > 0) {
            trend = "up"
            message = `Your ${category} spending increased by ${change.toFixed(0)}% this month`
          } else {
            trend = "down"
            message = `Your ${category} spending decreased by ${Math.abs(change).toFixed(0)}% this month`
          }
        }

        trendInsights.push({
          category,
          change,
          trend,
          message,
        })
      }
    })

    // Total savings calculation
    const currentTotalExpenses = Object.values(currentExpenses).reduce((sum, amount) => sum + amount, 0)
    const previousTotalExpenses = Object.values(previousExpenses).reduce((sum, amount) => sum + amount, 0)
    const totalSavings = previousTotalExpenses - currentTotalExpenses

    return {
      budgetInsights: budgetInsights.sort((a, b) => {
        const statusOrder = { over: 0, warning: 1, good: 2 }
        return statusOrder[a.status] - statusOrder[b.status]
      }),
      trendInsights: trendInsights.filter((insight) => insight.trend !== "stable"),
      totalSavings,
      topSpendingCategory: Object.entries(currentExpenses).sort(([, a], [, b]) => b - a)[0],
    }
  }, [transactions, budgets])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Smart Insights</h2>
        </div>
        <p className="text-muted-foreground">
          Analysis of your financial patterns and personalized recommendations
        </p>
      </div>

      {/* Overall Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Monthly Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.totalSavings !== 0 && (
            <Alert
              className={`border-0 ${insights.totalSavings > 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}
            >
              <CheckCircle className={`h-4 w-4 ${insights.totalSavings > 0 ? "text-green-600" : "text-red-600"}`} />
              <AlertDescription
                className={
                  insights.totalSavings > 0 ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                }
              >
                {insights.totalSavings > 0
                  ? `🎉 Great job! You saved ${formatCurrency(insights.totalSavings)} compared to last month.`
                  : `⚠️ You spent ${formatCurrency(Math.abs(insights.totalSavings))} more than last month.`}
              </AlertDescription>
            </Alert>
          )}

          {insights.topSpendingCategory && (
            <div className="flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Top Spending Category</p>
                  <p className="text-xl font-bold">{insights.topSpendingCategory[0]}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{formatCurrency(insights.topSpendingCategory[1])}</p>
                <p className="text-sm text-muted-foreground">this month</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Insights */}
      {insights.budgetInsights.length > 0 && (
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Budget Performance
            </CardTitle>
            <CardDescription>How you're tracking against your budgets this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.budgetInsights.map((insight) => (
              <div key={insight.category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {insight.status === "over" ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : insight.status === "warning" ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <span className="font-medium">{insight.category}</span>
                  </div>
                  <Badge
                    variant={
                      insight.status === "over" ? "destructive" : insight.status === "warning" ? "secondary" : "default"
                    }
                    className="text-xs"
                  >
                    {formatCurrency(insight.spent)} / {formatCurrency(insight.budget)}
                  </Badge>
                </div>
                <Progress
                  value={insight.percentage}
                  className={`h-2 ${
                    insight.status === "over"
                      ? "[&>div]:bg-red-500"
                      : insight.status === "warning"
                        ? "[&>div]:bg-yellow-500"
                        : "[&>div]:bg-green-500"
                  }`}
                />
                <p className="text-sm text-muted-foreground">{insight.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Spending Trends */}
      {insights.trendInsights.length > 0 && (
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Spending Trends
            </CardTitle>
            <CardDescription>Month-over-month changes in your spending patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.trendInsights.map((insight) => (
              <div key={insight.category} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {insight.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  )}
                  <span className="text-sm">{insight.message}</span>
                </div>
                <Badge variant={insight.trend === "up" ? "destructive" : "default"}>
                  {insight.change > 0 ? "+" : ""}
                  {insight.change.toFixed(0)}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Lightbulb className="h-5 w-5" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-300">
            Smart tips to improve your financial health
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">💡 General Tips</h4>
            <div className="grid gap-2 text-sm text-blue-700 dark:text-blue-300">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <span>Track all your expenses to identify spending patterns and opportunities</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <span>Set realistic budgets for each category based on your income</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <span>Review your spending weekly to stay on track with your goals</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <span>Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings</span>
              </div>
            </div>
          </div>

          {insights.budgetInsights.some((i) => i.status === "over") && (
            <div className="space-y-3">
              <h4 className="font-medium text-red-700 dark:text-red-300">🚨 Overspending Alert</h4>
              <div className="grid gap-2 text-sm text-red-600 dark:text-red-400">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                  <span>Review your recent transactions in overspent categories</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                  <span>Consider reducing discretionary spending for the rest of the month</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                  <span>Look for subscription services you can temporarily pause</span>
                </div>
              </div>
            </div>
          )}

          {insights.trendInsights.some((i) => i.trend === "up") && (
            <div className="space-y-3">
              <h4 className="font-medium text-yellow-700 dark:text-yellow-300">📈 Rising Expenses</h4>
              <div className="grid gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                  <span>Investigate what's driving increased spending in trending categories</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                  <span>Set up alerts for categories with rising spending trends</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                  <span>Consider alternative options or providers for expensive categories</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
