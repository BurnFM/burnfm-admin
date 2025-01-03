import {Callout, Flex, Slider, Text, TextField} from "@radix-ui/themes";
import {ChangeEventHandler, useCallback, useEffect, useState} from "react";
import {CursorArrowIcon, HandIcon} from "@radix-ui/react-icons";
import Calendar from "@/app/scheduling/components/ScheduleEditor/DnDCalendar";
import {IEntry} from "@/interfaces/ISchedule";
import EntryEditDialog from "@/app/scheduling/components/ScheduleEditor/EntryEditDialog";
import {start} from "node:repl";


export type ICalendarEvent = {
  calendar_id: number,
  db_id: number | null,
  title: string,
  start: Date,
  end: Date,
  day: number,
  radio_show_id: number,
}

export type NewEntry = {
  start: Date,
  end: Date,
  day: number,
}

type SelectSlotHandler = (slotInfo: {
  start: Date,
  end: Date,
  slots: Array<Date>,
  action: 'select' | 'click' | 'doubleClick',
  resourceId?: number, // only if the calendar is resource view
  bounds?: {
    // For "select" action
    x: number,
    y: number,
    top: number,
    right: number,
    left: number,
    bottom: number,
  },
  box?: {
    // For "click" or "doubleClick" actions
    clientX: number,
    clientY: number,
    x: number,
    y: number,
  },
}) => void;

type SelectEventHandler = (event: ICalendarEvent) => void;

type EventResizeHandler = (resize: {
  event: ICalendarEvent,
  start: Date,
  end: Date
}) => void;

type EventDropHandler = (event: {
  event: ICalendarEvent,
  start: Date,
  end: Date,
  allDay: boolean
}) => void;

const initial_dates = {
  start: new Date(1972, 0, 1, 0, 0, 0),
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

  useEffect(() => {
    document.documentElement.style.setProperty('--time-slot-min-height', `${timeSlotHeight}px`);
  }, [timeSlotHeight]);

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

  const moveEvent: EventDropHandler = useCallback(
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
      // const title = window.prompt('New Event name');  // TODO: Get radio_show_id here
      // if (title) {
      //   // const idList = entries.map((item) => item.id);
      //   // const id = (idList.length !== 0) ? Math.max(...idList) + 1 : 1;
      //   const newEntry = {
      //     id: null,
      //     radio_show_id: 0,
      //     start_time: start,
      //     end_time: end,
      //     day: start.getDay(),
      //   };
      //   // Update entries by joining the original entries with the new one
      //   setEntries([...entries, newEntry]);
      // }
    }, [entries, setEntries]
  );

  const resizeEvent: EventResizeHandler = useCallback(
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
  const cal_entries = entries.map((each, i) => ({
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

      <EntryEditDialog
          shows={shows}
          data={entryDialog.entry}
          setData={(data: ICalendarEvent | Omit<ICalendarEvent, 'calendar_id'>) => {
            // if updating
            if ('calendar_id' in data) {
              const other_entries = entries.filter((ev, i) => i !== data.calendar_id);
              // Form new entry with the original and new values
              const updatedEntry = {
                id: data.db_id,
                radio_show_id: data.radio_show_id,
                start_time: data.start,
                end_time: data.end,
                day: data.day,
              };
              // Update entries by combining the other entries with the updated one
              setEntries([...other_entries, updatedEntry]);
              return;
            }

            // Form new entry with the original and new values
            const newEntry = {
              id: data.db_id,
              radio_show_id: data.radio_show_id,
              start_time: data.start,
              end_time: data.end,
              day: data.day,
            };
            // Update entries by adding the new entry
            setEntries([...entries, newEntry]);
          }}
          open={entryDialog.open}
          onOpenChange={(isOpen: boolean) => setEntryDialog({ ...entryDialog, open: isOpen })}
      />

      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }} >
        <Callout.Root variant="outline" style={{alignItems: "center"}}>
          <Callout.Icon>
            <CursorArrowIcon />
          </Callout.Icon>

          <Callout.Text>
            <Text weight="medium" size="3" style={{display: "block"}}>Add a show</Text>
            <Text>
              Click on an hour slot to add a show to the schedule, or select a range by dragging from one slot to another.
            </Text>
          </Callout.Text>
        </Callout.Root>

        <Callout.Root variant="outline" style={{alignItems: "center"}}>
          <Callout.Icon>
            <HandIcon />
          </Callout.Icon>

          <Callout.Text>
            <Text weight="medium" size="3" style={{display: "block"}}>Adjust timings</Text>
            <Text>
              Move the show to a different date or time by dragging the show itself.
              Drag on the top or bottom edge of a show to change the start and end times.
            </Text>
          </Callout.Text>
        </Callout.Root>
      </Flex>


      <Flex justify="between">
        <Flex gap="2">
          <Text as="label" size="2">
            <Flex gap="2" align="center" maxWidth={"200px"}>
              <Text as="p" wrap="nowrap"> View from: </Text>
              <TextField.Root type="time"
                              step="3600000"
                              value={timeRange.start.toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              })}
                              onChange={handleStartTimeChange}
              />
            </Flex>
          </Text>

          <Text as="label" size="2">
            <Flex gap="2" align="center" maxWidth={"200px"}>
              <Text as="p" wrap="nowrap"> until: </Text>
              <TextField.Root type="time"
                              step="3600000"
                              value={timeRange.end.toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              })}
                              onChange={handleEndTimeChange}
              />
            </Flex>
          </Text>
        </Flex>


        <Flex gap="2" align="center" width={"200px"}>
          <Text size="2">Zoom:</Text>
          <Slider min={20} max={50} step={0.5} value={[timeSlotHeight]}
                  onValueChange={(val) => setTimeSlotHeight(val[0])}/>
        </Flex>
      </Flex>

      {/*<div>*/}
      {/*  {entries.map(((entry, i) => <p key={i}>{JSON.stringify(entry)}</p>))}*/}
      {/*</div>*/}


      <Calendar
        events={cal_entries}
        min={timeRange.start}
        max={timeRange.end}
        onSelectSlot={newEvent}
        onSelectEvent={selectEvent}
        onEventResize={resizeEvent}
        onEventDrop={moveEvent}
      />
    </Flex>

  );
}