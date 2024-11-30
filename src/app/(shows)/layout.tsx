import {Text, Flex, Heading} from "@radix-ui/themes";
import {DashboardIcon} from "@radix-ui/react-icons";
import "./shows.css";
import Navbar from "@/app/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
      <Flex height="100%" direction="column" flexGrow="1">
        <Flex id="header" direction="column" gap="4" p="6">
          <Flex align="center" gap="3">
            <DashboardIcon id="heading" style={{height: 30, width: 30}}/>
            <Heading id="heading" color="purple">Shows & Podcasts</Heading>
          </Flex>
          <Flex direction="column" gap="1">
            <Text id="subtitle" weight="medium">Create, edit, and delete Radio Shows and Podcasts</Text>
            <Text id="subtitle" weight="medium">Manage each Radio Show’s recordings</Text>
          </Flex>
        </Flex>
        <Navbar justify="center" links={[
            {href: "/shows", label: "Shows"},
            {href: "/podcasts", label: "Podcasts"}
        ]}/>

        <Flex direction="column" gap="3" p="6">
          {children}
        </Flex>
      </Flex>
  );
}
