import {AlertDialog, Button, Callout, Flex, Link, Text} from "@radix-ui/themes";
import {ReactNode} from "react";
import {useToast} from "@/app/components/Toast";
import {DELETE_SCHEDULE_ENDPOINT} from "@/lib/endpoints";
import {IScheduleExtended} from "@/interfaces/ISchedule";
import {InfoCircledIcon} from "@radix-ui/react-icons";
import NextLink from "next/link";

export default function DeleteScheduleDialog({schedule, onSuccess, children, setSchedule} : {
  schedule: IScheduleExtended | null,
  setSchedule: (schedule: IScheduleExtended | null) => void,
  onSuccess?: () => void,
  children?: ReactNode
}) {

  const toast = useToast();

  if (!schedule) return;

  // Use a Set to find unique values
  const uniqueShows = new Set(schedule.entries.map(entry => entry.radio_show_id));

  const deleteSchedule = async () => {
    try {
      console.log(process.env.NEXT_PUBLIC_AUTH_TOKEN)
      const response = await fetch(DELETE_SCHEDULE_ENDPOINT(schedule.id), {
        method: "DELETE",
        headers: {
          'Authorization': `${process.env.NEXT_PUBLIC_AUTH_TOKEN}`  // Pass the token for authorization
        }
      });
      if (response.ok) {
        if (onSuccess) onSuccess();
        setSchedule(null);
        toast.showToast("Deleted schedule", "");
      } else {
        toast.showToast("An error occurred", `${response.status} Error: ${response.statusText}`);
      }
    } catch (e) {
      console.log(e)
      toast.showToast("An error occurred", "An unexpected error occurred. Please refresh the page or try again later.");
    }
  }

  return (
      <AlertDialog.Root open={schedule !== null} onOpenChange={(isOpen) => !isOpen ? setSchedule(null) : undefined}>
        {children &&
          <AlertDialog.Trigger>
            { children }
          </AlertDialog.Trigger>
        }


        <AlertDialog.Content maxWidth="450px">
          <AlertDialog.Title>Delete Schedule &#34;{schedule.name}&#34;</AlertDialog.Title>
          <Flex direction="column" as="div" my="4" gap="2">
            { uniqueShows.size === 0 ? (
                <Text size="2">This schedule doesn&apos;t define the timings for any shows.</Text>
            ) : <>
                { uniqueShows.size === 1 ? <>
                  <Text size="2">This schedule defines the timings for one show.</Text>
                  <Text size="2">The show itself won’t be deleted</Text>
                  <Text size="2">Its timings that are determined by this schedule will be erased.</Text>
                  <Text size="2">This action cannot be undone.</Text>
                </> : <>
                  <Text size="2">This schedule defines the timings for {uniqueShows.size} shows.</Text>
                  <Text size="2">The shows themselves won’t be deleted, however their timings determined by this schedule will be erased.</Text>
                  <Text size="2">This action cannot be undone.</Text>
                </> }
              <Callout.Root mt="3" mb="3" color="sky" style={{alignItems: "center"}}>
                <Callout.Icon>
                  <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text>
                  You can disable this schedule instead which preserves show timings by deactivating it or <Link asChild>
                    <NextLink href={"/scheduling/edit/"+schedule.id}>
                      changing its End Date
                    </NextLink> 
                  </Link>.
                </Callout.Text>
              </Callout.Root>

            </> }
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button variant="solid" color="ruby" onClick={deleteSchedule}>
                Delete Schedule
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
  );
}