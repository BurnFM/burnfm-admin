export type Show = {
  id: number,
  title: string,
  description?: string,
  hosts?: string,
  photo?: string
}

export type Show_Partial = {
  title: string,
  description?: string,
  hosts?: string,
  photo?: string
}

export function isShow(obj): obj is Show {
  return (
      typeof obj === "object" &&
      obj !== null &&
      typeof obj.id === "number" &&
      typeof obj.title === "string" &&
      (obj.description === undefined || typeof obj.description === "string") &&
      (obj.hosts === undefined || typeof obj.hosts === "string") &&
      (obj.photo === undefined || typeof obj.photo === "string")
  );
}