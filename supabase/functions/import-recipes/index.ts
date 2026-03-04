import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface MealDBRecipe {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  [key: string]: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication using custom header
    const authHeader = req.headers.get('authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Initialize Supabase client with anon key for authentication
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log(`Import request from authenticated user: ${user.id}`);

    const { category = 'Seafood', limit = 20 } = await req.json();
    
    console.log(`Importing recipes from category: ${category}, limit: ${limit}`);

    // Initialize Supabase admin client for data insertion
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch recipes from TheMealDB API
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
    const data = await response.json();

    if (!data.meals) {
      return new Response(
        JSON.stringify({ error: 'No meals found for this category' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const mealsToImport = data.meals.slice(0, limit);
    const importedRecipes = [];
    let successCount = 0;
    let errorCount = 0;

    // Fetch full details for each meal and insert into database
    for (const meal of mealsToImport) {
      try {
        // Get full recipe details
        const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
        const detailData = await detailResponse.json();
        
        if (!detailData.meals || !detailData.meals[0]) {
          console.error(`No details found for meal ${meal.idMeal}`);
          errorCount++;
          continue;
        }

        const fullMeal: MealDBRecipe = detailData.meals[0];

        // Extract ingredients and measures
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
          const ingredient = fullMeal[`strIngredient${i}`];
          const measure = fullMeal[`strMeasure${i}`];
          if (ingredient && ingredient.trim()) {
            ingredients.push(`${measure?.trim() || ''} ${ingredient.trim()}`.trim());
          }
        }

        // Split instructions into steps
        const instructions = fullMeal.strInstructions
          .split(/\r?\n/)
          .filter((step: string) => step.trim())
          .map((step: string) => step.trim());

        // Map category
        const categoryMap: { [key: string]: string } = {
          'Beef': 'Hlavné jedlá',
          'Chicken': 'Hlavné jedlá',
          'Dessert': 'Dezerty',
          'Lamb': 'Hlavné jedlá',
          'Miscellaneous': 'Rôzne',
          'Pasta': 'Cestoviny',
          'Pork': 'Hlavné jedlá',
          'Seafood': 'Hlavné jedlá',
          'Side': 'Prílohy',
          'Starter': 'Predjedlá',
          'Vegan': 'Hlavné jedlá',
          'Vegetarian': 'Hlavné jedlá',
          'Breakfast': 'Raňajky',
          'Goat': 'Hlavné jedlá'
        };

        const mappedCategory = categoryMap[fullMeal.strCategory] || 'Rôzne';

        // Insert recipe into database
        const { data: insertedRecipe, error } = await supabaseAdmin
          .from('recipes')
          .insert({
            title: fullMeal.strMeal,
            category: mappedCategory,
            difficulty: 'Stredná',
            time: '45 min',
            servings: 4,
            calories: 400,
            image_url: fullMeal.strMealThumb,
            description: `Chutný recept ${fullMeal.strMeal} z kategórie ${fullMeal.strCategory}. ${fullMeal.strArea ? `Kuchyňa: ${fullMeal.strArea}.` : ''}`,
            ingredients: ingredients,
            instructions: instructions,
            tags: [fullMeal.strCategory, fullMeal.strArea].filter(Boolean),
            is_active: true
          })
          .select()
          .single();

        if (error) {
          console.error(`Error inserting recipe ${fullMeal.strMeal}:`, error);
          errorCount++;
        } else {
          console.log(`Successfully imported: ${fullMeal.strMeal}`);
          importedRecipes.push(insertedRecipe);
          successCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        console.error(`Error processing meal ${meal.idMeal}:`, err);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        imported: successCount,
        errors: errorCount,
        total: mealsToImport.length,
        recipes: importedRecipes
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in import-recipes function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
