import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const supabaseUrl = "https://lhxebcykgdyxehcyohzk.supabase.co";
const supabaseKey = "sb_publishable_hMGP3EMJNixAVn5liDeh1Q_K10Eiyeu";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  const defaultStats = {
    totalVisits: 0,
    uniqueVisitors: 0,
    totalInstalls: 0,
    totalChatMessages: 0,
    totalDownloads: 0,
    todayVisits: 0,
    last7DaysVisits: 0,
  };

  try {
    const { data, error } = await supabase
      .from('app_stats')
      .select('event_type, visitor_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10000)
      .abortSignal(AbortSignal.timeout(5000));

    if (error || !data) {
      return NextResponse.json(defaultStats);
    }

    const events = data;
    const uniqueVisitors = new Set(events.map(e => e.visitor_id).filter(Boolean)).size;
    const totalVisits = events.filter(e => e.event_type === 'visit').length;
    const totalInstalls = events.filter(e => e.event_type === 'install').length;
    const totalChatMessages = events.filter(e => e.event_type === 'chat_message').length;
    const totalDownloads = events.filter(e => e.event_type === 'download').length;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);

    const todayVisits = events.filter(e => {
      if (e.event_type !== 'visit') return false;
      return new Date(e.created_at).getTime() >= todayStart;
    }).length;

    const last7DaysVisits = events.filter(e => {
      if (e.event_type !== 'visit') return false;
      return new Date(e.created_at).getTime() >= weekAgo;
    }).length;

    return NextResponse.json({
      totalVisits,
      uniqueVisitors,
      totalInstalls,
      totalChatMessages,
      totalDownloads,
      todayVisits,
      last7DaysVisits,
    });
  } catch (err) {
    return NextResponse.json(defaultStats);
  }
}
