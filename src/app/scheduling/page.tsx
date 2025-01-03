"use client"

import {Box, Container, Flex, Heading, Text} from "@radix-ui/themes";
import {ActivityLogIcon} from "@radix-ui/react-icons";
import SettingsPanel from "@/app/scheduling/components/SettingsPanel/SettingsPanel";
import SchedulesList from "@/app/scheduling/components/SchedulesList/SchedulesList";


export default function SchedulePage() {
  return (
      <Flex height="100%" direction="column" flexGrow="1">
        <Box p="6" style={{backgroundColor: "var(--accent-3)", borderBottom: "1px solid var(--accent-6)"}}>
          <Container size="4">
            <Flex align="center" gap="3" mb="4">
              <ActivityLogIcon style={{color: "var(--accent-11)"}} height={30} width={30}/>
              <Heading id="heading" style={{color: "var(--accent-11)"}}>Scheduling</Heading>
            </Flex>
            <Flex direction="column" gap="1">
              <Text weight="medium" style={{color: "var(--accent-12)"}}>Define weekly schedules and add or remove Shows</Text>
            </Flex>
          </Container>
        </Box>

        <SettingsPanel>
          <SchedulesList />
        </SettingsPanel>
      </Flex>
  );
}
