export type IPerson = {
  id: number,
  name: string,
  course?: string,
  description?: string,
  fact?: string,
  song?: string,
  photo?: string
}

export function isPerson(obj): obj is IPerson {
  return (
      typeof obj === "object" &&
      obj !== null &&
      typeof obj.id === "number" &&
      typeof obj.name === "string" &&
      (obj.course === undefined || typeof obj.course === "string") &&
      (obj.description === undefined || typeof obj.description === "string") &&
      (obj.fact === undefined || typeof obj.fact === "string") &&
      (obj.song === undefined || typeof obj.song === "string") &&
      (obj.photo === undefined || typeof obj.photo === "string")
  );
}

export type IRole = {
  id: number,
  role: string,
  personID: IPerson | number,
  year: number,
}

export function isRole(obj): obj is IRole {
  return (
      typeof obj === "object" &&
      obj !== null &&
      typeof obj.id === "number" &&
      typeof obj.role === "string" &&
      isPerson(obj.personID) &&
      typeof obj.year === "number"
  );
}

export type API<T> = {
  data: T;
}