'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, Trash2, Search, Package, Loader2 } from 'lucide-react'
import type { Ingredient, UserPantryItem } from '@/lib/types'

const getUnitInfo = (name: string) => {
  if (!name) return { unit: 'Gram', step: 100 };
  const lowerName = name.toLowerCase();
  
  const pieceItems = ['yumurta', 'limon', 'ekmek', 'lavaş', 'yufka', 'milföy', 'pide', 'kedi dili', 'tortilla'];
  const isPiece = pieceItems.some(item => lowerName.includes(item));
  
  return {
    unit: isPiece ? 'Adet' : 'Gram',
    step: isPiece ? 1 : 100
  };
}

export function PantryManager() {
  const supabase = createClient()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [pantryItems, setPantryItems] = useState<UserPantryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        const { data: dbIngredients } = await supabase.from('ingredients').select('*')
        if (dbIngredients) setIngredients(dbIngredients)

        const { data: { user } } = await supabase.auth.getUser()
        const activeUserId = user?.id || 'bc70ad4b-fd57-40e3-a6a1-4a27e3e2beca'
        
        const { data: dbPantry } = await supabase
          .from('user_pantry')
          .select('*')
          .eq('user_id', activeUserId)

        if (dbPantry && dbIngredients) {
          const formatted = dbPantry.map(item => ({
            ...item,
            ingredient: dbIngredients.find(i => i.id === item.ingredient_id)
          })).filter(item => item.ingredient)
          
          setPantryItems(formatted as any)
          localStorage.setItem('kitchen_pantry', JSON.stringify(formatted))
        } else {
          const localSaved = localStorage.getItem('kitchen_pantry')
          if (localSaved) setPantryItems(JSON.parse(localSaved))
        }
      } catch (err) {
        console.error("Veri yükleme hatası:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [supabase])

  const normalizeText = (text: string) => {
    if (!text) return ''
    return text.toLowerCase().replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c').trim()
  }

  const filteredIngredients = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = normalizeText(searchQuery)
    return ingredients
      .filter(ing => normalizeText(ing.name).includes(query) && !pantryItems.some(item => item.ingredient_id === ing.id))
      .slice(0, 6)
  }, [searchQuery, pantryItems, ingredients])

  const addToPantry = async (ingredient: Ingredient) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const activeUserId = user?.id || 'bc70ad4b-fd57-40e3-a6a1-4a27e3e2beca'
      
      const { step } = getUnitInfo(ingredient.name);

      const { data, error } = await supabase
        .from('user_pantry')
        .insert({
          user_id: activeUserId,
          ingredient_id: ingredient.id,
          quantity: step 
        })
        .select('*')
        .single()

      if (!error && data) {
        const newItem = {
          ...data,
          ingredient: ingredient
        }
        const updatedItems = [...pantryItems, newItem as any]
        setPantryItems(updatedItems)
        localStorage.setItem('kitchen_pantry', JSON.stringify(updatedItems))
        setSearchQuery('')
      } else if (error) {
        alert(`Supabase Veritabanı Hatası!\nMesaj: ${error.message}\nKod: ${error.code}`)
      }
    } catch (e) {
      console.error("Fonksiyon içi hata oluştu:", e)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) { removeFromPantry(itemId); return; }
    
    const updated = pantryItems.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item)
    setPantryItems(updated)
    localStorage.setItem('kitchen_pantry', JSON.stringify(updated))
    
    await supabase.from('user_pantry').update({ quantity: newQuantity }).eq('id', itemId)
  }

  const removeFromPantry = async (itemId: string) => {
    const updated = pantryItems.filter(item => item.id !== itemId)
    setPantryItems(updated)
    localStorage.setItem('kitchen_pantry', JSON.stringify(updated))
    
    await supabase.from('user_pantry').delete().eq('id', itemId)
  }

  if (loading) return <div className="flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" /> Supabase veritabanı eşitleniyor...</div>

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> Malzeme Ekle</CardTitle></CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Supabase veritabanından malzeme ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          {filteredIngredients.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredIngredients.map((ingredient) => {
                const { unit } = getUnitInfo(ingredient.name);
                return (
                  <Button key={ingredient.id} variant="outline" className="justify-between cursor-pointer" onClick={() => addToPantry(ingredient)}>
                    <span>{ingredient.name}</span>
                    <Badge variant="secondary" className="ml-2">{unit}</Badge>
                  </Button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Dolabınızdaki Malzemeler <Badge variant="secondary" className="ml-auto">{pantryItems.length} Çeşit</Badge></CardTitle></CardHeader>
        <CardContent>
          {pantryItems.length === 0 ? <p className="text-center text-muted-foreground py-6">Dolabınız boş. Yukarıdan aratarak gerçek zamanlı malzeme ekleyin.</p> : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pantryItems.map((item) => {
                const { unit, step } = getUnitInfo(item.ingredient?.name || '');
                
                return (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border p-3 bg-card">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.ingredient?.name || 'Yükleniyor...'}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity} {unit}</p> 
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity - step)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      
                      <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity + step)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="ghost" size="icon" className="text-destructive ml-1" onClick={() => removeFromPantry(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}