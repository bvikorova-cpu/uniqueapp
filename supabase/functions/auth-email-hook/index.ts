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
  // IMPORTANT: Do NOT use Supabase's /auth/v1/verify?token=... GET link.
  // Corporate/free mail scanners (Yandex, Outlook Safe Links, Gmail preview, etc.)
  // pre-fetch links in emails, which consumes the one-time OTP before the user
  // ever clicks it -> user sees "invalid/expired link".
  //
  // Instead we send the user directly to our app with token_hash + type in the
  // query string. Our page then calls supabase.auth.verifyOtp({ token_hash, type })
  // via POST from JS, which link scanners do not trigger.
  const siteUrl = (emailData.site_url || '').replace(/\/+$/, '')
  const action = emailData.email_action_type

  // Landing route per action type — must exist in the SPA.
  const routeByAction: Record<string, string> = {
    recovery: '/reset-password',
    signup: '/auth/callback',
    invite: '/auth/callback',
    magiclink: '/auth/callback',
    email_change: '/auth/callback',
    email_change_new: '/auth/callback',
    reauthentication: '/auth/callback',
  }
  const route = routeByAction[action] ?? '/auth/callback'

  // Prefer redirect_to if the Supabase project passed one, else site_url.
  const base = (emailData.redirect_to || siteUrl).replace(/\/+$/, '')
  // Strip any path from redirect_to to keep behavior predictable — we always
  // land on our own route.
  let origin = base
  try { origin = new URL(base).origin } catch { /* keep as-is */ }

  const params = new URLSearchParams({
    type: action,
    next: emailData.redirect_to || '/',
    via: 'unique-hook-v2',
  })

  // token_hash is the scanner-safe Supabase format. Keep token + email as a
  // fallback because some Auth payload variants only include the raw OTP token.
  if (emailData.token_hash) params.set('token_hash', emailData.token_hash)
  if (emailData.token) params.set('token', emailData.token)

  return `${origin}${route}?${params.toString()}`
}


async function stableEmailToken(...parts: Array<string | undefined>): Promise<string> {
  const input = parts.filter(Boolean).join(':')
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
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
    // The dashboard exports the secret as "v1,whsec_..." — svix expects just "whsec_..."
    // so we strip any leading "vN," version prefix before passing it in.
    const normalizedSecret = hookSecret.replace(/^v\d+,/, '')
    const wh = new Webhook(normalizedSecret)
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
  const unsubscribeToken = await stableEmailToken(SENDER_DOMAIN, recipient, payload.user?.id, emailType)

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
        unsubscribe_token: unsubscribeToken,
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
