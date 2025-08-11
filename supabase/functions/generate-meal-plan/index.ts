import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MEALIE_BASE_URL = (Deno.env.get("MEALIE_BASE_URL") || "").replace(/\/$/, "");
const MEALIE_API_TOKEN = Deno.env.get("MEALIE_API_TOKEN") || "";

interface Preferences {
  userId?: string;
  days?: number; // default 7
  meals?: string[]; // ["breakfast","lunch","snack","dinner","supper"]
  calories?: number;
  protein?: number;
  diet?: string; // keto, veg, etc
  allergies?: string[];
  dislikes?: string[];
  likes?: string[]; // preferências do usuário
  preferredTags?: string[]; // tags desejadas (ex.: brazilian, salad)
  maxPrepMinutes?: number;
  budget?: "low" | "medium" | "high";
}

interface MealieRecipe {
  id?: string | number;
  slug?: string;
  name?: string;
  image?: string;
  tags?: Array<{ id?: string | number; name: string }>;
  recipeYield?: number | string;
  totalTime?: number; // minutes
  recipeIngredient?: string[];
  nutrition?: {
    calories?: number | string;
    proteinContent?: number | string;
    carbohydrateContent?: number | string;
    fatContent?: number | string;
    fiberContent?: number | string;
    sodiumContent?: number | string;
  };
}

async function mealieFetch(path: string): Promise<any> {
  if (!MEALIE_BASE_URL || !MEALIE_API_TOKEN) return null;
  const url = `${MEALIE_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${MEALIE_API_TOKEN}` },
  });
  if (!res.ok) {
    console.warn("Mealie API error", res.status, await res.text());
    return null;
  }
  return res.json();
}

function hasTags(recipe: MealieRecipe, required: string[]): boolean {
  if (!required || required.length === 0) return true;
  const names = (recipe.tags || []).map((t) => t.name?.toLowerCase());
  return required.every((r) => names.includes(r.toLowerCase()));
}

function matchesDiet(recipe: MealieRecipe, diet?: string): boolean {
  if (!diet) return true;
  const names = (recipe.tags || []).map((t) => t.name?.toLowerCase());
  return names.includes(diet.toLowerCase());
}

function matchesAllergies(recipe: MealieRecipe, allergies?: string[]): boolean {
  if (!allergies || allergies.length === 0) return true;
  const ing = (recipe.recipeIngredient || []).join(" ").toLowerCase();
  return !allergies.some((a) => ing.includes(a.toLowerCase()));
}

function matchesDislikes(recipe: MealieRecipe, dislikes?: string[]): boolean {
  if (!dislikes || dislikes.length === 0) return true;
  const ing = (recipe.recipeIngredient || []).join(" ").toLowerCase();
  return !dislikes.some((d) => ing.includes(d.toLowerCase()));
}

function scoreRecipe(recipe: MealieRecipe, prefs: Preferences): number {
  let score = 0;
  const n = recipe.nutrition || {};
  const calories = Number(n.calories) || 0;
  const protein = Number(n.proteinContent) || 0;
  if (prefs.calories) {
    const diff = Math.abs(calories - prefs.calories / (prefs.meals?.length || 4));
    score -= diff * 0.01;
  }
  if (prefs.protein) {
    const targetProtein = prefs.protein / (prefs.meals?.length || 4);
    score -= Math.abs(protein - targetProtein) * 0.1;
  }
  if (typeof recipe.totalTime === "number" && prefs.maxPrepMinutes) {
    if (recipe.totalTime <= prefs.maxPrepMinutes) score += 0.2;
    else score -= 0.2;
  }
  // Boost por likes (ingredientes)
  if (prefs.likes && prefs.likes.length > 0) {
    const ing = (recipe.recipeIngredient || []).join(" ").toLowerCase();
    const hits = prefs.likes.filter((l) => ing.includes(l.toLowerCase())).length;
    score += hits * 0.15;
  }
  // Boost por preferredTags (tags do Mealie)
  if (prefs.preferredTags && prefs.preferredTags.length > 0) {
    const names = (recipe.tags || []).map((t) => t.name?.toLowerCase());
    const hits = prefs.preferredTags.filter((t) => names.includes(t.toLowerCase())).length;
    score += hits * 0.2;
  }
  return score;
}

function recipeKey(r: MealieRecipe): string {
  return String(r.slug || r.id || r.name);
}

function pickForMeal(
  pool: MealieRecipe[],
  mealTag: string,
  prefs: Preferences,
  usedByMeal: Map<string, Set<string>>,
  lastPicked?: string
): MealieRecipe | null {
  const usedIds = usedByMeal.get(mealTag) || new Set<string>();

  const base = pool
    .filter((r) => hasTags(r, [mealTag]))
    .filter((r) => matchesDiet(r, prefs.diet))
    .filter((r) => matchesAllergies(r, prefs.allergies))
    .filter((r) => matchesDislikes(r, prefs.dislikes));

  // Primeiro, tentar itens não usados recentemente
  let candidates = base.filter((r) => !usedIds.has(recipeKey(r)));

  // Se esgotou, permitir reutilização (evitar só repetir o mesmo do dia anterior)
  if (candidates.length === 0) {
    candidates = base.filter((r) => recipeKey(r) !== (lastPicked || ''));
  }
  if (candidates.length === 0) candidates = base; // último recurso

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => scoreRecipe(b, prefs) - scoreRecipe(a, prefs));
  const chosen = candidates[0];

  // Marcar como usado para este tipo de refeição
  const set = usedByMeal.get(mealTag) || new Set<string>();
  set.add(recipeKey(chosen));
  usedByMeal.set(mealTag, set);

  return chosen;
}

function toMacros(recipe: MealieRecipe) {
  const n = recipe.nutrition || {};
  const calories = Number(n.calories) || 0;
  const protein = Number(n.proteinContent) || 0;
  const carbs = Number(n.carbohydrateContent) || 0;
  const fat = Number(n.fatContent) || 0;
  return { calories, protein, carbs, fat };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const prefs: Preferences = await req.json();
    const days = Math.min(Math.max(prefs.days || 7, 1), 14);
    const meals = (prefs.meals && prefs.meals.length > 0)
      ? prefs.meals
      : ["breakfast", "lunch", "snack", "dinner", "supper"]; // 5 refeições padrão

    let recipes: MealieRecipe[] = [];

    if (MEALIE_BASE_URL && MEALIE_API_TOKEN) {
      try {
        const page1 = await mealieFetch("/api/recipes");
        if (Array.isArray(page1?.items)) recipes = page1.items as MealieRecipe[];
        else if (Array.isArray(page1)) recipes = page1 as MealieRecipe[];
      } catch (e) {
        console.warn("Mealie indisponível, usando fallback:", e);
        recipes = [];
      }
    }

    // Fallback simples local (se não houver Mealie)
    if (recipes.length === 0) {
      recipes = [
        // Breakfast (3)
        { name: "Omelete de Legumes", tags: [{ name: "breakfast" }], nutrition: { calories: 280, proteinContent: 20, carbohydrateContent: 8, fatContent: 18 }, recipeIngredient: ["ovos", "cenoura", "abobrinha", "azeite"] },
        { name: "Tapioca com Queijo e Tomate", tags: [{ name: "breakfast" }], nutrition: { calories: 320, proteinContent: 14, carbohydrateContent: 46, fatContent: 10 }, recipeIngredient: ["goma de tapioca", "queijo minas", "tomate", "orégano"] },
        { name: "Aveia com Banana e Pasta de Amendoim", tags: [{ name: "breakfast" }], nutrition: { calories: 350, proteinContent: 12, carbohydrateContent: 55, fatContent: 12 }, recipeIngredient: ["aveia", "banana", "pasta de amendoim", "leite"] },

        // Lunch (3)
        { name: "Frango com Quinoa e Brócolis", tags: [{ name: "lunch" }], nutrition: { calories: 520, proteinContent: 38, carbohydrateContent: 45, fatContent: 18 }, recipeIngredient: ["peito de frango", "quinoa", "brócolis", "azeite"] },
        { name: "Arroz Integral, Feijão e Bife", tags: [{ name: "lunch" }], nutrition: { calories: 640, proteinContent: 36, carbohydrateContent: 70, fatContent: 20 }, recipeIngredient: ["arroz integral", "feijão", "bife", "salada"] },
        { name: "Tilápia Grelhada com Purê de Batata Doce", tags: [{ name: "lunch" }], nutrition: { calories: 560, proteinContent: 40, carbohydrateContent: 48, fatContent: 18 }, recipeIngredient: ["tilápia", "batata doce", "manteiga", "salada"] },

        // Snack (3)
        { name: "Iogurte com Frutas Vermelhas e Granola", tags: [{ name: "snack" }], nutrition: { calories: 220, proteinContent: 14, carbohydrateContent: 28, fatContent: 6 }, recipeIngredient: ["iogurte natural", "frutas vermelhas", "granola"] },
        { name: "Mix de Castanhas e Frutas Secas", tags: [{ name: "snack" }], nutrition: { calories: 250, proteinContent: 7, carbohydrateContent: 18, fatContent: 18 }, recipeIngredient: ["castanhas", "amêndoas", "uvas-passas"] },
        { name: "Sanduíche Natural de Atum", tags: [{ name: "snack" }], nutrition: { calories: 300, proteinContent: 20, carbohydrateContent: 36, fatContent: 8 }, recipeIngredient: ["pão integral", "atum", "iogurte", "alface"] },

        // Dinner (3)
        { name: "Salmão Assado e Batata Doce", tags: [{ name: "dinner" }], nutrition: { calories: 600, proteinContent: 40, carbohydrateContent: 50, fatContent: 22 }, recipeIngredient: ["salmão", "batata doce", "salada"] },
        { name: "Sopa de Legumes com Carne", tags: [{ name: "dinner" }], nutrition: { calories: 420, proteinContent: 28, carbohydrateContent: 40, fatContent: 12 }, recipeIngredient: ["patinho", "cenoura", "abóbora", "mandioca"] },
        { name: "Frango ao Curry com Arroz Integral", tags: [{ name: "dinner" }], nutrition: { calories: 580, proteinContent: 36, carbohydrateContent: 60, fatContent: 16 }, recipeIngredient: ["frango", "curry", "arroz integral", "pimentão"] },

        // Supper (3)
        { name: "Chá de Camomila e Oleaginosas", tags: [{ name: "supper" }], nutrition: { calories: 150, proteinContent: 5, carbohydrateContent: 8, fatContent: 10 }, recipeIngredient: ["chá de camomila", "castanhas"] },
        { name: "Kefir com Canela", tags: [{ name: "supper" }], nutrition: { calories: 120, proteinContent: 9, carbohydrateContent: 10, fatContent: 5 }, recipeIngredient: ["kefir", "canela"] },
        { name: "Leite Vegetal com Cacau e Banana", tags: [{ name: "supper" }], nutrition: { calories: 180, proteinContent: 6, carbohydrateContent: 28, fatContent: 6 }, recipeIngredient: ["leite vegetal", "cacau", "banana"] },
      ];
    }

    const usedByMeal = new Map<string, Set<string>>();
    const plan: any[] = [];

    for (let d = 0; d < days; d++) {
      const day: Record<string, any> = { day: d + 1, meals: {} };
      for (const meal of meals) {
        const prev = d > 0 ? plan[d - 1].meals?.[meal]?.slug || plan[d - 1].meals?.[meal]?.title : undefined;
        const r = pickForMeal(recipes, meal, prefs, usedByMeal, prev);
        if (r) {
          day.meals[meal] = {
            title: r.name,
            slug: r.slug,
            image: r.image || null,
            macros: toMacros(r),
            ingredients: r.recipeIngredient || [],
            tags: (r.tags || []).map(t=>t.name),
          };
        } else {
          day.meals[meal] = null;
        }
      }
      plan.push(day);
    }

    // Shopping list agregada
    const shoppingMap = new Map<string, number>();
    for (const day of plan) {
      for (const meal of Object.values(day.meals)) {
        if (meal && Array.isArray(meal.ingredients)) {
          for (const ing of meal.ingredients) {
            const key = String(ing).toLowerCase();
            shoppingMap.set(key, (shoppingMap.get(key) || 0) + 1);
          }
        }
      }
    }
    const shoppingList = Array.from(shoppingMap.entries()).map(([item, qty]) => ({ item, qty }));

    return new Response(
      JSON.stringify({ plan, shoppingList }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-meal-plan error", e);
    return new Response(
      JSON.stringify({ error: String(e?.message || e), plan: [], shoppingList: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
