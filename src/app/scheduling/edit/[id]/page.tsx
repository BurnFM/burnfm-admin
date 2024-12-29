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
  Box
} from "@radix-ui/themes";
import {ArrowLeftIcon, ExclamationTriangleIcon} from "@radix-ui/react-icons";
import Link from "next/link";
import {ChangeEvent, useEffect, useReducer} from "react";
import {initialState, scheduleReducer} from "@/app/scheduling/edit/scheduleReducer";
import {
  GET_SCHEDULES_ENDPOINT,
  UPDATE_SCHEDULE_ENDPOINT,
} from "@/lib/endpoints";

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
      dispatch({ type: "FETCH_REQUEST" });

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
              start_date: res.startDate ? new Date(res.startDate) : undefined,
              end_date: res.endDate ? new Date(res.endDate) : undefined
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
    dispatch({ type: "FETCH_REQUEST" });

    try {
      const response = await fetch(UPDATE_SCHEDULE_ENDPOINT(id), {
        method: "POST",
        body: JSON.stringify(schedule),

        headers: {
          'Authorization': `${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        dispatch({ type: "UPDATE_SUCCESS" });
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: "FETCH_FAILURE",
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
            <Text color="purple">Edit Schedule</Text>
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
                              payload: checked ? originalSchedule.start_date : undefined
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
                          dispatch({type: "SET_END_DATE", payload: checked ? originalSchedule.end_date : undefined})
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
              <Button onClick={updateSchedule}>Apply changes</Button>
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