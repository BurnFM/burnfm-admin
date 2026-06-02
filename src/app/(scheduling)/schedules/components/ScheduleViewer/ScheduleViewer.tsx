import {Callout, Flex, Slider, Text, TextField} from "@radix-ui/themes";
import {ChangeEventHandler, useCallback, useState} from "react";
import {CursorArrowIcon, HandIcon} from "@radix-ui/react-icons";
import CalendarMonth, {
  DropEventHandler,
  ICalendarEvent, ResizeEventHandler, SelectEventHandler,
  SelectSlotHandler
} from "@/app/components/CalendarMonth";
import {IEntry} from "@/interfaces/ISchedule";
import EntryEditDialog from "@/app/(scheduling)/schedules/components/ScheduleEditor/EntryEditDialog";

export type NewEntry = {
  start: Date,
  end: Date,
  day: number,
}

const initial_dates = {
  start: new Date(1972, 0, 1, 9, 0, 0),
  end: new Date(1972, 0, 1, 23, 59, 59)
}

export default function ScheduleEditor({ entries, setEntries, shows } : {
      entries: Omit<IEntry, "schedule_id">[],
      setEntries: (entries: Omit<IEntry, "schedule_id">[]) => void,
      shows: { id: number, title: string }[]
}) {
  const [entryDialog, setEntryDialog] = useState<{open: boolean, entry: null | ICalendarEvent | NewEntry}>({open: false, entry: null})
  const [timeSlotHeight, setTimeSlotHeight] = useState(30); // Controls the height of each calendar cell
  const [timeRange, setTimeRange] = useState(initial_dates); // Controls the range of hours the calendar shows

  const handleStartTimeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const hours = event.target.value.split(":")[0]; // Destructure hours and minutes

    setTimeRange((prevState) => {
      // Create a new Date for the start time, preserving the minutes, seconds, and milliseconds
      const updatedStart = new Date(prevState.start);
      updatedStart.setHours(parseInt(hours), 0, 0, 0); // Only update hours

      // Check that the new start time is not after the end time
      if (updatedStart.getTime() > prevState.end.getTime())
        return prevState;

      return {
        ...prevState,
        start: updatedStart,
      };
    });
  };

  const handleEndTimeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const hours = event.target.value.split(":")[0]; // Destructure hours and minutes

    setTimeRange((prevState) => {
      // Create a new Date for the end time, preserving the minutes, seconds, and milliseconds
      const updatedEnd = new Date(prevState.end);
      updatedEnd.setHours(parseInt(hours), 59, 59); // Only update hours and minutes

      // Check that the new end time is not before the start time
      if (updatedEnd.getTime() < prevState.start.getTime())
        return prevState;

      return {
        ...prevState,
        end: updatedEnd,
      };
    });
  };

  const openDialog = (entry: ICalendarEvent | NewEntry)=> setEntryDialog({ open: true, entry: entry });

  const moveEvent: DropEventHandler = useCallback(
    ({ event, start, end }) => {
      const other_entries = entries.filter((ev, i) => i !== event.calendar_id);
      // Form new entry with the original and new values
      const updatedEntry = {
        id: event.db_id,
        radio_show_id: event.radio_show_id,
        start_time: start,
        end_time: end,
        day: start.getDay(),
      };
      // Update entries by combining the other entries with the updated one
      setEntries([...other_entries, updatedEntry]);
    }, [entries, setEntries]
  );

  const newEvent: SelectSlotHandler = useCallback(
      ({ start, end }) => {
        openDialog({
          day: start.getDay(),
          start: start,
          end: end,
        });
    }, []
  );

  const resizeEvent: ResizeEventHandler = useCallback(
    ({ event, start, end }) => {
      const other_entries = entries.filter((ev, i) => i !== event.calendar_id);
      // Form new entry with the original and new values
      const updatedEntry = {
        id: event.db_id,
        radio_show_id: event.radio_show_id,
        start_time: start,
        end_time: end,
        day: start.getDay(),
      };
      // Update entries by combining the other entries with the updated one
      setEntries([...other_entries, updatedEntry]);
    }, [entries, setEntries]
  );

  const selectEvent: SelectEventHandler = useCallback(
    (event) => {
      openDialog(event);
    }, []
  );

  // Convert the entries state to a format the calendar can understand
  const cal_entries: ICalendarEvent[] = entries.map((each, i) => ({
    calendar_id: i,
    db_id: each.id,
    title: shows.find(show => show.id === each.radio_show_id)?.title ?? "N/A",
    start: each.start_time,
    end: each.end_time,
    day: each.day,
    radio_show_id: each.radio_show_id,
  }))

  return (
    <Flex direction="column" gap="4">

      <CalendarMonth
        events={cal_entries}
        min={timeRange.start}
        max={timeRange.end}
        onSelectSlot={newEvent}
        onSelectEvent={selectEvent}
        onEventResize={resizeEvent}
        onEventDrop={moveEvent}
        timeSlotHeight={timeSlotHeight}
      />
    </Flex>

  );
}