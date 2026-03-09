import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/sign-in?redirectTo=/profile")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single()

  return (
    <ProfileForm
      userId={user.id}
      email={user.email ?? ""}
      firstName={profile?.first_name ?? ""}
      lastName={profile?.last_name ?? ""}
    />
  )
}
