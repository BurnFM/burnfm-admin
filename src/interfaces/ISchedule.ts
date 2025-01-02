export type ISchedule = {
  id: number,
  name: string,
  start_date: Date | null,
  end_date: Date | null,
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