export interface Transaction {
  _id?: string
  amount: number
  description: string
  date: string
  category: string
  type: "income" | "expense"
  createdAt?: string
  updatedAt?: string
}

export interface Budget {
  _id?: string
  category: string
  amount: number
  month: string
  createdAt?: string
  updatedAt?: string
}

export const CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
] as const

export type Category = (typeof CATEGORIES)[number]
