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
import ScheduleEditor from "@/app/(scheduling)/schedules/components/ScheduleEditor/ScheduleEditor";
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
    active: true,
    entries: []
  },
  originalSchedule: {
    id: 0,
    name: "",
    start_date: null,
    end_date: null,
    active: true,
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
            active: res.active,
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

  if (isInvalidId)
    return notFound();

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
        <form action={updateSchedule}>
          <Box p="6" style={{borderBottom: "1px solid var(--accent-6)"}}>
            <Container size="4">

              <Flex align="center" gap="4">
                <IconButton variant="ghost" size="2" asChild>
                  <Link href={"/schedules"}>
                    <ArrowLeftIcon height={24} width={24}/>
                  </Link>
                </IconButton>

                <Flex direction="column">
                  <Text style={{color: "var(--accent-11)"}}>Edit Schedule</Text>
                  <Skeleton loading={loading}>
                    {schedule.name !== "" ? (
                        <Heading style={{color: "var(--accent-11)"}}>{schedule.name}</Heading>
                    ) : (
                        <Heading style={{color: "var(--accent-7)"}}>No schedule name</Heading>
                    )
                    }
                  </Skeleton>
                </Flex>
              </Flex>

            </Container>
          </Box>

          <Container size="4" p="6">
            <div style={{display:"grid", gridTemplateColumns:"50% 50%", marginBottom:"10px"}}>

              <label style={{gridColumn: "span 2", paddingBottom:"10px"}}>
                <Text as="div" size="2" mb="1" weight="bold">
                  Schedule name *
                </Text>
                <Skeleton loading={loading}>
                  <TextField.Root
                      disabled={loading}
                      value={schedule.name}
                      onChange={(x) => dispatch({type: "SET_NAME", payload: x.target.value})}
                      placeholder="Enter the schedule's name"
                      required
                  />
                </Skeleton>
              </label>

              <Flex direction="row" gap="3" align="center" justify="between" wrap="wrap" style={{marginRight:"5px"}}>
                <Text as="label">
                  <Flex gap="4" align="center">
                    {/*
                      <Switch checked={schedule.start_date !== null}
                              onCheckedChange={(checked) =>
                                  dispatch({
                                    type: "SET_START_DATE",
                                    payload: checked ? originalSchedule.start_date ?? new Date() : null
                                  })
                              }
                              disabled={error ? error.status == "FETCH_FAILURE" : loading}
                      >
                      */}
                    <Box>
                      <Text as="p" size="2" weight="medium">Start Date</Text>
                      <Text as="p" size="1">Determine a date when this schedule starts</Text>
                    </Box>
                  </Flex>
                </Text>

                {schedule.start_date &&

                  <TextField.Root type="date"
                                  disabled={loading}
                                  value={schedule.start_date.toISOString().split("T")[0]}
                                  onChange={handleStartDateChange}
                  />
                }
              </Flex>

              <Flex direction="row" gap="3" align="center" justify="between" wrap="wrap" style={{marginLeft:"5px"}}>
                <Text as="label">
                  <Flex gap="4" align="center">
                    <Switch
                      checked={schedule.active}
                      onCheckedChange={(checked: boolean) =>
                        dispatch({
                          type: "SET_ACTIVE",
                          payload: checked
                        })
                      }
                      disabled={error ? error.status == "FETCH_FAILURE" : loading}
                    />

                    <Box>
                      <Text as="p" size="2" weight="medium">Active</Text>
                      <Text as="p" size="1">Determine if this schedule is active</Text>
                    </Box>
                  </Flex>
                </Text>
              </Flex>

              <Flex direction="row" gap="3" align="center" justify="between" wrap="wrap" style={{marginRight:"5px"}}>
                <Text as="label">
                  <Flex gap="4" align="center">
                    {/*
                    <Switch checked={schedule.end_date !== null}
                            onCheckedChange={(checked) =>
                                dispatch({
                                  type: "SET_END_DATE",
                                  payload: checked ? originalSchedule.end_date ?? new Date() : null
                                })
                            }
                            disabled={error ? error.status == "FETCH_FAILURE" : loading}
                    />
                    */}
                    <Box>
                      <Text as="p" size="2" weight="medium">End Date</Text>
                      <Text as="p" size="1">Determine a date when this schedule stops</Text>
                    </Box>
                  </Flex>
                </Text>

                {schedule.end_date &&

                  <TextField.Root type="date"
                                  disabled={loading}
                                  value={schedule.end_date.toISOString().split("T")[0]}
                                  onChange={handleEndDateChange}
                  />
                }
              </Flex>

              <Flex direction="row" gap="3" align="center" justify="between" wrap="wrap" style={{marginLeft:"5px"}}>
                {/* blank section for layout purposes */}
              </Flex>

              {error &&
                <Callout.Root role={"alert"} color={"crimson"}>
                  <Callout.Icon>
                    <ExclamationTriangleIcon/>
                  </Callout.Icon>
                  <Callout.Text>
                    {error.message}
                  </Callout.Text>
                </Callout.Root>
              }
            </div>

            <Skeleton loading={loading}>
              <ScheduleEditor
                  entries={schedule.entries}
                  setEntries={(entries: Omit<IEntry, "schedule_id">[]) => dispatch({
                    type: "SET_ENTRIES",
                    payload: entries
                  })}
                  shows={shows}
              />
            </Skeleton>
          </Container>

          {hasChanges &&
            <Box px="6" py="4" width="100%" position="sticky" bottom="0"
                 style={{background: "var(--gray-2)", boxShadow: "var(--shadow-6)"}}>
              <Container size="4">
                <Flex gap="2" justify="end" align="center">
                  <Text size="2" style={{width: "100%"}}>You have unsaved changes</Text>
                  <Button variant="soft"
                          color="gray"
                          onClick={() => dispatch({type: "RESET_SCHEDULE"})}>
                    Revert changes
                  </Button>
                  <Button type={"submit"}>Apply changes</Button>
                </Flex>

              </Container>
            </Box>
          }
        </form>
      </Flex>
  );
}