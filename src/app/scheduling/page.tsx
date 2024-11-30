import {Flex, Heading, Text} from "@radix-ui/themes";
import {ActivityLogIcon} from "@radix-ui/react-icons";

export default function Home() {
  return (
      <Flex height="100%" direction="column" flexGrow="1">
        <Flex id="header" direction="column" gap="4" p="6">
          <Flex align="center" gap="3">
            <ActivityLogIcon id="heading" style={{height: 30, width: 30}}/>
            <Heading id="heading" color="purple">Scheduling</Heading>
          </Flex>
          <Flex direction="column" gap="1">
            <Text id="subtitle" weight="medium">Define weekly schedules and add or remove Shows</Text>
          </Flex>
        </Flex>

        <Flex direction="column" gap="3" p="6">
          <Text>No schedules set up</Text>
        </Flex>
      </Flex>
  );
}
