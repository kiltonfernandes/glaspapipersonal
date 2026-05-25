import { NextResponse } from "next/server";
import { getHighlightData } from "@/lib/cache";
import { apiError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await getHighlightData());
  } catch (error) {
    return apiError(error);
  }
}
