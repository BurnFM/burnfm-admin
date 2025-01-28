import {DATE} from "@/app/components/Calendar";

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

// Get time part as a string given a Date object
export function toTimeString(date: Date) {
  const timezoneOffset = date.getTimezoneOffset()
  date.setTime(date.getTime() - timezoneOffset * 60 * 1000)
  console.log(timezoneOffset)

  const [hours, minutes] = date.toISOString().split('T')[1].split(":");
  console.log(date + " to " + `${hours}:${minutes}`);

  return `${hours}:${minutes}`;
}

// Get date part as a string given a Date object
export function toDateString(date?: Date | null) {
  if (date) {
    const timezoneOffset = date.getTimezoneOffset()
    date.setTime(date.getTime() + timezoneOffset)

    const str = date.toISOString().split('T')[0];
    console.log(date + "to" + str);
    return str;
  }

  return undefined;
}