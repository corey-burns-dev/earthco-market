import { beforeEach, describe, expect, test, vi } from "vitest";
import { ApiError, fetchSession, login } from "./api";

describe("api helpers", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  test("login sends JSON body and parses success response", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          user: { id: "1", name: "Casey", email: "casey@example.com", isAdmin: false },
          token: "token-123",
        }),
        { status: 200 },
      ),
    );

    const result = await login("casey@example.com", "password123");

    expect(result.token).toBe("token-123");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/login"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "casey@example.com", password: "password123" }),
      }),
    );

    const requestOptions = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(requestOptions.headers).get("Content-Type")).toBe("application/json");
  });

  test("fetchSession includes bearer token header", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          user: { id: "2", name: "Riley", email: "riley@example.com", isAdmin: false },
        }),
        { status: 200 },
      ),
    );

    await fetchSession("session-token");

    const requestOptions = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(requestOptions.headers).get("Authorization")).toBe("Bearer session-token");
  });

  test("throws ApiError with API message on non-2xx", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Invalid credentials." }), { status: 401 }),
    );

    const request = login("casey@example.com", "wrong-password");

    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({
      status: 401,
      message: "Invalid credentials.",
    });
  });

  test("falls back to default request error message when response body is empty", async () => {
    fetchMock.mockResolvedValueOnce(new Response("", { status: 500 }));

    await expect(fetchSession("bad-token")).rejects.toMatchObject({
      status: 500,
      message: "Request failed.",
    });
  });
});
