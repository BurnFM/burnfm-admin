"use client"

import {Box, Container, Flex, Heading, Text} from "@radix-ui/themes";
import SettingsPanel from "@/app/(scheduling)/schedules/components/SettingsPanel/SettingsPanel";
import SchedulesList from "@/app/(scheduling)/schedules/components/SchedulesList/SchedulesList";


export default function SchedulesPage() {
  return (
      <SettingsPanel>
        <SchedulesList/>
      </SettingsPanel>
  );
}
