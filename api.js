export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function createApiClient(baseUrl, fetchImpl = fetch) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

  async function request(path, options) {
    let response;
    try {
      response = await fetchImpl(`${normalizedBaseUrl}${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", ...options?.headers },
      });
    } catch {
      throw new ApiError("백엔드에 연결할 수 없습니다. 잠시 후 다시 시도하세요.");
    }

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ApiError(body.detail || "요청을 처리하지 못했습니다.", response.status);
    }
    return body;
  }

  return {
    respond(challengeBehavior, messages) {
      return request("/api/v1/conversations/respond", {
        method: "POST",
        body: JSON.stringify({ challenge_behavior: challengeBehavior, messages }),
      });
    },
    saveCase(challengeBehavior, intervention, messages) {
      return request("/api/v1/cases", {
        method: "POST",
        body: JSON.stringify({ challenge_behavior: challengeBehavior, intervention, messages }),
      });
    },
  };
}
