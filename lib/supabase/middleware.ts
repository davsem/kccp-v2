import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "./database.types"

const PROTECTED_ROUTES = ["/checkout", "/profile"]

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Phase a: Refresh session (always getUser, never getSession)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  // Phase b: Route protection — unauthenticated users can't access protected routes
  if (!user && isProtected) {
    const redirectTo = request.nextUrl.pathname
    const signInUrl = new URL("/auth/sign-in", request.url)
    signInUrl.searchParams.set("redirectTo", redirectTo)
    return NextResponse.redirect(signInUrl)
  }

  // Phase c: Profile check — authenticated users without a profile must complete it
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single()

    if (!profile && pathname !== "/auth/complete-profile") {
      const completeProfileUrl = new URL("/auth/complete-profile", request.url)
      completeProfileUrl.searchParams.set("redirectTo", pathname)
      return NextResponse.redirect(completeProfileUrl)
    }
  }

  return response
}
