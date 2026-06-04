"use client";

import Navbar from "@/app/components/Navbar";
import React from "react";
import { useAuth } from "@/auth/AuthContext";
import { DropdownMenu, TabNav } from "@radix-ui/themes";
import Link from "next/link";
import {
  ExitIcon,
  HomeIcon,
  PersonIcon,
  CalendarIcon,
  ResumeIcon,
} from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";
import styles from "./RootNavBar.module.css";

export default function RootNavbar() {
  const path = usePathname();
  const auth = useAuth();

  const links = [
    { href: "/", label: "Home", icon: <HomeIcon style={{ paddingRight: 8 }} /> },
    { href: "/shows", label: "Shows & Podcasts", icon: <ResumeIcon style={{ paddingRight: 8 }} /> },
    { href: "/committee", label: "Committee", icon: <PersonIcon style={{ paddingRight: 8 }} /> },
    { href: "/schedules", label: "Scheduling", icon: <CalendarIcon style={{ paddingRight: 8 }} /> },
    { href: "/logout", label: "Logout", icon: <ExitIcon style={{ paddingRight: 8 }} /> },
  ];

  if (!auth.user) {
    return (
      <Navbar
        justify={"end"}
        links={[
          { href: "/", label: "Home" },
          { href: "/login", label: "Login" },
        ]}
      />
    );
  }

  const isActive = (href: string) =>
    path === href ||
    (path === "/podcasts" && href === "/shows") ||
    (path === "/schedules/new" && href === "/schedules") ||
    ((path.substring(0, path.length - 2) === "/schedules/edit" ||
      path.substring(0, path.length - 3) === "/schedules/edit") &&
      href === "/schedules") ||
    (path === "/calendar" && href === "/schedules") ||
    (path === "/overrides" && href === "/schedules") ||
    (path === "/overrides/new" && href === "/schedules") ||
    ((path.substring(0, path.length - 2) === "/overrides/edit" ||
      path.substring(0, path.length - 3) === "/overrides/edit") &&
      href === "/schedules");

    return (
    <>
      {/* DESKTOP */}
      <div className={styles.desktopNav}>
        <TabNav.Root justify={"end"}>
          {links.map(({ href, label, icon }) => (
            <TabNav.Link key={href} asChild active={isActive(href)}>
              <Link href={href}>
                {icon}
                {label}
              </Link>
            </TabNav.Link>
          ))}
        </TabNav.Root>
      </div>

      {/* MOBILE */}
      <div className={styles.mobileNav}>
        <TabNav.Root justify={"end"}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <TabNav.Link>
                <DropdownMenu.TriggerIcon />
              </TabNav.Link>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content>
              {links.map(({ href, label, icon }, index) => (
                <React.Fragment key={href}>
                  <DropdownMenu.Item asChild>
                    <Link href={href}>
                      {icon}
                      {label}
                    </Link>
                  </DropdownMenu.Item>

                  {index !== links.length - 1 && (
                    <DropdownMenu.Separator />
                  )}
                </React.Fragment>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </TabNav.Root>
      </div>
    </>
  );
}