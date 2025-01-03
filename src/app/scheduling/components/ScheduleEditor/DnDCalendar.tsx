import {Calendar as Cal, luxonLocalizer} from "react-big-calendar";
import {DateTime} from "luxon";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import "./calendarStyles.css"
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import React, {useMemo} from "react";

const localizer = luxonLocalizer(DateTime, { firstDayOfWeek: 1 });

const DnDCalendar = withDragAndDrop(Cal);

export const DATE = new Date(1995, 0, 1); // Common year starts on Sunday, note: this impacts logic when using dialog to update time

export default function Calendar({onEventDrop, onEventResize, onSelectEvent, events, onSelectSlot, min, max}) {

  // const eventPropGetter = useCallback(
  //   (event) => ({
  //     ...(event.isDraggable
  //       ? { className: 'isDraggable' }
  //       : { className: 'nonDraggable' }),
  //   }),
  //   []
  // );

  return (
      <DnDCalendar
          date={DATE}
          step={30}
          timeslots={2}
          view={"week"}
          localizer={localizer}
      toolbar={false}
      onEventDrop={onEventDrop}
      onEventResize={onEventResize}
      events={events}
      // draggableAccessor="isDraggable"
      // eventPropGetter={eventPropGetter}
      onSelectSlot={onSelectSlot}
      onSelectEvent={onSelectEvent}
      resizable
      selectable
      min={min}
      max={max}
      formats={{
        dayFormat: (date, _, localizer) => localizer.format(date, 'EEE')
      }}
      // components={{
      //   eventWrapper: ({ event, children }) => (
      //     <div>
      //     <EventContextMenu event={event}>
      //       {children}
      //     </EventContextMenu>
      //     </div>
      //   ),
      // }}
    />
  );
}