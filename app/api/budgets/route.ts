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
    const budgets = await db.collection("budgets").find({ userName }).sort({ category: 1 }).toArray()

    return NextResponse.json(budgets)
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, amount, month, userName } = body

    if (!category || !amount || !month || !userName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()

    // Upsert budget (update if exists, create if not) for this user
    const result = await db.collection("budgets").updateOne(
      { category, month, userName },
      {
        $set: {
          amount: Number.parseFloat(amount),
          updatedAt: new Date().toISOString(),
        },
        $setOnInsert: {
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating/updating budget:", error)
    return NextResponse.json({ error: "Failed to create/update budget" }, { status: 500 })
  }
}
