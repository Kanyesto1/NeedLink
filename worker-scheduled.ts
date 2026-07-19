import { scheduledWorker } from "@/services/workers/ScheduledWorker"

async function main() {
  console.log("[worker-scheduled] Starting scheduled task worker...")
  await scheduledWorker.start()
  console.log("[worker-scheduled] Worker started successfully")
}

main().catch((err) => {
  console.error("[worker-scheduled] Fatal error:", err)
  process.exit(1)
})
