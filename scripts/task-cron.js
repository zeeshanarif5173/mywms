const cron = require('node-cron')

// Task management cron job that runs every hour
const taskManagementCron = cron.schedule('0 * * * *', async () => {
  console.log('🔄 Running task management cron job...')
  
  try {
    const response = await fetch('http://localhost:3000/api/cron/task-management')
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Task management cron job completed:')
      console.log(`   - Overdue tasks found: ${result.overdueTasks}`)
      console.log(`   - Late fines applied: ${result.appliedFines}`)
      console.log(`   - New recurring tasks created: ${result.newRecurringTasks}`)
      
      if (result.details.overdueTasks.length > 0) {
        console.log('   - Overdue tasks:', result.details.overdueTasks.map(t => `${t.title} (${t.id})`).join(', '))
      }
      
      if (result.details.appliedFines.length > 0) {
        console.log('   - Applied fines:', result.details.appliedFines.map(f => `$${f.fineAmount} for task ${f.taskId}`).join(', '))
      }
      
      if (result.details.newRecurringTasks.length > 0) {
        console.log('   - New recurring tasks:', result.details.newRecurringTasks.map(t => `${t.title} (${t.id})`).join(', '))
      }
    } else {
      console.error('❌ Task management cron job failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Error running task management cron job:', error)
  }
}, {
  scheduled: false, // Don't start automatically
  timezone: "UTC"
})

// Function to start the cron job
function startTaskCron() {
  taskManagementCron.start()
  console.log('⏰ Task management cron job started - Running every hour')
}

// Function to stop the cron job
function stopTaskCron() {
  taskManagementCron.stop()
  console.log('⏹️ Task management cron job stopped')
}

// Manual trigger for testing
async function runManualTaskCheck() {
  console.log('🧪 Running manual task management check...')
  try {
    const response = await fetch('http://localhost:3000/api/cron/task-management')
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Manual task check completed:')
      console.log(`   - Overdue tasks: ${result.overdueTasks}`)
      console.log(`   - Applied fines: ${result.appliedFines}`)
      console.log(`   - New recurring tasks: ${result.newRecurringTasks}`)
    } else {
      console.error('❌ Manual task check failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Error in manual task check:', error)
  }
}

// Export functions for use in other modules
module.exports = {
  startTaskCron,
  stopTaskCron,
  runManualTaskCheck
}

// If this script is run directly, start the cron job
if (require.main === module) {
  startTaskCron()
  
  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping task management cron job...')
    stopTaskCron()
    process.exit(0)
  })
}
