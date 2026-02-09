import { describe, expect, it } from "vitest";
import { localizeRateLimitMessage } from "@/lib/utils/rate-limit";

describe("localizeRateLimitMessage", () => {
  it("replaces the GMT timestamp with a localized time", () => {
    const message =
      "GitHub rate limit exceeded. Try again after Mon, 09 Feb 2026 00:04:00 GMT or add a GH_API_TOKEN.";
    const localized = localizeRateLimitMessage(message);

    expect(localized).toContain("GitHub rate limit exceeded. Try again after ");
    expect(localized).not.toContain("GMT");
    expect(localized).toContain(" or add a GH_API_TOKEN.");
  });
});
