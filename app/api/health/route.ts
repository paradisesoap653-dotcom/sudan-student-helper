import { NextResponse } from "next/server";
import { getAIStatus } from "@/lib/ai-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Liveness + configuration only: no paid AI calls or exposed credentials.
  return NextResponse.json(
    {
      ok: true,
      service: "sudan-student-helper",
      check: "configuration",
      ...getAIStatus(),
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
