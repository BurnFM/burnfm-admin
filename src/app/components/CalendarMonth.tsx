"use client";

import { Calendar as Cal, luxonLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./calendarStyles.css";

const localizer = luxonLocalizer(DateTime, { firstDayOfWeek: 1 });
const DnDCalendar = withDragAndDrop(Cal);

export type ICalendarEvent = {
  calendar_id: number;
  db_id: number | null;
  title: string;
  start: Date;
  end: Date;
  day: number;
  radio_show_id: number;

  isOverride?: boolean;
};

export type DropEventHandler = (args: {
  event: ICalendarEvent;
  start: Date;
  end: Date;
  allDay: boolean;
}) => void;

export type ResizeEventHandler = (args: {
  event: ICalendarEvent;
  start: Date;
  end: Date;
}) => void;

export type SelectEventHandler = (event: ICalendarEvent) => void;

export type SelectSlotHandler = (slotInfo: {
  start: Date;
  end: Date;
  slots: Date[];
  action: "select" | "click" | "doubleClick";
}) => void;

export default function CalendarMonth({
  events,
  onEventDrop,
  onEventResize,
  onSelectEvent,
  onSelectSlot,
  timeSlotHeight,
}: {
  events: ICalendarEvent[];
  onEventDrop: DropEventHandler;
  onEventResize: ResizeEventHandler;
  onSelectEvent: SelectEventHandler;
  onSelectSlot: SelectSlotHandler;
  timeSlotHeight: number;
}) {
  const [currentDate] = useState(new Date());

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--time-slot-min-height",
      `${timeSlotHeight}px`
    );
  }, [timeSlotHeight]);

  const eventStyleGetter = (event: ICalendarEvent) => {
    if (event.isOverride) {
      return {
        style: {
          backgroundColor: "#ff6b6b",
          border: "1px solid #c92a2a",
          color: "white",
        },
      };
    }

    return {
      style: {
        backgroundColor: "#4dabf7",
        border: "1px solid #1c7ed6",
        color: "white",
      },
    };
  };

  return (
    <DnDCalendar
      localizer={localizer}
      date={currentDate}
      view="month"
      events={events}
      toolbar={false}
      selectable
      resizable
      draggableAccessor={() => true}
      resizableAccessor={() => true}
      eventPropGetter={eventStyleGetter}
      onEventDrop={onEventDrop}
      onEventResize={onEventResize}
      onSelectEvent={onSelectEvent}
      onSelectSlot={onSelectSlot}
      formats={{
        dayFormat: (date, _, localizer) =>
          localizer.format(date, "EEE"),
      }}
    />
  );
}