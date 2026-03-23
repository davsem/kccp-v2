"use client"

import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

interface AuthStatusDropdownProps {
  email: string
}

export function AuthStatusDropdown({ email }: AuthStatusDropdownProps) {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>{email}</NavigationMenuTrigger>
          <NavigationMenuContent className="right-0 left-auto">
            <NavigationMenuLink asChild>
              <Link href="/profile">Profile</Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <form action="/auth/sign-out" method="POST">
                <button type="submit" className="w-full text-left">
                  Sign out
                </button>
              </form>
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
