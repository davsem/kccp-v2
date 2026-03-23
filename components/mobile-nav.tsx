"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BasketBadge } from "@/components/basket-badge"
import { cn } from "@/lib/utils"
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"

const links = [
  { href: "/", label: "Home" },
  { href: "/pitch", label: "The Pitch" },
]

interface MobileNavProps {
  userEmail: string | null
  pathname: string
}

export function MobileNav({ userEmail, pathname }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const currentPath = usePathname()

  return (
    <div className="flex items-center gap-3 md:hidden">
      <BasketBadge />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64 pt-10">
          <nav className="flex flex-col gap-4">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  navigationMenuTriggerStyle(),
                  "w-full justify-start",
                  currentPath === href && "bg-accent text-accent-foreground font-medium"
                )}
              >
                {label}
              </Link>
            ))}
            <div className="border-t pt-4">
              {userEmail ? (
                <>
                  <p className={cn(
                    navigationMenuTriggerStyle(),
                    "w-full justify-start text-muted-foreground pointer-events-none"
                  )}>{userEmail}</p>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "w-full justify-start",
                      currentPath === "/profile" && "bg-accent text-accent-foreground font-medium"
                    )}
                  >
                    Profile
                  </Link>
                  <form action="/auth/sign-out" method="POST">
                    <button
                      type="submit"
                      onClick={() => setOpen(false)}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "w-full justify-start"
                      )}
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href={`/auth/sign-in?redirectTo=${encodeURIComponent(pathname)}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "w-full justify-start"
                  )}
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
