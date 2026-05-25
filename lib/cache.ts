import { GlaspClient } from "@/lib/glasp";
import { normalizeDocuments } from "@/lib/normalize";
import type { GlaspDocument, HighlightRecord, HighlightResponse } from "@/lib/types";

const TTL_MS = 15 * 60 * 1000;

type CacheEntry = {
  documents: GlaspDocument[];
  highlights: HighlightRecord[];
  cachedAt: number;
};

let cache: CacheEntry | null = null;
let pending: Promise<CacheEntry> | null = null;

export function clearHighlightCache() {
  cache = null;
}

export async function getHighlightData(forceRefresh = false): Promise<HighlightResponse> {
  const now = Date.now();

  if (!forceRefresh && cache && now - cache.cachedAt < TTL_MS) {
    return toResponse(cache);
  }

  if (!forceRefresh && pending) {
    return toResponse(await pending);
  }

  pending = loadHighlightData();

  try {
    cache = await pending;
    return toResponse(cache);
  } finally {
    pending = null;
  }
}

async function loadHighlightData(): Promise<CacheEntry> {
  const documents = await new GlaspClient().exportHighlights();
  return {
    documents,
    highlights: normalizeDocuments(documents),
    cachedAt: Date.now()
  };
}

function toResponse(entry: CacheEntry): HighlightResponse {
  return {
    documents: entry.documents,
    highlights: entry.highlights,
    meta: {
      documentCount: entry.documents.length,
      highlightCount: entry.highlights.length,
      cachedAt: new Date(entry.cachedAt).toISOString(),
      expiresAt: new Date(entry.cachedAt + TTL_MS).toISOString()
    }
  };
}
