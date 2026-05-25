import type { GlaspDocument } from "@/lib/types";

export function makeDocument(overrides: Partial<GlaspDocument> = {}): GlaspDocument {
  return {
    id: "doc-1",
    title: "Agentic workflows",
    author: "Kilton",
    thumbnail_url: "",
    url: "https://example.com/agentic-workflows",
    glasp_url: "https://glasp.co/highlights/doc-1",
    domain: "example.com",
    category: "article",
    document_note: "Notas sobre agentes e automacao",
    summary: "Um resumo sobre sistemas agenticos.",
    tags: ["ai", "workflow"],
    is_favorite: false,
    created_at: "2026-05-20T10:00:00.000Z",
    updated_at: "2026-05-21T10:00:00.000Z",
    highlights: [
      {
        id: "hl-1",
        text: "Needle in a haystack retrieval needs careful indexing.",
        note: "Isso e importante para busca.",
        color: "yellow",
        highlighted_at: "2026-05-21T10:00:00.000Z",
        created_at: "2026-05-21T10:00:00.000Z",
        updated_at: "2026-05-21T10:00:00.000Z",
        url: "https://example.com/agentic-workflows",
        location: 12,
        location_type: "page",
        highlight_url: "https://glasp.co/highlights/hl-1"
      }
    ],
    ...overrides
  };
}
