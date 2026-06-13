import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { PantryManager } from '@/components/pantry-manager'
import type { Ingredient, UserPantryItem } from '@/lib/types'

export default async function DolapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Sistemdeki tüm genel malzemeleri isim sırasına göre getiriyoruz
  const { data: ingredients } = await supabase
    .from('ingredients')
    .select('*')
    .order('name')

  // 2. Kullanıcının dolabında var olan malzemeleri alt detaylarıyla (Foreign Key) çekiyoruz
  const { data: pantryItems } = await supabase
    .from('user_pantry')
    .select(`
      *,
      ingredient:ingredients(*)
    `)
    .eq('user_id', user?.id)

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b pb-5">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Mutfak Dolabım</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Evinizdeki taze malzemeleri buradan yönetebilirsiniz. Eklediğiniz her malzeme, n8n robotu üzerinden canlı yemek tariflerini tetikleyecektir.
          </p>
        </div>
        
        {/* Güvenli veri dönüşümleriyle birlikte manager bileşenini çağırıyoruz */}
        <PantryManager 
          ingredients={(ingredients as Ingredient[]) || []}
          initialPantryItems={(pantryItems as UserPantryItem[]) || []}
          userId={user?.id || ''}
        />
      </main>
    </div>
  )
}