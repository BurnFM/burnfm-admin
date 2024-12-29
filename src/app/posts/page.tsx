import {Flex, Heading, Text} from "@radix-ui/themes";
import {ChatBubbleIcon, DashboardIcon} from "@radix-ui/react-icons";

export default function Home() {
  return (
      <Flex height="100%" direction="column" flexGrow="1">
        <Flex direction="column" gap="4" p="6" style={{
          backgroundColor: "var(--accent-3)",
          borderBottom: "1px solid var(--accent-6)"
        }}>
          <Flex align="center" gap="3">
            <ChatBubbleIcon style={{color: "var(--accent-11)"}} height={30} width={31}/>
            <Heading color="purple">Posts</Heading>
          </Flex>
          <Flex direction="column" gap="1">
            <Text weight="medium" style={{color: "var(--accent-12)"}}>Create, edit, and delete Posts</Text>
          </Flex>
        </Flex>

        <Flex direction="column" gap="3" p="6">
          <Text>No posts written</Text>
        </Flex>
      </Flex>
  );
}
