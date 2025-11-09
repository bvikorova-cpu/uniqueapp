-- Create table for response templates
CREATE TABLE IF NOT EXISTS public.job_response_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'general',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for better query performance
CREATE INDEX idx_job_response_templates_employer ON public.job_response_templates(employer_id);
CREATE INDEX idx_job_response_templates_type ON public.job_response_templates(template_type);

-- Enable RLS
ALTER TABLE public.job_response_templates ENABLE ROW LEVEL SECURITY;

-- Employers can view their own templates
CREATE POLICY "Employers can view their own templates"
ON public.job_response_templates
FOR SELECT
USING (auth.uid() = employer_id);

-- Employers can create their own templates
CREATE POLICY "Employers can create their own templates"
ON public.job_response_templates
FOR INSERT
WITH CHECK (auth.uid() = employer_id);

-- Employers can update their own templates
CREATE POLICY "Employers can update their own templates"
ON public.job_response_templates
FOR UPDATE
USING (auth.uid() = employer_id);

-- Employers can delete their own templates
CREATE POLICY "Employers can delete their own templates"
ON public.job_response_templates
FOR DELETE
USING (auth.uid() = employer_id);

-- Trigger for updated_at
CREATE TRIGGER update_job_response_templates_updated_at
BEFORE UPDATE ON public.job_response_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default templates for new employers
CREATE OR REPLACE FUNCTION public.create_default_response_templates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert default templates when a new job listing is created (first job = new employer)
  IF NOT EXISTS (
    SELECT 1 FROM public.job_response_templates 
    WHERE employer_id = NEW.employer_id
  ) THEN
    -- Acceptance template
    INSERT INTO public.job_response_templates (
      employer_id,
      name,
      subject,
      body,
      template_type,
      is_default
    ) VALUES (
      NEW.employer_id,
      'Prijatie žiadosti',
      'Gratulujeme! Vaša žiadosť bola prijatá',
      E'Vážený/á uchádzač/ka,\n\nS radosťou Vás informujeme, že Vaša žiadosť o pozíciu {{job_title}} v spoločnosti {{company_name}} bola prijatá.\n\nČoskoro Vás budeme kontaktovať s ďalšími informáciami ohľadom ďalších krokov v náborovom procese.\n\nS pozdravom,\n{{company_name}}',
      'accepted',
      true
    );

    -- Rejection template
    INSERT INTO public.job_response_templates (
      employer_id,
      name,
      subject,
      body,
      template_type,
      is_default
    ) VALUES (
      NEW.employer_id,
      'Zamietnutie žiadosti',
      'Informácia o Vašej žiadosti',
      E'Vážený/á uchádzač/ka,\n\nĎakujeme za Váš záujem o pozíciu {{job_title}} v spoločnosti {{company_name}}.\n\nBohužiaľ, po dôkladnom zvážení všetkých kandidátov sme sa rozhodli pokračovať s inými uchádzačmi, ktorých kvalifikácia viac zodpovedá našim potrebám.\n\nĎakujeme za Váš čas a záujem. Prajeme Vám veľa úspechov v ďalšom hľadaní zamestnania.\n\nS pozdravom,\n{{company_name}}',
      'rejected',
      true
    );

    -- Interview invitation template
    INSERT INTO public.job_response_templates (
      employer_id,
      name,
      subject,
      body,
      template_type,
      is_default
    ) VALUES (
      NEW.employer_id,
      'Pozvánka na pohovor',
      'Pozvánka na pohovor - {{job_title}}',
      E'Vážený/á uchádzač/ka,\n\nĎakujeme za Vašu žiadosť o pozíciu {{job_title}}.\n\nRadi by sme Vás pozvali na osobný pohovor. Prosím, potvrďte Vašu dostupnosť v nasledujúcich termínoch:\n\n[Doplňte termíny]\n\nPohovor sa uskutoční na adrese: [Doplňte adresu]\n\nTešíme sa na stretnutie s Vami.\n\nS pozdravom,\n{{company_name}}',
      'interview',
      true
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to auto-create default templates
DROP TRIGGER IF EXISTS create_default_templates_on_first_job ON public.job_listings;
CREATE TRIGGER create_default_templates_on_first_job
AFTER INSERT ON public.job_listings
FOR EACH ROW
EXECUTE FUNCTION public.create_default_response_templates();