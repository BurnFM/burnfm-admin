"use client"
import {notFound, useParams} from "next/navigation";
import {
  Text,
  Flex,
  Heading,
  IconButton,
  Button,
  Callout,
  Skeleton,
  TextField,
  Switch,
  Box, Container,
  Grid
} from "@radix-ui/themes";
import {ArrowLeftIcon, ExclamationTriangleIcon} from "@radix-ui/react-icons";
import Link from "next/link";
import {ChangeEvent, useEffect, useReducer} from "react";
import {editScheduleReducer, EditScheduleState} from "@/app/(scheduling)/schedules/edit/editScheduleReducer";
import {
  GET_RADIOSHOW_ENDPOINT,
  GET_SCHEDULES_ENDPOINT,
  UPDATE_SCHEDULE_ENDPOINT,
} from "@/lib/endpoints";
import ScheduleViewer from "@/app/(scheduling)/schedules/components/ScheduleViewer/ScheduleViewer";
import {API, IEntry, IScheduleAPI, IScheduleExtended} from "@/interfaces/ISchedule";
import {IShow} from "@/interfaces/IShow";
import {getDate, toDateString, toTimeString} from "@/lib/dates";
import entry from "next/dist/server/typescript/rules/entry";

const initialState: EditScheduleState = {
  loading: false,
  shows: [],
  schedule: {
    id: 0,
    name: "",
    start_date: null,
    end_date: null,
    entries: []
  },
  originalSchedule: {
    id: 0,
    name: "",
    start_date: null,
    end_date: null,
    entries: []
  },
  error: null,
};

export default function EditSchedulePage() {
  const [{schedule, shows, loading, error, originalSchedule}, dispatch] = useReducer(editScheduleReducer, initialState);

  // Get id parameter
  const params = useParams();
  const id = Number(params.id);
  const isInvalidId = isNaN(id) || id <= 0;

  const hasChanges = JSON.stringify(schedule) !== JSON.stringify(originalSchedule);

  // Fetch settings on mount
  useEffect(() => {
    if (isInvalidId) return;

    const fetchSchedule = async () => {
      dispatch({ type: "START_REQUEST" });

      const data: {
        schedule?: IScheduleExtended
        shows: { id: number, title: string }[]
      } = {
        schedule: undefined,
        shows: []
      };

      // Get schedule
      try {
        const response = await fetch(GET_SCHEDULES_ENDPOINT(id), {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        });

        if (response.ok) {
          const res = await response.json() as IScheduleAPI;
          console.log(res);
          data.schedule = {
            id: res.id,
            name: res.name,
            start_date: res.start_date ? new Date(res.start_date) : null,
            end_date: res.end_date ? new Date(res.end_date) : null,
            entries: res.entries.map(entry => ({
              id: entry.entry_id,
              day: parseInt(entry.day),
              start_time: getDate(parseInt(entry.day), entry.start_time),
              end_time: getDate(parseInt(entry.day), entry.end_time),
              radio_show_id: entry.show.id,
            }))
          };
        } else {
          throw new Error(response.statusText);
        }
      } catch (error) {
        console.error(error);
        dispatch({
          type: "FETCH_FAILURE",
          payload: "An error occurred while fetching General Settings"
        });
        return;
      }

      // Get radio shows
      try {
        const response = await fetch(GET_RADIOSHOW_ENDPOINT(), {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        });

        if (response.ok) {
          const res = await response.json() as API<IShow[]>;
          console.log(res);
          data.shows = res.data.map(show => ({id: show.id, title: show.title}));
        } else {
          throw new Error(response.statusText);
        }
      } catch (error) {
        console.error(error);
        dispatch({
          type: "FETCH_FAILURE",
          payload: "An error occurred while fetching Shows"
        });
        return;
      }

      dispatch({
        type: "FETCH_SUCCESS",
        payload: {
          schedule: data.schedule!,
          shows: data.shows
        }
      });
    };

    fetchSchedule().then();
  }, [id, isInvalidId]);


  const updateSchedule = async () => {
    dispatch({ type: "START_REQUEST" });

    const formatted = {
      ... schedule,
      start_date: toDateString(schedule.start_date),
      end_date: toDateString(schedule.end_date),
      entries: schedule.entries.map(entry => ({
        id: entry.id,
        radio_show_id: entry.radio_show_id,
        day: entry.day,
        start_time: toTimeString(entry.start_time),
        end_time: toTimeString(entry.end_time)
      }))
    }

    try {
      console.log("Data to send: " + JSON.stringify(formatted))
      const response = await fetch(UPDATE_SCHEDULE_ENDPOINT(id), {
        method: "POST",
        body: JSON.stringify(formatted),

        headers: {
          'Authorization': `${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        dispatch({ type: "UPDATE_SUCCESS" });
      } else {
        throw new Error(`${response.status} - ${await response.text()}`);
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: "UPDATE_FAILURE",
        payload: "An error occurred while saving changes to schedule"
      });
    }
  };

  const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(event.target.value);
    dispatch({ type: "SET_START_DATE", payload: selectedDate });
  };

  const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(event.target.value);
    dispatch({ type: "SET_END_DATE", payload: selectedDate });
  };

  return (
      <Flex height="100%" direction="column" flexGrow="1">

          <Container p="3"></Container> {/* used for padding as the main schedule page I removed the padding*/}


            <Skeleton loading={loading}>
              <ScheduleViewer
                  entries={schedule.entries}
                  setEntries={(entries: Omit<IEntry, "schedule_id">[]) => dispatch({
                    type: "SET_ENTRIES",
                    payload: entries
                  })}
                  shows={shows}
              />
            </Skeleton>

      </Flex>
  );
}