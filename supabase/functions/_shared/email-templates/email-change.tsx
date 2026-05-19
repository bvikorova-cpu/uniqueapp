/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your Unique email change</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandHeader}>
          <Text style={wordmark}>Unique</Text>
        </Section>
        <Heading style={h1}>Confirm your email change ✉️</Heading>
        <Text style={text}>
          You requested to change your email address for Unique from{' '}
          <Link href={`mailto:${oldEmail}`} style={link}>
            {oldEmail}
          </Link>{' '}
          to{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>
          .
        </Text>
        <Text style={text}>Click the button below to confirm this change:</Text>
        <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
          <Button style={button} href={confirmationUrl}>
            Confirm Email Change
          </Button>
        </Section>
        <Text style={footer}>
          If you didn't request this change, please secure your account
          immediately.
        </Text>
        <Text style={signature}>— The Unique Team</Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

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
const link = { color: 'hsl(270, 91%, 55%)', textDecoration: 'underline', fontWeight: 'bold' as const }
const button = {
  background: 'linear-gradient(135deg, hsl(270, 91%, 55%), hsl(330, 100%, 60%))',
  backgroundColor: 'hsl(270, 91%, 55%)',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = { fontSize: '13px', color: '#8a8a95', margin: '24px 0 8px', lineHeight: '1.5' }
const signature = { fontSize: '13px', color: '#8a8a95', margin: '16px 0 0' }
