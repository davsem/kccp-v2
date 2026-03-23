"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const links = [
  { href: "/", label: "Home" },
  { href: "/pitch", label: "The Pitch" },
]

export function NavLinks() {
  const pathname = usePathname()
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {links.map(({ href, label }) => (
          <NavigationMenuItem key={href}>
            <NavigationMenuLink
              asChild
              className={cn(
                navigationMenuTriggerStyle(),
                pathname === href && "bg-accent text-accent-foreground font-medium"
              )}
            >
              <Link href={href}>{label}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
