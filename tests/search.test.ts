import { describe, expect, it } from "vitest";
import { normalizeDocuments } from "@/lib/normalize";
import { searchHighlights } from "@/lib/search";
import { makeDocument } from "./fixtures";

const records = normalizeDocuments([
  makeDocument(),
  makeDocument({
    id: "doc-2",
    title: "Notas de culinaria",
    tags: ["cozinha"],
    domain: "food.example",
    highlights: [
      {
        ...makeDocument().highlights[0],
        id: "hl-2",
        text: "Fermentation changes flavor over time.",
        note: "Receitas lentas",
        color: "blue"
      }
    ]
  })
]);

describe("searchHighlights", () => {
  it("ranqueia palavra no titulo", () => {
    const [result] = searchHighlights(records, { q: "agentic", limit: 5 });

    expect(result.id).toBe("hl-1");
  });

  it("encontra palavra no texto do highlight", () => {
    const [result] = searchHighlights(records, { q: "fermentation", limit: 5 });

    expect(result.id).toBe("hl-2");
  });

  it("encontra palavra em nota ou tag", () => {
    expect(searchHighlights(records, { q: "cozinha", limit: 5 })[0].id).toBe("hl-2");
    expect(searchHighlights(records, { q: "automacao", limit: 5 })[0].id).toBe("hl-1");
  });

  it("retorna vazio quando nao existe match", () => {
    expect(searchHighlights(records, { q: "xyz-inexistente", limit: 5 })).toHaveLength(0);
  });

  it("aplica filtros de tag, dominio e cor", () => {
    expect(searchHighlights(records, { q: "time", tag: "cozinha", limit: 5 })[0].id).toBe("hl-2");
    expect(searchHighlights(records, { q: "needle", domain: "example.com", limit: 5 })[0].id).toBe("hl-1");
    expect(searchHighlights(records, { q: "fermentation", color: "blue", limit: 5 })[0].id).toBe("hl-2");
  });
});
