import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * Used by mobile app to verify backend connectivity
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'delta-traffic-detection',
  });
}
