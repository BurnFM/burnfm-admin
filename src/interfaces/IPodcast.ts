export type Ipodcast = {
  id: number,
  title: string,
  description?: string,
  hosts: string[],
  photo?: string,
  startDate?: string,
  endDate?: string
}

export function isPodcast(obj): obj is Ipodcast {
  return (
      typeof obj === "object" &&
      obj !== null &&
      typeof obj.id === "number" &&
      typeof obj.title === "string" &&
      (obj.description === undefined || typeof obj.description === "string") &&
      (obj.hosts === undefined || typeof obj.hosts === "object") &&
      (obj.photo === undefined || typeof obj.photo === "string")&&
      (obj.startDate === undefined || typeof obj.startDate === "string") &&
      (obj.endDate === undefined || typeof obj.endDate === "string")
  );
}