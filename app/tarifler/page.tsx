'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, ChefHat, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast' 

export default function RecipesPage() {
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const { toast } = useToast()

  const handleSetReminder = async () => {
    setLoading(true)
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
      if (!webhookUrl) throw new Error("Webhook URL eksik.")

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_reminder',
          message: 'Yemek saati yaklaşıyor!',
          targetDate: selectedDate,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error('Bildirim gönderilemedi.')

      toast({
        title: "Başarılı!",
        description: `${selectedDate} tarihi için hatırlatıcı kuruldu.`,
      })
    } catch (error) {
      toast({ variant: "destructive", title: "Hata", description: "İşlem başarısız." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Tariflerim</h1>

      {/* Hatırlatıcı Paneli */}
      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Hatırlatıcı Kur
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tarih</label>
            <Input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
            />
          </div>
          <Button onClick={handleSetReminder} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Kur'}
          </Button>
        </CardContent>
      </Card>

      {/* TARİFLER BURADA LİSTELENECEK */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Tariflerin olduğu kartların buraya gelmesi lazım */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" />
              Örnek Tarif 1
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Tarif detayları ve içerik bilgileri burada yer alacak.</p>
          </CardContent>
        </Card>
        
        {/* Tariflerini fetch ettiğin/listelediğin eski kod bloğunu buraya koyabilirsin */}
      </div>
    </div>
  )
}