import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChefHat, Package, Sparkles, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-20 sm:py-32">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Mutfağınızda Ne Var?
              <br />
              <span className="text-primary">Biz Tarif Bulalım!</span>
            </h1>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Evinizdeki malzemeleri girin, size en uygun tarifleri önerelim. 
              Eksik malzemeleri görün ve tahmini maliyeti hesaplayın.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {user ? (
                <>
                  <Link href="/dolap">
                    <Button size="lg" className="w-full sm:w-auto">
                      <Package className="mr-2 h-5 w-5" />
                      Dolabımı Yönet
                    </Button>
                  </Link>
                  <Link href="/tarifler">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      <ChefHat className="mr-2 h-5 w-5" />
                      Tarifleri Gör
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {/* BURASI DÜZELTİLDİ: /kayıt -> /kayit */}
                  <Link href="/kayit">
                    <Button size="lg" className="w-full sm:w-auto">
                      Hemen Başla
                    </Button>
                  </Link>
                  {/* BURASI DÜZELTİLDİ: /giriş -> /giris */}
                  <Link href="/giris">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Giriş Yap
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-3xl font-bold text-foreground sm:text-4xl">
              Nasıl Çalışır?
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-2 border-transparent transition-colors hover:border-primary/20">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Dolabınızı Doldurun</CardTitle>
                  <CardDescription>
                    Evinizdeki malzemeleri ve miktarlarını sisteme girin.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Kolay arama ve hızlı ekleme özellikleriyle dolabınızı saniyeler içinde güncelleyin.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-transparent transition-colors hover:border-primary/20">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>Tarif Önerileri Alın</CardTitle>
                  <CardDescription>
                    Malzemelerinize göre en uygun tarifleri keşfedin.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Sistem, dolabınızdaki malzemelere göre en çok eşleşenlerden başlayarak tarifler önerir.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-transparent transition-colors hover:border-primary/20 sm:col-span-2 lg:col-span-1">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                    <TrendingUp className="h-6 w-6 text-chart-2" />
                  </div>
                  <CardTitle>Maliyet Hesaplayın</CardTitle>
                  <CardDescription>
                    Eksik malzemelerin tahmini maliyetini görün.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Her tarif için gerekli ek malzemeleri ve tahmini alışveriş tutarını anında öğrenin.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="px-4 py-16">
            <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center sm:p-12">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Hemen Ücretsiz Kayıt Olun
              </h2>
              <p className="mt-4 text-muted-foreground">
                Mutfak asistanını kullanmak tamamen ücretsiz. Kayıt olun ve hemen başlayın!
              </p>
              <Link href="/kayit" className="mt-8 inline-block">
                <Button size="lg">Kayıt Ol</Button>
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          <p>Mutfak Asistanı - Akıllı Yemek Planlama Uygulaması</p>
        </div>
      </footer>
    </div>
  )
}