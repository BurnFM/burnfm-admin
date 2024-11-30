import {Button, Table, TextField} from "@radix-ui/themes";
import {MagnifyingGlassIcon, PlusIcon} from "@radix-ui/react-icons";

export default function Home() {
  return (
      <>
        <TextField.Root placeholder="Search podcasts...">
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
            </Table.Row>
          </Table.Header>

          <Table.Body>
            <Table.Row>
              <Table.RowHeaderCell>0</Table.RowHeaderCell>
              <Table.Cell>My radio show</Table.Cell>
              <Table.Cell>Developer</Table.Cell>
              <Table.Cell>Photo</Table.Cell>
              <Table.Cell>Chris</Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.RowHeaderCell>1</Table.RowHeaderCell>
              <Table.Cell>The 5 o&apos;clock show</Table.Cell>
              <Table.Cell>Admin</Table.Cell>
              <Table.Cell>Photo</Table.Cell>
              <Table.Cell>James</Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.RowHeaderCell>2</Table.RowHeaderCell>
              <Table.Cell>Mother Father</Table.Cell>
              <Table.Cell>Developer</Table.Cell>
              <Table.Cell>Photo</Table.Cell>
              <Table.Cell>Sophie</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>

        <Button>
          <PlusIcon /> New podcast
        </Button>
      </>
  );
}
