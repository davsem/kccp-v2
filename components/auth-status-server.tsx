import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { AuthStatusDropdown } from "@/components/auth-status-dropdown"
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"

interface AuthStatusServerProps {
  user: User | null
  pathname: string
}

export function AuthStatusServer({ user, pathname }: AuthStatusServerProps) {
  if (!user) {
    return (
      <Link
        href={`/auth/sign-in?redirectTo=${encodeURIComponent(pathname)}`}
        className={navigationMenuTriggerStyle()}
      >
        Sign in
      </Link>
    )
  }

  return <AuthStatusDropdown email={user.email ?? ""} />
}
