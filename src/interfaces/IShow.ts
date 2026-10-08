export type IShow = {
  id: number,
  title: string,
  description?: string,
  hosts: string[],
  photo?: string
}

export function isShow(obj: Record<string, unknown>): obj is IShow {
  return (
      typeof obj === "object" &&
      obj !== null &&
      typeof obj.id === "number" &&
      typeof obj.title === "string" &&
      (obj.description === undefined || typeof obj.description === "string") &&
      (obj.hosts === undefined || typeof obj.hosts === "object") &&
      (obj.photo === undefined || typeof obj.photo === "string")
  );
}