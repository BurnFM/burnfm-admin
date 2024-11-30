import {Flex, Heading, Text} from "@radix-ui/themes";
import {ChatBubbleIcon} from "@radix-ui/react-icons";

export default function Home() {
  return (
      <Flex height="100%" direction="column" flexGrow="1">
        <Flex id="header" direction="column" gap="4" p="6">
          <Flex align="center" gap="3">
           <ChatBubbleIcon id="heading" height={30} width={30}/>
            <Heading id="heading" color="purple">Posts</Heading>
          </Flex>
          <Flex direction="column" gap="1">
            <Text id="subtitle" weight="medium">Create, edit, and delete Posts</Text>
          </Flex>
        </Flex>
        <Flex direction="column" gap="3" p="6">
          <Text>No posts written</Text>
        </Flex>
      </Flex>
  );
}
