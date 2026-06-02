import Link from "next/link";
import {Card, ContextMenu, Flex, Text} from "@radix-ui/themes";
import {ArrowRightIcon, Pencil1Icon, TrashIcon, CopyIcon} from "@radix-ui/react-icons";
import React from "react";
import {IScheduleExtended} from "@/interfaces/ISchedule";
import DuplicateScheduleDialog from "@/app/(scheduling)/schedules/components/SchedulesList/DuplicateScheduleDialog";

export default function ScheduleCard({schedule, openDeleteDialog, onDuplicateSuccess}: {schedule: IScheduleExtended, openDeleteDialog: (schedule: IScheduleExtended) => void, onDuplicateSuccess?: () => Promise<void> | void }) {
  return (
      <ContextMenu.Root>

        <ContextMenu.Trigger>
          <Card variant="classic" asChild>
            <Link href={"/schedules/edit/" + schedule.id}>
              <Flex direction="column" align="center" py="1" gap="2">
                <Text size="4" weight="medium">
                  {schedule.name}
                  {!schedule.active && <div style={{ color: 'red' }}>(Schedule Not Active)</div>}
                </Text>
                <Flex gap="2" align="center">
                  <Text size="2" weight="medium">
                    {schedule.start_date?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                  <ArrowRightIcon />
                  <Text size="2" weight="medium">
                    {schedule.end_date?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </Flex>
              </Flex>
            </Link>
          </Card>
        </ContextMenu.Trigger>

        <ContextMenu.Content>
          <ContextMenu.Item asChild>
            <Link href={"/schedules/edit/" + schedule.id}>
              <Pencil1Icon /> Edit
            </Link>
          </ContextMenu.Item>
          <DuplicateScheduleDialog schedule={schedule} onSuccess={onDuplicateSuccess}>
            <ContextMenu.Item
              onSelect={(e) => {
                e.preventDefault();
              }}
            >
              <CopyIcon /> Duplicate
            </ContextMenu.Item>
          </DuplicateScheduleDialog>
          <ContextMenu.Separator />
          <ContextMenu.Item color="ruby" onClick={() => openDeleteDialog(schedule)}>
              <TrashIcon /> Delete
          </ContextMenu.Item>
        </ContextMenu.Content>

      </ContextMenu.Root>
  );
}