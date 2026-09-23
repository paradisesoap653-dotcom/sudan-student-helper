import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const supabaseUrl = "https://lhxebcykgdyxehcyohzk.supabase.co";
const supabaseKey = "sb_publishable_hMGP3EMJNixAVn5liDeh1Q_K10Eiyeu";
const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory fallback stats if table doesn't exist
const memoryStats: Record<string, number> = {
  visits: 0,
  installs: 0,
  downloads: 0,
  chat_messages: 0,
  uniqueVisitors: 0,
};
const visitorsSeen = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const eventType = typeof body.event === 'string' ? body.event : 'visit';
    const visitorId = typeof body.visitorId === 'string' ? body.visitorId : '';
    
    // Track in memory
    if (!visitorsSeen.has(visitorId) && visitorId) {
      visitorsSeen.add(visitorId);
      memoryStats.uniqueVisitors++;
    }
    if (memoryStats[eventType] !== undefined) {
      memoryStats[eventType]++;
    }

    // Try to save to database
    try {
      await supabase.from('app_stats').insert({
        event_type: eventType,
        visitor_id: visitorId,
        created_at: new Date().toISOString(),
        user_agent: req.headers.get('user-agent') || '',
      });
    } catch (dbErr) {
      // Ignore DB errors, memory stats work as fallback
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
