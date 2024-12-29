import Link from "next/link";
import {Card, Flex, Text} from "@radix-ui/themes";
import {ArrowRightIcon} from "@radix-ui/react-icons";
import React from "react";
import {ISchedule} from "@/interfaces/ISchedule";

export default function ScheduleCard({schedule}: {schedule: ISchedule}) {
  return (
      <Card asChild>
        <Link href={"/scheduling/edit/" + schedule.id}>
          <Flex direction="column" align="center" py="1" gap="2">
            <Text size="4" weight="medium">
              {schedule.name}
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
  );
}