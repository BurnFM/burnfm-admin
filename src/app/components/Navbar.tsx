"use client"

import {usePathname, useSearchParams} from "next/navigation";
import {DropdownMenu, TabNav} from "@radix-ui/themes";
import Link from "next/link";
import {ExitIcon, HomeIcon} from "@radix-ui/react-icons";

export default function Navbar({justify, links }: {
  justify: "start" | "center" | "end",
  links: {href: string, label: string}[]
}) {
  const path = usePathname();
  const searchParams = useSearchParams();

  const isActive = (href: string) => {
      const [hrefPath, hrefQuery] = href.split("?");

      return (
          path === hrefPath &&
          (
              !hrefQuery ||
              [...new URLSearchParams(hrefQuery).entries()].every(
                  ([key, value]) => searchParams.get(key) === value
              )
          )
      ) ||
      path == "/schedules/new" && href == "/schedules" ||
      (
          (
              path.substring(0, path.length - 2) == "/schedules/edit" ||
              path.substring(0, path.length - 3) == "/schedules/edit"
          ) && href == "/schedules"
      );
  };

  return (
      <TabNav.Root justify={justify}>
          {links.map(({ href, label }) => (
              <TabNav.Link key={href} asChild active={isActive(href)}>
                <Link href={href}>{label}</Link>
              </TabNav.Link>
          ))}
      </TabNav.Root>
  );
}