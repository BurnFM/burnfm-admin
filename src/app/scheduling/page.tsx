"use client"

import {Flex, Heading, Text} from "@radix-ui/themes";
import {ActivityLogIcon} from "@radix-ui/react-icons";
import SettingsPanel from "@/app/scheduling/components/SettingsPanel";
import SchedulesList from "@/app/scheduling/components/SchedulesList";


export default function SchedulePage() {
  return (
      <Flex height="100%" direction="column" flexGrow="1">
        <Flex direction="column"
              gap="4" p="6"
              style={{backgroundColor: "var(--accent-3)", borderBottom: "1px solid var(--accent-6)"}}
        >
          <Flex align="center" gap="3">
            <ActivityLogIcon style={{color: "var(--accent-11)"}} height={30} width={30}/>
            <Heading id="heading" color="purple">Scheduling</Heading>
          </Flex>
          <Flex direction="column" gap="1">
            <Text weight="medium" style={{color: "var(--accent-12)"}}>Define weekly schedules and add or remove Shows</Text>
          </Flex>
        </Flex>

        <Flex direction="column" gap="4" p="6">
          <SettingsPanel />
          <SchedulesList />
        </Flex>
      </Flex>
  );
}
