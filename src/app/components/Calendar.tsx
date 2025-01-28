import {Calendar as Cal, luxonLocalizer} from "react-big-calendar";
import {DateTime} from "luxon";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import "./calendarStyles.css"
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import React, {useEffect} from "react";

export type SelectSlotHandler = (slotInfo: {
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

export type SelectEventHandler = (event: ICalendarEvent) => void;

export type ResizeEventHandler = (resize: {
  event: ICalendarEvent,
  start: Date,
  end: Date
}) => void;

export type DropEventHandler = (event: {
  event: ICalendarEvent,
  start: Date,
  end: Date,
  allDay: boolean
}) => void;

export type ICalendarEvent = {
  calendar_id: number,
  db_id: number | null,
  title: string,
  start: Date,
  end: Date,
  day: number,
  radio_show_id: number,
}

const localizer = luxonLocalizer(DateTime, { firstDayOfWeek: 1 });

const DnDCalendar = withDragAndDrop(Cal);

export const DATE = new Date(1995, 0, 1); // Common year starts on Sunday, note: this impacts logic when using dialog to update time

export default function Calendar({onEventDrop, onEventResize, onSelectEvent, events, onSelectSlot, min, max, timeSlotHeight}: {
  onEventDrop: DropEventHandler,
  onEventResize: ResizeEventHandler,
  onSelectEvent: SelectEventHandler,
  onSelectSlot: SelectSlotHandler,
  events: ICalendarEvent[],
  min: Date,
  max: Date,
  timeSlotHeight: number
}) {

  useEffect(() => {
    document.documentElement.style.setProperty('--time-slot-min-height', `${timeSlotHeight}px`);
  }, [timeSlotHeight]);

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
          onSelectSlot={onSelectSlot}
          onSelectEvent={onSelectEvent}
          events={events}
          resizable
          selectable
          min={min}
          max={max}
          formats={{
            dayFormat: (date, _, localizer) => localizer.format(date, 'EEE')
          }}
      />
  );
}