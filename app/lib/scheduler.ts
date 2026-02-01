import { checkAndNotifyExpiringRentals } from './notifications';

// Scheduler for checking expiring rentals
// This should be called periodically (e.g., every 5 minutes)

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;

export function startRentalExpiryScheduler(intervalMinutes: number = 5) {
  if (isRunning) {
    console.log('⚠️ Rental expiry scheduler is already running');
    return;
  }

  console.log(`\n🚀 Starting rental expiry scheduler (checking every ${intervalMinutes} minutes)...`);
  
  // Run immediately on start
  checkAndNotifyExpiringRentals().catch(error => {
    console.error('❌ Error in initial rental expiry check:', error);
  });

  // Then run at intervals
  intervalId = setInterval(async () => {
    try {
      await checkAndNotifyExpiringRentals();
    } catch (error) {
      console.error('❌ Error in scheduled rental expiry check:', error);
    }
  }, intervalMinutes * 60 * 1000);

  isRunning = true;
  console.log('✅ Rental expiry scheduler started successfully\n');
}

export function stopRentalExpiryScheduler() {
  if (!isRunning || !intervalId) {
    console.log('⚠️ Rental expiry scheduler is not running');
    return;
  }

  clearInterval(intervalId);
  intervalId = null;
  isRunning = false;
  console.log('🛑 Rental expiry scheduler stopped');
}

export function isSchedulerRunning() {
  return isRunning;
}

// Auto-start scheduler in production
if (process.env.NODE_ENV === 'production' && process.env.AUTO_START_SCHEDULER === 'true') {
  startRentalExpiryScheduler();
}
