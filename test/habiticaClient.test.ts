import assert from "node:assert/strict";
import { test } from "node:test";
import { HabiticaClient } from "../src/habiticaClient.js";

test("addReminder reads the task then PUTs the reminders array", async () => {
  const calls: { url: string; method: string; body?: any }[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (url: any, init: any = {}) => {
    const method = init.method ?? "GET";
    calls.push({
      url: String(url),
      method,
      body: init.body ? JSON.parse(init.body) : undefined,
    });
    const data =
      method === "GET"
        ? { id: "t1", reminders: [{ id: "old", time: "2030-01-01T00:00:00.000Z" }] }
        : { id: "t1" };
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const client = new HabiticaClient({
      userId: "u",
      apiToken: "k",
      client: "test",
      baseUrl: "https://example.test/api/v3",
    });
    await client.addReminder("t1", {
      time: "2031-02-03T04:05:06.000Z",
      startDate: "2031-02-03T00:00:00.000Z",
    });
  } finally {
    globalThis.fetch = original;
  }

  assert.equal(calls.length, 2);
  assert.equal(calls[0].method, "GET");
  assert.equal(calls[0].url, "https://example.test/api/v3/tasks/t1");
  assert.equal(calls[1].method, "PUT");
  assert.equal(calls[1].url, "https://example.test/api/v3/tasks/t1");
  const reminders = calls[1].body.reminders;
  assert.equal(reminders.length, 2);
  assert.equal(reminders[0].id, "old");
  assert.equal(reminders[1].time, "2031-02-03T04:05:06.000Z");
  assert.equal(reminders[1].startDate, "2031-02-03T00:00:00.000Z");
  assert.ok(reminders[1].id);
  assert.ok(calls.every((c) => !c.url.endsWith("/reminders")));
});
