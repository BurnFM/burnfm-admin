import {Text, Flex, Heading, Container, Box} from "@radix-ui/themes";
import {CalendarIcon} from "@radix-ui/react-icons";
import Navbar from "@/app/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
      <Flex height="100%" direction="column" flexGrow="1">
        <Box p="6" style={{backgroundColor: "var(--accent-3)", borderBottom: "1px solid var(--accent-6)"}}>
          <Container size="4">
            <Flex align="center" gap="3" mb="4">
              <CalendarIcon style={{color: "var(--accent-11)"}} height={30} width={30}/>
              <Heading id="heading" style={{color: "var(--accent-11)"}}>Scheduling</Heading>
            </Flex>
            <Flex direction="column" gap="1">
              <Text weight="medium" style={{color: "var(--accent-12)"}}>Define weekly schedules and add or remove Shows</Text>
            </Flex>
          </Container>
        </Box>
        <Navbar justify="center" links={[
            {href: "/schedules", label: "Schedules"},
            {href: "/overrides", label: "Overrides"},
            {href: "/calendar", label: "Calendar"}
        ]}/>

        <Container size="4" p="6" style={{paddingTop: "0"}}>
          <Flex direction="column" gap="3">
            {children}
          </Flex>
        </Container>

      </Flex>
  );
}
