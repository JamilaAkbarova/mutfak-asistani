'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { RecipeList } from '@/components/recipe-list'
import { Loader2, Refrigerator, Bell, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function TariflerPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [recipeMatches, setRecipeMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pantryCount, setPantryCount] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const { toast } = useToast()

  // 1. Hatırlatıcı Kurma Fonksiyonu
  const handleSetReminder = async () => {
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
      if (!webhookUrl) throw new Error("Webhook URL yapılandırılmamış.")

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_reminder', targetDate: selectedDate }),
      })
      toast({ title: "Başarılı!", description: "Hatırlatıcı kuruldu." })
    } catch (e) {
      toast({ variant: "destructive", title: "Hata", description: "Hatırlatıcı başarısız." })
    }
  }

  // 2. Verileri Çeken Fonksiyon (Senin orijinal kodun)
  useEffect(() => {
    async function loadTarifler() {
      try {
        setLoading(true)
        const { data: { user: u } } = await supabase.auth.getUser()
        setUser(u)

        const savedPantry = localStorage.getItem('kitchen_pantry')
        const pantryItems = savedPantry ? JSON.parse(savedPantry) : []
        setPantryCount(pantryItems.length)

        if (pantryItems.length === 0) { setLoading(false); return; }

        // Supabase'den tarifleri çek... (Senin orijinal kodun buraya gelecek)
        // ... (Veri çekme ve match işlemleri)
        
      } catch (err) {
        console.error("Hata:", err)
      } finally {
        setLoading(false)
      }
    }
    loadTarifler()
  }, [supabase])

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="mx-auto max-w-7xl px-4 py-8">
        
        {/* YENİ: Üstte Hatırlatıcı Paneli */}
        <Card className="mb-8 border-primary/20">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Hatırlatıcı Kur</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-4 items-end">
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-48" />
            <Button onClick={handleSetReminder}>Hatırlatıcıyı Kaydet</Button>
          </CardContent>
        </Card>

        {/* Tarif Listesi (Senin kodun buraya devam etmeli) */}
        {recipeMatches.length > 0 ? (
          <RecipeList recipeMatches={recipeMatches} />
        ) : (
          <div className="text-center py-12"><Refrigerator className="mx-auto h-12 w-12 text-muted-foreground/40" /> <p>Tarif bulunamadı.</p></div>
        )}
      </main>
    </div>
  )
}