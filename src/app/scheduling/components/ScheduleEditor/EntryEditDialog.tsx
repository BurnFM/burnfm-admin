import {Dialog, Flex, Text, TextField, Button, Select} from "@radix-ui/themes";
import {NewEntry} from "@/app/scheduling/components/ScheduleEditor/ScheduleEditor";
import {getDate} from "@/lib/dates";
import {TrashIcon} from "@radix-ui/react-icons";
import DeleteEntryDialog from "@/app/scheduling/components/ScheduleEditor/DeleteEntryDialog";
import {ICalendarEvent} from "@/app/components/Calendar";

export default function EntryEditDialog({ data, open, onOpenChange, shows, setData, deleteEntry }: {
  data: ICalendarEvent | NewEntry | null,
  setData: (data: ICalendarEvent | Omit<ICalendarEvent, 'calendar_id'>) => void,
  deleteEntry: () => void,
  open: boolean,
  onOpenChange: (isOpen: boolean) => void,
  shows:  { id: number, title: string }[]
}) {

  const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleSave = (formData: FormData) => {
    if (!data) return;

    const parsedData = {
      radio_show_id: parseInt(formData.get("radio_show_id") as string),
      day: parseInt(formData.get("day") as string),
      start: getDate(parseInt(formData.get("day") as string), formData.get("start_time") as string),
      end: getDate(parseInt(formData.get("day") as string), formData.get("end_time") as string),
    };

    if ("calendar_id" in data) {
      setData({ ...data, ...parsedData });
    } else {
      setData({
        ...parsedData,
        db_id: null,
        title: shows.find((show) => show.id === parsedData.radio_show_id)?.title ?? "N/A"
      });
    }
  };

  if (!data) return;

  const handleDelete = () => {
    if ("calendar_id" in data) {
      deleteEntry(); // Call the passed delete handler
      onOpenChange(false); // Close the main dialog
    }
  };

  return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Content maxWidth="450px">
          <form action={handleSave}>
            <Dialog.Title mb="4">{"calendar_id" in data ? "Edit Schedule Entry" : "Create Schedule Entry"}</Dialog.Title>

            <Flex direction="column" gap="3">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Show
                </Text>
                <Select.Root name={"radio_show_id"} defaultValue={'radio_show_id' in data ? data.radio_show_id.toString() : undefined}>
                  <Select.Trigger placeholder="Pick a show" />
                  <Select.Content>
                    {
                      shows.map((show) =>
                          <Select.Item key={show.id} value={"" + show.id}>{show.title}</Select.Item>
                      )
                    }
                  </Select.Content>
                </Select.Root>
              </label>

              <Flex gap="4">
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Day
                  </Text>
                  <Select.Root name={"day"} defaultValue={"" + data?.day}>
                    <Select.Trigger/>
                    <Select.Content>
                      {
                        DAYS_OF_WEEK.map((show, i) =>
                            <Select.Item key={i} value={"" + (i + 1) % 7}>{show}</Select.Item>
                        )
                      }
                    </Select.Content>
                  </Select.Root>
                </label>
                <label style={{width: "100%"}}>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Start Time
                  </Text>
                  <TextField.Root
                      name={"start_time"}
                      type={"time"}
                      defaultValue={data?.start.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                  />
                </label>
                <label style={{width: "100%"}}>
                  <Text as="div" size="2" mb="1" weight="bold">
                    End Time
                  </Text>
                  <TextField.Root
                      name={"end_time"}
                      type={"time"}
                      defaultValue={data?.end.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                  />
                </label>
              </Flex>

            </Flex>

            <Flex gap="3" mt="4" direction={"row-reverse"} justify="between" align="center">
              <Flex gap="3">
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Dialog.Close>
                  <Button type={"submit"}>
                    Save
                  </Button>
                </Dialog.Close>
              </Flex>

              { "calendar_id" in data && (
                // <Dialog.Close>
                  <DeleteEntryDialog action={handleDelete}>
                    <Button variant="soft" color="ruby">
                      Remove <TrashIcon />
                    </Button>
                  </DeleteEntryDialog>

)}

            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
  );
}