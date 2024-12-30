import { DateTime } from "luxon";
import { Calendar as Calendar, luxonLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import "./calendarStyles.css"
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import {Flex, Text} from "@radix-ui/themes";
import {useCallback, useState} from "react";


const localizer = luxonLocalizer(DateTime);

const DnDCalendar = withDragAndDrop(Calendar);

export default function WeekView() {
  const [myEvents, setMyEvents] = useState([]);

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

  return (
    <Flex direction="column" gap="4">
      <Text size="2">Click on an hour timeslot to add a show to the schedule, or drag from one time to another.</Text>
      <Text size="2">
        You can adjust any show&apos;s length by dragging on the edges,
        and move the show by dragging the show itself.
      </Text>
      <DnDCalendar
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
      />
    </Flex>

  );
}