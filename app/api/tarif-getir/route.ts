import { NextResponse } from 'next/server'

const ingredientTranslationMap: { [key: string]: string } = {
  'patates': 'potato',
  'lor peyniri': 'cheese',
  'ayran': 'yogurt',
  'pirinc': 'rice',
  'pirinç': 'rice',
  'makarna': 'pasta',
  'kefir': 'milk',
  'yumurta': 'egg',
  'labne': 'cream cheese',
  'krema': 'cream',
  'soğan': 'onion',
  'sogan': 'onion',
  'domates': 'tomato',
  'tavuk': 'chicken',
  'yoğurt': 'yogurt',
  'yogurt': 'yogurt',
  'sarımsak': 'garlic',
  'sarimsak': 'garlic',
  'süt': 'milk',
  'sut': 'milk',
  'zeytinyağı': 'olive oil',
  'zeytinyagi': 'olive oil',
  'sıvı yağ': 'oil',
  'sivi yag': 'oil',
  'nohut': 'chickpeas',
'mercimek': 'lentils',

'patlican': 'eggplant',
'patlıcan': 'eggplant',

'tereyagi': 'butter',
'tereyağı': 'butter',

'tavuk gogusu': 'chicken breast',
'tavuk göğsü': 'chicken breast',

'biber': 'pepper',

'kiyma': 'ground beef',
'kıyma': 'ground beef',

'havuc': 'carrot',
'havuç': 'carrot',

'bulgur': 'bulgur'
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { malzemeler } = body

    console.log('Gelen malzemeler:', malzemeler)

    if (!malzemeler) {
      return NextResponse.json([])
    }

    const englishIngredients = malzemeler
      .split(',')
      .map((m: string) => {
        const temiz = m.toLowerCase().trim()
        return ingredientTranslationMap[temiz] || temiz
      })
      .filter(Boolean)
      .join(',')

    console.log('İngilizce malzemeler:', englishIngredients)

    const SPOONACULAR_API_KEY =
      process.env.SPOONACULAR_API_KEY ||
      'c4f0f8f0d30c40b8803f264ad57da037'

    const url =
    `https://api.spoonacular.com/recipes/complexSearch` +
    `?includeIngredients=${encodeURIComponent(englishIngredients)}` +
    `&fillIngredients=true` +
    `&addRecipeInformation=true` +
    `&addRecipeNutrition=true` +
    `&instructionsRequired=true` +
    `&sort=max-used-ingredients` +
    `&number=100` +
    `&apiKey=${SPOONACULAR_API_KEY}`

    console.log('Sorgu URL:', url)

    const apiResponse = await fetch(url, {
      method: 'GET',
      cache: 'no-store'
    })

    console.log('HTTP Status:', apiResponse.status)

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text()

      console.error('Spoonacular Hatası:')
      console.error(errorText)

      return NextResponse.json([])
    }

    const data = await apiResponse.json()

    console.log('Spoonacular cevabı:')
    console.log(JSON.stringify(data.results?.[0], null, 2))

    console.log(
      'Bulunan tarif sayısı:',
      data.results?.length || 0
    )

    return NextResponse.json(data.results || [])
  } catch (error) {
    console.error('Route Hatası:', error)

    return NextResponse.json([])
  }
}