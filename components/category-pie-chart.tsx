"use client"

import { useMemo } from "react"
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import type { Transaction } from "@/types"

interface CategoryPieChartProps {
  transactions: Transaction[]
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
]

export function CategoryPieChart({ transactions }: CategoryPieChartProps) {
  const chartData = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const categoryTotals: { [key: string]: number } = {}

    transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
      .forEach((transaction) => {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount
      })

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: 0, // Will be calculated after we have total
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [transactions])

  const total = chartData.reduce((sum, item) => sum + item.amount, 0)

  // Add percentage calculation
  const dataWithPercentage = chartData.map((item) => ({
    ...item,
    percentage: total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0,
  }))

  const chartConfig = {
    amount: {
      label: "Amount",
    },
  }

  if (dataWithPercentage.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
        <div className="w-16 h-16 mb-4 bg-muted/30 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-muted-foreground/30 border-dashed rounded-full"></div>
        </div>
        <h3 className="font-medium mb-1">No expenses this month</h3>
        <p className="text-sm">Start adding transactions to see your spending breakdown</p>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={40}
            dataKey="amount"
            stroke="none"
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
                    <p className="font-medium">{data.category}</p>
                    <p className="text-sm text-primary">
                      ${data.amount.toFixed(2)} ({data.percentage}%)
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => (
              <span className="text-sm text-muted-foreground">
                {value} ({entry.payload.percentage}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
