import type { Message } from "@/state/store";

type MdNode = {
  type: string;
  value?: string;
  children?: MdNode[];
  data?: { hName?: string; hProperties?: Record<string, string> };
};

/** Personalizacion Manager (0026 / A3, v140): subrayado con `++texto++`.
 *  Un plugin local, sin dependencias extra: sustituye en los nodos de texto
 *  las corridas `++x++` por un nodo que se pinta como <u>. */
export function remarkUnderline() {
  return (tree: MdNode) => {
    const walk = (node: MdNode) => {
      if (!node.children) return;
      if (["link", "linkReference", "code", "inlineCode"].includes(node.type)) return;
      node.children = node.children.flatMap((child) => {
        if (child.type !== "text" || !child.value) { walk(child); return [child]; }
        const value = child.value;
        if (!value.includes("++")) return [child];
        const out: MdNode[] = [];
        let rest = value;
        while (true) {
          const start = rest.indexOf("++");
          if (start === -1) { if (rest) out.push({ type: "text", value: rest }); break; }
          const end = rest.indexOf("++", start + 2);
          if (end === -1) { out.push({ type: "text", value: rest }); break; }
          const inner = rest.slice(start + 2, end);
          if (start > 0) out.push({ type: "text", value: rest.slice(0, start) });
          if (inner) out.push({ type: "underline", data: { hName: "u" }, children: [{ type: "text", value: inner }] });
          rest = rest.slice(end + 2);
        }
        return out.length ? out : [child];
      });
    };
    walk(tree);
  };
}

export type { Message };

/** A3: ¿el mensaje del usuario trae formato de markdown? Si no, se pinta como texto
 *  literal (conserva la direccion por linea via `.chat-text`); si si, se renderiza. */
/** A web address written as-is ("https://…", "http://…", "www.…"): the person's own text becomes Markdown so the
 *  address is drawn as a link, and the link opens in a new window. */
const BARE_URL = /(?:https?:\/\/|www\.)[^\s<>()[\]`]+\.[^\s<>()[\]`]*/i;

export function userTextHasMarkdown(text: string): boolean {
  if (text.includes("**") || text.includes("__") || text.includes("`") || text.includes("~~") || text.includes("++")) return true;
  if (BARE_URL.test(text)) return true;
  if (/^\s*(?:[-*+]|\d{1,3}[.)])\s+\S/m.test(text)) return true;
  if (/^\s*#{1,6}\s+\S/m.test(text)) return true;
  if (/\]\([^)\s]+\)/.test(text)) return true;
  if (/(^|[\s(])\*[^*\s][^*]*\*(?=[\s).,!?:;]|$)/.test(text)) return true;
  if (/(^|[\s(])_[^_\s][^_]*_(?=[\s).,!?:;]|$)/.test(text)) return true;
  return false;
}
