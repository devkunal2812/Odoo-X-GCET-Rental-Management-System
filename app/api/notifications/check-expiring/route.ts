import { NextRequest, NextResponse } from 'next/server';
import { checkAndNotifyExpiringRentals } from '@/app/lib/notifications';

// GET /api/notifications/check-expiring
// Check for expiring rentals and send notifications
export async function GET(request: NextRequest) {
  try {
    console.log('\n🔔 API: Checking for expiring rentals...');
    
    const result = await checkAndNotifyExpiringRentals();

    return NextResponse.json({
      success: true,
      message: `Checked ${result.checked} orders, sent ${result.notifications.filter(n => n.status === 'sent').length} notifications`,
      data: result
    });
  } catch (error: any) {
    console.error('❌ API Error checking expiring rentals:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check expiring rentals',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// POST /api/notifications/check-expiring
// Manual trigger for checking expiring rentals (same as GET)
export async function POST(request: NextRequest) {
  return GET(request);
}
