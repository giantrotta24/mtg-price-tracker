import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns an ok health payload", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload.status).toBe("ok");
    expect(payload.service).toBe("mtg-price-tracker");
    expect(Date.parse(payload.timestamp)).not.toBeNaN();
  });
});
