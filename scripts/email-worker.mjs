import { processEmailQueue } from '../lib/email-service.js'

async function runWorker() {
  console.log('[EMAIL-WORKER] Starting email worker...')
  
  while (true) {
    try {
      const { processed } = await processEmailQueue()
      if (processed > 0) {
        console.log(`[EMAIL-WORKER] Processed ${processed} emails`)
      }
    } catch (error) {
      console.error('[EMAIL-WORKER] Unhandled error in processing loop:', error)
    }

    // Wait 10 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 10000))
  }
}

runWorker().catch(err => {
  console.error('[EMAIL-WORKER] Fatal error:', err)
  process.exit(1)
})
