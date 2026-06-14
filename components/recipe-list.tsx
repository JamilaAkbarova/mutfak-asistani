'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Bell, ChefHat, Clock, Flame, Users, X } from 'lucide-react'
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
  const [imgIndex, setImgIndex] = useState(0) // Sırayı takip etmek için state
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Denenecek alternatif resim listesi sıralaması (.jpg -> .jpeg -> .png)
  const imageUrls = [
    match.recipe.image_url,      
    match.recipe.image_url_jpeg, 
    match.recipe.image_url_png   
  ].filter(Boolean)

  // Eğer bir uzantı hata verirse sonrakine geçiren akıllı fonksiyon
  const handleImageError = () => {
    if (imgIndex < imageUrls.length - 1) {
      setImgIndex(prev => prev + 1)
    } else {
      setImgError(true)
    }
  }

  // Toplam malzeme sayısını hesapla
  const totalIngredients = match.availableIngredients.length + match.missingIngredients.length;

  return (
    <>
      <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow bg-card border-border rounded-xl">
        
        {/* Fotoğraf ve Eşleşme Yüzdesi Alanı */}
        <div className="relative h-56 w-full bg-muted">
          {!imgError && imageUrls.length > 0 ? (
            <img
              src={imageUrls[imgIndex]}
              alt={match.recipe.name}
              className="h-full w-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <ChefHat className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Eşleşme Oranı Rozeti */}
          <div className="absolute top-3 right-3 bg-background/95 backdrop-blur-sm px-3 py-1 rounded-md shadow-sm text-xs font-semibold text-foreground">
            % {match.matchPercentage} Eşleşme
          </div>
        </div>

        {/* Başlık ve Açıklama */}
        <div className="p-5">
          <h3 className="font-bold text-xl line-clamp-1 text-foreground">{match.recipe.name}</h3>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {match.recipe.description}
          </p>
        </div>

        {/* Ortadaki İstatistik Çizgisi (Süre, Kişi, Kalori) */}
        <div className="grid grid-cols-3 border-y border-border py-4 text-center text-muted-foreground text-sm">
          <div className="flex flex-col items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{match.recipe.prepTime} dk</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{match.recipe.servings} Kişi</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-orange-500">
            <Flame className="h-4 w-4" />
            <span className="text-muted-foreground">{match.recipe.calories > 0 ? match.recipe.calories : '580'} kcal</span>
          </div>
        </div>

        {/* En Alt Kısım (Malzeme Sayısı ve Turuncu Buton) */}
        <div className="p-4 flex items-center justify-between mt-auto">
          <span className="text-sm text-muted-foreground font-medium">{totalIngredients} Malzeme</span>
          <Button 
            className="bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-lg px-6 font-semibold transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            Tarifi Gör
          </Button>
        </div>
      </Card>

      {/* DİNAMİK DETAY PENCERESİ (MODAL) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl bg-background p-6 shadow-2xl border text-foreground animate-in fade-in zoom-in-95 duration-150">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col gap-5">
              <h2 className="text-2xl font-bold pr-8 border-b pb-2">{match.recipe.name}</h2>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground bg-muted/60 p-3 rounded-lg">
                <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-primary" /> <strong>Süre:</strong> {match.recipe.prepTime} dk</div>
                <div className="flex items-center gap-1"><Users className="h-4 w-4 text-primary" /> <strong>Porsiyon:</strong> {match.recipe.servings} Kişilik</div>
                {match.recipe.calories > 0 && (
                  <div className="flex items-center gap-1"><Flame className="h-4 w-4 text-primary" /> <strong>Kalori:</strong> {match.recipe.calories} kcal</div>
                )}
              </div>

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

              <div className="border-t pt-3">
                <h3 className="font-semibold text-base mb-2 text-primary flex items-center gap-1">🍳 Nasıl Yapılır?</h3>
                <ol className="space-y-3 text-sm text-muted-foreground list-decimal pl-4">
                  {match.recipe.instructions.map((step: string, i: number) => (
                    <li key={i} className="leading-relaxed pl-1">{step}</li>
                  ))}
                </ol>
              </div>
              
              {/* Hatırlatıcı (Planla) Butonu */}
              <div className="mt-4 flex justify-end gap-3 border-t pt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Kapat</Button>
                <Button className="bg-primary text-primary-foreground" onClick={() => {
                  onSetReminder(match)
                  setIsModalOpen(false)
                }}>
                  <Bell className="mr-2 h-4 w-4" />
                  Hatırlatıcı Kur (Planla)
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}