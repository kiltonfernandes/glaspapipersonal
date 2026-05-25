import { NextResponse } from "next/server";
import { clearHighlightCache, getHighlightData } from "@/lib/cache";
import { apiError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST() {
  try {
    clearHighlightCache();
    return NextResponse.json(await getHighlightData(true));
  } catch (error) {
    return apiError(error);
  }
}
