import { describe, expect, it } from "vitest";
import { splitBareUrls } from "./bare-urls";

describe("splitBareUrls", () => {
  it("takes a bare web address out as a link and keeps the prose around it", () => {
    expect(splitBareUrls("mira https://data.merkle.space/x.html y dime")).toEqual([
      { text: "mira " },
      { text: "https://data.merkle.space/x.html", href: "https://data.merkle.space/x.html" },
      { text: " y dime" },
    ]);
  });

  it("adds the scheme to a www address", () => {
    expect(splitBareUrls("www.merkle.space")).toEqual([{ text: "www.merkle.space", href: "https://www.merkle.space" }]);
  });

  it("leaves the closing punctuation out of the link", () => {
    const runs = splitBareUrls("lee https://es.wikipedia.org/wiki/Monterrey.");
    expect(runs).toEqual([
      { text: "lee " },
      { text: "https://es.wikipedia.org/wiki/Monterrey", href: "https://es.wikipedia.org/wiki/Monterrey" },
      { text: "." },
    ]);
  });

  it("leaves ordinary prose as one run", () => {
    expect(splitBareUrls("hola, 1,234.56 y 8.42%")).toEqual([{ text: "hola, 1,234.56 y 8.42%" }]);
  });
});
