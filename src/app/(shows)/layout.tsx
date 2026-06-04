import {Text, Flex, Heading, Container, Box} from "@radix-ui/themes";
import {ResumeIcon} from "@radix-ui/react-icons";
import Navbar from "@/app/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
      <Flex height="100%" direction="column" flexGrow="1">
        <Box>
          <Container size="4" height="100%" p="6" style={{backgroundColor: "var(--accent-3)", borderBottom: "1px solid var(--accent-6)"}}>
            <Flex align="center" gap="3" mb="4">
              <ResumeIcon style={{color: "var(--accent-11)"}} height={30} width={30}/>
              <Heading id="heading" style={{color: "var(--accent-11)"}}>Shows & Podcasts</Heading>
            </Flex>
            <Flex direction="column" gap="1">
              <Text weight="medium" style={{color: "var(--accent-12)"}}>Create, edit, and delete Radio Shows and Podcasts</Text>
            </Flex>
          </Container>
        </Box>
        <Navbar justify="center" links={[
            {href: "/shows", label: "Shows"},
            {href: "/podcasts", label: "Podcasts"}
        ]}/>

        <Container size="4" p="6">
          <Flex direction="column" gap="3">
            {children}
          </Flex>
        </Container>

      </Flex>
  );
}
