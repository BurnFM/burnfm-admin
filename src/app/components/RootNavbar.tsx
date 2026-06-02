"use client"
import Navbar from "@/app/components/Navbar";
import React from "react";
import {useAuth} from "@/auth/AuthContext";
import {DropdownMenu, TabNav} from "@radix-ui/themes";
import Link from "next/link";
import {ExitIcon, HomeIcon} from "@radix-ui/react-icons";
import {usePathname} from "next/navigation";

export default function RootNavbar() {
  const path = usePathname();

  const auth = useAuth();
  if (! auth.user) return (
      <Navbar justify={"end"} links={[
        {href: '/', label: 'Home'},
        {href: '/login', label: 'Login'},
      ]}/>
  );

  const links = [
        {href: '/', label: 'Home'},
        {href: '/shows', label: 'Shows & Podcasts'},
        {href: '/committee', label: 'Committee'},
        {href: '/schedules', label: 'Scheduling'},
  ]

  return (
      <>
        <TabNav.Root justify={"end"}>
          {links.map(({ href, label }) => (
              <TabNav.Link key={href} asChild active={path === href || path == "/podcasts" && href == "/shows" || path == "/schedules/new" && href == "/schedules" || (path.substring(0, path.length - 2) == "/schedules/edit" || path.substring(0, path.length - 3) == "/schedules/edit") && href == "/schedules" || path == "/calendar" && href == "/schedules" || path == "/overrides" && href == "/schedules" || path == "/overrides/new" && href == "/schedules" || (path.substring(0, path.length - 2) == "/overrides/edit" || path.substring(0, path.length - 3) == "/overrides/edit") && href == "/schedules"}>
                <Link href={href}>{label}</Link>
              </TabNav.Link>
          ))}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <TabNav.Link key={""}>
                <DropdownMenu.TriggerIcon />
              </TabNav.Link>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item asChild>
                <Link href={"/"}>
                  <HomeIcon /> Home
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item asChild>
                <Link href={"/logout"}>
                  <ExitIcon /> Log out
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </TabNav.Root>
      </>
  );
}