export interface Ingredient {
  id: string
  name: string
  unit: string
  price_per_unit: number
  created_at: string
}

export interface UserPantryItem {
  id: string
  user_id: string
  ingredient_id: string
  quantity: number
  created_at: string
  updated_at: string
  ingredient?: Ingredient
}

export interface Recipe {
  id: string
  name: string
  description: string | null
  instructions: string | null
  prep_time: number
  cook_time: number
  servings: number
  calories: number
  image_url: string | null
  created_at: string
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  ingredient_id: string
  quantity: number
  ingredient?: Ingredient
}

export interface RecipeWithIngredients extends Recipe {
  recipe_ingredients: RecipeIngredient[]
}

export interface RecipeMatch {
  recipe: RecipeWithIngredients
  matchPercentage: number
  availableIngredients: { ingredient: Ingredient; requiredQty: number; availableQty: number }[]
  missingIngredients: { ingredient: Ingredient; requiredQty: number }[]
  estimatedCost: number
}
