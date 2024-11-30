import {Card, Flex, Heading, Text} from "@radix-ui/themes";
import Link from "next/link";
import {ActivityLogIcon, ChatBubbleIcon, DashboardIcon} from "@radix-ui/react-icons";
import "./home.css";
export default function Home() {
  return (
      <Flex height="100%" direction="column" px="6" py="9" flexGrow="1" justify="between">

        <Flex direction="column" gap="5" my="9">
          <Heading id="heading" size="9" weight="medium">Welcome to the Burn Admin panel</Heading>
          <Text as="p" size="4" style={{maxWidth: "500px"}}>
            This panel allows you to manage the content displayed on Burn FM’s website and app.
          </Text>
        </Flex>

        <Flex direction="column" gap="4">
          <Heading size="6" weight="medium">Getting started</Heading>
          <Text style={{maxWidth: "450px"}}>
            There are three main types of content that you can manage as admin. Click on a card below to start:
          </Text>

          <Flex gap="4" wrap="wrap">

            <Card asChild>
              <Link href="/shows">
                <Flex direction="column" align="center" py="2" gap="4" width="140px">
                  <DashboardIcon style={{height: 24, width: 24}}/>
                  <Text size="2" weight="medium">
                    Shows & Podcasts
                  </Text>
                </Flex>
              </Link>
            </Card>

            <Card asChild>
              <Link href="/scheduling">
                <Flex direction="column" align="center" py="2" gap="4" width="140px">
                  <ActivityLogIcon style={{height: 24, width: 24}}/>
                  <Text size="2" weight="medium">
                    Scheduling
                  </Text>
                </Flex>
              </Link>
            </Card>

            <Card asChild>
              <Link href="/posts">
                <Flex direction="column" align="center" py="2" gap="4" width="140px">
                  <ChatBubbleIcon style={{height: 24, width: 24}}/>
                  <Text size="2" weight="medium">
                    Posts
                  </Text>
                </Flex>
              </Link>
            </Card>

          </Flex>
        </Flex>

      </Flex>
  );
}
