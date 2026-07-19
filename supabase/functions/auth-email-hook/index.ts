import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { sendLovableEmail } from 'npm:@lovable.dev/email-js@0.0.4'
import { Webhook } from 'npm:svix@1.29.0'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { SignupEmail } from '../_shared/email-templates/signup.tsx'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'
import { MagicLinkEmail } from '../_shared/email-templates/magic-link.tsx'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'
import { EmailChangeEmail } from '../_shared/email-templates/email-change.tsx'
import { ReauthenticationEmail } from '../_shared/email-templates/reauthentication.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature, x-lovable-signature, x-lovable-timestamp, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'Confirm your email',
  invite: "You've been invited",
  magiclink: 'Your login link',
  recovery: 'Reset your password',
  email_change: 'Confirm your new email',
  reauthentication: 'Your verification code',
}

const EMAIL_TEMPLATES: Record<string, React.ComponentType<any>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
}

const SITE_NAME = 'Unique'
const SENDER_DOMAIN = 'notify.www.uniqueapp.fun'
const ROOT_DOMAIN = 'www.uniqueapp.fun'
const FROM_ADDRESS = `${SITE_NAME} <noreply@${SENDER_DOMAIN}>`

const SAMPLE_PROJECT_URL = 'https://uniqueapp.lovable.app'
const SAMPLE_EMAIL = 'user@example.test'
const SAMPLE_DATA: Record<string, object> = {
  signup: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    recipient: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  magiclink: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  recovery: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  invite: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  email_change: {
    siteName: SITE_NAME,
    oldEmail: SAMPLE_EMAIL,
    email: SAMPLE_EMAIL,
    newEmail: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  reauthentication: {
    token: '123456',
  },
}

async function handlePreview(req: Request): Promise<Response> {
  const previewCorsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: previewCorsHeaders })
  }

  const apiKey = Deno.env.get('LOVABLE_API_KEY')
  const authHeader = req.headers.get('Authorization')

  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let type: string
  try {
    const body = await req.json()
    type = body.type
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const EmailTemplate = EMAIL_TEMPLATES[type]

  if (!EmailTemplate) {
    return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), {
      status: 400,
      headers: { ...previewCorsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const sampleData = SAMPLE_DATA[type] || {}
  const html = await renderAsync(React.createElement(EmailTemplate, sampleData))

  return new Response(html, {
    status: 200,
    headers: { ...previewCorsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  })
}

interface SupabaseEmailPayload {
  user: {
    email: string
    id?: string
    user_metadata?: Record<string, any>
  }
  email_data: {
    token: string
    token_hash: string
    redirect_to: string
    email_action_type: string
    site_url: string
    token_new?: string
    token_hash_new?: string
  }
}

function buildConfirmationUrl(emailData: SupabaseEmailPayload['email_data']): string {
  // Build the same URL Supabase would send in its default email.
  // For external/BYO Supabase projects, the site_url in the payload is the configured
  // site URL (usually the app URL). The verification endpoint lives on the Supabase
  // project URL, so we use SUPABASE_URL from the edge function env as the base.
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  if (!supabaseUrl) {
    // Fallback: if env is missing, use the site_url from the payload.
    return `${emailData.site_url}/auth/v1/verify?token=${encodeURIComponent(emailData.token)}&type=${encodeURIComponent(emailData.email_action_type)}&redirect_to=${encodeURIComponent(emailData.redirect_to)}`
  }
  return `${supabaseUrl}/auth/v1/verify?token=${encodeURIComponent(emailData.token)}&type=${encodeURIComponent(emailData.email_action_type)}&redirect_to=${encodeURIComponent(emailData.redirect_to)}`
}

async function handleWebhook(req: Request): Promise<Response> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY')
  if (!apiKey) {
    console.error('LOVABLE_API_KEY not configured')
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')
  if (!hookSecret) {
    console.error('SEND_EMAIL_HOOK_SECRET not configured')
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const rawBody = await req.text()
  const headers = Object.fromEntries(req.headers.entries())

  let payload: SupabaseEmailPayload
  try {
    // Supabase Auth hooks use the Standard Webhooks spec (Svix).
    // Strip the v1,whsec_ prefix before verifying.
    const secret = hookSecret.replace(/^v1,whsec_/, '')
    const wh = new Webhook(secret)
    payload = wh.verify(rawBody, headers) as SupabaseEmailPayload
  } catch (error) {
    console.error('Invalid Supabase webhook signature', { error: (error as Error).message })
    return new Response(
      JSON.stringify({ error: 'Invalid signature' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const emailType = payload.email_data?.email_action_type
  if (!emailType) {
    console.error('Missing email_action_type in webhook payload')
    return new Response(
      JSON.stringify({ error: 'Invalid webhook payload' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const EmailTemplate = EMAIL_TEMPLATES[emailType]
  if (!EmailTemplate) {
    console.error('Unknown email type', { emailType })
    return new Response(
      JSON.stringify({ error: `Unknown email type: ${emailType}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const confirmationUrl = buildConfirmationUrl(payload.email_data)
  const recipient = payload.user?.email
  if (!recipient) {
    console.error('Missing recipient email in webhook payload')
    return new Response(
      JSON.stringify({ error: 'Invalid webhook payload' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const templateProps = {
    siteName: SITE_NAME,
    siteUrl: `https://${ROOT_DOMAIN}`,
    recipient,
    confirmationUrl,
    token: payload.email_data.token,
    email: recipient,
    oldEmail: recipient,
    newEmail: payload.email_data.token_new ? recipient : undefined,
  }

  const html = await renderAsync(React.createElement(EmailTemplate, templateProps))
  const text = await renderAsync(React.createElement(EmailTemplate, templateProps), {
    plainText: true,
  })

  const messageId = crypto.randomUUID()

  try {
    await sendLovableEmail(
      {
        to: recipient,
        from: FROM_ADDRESS,
        sender_domain: SENDER_DOMAIN,
        subject: EMAIL_SUBJECTS[emailType] || 'Notification',
        html,
        text,
        purpose: 'transactional',
        idempotency_key: messageId,
      },
      { apiKey }
    )
  } catch (error) {
    console.error('Failed to send auth email via Lovable API', { error: (error as Error).message, emailType, recipient })
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Keep a lightweight log so the admin can see auth emails were processed.
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: emailType,
      recipient_email: recipient,
      status: 'sent',
    })
  } catch (logError) {
    // Non-fatal: if the log table doesn't exist, the email was still sent.
    console.warn('Could not write email_send_log', { error: (logError as Error).message })
  }

  console.log('Auth email sent', { emailType, recipient, messageId })

  return new Response(
    JSON.stringify({ success: true, sent: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

Deno.serve(async (req) => {
  const url = new URL(req.url)

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (url.pathname.endsWith('/preview')) {
    return handlePreview(req)
  }

  try {
    return await handleWebhook(req)
  } catch (error) {
    console.error('Webhook handler error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
