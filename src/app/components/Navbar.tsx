"use client"

import {usePathname} from "next/navigation";
import {TabNav} from "@radix-ui/themes";
import Link from "next/link";

export default function Navbar({justify, links }: {
  justify: "start" | "center" | "end",
  links: {href: string, label: string}[]
}) {
  const path = usePathname();
  return (
      <TabNav.Root justify={justify}>
        {links.map(({ href, label }) => (
            <TabNav.Link key={href} asChild active={path === href}>
              <Link href={href}>{label}</Link>
            </TabNav.Link>
        ))}
      </TabNav.Root>
  );
}