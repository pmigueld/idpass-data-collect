import { trimTrailingSlashes } from "../routes/opensppFieldRoutes";

describe("trimTrailingSlashes", () => {
  it("removes one or more trailing slashes", () => {
    expect(trimTrailingSlashes("https://example.com/")).toBe("https://example.com");
    expect(trimTrailingSlashes("https://example.com///")).toBe("https://example.com");
  });

  it("leaves a URL without a trailing slash unchanged", () => {
    expect(trimTrailingSlashes("https://example.com/api")).toBe("https://example.com/api");
  });

  it("returns an empty string when the input is only slashes", () => {
    expect(trimTrailingSlashes("")).toBe("");
    expect(trimTrailingSlashes("/")).toBe("");
  });

  it("finishes a long run of trailing slashes", () => {
    const slashes = "/".repeat(100_000);
    const started = Date.now();
    expect(trimTrailingSlashes(`https://example.com${slashes}`)).toBe("https://example.com");
    expect(Date.now() - started).toBeLessThan(1000);
  });
});
