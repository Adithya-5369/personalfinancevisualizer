// Create indexes for better performance with name-based queries
import { config } from "dotenv"
import { MongoClient } from "mongodb"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, "..", ".env.local") })

const uri = process.env.MONGODB_URI

async function setupIndexes() {
  let client

  try {
    console.log("🔧 Setting up database indexes for optimal performance...")

    client = new MongoClient(uri)
    await client.connect()

    const db = client.db("finance-visualizer")

    // Create indexes for transactions collection
    console.log("📊 Creating indexes for transactions...")
    await db.collection("transactions").createIndex({ userName: 1, date: -1 })
    await db.collection("transactions").createIndex({ userName: 1, category: 1 })
    await db.collection("transactions").createIndex({ userName: 1, type: 1 })

    // Create indexes for budgets collection
    console.log("💰 Creating indexes for budgets...")
    await db.collection("budgets").createIndex({ userName: 1, month: 1 })
    await db.collection("budgets").createIndex({ userName: 1, category: 1, month: 1 }, { unique: true })

    console.log("✅ Database indexes created successfully!")
    console.log("\n📈 Performance optimizations:")
    console.log("- Fast queries by user name")
    console.log("- Efficient date-based sorting")
    console.log("- Quick category filtering")
    console.log("- Unique budget constraints per user")
  } catch (error) {
    console.error("❌ Error setting up indexes:", error.message)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

setupIndexes()
