export type ISchedule = {
  id: number,
  name: string,
  start_date: Date | null,
  end_date: Date | null,
}

export type API<T> = {
  data: T;
  time_zone: string;
}

// Represents the object returned from a Schedule GET request
export type IScheduleAPI = {
  id: number,
  name: string,
  start_date: string,
  end_date: string,
  entries: {
    entry_id: number;
    day: string;
    start_time: string;
    end_time: string;
    show: {
      id: number;
    };
  }[]
}

export type IEntry = {
  id: number | null,
  schedule_id: number,
  radio_show_id: number,
  day: number
  start_time: Date,
  end_time: Date,
}


export interface IScheduleExtended extends ISchedule {
  entries: Omit<IEntry, "schedule_id">[]
}

// Represents a new Schedule (without any ID)
export type ISchedulePartial = {
  name: string,
  start_date: Date | null,
  end_date: Date | null,
}