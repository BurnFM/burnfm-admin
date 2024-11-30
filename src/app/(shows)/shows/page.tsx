import {Button, Strong, Table, Text, TextField} from "@radix-ui/themes";
import {MagnifyingGlassIcon, PlusIcon} from "@radix-ui/react-icons";
import EditShowDialog from "@/app/(shows)/shows/EditShowDialog";
import {ToastProvider} from "@/app/components/Toast";
import {getAllShows} from "@/app/api/radio_show/route";

export default async function ShowPage() {
  let error: Error | null = null;
  let shows;
  try {
    shows = await getAllShows();
  } catch (e: Error) {
    console.log(e);
    error = e;
  }

  if (error) return (
      <>
        <Text align="center" size="3"><Strong>An error occurred while retrieving show data</Strong></Text>
        <Text align="center" size="1" >{error.message}</Text>
      </>
  );

  return (
      <>
        <TextField.Root placeholder="Search shows...">
          <TextField.Slot>
            <MagnifyingGlassIcon height="15" width="15" />
          </TextField.Slot>
        </TextField.Root>

        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Title*</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Photo</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Hosts</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Recorded</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {
              shows.map((show, i) => (
                  <Table.Row key={i}>
                    <Table.RowHeaderCell>{show.id}</Table.RowHeaderCell>
                    <Table.Cell>{show.title}</Table.Cell>
                    <Table.Cell>{show.description}</Table.Cell>
                    <Table.Cell>{show.photo}</Table.Cell>
                    <Table.Cell>{show.hosts}</Table.Cell>
                    <Table.Cell>0</Table.Cell>
                  </Table.Row>
              ))
            }
          </Table.Body>
        </Table.Root>

        <ToastProvider>
          <EditShowDialog>
            <Button>
              <PlusIcon /> New show
            </Button>
          </EditShowDialog>
        </ToastProvider>

      </>
  );
}
