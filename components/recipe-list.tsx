'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, ChefHat, Clock, Users } from 'lucide-react'
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

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      
      {/* FOTOĞRAF ALANI - BURASI EKSİKSİZ ÇALIŞACAK */}
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
          <CardTitle className="line-clamp-2 text-xl">{match.recipe.name}</CardTitle>
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
        <Button className="w-full" variant="outline">
          <ChefHat className="mr-2 h-4 w-4" />
          Tarifi Gör
        </Button>
        <Button className="w-full" onClick={() => onSetReminder(match)}>
          <Bell className="mr-2 h-4 w-4" />
          Planla
        </Button>
      </CardFooter>
    </Card>
  )
}