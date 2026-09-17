import { describe, expect, it } from "vitest";
import { applyFilters } from "@/lib/dashboard";
import { demoLogs } from "@/lib/demo-data";

describe("dashboard filtering", () => {
  it("matches across employee, activity, and field text", () => {
    expect(applyFilters(demoLogs, { q: "Maya" }).map((log) => log.employeeName)).toEqual(["Maya Patel"]);
    expect(applyFilters(demoLogs, { q: "irrigation" }).map((log) => log.employeeName)).toEqual(["Sophia Lee"]);
    expect(applyFilters(demoLogs, { q: "field c" }).map((log) => log.employeeName)).toEqual(["Liam Johnson"]);
  });

  it("reproduces the four-row design by default", () => {
    expect(applyFilters(demoLogs, { range: "month", sort: "date-asc" }).map((log) => log.employeeName)).toEqual([
      "Isaac Wang", "Maya Patel", "Liam Johnson", "Sophia Lee",
    ]);
  });

  it("supports deterministic sorting and exact filters", () => {
    expect(applyFilters(demoLogs, { range: "all", sort: "employee" })[0].employeeName).toBe("Benjamin Moore");
    expect(applyFilters(demoLogs, { field: "FIELD D" })).toHaveLength(1);
    expect(applyFilters(demoLogs, { activity: "Spraying" })[0].id).toBe("isaac-wang");
  });
});
