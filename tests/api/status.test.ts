import { GET } from "@/app/api/plaid/status/route";

describe("GET /api/plaid/status", () => {
  it("returns connected: true", async () => {
    const response = await GET();

    const data = await response.json();
    expect(data.connected).toBe(true);
  });
});
