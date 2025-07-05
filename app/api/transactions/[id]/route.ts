import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { amount, description, date, category, type, userName } = body

    if (!amount || !description || !date || !category || !type || !userName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()

    // Only update if the transaction belongs to this user
    const result = await db.collection("transactions").updateOne(
      {
        _id: new ObjectId(params.id),
        userName, // Ensure user can only update their own data
      },
      {
        $set: {
          amount: Number.parseFloat(amount),
          description,
          date,
          category,
          type,
          updatedAt: new Date().toISOString(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Transaction not found or access denied" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
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

    // Only delete if the transaction belongs to this user
    const result = await db.collection("transactions").deleteOne({
      _id: new ObjectId(params.id),
      userName, // Ensure user can only delete their own data
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Transaction not found or access denied" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 })
  }
}
