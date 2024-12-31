import { DateTime } from "luxon";
import { Calendar as Calendar, luxonLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import "./calendarStyles.css"
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import {Callout, Flex, Slider, Text, TextField} from "@radix-ui/themes";
import {useCallback, useEffect, useState} from "react";
import {CursorArrowIcon, HandIcon, PlusIcon, ResetIcon, RowSpacingIcon} from "@radix-ui/react-icons";

const localizer = luxonLocalizer(DateTime, { firstDayOfWeek: 1 });

const DnDCalendar = withDragAndDrop(Calendar);

const initial_dates = {
  start: new Date(1972, 0, 1, 0, 0, 0),
  end: new Date(1972, 0, 1, 23, 59, 59)
}

export default function WeekView() {
  const [myEvents, setMyEvents] = useState([]);
  const [timeSlotHeight, setTimeSlotHeight] = useState(30); // Default height
  const [timeRange, setTimeRange] = useState(initial_dates); // Default height

  useEffect(() => {
    document.documentElement.style.setProperty('--time-slot-min-height', `${timeSlotHeight}px`);
  }, [timeSlotHeight]);


  const handleStartTimeChange = (e) => {
    const hours = e.target.value.split(":")[0]; // Destructure hours and minutes

    setTimeRange((prevState) => {
      // Create a new Date for the start time, preserving the minutes, seconds, and milliseconds
      const updatedStart = new Date(prevState.start);
      updatedStart.setHours(hours, 0, 0, 0); // Only update hours

      // Check that the new start time is not after the end time
      if (updatedStart.getTime() > prevState.end.getTime()) return prevState;

      return {
        ...prevState,
        start: updatedStart,
      };
    });
  };

  // Update the hours for the `end` Date object
  const handleEndTimeChange = (e) => {
    const hours = e.target.value.split(":")[0]; // Destructure hours and minutes

    setTimeRange((prevState) => {
      // Create a new Date for the end time, preserving the minutes, seconds, and milliseconds
      const updatedEnd = new Date(prevState.end);
      updatedEnd.setHours(hours, 59, 59); // Only update hours and minutes

      // Check that the new end time is not before the start time
      if (updatedEnd.getTime() < prevState.start.getTime()) return prevState;

      return {
        ...prevState,
        end: updatedEnd,
      };
    });
  };

  const eventPropGetter = useCallback(
    (event) => ({
      ...(event.isDraggable
        ? { className: 'isDraggable' }
        : { className: 'nonDraggable' }),
    }),
    []
  );

  const moveEvent = useCallback(
    ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
      const { allDay } = event
      if (!allDay && droppedOnAllDaySlot) {
        event.allDay = true
      }

      setMyEvents((prev) => {
        const existing = prev.find((ev) => ev.id === event.id) ?? {}
        const filtered = prev.filter((ev) => ev.id !== event.id)
        return [...filtered, { ...existing, start, end, allDay }]
      })
    },
    [setMyEvents]
  );

  const newEvent = useCallback(
    (event) => {
      setMyEvents((prev) => {
        const idList = prev.map((item) => item.id)
        const newId = (idList.length !== 0) ? Math.max(...idList) + 1 : 1;
        return [...prev, { ...event, isDraggable: true, id: newId }]
      })
    },
    [setMyEvents]
  );

  const resizeEvent = useCallback(
    ({ event, start, end }) => {
      setMyEvents((prev) => {
        const existing = prev.find((ev) => ev.id === event.id) ?? {}
        const filtered = prev.filter((ev) => ev.id !== event.id)
        return [...filtered, { ...existing, start, end }]
      })
    },
    [setMyEvents]
  );

  const baseDate = new Date(2023, 0, 1); // Sunday, Jan 1, 2023

  return (
    <Flex direction="column" gap="4">

      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }} >
        <Callout.Root variant="outline" style={{alignItems: "center"}}>
          <Callout.Icon>
            <CursorArrowIcon />
          </Callout.Icon>

          <Callout.Text>
            <Text as="p" weight="medium" size="3">Add a show</Text>
            <Text as="p">
              Click on an hour slot to add a show to the schedule, or select a range by dragging from one slot to another.
            </Text>
          </Callout.Text>
        </Callout.Root>

        <Callout.Root variant="outline" style={{alignItems: "center"}}>
          <Callout.Icon>
            <HandIcon />
          </Callout.Icon>

          <Callout.Text>
            <Text as="p" weight="medium" size="3">Adjust timings</Text>
            <Text as="p">
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


      <DnDCalendar
        date={baseDate}
        step={30}
        timeslots={2}
        view={"week"}
        localizer={localizer}
        toolbar={false}
        onEventDrop={moveEvent}
        onEventResize={resizeEvent}
        events={myEvents}
        draggableAccessor="isDraggable"
        eventPropGetter={eventPropGetter}
        onSelectSlot={newEvent}
        resizable
        selectable
        min={timeRange.start}
        max={timeRange.end}
        formats={{
          dayFormat: (date, _, localizer) => localizer.format(date, 'EEE')
        }}
      />
    </Flex>

  );
}