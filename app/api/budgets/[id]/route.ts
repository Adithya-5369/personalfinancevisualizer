import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { category, amount, month, userName } = body

    if (!category || !amount || !month || !userName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()

    // Only update if the budget belongs to this user
    const result = await db.collection("budgets").updateOne(
      {
        _id: new ObjectId(params.id),
        userName, // Ensure user can only update their own data
      },
      {
        $set: {
          category,
          amount: Number.parseFloat(amount),
          month,
          updatedAt: new Date().toISOString(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Budget not found or access denied" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating budget:", error)
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const userName = searchParams.get("userName")

    if (!userName) {
      return NextResponse.json({ error: "User name is required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Only delete if the budget belongs to this user
    const result = await db.collection("budgets").deleteOne({
      _id: new ObjectId(params.id),
      userName, // Ensure user can only delete their own data
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Budget not found or access denied" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting budget:", error)
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 })
  }
}
