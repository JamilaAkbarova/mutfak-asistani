import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

const supabase = createServerClient(
  'https://nkrhmwnjnoxhbcpsvxus.supabase.co', // Gerçek Supabase URL'niz
  'sb_publishable_CtVm8CvDjD5FxgkEGiFUZg_J0SkUhTx',      // Gerçek Anon/Public Key'iniz
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Korunmus sayfalara erisim kontrolu
  if (
    (request.nextUrl.pathname.startsWith('/dolap') ||
      request.nextUrl.pathname.startsWith('/tarifler')) &&
    !user
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/giris'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
