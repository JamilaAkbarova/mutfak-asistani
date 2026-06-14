'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, ChefHat, Clock, Users, X } from 'lucide-react'
import { useState } from 'react'

export function RecipeList({ recipeMatches, onSetReminder }: { recipeMatches: any[], onSetReminder: (match: any) => void }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {recipeMatches.map((match, index) => (
        <RecipeCard key={index} match={match} onSetReminder={onSetReminder} />
      ))}
    </div>
  )
}

function RecipeCard({ match, onSetReminder }: { match: any, onSetReminder: (match: any) => void }) {
  const [imgError, setImgError] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow bg-card">
        {/* Fotoğraf Alanı */}
        <div className="relative h-48 w-full bg-muted overflow-hidden">
          {!imgError ? (
            <img
              src={match.recipe.image_url}
              alt={match.recipe.name}
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <ChefHat className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-2 text-xl text-card-foreground">{match.recipe.name}</CardTitle>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary shrink-0 ml-2">
              % {match.matchPercentage} Eşleşme
            </span>
          </div>
          <CardDescription className="line-clamp-2 mt-2">
            {match.recipe.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1">
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {match.recipe.prepTime} dk
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {match.recipe.servings} Kişilik
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Eksik Malzemeler:</h4>
            {match.missingIngredients.length > 0 ? (
              <ul className="text-sm text-muted-foreground space-y-1">
                {match.missingIngredients.slice(0, 3).map((item: any, i: number) => (
                  <li key={i}>• {item.ingredient.name}</li>
                ))}
                {match.missingIngredients.length > 3 && (
                  <li className="italic text-xs">+ {match.missingIngredients.length - 3} malzeme daha</li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-green-600 font-medium">Tüm malzemeleriniz tam!</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          {/* ÇALIŞAN BUTON: Basıldığında Modalı Açar */}
          <Button className="w-full" variant="outline" onClick={() => setIsModalOpen(true)}>
            <ChefHat className="mr-2 h-4 w-4" />
            Tarifi Gör
          </Button>
          <Button className="w-full" onClick={() => onSetReminder(match)}>
            <Bell className="mr-2 h-4 w-4" />
            Planla
          </Button>
        </CardFooter>
      </Card>

      {/* DİNAMİK DETAY PENCERESİ (MODAL) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl bg-background p-6 shadow-2xl border text-foreground animate-in fade-in zoom-in-95 duration-150">
            
            {/* Kapatma Butonu */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col gap-5">
              <h2 className="text-2xl font-bold pr-8 border-b pb-2">{match.recipe.name}</h2>
              
              {/* Künye Bilgileri */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground bg-muted/60 p-3 rounded-lg">
                <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-primary" /> <strong>Süre:</strong> {match.recipe.prepTime} dk</div>
                <div className="flex items-center gap-1"><Users className="h-4 w-4 text-primary" /> <strong>Porsiyon:</strong> {match.recipe.servings} Kişilik</div>
                {match.recipe.calories > 0 && (
                  <div className="flex items-center gap-1">🔥 <strong>Kalori:</strong> {match.recipe.calories} kcal</div>
                )}
              </div>

              {/* Gelişmiş Malzeme Bilgisi */}
              <div>
                <h3 className="font-semibold text-base mb-2 text-primary flex items-center gap-1">📋 Tarif Malzemeleri</h3>
                <div className="grid sm:grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg border text-sm">
                  <div>
                    <span className="text-xs font-bold text-green-600 block mb-1.5">✓ Dolabınızda Olanlar:</span>
                    <ul className="space-y-1 text-muted-foreground">
                      {match.availableIngredients.map((item: any, i: number) => (
                        <li key={i}>• {item.ingredient.name} ({item.availableQty} {item.ingredient.unit})</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-600 block mb-1.5">⚠ Eksik Olanlar (Satın Alınmalı):</span>
                    <ul className="space-y-1 text-muted-foreground">
                      {match.missingIngredients.length > 0 ? (
                        match.missingIngredients.map((item: any, i: number) => (
                          <li key={i}>• {item.ingredient.name} ({item.missingQty} {item.ingredient.unit})</li>
                        ))
                      ) : (
                        <li className="text-xs text-green-600 font-medium italic">Eksik malzeme yok, harika!</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Adımlar */}
              <div className="border-t pt-3">
                <h3 className="font-semibold text-base mb-2 text-primary flex items-center gap-1">🍳 Nasıl Yapılır?</h3>
                <ol className="space-y-3 text-sm text-muted-foreground list-decimal pl-4">
                  {match.recipe.instructions.map((step: string, i: number) => (
                    <li key={i} className="leading-relaxed pl-1">{step}</li>
                  ))}
                </ol>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}