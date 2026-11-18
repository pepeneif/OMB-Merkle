/** A web address written as-is in someone's own text: "https://…", "http://…" or "www.…". */
const BARE_URL = /(?:https?:\/\/|www\.)[^\s<>()[\]`]*[^\s<>()[\]`.,;:!?"']/gi;

export interface TextRun {
  text: string;
  /** Present when the run is a bare web address. */
  href?: string;
}

/** Splits a line of someone's own text into plain runs and bare web addresses, so an address
 *  typed without Markdown is still drawn as a link. Punctuation right after it is left out of the link. */
export function splitBareUrls(text: string): TextRun[] {
  const runs: TextRun[] = [];
  let end = 0;
  for (const match of text.matchAll(BARE_URL)) {
    const at = match.index ?? 0;
    if (at > end) runs.push({ text: text.slice(end, at) });
    const written = match[0];
    runs.push({ text: written, href: /^https?:\/\//i.test(written) ? written : `https://${written}` });
    end = at + written.length;
  }
  if (end < text.length) runs.push({ text: text.slice(end) });
  return runs.length > 0 ? runs : [{ text }];
}
