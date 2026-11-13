import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { HabiticaClient } from "./habiticaClient.js";

interface RecordedCall {
  url: string;
  method: string | undefined;
  body: unknown;
}

const realFetch = globalThis.fetch;
let calls: RecordedCall[];

function stubFetch(payload: unknown, status = 200) {
  globalThis.fetch = (async (input: unknown, init?: RequestInit) => {
    calls.push({
      url: String(input),
      method: init?.method,
      body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
    });
    return new Response(JSON.stringify(payload), {
      status,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
}

function makeClient() {
  return new HabiticaClient({
    userId: "test-user",
    apiToken: "test-token",
    client: "test-client",
    baseUrl: "https://habitica.test/api/v3",
  });
}

describe("HabiticaClient", () => {
  beforeEach(() => {
    calls = [];
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it('listTasks("dailys") requests /tasks/user?type=daily', async () => {
    stubFetch({ success: true, data: [] });

    await makeClient().listTasks("dailys");

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://habitica.test/api/v3/tasks/user?type=daily");
    assert.equal(calls[0].method, "GET");
  });

  it("createTask sends type todo and maps checklist strings to text objects", async () => {
    stubFetch({ success: true, data: { id: "1" } });

    await makeClient().createTask({
      type: "todos",
      text: "Buy milk",
      checklist: ["one", "two"],
    });

    assert.equal(calls[0].url, "https://habitica.test/api/v3/tasks/user");
    assert.equal(calls[0].method, "POST");
    const body = calls[0].body as { type: string; checklist: unknown };
    assert.equal(body.type, "todo");
    assert.deepEqual(body.checklist, [{ text: "one" }, { text: "two" }]);
  });

  it("throws the API message when success is false", async () => {
    stubFetch({ success: false, message: "x" });

    await assert.rejects(makeClient().listTasks(), { message: "x" });
  });
});
