import {Dialog, Flex, Text, TextField, Button, Select} from "@radix-ui/themes";
import {ICalendarEvent, NewEntry} from "@/app/scheduling/components/ScheduleEditor/ScheduleEditor";
import {getDate} from "@/lib/dates";

export default function EntryEditDialog({ data, open, onOpenChange, shows, setData }: {
  data: ICalendarEvent | NewEntry | null,
  setData: (data: ICalendarEvent | Omit<ICalendarEvent, 'calendar_id'>) => void,
  open: boolean,
  onOpenChange: (isOpen: boolean) => void,
  shows:  { id: number, title: string }[]
}) {

  const updateEntry = (formData: FormData) => {
    if (data === null) return;

    const radio_show_id_str = formData.get("radio_show_id");
    const day_str = formData.get("day");
    const start_time_str = formData.get("start_time");
    const end_time_str = formData.get("end_time");


    if (typeof radio_show_id_str !== "string" || typeof day_str !== "string" ||
        typeof start_time_str !== "string" || typeof end_time_str !== "string") {
      return;
    }

    const radio_show_id = parseInt(radio_show_id_str);
    const day = parseInt(day_str);

    if ('calendar_id' in data) {
      const updated: ICalendarEvent = {
        calendar_id: data.calendar_id,
        db_id: null,
        radio_show_id: radio_show_id,
        start: getDate(day, start_time_str),
        end: getDate(day, end_time_str),
        day: day,
        title: shows.find((show) => show.id === radio_show_id)?.title ?? "N/A"
      };
      setData(updated);
      return;
    }

    const newEntry: Omit<ICalendarEvent, 'calendar_id'> = {
      db_id: null,
      radio_show_id: radio_show_id,
      start: getDate(day, start_time_str),
      end: getDate(day, end_time_str),
      day: day,
      title: shows.find((show) => show.id === radio_show_id)?.title ?? "N/A"
    };
    setData(newEntry);
  }

  if (!data) return;

  return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Content maxWidth="450px">
          <form action={updateEntry}>
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
                        ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((show, i) =>
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

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Dialog.Close>
                <Button type={"submit"}>Save</Button>
              </Dialog.Close>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
  );
}