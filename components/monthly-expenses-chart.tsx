"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import type { Transaction } from "@/types"

interface MonthlyExpensesChartProps {
  transactions: Transaction[]
}

export function MonthlyExpensesChart({ transactions }: MonthlyExpensesChartProps) {
  const chartData = useMemo(() => {
    const monthlyData: { [key: string]: number } = {}

    // Get last 6 months + current month (7 months total)
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
      monthlyData[monthKey] = 0
    }

    // Aggregate expenses by month
    transactions
      .filter((t) => t.type === "expense")
      .forEach((transaction) => {
        const monthKey = transaction.date.slice(0, 7)
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey] += transaction.amount
        }
      })

    return Object.entries(monthlyData).map(([month, amount]) => {
      const date = new Date(month + "-01")
      const isCurrentMonth = month === now.toISOString().slice(0, 7)

      return {
        month: date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        fullMonth: date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        amount: amount,
        isCurrentMonth,
      }
    })
  }, [transactions])

  const chartConfig = {
    amount: {
      label: "Amount",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-muted-foreground" tick={{ fontSize: 12 }} />
          <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
          <ChartTooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
                    <p className="font-medium">{data.fullMonth}</p>
                    <p className="text-sm text-primary">
                      ${data.amount.toFixed(2)}
                      {data.isCurrentMonth && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Current</span>
                      )}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} className="drop-shadow-sm" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
