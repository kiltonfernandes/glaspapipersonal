import { NextRequest, NextResponse } from "next/server";
import { getHighlightData } from "@/lib/cache";
import { apiError } from "@/lib/http";
import { buildFacets, searchHighlights } from "@/lib/search";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const data = await getHighlightData();
    const results = searchHighlights(data.highlights, {
      q: searchParams.get("q"),
      limit: Number(searchParams.get("limit") || 20),
      tag: searchParams.get("tag"),
      domain: searchParams.get("domain"),
      color: searchParams.get("color")
    });

    return NextResponse.json({
      results,
      facets: buildFacets(data.highlights),
      meta: data.meta
    });
  } catch (error) {
    return apiError(error);
  }
}
