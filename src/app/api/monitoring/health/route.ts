import { NextResponse } from 'next/server';
import si from 'systeminformation';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: Request) {
  try {
    const [cpu, mem, fs] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
    ]);

    const disk = fs[0]
      ? {
          total: fs[0].size,
          used: fs[0].used,
          percent: fs[0].use,
        }
      : null;

    const healthData = {
      cpu: {
        load: cpu.currentLoad.toFixed(2),
      },
      memory: {
        total: mem.total,
        used: mem.used,
        percent: ((mem.used / mem.total) * 100).toFixed(2),
      },
      disk,
      timestamp: Date.now(),
    };

    return NextResponse.json(healthData);
  } catch (error) {
    console.error('Failed to fetch system health:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system health data' },
      { status: 500 }
    );
  }
}
