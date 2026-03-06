import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckoutContent } from "@/components/checkout-content";
import type { Profile } from "@/lib/types";

export const metadata = {
  title: "Checkout — Khalsa Community Pitch Project",
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/auth/complete-profile");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>
      <CheckoutContent profile={profile as Profile} />
    </div>
  );
}
