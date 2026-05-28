"use client"
import {Box, Button, Card, Container, Flex, Heading, Text} from "@radix-ui/themes";
import Link from "next/link";
import {ActivityLogIcon, ChatBubbleIcon, DashboardIcon} from "@radix-ui/react-icons";
import "./home.css";
import {useAuth} from "@/auth/AuthContext";

export default function Home() {
  const auth = useAuth();
  return (
      <Container size="4">
        <Flex height="100%" direction="column" px="6" py="9" flexGrow="1" justify="between" align="center">

          <Flex direction="column" gap="5" my="9">
            <Heading id="heading" size="9" weight="medium">Welcome to the Burn Admin panel</Heading>
            <Text as="p" size="4" style={{maxWidth: "500px"}}>
              This panel allows you to manage the content displayed on Burn FM’s website and app.
            </Text>
          </Flex>

          { ! auth.user ? (
              <Box maxWidth="400px">
                <Card variant="surface">
                  <Flex direction="column" gap="4" p="2" maxWidth="400">
                    <Heading size="6" weight="medium">Log in to get started</Heading>
                    <Text style={{maxWidth: "450px"}}>
                      You will need to be permitted admin access to use this site.
                    </Text>
                    <Box asChild>
                      <Button variant="soft" asChild>
                        <Link href={"/login"}>Log in</Link>
                      </Button>
                    </Box>
                  </Flex>
                </Card>
              </Box>
          ) : (
            <Flex direction="column" gap="4">
              <Heading size="6" weight="medium">Getting started</Heading>
              <Text style={{maxWidth: "450px"}}>
                There are three main types of content that you can manage as admin. Click on a card below to start:
              </Text>

              <Flex gap="4" wrap="wrap">

                <Card variant="classic" asChild>
                  <Link href="/shows">
                    <Flex direction="column" align="center" py="2" gap="4" width="140px">
                      <DashboardIcon style={{height: 24, width: 24}}/>
                      <Text size="2" weight="medium">
                        Shows & Podcasts
                      </Text>
                    </Flex>
                  </Link>
                </Card>

                <Card variant="classic" asChild>
                  <Link href="/schedules">
                    <Flex direction="column" align="center" py="2" gap="4" width="140px">
                      <ActivityLogIcon style={{height: 24, width: 24}}/>
                      <Text size="2" weight="medium">
                        Scheduling
                      </Text>
                    </Flex>
                  </Link>
                </Card>

              </Flex>
            </Flex>
          ) }



        </Flex>
      </Container>
  );
}
