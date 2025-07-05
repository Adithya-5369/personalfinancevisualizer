import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userName = searchParams.get("userName")

    if (!userName) {
      return NextResponse.json({ error: "User name is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const transactions = await db.collection("transactions").find({ userName }).sort({ date: -1 }).toArray()

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, description, date, category, type, userName } = body

    if (!amount || !description || !date || !category || !type || !userName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection("transactions").insertOne({
      amount: Number.parseFloat(amount),
      description,
      date,
      category,
      type,
      userName, // Store user name with each transaction
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ id: result.insertedId })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
