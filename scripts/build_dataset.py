import csv
import json
import re

# We will read dataset.csv and convert each record into FoodDatabaseItem format
def get_category(food_name, fat, carbs, protein, calories):
    name_lower = food_name.lower()
    
    # Fruits
    fruits = ['apple', 'banana', 'orange', 'grape', 'berry', 'berries', 'melon', 'watermelon', 'cantaloupe', 
              'peach', 'pear', 'plum', 'kiwi', 'mango', 'papaya', 'pineapple', 'guava', 'fig', 'figs',
              'cherry', 'cherries', 'apricot', 'nectarine', 'pomegranate', 'tangerine', 'lemon', 'lime', 
              'raisin', 'prune', 'currant', 'grapefruit', 'persimmon', 'date', 'coconut', 'avocado',
              'plantain', 'lychee', 'longan', 'jackfruit', 'starfruit', 'rose hips', 'durian', 'chayote']
    if any(f in name_lower for f in fruits) and 'candy' not in name_lower and 'cookie' not in name_lower and 'pie' not in name_lower and 'cake' not in name_lower:
        return 'Fruits', ['breakfast', 'snacks']
        
    # Vegetables & Greens
    veg = ['spinach', 'kale', 'broccoli', 'cauliflower', 'cabbage', 'carrot', 'potato', 'tomato', 'onion',
           'pepper', 'lettuce', 'cucumber', 'zucchini', 'eggplant', 'brinjal', 'squash', 'pumpkin', 'celery',
           'mushroom', 'radish', 'asparagus', 'beet', 'leek', 'shallot', 'turnip', 'okra', 'bhindi', 'gourd',
           'artichoke', 'garlic', 'seaweed', 'sprout', 'sprouts', 'chard', 'collard', 'parsley', 'coriander', 
           'cilantro', 'ginger', 'lotus root', 'yam', 'taro', 'cassava', 'bamboo shoot']
    if any(v in name_lower for v in veg) and 'soup' not in name_lower and 'pie' not in name_lower and 'chips' not in name_lower and 'fries' not in name_lower:
        return 'Vegetables', ['lunch', 'dinner', 'snacks']

    # Dairy, Yogurt, Eggs, Cheese
    dairy = ['yogurt', 'yoghurt', 'milk', 'cheese', 'cottage cheese', 'curd', 'lassi', 'paneer', 'egg', 'omelet', 'omelette']
    if any(d in name_lower for d in dairy) and 'pie' not in name_lower and 'cake' not in name_lower:
        return 'Dairy & Eggs', ['breakfast', 'lunch', 'dinner', 'snacks']

    # Poultry, Meat, Fish, Seafood
    meats = ['chicken', 'turkey', 'beef', 'pork', 'lamb', 'mutton', 'veal', 'fish', 'salmon', 'tuna', 'cod', 
             'trout', 'halibut', 'shrimp', 'crab', 'lobster', 'clam', 'oyster', 'prawn', 'steak', 'sausage', 
             'bacon', 'ham', 'duck', 'goose', 'kebab', 'tandoori']
    if any(m in name_lower for m in meats) and 'soup' not in name_lower:
        return 'Meat & Seafood', ['lunch', 'dinner']

    # Legumes & Pulses, Dal
    legumes = ['dal', 'lentil', 'lentils', 'bean', 'beans', 'chickpea', 'chickpeas', 'channa', 'edamame', 
               'soybean', 'tofu', 'tempeh', 'rajmah', 'pea', 'peas', 'hummus', 'dhal']
    if any(l in name_lower for l in legumes) and 'soup' not in name_lower:
        return 'Legumes & Pulses', ['lunch', 'dinner']

    # Grains, Cereals, Bread, Rice, Pasta
    grains = ['rice', 'bread', 'roti', 'chapati', 'paratha', 'naan', 'dosa', 'idli', 'pulao', 'biryani', 
              'oats', 'oatmeal', 'quinoa', 'wheat', 'cereal', 'pasta', 'spaghetti', 'macaroni', 'noodle', 
              'noodles', 'bagel', 'tortilla', 'poha', 'upma', 'khichdi', 'khichri', 'muffin', 'waffle', 'pancake']
    if any(g in name_lower for g in grains):
        return 'Grains & Breads', ['breakfast', 'lunch', 'dinner']

    # Soups & Broths
    if 'soup' in name_lower or 'broth' in name_lower or 'stock' in name_lower or 'rasam' in name_lower or 'shorba' in name_lower:
        return 'Soups & Broths', ['lunch', 'dinner']

    # Nuts & Seeds, Oils
    if any(n in name_lower for n in ['nut', 'nuts', 'almond', 'walnut', 'cashew', 'peanut', 'seed', 'seeds', 'oil', 'butter', 'tahini', 'pistachio', 'flax']):
        return 'Nuts & Seeds', ['snacks']

    # Treats, Sweets, Desserts, Fast Food, Cheat Meals
    if any(s in name_lower for s in ['burger', 'pizza', 'fries', 'cake', 'cookie', 'cookies', 'pie', 'ice cream', 'halwa', 'kheer', 'ladoo', 'burfi', 'donut', 'chocolate', 'candy', 'samosa', 'pakora', 'gulab jamun', 'pastry', 'pudding']):
        return 'Treats & Sweets', ['cheat_meal', 'snacks']

    return 'Prepared Dishes', ['lunch', 'dinner']

def parse_csv(csv_path, output_json):
    items = []
    seen = set()
    with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader, None)
        for i, row in enumerate(reader):
            if not row or len(row) < 12:
                continue
            try:
                # header:
                # 0: Vitamin C
                # 1: Vitamin B11
                # 2: Sodium
                # 3: Calcium
                # 4: Carbohydrates
                # 5: food
                # 6: Iron
                # 7: Calories
                # 8: Sugars
                # 9: Dietary Fiber
                # 10: Fat
                # 11: Protein
                # 12: food_normalized (if present)
                vit_c = float(row[0].strip() or 0)
                sodium = float(row[2].strip() or 0)
                calcium = float(row[3].strip() or 0)
                carbs = float(row[4].strip() or 0)
                food_name = row[5].strip()
                iron = float(row[6].strip() or 0)
                calories = float(row[7].strip() or 0)
                fiber = float(row[9].strip() or 0)
                fat = float(row[10].strip() or 0)
                protein = float(row[11].strip() or 0)

                # Clean name: title case, remove redundant quotes
                cleaned_name = food_name.strip('"\'')
                # capitalize nicely
                display_name = ' '.join(word.capitalize() if not word.startswith('(') else '(' + word[1:].capitalize() for word in cleaned_name.split())
                
                # Deduplicate by lower name
                key = display_name.lower()
                if key in seen:
                    continue
                seen.add(key)

                category, default_tags = get_category(display_name, fat, carbs, protein, calories)
                is_cheat = 'cheat_meal' in default_tags or calories >= 350 or any(c in key for c in ['pizza', 'burger', 'fries', 'donut', 'cake', 'ice cream', 'cookie', 'samosa', 'halwa', 'pastry'])
                
                tags = list(default_tags)
                if is_cheat and 'cheat_meal' not in tags:
                    tags.append('cheat_meal')

                item = {
                    "id": f"CSV{1000 + i}",
                    "name": display_name,
                    "category": category,
                    "servingSize": "100g",
                    "servingGrams": 100,
                    "calories": round(calories),
                    "protein": round(protein, 1),
                    "carbs": round(carbs, 1),
                    "fat": round(fat, 1),
                    "fiber": round(fiber, 1),
                    "vitamins": {
                        "vitaminC": round(vit_c, 2) if vit_c > 0 else None,
                        "calcium": round(calcium, 1) if calcium > 0 else None,
                        "iron": round(iron, 2) if iron > 0 else None,
                        "sodium": round(sodium, 1) if sodium > 0 else None
                    },
                    "mealTags": tags,
                    "isCheatMeal": is_cheat
                }
                items.append(item)
            except Exception as e:
                continue

    with open(output_json, 'w', encoding='utf-8') as out:
        json.dump(items, out, indent=2)

    print(f"Successfully processed {len(items)} items to {output_json}")

if __name__ == '__main__':
    parse_csv('dataset.csv', 'src/data/csvFoodDatabase.json')
