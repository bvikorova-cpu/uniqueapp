import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface AdzunaJob {
  id: string;
  title: string;
  description: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
    area: string[];
  };
  category: {
    label: string;
  };
  contract_type?: string;
  salary_min?: number;
  salary_max?: number;
  redirect_url: string;
}

Deno.serve(async (req) => {
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
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
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
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    console.log(`Import request from authenticated user: ${user.id}`);

    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const adzunaAppId = Deno.env.get('ADZUNA_APP_ID')!;
    const adzunaAppKey = Deno.env.get('ADZUNA_APP_KEY')!

    const { country = 'sk', what = '', results_per_page = 50 } = await req.json();

    console.log(`Importing jobs from Adzuna for country: ${country}, search: ${what}`);
    console.log(`App ID available: ${!!adzunaAppId}, App Key available: ${!!adzunaAppKey}`);
    console.log(`App ID starts with: ${adzunaAppId?.substring(0, 4)}, App Key starts with: ${adzunaAppKey?.substring(0, 4)}`);

    // Adzuna API call
    const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${adzunaAppId}&app_key=${adzunaAppKey}&results_per_page=${results_per_page}&what=${encodeURIComponent(what)}`;
    
    console.log(`Calling Adzuna API for country: ${country}`);
    
    const response = await fetch(adzunaUrl);
    
    console.log(`Adzuna API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Adzuna API error response: ${errorText}`);
      throw new Error(`Adzuna API error: ${response.statusText}`);
    }

    const data = await response.json();
    const jobs: AdzunaJob[] = data.results || [];

    console.log(`Found ${jobs.length} jobs from Adzuna`);

    // Map category to our system
    const mapCategory = (categoryLabel: string): string => {
      const label = categoryLabel.toLowerCase();
      if (label.includes('it') || label.includes('software') || label.includes('tech')) return 'it_software';
      if (label.includes('marketing') || label.includes('sales')) return 'marketing_sales';
      if (label.includes('finance') || label.includes('accounting')) return 'finance_accounting';
      if (label.includes('healthcare') || label.includes('medical')) return 'healthcare';
      if (label.includes('education') || label.includes('teaching')) return 'education';
      if (label.includes('engineering')) return 'engineering';
      if (label.includes('hospitality') || label.includes('hotel')) return 'hospitality';
      if (label.includes('retail')) return 'retail';
      if (label.includes('manufacturing')) return 'manufacturing';
      if (label.includes('construction')) return 'construction';
      if (label.includes('transport')) return 'transportation';
      return 'other';
    };

    // Map job type
    const mapJobType = (contractType?: string): string => {
      if (!contractType) return 'full_time';
      const type = contractType.toLowerCase();
      if (type.includes('part')) return 'part_time';
      if (type.includes('contract') || type.includes('temporary')) return 'contract';
      if (type.includes('intern')) return 'internship';
      if (type.includes('remote')) return 'remote';
      return 'full_time';
    };

    // Get country name from code
    const getCountryName = (countryCode: string): string => {
      const countries: Record<string, string> = {
        'sk': 'Slovakia',
        'cz': 'Czech Republic',
        'gb': 'United Kingdom',
        'us': 'United States',
        'de': 'Germany',
        'at': 'Austria',
        'pl': 'Poland',
        'fr': 'France',
        'it': 'Italy',
        'es': 'Spain',
        'nl': 'Netherlands',
        'be': 'Belgium',
        'ch': 'Switzerland',
        'au': 'Australia',
        'ca': 'Canada',
        'nz': 'New Zealand',
        'in': 'India',
        'sg': 'Singapore',
        'za': 'South Africa',
        'br': 'Brazil',
      };
      return countries[countryCode.toLowerCase()] || countryCode.toUpperCase();
    };

    // Create a system user for imported jobs
    const systemUserId = '00000000-0000-0000-0000-000000000000';

    const jobsToInsert = jobs.map((job) => ({
      employer_id: systemUserId,
      title: job.title,
      description: job.description || 'No description available',
      company_name: job.company?.display_name || 'Unknown Company',
      location: job.location?.display_name || 'Unknown Location',
      country: getCountryName(country),
      category: mapCategory(job.category?.label || ''),
      job_type: mapJobType(job.contract_type),
      salary_min: job.salary_min || null,
      salary_max: job.salary_max || null,
      salary_currency: country === 'us' ? 'USD' : country === 'gb' ? 'GBP' : 'EUR',
      requirements: null,
      benefits: null,
      contact_email: 'imported@adzuna.com',
    }));

    // Insert jobs in batches
    let insertedCount = 0;
    const batchSize = 10;
    
    for (let i = 0; i < jobsToInsert.length; i += batchSize) {
      const batch = jobsToInsert.slice(i, i + batchSize);
      const { error } = await supabaseAdmin.from('job_listings').insert(batch);
      
      if (error) {
        console.error('Error inserting batch:', error);
      } else {
        insertedCount += batch.length;
      }
    }

    console.log(`Successfully imported ${insertedCount} jobs`);

    return new Response(
      JSON.stringify({
        success: true,
        imported: insertedCount,
        total: jobs.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error importing jobs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
