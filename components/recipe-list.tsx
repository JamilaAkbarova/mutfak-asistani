'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, Flame, CheckCircle, AlertTriangle, X, Bell } from 'lucide-react'

interface RecipeListProps {
  recipeMatches: any[]
  onSetReminder?: (match: any) => void
}

export function RecipeList({ recipeMatches, onSetReminder }: RecipeListProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recipeMatches.map((match, index) => (
          <Card 
            key={match.recipe.id || index} 
            className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/40 cursor-pointer"
            onClick={() => setSelectedRecipe(match)}
          >
            <div className="relative h-48 w-full bg-muted">
              {/* AKILLI GÖRSEL ARAMA EKLENDİ */}
              <img 
                src={`https://nkrhmwnjnoxhbcpsvxus.supabase.co/storage/v1/object/public/recipe-images/${match.recipe.id}.jpeg`} 
                alt={match.recipe.name} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.endsWith('.jpeg')) {
                    target.src = `https://nkrhmwnjnoxhbcpsvxus.supabase.co/storage/v1/object/public/recipe-images/${match.recipe.id}.png`;
                  } else {
                    target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=400';
                  }
                }}
              />
              <div className="absolute right-3 top-3">
                <Badge variant={match.matchPercentage === 100 ? "default" : match.matchPercentage > 50 ? "secondary" : "outline"} className="text-sm font-bold shadow-md bg-background/90 backdrop-blur-sm">
                  %{match.matchPercentage} Uyumlu
                </Badge>
              </div>
            </div>

            <CardHeader className="p-4 flex-1">
              <CardTitle className="line-clamp-1 text-xl">{match.recipe.name}</CardTitle>
              <CardDescription className="line-clamp-2 mt-1 text-xs">
                {match.recipe.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 py-2 border-t border-b bg-muted/20 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="flex flex-col items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{match.recipe.prepTime} dk</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{match.recipe.servings} Kişilik</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span>{match.recipe.calories} kcal</span>
              </div>
            </CardContent>

            <CardFooter className="p-4 flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="text-muted-foreground font-medium">Eksik: **{match.missingIngredients.length}** Çeşit</span>
                {match.missingIngredients.length > 0 && match.estimatedCost > 0 && (
                  <span className="text-amber-600 font-semibold mt-0.5">+{match.estimatedCost.toFixed(2)} TL Maliyet</span>
                )}
              </div>
              <Button size="sm" variant="outline" className="text-xs">Tarifi Gör</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-card-foreground">
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4 rounded-full bg-background/50 backdrop-blur-md hover:bg-background/80"
              onClick={(e) => { e.stopPropagation(); setSelectedRecipe(null); }}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="text-xs">%{selectedRecipe.matchPercentage} Tam Uyumlu Malzeme</Badge>
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {selectedRecipe.recipe.prepTime} Dakika
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{selectedRecipe.recipe.name}</h2>
              
              <div className="h-64 w-full rounded-lg overflow-hidden bg-muted">
                {/* AKILLI GÖRSEL ARAMA EKLENDİ */}
                <img 
                  src={`https://nkrhmwnjnoxhbcpsvxus.supabase.co/storage/v1/object/public/recipe-images/${selectedRecipe.recipe.id}.jpeg`} 
                  alt={selectedRecipe.recipe.name} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src.endsWith('.jpeg')) {
                      target.src = `https://nkrhmwnjnoxhbcpsvxus.supabase.co/storage/v1/object/public/recipe-images/${selectedRecipe.recipe.id}.png`;
                    } else {
                      target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=400';
                    }
                  }}
                />
              </div>

              <hr />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-emerald-600">
                    <CheckCircle className="h-4 w-4" /> Dolapta Yeterli Olanlar
                  </h3>
                  <div className="divide-y rounded-lg border bg-emerald-500/5 px-3 py-1">
                    {selectedRecipe.availableIngredients.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-3 text-center">Eşleşen miktar bulunamadı.</p>
                    ) : (
                      selectedRecipe.availableIngredients.map((ing: any, i: number) => (
                        <div key={i} className="flex justify-between py-2 text-xs">
                          <span className="font-medium text-emerald-700">{ing.ingredient.name}</span>
                          <span className="text-muted-foreground font-semibold">
                            {ing.availableQty} {ing.ingredient.unit}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" /> Eksik Malzemeler
                    </h3>
                    {selectedRecipe.estimatedCost > 0 && (
                      <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">
                        Maliyet: {selectedRecipe.estimatedCost.toFixed(2)} TL
                      </Badge>
                    )}
                  </div>
                  <div className="divide-y rounded-lg border bg-amber-500/5 px-3 py-1">
                    {selectedRecipe.missingIngredients.length === 0 ? (
                      <p className="text-xs text-emerald-600 font-medium py-3 text-center">Tüm malzemeler tam!</p>
                    ) : (
                      selectedRecipe.missingIngredients.map((ing: any, i: number) => (
                        <div key={i} className="flex justify-between py-2 text-xs">
                          <span className="font-medium text-amber-700">{ing.ingredient.name}</span>
                          <span className="text-muted-foreground font-semibold">
                            {ing.missingQty} {ing.ingredient.unit}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <hr />

              <div className="space-y-3">
                <h3 className="text-md font-bold text-foreground">Hazırlanışı</h3>
                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  {selectedRecipe.recipe.instructions.map((step: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start">
                      <Badge variant="outline" className="shrink-0 mt-0.5 border-primary/20 text-primary">Adım {i + 1}</Badge>
                      <p>{step}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end border-t pt-4">
              {onSetReminder && (
                <Button 
                  className="w-full sm:w-auto" 
                  onClick={() => {
                    onSetReminder(selectedRecipe)
                    setSelectedRecipe(null) 
                  }}
                >
                  <Bell className="mr-2 h-4 w-4" /> Bu Akşam İçin Hatırlatıcı Kur
                </Button>
              )}
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setSelectedRecipe(null)}>
                Kapat
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}