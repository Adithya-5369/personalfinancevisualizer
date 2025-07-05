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
      <div className="flex flex-col items-center justify-center h-[200px] sm:h-[250px] md:h-[300px] text-muted-foreground">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 bg-muted/30 rounded-full flex items-center justify-center">
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-muted-foreground/30 border-dashed rounded-full"></div>
        </div>
        <h3 className="font-medium mb-1 text-sm">No expenses this month</h3>
        <p className="text-xs text-center px-4">Start adding transactions to see your spending breakdown</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="h-[200px] sm:h-[250px] md:h-[300px]">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPercentage}
                cx="50%"
                cy="40%"
                outerRadius="45%"
                innerRadius="25%"
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
                      <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
                        <p className="font-medium text-xs">{data.category}</p>
                        <p className="text-xs text-primary">
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
                height={40}
                wrapperStyle={{ fontSize: "10px", paddingTop: "5px" }}
                formatter={(value, entry) => (
                  <span className="text-xs text-muted-foreground">
                    {value} ({(entry.payload as typeof dataWithPercentage[number])?.percentage ?? 0}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}
