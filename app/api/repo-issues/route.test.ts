import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/repo-issues/route";
import { fetchGitHub } from "@/lib/github/server";

vi.mock("@/lib/github/server", () => ({
  fetchGitHub: vi.fn(),
}));

const mockFetchGitHub = fetchGitHub as unknown as ReturnType<typeof vi.fn>;

describe("GET /api/repo-issues", () => {
  beforeEach(() => {
    mockFetchGitHub.mockReset();
  });

  it("returns mapped issue search results when query is provided", async () => {
    mockFetchGitHub.mockResolvedValueOnce({
      items: [
        { id: 1, number: 10, title: "Bug", html_url: "https://example.com/1" },
        { id: 2, number: 11, title: "Feature", html_url: "https://example.com/2" },
      ],
      total_count: 2,
    });

    const request = new Request(
      "http://localhost/api/repo-issues?owner=acme&repo=demo&q=bug&page=1&per_page=12",
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockFetchGitHub).toHaveBeenCalledWith("/search/issues", expect.any(Object));
    expect(body.items).toEqual([
      { id: 1, number: 10, title: "Bug", html_url: "https://example.com/1" },
      { id: 2, number: 11, title: "Feature", html_url: "https://example.com/2" },
    ]);
    expect(body.total_count).toBe(2);
    expect(body.page).toBe(1);
  });

  it("filters pull requests from issue list results", async () => {
    mockFetchGitHub.mockResolvedValueOnce([
      { id: 1, number: 10, title: "Bug", html_url: "https://example.com/1" },
      { id: 2, number: 11, title: "PR", html_url: "https://example.com/2", pull_request: {} },
    ]);

    const request = new Request(
      "http://localhost/api/repo-issues?owner=acme&repo=demo&page=1&per_page=12",
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockFetchGitHub).toHaveBeenCalledWith("/repos/acme/demo/issues", expect.any(Object));
    expect(body.items).toEqual([
      { id: 1, number: 10, title: "Bug", html_url: "https://example.com/1" },
    ]);
  });
});
