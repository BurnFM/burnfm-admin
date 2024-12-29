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
  Box
} from "@radix-ui/themes";
import {ArrowLeftIcon, ExclamationTriangleIcon} from "@radix-ui/react-icons";
import Link from "next/link";
import {ChangeEvent, useReducer} from "react";
import {initialState, scheduleReducer} from "@/app/scheduling/edit/scheduleReducer";
import {INSERT_SCHEDULE_ENDPOINT} from "@/lib/endpoints";

export default function NewSchedulePage() {
  const [{schedule, loading, error, originalSchedule}, dispatch] = useReducer(scheduleReducer, initialState);

  const hasChanges = JSON.stringify(schedule) !== JSON.stringify(originalSchedule);

  const insertSchedule = async () => {
    dispatch({ type: "FETCH_REQUEST" });

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
        dispatch({ type: "UPDATE_SUCCESS" });
      } else {
        throw new Error(`${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: "FETCH_FAILURE",
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

  return (
      <Flex height="100%" direction="column" flexGrow="1">
        <Flex direction="row"
              gap="4" p="6"
              align="center"
              style={{backgroundColor: "var(--accent-3)", borderBottom: "1px solid var(--accent-6)"}}>
          <IconButton variant="ghost" size="2" asChild>
            <Link href={"/scheduling"}>
              <ArrowLeftIcon height={24} width={24}/>
            </Link>
          </IconButton>
          <Flex direction="column">
            <Text color="purple">New Schedule</Text>
            <Skeleton loading={loading}>
              {schedule.name !== "" ? (
                  <Heading color="purple">{schedule.name}</Heading>
              ) : (
                  <Heading color="purple" style={{opacity: "0.5"}}>No schedule name</Heading>
              )
              }
            </Skeleton>
          </Flex>
        </Flex>

        <Flex p="6" direction="column" gap="2" >

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
                <Switch checked={schedule.start_date !== undefined}
                        onCheckedChange={(checked) =>
                            dispatch({
                              type: "SET_START_DATE",
                              payload: checked ? originalSchedule.start_date ?? new Date() : undefined
                            })
                        }
                        disabled={loading || error != null}
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
                <Switch checked={schedule.end_date !== undefined}
                        onCheckedChange={(checked) =>
                          dispatch({
                            type: "SET_END_DATE",
                            payload: checked ? originalSchedule.end_date ?? new Date() : undefined
                          })
                        }
                        disabled={loading || error != null}
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

          {hasChanges &&
            <Flex gap="2" wrap="wrap">
              <Button variant="soft"
                      color="gray"
                      onClick={() => dispatch({ type: "RESET_SCHEDULE" })}>
                Revert changes
              </Button>
              <Button onClick={insertSchedule}>Save schedule</Button>
            </Flex>
          }

          {error &&
            <Callout.Root role={"alert"} color={"crimson"}>
              <Callout.Icon>
                <ExclamationTriangleIcon/>
              </Callout.Icon>
              <Callout.Text>
                {error}
              </Callout.Text>
            </Callout.Root>
          }
        </Flex>
      </Flex>
  );
}