'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, ChefHat, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast' // Toast kullanıyorsan import et

export default function RecipesPage() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSetReminder = async () => {
    setLoading(true)
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
      
      if (!webhookUrl) {
        throw new Error("Webhook URL yapılandırılmamış.")
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'set_reminder',
          message: 'Yemek saati yaklaşıyor! Tariflerinizi kontrol etmeyi unutmayın.',
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error('Bildirim gönderilemedi.')

      toast({
        title: "Başarılı!",
        description: "Hatırlatıcı başarıyla Telegram'a gönderildi.",
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Hatırlatıcı kurulurken bir sorun oluştu.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tarifleriniz</h1>
        <Button 
          onClick={handleSetReminder} 
          disabled={loading}
          variant="secondary"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Bell className="mr-2 h-4 w-4" />
          )}
          Hatırlatıcı Kur
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Buraya tarif listeleme bileşenlerini ekleyebilirsin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" />
              Örnek Tarif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Dolabınızdaki malzemelerle yapabileceğiniz harika bir başlangıç tarifi.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}