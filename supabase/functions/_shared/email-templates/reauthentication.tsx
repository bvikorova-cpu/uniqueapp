/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Unique verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandHeader}>
          <Text style={wordmark}>Unique</Text>
        </Section>
        <Heading style={h1}>Confirm reauthentication 🔒</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Section style={codeBox}>
          <Text style={codeStyle}>{token}</Text>
        </Section>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can
          safely ignore this email.
        </Text>
        <Text style={signature}>— The Unique Team</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px' }
const brandHeader = { textAlign: 'center' as const, margin: '0 0 24px' }
const wordmark = {
  fontFamily: '"Lobster Two", "Brush Script MT", cursive',
  fontSize: '36px',
  fontWeight: 'bold' as const,
  background: 'linear-gradient(135deg, hsl(270, 91%, 65%), hsl(330, 100%, 65%))',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'hsl(270, 91%, 55%)',
  margin: '0',
}
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0f0f1a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#4a4a55', lineHeight: '1.6', margin: '0 0 16px' }
const codeBox = {
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, hsl(270, 91%, 97%), hsl(330, 100%, 97%))',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
}
const codeStyle = {
  fontFamily: '"SF Mono", Courier, monospace',
  fontSize: '32px',
  fontWeight: 'bold' as const,
  color: 'hsl(270, 91%, 45%)',
  letterSpacing: '8px',
  margin: '0',
}
const footer = { fontSize: '13px', color: '#8a8a95', margin: '24px 0 8px', lineHeight: '1.5' }
const signature = { fontSize: '13px', color: '#8a8a95', margin: '16px 0 0' }
