import { describe, expect, it } from "vitest";
import { userTextHasMarkdown } from "./remark-user-format";

describe("the person's own text drawn as Markdown", () => {
  it("takes a bare web address as formatted, so it is drawn as a link", () => {
    for (const text of [
      "mira https://data.merkle.space/reportes/versiones-omb.html",
      "http://example.com/x?y=1",
      "www.merkle.space",
      "lee https://es.wikipedia.org/wiki/Monterrey.",
    ]) expect(userTextHasMarkdown(text), text).toBe(true);
  });

  it("leaves ordinary prose alone", () => {
    for (const text of ["hola", "el informe de ayer", "1,234.56 y 8.42%", "y/o", "cuesta 5 dolares"]) {
      expect(userTextHasMarkdown(text), text).toBe(false);
    }
  });
});
