import { describe, it, expect } from "vitest";
import { bmr, targets, type ProfileInput } from "@/lib/targets";

const base: ProfileInput = { sex: "male", age: 30, heightCm: 180, weightKg: 80, activity: "moderate", tier: "maintain" };

describe("targets", () => {
  it("computes Mifflin-St Jeor BMR", () => {
    expect(bmr(base)).toBe(10 * 80 + 6.25 * 180 - 5 * 30 + 5); // 1780
    expect(bmr({ ...base, sex: "female" })).toBe(10 * 80 + 6.25 * 180 - 5 * 30 - 161);
  });
  it("maintain = TDEE", () => expect(targets(base).kcal).toBe(Math.round(1780 * 1.55)));
  it("cut = TDEE − 500", () => expect(targets({ ...base, tier: "cut" }).kcal).toBe(Math.round(1780 * 1.55 - 500)));
  it("bulk = TDEE + 300", () => expect(targets({ ...base, tier: "bulk" }).kcal).toBe(Math.round(1780 * 1.55 + 300)));
  it("protein 1.6 g/kg for cut & maintain, 2.0 for bulk", () => {
    expect(targets({ ...base, tier: "cut" }).protein).toBe(128);
    expect(targets(base).protein).toBe(128);
    expect(targets({ ...base, tier: "bulk" }).protein).toBe(160);
  });
  it("water 35 ml/kg rounded to 50 ml", () => expect(targets(base).waterMl).toBe(2800));
});
