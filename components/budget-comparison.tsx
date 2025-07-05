"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import type { Transaction, Budget } from "@/types"

interface BudgetComparisonProps {
  transactions: Transaction[]
  budgets: Budget[]
}

export function BudgetComparison({ transactions, budgets }: BudgetComparisonProps) {
  const chartData = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)

    // Calculate actual spending by category for current month
    const actualSpending: { [key: string]: number } = {}
    transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
      .forEach((transaction) => {
        actualSpending[transaction.category] = (actualSpending[transaction.category] || 0) + transaction.amount
      })

    // Get budgets for current month
    const currentBudgets = budgets.filter((b) => b.month === currentMonth)

    // Combine budget and actual data
    const categories = new Set([...Object.keys(actualSpending), ...currentBudgets.map((b) => b.category)])

    return Array.from(categories)
      .map((category) => {
        const budget = currentBudgets.find((b) => b.category === category)?.amount || 0
        const actual = actualSpending[category] || 0

        return {
          category,
          budget,
          actual,
          remaining: Math.max(0, budget - actual),
          overspent: Math.max(0, actual - budget),
        }
      })
      .filter((item) => item.budget > 0 || item.actual > 0)
  }, [transactions, budgets])

  const chartConfig = {
    budget: {
      label: "Budget",
      color: "hsl(var(--chart-1))",
    },
    actual: {
      label: "Actual",
      color: "hsl(var(--chart-2))",
    },
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No budget data available. Set up your budgets to see comparisons.
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <ChartTooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = chartData.find((item) => item.category === label)
                if (data) {
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-md">
                      <p className="font-medium mb-2">{label}</p>
                      <div className="space-y-1 text-sm">
                        <p>Budget: ${data.budget.toFixed(2)}</p>
                        <p>Actual: ${data.actual.toFixed(2)}</p>
                        {data.overspent > 0 ? (
                          <p className="text-red-600">Over by: ${data.overspent.toFixed(2)}</p>
                        ) : (
                          <p className="text-green-600">Remaining: ${data.remaining.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  )
                }
              }
              return null
            }}
          />
          <Bar dataKey="budget" fill="var(--color-budget)" radius={4} />
          <Bar dataKey="actual" fill="var(--color-actual)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
