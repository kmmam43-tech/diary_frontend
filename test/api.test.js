import assert from "node:assert/strict";
import test from "node:test";

import { ApiError, createApiClient } from "../api.js";

test("respond sends the documented API payload", async () => {
  let captured;
  const fakeFetch = async (url, options) => {
    captured = { url, options };
    return new Response(JSON.stringify({ assistant_message: "질문", suggested_intervention: "제안" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  const api = createApiClient("https://api.example.com/", fakeFetch);
  const result = await api.respond("관찰된 행동", []);
  assert.equal(captured.url, "https://api.example.com/api/v1/conversations/respond");
  assert.deepEqual(JSON.parse(captured.options.body), { challenge_behavior: "관찰된 행동", messages: [] });
  assert.equal(result.suggested_intervention, "제안");
});

test("saveCase sends challenge behavior, intervention, and messages", async () => {
  let body;
  const fakeFetch = async (_url, options) => {
    body = JSON.parse(options.body);
    return new Response(JSON.stringify({ id: "case-1", created_at: "2026-01-01T00:00:00Z" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  };
  const api = createApiClient("https://api.example.com", fakeFetch);
  await api.saveCase("행동", "중재", [{ role: "user", content: "맥락" }]);
  assert.deepEqual(body, {
    challenge_behavior: "행동",
    intervention: "중재",
    messages: [{ role: "user", content: "맥락" }],
  });
});

test("API errors expose the backend detail", async () => {
  const fakeFetch = async () => new Response(JSON.stringify({ detail: "설정 오류" }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
  const api = createApiClient("https://api.example.com", fakeFetch);
  await assert.rejects(() => api.respond("행동", []), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.message, "설정 오류");
    assert.equal(error.status, 503);
    return true;
  });
});
