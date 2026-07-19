const { scheduledWorker } = require("./services/workers/ScheduledWorker")

async function main() {
  console.log("[ScheduledWorker] Starting...")
  await scheduledWorker.start()
  console.log("[ScheduledWorker] Started. Processing scheduled tasks every 60s.")
  process.on("SIGTERM", async () => {
    console.log("[ScheduledWorker] Shutting down...")
    await scheduledWorker.stop()
    process.exit(0)
  })
}

main().catch((e: Error) => {
  console.error("[ScheduledWorker] Fatal error:", e)
  process.exit(1)
})
