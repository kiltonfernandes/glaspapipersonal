import { describe, expect, it } from "vitest";
import { normalizeDocuments } from "@/lib/normalize";
import { makeDocument } from "./fixtures";

describe("normalizeDocuments", () => {
  it("transforma documentos Glasp em registros pesquisaveis", () => {
    const [record] = normalizeDocuments([makeDocument()]);

    expect(record).toMatchObject({
      id: "hl-1",
      documentId: "doc-1",
      title: "Agentic workflows",
      domain: "example.com",
      tags: ["ai", "workflow"],
      text: "Needle in a haystack retrieval needs careful indexing."
    });
    expect(record.searchText).toContain("needle in a haystack");
    expect(record.searchText).toContain("workflow");
  });
});
