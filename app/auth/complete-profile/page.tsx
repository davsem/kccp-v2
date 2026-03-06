"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { safeRedirectPath, validateName, sanitizeAuthError } from "@/lib/utils"

function CompleteProfileForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = safeRedirectPath(searchParams.get("redirectTo") ?? "/")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function prefill() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setEmail(user.email ?? "")
      // Pre-fill from Google user_metadata when available
      const meta = user.user_metadata as Record<string, string> | undefined
      if (meta?.full_name) {
        const parts = meta.full_name.split(" ")
        setFirstName(parts[0] ?? "")
        setLastName(parts.slice(1).join(" "))
      } else {
        setFirstName(meta?.given_name ?? "")
        setLastName(meta?.family_name ?? "")
      }
    }

    void prefill()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("Not authenticated.")
      setLoading(false)
      return
    }

    const validFirst = validateName(firstName)
    const validLast = validateName(lastName)
    if (!validFirst || !validLast) {
      setError("First and last name must be between 1 and 100 characters.")
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      first_name: validFirst,
      last_name: validLast,
      email,
    })

    if (insertError) {
      setError(sanitizeAuthError(insertError.message))
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Complete your profile</h1>
        <p className="text-sm text-muted-foreground">
          We need a few details before you continue.
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            autoComplete="family-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving…" : "Save and continue"}
        </Button>
      </form>
    </div>
  )
}

export default function CompleteProfilePage() {
  return (
    <Suspense>
      <CompleteProfileForm />
    </Suspense>
  )
}
