import Link from "next/link"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { NavLinks } from "@/components/nav-links"
import { BasketBadge } from "@/components/basket-badge"
import { AuthStatusServer } from "@/components/auth-status-server"
import { AuthStateListener } from "@/components/auth-state-listener"

export async function Navbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const headersList = await headers()
  const pathname = headersList.get("x-pathname") ?? "/"

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-end px-4 py-3 gap-6">
        <Link href="/" className="font-semibold tracking-tight text-foreground mr-auto">
          Khalsa Community Pitch Project
        </Link>
        <nav className="flex items-center gap-6">
          <NavLinks />
          <BasketBadge />
        </nav>
        <AuthStatusServer user={user} pathname={pathname} />
        <AuthStateListener />
      </div>
    </header>
  )
}
