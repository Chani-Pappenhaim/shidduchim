import { NextResponse } from "next/server";
import { isCronRequest } from "@/server/auth/cron";
import { sendDailyDigests } from "@/server/services/digest-service";
import { promoteDueWeddings } from "@/server/services/engagement-service";

export const dynamic = "force-dynamic";

// Daily job: marks couples married on their wedding day and emails each matchmaker's digest
export async function GET(request: Request) {
  if (!isCronRequest(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const married = await promoteDueWeddings();
  const digests = await sendDailyDigests();
  return NextResponse.json({ married, digests });
}
