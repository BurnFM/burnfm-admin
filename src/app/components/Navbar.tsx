"use client"

import {usePathname} from "next/navigation";
import {DropdownMenu, TabNav} from "@radix-ui/themes";
import Link from "next/link";
import {ExitIcon, HomeIcon} from "@radix-ui/react-icons";

export default function Navbar({justify, links }: {
  justify: "start" | "center" | "end",
  links: {href: string, label: string}[]
}) {
  const path = usePathname();
  return (
      <TabNav.Root justify={justify}>
          {links.map(({ href, label }) => (
              <TabNav.Link key={href} asChild active={path === href || path == "/schedules/new" && href == "/schedules"  || (path.substring(0, path.length - 2) == "/schedules/edit" || path.substring(0, path.length - 3) == "/schedules/edit") && href == "/schedules"}>
                <Link href={href}>{label}</Link>
              </TabNav.Link>
          ))}
      </TabNav.Root>
  );
}