import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { AuthStatusDropdown } from "@/components/auth-status-dropdown"

interface AuthStatusServerProps {
  user: User | null
  pathname: string
}

export function AuthStatusServer({ user, pathname }: AuthStatusServerProps) {
  if (!user) {
    return (
      <Link
        href={`/auth/sign-in?redirectTo=${encodeURIComponent(pathname)}`}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Sign in
      </Link>
    )
  }

  return <AuthStatusDropdown email={user.email ?? ""} />
}
