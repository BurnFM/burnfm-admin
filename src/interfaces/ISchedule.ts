export type ISchedule = {
  id: number,
  name: string,
  start_date: Date | null,
  end_date: Date | null,
}

export type ISchedulePartial = {
  name: string,
  start_date: Date | null,
  end_date: Date | null,
}