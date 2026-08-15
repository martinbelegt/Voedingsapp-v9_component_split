import { adjustTimePart } from "./CompanionDateTimePicker";

describe("minutenstap van de Companion-tijdkiezer", () => {
  test("verhoogt met exact één minuut", () => {
    expect(adjustTimePart({ hour: "12", minute: "15" }, "minute", 1)).toEqual({ hour: "12", minute: "16" });
  });

  test("verlaagt met exact één minuut", () => {
    expect(adjustTimePart({ hour: "12", minute: "15" }, "minute", -1)).toEqual({ hour: "12", minute: "14" });
  });

  test("gaat van 12:59 naar 13:00", () => {
    expect(adjustTimePart({ hour: "12", minute: "59" }, "minute", 1)).toEqual({ hour: "13", minute: "00" });
  });

  test("gaat van 12:00 naar 11:59", () => {
    expect(adjustTimePart({ hour: "12", minute: "00" }, "minute", -1)).toEqual({ hour: "11", minute: "59" });
  });
});
