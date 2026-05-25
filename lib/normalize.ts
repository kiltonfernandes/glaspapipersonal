import type { GlaspDocument, HighlightRecord } from "@/lib/types";

const compact = (parts: Array<string | null | undefined>) =>
  parts
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter(Boolean)
    .join(" ");

export function normalizeDocuments(documents: GlaspDocument[]): HighlightRecord[] {
  return documents.flatMap((document) =>
    (document.highlights || []).map((highlight) => {
      const record: Omit<HighlightRecord, "searchText"> = {
        id: highlight.id,
        documentId: document.id,
        title: document.title || "Sem titulo",
        url: document.url || highlight.url || "",
        glaspUrl: document.glasp_url || "",
        domain: document.domain || safeDomain(document.url),
        category: document.category || "",
        summary: document.summary || "",
        documentNote: document.document_note || "",
        tags: document.tags || [],
        text: highlight.text || "",
        note: highlight.note || "",
        color: highlight.color || "",
        highlightedAt: highlight.highlighted_at || highlight.created_at || document.updated_at,
        highlightUrl: highlight.highlight_url || ""
      };

      return {
        ...record,
        searchText: compact([
          record.title,
          record.url,
          record.domain,
          record.category,
          record.summary,
          record.documentNote,
          record.tags.join(" "),
          record.text,
          record.note,
          record.color
        ]).toLowerCase()
      };
    })
  );
}

function safeDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
