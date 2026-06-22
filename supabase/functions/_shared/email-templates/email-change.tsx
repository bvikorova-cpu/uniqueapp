/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { styles } from './_brand.ts'

interface Props { siteName: string; siteUrl: string; recipient: string; confirmationUrl: string; email?: string; newEmail?: string }

export const EmailChangeEmail = ({ siteName, siteUrl, recipient, confirmationUrl, email, newEmail }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your new email on Unique</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Heading style={styles.brandName}>Unique</Heading>
          <Text style={styles.tagline}>Connect · Create · Earn</Text>
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>Confirm your new email</Heading>
          <Text style={styles.text}>You requested to change your <strong>{siteName}</strong> email{email ? <> from <strong>{email}</strong></> : null}{newEmail ? <> to <strong>{newEmail}</strong></> : <> to <strong>{recipient}</strong></>}.</Text>
          <Section style={styles.buttonWrap}>
            <Button style={styles.button} href={confirmationUrl}>Confirm New Email →</Button>
          </Section>
          <Text style={styles.muted}>If you didn't request this change, contact support immediately.</Text>
        </Section>
        <Section style={styles.footer}>
          Unique — Connect. Create. Earn. · <Link href={siteUrl} style={styles.link}>uniqueapp.fun</Link>
        </Section>
      </Container>
    </Body>
  </Html>
)
export default EmailChangeEmail
