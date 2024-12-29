import {Button, Callout, Flex, Heading, IconButton, Popover, Separator, Skeleton, Text} from "@radix-ui/themes";
import {ExclamationTriangleIcon, PlusIcon, QuestionMarkCircledIcon} from "@radix-ui/react-icons";
import {useEffect, useReducer} from "react";
import {initialState, schedulesReducer} from "@/app/scheduling/components/schedulesReducer";
import {GET_SCHEDULES_ENDPOINT} from "@/lib/endpoints";
import ScheduleCard from "@/app/scheduling/components/ScheduleCard";
import {ISchedule} from "@/lib/ISchedule";

export default function SchedulesList() {
  const [{schedules, error, loading}, dispatch] = useReducer(schedulesReducer, initialState);

  const previous = schedules.filter(schedule => schedule.end_date ? schedule.end_date.getTime() < Date.now() : false);
  const active = schedules.filter(schedule => schedule.end_date ? schedule.end_date.getTime() > Date.now() : true);
  const upcoming = schedules.filter(schedule => schedule.start_date ? schedule.start_date.getTime() > Date.now() : false);

  // Fetch settings on mount
  useEffect(() => {
    fetchSchedules().then();
  }, []);

  const fetchSchedules = async () => {
    dispatch({ type: "FETCH_REQUEST" });

    try {
      const response = await fetch(GET_SCHEDULES_ENDPOINT(), {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        const res = await response.json();
        // Map dates to desired format
        console.log(res);
        // @ts-expect-error type of any causes an error. Defining a specific type defining what the db returns feels too verbose.
        const payload = res.map((x): ISchedule[] => ({ ...x, start_date: new Date(x.startDate), end_date: new Date(x.endDate) }))
        dispatch({
          type: "FETCH_SUCCESS",
          payload: payload,
        });
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: "FETCH_FAILURE",
        payload: "An error occurred while fetching schedules"
      });
    }
  };

  return (
      <>
        <Flex mt="6" gap="4" justify="between" align="center">
          <Heading size="3">Schedules</Heading>

          <Button>
            <PlusIcon /> New schedule
          </Button>
        </Flex>

        { error &&
          <Callout.Root role={"alert"} color={"crimson"}>
            <Callout.Icon>
              <ExclamationTriangleIcon />
            </Callout.Icon>
            <Callout.Text>
              {error}
            </Callout.Text>
          </Callout.Root>
        }

        <Flex gap="3" align="center" height="1em">
          <Separator size="1"/>
          <Text>Active</Text>
          <Popover.Root>
            <Popover.Trigger>
              <IconButton size="1" variant="ghost">
                <QuestionMarkCircledIcon width="18" height="18" />
              </IconButton>
            </Popover.Trigger>
            <Popover.Content size="1" maxWidth="300px">
              <Text as="p" trim="both" size="1">
                The current combination of schedules that defines the final schedule shown on the website.
                The simplest setup is a single schedule, but defining multiple allows you to override the main schedule.
              </Text>
            </Popover.Content>
          </Popover.Root>
          <Separator size="4"/>
        </Flex>

        { active.map((schedule, i) =>
            <ScheduleCard key={i} schedule={schedule}/> )
        }

        {active.length == 0 &&
          <Skeleton loading={loading}>
            <Text align="center" color="gray" size="2">No active schedules</Text>
          </Skeleton>
        }

        <Flex gap="3" align="center" height="1em">
          <Separator size="1"/>
          <Text>Upcoming</Text>
          <Popover.Root>
            <Popover.Trigger>
              <IconButton size="1" variant="ghost">
                <QuestionMarkCircledIcon width="18" height="18" />
              </IconButton>
            </Popover.Trigger>
            <Popover.Content size="1" maxWidth="300px">
              <Text as="p" trim="both" size="1">
                The schedules planned for the future.
              </Text>
            </Popover.Content>
          </Popover.Root>
          <Separator size="4"/>
        </Flex>

        { upcoming.map((schedule, i) =>
            <ScheduleCard key={i} schedule={schedule}/> )
        }

        {upcoming.length == 0 &&
          <Skeleton loading={loading}>
            <Text align="center" color="gray" size="2">No upcoming schedules</Text>
          </Skeleton>
        }

        <Flex gap="3" align="center" height="1em">
          <Separator size="4"/>
        </Flex>

        <Flex gap="3" mt="4" align="center" height="1em">
          <Separator size="1"/>
          <Text>Previous</Text>
          <Separator size="4"/>
        </Flex>

        { previous.map((schedule, i) =>
              <ScheduleCard key={i} schedule={schedule}/> )
        }

        {upcoming.length == 0 &&
          <Skeleton loading={loading}>
            <Text align="center" color="gray" size="2">No previous schedules</Text>
          </Skeleton>
        }
      </>
  );
}