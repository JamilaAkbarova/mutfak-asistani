'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChefHat, Loader2 } from 'lucide-react'

// Asıl içeriğin ve mantığın çalıştığı iç bileşen
function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const hasError = searchParams.get('hata')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setError(null)
    setLoading(true)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Email veya şifre hatalı. Lütfen tekrar deneyiniz.')
      setLoading(false)
      return
    }

    // Telegram bildirimi gönder
    try {
      await fetch('http://localhost:5678/webhook-test/login-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          loginTime: new Date().toLocaleString('tr-TR'),
        }),
      })
    } catch (telegramError) {
      console.error(
        'Telegram bildirimi gönderilemedi:',
        telegramError
      )
    }

    router.push('/dolap')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-primary/5 to-transparent">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ChefHat className="h-8 w-8 text-primary" />
          </div>

          <CardTitle className="text-2xl">
            Hoş Geldiniz
          </CardTitle>

          <CardDescription>
            Hesabınıza giriş yapın ve yemek planlamaya başlayın
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {(error || hasError) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error ||
                    'Bir hata oluştu. Lütfen tekrar deneyiniz.'}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Şifre
              </Label>

              <Input
                id="password"
                type="password"
                placeholder="Şifrenizi girin"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giriş Yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Hesabınız yok mu?{' '}
              <Link
                href="/kayıt"
                className="font-medium text-primary hover:underline"
              >
                Kayıt Olun
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

// Suspense ile sarmalanmış ana sayfa bileşeni (Vercel Prerender hatasını çözen kısım)
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}