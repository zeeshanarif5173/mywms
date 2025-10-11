const express = require('express')
const cors = require('cors')
const { startCronJob } = require('./cron-job')

const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Coworking Portal API is running',
    timestamp: new Date().toISOString()
  })
})

// Cron job status endpoint
app.get('/api/cron/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Cron job is running',
    cronJob: 'Daily account status check at midnight UTC'
  })
})

// Start the server
app.listen(port, () => {
  console.log(`🚀 Express server running on http://localhost:${port}`)
  console.log(`📊 Health check: http://localhost:${port}/api/health`)
  console.log(`⏰ Cron status: http://localhost:${port}/api/cron/status`)
  
  // Start the cron job
  startCronJob()
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...')
  process.exit(0)
})
