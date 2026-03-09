import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CompleteProfileForm } from "@/components/complete-profile-form"

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/sign-in")
  }

  const { redirectTo } = await searchParams

  const meta = user.user_metadata as Record<string, string> | undefined
  let givenName = ""
  let familyName = ""
  if (meta?.full_name) {
    const parts = meta.full_name.split(" ")
    givenName = parts[0] ?? ""
    familyName = parts.slice(1).join(" ")
  } else {
    givenName = meta?.given_name ?? ""
    familyName = meta?.family_name ?? ""
  }

  return (
    <CompleteProfileForm
      email={user.email ?? ""}
      givenName={givenName}
      familyName={familyName}
      redirectTo={redirectTo ?? "/"}
    />
  )
}
