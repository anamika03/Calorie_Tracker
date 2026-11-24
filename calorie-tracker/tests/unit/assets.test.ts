import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ICONS } from "@/lib/assets";

describe("icon assets", () => {
  it("has 15 icons", () => expect(Object.keys(ICONS)).toHaveLength(15));
  for (const [name, src] of Object.entries(ICONS)) {
    it(`${name} exists and is a PNG`, () => {
      const buf = fs.readFileSync(path.join(process.cwd(), "public", src));
      expect(buf.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    });
  }
});
