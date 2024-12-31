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
  Box, Container
} from "@radix-ui/themes";
import {ArrowLeftIcon, ExclamationTriangleIcon} from "@radix-ui/react-icons";
import Link from "next/link";
import {ChangeEvent, useEffect, useReducer} from "react";
import {scheduleReducer, ScheduleState} from "@/app/scheduling/edit/scheduleReducer";
import {
  GET_SCHEDULES_ENDPOINT,
  UPDATE_SCHEDULE_ENDPOINT,
} from "@/lib/endpoints";
import WeekView from "@/app/scheduling/components/Calendar";

const initialState: ScheduleState = {
  loading: false,
  schedule: {
    id: 0,
    name: "",
    start_date: null,
    end_date: null
  },
  originalSchedule: {
    id: 0,
    name: "",
    start_date: null,
    end_date: null
  },
  error: null,
};

export default function EditSchedulePage() {
  const [{schedule, loading, error, originalSchedule}, dispatch] = useReducer(scheduleReducer, initialState);

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

      try {
        const response = await fetch(GET_SCHEDULES_ENDPOINT(id), {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        });

        if (response.ok) {
          const res = await response.json();
          console.log(res);

          dispatch({
            type: "FETCH_SUCCESS",
            payload: {
              id: res.id,
              name: res.name,
              start_date: res.start_date ? new Date(res.start_date) : null,
              end_date: res.end_date ? new Date(res.end_date) : null
            }
          });

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
    };

    fetchSchedule().then();
  }, [id, isInvalidId]);

  if (isInvalidId)
    return notFound();

  const updateSchedule = async () => {
    dispatch({ type: "START_REQUEST" });

    const formatted = {
      ... schedule,
      start_date: schedule.start_date?.toISOString().split('T')[0],
      end_date: schedule.end_date?.toISOString().split('T')[0],
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
        throw new Error(`${response.status} - ${response.statusText}`);
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
      <Box p="6" style={{backgroundColor: "var(--accent-3)", borderBottom: "1px solid var(--accent-6)"}}>
        <Container size="4">

          <Flex align="center" gap="4">
            <IconButton variant="ghost" size="2" asChild>
              <Link href={"/scheduling"}>
                <ArrowLeftIcon height={24} width={24}/>
              </Link>
            </IconButton>

            <Flex direction="column">
              <Text style={{color: "var(--accent-11)"}}>Edit Schedule</Text>
              <Skeleton loading={loading}>
                { schedule.name !== "" ? (
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
        <Flex direction="column" gap="2" mb="6" asChild>
          <form action={updateSchedule}>

            <label>
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


            <Flex direction="row" gap="3" align="center" justify="between" wrap="wrap">
              <Text as="label">
                <Flex gap="4" align="center">
                  <Switch checked={schedule.start_date !== null}
                          onCheckedChange={(checked) =>
                              dispatch({
                                type: "SET_START_DATE",
                                payload: checked ? originalSchedule.start_date ?? new Date() : null
                              })
                          }
                          disabled={error ? error.status == "FETCH_FAILURE" : loading}
                  />
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

            <Flex direction="row" gap="3" align="center" justify="between" wrap="wrap">
              <Text as="label">
                <Flex gap="4" align="center">
                  <Switch checked={schedule.end_date !== null}
                          onCheckedChange={(checked) =>
                              dispatch({
                                type: "SET_END_DATE",
                                payload: checked ? originalSchedule.end_date ?? new Date() : null
                              })
                          }
                          disabled={error ? error.status == "FETCH_FAILURE" : loading}
                  />
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

            {hasChanges &&
              <Flex gap="2" wrap="wrap">
                <Button variant="soft"
                        color="gray"
                        onClick={() => dispatch({type: "RESET_SCHEDULE"})}>
                  Revert changes
                </Button>
                <Button type={"submit"}>Apply changes</Button>
              </Flex>
            }

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
          </form>
        </Flex>

        <WeekView />
      </Container>

    </Flex>
  );
}