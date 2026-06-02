"use client"
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
import {ChangeEvent, useReducer} from "react";
import {scheduleReducer, ScheduleState} from "@/app/(scheduling)/schedules/new/createScheduleReducer";
import {INSERT_SCHEDULE_ENDPOINT} from "@/lib/endpoints";
import {useRouter} from "next/navigation";

const initialState: ScheduleState = {
  loading: false,
  schedule: {
    name: "",
    start_date: null,
    end_date: null,
    active: false,
  },
  originalSchedule: {
    name: "",
    start_date: null,
    end_date: null,
    active: false,
  },
  error: null,
};

export default function NewSchedulePage() {
  const [{schedule, loading, error, originalSchedule}, dispatch] = useReducer(scheduleReducer, initialState);
  const router = useRouter();

  const hasChanges = JSON.stringify(schedule) !== JSON.stringify(originalSchedule);
  const hasName = schedule.name.trim().length > 0;

  const insertSchedule = async () => {
    dispatch({ type: "START_REQUEST" });

    const formatted = {
      ... schedule,
      start_date: schedule.start_date?.toISOString().split('T')[0],
      end_date: schedule.end_date?.toISOString().split('T')[0],
    }

    try {
      console.log("Data to send: " + JSON.stringify(formatted))
      const response = await fetch(INSERT_SCHEDULE_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(formatted),

        headers: {
          'Authorization': `${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const res = await response.json();
        router.push("/schedules/edit/" + res.id);
        dispatch({ type: "UPDATE_SUCCESS" });
      } else {
        throw new Error(`${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: "UPDATE_FAILURE",
        payload: "An error occurred while saving new schedule"
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

  const handleActiveChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    dispatch({ type: "SET_ACTIVE", payload: checked });
  };

  return (
      <Flex height="100%" direction="column" flexGrow="1">
        <Box p="6" style={{backgroundColor: "var(--accent-3)", borderBottom: "1px solid var(--accent-6)"}}>
          <Container size="4">
            <Flex align="center" gap="4">
              <IconButton variant="ghost" size="2" asChild>
                <Link href={"/schedules"}>
                  <ArrowLeftIcon height={24} width={24}/>
                </Link>
              </IconButton>

              <Flex direction="column">
                <Text style={{color: "var(--accent-11)"}}>New Schedule</Text>
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

        <Box p="6">
          <Container size="4">
            <Flex direction="column" gap="2" asChild>
              <form action={insertSchedule}>

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
                            disabled={ error ? error.status == "FETCH_FAILURE" : loading }
                    />
                    <Box>
                      <Text as="p" size="2" weight="medium">Start Date</Text>
                      <Text as="p" size="1">Determine a date when this schedule starts</Text>
                    </Box>
                  </Flex>
                </Text>

                { schedule.start_date &&

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
                            disabled={ error ? error.status == "FETCH_FAILURE" : loading }
                    />
                    <Box>
                      <Text as="p" size="2" weight="medium">End Date</Text>
                      <Text as="p" size="1">Determine a date when this schedule stops</Text>
                    </Box>
                  </Flex>
                </Text>

                { schedule.end_date &&

                  <TextField.Root type="date"
                                  disabled={loading}
                                  value={schedule.end_date.toISOString().split("T")[0]}
                                  onChange={handleEndDateChange}
                  />
                }
              </Flex>

              <Flex direction="row" gap="3" align="center" justify="between" wrap="wrap">
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

              <Flex gap="2" wrap="wrap">
                <Button variant="soft"
                        color="gray"
                        onClick={() => dispatch({ type: "RESET_SCHEDULE" })}
                        disabled={!hasChanges}>
                  Revert changes
                </Button>
                <Button type="submit" disabled={!hasChanges || !hasName}>Save schedule</Button>
              </Flex>

              { error &&
                <Callout.Root role={"alert"} color={"crimson"}>
                  <Callout.Icon>
                    <ExclamationTriangleIcon/>
                  </Callout.Icon>
                  <Callout.Text>
                    { error.message }
                  </Callout.Text>
                </Callout.Root>
              }
              </form>
            </Flex>
          </Container>
        </Box>
      </Flex>
  );
}