import { beforeEach, describe, expect, it, vi } from "vitest";
import { print } from "graphql";

const { runMutation, runQuery } = vi.hoisted(() => ({ runMutation: vi.fn(), runQuery: vi.fn() }));

vi.mock("@/lib/graphql.server", () => ({ runMutation, runQuery }));

import * as edit from "@/lib/wiki/edit.server";
import * as wiki from "@/lib/wiki/wiki.server";

/**
 * An answer that has every field, so each call can pick what it needs from it.
 */
const anything = (): unknown => new Proxy(() => undefined, {
  get: (_, key) => (key === "then" ? undefined : key === Symbol.toPrimitive ? () => "x" : anything()),
});

const operation = (mock: typeof runQuery) => {
  const document = mock.mock.calls.at(-1)?.[0];

  return document ? print(document).match(/(query|mutation) (\w+)/)?.[2] : undefined;
};

type Call = (...args: never[]) => Promise<unknown>;

const functions = (module: Record<string, unknown>) =>
  Object.entries(module).filter((entry): entry is [string, Call] => typeof entry[1] === "function");

describe("The editing calls", () => {
  beforeEach(() => {
    runMutation.mockReset().mockResolvedValue(anything());
    runQuery.mockReset().mockResolvedValue(anything());
  });

  it.each(functions(edit))("%s sends one operation to the API", async (name, call) => {
    await (call as (...args: unknown[]) => Promise<unknown>)("id", "x", "y");

    const sent = name.startsWith("get") ? runQuery : runMutation;

    expect(sent).toHaveBeenCalledTimes(1);
    expect(operation(sent)?.toLowerCase()).toContain(name.replace(/^get/, "").slice(0, 6).toLowerCase());
  });

  it("pass the arguments as the operation's variables", async () => {
    await edit.articleUpdate("a1", { title: "T", body: "B", visibility: "PUBLIC" } as never, "r1");

    expect(runMutation).toHaveBeenCalledWith(expect.anything(), {
      id: "a1", input: { title: "T", body: "B", visibility: "PUBLIC" }, baseRevisionId: "r1",
    });
  });

  it("answer with nothing to edit when the API gives nothing", async () => {
    runMutation.mockResolvedValue(null);

    expect(await edit.articleEditing("a1")).toEqual([]);
  });
});

describe("The reading calls", () => {
  beforeEach(() => {
    runQuery.mockReset().mockResolvedValue(anything());
  });

  it.each(functions(wiki))("%s sends one query to the API", async (_, call) => {
    await (call as (...args: unknown[]) => Promise<unknown>)("x", 0);

    expect(runQuery).toHaveBeenCalledTimes(1);
    expect(operation(runQuery)).toBeTruthy();
  });

  it("answer with empty lists and nulls when the API gives nothing", async () => {
    runQuery.mockResolvedValue(null);

    expect(await wiki.getBooks()).toEqual([]);
    expect(await wiki.search("x")).toEqual([]);
    expect(await wiki.getRedirect("Gammal titel")).toBeNull();
    expect(await wiki.markdownPreview("# Rubrik")).toBe("");
    expect(await wiki.getArticle("saknas")).toBeNull();
  });
});
