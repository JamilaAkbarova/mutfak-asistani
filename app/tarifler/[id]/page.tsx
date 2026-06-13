import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { RecipeDetail } from '@/components/recipe-detail'
import { notFound } from 'next/navigation'
import type { RecipeWithIngredients, UserPantryItem } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Tarifi malzemeleriyle birlikte getir
  const { data: recipe } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients(
        *,
        ingredient:ingredients(*)
      )
    `)
    .eq('id', id)
    .single()

  if (!recipe) {
    notFound()
  }

  // Kullanicinin dolap icerigini getir
  const { data: pantryItems } = await supabase
    .from('user_pantry')
    .select(`
      *,
      ingredient:ingredients(*)
    `)
    .eq('user_id', user?.id)

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <RecipeDetail 
          recipe={recipe as RecipeWithIngredients}
          pantryItems={(pantryItems as UserPantryItem[]) || []}
        />
      </main>
    </div>
  )
}
