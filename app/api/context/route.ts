import { NextRequest, NextResponse } from "next/server";
import { getHighlightData } from "@/lib/cache";
import { formatAiContext } from "@/lib/context";
import { apiError } from "@/lib/http";
import { searchHighlights } from "@/lib/search";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const data = await getHighlightData();
    const results = searchHighlights(data.highlights, {
      q: searchParams.get("q"),
      limit: Number(searchParams.get("limit") || 12),
      tag: searchParams.get("tag"),
      domain: searchParams.get("domain"),
      color: searchParams.get("color")
    });

    return new NextResponse(formatAiContext(results), {
      headers: {
        "content-type": "text/plain; charset=utf-8"
      }
    });
  } catch (error) {
    return apiError(error);
  }
}
