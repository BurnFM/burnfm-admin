import {DATE} from "@/app/scheduling/components/DnDCalendar";

export function getDate(day: number, time?: string) {
  const date = new Date(DATE);
  if (time) {
    try {
      const [hours, minutes] = time.split(":").map(Number);
      date.setHours(hours, minutes);
    } catch (e) {
      throw Error("Invalid time string given, should be in format: hh:mm" + e)
    }
  }

  if (day == 0) {
    return date;
  }

  const dif = day - 6;

  if (0 < day && day < 7 && Number.isInteger(day)) {
    date.setDate(DATE.getDay() + dif);
    return date;
  }

  throw Error("Unexpected day argument, should be an integer between 0 to 6");
}