"use client";

import { useCallback, useState } from "react";
import { Flex } from "@radix-ui/themes";

import CalendarMonth, {
  ICalendarEvent,
  DropEventHandler,
  ResizeEventHandler,
  SelectEventHandler,
  SelectSlotHandler,
} from "@/app/components/CalendarMonth";

import EntryEditDialog from "@/app/(scheduling)/schedules/components/ScheduleEditor/EntryEditDialog";
import { IEntry } from "@/interfaces/ISchedule";

type NewEntry = {
  start: Date;
  end: Date;
  day: number;
};

export default function ScheduleView({
  entries,
  setEntries,
  shows,
}: {
  entries: Omit<IEntry, "schedule_id">[];
  setEntries: (entries: Omit<IEntry, "schedule_id">[]) => void;
  shows: { id: number; title: string }[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<
    ICalendarEvent | NewEntry | null
  >(null);

  const timeSlotHeight = 30;

  // -------------------------
  // convert entries → calendar
  // -------------------------
  const cal_entries: ICalendarEvent[] = entries.map((entry) => ({
    calendar_id: entry.id,
    db_id: entry.id,
    title:
      shows.find((s) => s.id === entry.radio_show_id)?.title ?? "N/A",
    start: new Date(entry.start_time),
    end: new Date(entry.end_time),
    day: entry.day,
    radio_show_id: entry.radio_show_id,
  }));

  // -------------------------
  // OPEN DIALOG
  // -------------------------
  const openDialog = (data: ICalendarEvent | NewEntry) => {
    setSelected(data);
    setDialogOpen(true);
  };

  // -------------------------
  // CREATE NEW EVENT
  // -------------------------
  const onSelectSlot: SelectSlotHandler = useCallback(
    ({ start, end }) => {
      openDialog({
        start,
        end,
        day: start.getDay(),
      });
    },
    []
  );

  // -------------------------
  // SELECT EXISTING EVENT
  // -------------------------
  const onSelectEvent: SelectEventHandler = useCallback((event) => {
    openDialog(event);
  }, []);

  // -------------------------
  // MOVE EVENT
  // -------------------------
  const onEventDrop: DropEventHandler = useCallback(
    ({ event, start, end }) => {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === event.db_id
            ? {
                ...e,
                start_time: start,
                end_time: end,
                day: start.getDay(),
              }
            : e
        )
      );
    },
    [setEntries]
  );

  // -------------------------
  // RESIZE EVENT
  // -------------------------
  const onEventResize: ResizeEventHandler = useCallback(
    ({ event, start, end }) => {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === event.db_id
            ? {
                ...e,
                start_time: start,
                end_time: end,
                day: start.getDay(),
              }
            : e
        )
      );
    },
    [setEntries]
  );

  // -------------------------
  // UPDATE FROM DIALOG
  // -------------------------
  const setData = (data: any) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === data.db_id
          ? {
              ...e,
              radio_show_id: data.radio_show_id,
              start_time: data.start,
              end_time: data.end,
              day: data.day,
            }
          : e
      )
    );
  };

  const deleteEntry = () => {
    if (!selected || !("calendar_id" in selected)) return;

    setEntries((prev) =>
      prev.filter((e) => e.id !== selected.db_id)
    );

    setDialogOpen(false);
  };

  return (
    <Flex direction="column" gap="4" style={{ height: "100vh" }}>
      <div style={{ height: "100%" }}>
        <CalendarMonth
          events={cal_entries}
          onSelectSlot={onSelectSlot}
          onSelectEvent={onSelectEvent}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          timeSlotHeight={timeSlotHeight}
        />
      </div>

      <EntryEditDialog
        data={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        shows={shows}
        setData={setData}
        deleteEntry={deleteEntry}
      />
    </Flex>
  );
}