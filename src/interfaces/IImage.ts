export type IImage = {
  name: string,
  location: string,
  use: string,
}

export function isImage(obj: Record<string, unknown>): obj is IImage {
  return (
      typeof obj === "object" &&
      obj !== null &&
      typeof obj.name === "string" &&
      typeof obj.location === "string" &&
      typeof obj.use === "string"
  );
}