import type { SearchResult } from "@/lib/types";

export function formatAiContext(results: SearchResult[]) {
  if (!results.length) {
    return "Nenhum highlight encontrado para esta busca.";
  }

  return results
    .map((result, index) => {
      const note = result.note ? `\nNota: ${result.note}` : "";
      const tags = result.tags.length ? `\nTags: ${result.tags.join(", ")}` : "";
      const link = result.highlightUrl || result.glaspUrl || result.url;

      return [
        `#${index + 1} ${result.title}`,
        `Fonte: ${result.url}`,
        link ? `Link do highlight: ${link}` : "",
        `Highlight: ${result.text}`,
        note,
        tags
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n---\n\n");
}
