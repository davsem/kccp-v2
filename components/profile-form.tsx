"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { validateName, sanitizeAuthError } from "@/lib/utils"

interface ProfileFormProps {
  userId: string
  email: string
  firstName: string
  lastName: string
}

export function ProfileForm({ userId, email, firstName, lastName }: ProfileFormProps) {
  const router = useRouter()

  const [firstNameValue, setFirstName] = useState(firstName)
  const [lastNameValue, setLastName] = useState(lastName)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const validFirst = validateName(firstNameValue)
    const validLast = validateName(lastNameValue)
    if (!validFirst || !validLast) {
      setError("First and last name must be between 1 and 100 characters.")
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ first_name: validFirst, last_name: validLast })
      .eq("id", userId)

    if (updateError) {
      setError(sanitizeAuthError(updateError.message))
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Update your name details below.
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            readOnly
            disabled
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="First name"
            value={firstNameValue}
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
            value={lastNameValue}
            onChange={(e) => setLastName(e.target.value)}
            required
            autoComplete="family-name"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-600">Profile updated.</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  )
}
