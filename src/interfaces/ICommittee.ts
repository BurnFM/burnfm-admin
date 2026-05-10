export type IPerson = {
  id: number,
  name: string,
  role: string,
  course?: string,
  description?: string,
  fact?: string,
  song?: string,
  photo?: string,
  year: number
}

export function isPerson(obj): obj is IPerson {
  return (
      typeof obj === "object" &&
      obj !== null &&
      typeof obj.id === "number" &&
      typeof obj.name === "string" &&
      typeof obj.role === "string" &&
      (obj.course === undefined || typeof obj.course === "string") &&
      (obj.description === undefined || typeof obj.description === "string") &&
      (obj.fact === undefined || typeof obj.fact === "string") &&
      (obj.song === undefined || typeof obj.song === "string") &&
      (obj.photo === undefined || typeof obj.photo === "string") &&
      typeof obj.year === "number"
  );
}

export type API<T> = {
  data: T;
}