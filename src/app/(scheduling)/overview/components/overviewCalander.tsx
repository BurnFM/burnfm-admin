"use client";

import { Calendar, luxonLocalizer } from "react-big-calendar";
import { DateTime } from "luxon";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./overviewCalander.css";
import { useEffect, useState } from "react";
import { API, IScheduleAPI } from "@/interfaces/ISchedule";
import { GET_OVERRIDES_ENDPOINT, GET_SCHEDULES_ENDPOINT } from "@/lib/endpoints";
import { useToast } from "@/app/components/Toast";
import { IOverride } from "@/interfaces/IOverride";
import { useRouter } from "next/navigation";
import { Flex, Container, Button, Select } from "@radix-ui/themes";

const localizer = luxonLocalizer(DateTime, {
  firstDayOfWeek: 1,
});

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  active: boolean;
  isOverride: false;
}

interface OverrideEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  active: true;
  isOverride: true;
}

export default function OverviewCalendar() {

  const [events, setEvents] = useState<(CalendarEvent | OverrideEvent)[]>([]);
  
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (typeof window === "undefined") {return new Date();}

    const savedDate = sessionStorage.getItem("burnfm-calendar-date");

    if (savedDate) {
      const parsedDate = new Date(savedDate);

      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    return new Date();
  });

  const months = Array.from({ length: 12 }, (_, index) => DateTime.fromObject({ month: index + 1 }).toFormat("MMMM"));
  const currentYear = DateTime.fromJSDate(currentDate).year;
  const years = Array.from({ length: 21 },(_, index) => currentYear - 10 + index);

  const router = useRouter();
  const handleSelectEvent = (
    event: CalendarEvent | OverrideEvent
  ) => {
    if (event.isOverride) {
      router.push(`/overrides?search=${event.id}`);
    } else {
      router.push(`/schedules/edit/${event.id}`);
    }
  };

  const toast = useToast();

  useEffect(() => {
    async function fetchEvents() {
      try {
        
        const [schedulesResponse, overridesResponse] = await Promise.all([
        fetch(GET_SCHEDULES_ENDPOINT(), {
          method: "GET",
          headers: { Accept: "application/json" },
        }),
        fetch(GET_OVERRIDES_ENDPOINT(), {
          method: "GET",
          headers: { Accept: "application/json" },
        }),
      ]);

      if (!schedulesResponse.ok || !overridesResponse.ok) {
        throw new Error("Failed to fetch calendar events");
      }

      const schedules = await schedulesResponse.json() as IScheduleAPI[];
      const overridesResponseData = await overridesResponse.json() as API<IOverride[]>;

      const scheduleEvents: CalendarEvent[] = schedules.map((schedule) => ({
        id: schedule.id,
        title: schedule.name,
        start: DateTime.fromISO(schedule.start_date).toJSDate(),
        end: DateTime.fromISO(schedule.end_date).toJSDate(),
        active: schedule.active,
        isOverride: false,
      }));

      const overrideEvents: OverrideEvent[] =
        overridesResponseData.data.map((override) => {
          const date = DateTime.fromISO(override.date);

          return {
            id: override.id,
            title: override.type,
            start: date.startOf("day").toJSDate(),
            end: date.plus({ days: 1 }).startOf("day").toJSDate(),
            active: true,
            isOverride: true,
          };
        });

      setEvents([...scheduleEvents, ...overrideEvents]);

      } catch (error) {
        console.error(error);
      }
    }

    fetchEvents();
  }, []);

  useEffect(() => {
    sessionStorage.setItem(
      "burnfm-calendar-date",
      currentDate.toISOString()
    );
  }, [currentDate]);

  const getEventStyle = (event: CalendarEvent | OverrideEvent) => {
    let backgroundColor: string;
    let color: string;

    if (event.isOverride) {
      // Overrides
      backgroundColor = "rgb(183, 81, 187)";
      color = "#ffffff";
    } else if (event.active) {
      // Active schedules
      backgroundColor = "var(--accent-11)";
      color = "#ffffff";
    } else {
      // Inactive schedules
      backgroundColor = "var(--accent-5)";
      color = "#000000";
    }

    return {
      style: {
        backgroundColor,
        borderColor: backgroundColor,
        color,
      },
    };
  };

  return (
    <div className="CalanderContainer">

      <div className="CalanderControl">
        {/* Today button centred on the page */}
        <Flex
          align="center"
          justify="center"
          width="100%"
        >
          <Button
            variant="solid"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </Flex>

        {/* Navigation with month/year selectors in the centre */}
        <div className="CalanderControlButtons">
          <Button
            variant="solid"
            onClick={() => {
              setCurrentDate(
                DateTime.fromJSDate(currentDate)
                  .minus({ months: 1 })
                  .toJSDate()
              );
            }}
          >
            Previous Month
          </Button>

          <Flex align="center" justify="center" gap="2">
            {/* Month selector */}
            <Select.Root
              value={String(DateTime.fromJSDate(currentDate).month)}
              onValueChange={(value) => {
                setCurrentDate(
                  DateTime.fromJSDate(currentDate)
                    .set({ month: Number(value) })
                    .toJSDate()
                );
              }}
            >
              <Select.Trigger
                variant="surface"
                aria-label="Select month"
                className="CalanderMonthSelect"
              />
              <Select.Content position="popper">
                {months.map((month, index) => (
                  <Select.Item key={month} value={String(index + 1)}>
                    {month}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            {/* Year selector */}
            <Select.Root
              value={String(DateTime.fromJSDate(currentDate).year)}
              onValueChange={(value) => {
                setCurrentDate(
                  DateTime.fromJSDate(currentDate)
                    .set({ year: Number(value) })
                    .toJSDate()
                );
              }}
            >
              <Select.Trigger
                variant="surface"
                aria-label="Select year"
                className="CalanderYearSelect"
              />
              <Select.Content position="popper">
                {years.map((year) => (
                  <Select.Item key={year} value={String(year)}>
                    {String(year)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>

          <Button
            variant="solid"
            onClick={() => {
              setCurrentDate(
                DateTime.fromJSDate(currentDate)
                  .plus({ months: 1 })
                  .toJSDate()
              );
            }}
          >
            Next Month
          </Button>
        </div>
      </div>

      <Container p="3"></Container>

      <Calendar
        className="OverviewCalander"
        onNavigate={(newDate) => {setCurrentDate(newDate);}}
        date={currentDate}
        localizer={localizer}
        toolbar={false}
        events={events}
        views={["month"]}
        eventPropGetter={getEventStyle}
        onSelectEvent={handleSelectEvent}
        culture="en-GB"
        showAllEvents
      />
    </div>
  );
}