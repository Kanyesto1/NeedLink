import { notificationWorker } from "@/services/workers/NotificationWorker"

async function main() {
  console.log("[worker-notification] Starting notification worker...")
  await notificationWorker.start()
  console.log("[worker-notification] Worker started successfully")
}

main().catch((err) => {
  console.error("[worker-notification] Fatal error:", err)
  process.exit(1)
})
