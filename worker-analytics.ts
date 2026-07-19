import { analyticsWorker } from "@/services/workers/AnalyticsWorker"

async function main() {
  console.log("[worker-analytics] Starting analytics worker...")
  await analyticsWorker.start()
  console.log("[worker-analytics] Worker started successfully")
}

main().catch((err) => {
  console.error("[worker-analytics] Fatal error:", err)
  process.exit(1)
})
