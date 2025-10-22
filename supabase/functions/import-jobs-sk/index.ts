import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { source = 'profesie', keyword = '', limit = 20 } = await req.json();

    console.log(`Importing Slovak jobs from ${source}, keyword: ${keyword}`);

    let jobs: any[] = [];

    if (source === 'profesie') {
      jobs = await scrapeProfesie(keyword, limit);
    } else if (source === 'kariera') {
      jobs = await scrapeKariera(keyword, limit);
    } else if (source === 'profesia') {
      jobs = await scrapeProfesia(keyword, limit);
    }

    console.log(`Found ${jobs.length} jobs from ${source}`);

    // Create a system user for imported jobs
    const systemUserId = '00000000-0000-0000-0000-000000000000';

    const jobsToInsert = jobs.map((job) => ({
      employer_id: systemUserId,
      title: job.title,
      description: job.description || 'Viac informácií nájdete na originálnej stránke',
      company_name: job.company || 'Neuvedené',
      location: job.location || 'Slovensko',
      country: 'Slovakia',
      category: mapCategory(job.title + ' ' + job.description),
      job_type: mapJobType(job.title),
      salary_min: null,
      salary_max: null,
      salary_currency: 'EUR',
      requirements: null,
      benefits: null,
      contact_email: `imported@${source}.sk`,
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

    console.log(`Successfully imported ${insertedCount} jobs from ${source}`);

    return new Response(
      JSON.stringify({
        success: true,
        imported: insertedCount,
        total: jobs.length,
        source,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error importing Slovak jobs:', error);
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

async function scrapeProfesie(keyword: string, limit: number): Promise<any[]> {
  try {
    const searchUrl = keyword 
      ? `https://www.profesie.sk/praca/?q=${encodeURIComponent(keyword)}`
      : 'https://www.profesie.sk/praca/';
    
    console.log('Fetching from profesie.sk:', searchUrl);
    const response = await fetch(searchUrl);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    if (!doc) return [];

    const jobElements = doc.querySelectorAll('.job-item, .offer, article');
    const jobs: any[] = [];

    for (let i = 0; i < Math.min(jobElements.length, limit); i++) {
      const el = jobElements[i] as any;
      const title = el.querySelector?.('h2, h3, .title, .job-title')?.textContent?.trim() || '';
      const company = el.querySelector?.('.company, .employer')?.textContent?.trim() || '';
      const location = el.querySelector?.('.location, .place')?.textContent?.trim() || '';
      const description = el.querySelector?.('.description, .preview')?.textContent?.trim() || '';

      if (title) {
        jobs.push({ title, company, location, description });
      }
    }

    return jobs;
  } catch (error) {
    console.error('Error scraping profesie.sk:', error);
    return [];
  }
}

async function scrapeKariera(keyword: string, limit: number): Promise<any[]> {
  try {
    const searchUrl = keyword
      ? `https://www.kariera.sk/ponuky?search=${encodeURIComponent(keyword)}`
      : 'https://www.kariera.sk/ponuky';
    
    console.log('Fetching from kariera.sk:', searchUrl);
    const response = await fetch(searchUrl);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    if (!doc) return [];

    const jobElements = doc.querySelectorAll('.job-listing, .position, article');
    const jobs: any[] = [];

    for (let i = 0; i < Math.min(jobElements.length, limit); i++) {
      const el = jobElements[i] as any;
      const title = el.querySelector?.('h2, h3, .title')?.textContent?.trim() || '';
      const company = el.querySelector?.('.company, .employer-name')?.textContent?.trim() || '';
      const location = el.querySelector?.('.location, .locality')?.textContent?.trim() || '';
      const description = el.querySelector?.('.description, .summary')?.textContent?.trim() || '';

      if (title) {
        jobs.push({ title, company, location, description });
      }
    }

    return jobs;
  } catch (error) {
    console.error('Error scraping kariera.sk:', error);
    return [];
  }
}

async function scrapeProfesia(keyword: string, limit: number): Promise<any[]> {
  try {
    const searchUrl = keyword
      ? `https://www.profesia.sk/praca/?search_keywords=${encodeURIComponent(keyword)}`
      : 'https://www.profesia.sk/praca/';
    
    console.log('Fetching from profesia.sk:', searchUrl);
    const response = await fetch(searchUrl);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    if (!doc) return [];

    const jobElements = doc.querySelectorAll('.offer, .job, article');
    const jobs: any[] = [];

    for (let i = 0; i < Math.min(jobElements.length, limit); i++) {
      const el = jobElements[i] as any;
      const title = el.querySelector?.('h2, h3, .title')?.textContent?.trim() || '';
      const company = el.querySelector?.('.company, .employer')?.textContent?.trim() || '';
      const location = el.querySelector?.('.location, .place')?.textContent?.trim() || '';
      const description = el.querySelector?.('.description, .info')?.textContent?.trim() || '';

      if (title) {
        jobs.push({ title, company, location, description });
      }
    }

    return jobs;
  } catch (error) {
    console.error('Error scraping profesia.sk:', error);
    return [];
  }
}

function mapCategory(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('it') || lowerText.includes('programátor') || lowerText.includes('developer') || lowerText.includes('software')) return 'it_software';
  if (lowerText.includes('marketing') || lowerText.includes('predaj') || lowerText.includes('sales')) return 'marketing_sales';
  if (lowerText.includes('financ') || lowerText.includes('účt')) return 'finance_accounting';
  if (lowerText.includes('zdravot') || lowerText.includes('lekár') || lowerText.includes('sestra')) return 'healthcare';
  if (lowerText.includes('učiteľ') || lowerText.includes('vzdelá')) return 'education';
  if (lowerText.includes('inžinier')) return 'engineering';
  if (lowerText.includes('hotel') || lowerText.includes('reštauráci') || lowerText.includes('kuchár')) return 'hospitality';
  if (lowerText.includes('obchod') || lowerText.includes('predavač')) return 'retail';
  if (lowerText.includes('výrob')) return 'manufacturing';
  if (lowerText.includes('stavb') || lowerText.includes('murár')) return 'construction';
  if (lowerText.includes('doprav') || lowerText.includes('vodič') || lowerText.includes('kuriér')) return 'transportation';
  return 'other';
}

function mapJobType(title: string): string {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('čiastočný') || lowerTitle.includes('part')) return 'part_time';
  if (lowerTitle.includes('brigád') || lowerTitle.includes('stáž') || lowerTitle.includes('intern')) return 'internship';
  if (lowerTitle.includes('remote') || lowerTitle.includes('diaľk') || lowerTitle.includes('home office')) return 'remote';
  if (lowerTitle.includes('zmluv') || lowerTitle.includes('contract')) return 'contract';
  return 'full_time';
}
