CREATE OR REPLACE FUNCTION public.create_default_response_templates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.job_response_templates 
    WHERE employer_id = NEW.employer_id
  ) THEN
    INSERT INTO public.job_response_templates (employer_id, name, subject, body, template_type, is_default)
    VALUES (
      NEW.employer_id,
      'Application accepted',
      'Congratulations! Your application was accepted',
      E'Dear applicant,\n\nWe are pleased to inform you that your application for the {{job_title}} position at {{company_name}} has been accepted.\n\nWe will contact you shortly with more information about the next steps in the hiring process.\n\nBest regards,\n{{company_name}}',
      'accepted',
      true
    );

    INSERT INTO public.job_response_templates (employer_id, name, subject, body, template_type, is_default)
    VALUES (
      NEW.employer_id,
      'Application rejected',
      'Update on your application',
      E'Dear applicant,\n\nThank you for your interest in the {{job_title}} position at {{company_name}}.\n\nUnfortunately, after carefully considering all candidates, we have decided to move forward with applicants whose qualifications more closely match our current needs.\n\nThank you for your time and interest. We wish you every success in your job search.\n\nBest regards,\n{{company_name}}',
      'rejected',
      true
    );

    INSERT INTO public.job_response_templates (employer_id, name, subject, body, template_type, is_default)
    VALUES (
      NEW.employer_id,
      'Interview invitation',
      'Interview invitation - {{job_title}}',
      E'Dear applicant,\n\nThank you for your application for the {{job_title}} position.\n\nWe would like to invite you to an interview. Please confirm your availability for the following dates:\n\n[Add dates]\n\nThe interview will take place at: [Add address]\n\nWe look forward to meeting you.\n\nBest regards,\n{{company_name}}',
      'interview',
      true
    );
  END IF;

  RETURN NEW;
END;
$function$;

UPDATE public.job_response_templates SET
  name = 'Application accepted',
  subject = 'Congratulations! Your application was accepted',
  body = E'Dear applicant,\n\nWe are pleased to inform you that your application for the {{job_title}} position at {{company_name}} has been accepted.\n\nWe will contact you shortly with more information about the next steps in the hiring process.\n\nBest regards,\n{{company_name}}'
WHERE template_type = 'accepted' AND is_default = true AND name = 'Prijatie žiadosti';

UPDATE public.job_response_templates SET
  name = 'Application rejected',
  subject = 'Update on your application',
  body = E'Dear applicant,\n\nThank you for your interest in the {{job_title}} position at {{company_name}}.\n\nUnfortunately, after carefully considering all candidates, we have decided to move forward with applicants whose qualifications more closely match our current needs.\n\nThank you for your time and interest. We wish you every success in your job search.\n\nBest regards,\n{{company_name}}'
WHERE template_type = 'rejected' AND is_default = true AND name = 'Zamietnutie žiadosti';

UPDATE public.job_response_templates SET
  name = 'Interview invitation',
  subject = 'Interview invitation - {{job_title}}',
  body = E'Dear applicant,\n\nThank you for your application for the {{job_title}} position.\n\nWe would like to invite you to an interview. Please confirm your availability for the following dates:\n\n[Add dates]\n\nThe interview will take place at: [Add address]\n\nWe look forward to meeting you.\n\nBest regards,\n{{company_name}}'
WHERE template_type = 'interview' AND is_default = true AND name = 'Pozvánka na pohovor';