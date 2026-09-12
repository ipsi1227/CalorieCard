import { FOOD_DATABASE } from '../data/foodDatabase';
import { FoodDatabaseItem } from '../types';

export interface CalculationResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingGrams: number;
  servingDescription: string;
  confidence: 'exact' | 'high' | 'approximate' | 'macro_calculated';
  matchedFoods: Array<{
    name: string;
    calories: number;
    grams: number;
    category?: string;
  }>;
  explanation: string;
}

// Typical standard gram weights for common units and food types
const STANDARD_SERVING_GRAMS: Record<string, number> = {
  apple: 182,
  banana: 118,
  orange: 131,
  egg: 50,
  roti: 40,
  chapati: 40,
  paratha: 80,
  dosa: 100,
  idli: 40,
  puri: 30,
  samosa: 75,
  biscuit: 15,
  cookie: 25,
  slice: 35, // bread slice or cheese slice
  bowl: 180, // cooked dal, vegetable, rice
  cup: 160,
  katori: 150,
  plate: 300,
  glass: 240,
  tbsp: 15,
  tsp: 5,
  ounce: 28.35,
  oz: 28.35,
  pound: 453.6,
  lb: 453.6,
};

// Word numbers conversion
const WORD_NUMBERS: Record<string, number> = {
  half: 0.5,
  quarter: 0.25,
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

// Natural language portion parser
interface ParsedPortion {
  quantity: number;
  unit: string | null;
  grams: number | null;
  cleanedFoodName: string;
}

export function parseFoodQuery(input: string): ParsedPortion {
  let cleaned = input.toLowerCase().trim();
  let quantity = 1;
  let unit: string | null = null;
  let grams: number | null = null;

  // Check for fractions like 1/2, 3/4, 1/4, 1 1/2
  const mixedFractionMatch = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)\s*/);
  if (mixedFractionMatch) {
    const whole = parseFloat(mixedFractionMatch[1]);
    const num = parseFloat(mixedFractionMatch[2]);
    const den = parseFloat(mixedFractionMatch[3]);
    quantity = whole + (num / den);
    cleaned = cleaned.replace(mixedFractionMatch[0], '').trim();
  } else {
    const fractionMatch = cleaned.match(/^(\d+)\/(\d+)\s*/);
    if (fractionMatch) {
      quantity = parseFloat(fractionMatch[1]) / parseFloat(fractionMatch[2]);
      cleaned = cleaned.replace(fractionMatch[0], '').trim();
    }
  }

  // Check numeric quantity or word numbers at start
  const numberMatch = cleaned.match(/^(\d+(\.\d+)?)\s*/);
  if (numberMatch && !mixedFractionMatch) {
    quantity = parseFloat(numberMatch[1]);
    cleaned = cleaned.replace(numberMatch[0], '').trim();
  } else {
    // Check word number
    const firstWord = cleaned.split(' ')[0];
    if (WORD_NUMBERS[firstWord] !== undefined) {
      quantity = WORD_NUMBERS[firstWord];
      cleaned = cleaned.replace(new RegExp(`^${firstWord}\\s*`), '').trim();
    }
  }

  // Check for "of" (e.g. "2 cups of strawberries" -> "strawberries")
  cleaned = cleaned.replace(/^of\s+/, '').trim();

  // Check units (g, grams, kg, oz, cups, tbsp, tsp, slices, pieces, bowls, etc.)
  const gramMatch = cleaned.match(/^(\d+(\.\d+)?)\s*(g|grams|gram)\b\s*(of)?\s*/);
  if (gramMatch) {
    grams = parseFloat(gramMatch[1]);
    cleaned = cleaned.replace(gramMatch[0], '').trim();
    unit = 'g';
  } else {
    const unitMatch = cleaned.match(/^(cups?|tbsp|tablespoons?|tsp|teaspoons?|slices?|pieces?|pcs?|bowls?|plates?|katoris?|glasses?|kg|kilograms?|oz|ounces?|lbs?|pounds?)\b\s*(of)?\s*/);
    if (unitMatch) {
      unit = unitMatch[1];
      cleaned = cleaned.replace(unitMatch[0], '').trim();
    }
  }

  // Also check if grams appear at the end (e.g. "chicken breast 150g" or "paneer 200 g")
  const trailingGramMatch = cleaned.match(/\b(\d+(\.\d+)?)\s*(g|grams|gram)\b$/);
  if (trailingGramMatch && !grams) {
    grams = parseFloat(trailingGramMatch[1]);
    cleaned = cleaned.replace(trailingGramMatch[0], '').trim();
    unit = 'g';
  }

  return {
    quantity: quantity || 1,
    unit,
    grams,
    cleanedFoodName: cleaned.trim(),
  };
}

// Find closest matches in FOOD_DATABASE
export function findBestFoodMatches(foodName: string): FoodDatabaseItem[] {
  if (!foodName || foodName.length === 0) return [];
  const query = foodName.toLowerCase().trim();
  const queryTokens = query.split(/\s+/).filter(t => t.length > 1);

  const scored = FOOD_DATABASE.map(item => {
    const itemName = item.name.toLowerCase();
    const itemCategory = item.category.toLowerCase();
    const itemRestaurant = (item.restaurant || '').toLowerCase();
    const itemBrand = (item.brand || '').toLowerCase();
    const itemIngredients = (item.ingredients || '').toLowerCase();

    let score = 0;

    // Brand or Restaurant name match boost (e.g. searching 'good day', 'maggi', 'mccain', 'dominos')
    if (itemBrand && (query.includes(itemBrand) || itemBrand.includes(query))) {
      score += 350;
    }
    if (itemRestaurant && (query.includes(itemRestaurant) || itemRestaurant.includes(query))) {
      score += 350;
    }

    // Exact full name match
    if (itemName === query) {
      score += 1000;
    }
    // Starts with query
    else if (itemName.startsWith(query)) {
      score += 500;
    }
    // Contains full query as a whole word
    else if (new RegExp(`\\b${query}\\b`, 'i').test(itemName)) {
      score += 300;
    }
    // Contains substring
    else if (itemName.includes(query)) {
      score += 150;
    }

    // Token matching
    let matchedTokens = 0;
    for (const token of queryTokens) {
      if (itemName.includes(token)) {
        matchedTokens++;
        score += 50;
      } else if (itemBrand.includes(token)) {
        matchedTokens++;
        score += 45;
      } else if (itemRestaurant.includes(token)) {
        matchedTokens++;
        score += 40;
      } else if (itemIngredients.includes(token)) {
        score += 20;
      } else if (itemCategory.includes(token)) {
        score += 10;
      }
    }

    if (queryTokens.length > 0 && matchedTokens === queryTokens.length) {
      score += 80;
    }

    return { item, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.item);
}

// Fallback macro density estimation for unrecognized foods
function getCategoryDensityEstimate(foodName: string): { calPer100g: number; protein: number; carbs: number; fat: number; fiber: number; category: string } {
  const name = foodName.toLowerCase();

  if (name.includes('salad') || name.includes('lettuce') || name.includes('spinach') || name.includes('cucumber') || name.includes('cabbage')) {
    return { calPer100g: 35, protein: 1.5, carbs: 4.5, fat: 0.5, fiber: 2.0, category: 'Vegetables & Salads' };
  }
  if (name.includes('fruit') || name.includes('berry') || name.includes('juice')) {
    return { calPer100g: 58, protein: 0.8, carbs: 14.5, fat: 0.3, fiber: 2.5, category: 'Fresh Fruits' };
  }
  if (name.includes('soup') || name.includes('broth')) {
    return { calPer100g: 50, protein: 2.5, carbs: 6.0, fat: 1.5, fiber: 1.0, category: 'Soups' };
  }
  if (name.includes('cake') || name.includes('pastry') || name.includes('chocolate') || name.includes('ice cream') || name.includes('dessert') || name.includes('donut')) {
    return { calPer100g: 380, protein: 5.0, carbs: 55.0, fat: 16.0, fiber: 1.5, category: 'Dessert / Treat' };
  }
  if (name.includes('chicken') || name.includes('turkey') || name.includes('fish') || name.includes('meat') || name.includes('beef') || name.includes('pork') || name.includes('egg')) {
    return { calPer100g: 175, protein: 22.0, carbs: 1.0, fat: 9.0, fiber: 0, category: 'Lean Meat & Protein' };
  }
  if (name.includes('rice') || name.includes('pasta') || name.includes('noodle') || name.includes('bread') || name.includes('roti') || name.includes('oat')) {
    return { calPer100g: 140, protein: 3.8, carbs: 29.0, fat: 1.2, fiber: 2.0, category: 'Grains & Carbs' };
  }
  if (name.includes('curry') || name.includes('dal') || name.includes('paneer') || name.includes('gravy')) {
    return { calPer100g: 135, protein: 5.5, carbs: 12.0, fat: 7.5, fiber: 3.0, category: 'Curries & Gravies' };
  }
  if (name.includes('oil') || name.includes('butter') || name.includes('ghee')) {
    return { calPer100g: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, category: 'Fats & Oils' };
  }
  if (name.includes('nuts') || name.includes('almond') || name.includes('cashew') || name.includes('peanut')) {
    return { calPer100g: 580, protein: 20.0, carbs: 22.0, fat: 48.0, fiber: 8.0, category: 'Nuts & Seeds' };
  }

  // General balanced mixed meal default
  return { calPer100g: 150, protein: 6.0, carbs: 18.0, fat: 5.5, fiber: 2.0, category: 'Mixed Meal' };
}

/**
 * High-accuracy automatic calorie & nutrient calculation engine
 */
export function calculateCaloriesAccurately(
  foodInput: string,
  servingHint?: string,
  explicitGrams?: number
): CalculationResult {
  if (!foodInput || foodInput.trim() === '') {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      servingGrams: explicitGrams || 100,
      servingDescription: '1 serving',
      confidence: 'approximate',
      matchedFoods: [],
      explanation: 'Please enter a food name or dish to calculate calories.',
    };
  }

  // Check multi-ingredient input: e.g. "2 eggs and 1 slice toast" or "banana with milk"
  const multiDelimiter = /\s+(?:and|with|\+)\s+/i;
  if (multiDelimiter.test(foodInput)) {
    const parts = foodInput.split(multiDelimiter).filter(p => p.trim().length > 0);
    if (parts.length > 1) {
      let totalCals = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let totalFiber = 0;
      let totalGrams = 0;
      const matchedList: Array<{ name: string; calories: number; grams: number; category?: string }> = [];

      for (const part of parts) {
        const subResult = calculateCaloriesAccurately(part);
        totalCals += subResult.calories;
        totalProtein += subResult.protein;
        totalCarbs += subResult.carbs;
        totalFat += subResult.fat;
        totalFiber += subResult.fiber;
        totalGrams += subResult.servingGrams;
        matchedList.push(...subResult.matchedFoods);
      }

      return {
        calories: Math.round(totalCals),
        protein: Math.round(totalProtein * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fat: Math.round(totalFat * 10) / 10,
        fiber: Math.round(totalFiber * 10) / 10,
        servingGrams: Math.round(totalGrams),
        servingDescription: parts.join(' + '),
        confidence: 'high',
        matchedFoods: matchedList,
        explanation: `Calculated from ${parts.length} distinct ingredients with exact portion scaling.`,
      };
    }
  }

  // Parse natural language portion from input or servingHint
  const parsedPortion = parseFoodQuery(foodInput);
  let effectiveFoodName = parsedPortion.cleanedFoodName || foodInput.trim();

  // If servingHint has clues (e.g. "2 pieces" or "200g"), parse it too
  let grams = explicitGrams || parsedPortion.grams;
  let quantity = parsedPortion.quantity;
  let unit = parsedPortion.unit;

  if (servingHint && !grams && !unit) {
    const hintPortion = parseFoodQuery(servingHint);
    if (hintPortion.grams) {
      grams = hintPortion.grams;
    } else if (hintPortion.unit) {
      unit = hintPortion.unit;
      quantity = hintPortion.quantity;
    }
  }

  // Look up in comprehensive database
  const matches = findBestFoodMatches(effectiveFoodName);

  if (matches.length > 0) {
    const bestMatch = matches[0];
    const isExactName = bestMatch.name.toLowerCase() === effectiveFoodName.toLowerCase();

    // Determine weight in grams
    let targetGrams = 100;

    if (grams && grams > 0) {
      targetGrams = grams;
    } else if (unit) {
      const unitKey = unit.toLowerCase().replace(/s$/, '');
      if (unitKey === 'g' || unitKey === 'gram') {
        targetGrams = quantity;
      } else if (unitKey === 'kg' || unitKey === 'kilogram') {
        targetGrams = quantity * 1000;
      } else if (unitKey === 'oz' || unitKey === 'ounce') {
        targetGrams = quantity * 28.35;
      } else if (unitKey === 'lb' || unitKey === 'pound') {
        targetGrams = quantity * 453.6;
      } else if (unitKey === 'piece' || unitKey === 'slice' || unitKey === 'pc') {
        targetGrams = quantity * (bestMatch.servingGrams || 100);
      } else if (STANDARD_SERVING_GRAMS[unitKey]) {
        targetGrams = quantity * STANDARD_SERVING_GRAMS[unitKey];
      } else {
        targetGrams = quantity * (bestMatch.servingGrams || 100);
      }
    } else if (quantity !== 1) {
      targetGrams = quantity * (bestMatch.servingGrams || 100);
    } else {
      // Default to the standard serving of this food item
      targetGrams = bestMatch.servingGrams || 100;
    }

    // Accurate calculation based on reference serving
    const baseGrams = bestMatch.servingGrams || 100;
    const ratio = targetGrams / baseGrams;

    const calculatedCalories = Math.round(bestMatch.calories * ratio);
    const calculatedProtein = Math.round(bestMatch.protein * ratio * 10) / 10;
    const calculatedCarbs = Math.round(bestMatch.carbs * ratio * 10) / 10;
    const calculatedFat = Math.round(bestMatch.fat * ratio * 10) / 10;
    const calculatedFiber = Math.round(bestMatch.fiber * ratio * 10) / 10;

    return {
      calories: calculatedCalories,
      protein: calculatedProtein,
      carbs: calculatedCarbs,
      fat: calculatedFat,
      fiber: calculatedFiber,
      servingGrams: Math.round(targetGrams),
      servingDescription: `${Math.round(targetGrams)}g (${quantity > 1 ? `${quantity}x ` : ''}${bestMatch.servingSize || 'serving'})`,
      confidence: isExactName ? 'exact' : 'high',
      matchedFoods: [
        {
          name: bestMatch.name,
          calories: calculatedCalories,
          grams: Math.round(targetGrams),
          category: bestMatch.category,
        },
      ],
      explanation: isExactName
        ? `Accurately matched "${bestMatch.name}" from USDA/Nutrition dataset (${targetGrams}g).`
        : `Matched closest item "${bestMatch.name}" (${bestMatch.category}) scaled to ${targetGrams}g.`,
    };
  }

  // Fallback: estimate using food category density
  const density = getCategoryDensityEstimate(effectiveFoodName);
  const targetGrams = explicitGrams || grams || 150; // default 150g serving
  const ratio = targetGrams / 100;

  const estimatedCalories = Math.round(density.calPer100g * ratio);
  const estimatedProtein = Math.round(density.protein * ratio * 10) / 10;
  const estimatedCarbs = Math.round(density.carbs * ratio * 10) / 10;
  const estimatedFat = Math.round(density.fat * ratio * 10) / 10;
  const estimatedFiber = Math.round(density.fiber * ratio * 10) / 10;

  return {
    calories: estimatedCalories,
    protein: estimatedProtein,
    carbs: estimatedCarbs,
    fat: estimatedFat,
    fiber: estimatedFiber,
    servingGrams: Math.round(targetGrams),
    servingDescription: `${Math.round(targetGrams)}g portion`,
    confidence: 'approximate',
    matchedFoods: [
      {
        name: foodInput,
        calories: estimatedCalories,
        grams: Math.round(targetGrams),
        category: density.category,
      },
    ],
    explanation: `Estimated based on typical nutritional density for ${density.category} (~${density.calPer100g} kcal/100g). You can adjust macros or grams.`,
  };
}

/**
 * Calculates accurate total calories from macronutrients using the Atwater specific energy system
 * 4 kcal per gram of protein
 * 4 kcal per gram of carbohydrate
 * 9 kcal per gram of fat
 */
export function calculateCaloriesFromMacros(protein: number, carbs: number, fat: number): number {
  const p = Math.max(0, Number(protein) || 0);
  const c = Math.max(0, Number(carbs) || 0);
  const f = Math.max(0, Number(fat) || 0);
  return Math.round((p * 4) + (c * 4) + (f * 9));
}
