'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { RecipeList } from '@/components/recipe-list'
import { Loader2, Refrigerator, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const getUnitInfo = (name: string) => {
  if (!name) return 'Gram';
  const lowerName = name.toLowerCase();
  const pieceItems = ['yumurta', 'limon', 'ekmek', 'lavaş', 'yufka', 'milföy', 'pide', 'kedi dili', 'tortilla'];
  return pieceItems.some(item => lowerName.includes(item)) ? 'Adet' : 'Gram';
}

export default function TariflerPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [recipeMatches, setRecipeMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pantryCount, setPantryCount] = useState(0)
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const setReminder = async (match: any) => {
    if (!user) { 
      alert("Hatırlatıcı kurmak için giriş yapmalısınız!"); 
      return; 
    }
    
    try {
      const ingredientsList = [...match.availableIngredients, ...match.missingIngredients].map((item: any) => item.ingredient.name);
      
      const { error } = await supabase.from('reminders').insert({
        user_id: user.id,
        recipe_name: match.recipe.name,
        ingredients_needed: ingredientsList,
        reminder_time: '18:00:00'
      });

      if (error) throw error;
    
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipe_name: match.recipe.name,
            ingredients_needed: ingredientsList,
            target_date: selectedDate
          })
        });
      }

      alert(`Harika! ${selectedDate} tarihi için hatırlatıcı kuruldu, Telegram'dan bildirim alacaksın.`);
    } catch (e) {
      console.error(e);
      alert("Hatırlatıcı kurulurken bir hata oluştu.");
    }
  }

  useEffect(() => {
    async function loadTarifler() {
      try {
        setLoading(true)
        const { data: { user: u } } = await supabase.auth.getUser()
        setUser(u)

        const savedPantry = localStorage.getItem('kitchen_pantry')
        const pantryItems = savedPantry ? JSON.parse(savedPantry) : []
        setPantryCount(pantryItems.length)

        if (pantryItems.length === 0) {
          setRecipeMatches([])
          setLoading(false)
          return
        }

        const userPantryMap: Record<string, number> = {}
        pantryItems.forEach((item: any) => {
          const id = item.ingredient?.id || item.ingredient_id
          userPantryMap[id] = item.quantity || 0 
        })

        const { data: recipesData, error } = await supabase
          .from('recipes')
          .select(`
            id,
            name,
            portions,
            total_cost,
            description,
            image_url,
            prep_time,
            calories, 
            recipe_ingredients (
              amount_g,
              calculated_cost,
              ingredients (
                id,
                name
              )
            ),
            recipe_steps (
              step_number,
              instruction
            )
          `)

        if (error) throw error

        if (recipesData && recipesData.length > 0) {
          const matchedRecipes = recipesData.map((recipe: any) => {
            const allReqIngredients = recipe.recipe_ingredients || []

            const availableIngredients: any[] = []
            const missingIngredients: any[] = []
            let missingCost = 0
            let totalRequiredItems = allReqIngredients.length
            let completelyAvailableItems = 0

            allReqIngredients.forEach((ri: any) => {
              const ingId = ri.ingredients?.id
              const reqQty = Number(ri.amount_g || 0) 
              const userQty = Number(userPantryMap[ingId] || 0)
              
              const isAmountSpecified = reqQty > 0;
              const isSufficient = isAmountSpecified ? (userQty >= reqQty) : (userQty > 0);
              const unitLabel = isAmountSpecified ? getUnitInfo(ri.ingredients?.name) : '';

              const formattedIng = {
                ingredient: {
                  name: ri.ingredients?.name || 'Bilinmeyen Malzeme',
                  unit: unitLabel
                }
              }

              if (isSufficient) {
                availableIngredients.push({ 
                  ...formattedIng, 
                  availableQty: isAmountSpecified ? reqQty : 'Göz Kararı (Var)' 
                })
                completelyAvailableItems++
              } else {
                const missingQty = isAmountSpecified ? (reqQty - userQty) : 'Hiç Yok'
                missingIngredients.push({ ...formattedIng, missingQty })

                if (isAmountSpecified) {
                  const costPerGram = Number(ri.calculated_cost || 0) / reqQty
                  missingCost += costPerGram * (reqQty - userQty)
                } else {
                  missingCost += Number(ri.calculated_cost || 0)
                }

                if (userQty > 0 && isAmountSpecified) {
                  availableIngredients.push({ ...formattedIng, availableQty: userQty })
                }
              }
            })

            const matchPercentage = totalRequiredItems > 0
              ? Math.round((completelyAvailableItems / totalRequiredItems) * 100)
              : 0

            let instructions = (recipe.recipe_steps || [])
              .sort((a: any, b: any) => a.step_number - b.step_number)
              .map((step: any) => step.instruction)

            if (instructions.length === 0) {
              instructions = ['Malzemeleri hazırlayın.', 'Tarif adımlarını uygulayarak pişirme işlemini tamamlayın.', 'Sıcak servis edin.']
            }

            return {
              recipe: {
                id: recipe.id,
                name: recipe.name,
                image_url: recipe.image_url || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=400',
                description: recipe.description || 'Mutfak Asistanı veritabanından, dolabınızdaki malzemelere özel olarak listelenmiştir.',
                prepTime: recipe.prep_time || 30,
                servings: recipe.portions || 4,
                calories: recipe.calories || 0, 
                totalCost: recipe.total_cost, // YENİ: MALİYET BURADA EKLENDİ!
                instructions
              },
              matchPercentage,
              availableIngredients,
              missingIngredients,
              estimatedCost: Math.round(missingCost * 100) / 100
            }
          })

          const sortedMatches = matchedRecipes
            .filter((m: any) => m.matchPercentage >= 0) 
            .sort((a: any, b: any) => b.matchPercentage - a.matchPercentage)

          setRecipeMatches(sortedMatches)
        }

      } catch (err) {
        console.error("Supabase Veri Çekme Hatası:", err)
        setRecipeMatches([])
      } finally {
        setLoading(false)
      }
    }

    loadTarifler()
  }, [supabase])

  if (loading) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm font-medium">Mutfak Asistanı veritabanından tarifleriniz hesaplanıyor...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b pb-5">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Akıllı Tarif Önerileri</h1>
          <p className="mt-2 text-lg text-muted-foreground">Evinizdeki malzemelerin gramajlarına göre tam hesaplanmış maliyet ve tarif önerileri.</p>
        </div>

        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Yemek Planlama & Hatırlatıcı Ayarı
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Hangi Gün Pişireceksiniz?</label>
              <Input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48 bg-background"
              />
            </div>
          </CardContent>
        </Card>
        
        {recipeMatches.length > 0 ? (
          <RecipeList recipeMatches={recipeMatches} onSetReminder={setReminder} />
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-card">
            <Refrigerator className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-card-foreground text-lg font-semibold">
              {pantryCount === 0 ? "Dolabınızda henüz malzeme bulunmuyor." : "Veritabanımızda tarif bulunamadı."}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}