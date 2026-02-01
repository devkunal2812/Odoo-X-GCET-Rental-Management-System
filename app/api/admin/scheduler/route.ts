import { NextRequest, NextResponse } from 'next/server';
import { startRentalExpiryScheduler, stopRentalExpiryScheduler, isSchedulerRunning } from '@/app/lib/scheduler';
import { getUserFromRequest } from '@/app/lib/auth';

// GET /api/admin/scheduler - Get scheduler status
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      running: isSchedulerRunning(),
      message: isSchedulerRunning() 
        ? 'Scheduler is running' 
        : 'Scheduler is stopped'
    });
  } catch (error: any) {
    console.error('❌ Error getting scheduler status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get scheduler status' },
      { status: 500 }
    );
  }
}

// POST /api/admin/scheduler - Start/stop scheduler
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, intervalMinutes } = body;

    if (action === 'start') {
      const interval = intervalMinutes || 5;
      startRentalExpiryScheduler(interval);
      return NextResponse.json({
        success: true,
        message: `Scheduler started (checking every ${interval} minutes)`,
        running: true
      });
    } else if (action === 'stop') {
      stopRentalExpiryScheduler();
      return NextResponse.json({
        success: true,
        message: 'Scheduler stopped',
        running: false
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "start" or "stop"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('❌ Error controlling scheduler:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to control scheduler' },
      { status: 500 }
    );
  }
}
