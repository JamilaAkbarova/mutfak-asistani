'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Clock, Users, Flame, Check, X, ShoppingCart } from 'lucide-react'
import type { RecipeWithIngredients, UserPantryItem, Ingredient } from '@/lib/types'

interface RecipeDetailProps {
  recipe: RecipeWithIngredients
  pantryItems: UserPantryItem[]
}

interface IngredientStatus {
  ingredient: Ingredient
  requiredQty: number
  availableQty: number
  isAvailable: boolean
  isPartial: boolean
}

export function RecipeDetail({ recipe, pantryItems }: RecipeDetailProps) {
  const pantryMap = new Map(
    pantryItems.map(item => [item.ingredient_id, item])
  )

  const ingredientStatuses: IngredientStatus[] = recipe.recipe_ingredients.map(ri => {
    const pantryItem = pantryMap.get(ri.ingredient_id)
    const availableQty = pantryItem?.quantity || 0
    const isAvailable = availableQty >= ri.quantity
    const isPartial = availableQty > 0 && availableQty < ri.quantity

    return {
      ingredient: ri.ingredient!,
      requiredQty: ri.quantity,
      availableQty,
      isAvailable,
      isPartial
    }
  })

  const availableCount = ingredientStatuses.filter(s => s.isAvailable).length
  const matchPercentage = Math.round((availableCount / ingredientStatuses.length) * 100)

  const missingIngredients = ingredientStatuses.filter(s => !s.isAvailable)
  const estimatedCost = missingIngredients.reduce((total, s) => {
    const neededQty = s.requiredQty - s.availableQty
    return total + (neededQty * Number(s.ingredient.price_per_unit))
  }, 0)

  const instructions = recipe.instructions?.split(/\d+\.\s+/).filter(Boolean) || []

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link href="/tarifler">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Tariflere Dön
        </Button>
      </Link>

      {/* Recipe Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{recipe.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{recipe.description}</p>
          </div>
          <Badge 
            variant={matchPercentage >= 80 ? 'default' : matchPercentage >= 50 ? 'secondary' : 'outline'}
            className={`text-lg px-4 py-2 ${matchPercentage >= 80 ? 'bg-accent text-accent-foreground' : ''}`}
          >
            %{matchPercentage} Esleme
          </Badge>
        </div>

        {/* Recipe Stats */}
        <div className="mt-6 flex flex-wrap gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-5 w-5" />
            <div>
              <p className="text-sm">Hazırlama</p>
              <p className="font-medium text-foreground">{recipe.prep_time} dk</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-5 w-5" />
            <div>
              <p className="text-sm">Pişirme</p>
              <p className="font-medium text-foreground">{recipe.cook_time} dk</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <div>
              <p className="text-sm">Porsiyon</p>
              <p className="font-medium text-foreground">{recipe.servings} kişi</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flame className="h-5 w-5" />
            <div>
              <p className="text-sm">Kalori</p>
              <p className="font-medium text-foreground">{recipe.calories} kcal</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Ingredients */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Malzemeler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ingredientStatuses.map((status, index) => (
              <div
                key={index}
                className={`flex items-center justify-between rounded-lg p-3 ${
                  status.isAvailable
                    ? 'bg-accent/10'
                    : status.isPartial
                    ? 'bg-chart-4/10'
                    : 'bg-destructive/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {status.isAvailable ? (
                    <Check className="h-5 w-5 text-accent" />
                  ) : (
                    <X className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    <p className="font-medium">{status.ingredient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {status.requiredQty} {status.ingredient.unit}
                      {status.isPartial && (
                        <span className="ml-1 text-chart-4">
                          (mevcut: {status.availableQty})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Yapılış</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {instructions.map((instruction, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-foreground">{instruction.trim()}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Cost Summary */}
      {missingIngredients.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {missingIngredients.length} eksik malzeme
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bu tarifi yapmak icin almaniz gerekenler
                  </p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-sm text-muted-foreground">Tahmini Maliyet</p>
                <p className="text-3xl font-bold text-primary">
                  {estimatedCost.toFixed(2)} TL
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Eksik Malzemeler:</p>
              <div className="flex flex-wrap gap-2">
                {missingIngredients.map((status, index) => {
                  const neededQty = status.requiredQty - status.availableQty
                  const cost = neededQty * Number(status.ingredient.price_per_unit)
                  return (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {status.ingredient.name} ({neededQty} {status.ingredient.unit}) - {cost.toFixed(2)} TL
                    </Badge>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {missingIngredients.length === 0 && (
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="py-8 text-center">
            <Check className="mx-auto h-12 w-12 text-accent" />
            <p className="mt-4 text-xl font-medium text-foreground">
              Tum malzemeler mevcut!
            </p>
            <p className="mt-2 text-muted-foreground">
              Bu tarifi hemen yapmaya başlayabilirsiniz.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
