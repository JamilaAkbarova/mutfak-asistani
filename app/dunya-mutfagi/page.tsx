'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Users, Flame, Globe, Loader2, X, Bell, TurkishLira } from 'lucide-react'

export default function DunyaMutfagiPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  
  // Tarih ve saat seçimleri modal içinde kullanılmak üzere burada tutuluyor
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [selectedTime, setSelectedTime] = useState('18:00')

  useEffect(() => {
    async function loadWorldRecipes() {
      try {
        setLoading(true)
        const { data: { user: u } } = await supabase.auth.getUser()
        setUser(u)

        const { data, error } = await supabase
          .from('recipes')
          .select(`
            *,
            recipe_ingredients (
              amount_g,
              ingredients (name)
            ),
            recipe_steps (
              step_number,
              instruction
            )
          `)
          .not('cuisine_type', 'is', null)

        if (error) throw error
        if (data) setRecipes(data)

      } catch (err) {
        console.error("Dünya Mutfağı çekme hatası:", err)
      } finally {
        setLoading(false)
      }
    }
    loadWorldRecipes()
  }, [supabase])

  // YALNIZCA veritabanına kayıt yapar. n8n arka planda kendisi çalışacak!
  const setReminder = async (recipe: any) => {
    if (!user) { 
      alert("Hatırlatıcı kurmak için giriş yapmalısınız!"); 
      return; 
    }

    try {
      const ingredientsList = recipe.recipe_ingredients.map((ri: any) => ri.ingredients?.name);

      const { error } = await supabase.from('reminders').insert({
        user_id: user.id,
        recipe_name: recipe.name,
        ingredients_needed: ingredientsList,
        reminder_time: `${selectedTime}:00`,
        reminder_date: selectedDate
      });

      if (error) throw error;

      alert(`Harika! ${selectedDate} tarihinde saat ${selectedTime} için hatırlatıcı kuruldu. Zamanı geldiğinde Telegram'dan bildirim alacaksın.`);
      
      // Başarılı olunca detay penceresini otomatik kapatır
      setSelectedRecipe(null);
    } catch (e) {
      console.error(e);
      alert("Hatırlatıcı kurulurken bir hata oluştu.");
    }
  }

  const renderRecipeCards = (cuisineFilter: string) => {
    const filtered = recipes.filter(r => r.cuisine_type === cuisineFilter)

    if (filtered.length === 0) return <p className="text-muted-foreground py-10 text-center">Bu mutfağa ait tarif bulunamadı.</p>

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {filtered.map((recipe) => (
          <Card
            key={recipe.id}
            className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-2 cursor-pointer bg-card"
            onClick={() => setSelectedRecipe(recipe)}
          >
            <div className="relative h-48 w-full bg-muted">
              <img
                src={`https://nkrhmwnjnoxhbcpsvxus.supabase.co/storage/v1/object/public/recipe-images/${recipe.id}.jpeg`}
                alt={recipe.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.endsWith('.jpeg')) {
                    target.src = `https://nkrhmwnjnoxhbcpsvxus.supabase.co/storage/v1/object/public/recipe-images/${recipe.id}.png`;
                  } else {
                    target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=400';
                  }
                }}
              />
              <div className="absolute right-3 top-3"><Badge variant="secondary" className="shadow-md">{recipe.cuisine_type}</Badge></div>
            </div>
            <CardHeader className="p-4 flex-1">
              <CardTitle className="line-clamp-1 text-xl">{recipe.name}</CardTitle>
              <CardDescription className="line-clamp-2 mt-1 text-xs">{recipe.description}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-2 border-t border-b bg-muted/20 grid grid-cols-4 gap-2 text-center text-xs">
              <div className="flex flex-col items-center gap-1.5"><Clock className="h-4 w-4 text-muted-foreground" /><span>{recipe.prep_time} dk</span></div>
              <div className="flex flex-col items-center gap-1.5"><Users className="h-4 w-4 text-muted-foreground" /><span>{recipe.portions} Kişi</span></div>
              <div className="flex flex-col items-center gap-1.5"><Flame className="h-4 w-4 text-orange-500" /><span>{recipe.calories || '580'} kcal</span></div>
              <div className="flex flex-col items-center gap-1.5"><TurkishLira className="h-4 w-4 text-green-600" /><span>{recipe.total_cost?.toFixed(0) || '0'} TL</span></div>
            </CardContent>
            <CardFooter className="p-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">{recipe.recipe_ingredients?.length || 0} Malzeme</span>
              <Button size="sm" className="bg-[#ea580c] hover:bg-[#c2410c] text-white">Tarifi Gör</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (loading) return <div className="flex min-h-screen flex-col items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 border-b pb-5 flex items-center gap-3">
          <Globe className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Dünya Mutfağı</h1>
            <p className="mt-2 text-muted-foreground">Farklı kültürlerin eşsiz lezzetlerini keşfedin.</p>
          </div>
        </div>

        <Tabs defaultValue="Anadolu Mutfağı" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
            <TabsTrigger value="Anadolu Mutfağı">Anadolu</TabsTrigger>
            <TabsTrigger value="Asya Mutfağı">Asya</TabsTrigger>
            <TabsTrigger value="Avrupa Mutfağı">Avrupa</TabsTrigger>
          </TabsList>
          <TabsContent value="Anadolu Mutfağı">{renderRecipeCards("Anadolu Mutfağı")}</TabsContent>
          <TabsContent value="Asya Mutfağı">{renderRecipeCards("Asya Mutfağı")}</TabsContent>
          <TabsContent value="Avrupa Mutfağı">{renderRecipeCards("Avrupa Mutfağı")}</TabsContent>
        </Tabs>

        {selectedRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl bg-card p-6 shadow-2xl border">
              <Button variant="ghost" size="icon" className="absolute right-4 top-4 rounded-full" onClick={() => setSelectedRecipe(null)}><X className="h-5 w-5" /></Button>
              <h2 className="text-2xl font-bold mb-4 pr-8 border-b pb-2">{selectedRecipe.name}</h2>

              <img
                src={`https://nkrhmwnjnoxhbcpsvxus.supabase.co/storage/v1/object/public/recipe-images/${selectedRecipe.id}.jpeg`}
                className="h-64 w-full object-cover rounded-lg mb-6"
                alt={selectedRecipe.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.endsWith('.jpeg')) {
                    target.src = `https://nkrhmwnjnoxhbcpsvxus.supabase.co/storage/v1/object/public/recipe-images/${selectedRecipe.id}.png`;
                  } else {
                    target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=400';
                  }
                }}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold border-b pb-2 mb-3 text-primary">Malzemeler</h3>
                  <ul className="space-y-2 text-sm">
                    {selectedRecipe.recipe_ingredients?.map((ri: any, i: number) => (
                      <li key={i} className="flex justify-between border-b pb-1 text-muted-foreground">
                        <span>• {ri.ingredients?.name}</span>
                        <span>{ri.amount_g} g</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold border-b pb-2 mb-3 text-primary">Hazırlanışı</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    {selectedRecipe.recipe_steps?.sort((a: any, b: any) => a.step_number - b.step_number).map((step: any, i: number) => (
                      <p key={i} className="leading-relaxed"><Badge variant="outline" className="mr-1">Adım {step.step_number}</Badge> {step.instruction}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* İçeriye Taşınan Tarih ve Saat Seçici */}
              <div className="grid grid-cols-2 gap-4 mt-8 bg-muted/30 p-4 rounded-lg border">
                <div>
                  <label className="text-sm font-semibold mb-2 block text-foreground">
                    Tarih Seçin
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-md border p-2 bg-background text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block text-foreground">
                    Saat Seçin
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full rounded-md border p-2 bg-background text-sm"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSelectedRecipe(null)}>Kapat</Button>
                <Button className="bg-primary text-primary-foreground" onClick={() => setReminder(selectedRecipe)}>
                  <Bell className="mr-2 h-4 w-4" /> Planla ve Hatırlatıcı Kur
                </Button>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  )
}