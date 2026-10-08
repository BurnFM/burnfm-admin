"use client";

import { useEffect, useReducer } from "react";
import { Flex, Skeleton } from "@radix-ui/themes";
import ScheduleView from "@/app/(scheduling)/schedules/components/ScheduleViewer/ScheduleViewer";
import { editScheduleReducer } from "@/app/(scheduling)/schedules/edit/editScheduleReducer";

export default function CalendarPage() {
  const [{ schedule, shows, loading }, dispatch] =
    useReducer(editScheduleReducer, {
      loading: false,
      shows: [],
      schedule: { id: 0, name: "", start_date: null, end_date: null, entries: [], active: false, start_date_enabled: false, end_date_enabled: false },
      originalSchedule: { id: 0, name: "", start_date: null, end_date: null, entries: [], active: false, start_date_enabled: false, end_date_enabled: false },
      error: null,
      active: false,
      start_date_enabled: false,
      end_date_enabled: false
    });

  return (
    <Flex direction="column">
      <Skeleton loading={loading}>
        <ScheduleView
          entries={schedule.entries}
          setEntries={(entries) =>
            dispatch({ type: "SET_ENTRIES", payload: entries })
          }
          shows={shows}
        />
      </Skeleton>
    </Flex>
  );
}