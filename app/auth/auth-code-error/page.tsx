import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Authentication Error — Khalsa Community Pitch Project",
}

export default function AuthCodeErrorPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Authentication error</h1>
      <p className="text-sm text-muted-foreground">
        The sign-in link has expired or is invalid. Please try signing in again.
      </p>
      <Button asChild>
        <Link href="/auth/sign-in">Back to sign in</Link>
      </Button>
    </div>
  )
}
