// A gate that lists three tools (search, describe, call) in place of a server's own catalog, building the directory
// here instead of inheriting it from a remote proxy. Nothing is removed: every tool the server lists is still reached
// through search, so a turn pays for three schemas instead of dozens.
import { CALL_TOOL, DESCRIBE_TOOL, SEARCH_TOOL, ToolDirectory, type CatalogTool } from "./mcp-directory.ts";

export type BuiltDirectoryCall = { answer: string } | { run: { name: string; arguments: Record<string, unknown> } };

export interface BuiltDirectory {
  listed(): Record<string, unknown>[];
  call(name: string, args: unknown): Promise<BuiltDirectoryCall>;
}

/** About 400 tokens: enough for a driver's own tool names, which a search by wording can miss ("screenshot" is
 * `get_desktop_state`). Past this the names are cut, and the areas summary still says what is there. */
const NAMES_CHARS = 1_400;

function textOf(result: { content: Array<{ type: string; text: string }> }): string {
  return result.content.map((part) => part.text).join("\n");
}

/** The catalog's own tools, or undefined when it carries none: the gate then lists it as it came. */
export function buildDirectory(tools: readonly unknown[], context: { server: string; title?: string }): BuiltDirectory | undefined {
  const catalog = tools.filter((tool): tool is CatalogTool => !!tool && typeof tool === "object" && !Array.isArray(tool)
    && typeof (tool as CatalogTool).name === "string" && ((tool as CatalogTool).name as string).trim().length > 0);
  if (!catalog.length) return undefined;
  const directory = new ToolDirectory(catalog);
  return {
    listed: () => {
      const listed = directory.listed({ server: context.server, ...(context.title ? { title: context.title } : {}) });
      // The exact names, so a tool a wording search misses is still one call_tool away.
      const names = directory.tools.map((tool) => tool.name);
      const shown: string[] = [];
      let length = 0;
      for (const name of names) {
        if (length + name.length + 2 > NAMES_CHARS) break;
        shown.push(name);
        length += name.length + 2;
      }
      const search = listed[0];
      if (search && typeof search.description === "string") {
        const more = shown.length < names.length ? `, and ${names.length - shown.length} more` : "";
        search.description = `${search.description}\nEvery tool here, by its exact name: ${shown.join(", ")}${more}.`;
      }
      return listed;
    },
    async call(name, args) {
      if (name === SEARCH_TOOL) return { answer: textOf(await directory.search(args)) };
      if (name === DESCRIBE_TOOL) return { answer: textOf(directory.describe(args)) };
      const call = directory.call(args);
      return "answer" in call ? { answer: textOf(call.answer) } : { run: call };
    },
  };
}

export { CALL_TOOL, DESCRIBE_TOOL, SEARCH_TOOL };

/** Built-ins whose whole catalog is listed as three searchable tools. Measured 2026-11-18: the computer's driver lists
 * 66 tools and 215 KB of schemas (~60k tokens) before its own filter, 32 and 126 KB (~35k) after it; the browser lists
 * 29 at ~12.5k. `data` lists two, where the directory's ~640-token fixed cost would lose. OMB_DIRECTORY_BUILTINS
 * changes the list, or 0 mounts them as before. */
const BUILT_DIRECTORY_SERVERS: ReadonlySet<string> = new Set(
  (process.env.OMB_DIRECTORY_BUILTINS ?? "computer,browser").split(",").map((name) => name.trim()).filter(Boolean));

export function buildsDirectory(server: string): boolean {
  return BUILT_DIRECTORY_SERVERS.has(server);
}
