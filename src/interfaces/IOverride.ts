export type IOverride = {
  id: number,
  date: string,
  startTime: string,
  endTime: string,
  type: string,
  radioShowID?: number,
}

export function isOverride(obj: Record<string, unknown>): obj is IOverride {
  return (
      typeof obj === "object" &&
      obj !== null &&
      typeof obj.id === "number" &&
      typeof obj.date === "string" &&
      typeof obj.startTime === "string" &&
      typeof obj.endTime === "string" &&
      typeof obj.type === "string" &&
      (obj.radioShowID === undefined || typeof obj.radioShowID === "number")
  );
}