/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import { getEmailStrings, HTML_LANG_BY_CODE } from './i18n.ts'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
  lang?: string
}

export const InviteEmail = ({ confirmationUrl, lang }: InviteEmailProps) => {
  const t = getEmailStrings(lang, 'invite')
  const htmlLang = HTML_LANG_BY_CODE[(lang as keyof typeof HTML_LANG_BY_CODE)] || 'en'
  return (
    <Html lang={htmlLang} dir="ltr">
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={brandHeader}>
            <Text style={wordmark}>Unique</Text>
          </Section>
          <Heading style={h1}>{t.heading}</Heading>
          <Text style={text}>{t.intro}</Text>
          <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Button style={button} href={confirmationUrl}>{t.button}</Button>
          </Section>
          <Text style={footer}>{t.footer}</Text>
          <Text style={signature}>{t.signature}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px' }
const brandHeader = { textAlign: 'center' as const, margin: '0 0 24px' }
const wordmark = {
  fontFamily: '"Lobster Two", "Brush Script MT", cursive',
  fontSize: '36px', fontWeight: 'bold' as const,
  background: 'linear-gradient(135deg, hsl(270, 91%, 65%), hsl(330, 100%, 65%))',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  color: 'hsl(270, 91%, 55%)', margin: '0',
}
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0f0f1a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#4a4a55', lineHeight: '1.6', margin: '0 0 16px' }
const button = {
  background: 'linear-gradient(135deg, hsl(270, 91%, 55%), hsl(330, 100%, 60%))',
  backgroundColor: 'hsl(270, 91%, 55%)', color: '#ffffff',
  fontSize: '15px', fontWeight: 'bold' as const,
  borderRadius: '12px', padding: '14px 28px',
  textDecoration: 'none', display: 'inline-block',
}
const footer = { fontSize: '13px', color: '#8a8a95', margin: '24px 0 8px', lineHeight: '1.5' }
const signature = { fontSize: '13px', color: '#8a8a95', margin: '16px 0 0' }
