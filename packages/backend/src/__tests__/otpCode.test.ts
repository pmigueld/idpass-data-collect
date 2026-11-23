import crypto from "crypto";
import { generateOtpCode } from "../stores/OtpStore";

describe("generateOtpCode", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("draws a uniform integer from randomInt and pads to 6 digits", () => {
    const spy = jest.spyOn(crypto, "randomInt").mockImplementation(((min: number, max: number) => {
      expect(min).toBe(0);
      expect(max).toBe(1_000_000);
      return 42;
    }) as typeof crypto.randomInt);

    expect(generateOtpCode()).toBe("000042");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("keeps the top of the range as six digits", () => {
    jest.spyOn(crypto, "randomInt").mockImplementation((() => 999_999) as typeof crypto.randomInt);
    expect(generateOtpCode()).toBe("999999");
  });
});
